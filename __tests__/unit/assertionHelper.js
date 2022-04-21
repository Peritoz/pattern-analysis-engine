const chai = require('chai');
const {getRelationshipData} = require("./query_helper");

exports.validateRelationships = async (compactResponse) => {
    for (let i = 0; i < compactResponse.relationships.length; i++) {
        for (let j = 0; j < compactResponse.relationships[i].length; j++) {
            let response = await getRelationshipData(compactResponse.relationships[i][j]);

            chai.expect(compactResponse.paths[i][j].name).to.be.oneOf([response.sourceelement[0].name, response.targetelement[0].name]);
        }
    }
};