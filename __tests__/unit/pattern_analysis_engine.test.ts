import {DerivationEngine, DerivationRule, PatternAnalysisEngine} from "../../src/libs";
import { initBasicGraph } from "./utils/initBasicGraph";
import { initComplexGraph } from "./utils/initComplexGraph";
import { QueryEngine } from "../../src/libs/engine/query_engine";
import { OhmInterpreter } from "../../src/libs/engine/query_interpreter";

describe("Pattern analysis engine", () => {
  let basicGraphEngine;
  let basicGraph;
  let complexGraphEngine;
  let complexGraph;
  let basicEngine;
  let complexEngine;

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

    basicGraph = await initBasicGraph();
    complexGraph = await initComplexGraph();
    basicGraphEngine = new DerivationEngine(basicGraph, basicGraphRules);
    complexGraphEngine = new DerivationEngine(complexGraph, complexGraphRules);

    await basicGraphEngine.deriveEdges(1);
    await complexGraphEngine.deriveEdges(2);

    basicEngine = new PatternAnalysisEngine(basicGraph);
    complexEngine = new PatternAnalysisEngine(complexGraph);
  });

  describe("Basic graph", () => {
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