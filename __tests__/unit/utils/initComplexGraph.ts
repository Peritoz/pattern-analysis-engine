import {SimpleGraphRepository} from "../../../src/libs";

/**
 * Creates a graph in the following form:
 *
 * (1:a)-[e1]->(2:b)-[e2]->(3:c)-[e3]->(4:d)
 * (2:b)-[e3]->(5:e)-[e1]->(4:d)
 * (4:d)-[e4]->(6:f)
 */
export async function initComplexGraph() {
  const repository = new SimpleGraphRepository();

  await repository.addVertex({
    id: "1",
    name: "V1",
    types: ["a"],
  });
  await repository.addVertex({
    id: "2",
    name: "V2",
    types: ["b"],
  });
  await repository.addVertex({
    id: "3",
    name: "V3",
    types: ["c"],
  });
  await repository.addVertex({
    id: "4",
    name: "V4",
    types: ["d"],
  });
  await repository.addVertex({
    id: "5",
    name: "V5",
    types: ["e"],
  });
  await repository.addVertex({
    id: "6",
    name: "V6",
    types: ["f"],
  });
  await repository.addEdge({
    id: "E1",
    sourceId: "1",
    targetId: "2",
    types: ["e1"],
    derivationPath: [],
  });
  await repository.addEdge({
    id: "E1",
    sourceId: "5",
    targetId: "4",
    types: ["e1"],
    derivationPath: [],
  });
  await repository.addEdge({
    id: "E2",
    sourceId: "2",
    targetId: "3",
    types: ["e2"]
  });
  await repository.addEdge({
    id: "E3",
    sourceId: "3",
    targetId: "4",
    types: ["e3"]
  });
  await repository.addEdge({
    id: "E3",
    sourceId: "2",
    targetId: "5",
    types: ["e3"]
  });
  await repository.addEdge({
    id: "E4",
    sourceId: "4",
    targetId: "6",
    types: ["e4"]
  });

  return repository;
}
