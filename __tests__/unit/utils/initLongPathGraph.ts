import {SimpleGraphRepository} from "../../../src";

/**
 * Creates a graph in the following form:
 *
 * (1:t1)-[et1]->(2:t2)-[et2]->(3:t3)-[et3]->(4:t4)<-[et4]-(5:t5)
 * (3:t3)<-[et5]-(6:t6)-[et6]->(7:t7)
 */
export async function initLongPathGraph() {
  const repository = new SimpleGraphRepository();

  await repository.addVertex({
    id: "1",
    name: "V1",
    types: ["t1"],
  });
  await repository.addVertex({
    id: "2",
    name: "V2",
    types: ["t2"],
  });
  await repository.addVertex({
    id: "3",
    name: "V3",
    types: ["t3"],
  });
  await repository.addVertex({
    id: "4",
    name: "V4",
    types: ["t4"],
  });
  await repository.addVertex({
    id: "5",
    name: "V5",
    types: ["t5"],
  });
  await repository.addVertex({
    id: "6",
    name: "V6",
    types: ["t6"],
  });
  await repository.addVertex({
    id: "7",
    name: "V7",
    types: ["t7"],
  });
  await repository.addEdge({
    id: "E1",
    sourceId: "1",
    targetId: "2",
    types: ["et1"]
  });
  await repository.addEdge({
    id: "E2",
    sourceId: "2",
    targetId: "3",
    types: ["et2"]
  });
  await repository.addEdge({
    id: "E3",
    sourceId: "3",
    targetId: "4",
    types: ["et3"]
  });
  await repository.addEdge({
    id: "E4",
    sourceId: "5",
    targetId: "4",
    types: ["et4"]
  });
  await repository.addEdge({
    id: "E5",
    sourceId: "6",
    targetId: "3",
    types: ["et5"]
  });
  await repository.addEdge({
    id: "E6",
    sourceId: "6",
    targetId: "7",
    types: ["et6"]
  });

  return repository;
}
