import { DerivationEngine, DerivationRule } from "../../../src";
import { initBasicGraph } from "../utils/graphs/initBasicGraph";
import { EdgeScope } from "../../../src/libs/model/graph_repository/enums/edge_scope.enum";
import { graphEdgeBuilder } from "../utils/graphEdgeBuilder";

describe("Derivation engine", () => {
  let basicGraphEngine;
  let basicGraph;

  beforeAll(async () => {
    const basicGraphRules = [
      new DerivationRule("()[et1]>()[et2,et3]>()", "(1)[et1](3)"),
      new DerivationRule("(t1)[et2,et3]>()<[et1](t3)", "(2)[et3](1)"),
      new DerivationRule("()<[](t3)[et3]>(t2)", "(3)[et1,et2](1)"),
    ];


    basicGraph = await initBasicGraph();
    basicGraphEngine = new DerivationEngine(
      basicGraph,
      basicGraphRules,
      graphEdgeBuilder
    );

    await basicGraphEngine.deriveEdges(1);
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
});
