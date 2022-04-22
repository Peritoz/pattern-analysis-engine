const {getRelatedAssets} = require("./getRelatedAssets");
const {getRelatedRelationships} = require("./getRelatedRelationships");

async function prepareQueryParams(queryParams, fetchIdsField, fetchTypesField, name, federationId, index, types) {
    if (name !== undefined && name !== "") {
        queryParams[fetchIdsField] = (await getRelatedAssets(federationId, index, types, name)).map(e => e.identifier);
    } else {
        queryParams[fetchTypesField] = types;
    }
}

exports.getTriple = async (federationId, index, relationshipType, aName, aTypes, bName, bTypes, direction, memory, derivationLimit) => {
    let queryParams = {};

    // Binding with the result of previous pipeline stage
    if (memory !== undefined && memory.length > 0) {
        if (direction === 1) {
            queryParams["elementAIds"] = memory;

            await prepareQueryParams(queryParams, "elementBIds", "elementBTypes",
                bName, federationId, index, bTypes);
        } else {
            queryParams["elementBIds"] = memory;

            await prepareQueryParams(queryParams, "elementAIds", "elementATypes",
                bName, federationId, index, bTypes);
        }
    } else {
        if (direction === 1) {
            await prepareQueryParams(queryParams, "elementAIds", "elementATypes",
                aName, federationId, index, aTypes);
            await prepareQueryParams(queryParams, "elementBIds", "elementBTypes",
                bName, federationId, index, bTypes);
        } else {
            await prepareQueryParams(queryParams, "elementAIds", "elementATypes",
                bName, federationId, index, bTypes);
            await prepareQueryParams(queryParams, "elementBIds", "elementBTypes",
                aName, federationId, index, aTypes);
        }
    }

    return await getRelatedRelationships(federationId, index, relationshipType, derivationLimit > 0, queryParams);
};