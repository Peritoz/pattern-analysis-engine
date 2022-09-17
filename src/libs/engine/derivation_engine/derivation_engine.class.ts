import {
  GraphEdge,
  GraphRepository,
  PartialEdgeFilter,
  PartialVertexFilter,
} from "@libs/model/graph_repository/graph_repository.interface";
import { DerivationRule } from "@libs/engine/derivation_engine/derivation_rule.class";
import { EdgeScope } from "@libs/model/graph_repository/enums/edge_scope.enum";
import { RuleEdgeDescription } from "@libs/model/derivation/rule_edge_description.interface";
import { EdgeDirection } from "@libs/model/derivation/enums/edge_direction.enum";
import { RulePart } from "@libs/model/derivation/enums/rule_part.enum";
import { RuleEffect } from "@libs/model/derivation/rule_effect.interface";

export class DerivationEngine {
  protected _graph: GraphRepository;
  protected _rules: Array<DerivationRule>;
  protected _rulesMap: Map<string, DerivationRule>;

  constructor(graph: GraphRepository, rules: Array<DerivationRule>) {
    this._graph = graph;
    this._rules = rules;
    this._rulesMap = new Map<string, DerivationRule>();

    this.initRulesMap();
  }

  get graph(): GraphRepository {
    return this._graph;
  }

  get rules(): Array<DerivationRule> {
    return this._rules;
  }

  initRulesMap() {
    for (let i = 0; i < this._rules.length; i++) {
      const rule = this._rules[i];
      const ruleCondition = rule.conditional;

      for (let j = 0; j < ruleCondition.firstPart.edgeTypes.length; j++) {
        const firstEdgeType = ruleCondition.firstPart.edgeTypes[j];

        for (let k = 0; k < ruleCondition.secondPart.edgeTypes.length; k++) {
          const secondEdgeType = ruleCondition.secondPart.edgeTypes[k];

          this._rulesMap.set(`${firstEdgeType}-${secondEdgeType}`, rule);
        }
      }
    }
  }

  private async getPartCandidates(
    partDescription: RuleEdgeDescription,
    middleElementTypes: Array<string>,
    isFirstPart: boolean,
    edgeScope: EdgeScope = EdgeScope.ALL
  ): Promise<Array<GraphEdge>> {
    const typesTuple = isFirstPart
      ? [partDescription.elementTypes, middleElementTypes]
      : [middleElementTypes, partDescription.elementTypes];
    const index = partDescription.direction === EdgeDirection.OUTBOUND ? 0 : 1;
    const invertedIndex = (index + 1) % 2;
    const sourceFilter: PartialVertexFilter = { types: typesTuple[index] };
    const targetFilter: PartialVertexFilter = {
      types: typesTuple[invertedIndex],
    };
    let edgeFilter: PartialEdgeFilter = {
      types: partDescription.edgeTypes,
      scope: edgeScope,
    };

    return this._graph.getEdgesByFilter(
      Array.isArray(sourceFilter.types) && sourceFilter.types.length > 0
        ? sourceFilter
        : null,
      edgeFilter,
      Array.isArray(targetFilter.types) && targetFilter.types.length > 0
        ? targetFilter
        : null
    );
  }

  private async getCandidates(
    firstPart: RuleEdgeDescription,
    secondPart: RuleEdgeDescription,
    middleElementTypes: Array<string>,
    cycle: number
  ): Promise<[Array<GraphEdge>, Array<GraphEdge>]> {
    const firstPartCandidates = await this.getPartCandidates(
      firstPart,
      middleElementTypes,
      true,
      cycle === 0 ? EdgeScope.NON_DERIVED_ONLY : EdgeScope.ALL
    );
    const secondPartCandidates = await this.getPartCandidates(
      secondPart,
      middleElementTypes,
      false,
      cycle === 0 ? EdgeScope.NON_DERIVED_ONLY : EdgeScope.ALL
    );

    return [firstPartCandidates, secondPartCandidates];
  }

