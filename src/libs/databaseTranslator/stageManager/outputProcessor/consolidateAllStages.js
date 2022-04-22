const _ = require('lodash');
const {removeDuplicatedPaths} = require("./removeDuplicatedPaths");
const {recursiveConsolidation} = require("./recursiveConsolidation");
const {getAssetsByIdentifier} = require("../queryManager/getAssetsByIdentifier");
const logger = require("../../../../../utils/logger");

function extractNodeIds(stageOutputs) {
    let nodeIds = [];

    for (let i = 0; i < stageOutputs.length; i++) {
        nodeIds = [...nodeIds, ...stageOutputs[i].result.nodeIds];
    }

    return nodeIds;
}

function associateNames(output, namesMap, federationId) {
    for (let i = 0; i < output.paths.length; i++) {
        let path = output.paths[i];

        for (let j = 0; j < path.length; j++) {
            let node = path[j];
            let nameMap = namesMap.find(e => e.identifier === node.identifier);

            if (nameMap) {
                node.name = nameMap.name;
            } else {
                logger.warn(`Was not possible to map a name for node ${node.identifier} for Fed ${federationId}`);
            }
        }
    }
}

/**
 * Responsible to consolidate all Partial Outputs linking paths
 * @param federationId
 * @param stagesOutput
 * @param asPath
 * @returns {{paths: *}}
 */

module.exports = async (federationId, stagesOutput, asPath, returnAsScopeList) => {
    let consolidatedResult = {paths: [], relationships: []};

    if (stagesOutput.length > 0) {
        // 0. Starting recursive chain
        let firstStageResult = stagesOutput[0].result;
        let nodeIds = extractNodeIds(stagesOutput);
        let result = recursiveConsolidation(
            firstStageResult.leafs,
            firstStageResult.paths,
            firstStageResult.relationships,
            stagesOutput,
            0
        );

        // 7. Filtering just Pattern nodes
        let filteredResult;

        if (!asPath) {
            let filteredPaths = [];
            let hashProcessedNodes = {}; // For performant "exists" verification

            for (let i = 0; i < result.paths.length; i++) {
                let path = result.paths[i];

                let filteredResult = _.filter(path, (el) => {
                    return el.ispatternnode === true;
                });

                if (filteredResult.length > 0) {
                    if (!returnAsScopeList) { // Push filtered path to return a list of paths
                        filteredPaths.push(filteredResult);
                    } else { // Filter unique nodes to return a list of nodes (Scope)
                        for (let j = 0; j < filteredResult.length; j++) {
                            let node = filteredResult[j];

                            if (hashProcessedNodes[node.identifier] === undefined) {
                                hashProcessedNodes[node.identifier] = null;
                                filteredPaths.push([node]);
                            }
                        }
                    }
                }
            }

            filteredResult = filteredPaths || [];
        } else {
            filteredResult = result.paths;
        }

        // 8. Removing Duplicated paths
        let resultWithoutDuplicated = removeDuplicatedPaths(filteredResult, result.relationships);
        let relationshipIdsList = [];

        // 9. Extracting just the relationship ids in Relationship Paths
        resultWithoutDuplicated.relationships.forEach((relPath) => {
            relationshipIdsList.push(relPath.map(rel => rel.relationshipid ? rel.relationshipid.toString() : ""));
        });

        // 10. Getting nodes information
        let assets = await getAssetsByIdentifier(federationId, nodeIds);

        associateNames(resultWithoutDuplicated, assets, federationId);

        // 11. Formatting result
        consolidatedResult = {
            paths: resultWithoutDuplicated.paths,
            relationships: relationshipIdsList
        };
    }

    return consolidatedResult;
};
