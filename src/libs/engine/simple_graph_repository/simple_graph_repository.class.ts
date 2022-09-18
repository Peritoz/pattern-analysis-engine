import {
  GraphRepository,
  PartialEdgeFilter,
  PartialVertexFilter,
} from "@libs/model/graph_repository/graph_repository.interface";
import { EdgeScope } from "@libs/model/graph_repository/enums/edge_scope.enum";
import { SimpleGraphEdge } from "@libs/engine/simple_graph_repository/simple_graph_edge";
import { SimpleGraphVertex } from "@libs/engine/simple_graph_repository/simple_graph_vertex";

export class SimpleGraphRepository implements GraphRepository {
  protected _adjacencyListMap: Map<string, Array<string>>;
  protected _verticesArray: Array<SimpleGraphVertex>;
  protected _verticesMap: Map<string, SimpleGraphVertex>;
  protected _verticesMapByType: Map<string, Array<string>>;
  protected _edgesMap: Map<string, SimpleGraphEdge>;

  constructor() {
    this._adjacencyListMap = new Map<string, Array<string>>();
    this._verticesArray = [];
    this._verticesMap = new Map<string, SimpleGraphVertex>();
    this._verticesMapByType = new Map<string, Array<string>>();
    this._edgesMap = new Map<string, SimpleGraphEdge>();
  }

  addVertex(vertex: SimpleGraphVertex): void {
    this._adjacencyListMap.set(vertex.getId(), []);
    this._verticesArray.push(vertex);
    this._verticesMap.set(vertex.getId(), vertex);

    // Mapping by type for filter optimization
    for (let i = 0; i < vertex.types.length; i++) {
      const type = vertex.types[i];
      const typeEntry = this._verticesMapByType.get(type);

      if (typeEntry) {
        typeEntry.push(vertex.getId());
      } else {
        this._verticesMapByType.set(type, [vertex.getId()]);
      }
    }
  }

  addManyVertices(vertices: Array<SimpleGraphVertex>) {
    if (vertices) {
      for (let i = 0; i < vertices.length; i++) {
        this.addVertex(vertices[i]);
      }
    }
  }

  removeVertex(vertexId: string): void {
    const vertex = this._verticesMap.get(vertexId);

    if (vertex) {
      // Removing from vertex array
      this._verticesArray = this._verticesArray.filter(
        (v) => v.getId() !== vertexId
      );

      // Removing from type map
      for (let i = 0; i < vertex.types.length; i++) {
        const type = vertex.types[i];
        const vertices = this._verticesMapByType.get(type);

        if (Array.isArray(vertices)) {
          this._verticesMapByType.set(
            type,
            vertices.filter((id) => id !== vertexId)
          );
        }
      }

      // Removing from vertices map
      this._verticesMap.delete(vertexId);

      // Extracting edges as an array
      const edges = Array.from(this._edgesMap.values());

      // Removing inbound edges from the adjacency list
      const inBoundEdges = edges.filter((e) => e.targetId === vertexId);
      const sourceIds = inBoundEdges.map((e) => e.sourceId);

      for (let i = 0; i < sourceIds.length; i++) {
        const sourceId = sourceIds[i];
        const adjElements = this._verticesMap.get(sourceId);

        if (Array.isArray(adjElements)) {
          adjElements.filter((adjElement) => !adjElement.includes(vertexId));
        }
      }

      // Removing outbound edges from the adjacency list
      this._adjacencyListMap.delete(vertexId);

      // Removing edges related to the removed vertex
      const edgesToRemove = edges.filter(
        (e) => e.sourceId === vertexId || e.targetId === vertexId
      );
      const edgeIdsToRemove = edgesToRemove.map((e) => e.getId());

      for (let i = 0; i < edgeIdsToRemove.length; i++) {
        const edgeId = edgeIdsToRemove[i];

        this._edgesMap.delete(edgeId);
      }
    }
  }

