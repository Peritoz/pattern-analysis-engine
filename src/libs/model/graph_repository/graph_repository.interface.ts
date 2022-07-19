export interface VertexFilter {
  ids?: Array<string>;
  searchTerm?: string;
  types?: Array<string>;
}

export interface EdgeFilter {
  types?: Array<string>;
  isDerived: boolean;
  isNegated: boolean;
}

export interface GraphVertex {
  id: string;
  name: string;
  types: Array<string>;
  properties?: { [key: string]: any };
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  types: Array<string>;
  derivationPath: Array<string>;
}

export interface GraphRepository {
  addVertex(vertex: GraphVertex): void;
  addEdge(edge: GraphEdge): void;
  getVertex: (nodeId: string) => Promise<GraphVertex | undefined>;
  getVertices: (nodeIds: Array<string>) => Promise<Array<GraphVertex>>;
  getVerticesByFilter: (filter: VertexFilter) => Promise<Array<GraphVertex>>;
  getEdge: (relationshipId: string) => Promise<GraphEdge | undefined>;
  getEdges: (relationshipIds: Array<string>) => Promise<Array<GraphEdge>>;
  getEdgesByFilter: (
    sourceFilter: VertexFilter,
    relationshipFilter: EdgeFilter,
    targetFilter: VertexFilter
  ) => Promise<Array<GraphVertex | GraphEdge>>;
}
