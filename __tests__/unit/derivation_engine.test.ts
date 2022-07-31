import { DerivationEngine } from "../../src/libs/engine/derivation_engine/derivation_engine.class";
import { initGraph } from "./utils/initGraph";

describe("Derivation engine", () => {
  let derivationEngine;
  let repository;

  beforeAll(async () => {
    repository = initGraph();
    derivationEngine = new DerivationEngine(repository, []);
  });

  it("Should add vertices", () => {
    derivationEngine.deriveEdges();

    const graph = derivationEngine._graph;

    // TODO: Assess derivation result
  });
});
