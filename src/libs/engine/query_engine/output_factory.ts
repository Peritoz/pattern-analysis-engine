import { Direction } from "@libs/model/input_descriptor/enums/direction.enum";
import { OutputEdge } from "@libs/model/output/output_edge.interface";
import {OutputVertex} from "@libs/model/output/output_vertex.interface";

export class OutputFactory {
  static createOutputVertex(id: string, name: string, types: Array<string>): OutputVertex {
    return {
      identifier: id,
      label: name,
      types,
    };
  }

  static createOutputEdge(direction: Direction, types: Array<string>): OutputEdge {
    return {
      direction,
      types,
    };
  }
}
