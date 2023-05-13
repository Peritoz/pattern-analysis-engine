import { OutputVertex } from '@libs/model/output/output_vertex.interface';
import { OutputEdge } from '@libs/model/output/output_edge.interface';

export interface Output {
  edges: Array<OutputEdge>;
  paths: Array<Array<OutputVertex>>;
}
