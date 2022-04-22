const mongoose = require("mongoose");
const relationshipSchema = require("../../../../../model/schema/relationshipSchema");
const logger = require("../../../../../utils/logger");
const util = require("util");

exports.getRelatedRelationships = async (federationId, index, type, includeDerived, {elementAIds, elementATypes, elementBIds, elementBTypes}) => {
    let query =
        {
            federationid: mongoose.Types.ObjectId(federationId),
            createindex: {'$lte': index},
            retireindex: {'$gt': index},
            derived: includeDerived ? {'$lte': 20} : 0
        };

    logger.info(`Getting relationships with type ${type}, derived = ${includeDerived} for Federation ${federationId}`);

    if (elementATypes !== undefined && elementATypes.length > 0) {
        query.sourcetype = {$in: elementATypes};
    }

    if (elementBTypes !== undefined && elementBTypes.length > 0) {
        query.targettype = {$in: elementBTypes};
    }

    if (elementAIds !== undefined) {
        query.source = {$in: elementAIds};
    }

    if (elementBIds !== undefined) {
        query.target = {$in: elementBIds};
    }

    if (type !== undefined && type !== "") {
        query.type = type.toLowerCase();
    }

    //console.log(util.inspect(query, false, null, true));

    let result = await relationshipSchema.find(query).lean();

    logger.info(`${result.length} relationships with type ${type}, derived = ${includeDerived} found for Federation ${federationId}`);

    return result;
};