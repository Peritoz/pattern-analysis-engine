import {
  SimpleGraphRepository,
  SimpleGraphVertex,
  SimpleGraphEdge,
} from "../../../src";
import { EdgeScope } from "../../../src/libs/model/graph_repository/enums/edge_scope.enum";

const initializeGraph = async (mode: 'empty' | 'vertices_only' | 'full'): Promise<SimpleGraphRepository> => {
  const repository =  new SimpleGraphRepository();

  if(mode === 'empty') return repository;

  await repository.addManyVertices([
    new SimpleGraphVertex("V1", ["t1", "t2"], "1"),
    new SimpleGraphVertex("V2", ["t1"], "2"),
    new SimpleGraphVertex("V3", ["t2", "t3"], "3"),
    new SimpleGraphVertex("V4", ["t3"], "4"),
  ]);

  if(mode === 'full'){
    await repository.addManyEdges([
      new SimpleGraphEdge("1", "2", ["et1", "et2"], "E1"),
      new SimpleGraphEdge("1", "3", ["et2"], "E2"),
      new SimpleGraphEdge("3", "4", ["et3"], "E3"),
      new SimpleGraphEdge("4", "1", ["et2"], "E4"),
    ]);
  }

  return repository;
}

/**
 *  Tests the Simple Graph Repository.
 *
 *  NOTE: Edge id are created by concatenating SOURCE_ID>EDGE_TYPE>TARGET_ID
 */
