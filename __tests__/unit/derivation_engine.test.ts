import { DerivationEngine } from "../../src/libs/engine/derivation_engine/derivation_engine.class";
import { initGraph } from "./utils/initGraph";
import { DerivationRule } from "../../src/libs/engine/derivation_engine/derivation_rule.class";

describe("Derivation engine", () => {
  let derivationEngine;
  let repository;

  beforeAll(async () => {
    const rules = [
      new DerivationRule("()[et1]>()[et2,et3]>()", "(1)[et1](3)"),
      new DerivationRule("(t3)[et2,et3]>()<[et2](t1)", "(2)[et3](1)"),
      new DerivationRule("()<[](t3)[et3]>(t2)", "(3)[et1,et2](1)"),
    ];
    // Graph in the form (1:t1,t2)-[et1]->(2:t1)-[et2, et3]->(3:t2,t3)<-[et1]-(4:t3)-[et3]->(5:t2)<-[et2]-(1:t1,t2)
    repository = await initGraph();
    derivationEngine = new DerivationEngine(repository, rules);
  });

  it("Should derive edges: Case 1", async () => {
    derivationEngine.deriveEdges();

    const graph = derivationEngine.graph;

    const edgeGroupRule1 = await graph.getEdgesByFilter(
      null,
      {
        types: ["et1"],
        isDerived: true,
        isNegated: false,
      },
      null
    );
    const edgeGroupRule2 = await graph.getEdgesByFilter(
      null,
      {
        types: ["et3"],
        isDerived: true,
        isNegated: false,
      },
      { types: ["t3"] }
    );
    const edgeGroupRule3 = await graph.getEdgesByFilter(
      {
        types: ["t2"],
      },
      {
        types: ["et1,et2"],
        isDerived: true,
        isNegated: false,
      },
      null
    );

    expect(edgeGroupRule1.length).toBe(1);
    expect(edgeGroupRule2.length).toBe(1);
    expect(edgeGroupRule3.length).toBe(1);
  });
});
