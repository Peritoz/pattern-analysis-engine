import {
  AnalysisPattern,
  GraphRepository,
  VertexFilter,
  EdgeFilter,
} from "@libs/engine/graph_repository/graph_repository.interface";
import { QueryDescriptor } from "@libs/model/query_descriptor/query_descriptor.class";
import { QueryNode } from "@libs/model/query_descriptor/query_node.class";
import { QueryRelationship } from "@libs/model/query_descriptor/query_relationship.class";
import {OutputVertex} from "@libs/model/output/output_vertex.interface";
import {OutputEdge} from "@libs/model/output/output_edge.interface";

interface StageResult {
  outputIds: Array<string>;
  analysisPattern: AnalysisPattern;
}

export class QueryEngine {
  constructor(protected _repo: GraphRepository) {}

  async run(
    queryDescriptor: QueryDescriptor,
    initialElementIds: Array<string>
  ): Promise<Array<OutputVertex | OutputEdge>> {
    const chain = queryDescriptor.queryChain;
    const stageChain: Array<StageResult> = [];
    const output: Array<OutputVertex | OutputEdge> = [];
    let memory: Array<string> = initialElementIds;

    for (let i = 0; i < chain.length; i++) {
      const triple = chain[i];
      const stageResult: StageResult = await this.processTriple(
        triple.leftNode,
        triple.relationship,
        triple.rightNode,
        memory
      );

      if (stageResult.outputIds.length > 0) {
        memory = stageResult.outputIds;
      }

      stageChain.push(stageResult);
    }

    return output;
  }

  private async processTriple(
    sourceNode: QueryNode,
    relationship: QueryRelationship,
    targetNode: QueryNode,
    memory: Array<string>
  ): Promise<StageResult> {
    let sourceFilter: Partial<VertexFilter> = {};
    let targetFilter: Partial<VertexFilter> = {};
    let relFilter: Partial<EdgeFilter> = {};
    const direction = relationship.direction;

    // Binding with the result of previous pipeline stage
    if (memory !== undefined && memory.length > 0) {
      if (direction === 1) {
        sourceFilter.ids = memory;
      } else {
        targetFilter.ids = memory;
      }
    }

    sourceFilter.types = sourceNode.types;
    sourceFilter.searchTerm = sourceNode.searchTerm;
    targetFilter.types = targetNode.types;
    targetFilter.searchTerm = targetNode.searchTerm;

    relFilter.types = relationship.types;
    relFilter.isNegated = relationship.isNegated;
    relFilter.isDerived = relationship.isDerived;

    const analysisPattern = await this._repo.getEdgesByFilter(
      sourceFilter,
      relFilter,
      targetFilter
    );

    return {
      outputIds:
        direction === 1
          ? analysisPattern.map((v) => v.targetId)
          : analysisPattern.map((v) => v.sourceId),
      analysisPattern,
    };
  }
}
