import {
  SimpleGraphRepository,
  SimpleGraphVertex,
  SimpleGraphEdge,
} from "../../../../src";

/**
 * Creates a graph in the following form:
 *
 * (1:t1,t2)-[et1]->(2:t1)-[et2, et3]->(3:t2,t3)<-[et1]-(4:t3)-[et3]->(5:t2)<-[et2]-(1:t1,t2)
 */
export async function init_basic_graph() {
  const repository = new SimpleGraphRepository();

  await repository.addVertex(new SimpleGraphVertex("V1", ["t1", "t2"], "1"));
  await repository.addVertex(new SimpleGraphVertex("V2", ["t1"], "2"));
  await repository.addVertex(new SimpleGraphVertex("V3", ["t2", "t3"], "3"));
  await repository.addVertex(new SimpleGraphVertex("V4", ["t3"], "4"));
  await repository.addVertex(new SimpleGraphVertex("V5", ["t2"], "5"));
  await repository.addEdge(new SimpleGraphEdge("1", "2", ["et1"], "E1"));
  await repository.addEdge(new SimpleGraphEdge("2", "3", ["et2", "et3"], "E2"));
  await repository.addEdge(new SimpleGraphEdge("4", "3", ["et1"], "E3"));
  await repository.addEdge(new SimpleGraphEdge("4", "5", ["et3"], "E4"));
  await repository.addEdge(new SimpleGraphEdge("1", "5", ["et2"], "E5"));

  return repository;
}
