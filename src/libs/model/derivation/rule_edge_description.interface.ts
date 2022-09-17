import {EdgeDirection} from "@libs/model/derivation/enums/edge_direction.enum";

export interface RuleEdgeDescription {
    elementTypes: Array<string>;
    edgeTypes: Array<string>;
    direction: EdgeDirection;
}