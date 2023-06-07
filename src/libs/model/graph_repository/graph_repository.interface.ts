import { EdgeScope } from '@libs/model/graph_repository/enums/edge_scope.enum';

export interface VertexFilter {
  ids: Array<string>;
  searchTerm: string;
  types: Array<string>;
  inclusiveTypes: boolean; // = true means that should select vertices with any of the types
}

export type PartialVertexFilter = Partial<VertexFilter>;

export interface EdgeFilter {
  types: Array<string>;
  inclusiveTypes: boolean; // = true means that should select edges with any of the types
  isNegated: boolean;
  scope: EdgeScope;
}

export type PartialEdgeFilter = Partial<EdgeFilter>;

export interface GraphVertex {
  externalId: string;
  name: string;
  types: Array<string>;
  properties?: { [key: string]: any };

  getId: () => string;
}

export interface GraphEdge {
  externalId: string;
  sourceId: string;
  targetId: string;
  types: Array<string>;
  derivationPath?: Array<string>;

  getId: () => string;
}

export type AnalysisPattern = Array<GraphEdge>;

export interface GraphRepository {
  /**
   * Adds a vertex to the graph
   * @param vertex Vertex to be added
   */
  addVertex(vertex: GraphVertex): Promise<void>;

  /**
   * Adds many vertices to the graph
   * @param vertices Vertices to be added
   */
  addManyVertices(vertices: Array<GraphVertex>): Promise<void>;

  /**
   * Removes a vertex from the graph
   * @param vertexId Identifier of the vertex to be removed
   */
  removeVertex(vertexId: string): Promise<void>;

  /**
   * Adds an edge to the graph
   * @param edge Edge to be added
   */
  addEdge(edge: GraphEdge): Promise<void>;

  /**
   * Adds many edges to the graph
   * @param edges Edges to be added
   */
  addManyEdges(edges: Array<GraphEdge>): Promise<void>;

  /**
   * Removes an edge from the graph
   * @param edgeId Identifier of the edge to be removed
   */
  removeEdge(edgeId: string): Promise<void>;

  /**
   * Checks if a vertex or an edge exists
   * @param element Vertex or Edge to have its existence verified
   */
  exists(element: GraphVertex | GraphEdge): Promise<boolean>;

  /**
   * Gets a specific vertex
   * @param vertexId Vertex id
   * @return Found vertex or undefined
   */
  getVertex: (vertexId: string) => Promise<GraphVertex | undefined>;

  /**
   * Gets all the vertices of the graph
   * @return Array of vertices
   */
  getAllVertices(): Promise<Array<GraphVertex>>;

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
  getVerticesByFilter: (filter: PartialVertexFilter) => Promise<Array<GraphVertex>>;

  /**
   * Gets a specific edge
   * @param edgeId Edge id
   * @return Found edge or undefined
   */
  getEdge: (edgeId: string) => Promise<GraphEdge | undefined>;

  /**
   * Gets all the edges of the graph
   * @return Array of edges
   */
  getAllEdges(): Promise<Array<GraphEdge>>;

  /**
   * Gets multiple edges
   * @param edgeIds Array of edge ids
   * @return Array of edges
   */
  getEdges: (edgeIds: Array<string>) => Promise<Array<GraphEdge>>;

  /**
   * Searches for edges that meet the condition specified in the filter
   * @param sourceFilter Conditions to be fulfilled by the source element. Must receive null to not apply any filter
   * @param relationshipFilter Conditions to be fulfilled by the edge
   * @param targetFilter Conditions to be fulfilled by the target element. Must receive null to not apply any filter
   * @return Array of edges
   */
  getEdgesByFilter: (
    sourceFilter: PartialVertexFilter | null,
    edgeFilter: PartialEdgeFilter,
    targetFilter: PartialVertexFilter | null,
  ) => Promise<Array<GraphEdge>>;
}
