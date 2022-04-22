exports.getElementIdentifier = (queryObjectElement, queryObjectIdentifiers) => {
    if (queryObjectElement.discriminator === 'DESCRIBED_NODE' || queryObjectElement.discriminator === 'IDENTIFIED_NODE') {
        const index = queryObjectIdentifiers.findIndex(el => el.alias === queryObjectElement.alias);

        return queryObjectIdentifiers[index].identifier;
    }

    return "";
};