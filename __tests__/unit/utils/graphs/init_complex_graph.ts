import {
  SimpleGraphRepository,
  SimpleGraphVertex,
  SimpleGraphEdge,
} from "../../../../src";

/**
 * Creates a graph in the following form:
 *
 * (1:a)-[e1]->(2:b)-[e2]->(3:c)-[e3]->(4:d)
 *             (2:b)-[e3]->(5:e)-[e1]->(4:d)
 *                                     (4:d)-[e4]->(6:f)
 */
export async function init_complex_graph() {
  const repository = new SimpleGraphRepository();

  await repository.addVertex(new SimpleGraphVertex("V1", ["a"], "1"));
  await repository.addVertex(new SimpleGraphVertex("V2", ["b"], "2"));
  await repository.addVertex(new SimpleGraphVertex("V3", ["c"], "3"));
  await repository.addVertex(new SimpleGraphVertex("V4", ["d"], "4"));
  await repository.addVertex(new SimpleGraphVertex("V5", ["e"], "5"));
  await repository.addVertex(new SimpleGraphVertex("V6", ["f"], "6"));
  await repository.addEdge(new SimpleGraphEdge("1", "2", ["e1"], "E1"));
  await repository.addEdge(new SimpleGraphEdge("5", "4", ["e1"], "E2"));
  await repository.addEdge(new SimpleGraphEdge("2", "3", ["e2"], "E3"));
  await repository.addEdge(new SimpleGraphEdge("3", "4", ["e3"], "E4"));
  await repository.addEdge(new SimpleGraphEdge("2", "5", ["e3"], "E5"));
  await repository.addEdge(new SimpleGraphEdge("4", "6", ["e4"], "E6"));

  return repository;
}
