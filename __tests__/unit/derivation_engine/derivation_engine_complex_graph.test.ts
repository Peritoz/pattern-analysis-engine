import { DerivationEngine, DerivationRule, GraphRepository, SimpleGraphRepository } from "../../../src";
import { init_complex_graph } from "../utils/graphs/init_complex_graph";
import { EdgeScope } from "../../../src/libs/model/graph_repository/enums/edge_scope.enum";
import { graph_edge_builder } from "../utils/graph_edge_builder";
import logger from "../utils/naive_logger";

describe("Derivation engine", () => {
  let complexGraphEngine: DerivationEngine;
  let complexGraph: SimpleGraphRepository | GraphRepository;

  beforeAll(async () => {
    const complexGraphRules = [
      new DerivationRule("(a)[e1]>(b)[e2]>(c)", "(1)[e1](3)"),
      new DerivationRule("(a)[e1]>(b)[e3]>(e)", "(2)[e3](1)"),
      new DerivationRule("()[]>(d)[e4]>(f)", "(3)[e1,e2](1)")
    ];
    // Graph in the form (1:t1,t2)-[et1]->(2:t1)-[et2, et3]->(3:t2,t3)<-[et1]-(4:t3)-[et3]->(5:t2)<-[et2]-(1:t1,t2)
    complexGraph = await init_complex_graph();
    complexGraphEngine = new DerivationEngine(
      complexGraph,
      complexGraphRules,
      graph_edge_builder,
      logger
    );

    await complexGraphEngine.deriveEdges(2);
  });

  describe("Complex graph", () => {
    it("Should derive edges: Case 1", async () => {
      const edgeGroupRule1 = await complexGraph.getEdgesByFilter(
        {
          types: ["a"]
        },
        {
          types: ["e1"],
          scope: EdgeScope.ALL,
          isNegated: false
        },
        {
          types: ["c"]
        }
      );
      expect(edgeGroupRule1).toHaveLength(1);
    });

    it("Should derive edges: Case 2", async () => {
      const edgeGroupRule2 = await complexGraph.getEdgesByFilter(
        {
          types: ["b"]
        },
        {
          types: ["e3"],
          scope: EdgeScope.ALL,
          isNegated: false
        },
        { types: ["a"] }
      );

      expect(edgeGroupRule2).toHaveLength(1);
    });

    it("Should derive edges: Case 3", async () => {
      const edgeGroupRule3 = await complexGraph.getEdgesByFilter(
        {
          types: ["f"]
        },
        {
          types: ["e1", "e2"],
          scope: EdgeScope.ALL,
          isNegated: false
        },
        null
      );

      expect(edgeGroupRule3).toHaveLength(2);
    });

    it("Should return empty array when deriving edges with invalid filter types", async () => {
      const result = await complexGraph.getEdgesByFilter(
        {
          types: ["x"]
        },
        {
          types: ["e1"],
          scope: EdgeScope.ALL,
          isNegated: false
        },
        {
          types: ["c"]
        }
      );

      expect(result).toHaveLength(0);
    });

    it("Should return empty array when deriving edges with invalid scope value", async () => {
      const result = await complexGraph.getEdgesByFilter(
        {
          types: ["a"]
        },
        {
          types: ["e1"],
          scope: "INVALID_SCOPE" as EdgeScope,
          isNegated: false
        },
        {
          types: ["c"]
        }
      );

      expect(result).toHaveLength(0);
    });
  });
});
