import {
  AnalysisPattern,
  EdgeFilter,
  GraphEdge,
  GraphRepository,
  GraphVertex,
  VertexFilter,
} from "@libs/engine/graph_repository/graph_repository.interface";
import { QueryDescriptor } from "@libs/model/query_descriptor/query_descriptor.class";
import { QueryNode } from "@libs/model/query_descriptor/query_node.class";
import { QueryRelationship } from "@libs/model/query_descriptor/query_relationship.class";
import { OutputVertex } from "@libs/model/output/output_vertex.interface";
import { OutputEdge } from "@libs/model/output/output_edge.interface";
import { QueryTriple } from "@libs/model/query_descriptor/query_triple.class";
import { Direction } from "@libs/model/input_descriptor/enums/direction.enum";

interface StageResult {
  outputIds: Array<string>;
  direction: Direction;
  analysisPattern: AnalysisPattern;
}

export class QueryEngine {
  constructor(protected _repo: GraphRepository) {}

  async run(
    queryDescriptor: QueryDescriptor,
    initialElementIds: Array<string> = []
  ): Promise<Array<OutputVertex | OutputEdge>> {
    const chain = queryDescriptor.queryChain;
    const stageChain: Array<StageResult> = [];
    const output: Array<OutputVertex | OutputEdge> = [];
    let memory: Array<string> = initialElementIds;
    let hasEmptyStage = false;
    let i = 0;

    if (Array.isArray(chain)) {
      while (!hasEmptyStage && i < chain.length) {
        const triple: QueryTriple = chain[i];
        const {leftNode, relationship, rightNode} = triple;
        const stageResult: StageResult = await this.processTriple(
          leftNode,
          relationship,
          rightNode,
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
    }

    if (!hasEmptyStage) {
      // It will only process the result if no stage returns an empty array
      /** Consolidating results in a consolidated output array containing interpolated elements in the form:
       *  [VertexOutput, EdgeOutput, VertexOut, ...]
       */
      for (let j = 0; j < stageChain.length; j++) {
        const stage = stageChain[j];
        const partialResult: AnalysisPattern = stage.analysisPattern;

        for (let k = 0; k < partialResult.length; k++) {
          const edge: GraphEdge = partialResult[k];
          const sourceVertex: GraphVertex | undefined =
            await this._repo.getVertex(edge.sourceId);
          const targetVertex: GraphVertex | undefined =
            await this._repo.getVertex(edge.targetId);
          const isOutboundEdge = stage.direction === Direction.OUTBOUND;

          if (sourceVertex && targetVertex) {
            output.push({
              identifier: isOutboundEdge ? edge.sourceId : edge.targetId,
              label: isOutboundEdge ? sourceVertex.name : targetVertex.name,
              types: isOutboundEdge ? sourceVertex.types : targetVertex.types,
            });

            output.push({
              direction: stage.direction,
              types: [],
            });

            output.push({
              identifier: isOutboundEdge ? edge.targetId : edge.sourceId,
              label: isOutboundEdge ? targetVertex.name : sourceVertex.name,
              types: isOutboundEdge ? targetVertex.types : sourceVertex.types,
            });
          } else if (!sourceVertex && !targetVertex) {
            throw new Error(
              `Data inconsistency: Vertices ${edge.sourceId} and ${edge.targetId} not found`
            );
          } else if (!sourceVertex) {
            throw new Error(
              `Data inconsistency: Vertex ${edge.sourceId} not found`
            );
          } else if (!targetVertex) {
            throw new Error(
              `Data inconsistency: Vertex ${edge.targetId} not found`
            );
          }
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
      if (direction === Direction.OUTBOUND) {
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

    if (relationship.isDerived !== undefined) {
      relFilter.isDerived = relationship.isDerived;
    }

    const analysisPattern = await this._repo.getEdgesByFilter(
      sourceFilter,
      relFilter,
      targetFilter
    );

    return {
      outputIds:
        direction === Direction.OUTBOUND
          ? analysisPattern.map((v) => v.targetId)
          : analysisPattern.map((v) => v.sourceId),
      direction,
      analysisPattern,
    };
  }
}
