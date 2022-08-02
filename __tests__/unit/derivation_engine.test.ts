import { DerivationEngine } from "../../src/libs/engine/derivation_engine/derivation_engine.class";
import { initGraph } from "./utils/initGraph";
import { createRuleFromText } from "./utils/createRuleFromText";

describe("Derivation engine", () => {
  let derivationEngine;
  let repository;

  beforeAll(async () => {
    repository = initGraph();
    derivationEngine = new DerivationEngine(repository, [
      createRuleFromText("()[et1]>()[et2,et3]>()", "(1)[et1]>(3)"),
      createRuleFromText("(t3)[et2,et3]>()<[et2](t1)", "(1)<[et3](2)"),
      createRuleFromText("()<[](t3)[et3]>(t2)", "(1)<[et1](3)"),
    ]);
  });

  it("Should add vertices", () => {
    derivationEngine.deriveEdges();

    const graph = derivationEngine._graph;

    // TODO: Assess derivation result
  });
});
