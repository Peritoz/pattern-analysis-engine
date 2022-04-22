const {getDirection} = require("./utils/directionUtils");
const {getTriple} = require("./index");
const {getElementIdentifier} = require("./utils/getElementIdentifier");

function getElementTypes(element) {
    return element.elementTypes ? element.elementTypes : [];
}

module.exports = async ({elementA, relationship, elementB, federation, modelIndex, identifiers, memory, derivedLimit, relationshipType}) => {
    try {
        let aTypes, bTypes;
        let direction = getDirection(relationship);

        // Generating name (identifier) if necessary (Element A)
        let elementAName = getElementIdentifier(elementA, identifiers);
        let elementBName = getElementIdentifier(elementB, identifiers);

        // Mounting type constraint
        if (elementA.discriminator !== 'GROUP_NODE' && elementA.discriminator !== 'NON_DESCRIBED_NODE') {
            aTypes = getElementTypes(elementA);
        } else {
            aTypes = [];
        }

        if (elementB.discriminator !== 'GROUP_NODE' && elementB.discriminator !== 'NON_DESCRIBED_NODE') {
            bTypes = getElementTypes(elementB);
        } else {
            bTypes = [];
        }

        return await getTriple(federation, modelIndex, relationshipType, elementAName, aTypes, elementBName, bTypes, direction, memory, derivedLimit);
    } catch (e) {
        throw e;
    }
};