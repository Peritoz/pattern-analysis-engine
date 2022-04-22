const mongoose = require("mongoose");
const assetSchema = require("../../../../../model/schema/buildingBlockSchema");

exports.getAssetsByIdentifier = async (federationId, identifiers) => {
    let query;

    // Mounting basic query
    query = [
        {
            '$match': {
                federationid: mongoose.Types.ObjectId(federationId),
                identifier: {$in: identifiers},
                active: true
            }
        },
        {
            '$project': {
                'name': 1,
                'identifier': 1,
            }
        }
    ];

    return await assetSchema.aggregate(query).allowDiskUse(true);
};