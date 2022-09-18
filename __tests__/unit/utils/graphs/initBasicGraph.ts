import { SimpleGraphRepository } from "../../../../src";
import { SimpleGraphVertex } from "../../../../src/libs/engine/simple_graph_repository/simple_graph_vertex";
import {SimpleGraphEdge} from "../../../../src/libs/engine/simple_graph_repository/simple_graph_edge";

/**
 * Creates a graph in the following form:
 *
 * (1:t1,t2)-[et1]->(2:t1)-[et2, et3]->(3:t2,t3)<-[et1]-(4:t3)-[et3]->(5:t2)<-[et2]-(1:t1,t2)
 */
export async function initBasicGraph() {
  const repository = new SimpleGraphRepository();

  await repository.addVertex(new SimpleGraphVertex("V1", ["t1", "t2"], "1"));
  await repository.addVertex(new SimpleGraphVertex("V2", ["t1"], "2"));
  await repository.addVertex(new SimpleGraphVertex("V3", ["t2", "t3"], "3"));
  await repository.addVertex(new SimpleGraphVertex("V4", ["t3"], "4"));
  await repository.addVertex(new SimpleGraphVertex("V5", ["t2"], "5"));
  await repository.addEdge(new SimpleGraphEdge("1", "2", ["et1"]));
  await repository.addEdge(new SimpleGraphEdge("2", "3", ["et2", "et3"]));
  await repository.addEdge(new SimpleGraphEdge("4", "3", ["et1"]));
  await repository.addEdge(new SimpleGraphEdge("4", "5", ["et3"]));
  await repository.addEdge(new SimpleGraphEdge("1", "5", ["et2"]));

  return repository;
}
