import { SimpleGraphEdge } from '../../../src';

export const graph_edge_builder = (
  sourceId: string,
  targetId: string,
  types: Array<string>,
  externalId = '',
  derivationPath: Array<string> = [],
) => {
  return new SimpleGraphEdge(sourceId, targetId, types, externalId, derivationPath);
};
