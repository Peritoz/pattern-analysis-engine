import {QueryRelationship} from "@libs/model/query_descriptor/query_relationship.class";
import {QueryNode} from "@libs/model/query_descriptor/query_node.class";
import {AnalysisPattern} from "@libs/model/graph_repository/graph_repository.interface";

module.exports = async (elementA: QueryNode, relationship: QueryRelationship, elementB: QueryNode, memory: Array<string>) => {
    try {
        let pipelineStage;

        if (relationship.discriminator === 'TYPED_RELATIONSHIP') {
            if ((relationship.sourceDisc === 'PATH_BASE' && relationship.targetDisc === 'PATH_RIGHT') ||
                (relationship.sourceDisc === 'PATH_LEFT' && relationship.targetDisc === 'PATH_BASE')) {
                let result: Array<AnalysisPattern> = [];

                pipelineStage = {
                    transverseType: 'path',
                    result
                };
            } else {
                let result: Array<AnalysisPattern> = [];

                pipelineStage = {
                    transverseType: 'bonded',
                    result
                };
            }
        } else {
            let result: Array<AnalysisPattern> = [];

            pipelineStage = {
                transverseType: 'short',
                result
            };
        }

        return pipelineStage;
    } catch (e) {
        throw e;
    }
};