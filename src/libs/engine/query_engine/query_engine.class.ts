import {
  AnalysisPattern,
  GraphRepository,
  VertexFilter,
  EdgeFilter,
  GraphEdge,
} from "@libs/engine/graph_repository/graph_repository.interface";
import { QueryDescriptor } from "@libs/model/query_descriptor/query_descriptor.class";
import { QueryNode } from "@libs/model/query_descriptor/query_node.class";
import { QueryRelationship } from "@libs/model/query_descriptor/query_relationship.class";
import { OutputVertex } from "@libs/model/output/output_vertex.interface";
import { OutputEdge } from "@libs/model/output/output_edge.interface";
import { QueryTriple } from "@libs/model/query_descriptor/query_triple.class";

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
    const verticesIds = [];
    let memory: Array<string> = initialElementIds;
    let hasEmptyStage = false;
    let i = 0;

    while (!hasEmptyStage && i < chain.length) {
      const triple: QueryTriple = chain[i];
      const stageResult: StageResult = await this.processTriple(
        triple.leftNode,
        triple.relationship,
        triple.rightNode,
        memory
      );

      if (stageResult.analysisPattern.length > 0) {
        if (stageResult.outputIds.length > 0) {
          memory = stageResult.outputIds;
        }

        stageChain.push(stageResult);
        i++;
      } else {
        hasEmptyStage = true;
      }
    }

    if (!hasEmptyStage) {
      for (let j = 0; j < stageChain.length; j++) {
        const partialResult: AnalysisPattern = stageChain[j].analysisPattern;

        // TODO: How to know the direction?
        for (let k = 0; k < partialResult.length; k++) {
          const edge: GraphEdge = partialResult[k];

          verticesIds.push(edge.sourceId);
          verticesIds.push(edge.targetId);
        }
      }
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
