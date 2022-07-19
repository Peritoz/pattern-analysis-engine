import {
  GraphVertex,
  GraphEdge,
  GraphRepository,
  VertexFilter,
  EdgeFilter,
} from "@libs/model/graph_repository/graph_repository.interface";

class SimpleGraphRepository implements GraphRepository {
  protected _adjacencyListMap: Map<string, Array<string>>;
  protected _vertices: Map<string, GraphVertex>;
  protected _edges: Map<string, GraphEdge>;

  constructor() {
    this._adjacencyListMap = new Map<string, Array<string>>();
    this._vertices = new Map<string, GraphVertex>();
    this._edges = new Map<string, GraphEdge>();
  }

  addVertex(vertex: GraphVertex): void {
    this._adjacencyListMap.set(vertex.id, []);
    this._vertices.set(vertex.id, vertex);
  }

  addEdge(edge: GraphEdge): void {
    const currentEdges = this._adjacencyListMap.get(edge.sourceId);

    if (Array.isArray(currentEdges)) {
      if (!currentEdges.includes(edge.targetId)) {
        currentEdges.push(edge.targetId);
        this._edges.set(edge.id, edge);
      }
    } else {
      this._adjacencyListMap.set(edge.sourceId, [edge.targetId]);
      this._edges.set(edge.id, edge);
    }
  }

  getVertex(nodeId: string): Promise<GraphVertex | undefined> {
    return Promise.resolve(this._vertices.get(nodeId));
  }

  getVertices(nodeIds: Array<string>): Promise<Array<GraphVertex>> {
    const vertices = [];

    for (let i = 0; i < nodeIds.length; i++) {
      const vertex = this._vertices.get(nodeIds[i]);

      if (vertex) {
        vertices.push(vertex);
      }
    }

    return Promise.resolve(vertices);
  }

  getVerticesByFilter(filter: VertexFilter): Promise<Array<GraphVertex>> {
    return Promise.resolve([]);
  }

  getEdge(relationshipId: string): Promise<GraphEdge | undefined> {
    return Promise.resolve(this._edges.get(relationshipId));
  }

  getEdges(relationshipIds: Array<string>): Promise<Array<GraphEdge>> {
    const edges = [];

    for (let i = 0; i < relationshipIds.length; i++) {
      const edge = this._edges.get(relationshipIds[i]);

      if (edge) {
        edges.push(edge);
      }
    }

    return Promise.resolve(edges);
  }

  getEdgesByFilter(
    sourceFilter: VertexFilter,
    relationshipFilter: EdgeFilter,
    targetFilter: VertexFilter
  ): Promise<Array<GraphVertex | GraphEdge>> {
    return Promise.resolve([]);
  }
}
