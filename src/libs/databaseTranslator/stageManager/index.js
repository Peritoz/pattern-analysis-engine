const transverse = require("./transverse/transverse");
const {processRawQueryResult} = require("./outputProcessor/processRawQueryResult");
const consolidateAllStages = require("./outputProcessor/consolidateAllStages");
const {getDirection} = require("./queryManager/utils/directionUtils");
const util = require("util");

const logger = require("../../../../utils/logger");

/**
 * Responsible to run all Triple Stages of the QueryObject
 * @param queryObject
 * @param federation
 * @param index - Model index related with the federation
 * @param asPath - Return resulted with path described
 * @returns {Promise<{paths: *}>}
 */

exports.runStages = async (queryObject, federation, index, asPath, initialElementIds, returnAsScopeList) => {
    let stage;

    try {
        let memory = initialElementIds;
        let stageResults = [];
        const chainLength = queryObject.naiveChain.length;

        //console.log(util.inspect(queryObject, false, null, true));

        logger.info(`Query object ready for query ${queryObject.query} for Federation ${federation}`);

        // One pipeline stage per Triple
        for (let i = 1; i < chainLength - 1; i += 2) {
            let naiveChain = queryObject.naiveChain;
            const elementA = naiveChain[i - 1];
            const relationship = naiveChain[i];
            const elementB = naiveChain[i + 1];
            const identifiers = queryObject.identifiers;

            logger.info(`Querying database query for ${elementA.discriminator}-[${relationship.source}|${relationship.target}]-${elementB.discriminator} for Federation ${federation}`);

            stage = await transverse(elementA, relationship, elementB, identifiers, federation, index, memory);

            //console.log(util.inspect(stage.query, false, null, true));

            let result = stage.query;

            logger.info(`Transverse executed by the database query for query ${elementA.discriminator}-[${relationship.source}|${relationship.target}]-${elementB.discriminator}, stage ${i} for ${federation}`);

            if (result.length > 0) {
                let postProcessingResult = result;

                postProcessingResult = processRawQueryResult(
                    result,
                    getDirection(relationship),
                    elementA,
                    elementB
                );

                //console.log(util.inspect(postProcessingResult, false, null, true));

                // Removing duplicates from Leaves
                postProcessingResult.leafs = [...new Set(postProcessingResult.leafs)];
                memory = postProcessingResult.leafs;

                // Formatting stage output
                stageResults.push({
                    context: {
                        start: elementA,
                        relationship: relationship,
                        end: elementB
                    },
                    result: postProcessingResult
                });

                logger.info(`${result.length} Results for query ${elementA.discriminator}-[${relationship.source}|${relationship.target}]-${elementB.discriminator}, stage ${i} for ${federation}`);
            }
        }

        //console.log(util.inspect(stageResults, false, null, true));

        // If result stages corresponds to the number of triples
        if (stageResults.length === (queryObject.naiveChain.length - 1) / 2) {
            logger.info(`Consolidating stages for query ${queryObject.query} for ${federation}`);

            return await consolidateAllStages(federation, stageResults, asPath, returnAsScopeList);
        } else {
            return {paths: []}
        }
    } catch (e) {
        logger.error(e.message);

        console.log(util.inspect(stage, false, null, true));

        throw e;
    }
};