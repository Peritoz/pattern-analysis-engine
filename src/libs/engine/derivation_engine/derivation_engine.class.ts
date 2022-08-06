import {
  GraphRepository
} from "@libs/model/graph_repository/graph_repository.interface";
import { DerivationRule } from "@libs/engine/derivation_engine/derivation_rule.class";

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

  deriveEdges() {

  }
}
