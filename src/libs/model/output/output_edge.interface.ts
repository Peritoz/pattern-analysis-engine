import { Direction } from "@libs/model/common/enums/direction.enum";

export interface OutputEdge {
  identifier?: string;
  direction: Direction;
  types: Array<string>;
  derivationPath?: Array<string>;
}
