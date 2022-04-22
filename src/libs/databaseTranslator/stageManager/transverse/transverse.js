const queryStage = require("../queryManager/queryStage");

module.exports = async (elementA, relationship, elementB, identifiers, federation, modelIndex, memory) => {
    try {
        let pipelineStage;

        if (relationship.discriminator === 'TYPED_RELATIONSHIP') {
            if ((relationship.source === 'PATH_BASE' && relationship.target === 'PATH_RIGHT') ||
                (relationship.source === 'PATH_LEFT' && relationship.target === 'PATH_BASE')) {
                let result = await queryStage({
                    elementA,
                    relationship,
                    elementB,
                    federation,
                    modelIndex,
                    identifiers,
                    memory,
                    derivedLimit: 20,
                    relationshipType: relationship.relationshipType
                });

                pipelineStage = {
                    transversetype: 'path',
                    query: result
                };
            } else {
                let result = await queryStage({
                    elementA,
                    relationship,
                    elementB,
                    federation,
                    modelIndex,
                    identifiers,
                    memory,
                    derivedLimit: 0,
                    relationshipType: relationship.relationshipType
                });

                pipelineStage = {
                    transversetype: 'binded',
                    query: result
                };
            }
        } else {
            let result = await queryStage({
                elementA,
                relationship,
                elementB,
                federation,
                modelIndex,
                identifiers,
                memory,
                derivedLimit: 0,
                relationshipTypes: null
            });

            pipelineStage = {
                transversetype: 'short',
                query: result
            };
        }

        return pipelineStage;
    } catch (e) {
        throw e;
    }
};