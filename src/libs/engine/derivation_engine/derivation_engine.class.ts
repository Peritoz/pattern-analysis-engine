import { GraphRepository } from "@libs/model/graph_repository/graph_repository.interface";

export enum EdgeDirection {
  LEFT,
  RIGHT,
}

export interface RuleEdgeDescription {
  sourceTypes: Array<string>;
  targetTypes: Array<string>;
  edgeTypes: Array<string>;
  direction: EdgeDirection;
}

export interface DerivationRule {
  firstEdge: RuleEdgeDescription;
  secondEdge: RuleEdgeDescription;
}

export class DerivationEngine {
  protected _graph: GraphRepository;
  protected _rules: Array<DerivationRule>;

  constructor(graph: GraphRepository, rules: Array<DerivationRule>) {
    this._graph = graph;
    this._rules = rules;
  }
}
