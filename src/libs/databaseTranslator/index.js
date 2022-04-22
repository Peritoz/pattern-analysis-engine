const buildingBlockManager = require("../../../model/dataManager/asset");
const stageManager = require("./stageManager");
const logger = require("../../../utils/logger");

function convertToArrayOfArrays(paths) {
    return paths.map((obj) => {
        return [obj];
    });
}

/**
 * Options:
 *
 * aspath (boolean)                - Return the query response as paths
 *
 */

module.exports = async (queryObject, federation, index, aspath, complexity, responseLimit, initialElementIds, returnAsScopeList) => {
    try {
        const naiveChain = queryObject.naiveChain;
        let response = {paths: []};

        logger.info(`Starting query execution ${queryObject.query} for ${federation}`);

        if (naiveChain.length === 1) { // Just a simple element query
            let types = queryObject.naiveChain[0].elementTypes;
            let paths;

            if (naiveChain[0].discriminator === 'DESCRIBED_NODE') {
                let name = queryObject.identifiers[0].identifier;
                paths = await buildingBlockManager.searchElement(federation, index, name, '', types);

                response.paths = convertToArrayOfArrays(paths);
            } else { // TYPED_NODE OR IDENTIFIED_NODE
                if (types !== null && types !== undefined && types.length > 0) {
                    paths = await buildingBlockManager.searchElement(federation, index, '', '', types);

                    response.paths = convertToArrayOfArrays(paths);
                } else {
                    let name = queryObject.identifiers[0].identifier;
                    paths = await buildingBlockManager.searchElement(federation, index, name, 'all');

                    response.paths = convertToArrayOfArrays(paths);
                }
            }
        } else {
            response = await stageManager.runStages(queryObject, federation, index, aspath, initialElementIds, returnAsScopeList);
        }

        if (response.paths.length > responseLimit) {
            response.paths = response.paths.splice(0, responseLimit); // Returns the removed items
            response.summary = true;
        } else {
            response.summary = false;
        }

        logger.info(`Query executed ${queryObject.query} for ${federation}`);

        return response;
    } catch (e) {
        throw e;
    }
};