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
  protected _nonDerivedEdgesMap: Map<string, Array<SimpleGraphEdge>>;
  protected _derivedEdgesMap: Map<string, Array<SimpleGraphEdge>>;

  constructor() {
    this._adjacencyListMap = new Map<string, Array<string>>();
    this._verticesArray = [];
    this._verticesMap = new Map<string, SimpleGraphVertex>();
    this._verticesMapByType = new Map<string, Array<string>>();
    this._edgesMap = new Map<string, SimpleGraphEdge>();
    this._nonDerivedEdgesMap = new Map<string, Array<SimpleGraphEdge>>();
    this._derivedEdgesMap = new Map<string, Array<SimpleGraphEdge>>();

    this._nonDerivedEdgesMap.set("_", []);
    this._derivedEdgesMap.set("_", []);
  }

  async addVertex(vertex: SimpleGraphVertex): Promise<void> {
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

  async addManyVertices(vertices: Array<SimpleGraphVertex>): Promise<void> {
    if (vertices) {
      for (let i = 0; i < vertices.length; i++) {
        await this.addVertex(vertices[i]);
      }
    }
  }

  async removeVertex(vertexId: string): Promise<void> {
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

  async addEdge(edge: SimpleGraphEdge): Promise<void> {
    const adjListElements = this._adjacencyListMap.get(edge.sourceId);
    const adjListElement = `${edge.types.join(",")}>${edge.targetId}`;

    if (Array.isArray(adjListElements)) {
      if (!adjListElements.includes(adjListElement)) {
        adjListElements.push(adjListElement);

        await this.mapEdge(edge);
      }
    } else {
      this._adjacencyListMap.set(edge.sourceId, [adjListElement]);

      await this.mapEdge(edge);
    }
  }

  /**
   * Maps the edge in nested maps based on scope, from Edge Type -> Source Vertex Type
   * @param edge Edge to be mapped
   */
  private async mapEdge(edge: SimpleGraphEdge): Promise<void> {
    const isDerived = edge.derivationPath && edge.derivationPath.length > 0;

    this._edgesMap.set(edge.getId(), edge);

    for (let i = 0; i < edge.types.length; i++) {
      const type = edge.types[i];
      const map = isDerived ? this._derivedEdgesMap : this._nonDerivedEdgesMap;

      const entry: Array<SimpleGraphEdge> | undefined = map.get(type);
      const all: Array<SimpleGraphEdge> | undefined = map.get("_");

      if (Array.isArray(entry)) {
        entry.push(edge);
      } else {
        map.set(type, [edge]);
      }

      all?.push(edge);
    }
  }

  async addManyEdges(edges: Array<SimpleGraphEdge>): Promise<void> {
    if (edges) {
      for (let i = 0; i < edges.length; i++) {
        await this.addEdge(edges[i]);
      }
    }
  }

  // TODO: Remove from maps
  async removeEdge(edgeId: string): Promise<void> {
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

  async exists(element: SimpleGraphVertex | SimpleGraphEdge): Promise<boolean> {
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

  private filterEdges(
      edges: Array<SimpleGraphEdge>,
      type: string,
      scope: EdgeScope = EdgeScope.ALL
  ) {
    let candidates = edges;

    if (scope === EdgeScope.NON_DERIVED_ONLY || scope === EdgeScope.ALL) {
      const nonDerivedCandidates = this._nonDerivedEdgesMap.get(type);

      if (nonDerivedCandidates) {
        candidates = candidates.concat(nonDerivedCandidates);
      }
    }

    if (scope === EdgeScope.DERIVED_ONLY || scope === EdgeScope.ALL) {
      const derivedCandidates = this._derivedEdgesMap.get(type);

      if (derivedCandidates) {
        candidates = candidates.concat(derivedCandidates);
      }
    }

    return candidates;
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
    let candidates: Array<SimpleGraphEdge> = [];

    // Looking up edges based on scope and types
    if (Array.isArray(edgeFilter.types) && edgeFilter.types.length > 0) {
      for (let i = 0; i < edgeFilter.types.length; i++) {
        const type = edgeFilter.types[i];

        candidates = this.filterEdges(candidates, type, edgeFilter.scope);
      }
    } else {
      candidates = this.filterEdges(candidates, "_", edgeFilter.scope);
    }

    // Filtering candidates based on "and" types list
    if (edgeFilter.inclusiveTypes) {
      candidates = candidates.filter((edge) =>
          edgeFilter.types?.every((edgeType) =>
              edge.types.includes(edgeType.toLowerCase())
          )
      );
    }

    // Removing duplicates
    candidates = candidates.filter((edge, currentPos) => {
      return candidates.indexOf(edge) === currentPos;
    });

    // Extracting source and target ids
    let sourceVerticesIds = candidates.map((e) => e.sourceId);
    let targetVerticesIds = candidates.map((e) => e.targetId);

    // Filtering by vertex filter ids
    if (
        thereIsSourceFilter &&
        Array.isArray(sourceFilter.ids) &&
        sourceFilter?.ids.length > 0
    ) {
      sourceVerticesIds = sourceVerticesIds.filter((id) =>
          sourceFilter?.ids?.includes(id)
      );
    }

    if (
        thereIsTargetFilter &&
        Array.isArray(targetFilter.ids) &&
        targetFilter?.ids.length > 0
    ) {
      targetVerticesIds = targetVerticesIds.filter((id) =>
          targetFilter?.ids?.includes(id)
      );
    }

    // Looking up vertices
    const sourceVertices = thereIsSourceFilter
        ? await this.getVerticesByFilter({
          ids: sourceVerticesIds,
          ...sourceFilter,
        })
        : await this.getVerticesByFilter({ ids: sourceVerticesIds });
    const targetVertices = thereIsTargetFilter
        ? await this.getVerticesByFilter({
          ids: targetVerticesIds,
          ...targetFilter,
        })
        : await this.getVerticesByFilter({ ids: targetVerticesIds });
    const sourceIds = sourceVertices.map((vertex) => vertex.getId());
    const targetIds = targetVertices.map((vertex) => vertex.getId());

    const edges: Array<SimpleGraphEdge> = candidates.filter((e) => {
      return sourceIds.includes(e.sourceId) && targetIds.includes(e.targetId);
    });

    return Promise.resolve(edges);
  }
}
