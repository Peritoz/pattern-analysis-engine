const mongoose = require("mongoose");
const assetSchema = require("../../../../../model/schema/buildingBlockSchema");
const logger = require("../../../../../utils/logger");

exports.getRelatedAssets = async (federationId, index, types, nameConstraint) => {
    let query;

    logger.info(`Getting Related Assets with types ${types} and name ${nameConstraint} for Federation ${federationId}`);

    // Mounting basic query
    query = [
        {
            '$match': {
                federationid: mongoose.Types.ObjectId(federationId),
                createindex: {'$lte': index},
                retireindex: {'$gt': index},
                active: true
            }
        },
        {
            '$project': {
                'identifier': 1,
            }
        }
    ];

    // Creating name constraint query filter if there is a name informed
    if (nameConstraint !== undefined && nameConstraint !== "") {
        // Applying name constraint
        query[0]["$match"].name = new RegExp(`^.*${nameConstraint}.*$`, "i");
    }

    // Creating type constraint query filter if there is any type informed
    if (types !== undefined && types.length > 0) {
        // Applying type constraint
        query[0]["$match"].maintype = {'$in': types};
    }

    let result = await assetSchema.aggregate(query).allowDiskUse(true);

    logger.info(`${result.length} Related Assets with types ${types} and name ${nameConstraint} found for Federation ${federationId}`);

    return result;
};