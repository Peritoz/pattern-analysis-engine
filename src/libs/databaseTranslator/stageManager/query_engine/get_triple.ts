import {GraphRepository, NodeFilter, RelationshipFilter} from "@libs/model/graph_repository/graph_repository.interface";
import {QueryNode} from "@libs/model/input_descriptor/query_node.class";
import {QueryRelationship} from "@libs/model/input_descriptor/query_relationship.class";

exports.processTriple = async (repo: GraphRepository, sourceNode: QueryNode, relationship: QueryRelationship, targetNode: QueryNode, memory: Array<string>) => {
    let sourceFilter: NodeFilter = {};
    let targetFilter: NodeFilter = {};
    let relFilter: RelationshipFilter = {isDerived: false, isNegated: false};
    const direction = relationship.getDirectionAsNumber();

    // Binding with the result of previous pipeline stage
    if (memory !== undefined && memory.length > 0) {
        if (direction === 1) {
            sourceFilter.ids = memory;
            sourceFilter.types = sourceNode.types;
            sourceFilter.searchTerm = sourceNode.searchTerm;

            if (sourceNode.searchTerm !== undefined && sourceNode.searchTerm !== "") {
                const matchedNodesIds = (await repo.getNodesByFilter(sourceFilter)).map(e => e.id);

                sourceFilter.ids = sourceFilter.ids.filter(id => matchedNodesIds.includes(id));
            }
        } else {
            targetFilter.ids = memory;
            targetFilter.types = targetNode.types;
            targetFilter.searchTerm = targetNode.searchTerm;

            if (targetNode.searchTerm !== undefined && targetNode.searchTerm !== "") {
                const matchedNodesIds = (await repo.getNodesByFilter(targetFilter)).map(e => e.id);

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

    return await repo.transverse(sourceFilter, relFilter, targetFilter);
};