const mongoose = require('mongoose');
const data = require('../data/data.json');
const analysisManager = require('../business/patternAnalysis/analysisManager');
const relationshipSchema = require('../model/schema/relationshipSchema');

const normalizePaths = (paths) => {
    let compactResponse = [];

    for (let i = 0; i < paths.length; i++) {
        compactResponse.push(paths[i].map((e) => {
            return {
                name: e.name,
                maintype: e.maintype,
            }
        }));
    }

    return compactResponse;
};

exports.runQuery = async (query) => {
    let response = await analysisManager.run(
        query,
        data.FEDERATION_ID,
        data.MODEL_INDEX,
        1,
        100
    );

    return {paths: normalizePaths(response.paths), relationships: response.relationships};
};

exports.getRelationshipData = async (relationshipId) => {
    let response = await relationshipSchema.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(relationshipId)
            }
        },
        {
            $lookup:
                {
                    from: "buildingblocks",
                    localField: "source",
                    foreignField: "identifier",
                    as: "sourceelement"
                }
        },
        {
            $lookup:
                {
                    from: "buildingblocks",
                    localField: "target",
                    foreignField: "identifier",
                    as: "targetelement"
                }
        },
        {
            $project: {
                type: 1,
                "sourceelement._id": 1,
                "sourceelement.name": 1,
                "sourceelement.maintype": 1,
                "targetelement._id": 1,
                "targetelement.name": 1,
                "targetelement.maintype": 1
            }
        }
    ]);

    return response.length > 0 ? response[0] : null;
};