  addEdge(edge: SimpleGraphEdge): void {
    const adjListElements = this._adjacencyListMap.get(edge.sourceId);

    const adjListElement = `${edge.types.join(",")}>${edge.targetId}`;

    if (Array.isArray(adjListElements)) {
      if (!adjListElements.includes(adjListElement)) {
        adjListElements.push(adjListElement);
        this._edgesMap.set(edge.getId(), edge);
      }
    } else {
      this._adjacencyListMap.set(edge.sourceId, [adjListElement]);
      this._edgesMap.set(edge.getId(), edge);
    }
  }

  addManyEdges(edges: Array<SimpleGraphEdge>) {
    if (edges) {
      for (let i = 0; i < edges.length; i++) {
        this.addEdge(edges[i]);
      }
    }
  }

  removeEdge(edgeId: string): void {
    const idParts = edgeId.split(">");

    if (idParts.length === 3) {
      const sourceId = idParts[0];
      const adjElement = `${idParts[1]}>${idParts[2]}`;

      // Removing from Edges Map
      this._edgesMap.delete(edgeId);

      // Removing from adjacency list
      const adjElements = this._adjacencyListMap.get(sourceId);

      if (Array.isArray(adjElements)) {
        this._adjacencyListMap.set(
          sourceId,
          adjElements.filter((e) => e !== adjElement)
        );
      }
    } else {
      throw new Error(`Invalid edge id: ${edgeId}`);
    }
  }

  exists(element: SimpleGraphVertex | SimpleGraphEdge): boolean {
    if (element instanceof SimpleGraphVertex) {
      const vertex: SimpleGraphVertex | undefined = this._verticesMap.get(
        (element as SimpleGraphVertex).getId()
      );

      return vertex !== undefined;
    } else {
      const edge: SimpleGraphEdge | undefined = this._edgesMap.get(
        (element as SimpleGraphEdge).getId()
      );

      return edge !== undefined;
    }
  }

  getVertex(vertexId: string): Promise<SimpleGraphVertex | undefined> {
    return Promise.resolve(this._verticesMap.get(vertexId));
  }

  getAllVertices(): Promise<Array<SimpleGraphVertex>> {
    return Promise.resolve(this._verticesArray);
  }

  getVertices(vertexIds: Array<string>): Promise<Array<SimpleGraphVertex>> {
    const vertices = [];

    for (let i = 0; i < vertexIds.length; i++) {
      const vertex = this._verticesMap.get(vertexIds[i]);

      if (vertex) {
        vertices.push(vertex);
      }
    }

    return Promise.resolve(vertices);
  }

  getVerticesByFilter(
    filter: PartialVertexFilter
  ): Promise<Array<SimpleGraphVertex>> {
    let candidates = [];

    // Verifying if the filter is empty. In this case, all vertices should be returned
    if (
      !filter ||
      ((!filter.ids || filter.ids.length === 0) &&
        (!filter.types || filter.types.length === 0) &&
        !filter.searchTerm)
    ) {
      return this.getAllVertices();
    }

    // Filtering vertices by ID
    if (Array.isArray(filter.ids) && filter.ids.length > 0) {
      for (let i = 0; i < filter.ids.length; i++) {
        const id = filter.ids[i];
        const vertex = this._verticesMap.get(id);

        if (vertex) {
          candidates.push(vertex);
        }
      }
    }

    // Filtering vertices by TYPE
    if (Array.isArray(filter.types) && filter.types.length > 0) {
      // First case: Some candidate vertices were selected
      if (candidates.length > 0) {
        candidates = candidates.filter((candidate) =>
          candidate.types.some((t) => filter.types?.includes(t.toLowerCase()))
        );
      } else {
        // Second case: There are no candidates available
        let verticesIds: Array<string> = [];

        // Getting all vertices ids based on filter types
        for (let i = 0; i < filter.types.length; i++) {
          const type = filter.types[i];
          const idsForType = this._verticesMapByType.get(type);

          if (idsForType) {
            verticesIds = [...verticesIds, ...idsForType];
          }
        }

        // Removing duplicated values
        verticesIds = [...new Set(verticesIds)];

        // Getting vertices metadata
        for (let i = 0; i < verticesIds.length; i++) {
          const id = verticesIds[i];
          const vertex = this._verticesMap.get(id);

          if (vertex) {
            candidates.push(vertex);
          }
        }
      }
    }

    // Filtering vertices by NAME
    if (filter.searchTerm) {
      const searchTerm = filter.searchTerm.toLowerCase();

      // First case: Some candidate vertices were selected
      if (candidates.length > 0) {
        candidates = candidates.filter((candidate) =>
          candidate.name.toLowerCase().includes(searchTerm)
        );
      } else {
        // Second case: There are no candidates available
        candidates = this._verticesArray.filter((candidate) =>
          candidate.name.toLowerCase().includes(searchTerm)
        );
      }
    }

    return Promise.resolve(candidates);
  }

