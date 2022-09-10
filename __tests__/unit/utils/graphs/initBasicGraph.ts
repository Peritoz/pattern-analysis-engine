import {SimpleGraphRepository} from "../../../../src";

/**
 * Creates a graph in the following form:
 *
 * (1:t1,t2)-[et1]->(2:t1)-[et2, et3]->(3:t2,t3)<-[et1]-(4:t3)-[et3]->(5:t2)<-[et2]-(1:t1,t2)
 */
export async function initBasicGraph() {
  const repository = new SimpleGraphRepository();

  await repository.addVertex({
    id: "1",
    name: "V1",
    types: ["t1", "t2"],
  });
  await repository.addVertex({
    id: "2",
    name: "V2",
    types: ["t1"],
  });
  await repository.addVertex({
    id: "3",
    name: "V3",
    types: ["t2", "t3"],
  });
  await repository.addVertex({
    id: "4",
    name: "V4",
    types: ["t3"],
  });
  await repository.addVertex({
    id: "5",
    name: "V5",
    types: ["t2"],
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
    types: ["et2", "et3"]
  });
  await repository.addEdge({
    id: "E3",
    sourceId: "4",
    targetId: "3",
    types: ["et1"]
  });
  await repository.addEdge({
    id: "E4",
    sourceId: "4",
    targetId: "5",
    types: ["et3"]
  });
  await repository.addEdge({
    id: "E5",
    sourceId: "1",
    targetId: "5",
    types: ["et2"]
  });

  return repository;
}
