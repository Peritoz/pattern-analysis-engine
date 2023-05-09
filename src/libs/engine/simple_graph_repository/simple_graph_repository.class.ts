import {
  GraphRepository,
  PartialEdgeFilter,
  PartialVertexFilter,
} from "@libs/model/graph_repository/graph_repository.interface";
import { EdgeScope } from "@libs/model/graph_repository/enums/edge_scope.enum";
import { SimpleGraphEdge } from "@libs/engine/simple_graph_repository/simple_graph_edge";
import { SimpleGraphVertex } from "@libs/engine/simple_graph_repository/simple_graph_vertex";

export class SimpleGraphRepository implements GraphRepository {
  protected _outboundAdjListMap: Map<string, Array<string>>;
  protected _inboundAdjListMap: Map<string, Array<string>>;
  protected _verticesArray: Array<SimpleGraphVertex>;
  protected _verticesMap: Map<string, SimpleGraphVertex>;
  protected _verticesMapByType: Map<string, Array<string>>;
  protected _edgesMap: Map<string, SimpleGraphEdge>;
  protected _nonDerivedEdgesMap: Map<string, Array<SimpleGraphEdge>>;
  protected _derivedEdgesMap: Map<string, Array<SimpleGraphEdge>>;

  constructor() {
    this._outboundAdjListMap = new Map<string, Array<string>>();
    this._inboundAdjListMap = new Map<string, Array<string>>();
    this._verticesArray = [];
    this._verticesMap = new Map<string, SimpleGraphVertex>();
    this._verticesMapByType = new Map<string, Array<string>>();
    this._edgesMap = new Map<string, SimpleGraphEdge>();
    this._nonDerivedEdgesMap = new Map<string, Array<SimpleGraphEdge>>();
    this._derivedEdgesMap = new Map<string, Array<SimpleGraphEdge>>();

    this._nonDerivedEdgesMap.set("_-_-_", []);
    this._derivedEdgesMap.set("_-_-_", []);
  }

