const _ = require('lodash');

exports.recursiveConsolidation = (consolidatedLeafs, consolidatedPaths, consolidatedRelationships, stagesOutput, index) => {
    if (index + 1 < stagesOutput.length) { // If there is a next result
        let consolidatedResponse = {leafs: [], paths: [], relationships: [], context: []};

        for (let i = 0; i < consolidatedLeafs.length; i++) {
            let consolidatedStep = {leafs: [], paths: [], relationships: []};
            let leaf = consolidatedLeafs[i];

            // 1. Filter the current stage for paths with the current leaf
            let currentStageLeafFiltered = _.filter(consolidatedPaths, function (path) {
                if (path !== null) {
                    return path[path.length - 1].identifier === leaf;
                } else {
                    return false;
                }
            });

            // 2. Filter the current stage for relationship paths with the current leaf
            let currentStageRelationshipsFiltered = _.filter(consolidatedRelationships, function (relPath) {
                if (relPath !== null) {
                    return relPath[relPath.length - 1].belement === leaf;
                } else {
                    return false;
                }
            });

            // 3. Filter the next stage for paths with the current leaf as root
            let nextStagePathsFiltered = _.filter(stagesOutput[index + 1].result.paths, function (path) {
                if (path !== null) {
                    return path[0].identifier === leaf;
                } else {
                    return false;
                }
            });

            // 4. Filter the next stage for relationship paths with the current leaf as root
            let nextStageRelationshipsFiltered = _.filter(stagesOutput[index + 1].result.relationships, function (relPath) {
                if (relPath !== null) {
                    return relPath[0].aelement === leaf;
                } else {
                    return false;
                }
            });

            // 5. Combine currentStageLeafFiltered with nextStagePathsFiltered generating consolidated paths
            for (let j = 0; j < currentStageLeafFiltered.length; j++) {
                currentStageLeafFiltered[j].pop(); // Removing the leaf to avoid repeating element

                for (let k = 0; k < nextStagePathsFiltered.length; k++) {
                    let nextStepPath = nextStagePathsFiltered[k];
                    let nextStepRelationship = nextStageRelationshipsFiltered[k];

                    consolidatedStep.paths.push([].concat(currentStageLeafFiltered[j], nextStepPath));
                    consolidatedStep.relationships.push([].concat(currentStageRelationshipsFiltered[j], nextStepRelationship));
                    consolidatedStep.leafs.push(nextStepPath[nextStepPath.length - 1].identifier);
                }
            }

            // 6. Apply consolidation again
            consolidatedStep.leafs = [...new Set(consolidatedStep.leafs)];
            let result = this.recursiveConsolidation(
                consolidatedStep.leafs,
                consolidatedStep.paths,
                consolidatedStep.relationships,
                stagesOutput,
                index + 1
            );

            // 7. Consolidating response
            consolidatedResponse.leafs = consolidatedResponse.leafs.concat(result.leafs);
            consolidatedResponse.paths = consolidatedResponse.paths.concat(result.paths);
            consolidatedResponse.relationships = consolidatedResponse.relationships.concat(result.relationships);
        }

        consolidatedResponse.leafs = [...new Set(consolidatedResponse.leafs)];

        return consolidatedResponse;
    } else {
        return {leafs: consolidatedLeafs, paths: consolidatedPaths, relationships: consolidatedRelationships};
    }
};