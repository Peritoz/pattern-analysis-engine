import {DerivationEngine, DerivationRule, PatternAnalysisEngine} from "../../src";
import { initBasicGraph } from "./utils/graphs/initBasicGraph";
import { initComplexGraph } from "./utils/graphs/initComplexGraph";
import {initLongPathsGraph} from "./utils/graphs/initLongPathsGraph";

describe("Pattern analysis engine", () => {
  let basicGraphDerivationEngine;
  let basicGraph;
  let basicEngine;
  let longPathsGraphDerivationEngine;
  let longPathsGraph;
  let longPathsEngine;
  let complexGraphDerivationEngine;
  let complexGraph;
  let complexEngine;

  beforeAll(async () => {
    const basicGraphRules = [
      new DerivationRule("()[et1]>()[et2,et3]>()", "(1)[et1](3)"),
      new DerivationRule("(t1)[et2,et3]>()<[et1](t3)", "(2)[et3](1)"),
      new DerivationRule("()<[](t3)[et3]>(t2)", "(3)[et1,et2](1)"),
    ];
    const longPathsGraphRules = [
      new DerivationRule("()[et1]>()[et2]>()", "(1)[et2](3)"),
      new DerivationRule("()[et2]>()<[et5]()", "(3)[et5](1)"),
      new DerivationRule("()[et2]>()[et3]>()", "(1)[et3](3)"),
      new DerivationRule("()[et3]>()<[et4]()", "(3)[et4](1)"),
      new DerivationRule("()[et2]>()<[et4]()", "(1)[et1](3)"),
    ];
    const complexGraphRules = [
      new DerivationRule("(a)[e1]>(b)[e2]>(c)", "(1)[e1](3)"),
      new DerivationRule("(a)[e1]>(b)[e3]>(e)", "(2)[e3](1)"),
      new DerivationRule("()[]>(d)[e4]>(f)", "(3)[e1,e2](1)"),
    ];

    basicGraph = await initBasicGraph();
    basicGraphDerivationEngine = new DerivationEngine(basicGraph, basicGraphRules);
    await basicGraphDerivationEngine.deriveEdges(1);
    basicEngine = new PatternAnalysisEngine(basicGraph);

    longPathsGraph = await initLongPathsGraph();
    longPathsGraphDerivationEngine = new DerivationEngine(longPathsGraph, longPathsGraphRules);
    await longPathsGraphDerivationEngine.deriveEdges(3);
    longPathsEngine = new PatternAnalysisEngine(longPathsGraph);

    complexGraph = await initComplexGraph();
    complexGraphDerivationEngine = new DerivationEngine(complexGraph, complexGraphRules);
    await complexGraphDerivationEngine.deriveEdges(2);
    complexEngine = new PatternAnalysisEngine(complexGraph);
  });

  describe("Basic graph", () => {
    it("?(t1)", async () => {
      const result = await basicEngine.run("?(t1)");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("?(t1 or t3)", async () => {
      const result = await basicEngine.run("?(t1 or t3)");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("?('1')", async () => {
      const result = await basicEngine.run("?('1')");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("?('1':t1)", async () => {
      const result = await basicEngine.run("?('1':t1)");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("?(t1)->(*)", async () => {
      const result = await basicEngine.run("?(t1)->(*)");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("?(t1)-[et2]->(*)", async () => {
      const result = await basicEngine.run("?(t1)-[et2]->(*)");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("?(t3)<-(*)-[et3]->(t2)", async () => {
      const result = await basicEngine.run("?(t3)<-(*)-[et3]->(t2)");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("?(t2)=[et2]=>(*)", async () => {
      const result = await basicEngine.run("?(t2)=[et2]=>(*)");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("?(t2)=[et2]=>(*)->(*)", async () => {
      const result = await basicEngine.run("?(t2)=[et2]=>(*)->(*)");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("Long paths graph", () => {
    it("?(t1)=[et2]=>(*)", async () => {
      const result = await longPathsEngine.run("?(t1)=[et2]=>(*)");

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
    });

    it("?(t1)=[et3]=>(*)", async () => {
      const result = await longPathsEngine.run("?(t1)=[et3]=>(*)");

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });

    it("?(t6)=[et5]=>(*)", async () => {
      const result = await longPathsEngine.run("?(t6)=[et5]=>(*)");

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
    });

    it("?(t5)=[et4]=>(*)", async () => {
      const result = await longPathsEngine.run("?(t5)=[et4]=>(*)");

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
    });

    it("?(t1)=[et1]=>(t5)", async () => {
      const result = await longPathsEngine.run("?(t1)=[et1]=>(t5)");

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });
  });

  describe("Complex graph", () => {
    it("?(a)->(*)", async () => {
      const result = await complexEngine.run("?(a)->(*)");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("?(a)-[e1]->(*)", async () => {
      const result = await complexEngine.run("?(a)-[e1]->(*)");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("?(a)->(*)-[e2]->(c)", async () => {
      const result = await complexEngine.run("?(a)->(*)-[e2]->(c)");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("?(b)=[e3]=>(*)", async () => {
      const result = await complexEngine.run("?(b)=[e3]=>(*)");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("?(f)=[e1]=>(*)", async () => {
      const result = await complexEngine.run("?(f)=[e1]=>(*)");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
