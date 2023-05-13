import {
  GraphEdge,
  GraphRepository,
  PartialEdgeFilter,
  PartialVertexFilter,
} from '@libs/model/graph_repository/graph_repository.interface';
import { DerivationRule } from '@libs/engine/derivation_engine/derivation_rule.class';
import { EdgeScope } from '@libs/model/graph_repository/enums/edge_scope.enum';
import { RuleEdgeDescription } from '@libs/model/derivation/rule_edge_description.interface';
import { RulePart } from '@libs/model/derivation/enums/rule_part.enum';
import { RuleEffect } from '@libs/model/derivation/rule_effect.interface';
import { Direction } from '@libs/model/common/enums/direction.enum';
import { Logger } from '@libs/model/common/logger.interface';
import { LogScope } from '@libs/model/common/enums/log_scope.enum';

type EdgePairContext = {
  sourceElementId: string;
  types: Array<string>;
  targetElementId: string;
  firstEdge: GraphEdge;
  secondEdge: GraphEdge;
};

export class DerivationEngine {
  protected _graph: GraphRepository;
  protected _rules: Array<DerivationRule>;
  protected _rulesMap: Map<string, DerivationRule>;
  protected _graphEdgeBuilder: (
    sourceId: string,
    targetId: string,
    types: Array<string>,
    externalId: string,
    derivationPath: Array<string>,
  ) => GraphEdge;
  protected _logger: Logger | null;

  constructor(
    graph: GraphRepository,
    rules: Array<DerivationRule>,
    graphEdgeBuilder: (
      sourceId: string,
      targetId: string,
      types: Array<string>,
      externalId: string,
      derivationPath: Array<string>,
    ) => GraphEdge,
    logger?: Logger,
  ) {
    this._graph = graph;
    this._rules = rules;
    this._rulesMap = new Map<string, DerivationRule>();
    this._logger = logger || null;

    // Validating graph builder
    if (this.validateEdgeBuilder(graphEdgeBuilder)) {
      this._graphEdgeBuilder = graphEdgeBuilder;
    } else {
      throw new Error('Invalid edge builder');
    }

    // Mapping rules
    this.initRulesMap();
  }

  get graph(): GraphRepository {
    return this._graph;
  }

  get rules(): Array<DerivationRule> {
    return this._rules;
  }

