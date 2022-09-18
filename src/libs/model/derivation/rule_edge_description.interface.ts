import {Direction} from "@libs/model/common/enums/direction.enum";

export interface RuleEdgeDescription {
    elementTypes: Array<string>;
    edgeTypes: Array<string>;
    direction: Direction;
}