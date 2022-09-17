import {EdgeDirection} from "@libs/engine/derivation_engine/derivation_rule.class";

export interface RuleEdgeDescription {
    elementTypes: Array<string>;
    edgeTypes: Array<string>;
    direction: EdgeDirection;
}