  async addVertex(vertex: SimpleGraphVertex): Promise<void> {
    this._outboundAdjListMap.set(vertex.getId(), []);
    this._inboundAdjListMap.set(vertex.getId(), []);
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

  get outboundAdjListMap(): Map<string, Array<string>> {
    return this._outboundAdjListMap;
  }

  get inboundAdjListMap(): Map<string, Array<string>> {
    return this._inboundAdjListMap;
  }

  get verticesMap(): Map<string, SimpleGraphVertex> {
    return this._verticesMap;
  }

  get verticesMapByType(): Map<string, Array<string>> {
    return this._verticesMapByType;
  }

  get edgesMap(): Map<string, SimpleGraphEdge> {
    return this._edgesMap;
  }

  async addManyVertices(vertices: Array<SimpleGraphVertex>): Promise<void> {
    if (vertices && Array.isArray(vertices)) {
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
      this._outboundAdjListMap.delete(vertexId);
      this._inboundAdjListMap.delete(vertexId);

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
    const edgeId = edge.getId();
    const outboundAdjListElements = this._outboundAdjListMap.get(edge.sourceId);
    const inboundAdjListElements = this._inboundAdjListMap.get(edge.targetId);
    let newEdgeAdded: boolean = true;

    // Adding for outbound navigation
    if (Array.isArray(outboundAdjListElements)) {
      if (!outboundAdjListElements.includes(edgeId)) {
        outboundAdjListElements.push(edgeId);
      } else {
        newEdgeAdded = false;
      }
    } else {
      this._outboundAdjListMap.set(edge.sourceId, [edgeId]);
    }

    // Adding for inbound navigation
    if (Array.isArray(inboundAdjListElements)) {
      if (!inboundAdjListElements.includes(edgeId)) {
        inboundAdjListElements.push(edgeId);
      }
    } else {
      this._inboundAdjListMap.set(edge.targetId, [edgeId]);
    }

    if (newEdgeAdded) {
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
      const map: Map<string, SimpleGraphEdge[]> = isDerived
        ? this._derivedEdgesMap
        : this._nonDerivedEdgesMap;

      const sourceVertex: SimpleGraphVertex | undefined = await this.getVertex(
        edge.sourceId
      );
      const targetVertex: SimpleGraphVertex | undefined = await this.getVertex(
        edge.targetId
      );
      const sourceTypes: Array<string> = sourceVertex ? sourceVertex.types : [];
      const targetTypes: Array<string> = targetVertex ? targetVertex.types : [];

      // Mapping the base case: Source and Target filters are not available
      this.mapIdToManyValues(map, `_-${type}-_`, edge);

      // Only valid edges are mapped. A valid edge is an edge with valid source and target vertices
      if (sourceVertex && targetVertex) {
        // Mapping for full filter case
        for (let j = 0; j < sourceTypes.length; j++) {
          for (let k = 0; k < targetTypes.length; k++) {
            this.mapIdToManyValues(
              map,
              `${sourceTypes[j]}-${type}-${targetTypes[k]}`,
              edge
            );

            // Mapping case: edge filter not available
            this.mapIdToManyValues(
              map,
              `${sourceTypes[j]}-_-${targetTypes[k]}`,
              edge
            );
          }
        }

        // Mapping for empty Target or Edge filters
        for (let j = 0; j < sourceTypes.length; j++) {
          this.mapIdToManyValues(map, `${sourceTypes[j]}-${type}-_`, edge);
          this.mapIdToManyValues(map, `${sourceTypes[j]}-_-_`, edge);
        }

        // Mapping for empty Source or Edge filters
        for (let j = 0; j < targetTypes.length; j++) {
          this.mapIdToManyValues(map, `_-${type}-${targetTypes[j]}`, edge);
          this.mapIdToManyValues(map, `_-_-${targetTypes[j]}`, edge);
        }

        // Mapping the exception case (no filter available)
        const all: Array<SimpleGraphEdge> | undefined = map.get("_-_-_");
        all?.push(edge);
      }
    }
  }

  private mapIdToManyValues(
    map: Map<string, SimpleGraphEdge[]>,
    id: string,
    value: any
  ) {
    const entry: Array<any> | undefined = map.get(id);

    if (entry) {
      entry.push(value);
    } else {
      map.set(id, [value]);
    }
  }

  async addManyEdges(edges: Array<SimpleGraphEdge>): Promise<void> {
    if (edges && Array.isArray(edges)) {
      for (let i = 0; i < edges.length; i++) {
        await this.addEdge(edges[i]);
      }
    }
  }

  // TODO: Remove from maps
  async removeEdge(edgePathId: string): Promise<void> {
    const idParts = edgePathId.split(">");

    if (idParts.length === 3) {
      const [sourceId, edgeTypes, targetId] = idParts;
      const edge = this._edgesMap.get(edgePathId);

      // Removing from Edges Map
      this._edgesMap.delete(edgePathId);

      // Removing from outbound adjacency list
      const outboundAdjElement = `${edgeTypes}>${targetId}`;

      const outboundAdjElements = this._outboundAdjListMap.get(sourceId);

      if (Array.isArray(outboundAdjElements)) {
        this._outboundAdjListMap.set(
          sourceId,
          outboundAdjElements.filter((e) => e !== outboundAdjElement)
        );
      }

      // Removing from inbound adjacency list
      const inboundAdjElement = `${sourceId}>${edgeTypes}`;

      const inboundAdjElements = this._inboundAdjListMap.get(targetId);

      if (Array.isArray(inboundAdjElements)) {
        this._inboundAdjListMap.set(
          targetId,
          inboundAdjElements.filter((e) => e !== inboundAdjElement)
        );
      }
    } else {
      throw new Error(`Invalid edge id: ${edgePathId}`);
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

  /**
   * Gets edges based on a given pathId
   * @param edges A cumulative list of edges
   * @param pathId An id which is formed by the concatenating the Source Type, the Edge Type and the Target Type
   * @param scope Scope of the edges. Indicates the category of edges that should be considered: ALL, NON_DERIVED_ONLY, DERIVED_ONLY
   * @private
   */
  private filterEdges(
    edges: Array<SimpleGraphEdge>,
    pathId: string,
    scope: EdgeScope = EdgeScope.ALL
  ) {
    let candidates = edges;

    if (scope === EdgeScope.NON_DERIVED_ONLY || scope === EdgeScope.ALL) {
      const nonDerivedCandidates = this._nonDerivedEdgesMap.get(pathId);

      if (nonDerivedCandidates) {
        candidates = candidates.concat(nonDerivedCandidates);
      }
    }

    if (scope === EdgeScope.DERIVED_ONLY || scope === EdgeScope.ALL) {
      const derivedCandidates = this._derivedEdgesMap.get(pathId);

      if (derivedCandidates) {
        candidates = candidates.concat(derivedCandidates);
      }
    }

    return candidates;
  }

  private getPathIds(
    sourceFilter: PartialVertexFilter | null,
    edgeFilter: PartialEdgeFilter,
    targetFilter: PartialVertexFilter | null
  ) {
    const thereIsSourceTypeFilter =
      sourceFilter &&
      Array.isArray(sourceFilter.types) &&
      sourceFilter.types.length > 0;
    const thereIsEdgeTypeFilter =
      edgeFilter &&
      Array.isArray(edgeFilter.types) &&
      edgeFilter.types.length > 0;
    const thereIsTargetTypeFilter =
      targetFilter &&
      Array.isArray(targetFilter.types) &&
      targetFilter.types.length > 0;

    // Generating path ids
    const pathFilters: Array<string> = [];
    const sourceTypes = thereIsSourceTypeFilter ? sourceFilter.types! : ["_"];
    const edgeTypes = thereIsEdgeTypeFilter ? edgeFilter?.types! : ["_"];
    const targetTypes = thereIsTargetTypeFilter ? targetFilter?.types! : ["_"];

    for (let i = 0; i < sourceTypes.length; i++) {
      for (let j = 0; j < edgeTypes.length; j++) {
        for (let k = 0; k < targetTypes.length; k++) {
          pathFilters.push(
            `${sourceTypes[i]}-${edgeTypes[j]}-${targetTypes[k]}`
          );
        }
      }
    }
    return pathFilters;
  }

  async getEdgesByFilter(
    sourceFilter: PartialVertexFilter | null,
    edgeFilter: PartialEdgeFilter,
    targetFilter: PartialVertexFilter | null
  ): Promise<Array<SimpleGraphEdge>> {
    let candidates: Array<SimpleGraphEdge> = [];
    const thereIsSourceFilter =
      sourceFilter !== null && Object.entries(sourceFilter).length > 0;
    const thereIsTargetFilter =
      targetFilter !== null && Object.entries(targetFilter).length > 0;
    const sourceFilterHasMemory =
      sourceFilter &&
      Array.isArray(sourceFilter?.ids) &&
      sourceFilter?.ids.length > 0;
    const targetFilterHasMemory =
      targetFilter &&
      Array.isArray(targetFilter?.ids) &&
      targetFilter?.ids.length > 0;
    const pathFilters = this.getPathIds(sourceFilter, edgeFilter, targetFilter);

    // Looking up edges based on scope and types
    if (sourceFilterHasMemory || targetFilterHasMemory) {
      // TODO: Consider cumulatively reapplying id filter in sequence, one for source ids and another for target ids
      if (sourceFilterHasMemory) {
        candidates = candidates.concat(
          this.filterEdgesByVertexIds(
            this._outboundAdjListMap,
            sourceFilter?.ids!
          )
        );
      } else {
        candidates = candidates.concat(
          this.filterEdgesByVertexIds(
            this._inboundAdjListMap,
            targetFilter?.ids!
          )
        );
      }

      // Filtering selected edges by edge types
      if (
        edgeFilter &&
        Array.isArray(edgeFilter.types) &&
        edgeFilter.types.length > 0
      ) {
        candidates = candidates.filter((candidate) => {
          return candidate.types.some((type) =>
            edgeFilter.types?.includes(type)
          );
        });
      }
    } else {
      for (let i = 0; i < pathFilters.length; i++) {
        candidates = this.filterEdges(
          candidates,
          pathFilters[i],
          edgeFilter.scope
        );
      }
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
    let sourceVerticesIds = [...new Set(candidates.map((e) => e.sourceId))];
    let targetVerticesIds = [...new Set(candidates.map((e) => e.targetId))];

    // Looking up vertices to apply the name filter
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

  private filterEdgesByVertexIds(
    map: Map<string, Array<string>>,
    ids: Array<string>
  ): Array<SimpleGraphEdge> {
    const candidates: Array<SimpleGraphEdge> = [];

    for (let i = 0; i < ids.length; i++) {
      const vertexId = ids[i];

      const adjList: Array<string> | undefined = map.get(vertexId);

      if (adjList) {
        for (let j = 0; j < adjList.length; j++) {
          const edgeId = adjList[j];
          const candidate: SimpleGraphEdge | undefined =
            this._edgesMap.get(edgeId);

          if (candidate) {
            candidates.push(candidate);
          }
        }
      }
    }

    return candidates;
  }
}
