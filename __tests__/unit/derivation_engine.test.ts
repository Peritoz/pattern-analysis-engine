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
      new DerivationRule("()<[](t3)[et3]>(t2)", "(3)[et1](1)"),
    ];
    repository = initGraph();
    derivationEngine = new DerivationEngine(repository, rules);
  });

  it("Should derive edges: Case 1", () => {
    derivationEngine.deriveEdges();

    const graph = derivationEngine._graph;

    // TODO: Assess derivation result
  });
});
