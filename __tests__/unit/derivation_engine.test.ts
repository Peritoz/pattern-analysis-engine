import { DerivationEngine, DerivationRule, SimpleGraphEdge } from "../../src";
import { initBasicGraph } from "./utils/graphs/initBasicGraph";
import { initComplexGraph } from "./utils/graphs/initComplexGraph";
import { EdgeScope } from "../../src/libs/model/graph_repository/enums/edge_scope.enum";
import { graphEdgeBuilder } from "./utils/graphEdgeBuilder";

describe("Derivation engine", () => {
  let basicGraphEngine;
  let basicGraph;
  let complexGraphEngine;
  let complexGraph;

  beforeAll(async () => {
    const basicGraphRules = [
      new DerivationRule("()[et1]>()[et2,et3]>()", "(1)[et1](3)"),
      new DerivationRule("(t1)[et2,et3]>()<[et1](t3)", "(2)[et3](1)"),
      new DerivationRule("()<[](t3)[et3]>(t2)", "(3)[et1,et2](1)"),
    ];
    const complexGraphRules = [
      new DerivationRule("(a)[e1]>(b)[e2]>(c)", "(1)[e1](3)"),
      new DerivationRule("(a)[e1]>(b)[e3]>(e)", "(2)[e3](1)"),
      new DerivationRule("()[]>(d)[e4]>(f)", "(3)[e1,e2](1)"),
    ];
    // Graph in the form (1:t1,t2)-[et1]->(2:t1)-[et2, et3]->(3:t2,t3)<-[et1]-(4:t3)-[et3]->(5:t2)<-[et2]-(1:t1,t2)
    basicGraph = await initBasicGraph();
    /**
     * (1:a)-[e1]->(2:b)-[e2]->(3:c)-[e3]->(4:d)
     * (2:b)-[e3]->(5:e)-[e1]->(4:d)
     * (4:d)-[e4]->(6:f)
     */
    complexGraph = await initComplexGraph();
    basicGraphEngine = new DerivationEngine(
      basicGraph,
      basicGraphRules,
      graphEdgeBuilder
    );
    complexGraphEngine = new DerivationEngine(
      complexGraph,
      complexGraphRules,
      graphEdgeBuilder
    );

    await basicGraphEngine.deriveEdges(1);
    await complexGraphEngine.deriveEdges(2);
  });

  describe("Constructor", () => {
    it("Should throw error: Invalid edge builder (Void function)", async () => {
      expect(() => {
        new DerivationEngine(basicGraph, [], () => {});
      }).toThrowError("Invalid edge builder");
    });

    it("Should throw error: Invalid edge builder (Returning invalid format)", async () => {
      expect(() => {
        new DerivationEngine(
          basicGraph,
          [],
          (sourceId, targetId, types, externalId, derivationPath) => {
            return { source: sourceId, target: targetId, types: types };
          }
        );
      }).toThrowError("Invalid edge builder");
    });

    it("Should throw error: Invalid edge builder (Returning invalid partial edge)", async () => {
      expect(() => {
        new DerivationEngine(
          basicGraph,
          [],
          (sourceId, targetId, types, externalId, derivationPath) => {
            return { sourceId, targetId, externalId, derivationPath };
          }
        );
      }).toThrowError("Invalid edge builder");
    });
  });

  describe("Basic graph", () => {
    it("Should derive edges: Case 1", async () => {
      const edgeGroupRule1 = await basicGraph.getEdgesByFilter(
        {
          types: ["t1", "t2"],
        },
        {
          types: ["et1"],
          scope: EdgeScope.ALL,
          isNegated: false,
        },
        {
          types: ["t2", "t3"],
        }
      );
      expect(edgeGroupRule1.length).toBe(2);
    });

    it("Should derive edges: Case 2", async () => {
      const edgeGroupRule2 = await basicGraph.getEdgesByFilter(
        {
          types: ["t2", "t3"],
        },
        {
          types: ["et3"],
          scope: EdgeScope.ALL,
          isNegated: false,
        },
        { types: ["t1"] }
      );

      expect(edgeGroupRule2.length).toBe(1);
    });

    it("Should derive edges: Case 3", async () => {
      const edgeGroupRule3 = await basicGraph.getEdgesByFilter(
        {
          types: ["t2"],
        },
        {
          types: ["et1", "et2"],
          scope: EdgeScope.ALL,
          isNegated: false,
        },
        { types: ["t2", "t3"] }
      );

      expect(edgeGroupRule3.length).toBe(3);
    });
  });

  describe("Complex graph", () => {
    it("Should derive edges: Case 1", async () => {
      const edgeGroupRule1 = await complexGraph.getEdgesByFilter(
        {
          types: ["a"],
        },
        {
          types: ["e1"],
          scope: EdgeScope.ALL,
          isNegated: false,
        },
        {
          types: ["c"],
        }
      );
      expect(edgeGroupRule1.length).toBe(1);
    });

    it("Should derive edges: Case 2", async () => {
      const edgeGroupRule2 = await complexGraph.getEdgesByFilter(
        {
          types: ["b"],
        },
        {
          types: ["e3"],
          scope: EdgeScope.ALL,
          isNegated: false,
        },
        { types: ["a"] }
      );

      expect(edgeGroupRule2.length).toBe(1);
    });

    it("Should derive edges: Case 3", async () => {
      const edgeGroupRule3 = await complexGraph.getEdgesByFilter(
        {
          types: ["f"],
        },
        {
          types: ["e1", "e2"],
          scope: EdgeScope.ALL,
          isNegated: false,
        },
        null
      );

      expect(edgeGroupRule3.length).toBe(2);
    });
  });
});
