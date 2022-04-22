const createElement = require("./createElement");

exports.processRawQueryResult = (queryResult, direction, sourceElement, targetElement) => {
    let output = {leafs: [], nodeIds: [], paths: [], relationships: []};

    // 1. For each Triple Stage Result
    for (let i = 0; i < queryResult.length; i++) {
        let result = queryResult[i];

        let startNodeElement = createElement(
            "", // result.sourceelement._id,
            result.source,
            "elA", //result.sourceelement.name,
            result.sourcetype,
            direction === 1 ? sourceElement.discriminator !== 'NON_DESCRIBED_NODE' : targetElement.discriminator !== 'NON_DESCRIBED_NODE'
        );
        let endNodeElement = createElement(
            "", // result.targetelement._id,
            result.target,
            "elB", //result.targetelement.name,
            result.targettype,
            direction === 1 ? targetElement.discriminator !== 'NON_DESCRIBED_NODE' : sourceElement.discriminator !== 'NON_DESCRIBED_NODE'
        );

        output.nodeIds = [...new Set([...output.nodeIds, result.source, result.target])];

        if (direction === 1) {
            output.paths.push([startNodeElement, endNodeElement]);
            output.leafs.push(endNodeElement.identifier);
            output.relationships.push([{
                aelement: result.source,
                belement: result.target,
                relationshipid: result._id
            }]);
        } else if (direction === -1) {
            output.paths.push([endNodeElement, startNodeElement]);
            output.leafs.push(startNodeElement.identifier);
            output.relationships.push([{
                aelement: result.target,
                belement: result.source,
                relationshipid: result._id
            }]);
        } else {
            if (sourceElement === startNodeElement.maintype) {
                output.paths.push([startNodeElement, endNodeElement]);
                output.leafs.push(endNodeElement.identifier);
                output.relationships.push([{
                    aelement: result.source,
                    belement: result.target,
                    relationshipid: result._id
                }]);
            } else {
                output.paths.push([endNodeElement, startNodeElement]);
                output.leafs.push(startNodeElement.identifier);
                output.relationships.push([{
                    aelement: result.target,
                    belement: result.source,
                    relationshipid: result._id
                }]);
            }
        }
    }

    return output;
};
