import {SimpleGraphRepository} from "../../src/libs/engine/simple_graph_repository/simple_graph_repository.class";
import {EdgeScope} from "../../src/libs/model/graph_repository/enums/edge_scope.enum";

/**
 *  Tests the Simple Graph Repository.
 *
 *  NOTE: Edge id are created by concatenating SOURCE_ID>EDGE_TYPE>TARGET_ID
 */

describe("Simple Graph Repository", () => {
  let repository;

  beforeAll(() => {
    repository = new SimpleGraphRepository();
  });

  it("Should add vertices", async () => {
    await repository.addVertex({
      id: "1",
      name: "V1",
      types: ["t1", "t2"],
    });
    await repository.addVertex({
      id: "2",
      name: "V2",
      types: ["t1"],
    });
    await repository.addVertex({
      id: "3",
      name: "V3",
      types: ["t2", "t3"],
    });
    await repository.addVertex({
      id: "4",
      name: "V4",
      types: ["t3"],
    });

    const vertices = await repository.getAllVertices();

    expect(vertices.length).toBe(4);
  });

  it("Should add edges", async () => {
    await repository.addEdge({
      id: "E1",
      sourceId: "1",
      targetId: "2",
      types: ["et1", "et2"]
    });
    await repository.addEdge({
      id: "E2",
      sourceId: "1",
      targetId: "3",
      types: ["et2"]
    });
    await repository.addEdge({
      id: "E3",
      sourceId: "3",
      targetId: "4",
      types: ["et3"]
    });

    const edges = await repository.getAllEdges();

    expect(edges.length).toBe(3);
  });

  it("Should get a vertex", async () => {
    const vertex = await repository.getVertex("1");

    expect(vertex).toBeDefined();
    expect(vertex.name).toBe("V1");
  });

  it("Should get vertices", async () => {
    const vertices = await repository.getVertices(["2", "3"]);

    expect(vertices[0]).toBeDefined();
    expect(vertices[0].name).toBe("V2");
    expect(vertices[1]).toBeDefined();
    expect(vertices[1].name).toBe("V3");
  });

  describe("Should filter vertices", () => {
    it("Should filter by type", async () => {
      const vertices = await repository.getVerticesByFilter({
        types: ["t1", "t2"],
      });
      const ids = vertices.map((v) => v.id);

      expect(vertices.length).toBe(3);
      expect(ids).toEqual(["1", "2", "3"]);
    });

    it("Should filter by name", async () => {
      const vertices = await repository.getVerticesByFilter({
        searchTerm: "v1",
      });
      const ids = vertices.map((v) => v.id);

      expect(vertices.length).toBe(1);
      expect(ids).toEqual(["1"]);
    });

    it("Should filter by type and name", async () => {
      const vertices = await repository.getVerticesByFilter({
        searchTerm: "v1",
        types: ["t3"],
      });

      expect(vertices.length).toBe(0);
    });

    it("Should filter by ids", async () => {
      const vertices = await repository.getVerticesByFilter({
        ids: ["1", "3"],
      });
      const ids = vertices.map((v) => v.id);

      expect(vertices.length).toBe(2);
      expect(ids).toEqual(["1", "3"]);
    });

    it("Should return all vertices (empty filter with properties)", async () => {
      const vertices = await repository.getVerticesByFilter({
        types: [],
        searchTerm: "",
      });

      expect(vertices.length).toBe(4);
    });

    it("Should return all vertices (empty filter without properties)", async () => {
      const vertices = await repository.getVerticesByFilter({});

      expect(vertices.length).toBe(4);
    });
  });

  it("Should get an edge", async () => {
    const edge = await repository.getEdge("1>et1,et2>2");

    expect(edge).toBeDefined();
    expect(edge.sourceId).toBe("1");
    expect(edge.targetId).toBe("2");
    expect(edge.types).toEqual(["et1", "et2"]);
  });

  it("Should get edges", async () => {
    const edges = await repository.getEdges(["1>et1,et2>2", "1>et2>3"]);

    expect(edges[0]).toBeDefined();
    expect(edges[0].sourceId).toBe("1");
    expect(edges[0].targetId).toBe("2");
    expect(edges[0].types).toEqual(expect.arrayContaining(["et1", "et2"]));

    expect(edges[1]).toBeDefined();
    expect(edges[1].sourceId).toBe("1");
    expect(edges[1].targetId).toBe("3");
    expect(edges[1].types).toEqual(expect.arrayContaining(["et2"]));
  });

  describe("Should filter edges", () => {
    it("Should filter by type", async () => {
      const edges = await repository.getEdgesByFilter(
        null,
        {
          types: ["et2"],
          scope: EdgeScope.NON_DERIVED_ONLY,
          isNegated: false,
        },
        null
      );

      expect(edges.length).toBe(2);
    });
  });

  it("Should remove an edge", async () => {
    const edgeId = "1>et1>2";
    await repository.removeEdge(edgeId);

    const edges = await repository.getAllEdges();
    const adjList = repository._adjacencyListMap;

    expect(edges).toBeDefined();
    expect(edges.length).toBe(3);
    expect(edges.findIndex((e) => e.id === edgeId)).toBe(-1);
    expect(adjList.get("1").findIndex((e) => e === "et1>2")).toBe(-1);
  });

  it("Should remove a vertex", async () => {
    const vertexId = "1";
    await repository.removeVertex(vertexId);

    const vertices = await repository.getAllVertices();
    const edges = await repository.getAllEdges();
    const adjList = repository._adjacencyListMap;
    const verticesMap = repository._verticesMap;
    const typeMap = repository._verticesMapByType;
    const inBoundEdges = edges.filter((e) => e.targetId === vertexId);
    const outBoundEdges = edges.filter((e) => e.sourceId === vertexId);
    const consolidatedAdjList: Array<Array<string>> = Array.from(
      adjList.values()
    );

    expect(vertices).toBeDefined();
    expect(vertices.length).toBe(3);
    expect(vertices.findIndex((e) => e.id === vertexId)).toBe(-1);
    expect(adjList.get(vertexId)).toBeUndefined();
    expect(verticesMap.get(vertexId)).toBeUndefined();
    expect(typeMap.get("t1").findIndex((e) => e === vertexId)).toBe(-1);
    expect(inBoundEdges.length).toBe(0);
    expect(outBoundEdges.length).toBe(0);
    expect(
      consolidatedAdjList.findIndex((e) =>
        e.some((edge) => edge.includes(`>${vertexId}`))
      )
    ).toBe(-1);
  });
});