  private initRulesMap() {
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

  private log(message: string, scope: LogScope = LogScope.INFO) {
    if (this._logger) {
      switch (scope) {
        case LogScope.INFO:
          this._logger.info(message);
          break;
        case LogScope.WARN:
          this._logger.warn(message);
          break;
        case LogScope.ERROR:
          this._logger.error(message);
          break;
      }
    }
  }

  private validateEdgeBuilder(
    graphEdgeBuilder: (
      sourceId: string,
      targetId: string,
      types: Array<string>,
      externalId: string,
      derivationPath: Array<string>,
    ) => GraphEdge,
  ): boolean {
    const testEdge = {
      sourceId: '1',
      targetId: '2',
      types: ['T'],
      externalId: '3',
      derivationPath: ['4'],
    };
    const createdEdge = graphEdgeBuilder(
      testEdge.sourceId,
      testEdge.targetId,
      testEdge.types,
      testEdge.externalId,
      testEdge.derivationPath,
    );

    return (
      createdEdge &&
      createdEdge.sourceId === testEdge.sourceId &&
      createdEdge.targetId === testEdge.targetId &&
      Array.isArray(createdEdge.types) &&
      createdEdge.types.length > 0 &&
      createdEdge.types[0] === testEdge.types[0] &&
      createdEdge.externalId === testEdge.externalId &&
      Array.isArray(createdEdge.derivationPath) &&
      createdEdge.derivationPath.length > 0 &&
      createdEdge.derivationPath[0] === testEdge.derivationPath[0]
    );
  }

  private getPartCandidates(
    partDescription: RuleEdgeDescription,
    middleElementTypes: Array<string>,
    isFirstPart: boolean,
    edgeScope: EdgeScope = EdgeScope.ALL,
    ids: Array<string> = [],
  ): Promise<Array<GraphEdge>> {
    const isOutbound = partDescription.direction === Direction.OUTBOUND;
    const typesTuple = isFirstPart
      ? [partDescription.elementTypes, middleElementTypes]
      : [middleElementTypes, partDescription.elementTypes];
    const index = isOutbound ? 0 : 1;
    const invertedIndex = (index + 1) % 2;
    const sourceFilter: PartialVertexFilter = { types: typesTuple[index] };
    const targetFilter: PartialVertexFilter = {
      types: typesTuple[invertedIndex],
    };
    let edgeFilter: PartialEdgeFilter = {
      types: partDescription.edgeTypes,
      scope: edgeScope,
    };

    if (isOutbound) {
      sourceFilter.ids = ids;
    } else {
      targetFilter.ids = ids;
    }

    const hasSourceFilter =
      (Array.isArray(sourceFilter.types) && sourceFilter.types.length > 0) ||
      (Array.isArray(sourceFilter.ids) && sourceFilter.ids.length > 0);
    const hasTargetFilter =
      (Array.isArray(targetFilter.types) && targetFilter.types.length > 0) ||
      (Array.isArray(targetFilter.ids) && targetFilter.ids.length > 0);

    return this._graph.getEdgesByFilter(
      hasSourceFilter ? sourceFilter : null,
      edgeFilter,
      hasTargetFilter ? targetFilter : null,
    );
  }

  private async getCandidates(
    firstPart: RuleEdgeDescription,
    secondPart: RuleEdgeDescription,
    middleElementTypes: Array<string>,
    firstPartScope: EdgeScope,
    secondPartScope: EdgeScope,
  ): Promise<Array<[GraphEdge, GraphEdge]>> {
    const candidates: Array<[GraphEdge, GraphEdge]> = [];

    const firstPartCandidates = await this.getPartCandidates(
      firstPart,
      middleElementTypes,
      true,
      firstPartScope,
    );

    for (let i = 0; i < firstPartCandidates.length; i++) {
      const firstPartCandidate: GraphEdge = firstPartCandidates[i];
      const linkIds: Array<string> = [
        firstPart.direction === Direction.OUTBOUND
          ? firstPartCandidate.targetId
          : firstPartCandidate.sourceId,
      ];
      const secondPartCandidates: Array<GraphEdge> = await this.getPartCandidates(
        secondPart,
        middleElementTypes,
        false,
        secondPartScope,
        linkIds,
      );

      for (let j = 0; j < secondPartCandidates.length; j++) {
        const secondPartCandidate = secondPartCandidates[j];

        candidates.push([firstPartCandidate, secondPartCandidate]);
      }
    }

    return candidates;
  }

  private getEdgePairContext(
    edgePair: [GraphEdge, GraphEdge],
    effect: RuleEffect,
    firstPartDirection: Direction,
    secondPartDirection: Direction,
  ): EdgePairContext {
    const [firstEdge, secondEdge] = edgePair;
    const { source, target, types } = effect;
    let sourceElementId = '';
    let targetElementId = '';

    if (source === RulePart.FIRST_PART_ELEMENT) {
      sourceElementId =
        firstPartDirection === Direction.OUTBOUND ? firstEdge.sourceId : firstEdge.targetId;
    } else if (source === RulePart.MIDDLE_ELEMENT) {
      sourceElementId =
        firstPartDirection === Direction.OUTBOUND ? firstEdge.targetId : firstEdge.sourceId;
    } else if (source === RulePart.SECOND_PART_ELEMENT) {
      sourceElementId =
        secondPartDirection === Direction.OUTBOUND ? secondEdge.targetId : secondEdge.sourceId;
    }

    if (target === RulePart.FIRST_PART_ELEMENT) {
      targetElementId =
        firstPartDirection === Direction.OUTBOUND ? firstEdge.sourceId : firstEdge.targetId;
    } else if (target === RulePart.MIDDLE_ELEMENT) {
      targetElementId =
        firstPartDirection === Direction.OUTBOUND ? firstEdge.targetId : firstEdge.sourceId;
    } else if (target === RulePart.SECOND_PART_ELEMENT) {
      targetElementId =
        secondPartDirection === Direction.OUTBOUND ? secondEdge.targetId : secondEdge.sourceId;
    }

    return { firstEdge, secondEdge, types, sourceElementId, targetElementId };
  }

  private getDerivedEdgeId(
    firstEdge: GraphEdge,
    secondEdge: GraphEdge,
    firstPartDirection: Direction,
    secondPartDirection: Direction,
  ) {
    return `${firstEdge.getId()}${firstPartDirection === Direction.OUTBOUND ? '>' : '<'}${
      secondPartDirection === Direction.OUTBOUND ? '>' : '<'
    }${secondEdge.getId()}`;
  }

  private mountDerivationPath(firstEdge: GraphEdge, secondEdge: GraphEdge) {
    let derivationPath = [];
    const firstEdgeId = firstEdge.getId();
    const secondEdgeId = secondEdge.getId();

    if (!firstEdgeId) {
      throw new Error(
        `Invalid edge id from edge {sourceId: ${firstEdge.sourceId}, targetId ${firstEdge.targetId}}, types: ${firstEdge.types}`,
      );
    }
    if (!secondEdgeId) {
      throw new Error(
        `Invalid edge id from edge {sourceId: ${secondEdge.sourceId}, targetId ${secondEdge.targetId}, types: ${secondEdge.types}`,
      );
    }

    if (firstEdge.derivationPath && firstEdge.derivationPath.length > 0) {
      derivationPath = [...firstEdge.derivationPath];
    } else {
      derivationPath = [firstEdgeId];
    }

    if (secondEdge.derivationPath && secondEdge.derivationPath.length > 0) {
      derivationPath = [...derivationPath, ...secondEdge.derivationPath];
    } else {
      derivationPath = [...derivationPath, secondEdgeId];
    }

    return derivationPath;
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
    secondPartDirection: Direction,
  ): Promise<Array<GraphEdge>> {
    const derivedEdges: Array<GraphEdge> = [];

    for (const edgePair of edgePairs) {
      let { firstEdge, secondEdge, types, sourceElementId, targetElementId } =
        this.getEdgePairContext(edgePair, effect, firstPartDirection, secondPartDirection);

      // Mounting the derivation path
      const derivationPath = this.mountDerivationPath(firstEdge, secondEdge);

      const derivedEdgeId = this.getDerivedEdgeId(
        firstEdge,
        secondEdge,
        firstPartDirection,
        secondPartDirection,
      );

      // Checking for circular derived edge
      if (sourceElementId !== targetElementId) {
        // Creating derived edge
        const derivedEdge = this._graphEdgeBuilder(
          sourceElementId,
          targetElementId,
          types,
          derivedEdgeId,
          derivationPath,
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
    try {
      for (let cycle = 0; cycle < cycles; cycle++) {
        const scopeList: Array<[EdgeScope, EdgeScope]> = this.getCycleScopes(cycle);
        let derivedEdges: Array<GraphEdge> = [];

        for (let i = 0; i < this._rules.length; i++) {
          const rule = this._rules[i];
          const { firstPart, secondPart, middleElementTypes } = rule.conditional;

          for (let j = 0; j < scopeList.length; j++) {
            const [firstPartScope, secondPartScope] = scopeList[j];

            this.log(
              `Processing cycle ${cycle} | rule ${i} | scope ${firstPartScope}:${secondPartScope}`,
            );

            // Filtering edges by the rule conditional and matching edges by middle element (creating edge pairs)
            const edgePairs: Array<[GraphEdge, GraphEdge]> = await this.getCandidates(
              firstPart,
              secondPart,
              middleElementTypes,
              firstPartScope,
              secondPartScope,
            );

            // Building derived edges
            derivedEdges = derivedEdges.concat(
              await this.generateDerivedEdges(
                edgePairs,
                rule.effect,
                rule.conditional.firstPart.direction,
                rule.conditional.secondPart.direction,
              ),
            );
          }
        }

        await this._graph.addManyEdges(derivedEdges);
      }
    } catch (error) {
      if (error instanceof Error) {
        this.log(error.message);
      }

      await Promise.reject(String(error));
    }
  }
}