  private combineEdges(
    rule: DerivationRule,
    firstPartCandidates: Array<GraphEdge>,
    secondPartCandidates: Array<GraphEdge>
  ): Array<[GraphEdge, GraphEdge]> {
    const pairs: Array<[GraphEdge, GraphEdge]> = [];
    const pairedElements = [];
    const firstLinkElKey =
      rule.conditional.firstPart.direction === EdgeDirection.OUTBOUND
        ? "targetId"
        : "sourceId";
    const secondLinkElKey =
      rule.conditional.secondPart.direction === EdgeDirection.OUTBOUND
        ? "sourceId"
        : "targetId";

    for (let i = 0; i < firstPartCandidates.length; i++) {
      const candidate = firstPartCandidates[i];
      const linkElId = candidate[firstLinkElKey];

      const edges = secondPartCandidates.filter(
        (edge) => edge[secondLinkElKey] === linkElId
      );

      if (edges.length > 0) {
        for (let j = 0; j < edges.length; j++) {
          const edge = edges[j];

          pairs.push([candidate, edge]);
        }
      }

      pairedElements.push(linkElId);
    }

    return pairs;
  }

  /**
   * Constructs derived edges based on GraphEdge pairs
   * @param edgePairs Tuple composed of two GraphEdges with a common middle element
   * @param effect Rule effect that describes the template for the derived edge to be constructed
   */
  private generateDerivedEdges(
    edgePairs: Array<[GraphEdge, GraphEdge]>,
    effect: RuleEffect
  ) {
    for (let j = 0; j < edgePairs.length; j++) {
      const [firstEdge, secondEdge] = edgePairs[j];
      const { source, target, types } = effect;
      let sourceElementId = "";
      let targetElementId = "";

      if (source === RulePart.FIRST_PART_ELEMENT) {
        sourceElementId = firstEdge.sourceId;
      } else if (source === RulePart.MIDDLE_ELEMENT) {
        sourceElementId = firstEdge.targetId;
      } else if (source === RulePart.SECOND_PART_ELEMENT) {
        sourceElementId = secondEdge.targetId;
      }

      if (target === RulePart.FIRST_PART_ELEMENT) {
        targetElementId = firstEdge.sourceId;
      } else if (target === RulePart.MIDDLE_ELEMENT) {
        targetElementId = firstEdge.targetId;
      } else if (target === RulePart.SECOND_PART_ELEMENT) {
        targetElementId = secondEdge.targetId;
      }

      // Mounting the derivation path
      let derivationPath = [];

      if (firstEdge.derivationPath && firstEdge.derivationPath.length > 0) {
        derivationPath = [...firstEdge.derivationPath];
      } else {
        derivationPath = [firstEdge.id];
      }

      if (secondEdge.derivationPath && secondEdge.derivationPath.length > 0) {
        derivationPath = [...derivationPath, ...secondEdge.derivationPath];
      } else {
        derivationPath = [...derivationPath, secondEdge.id];
      }

      const derivedEdge = {
        id: `d-${firstEdge.id}-${secondEdge.id}`,
        sourceId: sourceElementId,
        targetId: targetElementId,
        types,
        derivationPath,
      };

      this._graph.addEdge(derivedEdge);
    }
  }

  /**
   * Generates derived edges based on derivation rules (@see DerivationRule).
   * @param cycles Number of derivation processing iterations to be applied
   */
  async deriveEdges(cycles: number = 1): Promise<void> {
    for (let cycle = 0; cycle < cycles; cycle++) {
      for (let i = 0; i < this._rules.length; i++) {
        const rule = this._rules[i];
        const { firstPart, secondPart, middleElementTypes } = rule.conditional;

        // Filtering edges by the rule conditional
        const [firstPartCandidates, secondPartCandidates] =
          await this.getCandidates(
            firstPart,
            secondPart,
            middleElementTypes,
            cycle
          );

        // Matching edges by middle element (creating edge pairs)
        const edgePairs: Array<[GraphEdge, GraphEdge]> = this.combineEdges(
          rule,
          firstPartCandidates,
          secondPartCandidates
        );

        // Building derived edges
        this.generateDerivedEdges(edgePairs, rule.effect);
      }
    }
  }
}
