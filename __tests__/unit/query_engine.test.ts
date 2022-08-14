import { DerivationEngine, DerivationRule } from "../../src/libs";
import { initBasicGraph } from "./utils/initBasicGraph";
import { initComplexGraph } from "./utils/initComplexGraph";
import { QueryEngine } from "../../src/libs/engine/query_engine";

describe("Query engine", () => {
  let basicGraphEngine;
  let basicGraph;
  let complexGraphEngine;
  let complexGraph;
  let basicQueryEngine;
  let complexQueryEngine;

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

    basicQueryEngine = new QueryEngine(basicGraph);
    complexQueryEngine = new QueryEngine(complexGraph);
  });

  describe("Basic graph", () => {
    it("(t1)->(*)", async () => {});

    it("(t1)-[et2]->(*)", async () => {});

    it("(*)<-(*)-[et3]->(t2)", async () => {});

    it("(t2)=[et2]=>(*)", async () => {});

    it("(t2)=[et2]=>(*)->(*)", async () => {});
  });

  describe("Complex graph", () => {
    it("(a)->(*)", async () => {});

    it("(a)-[e1]->(*)", async () => {});

    it("(*)->(*)-[e2]->(c)", async () => {});

    it("(b)=[e3]=>(*)", async () => {});

    it("(f)=[e1]=>(*)", async () => {});
  });
});
