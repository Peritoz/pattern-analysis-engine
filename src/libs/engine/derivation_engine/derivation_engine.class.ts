import {
  GraphEdge,
  GraphRepository,
  PartialEdgeFilter,
  PartialVertexFilter,
} from "@libs/model/graph_repository/graph_repository.interface";
import { DerivationRule } from "@libs/engine/derivation_engine/derivation_rule.class";
import { EdgeScope } from "@libs/model/graph_repository/enums/edge_scope.enum";
import { RuleEdgeDescription } from "@libs/model/derivation/rule_edge_description.interface";
import { RulePart } from "@libs/model/derivation/enums/rule_part.enum";
import { RuleEffect } from "@libs/model/derivation/rule_effect.interface";
import { Direction } from "@libs/model/common/enums/direction.enum";

export class DerivationEngine {
  protected _graph: GraphRepository;
  protected _rules: Array<DerivationRule>;
  protected _rulesMap: Map<string, DerivationRule>;
  protected _graphEdgeBuilder: (
    sourceId: string,
    targetId: string,
    types: Array<string>,
    externalId: string,
    derivationPath: Array<string>
  ) => GraphEdge;

  constructor(
    graph: GraphRepository,
    rules: Array<DerivationRule>,
    graphEdgeBuilder: (
      sourceId: string,
      targetId: string,
      types: Array<string>,
      externalId: string,
      derivationPath: Array<string>
    ) => GraphEdge
  ) {
    this._graph = graph;
    this._rules = rules;
    this._rulesMap = new Map<string, DerivationRule>();
    this._graphEdgeBuilder = graphEdgeBuilder;

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
    const index = partDescription.direction === Direction.OUTBOUND ? 0 : 1;
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
    firstPartScope: EdgeScope,
    secondPartScope: EdgeScope
  ): Promise<[Array<GraphEdge>, Array<GraphEdge>]> {
    const firstPartCandidates = await this.getPartCandidates(
      firstPart,
      middleElementTypes,
      true,
      firstPartScope
    );
    const secondPartCandidates = await this.getPartCandidates(
      secondPart,
      middleElementTypes,
      false,
      secondPartScope
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
      rule.conditional.firstPart.direction === Direction.OUTBOUND
        ? "targetId"
        : "sourceId";
    const secondLinkElKey =
      rule.conditional.secondPart.direction === Direction.OUTBOUND
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
   * @param firstPartDirection
   * @param secondPartDirection
   */
  private async generateDerivedEdges(
    edgePairs: Array<[GraphEdge, GraphEdge]>,
    effect: RuleEffect,
    firstPartDirection: Direction,
    secondPartDirection: Direction
  ): Promise<Array<GraphEdge>> {
    const derivedEdges: Array<GraphEdge> = [];

    for (let j = 0; j < edgePairs.length; j++) {
      const [firstEdge, secondEdge] = edgePairs[j];
      const { source, target, types } = effect;
      let sourceElementId = "";
      let targetElementId = "";

      if (source === RulePart.FIRST_PART_ELEMENT) {
        sourceElementId =
          firstPartDirection === Direction.OUTBOUND
            ? firstEdge.sourceId
            : firstEdge.targetId;
      } else if (source === RulePart.MIDDLE_ELEMENT) {
        sourceElementId =
          firstPartDirection === Direction.OUTBOUND
            ? firstEdge.targetId
            : firstEdge.sourceId;
      } else if (source === RulePart.SECOND_PART_ELEMENT) {
        sourceElementId =
          secondPartDirection === Direction.OUTBOUND
            ? secondEdge.targetId
            : secondEdge.sourceId;
      }

      if (target === RulePart.FIRST_PART_ELEMENT) {
        targetElementId =
          firstPartDirection === Direction.OUTBOUND
            ? firstEdge.sourceId
            : firstEdge.targetId;
      } else if (target === RulePart.MIDDLE_ELEMENT) {
        targetElementId =
          firstPartDirection === Direction.OUTBOUND
            ? firstEdge.targetId
            : firstEdge.sourceId;
      } else if (target === RulePart.SECOND_PART_ELEMENT) {
        targetElementId =
          secondPartDirection === Direction.OUTBOUND
            ? secondEdge.targetId
            : secondEdge.sourceId;
      }

      // Mounting the derivation path
      let derivationPath = [];

      if (firstEdge.derivationPath && firstEdge.derivationPath.length > 0) {
        derivationPath = [...firstEdge.derivationPath];
      } else {
        derivationPath = [firstEdge.getId()];
      }

      if (secondEdge.derivationPath && secondEdge.derivationPath.length > 0) {
        derivationPath = [...derivationPath, ...secondEdge.derivationPath];
      } else {
        derivationPath = [...derivationPath, secondEdge.getId()];
      }

      if (sourceElementId !== targetElementId) {
        // Avoiding circular derived edge
        const derivedEdge = this._graphEdgeBuilder(
          sourceElementId,
          targetElementId,
          types,
          `${derivationPath.join("-")}`,
          derivationPath
        );

        const edgeExists = await this._graph.exists(derivedEdge);

        if (!edgeExists) {
          derivedEdges.push(derivedEdge);
        }
      }
    }

    return Promise.resolve(derivedEdges);
  }

  /**
   * Defines the scopes based on current cycle:
   * - The first cycle (cycle 0) focus only on non-derived edges
   * - From the second cycle (cycle 1) onwards, the scope will alternate from:
   *    - If the cycle is odd, pairs of scopes in the form
   *    [NON_DERIVED_ONLY, DERIVED_ONLY] and [DERIVED_ONLY, NON_DERIVED_ONLY] will be returned
   *    - If the cycle is even, pairs of scopes in the form
   *    [DERIVED_ONLY, DERIVED_ONLY] will be returned
   * @param cycle Current derivation cycle. Starts from 0.
   * @return List of scope tuples, in which the first element references the scope for the First Part Edge
   * and the second element references the scope for the Second Part Edge
   */
  private getCycleScopes(cycle: number): Array<[EdgeScope, EdgeScope]> {
    if (cycle === 0) {
      return [[EdgeScope.NON_DERIVED_ONLY, EdgeScope.NON_DERIVED_ONLY]];
    }

    if (cycle % 2 === 0) {
      return [[EdgeScope.DERIVED_ONLY, EdgeScope.DERIVED_ONLY]];
    } else {
      return [
        [EdgeScope.NON_DERIVED_ONLY, EdgeScope.DERIVED_ONLY],
        [EdgeScope.DERIVED_ONLY, EdgeScope.NON_DERIVED_ONLY],
      ];
    }
  }

  /**
   * Generates derived edges based on derivation rules (@see DerivationRule).
   * @param cycles Number of derivation processing iterations to be applied
   */
  async deriveEdges(cycles: number = 1): Promise<void> {
    for (let cycle = 0; cycle < cycles; cycle++) {
      const scopeList = this.getCycleScopes(cycle);
      let derivedEdges: Array<GraphEdge> = [];

      for (let i = 0; i < this._rules.length; i++) {
        const rule = this._rules[i];
        const { firstPart, secondPart, middleElementTypes } = rule.conditional;

        for (let j = 0; j < scopeList.length; j++) {
          const [firstPartScope, secondPartScope] = scopeList[j];

          // Filtering edges by the rule conditional
          const [firstPartCandidates, secondPartCandidates] =
            await this.getCandidates(
              firstPart,
              secondPart,
              middleElementTypes,
              firstPartScope,
              secondPartScope
            );

          // Matching edges by middle element (creating edge pairs)
          const edgePairs: Array<[GraphEdge, GraphEdge]> = this.combineEdges(
            rule,
            firstPartCandidates,
            secondPartCandidates
          );

          // Building derived edges
          derivedEdges = derivedEdges.concat(
            await this.generateDerivedEdges(
              edgePairs,
              rule.effect,
              rule.conditional.firstPart.direction,
              rule.conditional.secondPart.direction
            )
          );
        }
      }

      await this._graph.addManyEdges(derivedEdges);
    }
  }
}
