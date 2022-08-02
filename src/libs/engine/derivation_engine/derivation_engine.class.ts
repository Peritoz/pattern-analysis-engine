import { GraphRepository } from "@libs/model/graph_repository/graph_repository.interface";

export enum EdgeDirection {
  OUTBOUND,
  INBOUND,
}

export enum RulePart {
  FIRST_PART_ELEMENT,
  MIDDLE_ELEMENT,
  SECOND_PART_ELEMENT,
}

export enum EdgeRole {
  SOURCE,
  TARGET,
}

export interface RuleEdgeDescription {
  elementTypes: Array<string>;
  edgeTypes: Array<string>;
  direction: EdgeDirection;
}

export interface RuleConditional {
  firstPart: RuleEdgeDescription;
  middleElementTypes: Array<string>;
  secondPart: RuleEdgeDescription;
}

export interface RuleEffect {
  source: RulePart; // Origin of the source element of the derived edge
  target: RulePart; // Origin of the target element of the derived edge
  types: Array<string>; // Types to be assigned to the derived edge
}

export interface DerivationRule {
  condition: RuleConditional;
  then: RuleEffect;
}

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

  initRulesMap() {
    for (let i = 0; i < this._rules.length; i++) {
      const rule = this._rules[i];
      const ruleCondition = rule.condition;

      for (let j = 0; j < ruleCondition.firstPart.edgeTypes.length; j++) {
        const firstEdgeType = ruleCondition.firstPart.edgeTypes[j];

        for (let k = 0; k < ruleCondition.secondPart.edgeTypes.length; k++) {
          const secondEdgeType = ruleCondition.secondPart.edgeTypes[k];

          this._rulesMap.set(`${firstEdgeType}-${secondEdgeType}`, rule);
        }
      }
    }
  }

  deriveEdges() {}
}
