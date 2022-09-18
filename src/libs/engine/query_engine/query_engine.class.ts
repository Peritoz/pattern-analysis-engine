import {
  AnalysisPattern,
  GraphEdge,
  GraphRepository,
  GraphVertex,
  PartialEdgeFilter,
  PartialVertexFilter,
} from "@libs/model/graph_repository/graph_repository.interface";
import { QueryDescriptor } from "@libs/model/query_descriptor/query_descriptor.class";
import { QueryNode } from "@libs/model/query_descriptor/query_node.class";
import { QueryRelationship } from "@libs/model/query_descriptor/query_relationship.class";
import { OutputVertex } from "@libs/model/output/output_vertex.interface";
import { OutputEdge } from "@libs/model/output/output_edge.interface";
import { QueryTriple } from "@libs/model/query_descriptor/query_triple.class";
import { Direction } from "@libs/model/common/enums/direction.enum";
import { OutputFactory } from "@libs/engine/query_engine/output_factory.class";
import { EdgeScope } from "@libs/model/graph_repository/enums/edge_scope.enum";

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
  ): Promise<Array<Array<OutputVertex | OutputEdge>>> {
    if (queryDescriptor?.isComplexQuery()) {
      return this.runComplexQuery(queryDescriptor, initialElementIds);
    } else {
      return this.runLookup(queryDescriptor);
    }
  }

  // TODO: Optimize
  // TODO: Include "visited" logic
  /**
   * Runs the query and consolidates the results in a consolidated output array containing interpolated elements in the form:
   * [VertexOutput, EdgeOutput, VertexOut, ...]
   *
   * 1. Initializes the consolidation by getting the first stage result to serve as a reference value
   * for subsequent processing, which will consider the targetId/sourceId (depending on the direction) to
   * link edges
   * 2. Links each edge of each stage result with the correct pair, considering direction and
   * sourceId/targetId matching. This results in an array of arrays containing edge paths in the
   * form [GraphEdge, GraphEdge, GraphEdge]
   * 3. Generates pure formatted paths in the form [VertexOutput, EdgeOutput, VertexOut, ...]
   * @param queryDescriptor
   * @param initialElementIds An array of ids to filter the leftmost vertex
   */
  async runComplexQuery(
    queryDescriptor: QueryDescriptor,
    initialElementIds: Array<string> = []
  ): Promise<Array<Array<OutputVertex | OutputEdge>>> {
    const chain = queryDescriptor.queryChain;
    const output: Array<Array<OutputVertex | OutputEdge>> = [];
    const stageChain: Array<StageResult> = await this.processTripleChain(
      chain,
      [...new Set(initialElementIds)]
    );

    // It will only process the result if no stage returns an empty array
    if (stageChain.length > 0) {
      // Initializing consolidation
      const firstStage = stageChain[0];
      let edgeChain: Array<Array<GraphEdge>> = firstStage.analysisPattern.map(
        (e) => [e]
      );
      let priorDirection = firstStage.direction;

      // Linking edges
      for (let i = 1; i < stageChain.length; i++) {
        const stage = stageChain[i];
        const partialResult: Array<GraphEdge> = stage.analysisPattern;
        const currentDirection = stage.direction;

        for (let j = 0; j < partialResult.length; j++) {
          const edge: GraphEdge = partialResult[j];
          const compatibleEdges = edgeChain.filter((arr: Array<GraphEdge>) => {
            const priorEdge = arr[i - 1];
            const linkId =
              currentDirection === Direction.OUTBOUND
                ? edge.sourceId
                : edge.targetId;
            const hasCompatibleId =
              priorDirection === Direction.OUTBOUND
                ? priorEdge?.targetId === linkId
                : priorEdge?.sourceId === linkId;

            return hasCompatibleId && arr.length === i;
          });

          for (let k = 0; k < compatibleEdges.length; k++) {
            compatibleEdges[k].push(edge);
          }
        }
      }

      // Generating output
      await this.generateOutput(edgeChain, chain, stageChain, output);
    }

    return output;
  }

  private async generateOutput(
    edgeChain: Array<Array<GraphEdge>>,
    chain: Array<QueryTriple>,
    stageChain: Array<StageResult>,
    output: Array<Array<OutputVertex | OutputEdge>>
  ) {
    for (let i = 0; i < edgeChain.length; i++) {
      let path: Array<OutputVertex | OutputEdge> | null = [];
      let visitedVertices: Array<string> = [];

      for (let j = 0; j < edgeChain[i].length; j++) {
        const edge = edgeChain[i][j];

        if (j === 0) {
          visitedVertices = [edge.sourceId, edge.targetId];
        } else {
          // Avoiding cycles
          const nextVertexId =
            chain[j].relationship.direction === Direction.OUTBOUND
              ? edge.targetId
              : edge.sourceId;

          if (!visitedVertices.includes(nextVertexId)) {
            visitedVertices.push(nextVertexId);
          } else {
            continue;
          }
        }

        // Translating edges to output formatting
        const subPath = await this.generateSubPath(edge, chain[j], j === 0);

        if (subPath) {
          path = path.concat(subPath);
        }
      }

      // Avoiding returning of incomplete paths
      if (Math.floor(path?.length / 2) === stageChain.length) {
        output.push(path);
      }
    }
  }

  async runLookup(
    queryDescriptor: QueryDescriptor
  ): Promise<Array<Array<OutputVertex>>> {
    const types: Array<string> | undefined = queryDescriptor.queryFilter?.types;
    const searchTerm: string | undefined =
      queryDescriptor.queryFilter?.searchTerm;
    const vertices = await this._repo.getVerticesByFilter({
      types,
      searchTerm,
    });
    const output = vertices.map((vertex) => [
      OutputFactory.createOutputVertex(
        vertex.externalId,
        vertex.name,
        vertex.types
      ),
    ]);

    return Promise.resolve(output);
  }

  /**
   * Mounts an output sub path based on an edge
   * @param edge Edge to be converted in an output triple
   * @param queryTriple Description of the query elements involved in the sub path
   * @param returnFullPath If true, will return an array containing three values [OutputVertex, OutputEdge, OutputVertex].
   * If false, will return [OutputEdge, OutputVertex]
   * @private
   * @return Output sub path [OutputVertex, OutputEdge, OutputVertex] or [OutputEdge, OutputVertex], depending on
   * returnFullPath param value
   */
  private async generateSubPath(
    edge: GraphEdge,
    queryTriple: QueryTriple,
    returnFullPath: boolean
  ): Promise<Array<OutputVertex | OutputEdge> | null> {
    const { direction } = queryTriple.relationship;
    const isOutboundEdge = direction === Direction.OUTBOUND;
    let leftVertex: GraphVertex | undefined;
    let rightVertex: GraphVertex | undefined;

    // Extracts the left and right vertex for simplification
    if (isOutboundEdge) {
      if (returnFullPath) {
        leftVertex = await this._repo.getVertex(edge.sourceId);
      }

      rightVertex = await this._repo.getVertex(edge.targetId);
    } else {
      if (returnFullPath) {
        leftVertex = await this._repo.getVertex(edge.targetId);
      }

      rightVertex = await this._repo.getVertex(edge.sourceId);
    }

    if (!rightVertex) {
      throw new Error(
        `Data inconsistency: Vertex ${
          isOutboundEdge ? edge.targetId : edge.sourceId
        } not found`
      );
    }

    const rightOutputVertex = OutputFactory.createOutputVertex(
      rightVertex.externalId,
      rightVertex.name,
      rightVertex.types,
      queryTriple.rightNode.shouldBeReturned
    );

    // Returns three values if returnFullPath=true or a tuple if returnFullPath=false
    if (returnFullPath) {
      if (!leftVertex) {
        throw new Error(
          `Data inconsistency: Vertex ${
            isOutboundEdge ? edge.sourceId : edge.targetId
          } not found`
        );
      }

      return [
        OutputFactory.createOutputVertex(
          leftVertex.externalId,
          leftVertex.name,
          leftVertex.types,
          queryTriple.leftNode.shouldBeReturned
        ),
        OutputFactory.createOutputEdge(direction, edge.types),
        rightOutputVertex,
      ];
    } else {
      return [
        OutputFactory.createOutputEdge(direction, edge.types),
        rightOutputVertex,
      ];
    }
  }

  private async processTripleChain(
    chain: Array<QueryTriple>,
    memory: Array<string>
  ): Promise<Array<StageResult>> {
    let i = 0;
    let stageMemory = memory;
    const stageChain: Array<StageResult> = [];

    if (Array.isArray(chain)) {
      while (i < chain.length) {
        const triple: QueryTriple = chain[i];
        const { leftNode, relationship, rightNode } = triple;
        const stageResult: StageResult = await this.processTriple(
          leftNode,
          relationship,
          rightNode,
          stageMemory
        );

        if (stageResult.analysisPattern.length > 0) {
          if (stageResult.outputIds.length > 0) {
            stageMemory = stageResult.outputIds;
          }

          stageChain.push(stageResult);
          i++;
        } else {
          return [];
        }
      }
    }

    return stageChain;
  }

  private async processTriple(
    leftNode: QueryNode,
    relationship: QueryRelationship,
    rightNode: QueryNode,
    memory: Array<string>
  ): Promise<StageResult> {
    const isOutbound = relationship.direction === Direction.OUTBOUND;
    const sourceNode = isOutbound ? leftNode : rightNode;
    const targetNode = isOutbound ? rightNode : leftNode;
    let sourceFilter: PartialVertexFilter = {};
    let targetFilter: PartialVertexFilter = {};
    let relFilter: PartialEdgeFilter = {};
    const direction = relationship.direction;

    // Binding with the result of previous pipeline stage
    if (memory !== undefined && memory.length > 0) {
      if (isOutbound) {
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
    relFilter.scope =
      relationship.isDerived === false
        ? EdgeScope.NON_DERIVED_ONLY
        : EdgeScope.ALL;

    const analysisPattern = await this._repo.getEdgesByFilter(
      sourceFilter,
      relFilter,
      targetFilter
    );

    return {
      outputIds: isOutbound
        ? analysisPattern.map((e) => e.targetId)
        : analysisPattern.map((e) => e.sourceId),
      direction,
      analysisPattern,
    };
  }
}