describe("Simple Graph Repository", () => {
  it("Should add vertices", async () => {
    const repository = await initializeGraph('empty');
    await repository.addVertex(new SimpleGraphVertex("V1", ["t1", "t2"], "1"));
    await repository.addVertex(new SimpleGraphVertex("V2", ["t1"], "2"));

    const vertices = await repository.getAllVertices();

    expect(vertices.length).toBe(2);
  });

  it("Should add many vertices", async () => {
    const repository = await initializeGraph('empty');
    await repository.addManyVertices([
      new SimpleGraphVertex("V3", ["t2", "t3"], "3"),
      new SimpleGraphVertex("V4", ["t3"], "4"),
    ]);

    const vertices = await repository.getAllVertices();

    expect(vertices.length).toBe(2);
  });

  it("Should add edges", async () => {
    const repository = await initializeGraph('vertices_only');
    await repository.addEdge(
      new SimpleGraphEdge("1", "2", ["et1", "et2"], "E1")
    );

    const edges = await repository.getAllEdges();

    expect(edges.length).toBe(1);
  });

  it("Should add many edges", async () => {
    const repository = await initializeGraph('vertices_only');
    await repository.addManyEdges([
      new SimpleGraphEdge("1", "3", ["et2"], "E2"),
      new SimpleGraphEdge("3", "4", ["et3"], "E3"),
    ]);

    const edges = await repository.getAllEdges();

    expect(edges.length).toBe(2);
  });

  it("Should get a vertex", async () => {
    const repository = await initializeGraph('vertices_only');
    const vertex = await repository.getVertex("1");

    expect(vertex).toBeDefined();
    expect(vertex?.name).toBe("V1");
  });

  it("Should confirm that an vertex exists", async () => {
    const repository = await initializeGraph('vertices_only');
    const exists = await repository.exists(
      new SimpleGraphVertex("V1", ["t1", "t2"], "1")
    );

    expect(exists).toBeTruthy();
  });

  it("Should confirm that an vertex does not exists", async () => {
    const repository = await initializeGraph('vertices_only');
    const exists = await repository.exists(
      new SimpleGraphVertex("V100", ["t1"], "100")
    );

    expect(exists).toBeFalsy();
  });

  it("Should get vertices", async () => {
    const repository = await initializeGraph('vertices_only');
    const vertices = await repository.getVertices(["2", "3"]);

    expect(vertices[0]).toBeDefined();
    expect(vertices[0].name).toBe("V2");
    expect(vertices[1]).toBeDefined();
    expect(vertices[1].name).toBe("V3");
  });

  describe("Should filter vertices", () => {
    it("Should filter by type", async () => {
      const repository = await initializeGraph('vertices_only');
      const vertices = await repository.getVerticesByFilter({
        types: ["t1", "t2"],
      });
      const ids = vertices.map((v) => v.getId());

      expect(vertices.length).toBe(3);
      expect(ids).toEqual(["1", "2", "3"]);
    });

    it("Should filter by name", async () => {
      const repository = await initializeGraph('vertices_only');
      const vertices = await repository.getVerticesByFilter({
        searchTerm: "v1",
      });
      const ids = vertices.map((v) => v.getId());

      expect(vertices.length).toBe(1);
      expect(ids).toEqual(["1"]);
    });

    it("Should filter by type and name", async () => {
      const repository = await initializeGraph('vertices_only');
      const vertices = await repository.getVerticesByFilter({
        searchTerm: "v1",
        types: ["t3"],
      });

      expect(vertices.length).toBe(0);
    });

    it("Should filter by ids", async () => {
      const repository = await initializeGraph('vertices_only');
      const vertices = await repository.getVerticesByFilter({
        ids: ["1", "3"],
      });
      const ids = vertices.map((v) => v.getId());

      expect(vertices.length).toBe(2);
      expect(ids).toEqual(["1", "3"]);
    });

    it("Should return all vertices (empty filter with properties)", async () => {
      const repository = await initializeGraph('vertices_only');
      const vertices = await repository.getVerticesByFilter({
        types: [],
        searchTerm: "",
      });

      expect(vertices.length).toBe(4);
    });

    it("Should return all vertices (empty filter without properties)", async () => {
      const repository = await initializeGraph('vertices_only');
      const vertices = await repository.getVerticesByFilter({});

      expect(vertices.length).toBe(4);
    });
  });

  it("Should get an edge", async () => {
    const repository = await initializeGraph('full');
    const edge = await repository.getEdge("E1");

    expect(edge).toBeDefined();
    expect(edge?.sourceId).toBe("1");
    expect(edge?.targetId).toBe("2");
    expect(edge?.types).toEqual(["et1", "et2"]);
  });

  it("Should confirm that an edge exists", async () => {
    const repository = await initializeGraph('full');
    const exists = await repository.exists(
      new SimpleGraphEdge("1", "3", ["et2"], "E2")
    );

    expect(exists).toBeTruthy();
  });

  it("Should confirm that an edge does not exists", async () => {
    const repository = await initializeGraph('full');
    const exists = await repository.exists(
      new SimpleGraphEdge("10", "1", ["et1"], "E10")
    );

    expect(exists).toBeFalsy();
  });

  it("Should get edges", async () => {
    const repository = await initializeGraph('full');
    const [firstEdge, secondEdge] = await repository.getEdges(["E1", "E2"]);

    expect(firstEdge).toBeDefined();
    expect(firstEdge.sourceId).toBe("1");
    expect(firstEdge.targetId).toBe("2");
    expect(firstEdge.types).toEqual(expect.arrayContaining(["et1", "et2"]));

    expect(secondEdge).toBeDefined();
    expect(secondEdge.sourceId).toBe("1");
    expect(secondEdge.targetId).toBe("3");
    expect(secondEdge.types).toEqual(expect.arrayContaining(["et2"]));
  });

  describe("Should filter edges", () => {
    it("Should filter by type", async () => {
      const repository = await initializeGraph('full');
      const edges = await repository.getEdgesByFilter(
        null,
        {
          types: ["et2"],
          scope: EdgeScope.NON_DERIVED_ONLY,
          isNegated: false,
        },
        null
      );

      expect(edges.length).toBe(3);
    });
  });

  it("Should remove an edge", async () => {
    const repository = await initializeGraph('full');
    const edgeId = "1>et1>2";
    const edgesCountBefore = (await repository.getAllEdges()).length;
    await repository.removeEdge(edgeId);

    const edges = await repository.getAllEdges();
    const adjList = repository.outboundAdjListMap;

    expect(edges).toBeDefined();
    expect(edges.length).toBe(edgesCountBefore - 1);
    expect(edges.findIndex((e) => e.getId() === edgeId)).toBe(-1);
    expect(adjList?.get("1")?.findIndex((e) => e === "et1>2")).toBe(-1);
  });

  it("Should remove all vertices", async () => {
    const repository = await initializeGraph('full');
    const verticesBefore = await repository.getAllVertices();

    for (let i = 0; i < verticesBefore.length; i++) {
      await repository.removeVertex(verticesBefore[i].getId());
    }

    const verticesAfter = await repository.getAllVertices();
    const edges = await repository.getAllEdges();
    const edgeMapEntries = Array.from(repository.edgesMap.entries());
    const verticesMapEntries = Array.from(repository.verticesMap.entries());
    const typeMapEntries = Array.from(repository.verticesMapByType.entries());

    expect(verticesAfter).toBeDefined();
    expect(verticesAfter.length).toBe(0);
    expect(edges.length).toBe(0);
    expect(edgeMapEntries.length).toBe(0);
    expect(verticesMapEntries.length).toBe(0);

    for (let i = 0; i < typeMapEntries.length; i++) {
      const [key, value] = typeMapEntries[i];
      expect(value?.length).toBe(0);
    }
  });
});
