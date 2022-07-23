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
  /**
   * Adds a vertex to the graph
   * @param vertex Vertex to be added
   */
  addVertex(vertex: GraphVertex): void;
  /**
   * Adds an edge to the graph
   * @param edge Edge to be added
   */
  addEdge(edge: GraphEdge): void;
  /**
   * Gets a specific vertex
   * @param vertexId Vertex id
   * @return Found vertex or undefined
   */
  getVertex: (vertexId: string) => Promise<GraphVertex | undefined>;
  /**
   * Gets multiple vertices
   * @param vertexIds Array of vertex ids
   * @return Array of vertices
   */
  getVertices: (vertexIds: Array<string>) => Promise<Array<GraphVertex>>;
  /**
   * Searches for vertices that meet the condition specified in the filter
   * @param filter Conditions to be fulfilled
   * @return Array of vertices
   */
  getVerticesByFilter: (filter: VertexFilter) => Promise<Array<GraphVertex>>;
  /**
   * Gets a specific edge
   * @param edgeId Edge id
   * @return Found edge or undefined
   */
  getEdge: (edgeId: string) => Promise<GraphEdge | undefined>;
  /**
   * Gets multiple edges
   * @param edgeIds Array of edge ids
   * @return Array of edges
   */
  getEdges: (edgeIds: Array<string>) => Promise<Array<GraphEdge>>;
  /**
   * Searches for edges that meet the condition specified in the filter
   * @param filter Conditions to be fulfilled
   * @return Array of edges
   */
  getEdgesByFilter: (
    sourceFilter: VertexFilter,
    relationshipFilter: EdgeFilter,
    targetFilter: VertexFilter
  ) => Promise<Array<GraphEdge>>;
}
