import {
  GraphNode,
  GraphRelationship,
  GraphRepository,
  NodeFilter,
  RelationshipFilter,
} from "@libs/model/graph_repository/graph_repository.interface";

class SimpleGraphRepository implements GraphRepository {
  protected _adjacencyListMap: Map<string, Array<string>>;
  protected _vertices: Map<string, GraphNode>;
  protected _edges: Map<string, GraphRelationship>;

  constructor() {
    this._adjacencyListMap = new Map<string, Array<string>>();
    this._vertices = new Map<string, GraphNode>();
    this._edges = new Map<string, GraphRelationship>();
  }

  addVertex(vertex: GraphNode) {
    this._adjacencyListMap.set(vertex.id, []);
    this._vertices.set(vertex.id, vertex);
  }

  addEdge(edge: GraphRelationship) {
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

  getNode(nodeId: string): Promise<GraphNode | undefined> {
    return Promise.resolve(this._vertices.get(nodeId));
  }

  getNodes(nodeIds: Array<string>): Promise<Array<GraphNode>> {
    const vertices = [];

    for (let i = 0; i < nodeIds.length; i++) {
      const vertex = this._vertices.get(nodeIds[i]);

      if (vertex) {
        vertices.push(vertex);
      }
    }

    return Promise.resolve(vertices);
  }

  getNodesByFilter(filter: NodeFilter): Promise<Array<GraphNode>> {
    return Promise.resolve([]);
  }

  getRelationship(
    relationshipId: string
  ): Promise<GraphRelationship | undefined> {
    return Promise.resolve(this._edges.get(relationshipId));
  }

  getRelationships(
    relationshipIds: Array<string>
  ): Promise<Array<GraphRelationship>> {
    return Promise.resolve([]);
  }

  transverse(
    sourceFilter: NodeFilter,
    relationshipFilter: RelationshipFilter,
    targetFilter: NodeFilter
  ): Promise<Array<GraphNode | GraphRelationship>> {
    return Promise.resolve([]);
  }
}
