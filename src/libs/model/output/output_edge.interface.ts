import { Direction } from "@libs/model/input_descriptor/enums/direction.enum";

export interface OutputEdge {
  identifier?: string;
  direction: Direction;
  types: Array<string>;
}
