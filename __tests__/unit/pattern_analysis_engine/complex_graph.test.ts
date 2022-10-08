import {
  DerivationEngine,
  DerivationRule,
  PatternAnalysisEngine,
} from "../../../src";
import { init_complex_graph } from "../utils/graphs/init_complex_graph";
import { graph_edge_builder } from "../utils/graph_edge_builder";

describe("Pattern analysis engine", () => {
  let complexGraphDerivationEngine;
  let complexGraph;
  let complexEngine;

  beforeAll(async () => {
    const complexGraphRules = [
      new DerivationRule("(a)[e1]>(b)[e2]>(c)", "(1)[e1](3)"),
      new DerivationRule("(a)[e1]>(b)[e3]>(e)", "(2)[e3](1)"),
      new DerivationRule("()[]>(d)[e4]>(f)", "(3)[e1,e2](1)"),
    ];

    complexGraph = await init_complex_graph();
    complexGraphDerivationEngine = new DerivationEngine(
      complexGraph,
      complexGraphRules,
      graph_edge_builder
    );
    await complexGraphDerivationEngine.deriveEdges(2);
    complexEngine = new PatternAnalysisEngine(complexGraph);
  });

  describe("Complex graph", () => {
    it("?(a)->(*)", async () => {
      const result = await complexEngine.run("?(a)->(*)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it("?(a)-[e1]->(*)", async () => {
      const result = await complexEngine.run("?(a)-[e1]->(*)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it("?(e)-[e1]->(*)", async () => {
      const result = await complexEngine.run("?(e)-[e1]->(*)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it("?(a or e)-[e1]->(*)", async () => {
      const result = await complexEngine.run("?(a or e)-[e1]->(*)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });

    it("?(a or e)-[e1]->(b)", async () => {
      const result = await complexEngine.run("?(a or e)-[e1]->(b)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it("?(a or e)-[e1]->(b or d)", async () => {
      const result = await complexEngine.run("?(a or e)-[e1]->(b or d)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });

    it("?(a)->(*)-[e2]->(c)", async () => {
      const result = await complexEngine.run("?(a)->(*)-[e2]->(c)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it("?(b)->(*)->(d)", async () => {
      const result = await complexEngine.run("?(b)->(*)->(d)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });

    it("?(b)->(c or e)->(d)", async () => {
      const result = await complexEngine.run("?(b)->(c or e)->(d)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });

    it("?(b)->(*)->(d or e)", async () => {
      const result = await complexEngine.run("?(b)->(*)->(d or e)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });

    it("?(c or e)<-(b)", async () => {
      const result = await complexEngine.run("?(c or e)<-(b)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });

    it("?(c or e)<-[e2]-(b)", async () => {
      const result = await complexEngine.run("?(c or e)<-[e2]-(b)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it("?(c)<-(b)", async () => {
      const result = await complexEngine.run("?(c)<-(b)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it("?(c)<-[e2]-(b)", async () => {
      const result = await complexEngine.run("?(c)<-[e2]-(b)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it("?(c)<-[e3]-(b)", async () => {
      const result = await complexEngine.run("?(c)<-[e3]-(b)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });

    it("?(e)<-(b)", async () => {
      const result = await complexEngine.run("?(e)<-(b)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it("?(e)<-[e3]-(b)", async () => {
      const result = await complexEngine.run("?(e)<-[e3]-(b)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it("?(b)=[e3]=>(*)", async () => {
      const result = await complexEngine.run("?(b)=[e3]=>(*)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });

    it("?(b or c)=[e3]=>(*)", async () => {
      const result = await complexEngine.run("?(b or c)=[e3]=>(*)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(3);
    });

    it("?(b or c)=[e3]=>(d or a)", async () => {
      const result = await complexEngine.run("?(b or c)=[e3]=>(d or a)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });

    it("?(b)=[e3]=>(d or a)", async () => {
      const result = await complexEngine.run("?(b)=[e3]=>(d or a)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it("?(b)=[e2]=>(c or e)->(*)", async () => {
      const result = await complexEngine.run("?(b)=[e2]=>(c or e)->(*)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it("?(c)=[e3]=>(*)", async () => {
      const result = await complexEngine.run("?(c)=[e3]=>(*)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it("?(f)=[e1]=>(*)", async () => {
      const result = await complexEngine.run("?(f)=[e1]=>(*)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });
  });
});
