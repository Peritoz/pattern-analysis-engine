import {
  SimpleGraphRepository,
  SimpleGraphVertex,
  SimpleGraphEdge,
} from "../../../../src";

/**
 * Creates a graph in the following form:
 *
 * (1:t1)-[et1]->(2:t2)-[et2]->(3:t3)-[et3]->(4:t4)<-[et4]-(5:t5)
 *                             (3:t3)<-[et5]-(6:t6)-[et6]->(7:t7)
 */
export async function init_long_paths_graph() {
  const repository = new SimpleGraphRepository();

  await repository.addVertex(new SimpleGraphVertex("V1", ["t1"], "1"));
  await repository.addVertex(new SimpleGraphVertex("V2", ["t2"], "2"));
  await repository.addVertex(new SimpleGraphVertex("V3", ["t3"], "3"));
  await repository.addVertex(new SimpleGraphVertex("V4", ["t4"], "4"));
  await repository.addVertex(new SimpleGraphVertex("V5", ["t5"], "5"));
  await repository.addVertex(new SimpleGraphVertex("V6", ["t6"], "6"));
  await repository.addVertex(new SimpleGraphVertex("V7", ["t7"], "7"));
  await repository.addEdge(new SimpleGraphEdge("1", "2", ["et1"], "E1"));
  await repository.addEdge(new SimpleGraphEdge("2", "3", ["et2"], "E2"));
  await repository.addEdge(new SimpleGraphEdge("3", "4", ["et3"], "E3"));
  await repository.addEdge(new SimpleGraphEdge("5", "4", ["et4"], "E4"));
  await repository.addEdge(new SimpleGraphEdge("6", "3", ["et5"], "E5"));
  await repository.addEdge(new SimpleGraphEdge("6", "7", ["et6"], "E6"));

  return repository;
}
