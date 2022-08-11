import {
    AnalysisPattern,
    GraphRepository,
    VertexFilter,
    EdgeFilter
} from "@libs/engine/graph_repository/graph_repository.interface";
import {QueryDescriptor} from "@libs/model/query_descriptor/query_descriptor.class";
import {QueryNode} from "@libs/model/query_descriptor/query_node.class";
import {QueryRelationship} from "@libs/model/query_descriptor/query_relationship.class";

interface StageResult {
    outputIds: Array<string>,
    analysisPattern: AnalysisPattern
}

export class QueryEngine {
    constructor(protected _repo: GraphRepository) {
    }

    // TODO: WIP
    async run(queryDescriptor: QueryDescriptor, initialElementIds: Array<string>): Promise<object[]> {
        const chain = queryDescriptor.queryChain;

        for (let i = 0; i < chain.length; i++) {
            const triple = chain[i];
            const stageResult: StageResult = await this.processTriple(
                triple.leftNode,
                triple.relationship,
                triple.rightNode,
                []
            );
        }

        return [];
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
                sourceFilter.types = sourceNode.types;
                sourceFilter.searchTerm = sourceNode.searchTerm;

                if (sourceNode.searchTerm !== undefined && sourceNode.searchTerm !== "") {
                    const matchedNodesIds = (await this._repo.getVerticesByFilter(sourceFilter)).map(e => e.id);

                    sourceFilter.ids = sourceFilter.ids.filter(id => matchedNodesIds.includes(id));
                }
            } else {
                targetFilter.ids = memory;
                targetFilter.types = targetNode.types;
                targetFilter.searchTerm = targetNode.searchTerm;

                if (targetNode.searchTerm !== undefined && targetNode.searchTerm !== "") {
                    const matchedNodesIds = (await this._repo.getVerticesByFilter(targetFilter)).map(e => e.id);

                    targetFilter.ids = targetFilter.ids.filter(id => matchedNodesIds.includes(id));
                }
            }
        } else {
            sourceFilter.types = sourceNode.types;
            sourceFilter.searchTerm = sourceNode.searchTerm;
            targetFilter.types = targetNode.types;
            targetFilter.searchTerm = targetNode.searchTerm;
        }

        relFilter.types = relationship.types;
        relFilter.isNegated = relationship.isNegated;
        relFilter.isDerived = relationship.isDerived;

        const analysisPattern = await this._repo.getEdgesByFilter(sourceFilter, relFilter, targetFilter);

        return {
            outputIds: [],
            analysisPattern
        }
    }
}