  getEdge(edgeId: string): Promise<SimpleGraphEdge | undefined> {
    return Promise.resolve(this._edgesMap.get(edgeId));
  }

  getAllEdges(): Promise<Array<SimpleGraphEdge>> {
    return Promise.resolve(Array.from(this._edgesMap.values()));
  }

  getEdges(edgeIds: Array<string>): Promise<Array<SimpleGraphEdge>> {
    const edges = [];

    for (let i = 0; i < edgeIds.length; i++) {
      const edge = this._edgesMap.get(edgeIds[i]);

      if (edge) {
        edges.push(edge);
      }
    }

    return Promise.resolve(edges);
  }

  async getEdgesByFilter(
    sourceFilter: PartialVertexFilter | null,
    edgeFilter: PartialEdgeFilter,
    targetFilter: PartialVertexFilter | null
  ): Promise<Array<SimpleGraphEdge>> {
    const thereIsSourceFilter =
      sourceFilter !== null && Object.entries(sourceFilter).length > 0;
    const thereIsTargetFilter =
      targetFilter !== null && Object.entries(targetFilter).length > 0;
    const sourceVertices = thereIsSourceFilter
      ? await this.getVerticesByFilter(sourceFilter)
      : await this.getAllVertices();
    const targetVertices = thereIsTargetFilter
      ? await this.getVerticesByFilter(targetFilter)
      : await this.getAllVertices();
    const targetIds = targetVertices.map((vertex) => vertex.getId());
    const edges: Array<SimpleGraphEdge> = [];

    // Starting from all source vertices that conform to the filter
    for (let i = 0; i < sourceVertices.length; i++) {
      const vertex = sourceVertices[i];
      const adjacencyList = this._adjacencyListMap.get(vertex.getId());

      if (Array.isArray(adjacencyList)) {
        // Looking for edges with target vertices that conform to the filter
        for (let j = 0; j < adjacencyList.length; j++) {
          const adjListElement = adjacencyList[j]; // Returns: "type>targetId"
          const adjListElementParts = adjListElement.split(">");
          const targetId = adjListElementParts[1];

          if (targetIds.includes(targetId)) {
            const edge = await this.getEdge(
              `${vertex.getId()}>${adjListElement}`
            );

            // Verifying if the edge conforms with the constraints
            if (edge) {
              const fulfillsTypeConstraints = edgeFilter.types?.every(
                (edgeType) => edge.types.includes(edgeType.toLowerCase())
              );
              const isDerivedEdge =
                edge.derivationPath !== undefined &&
                edge.derivationPath.length > 0;

              let fulfillsDerivationConstraint = true;

              fulfillsDerivationConstraint =
                edgeFilter.scope === EdgeScope.ALL ||
                (isDerivedEdge &&
                  edgeFilter.scope === EdgeScope.DERIVED_ONLY) ||
                (!isDerivedEdge &&
                  edgeFilter.scope === EdgeScope.NON_DERIVED_ONLY);

              if (fulfillsTypeConstraints && fulfillsDerivationConstraint) {
                const edgeIndex = edges.findIndex(
                  (e: SimpleGraphEdge) => e.getId() === edge.getId()
                );

                if (edgeIndex === -1) {
                  edges.push(edge);
                }
              }
            }
          }
        }
      }
    }

    return Promise.resolve(edges);
  }
}