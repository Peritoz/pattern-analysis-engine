function generateAmalSemantics() {
    let identifiers = [];
    let referenceNodes = [];
    let referenceRelationships = [];
    let naiveChain = [];
    let responseOrder = [];

    return {
        Pattern(queryStart, expression) {
            expression.eval();

            return {identifiers, referenceNodes, referenceRelationships, naiveChain, responseOrder};
        },

        FirstLongPattern(firstNode, relationship, patternPart) {
            firstNode.eval();
            relationship.eval();
            patternPart.eval();
        },

        LongPattern(startPattern, patternPart) {
            startPattern.eval();
            patternPart.eval();
        },

        StartLongPattern(nodeElement, relationship) {
            nodeElement.eval();
            relationship.eval();
        },

        // Relationships
        Relationship(relationshipType) {
            naiveChain.push(relationshipType.eval());
        },

        BondedShortRelationship(direction) {
            let sourceType;
            let targetType;
            let relationshipType = direction.eval();

            switch (relationshipType) {
                case "BONDED_RIGHT":
                    sourceType = "BONDED_BASE";
                    targetType = relationshipType;
                    break;
                case "BONDED_LEFT":
                    sourceType = relationshipType;
                    targetType = "BONDED_BASE";
                    break;
                case "BONDED_BIDIRECTIONAL":
                    sourceType = "BONDED_LEFT";
                    targetType = "BONDED_RIGHT";
                    break;
                case "BONDED_BASE":
                    sourceType = "BONDED_LEFT";
                    targetType = "BONDED_RIGHT";
                    break;
                default:
                    sourceType = "BONDED_BASE";
                    targetType = "BONDED_BASE";
            }

            return {
                discriminator: "SHORT_RELATIONSHIP",
                source: sourceType,
                target: targetType,
                relationshipType: null,
                negated: false
            };
        },

        TypedBondedRelationship(leftDirection, relationshipDescription, rightDirection) {
            let alias = "r" + referenceRelationships.length;

            let relationshipObject = relationshipDescription.eval(); // Creates an initialized Relationship element

            relationshipObject.alias = alias;
            relationshipObject.source = leftDirection.eval();
            relationshipObject.target = rightDirection.eval();

            referenceRelationships.push({alias});

            return relationshipObject;
        },

        TypedPathRelationship(leftDirection, relationshipDescription, rightDirection) {
            let alias = "r" + referenceRelationships.length;

            let relationshipObject = relationshipDescription.eval(); // Creates an initialized Relationship element

            relationshipObject.alias = alias;
            relationshipObject.source = leftDirection.eval();
            relationshipObject.target = rightDirection.eval();

            referenceRelationships.push({alias});

            return relationshipObject;
        },

        BondedRelationshipDescription(relationshipStart, type, relationshipEnd) {
            return {
                discriminator: "TYPED_RELATIONSHIP",
                source: relationshipStart.eval(),
                target: relationshipEnd.eval(),
                alias: null,
                relationshipType: type.eval(),
                negated: false
            };
        },

        PathRelationshipDescription(relationshipStart, type, relationshipEnd) {
            return {
                discriminator: "TYPED_RELATIONSHIP",
                source: relationshipStart.eval(),
                target: relationshipEnd.eval(),
                alias: null,
                relationshipType: type.eval(),
                negated: false
            };
        },

        // Nodes
        NodeElement(node) {
            return node.eval();
        },

        DescribedNodeElement(nodeStart, nodeDescription, nodeEnd) {
            nodeDescription.eval();
        },

        IdentifiedNodeElement(nodeStart, nodeName, nodeEnd) {
            let alias = "n" + identifiers.length;

            naiveChain.push({discriminator: "IDENTIFIED_NODE", alias: alias, elementTypes: null});
            responseOrder.push(alias);

            nodeName.eval(); // Order is important here. This must be after the evaluation of "alias"
        },

        TypedNodeElement(nodeStart, type, nodeEnd) {
            const alias = "e" + referenceNodes.length;
            const elementTypesString = type.eval();
            const elementTypes = elementTypesString.split(" or ");

            naiveChain.push({discriminator: "TYPED_NODE", alias: alias, elementTypes: elementTypes});
            responseOrder.push(alias);
            referenceNodes.push({alias});
        },

        GroupNodeElement(nodeStart, selectAll, nodeEnd) {
            let alias = "e" + referenceNodes.length;

            naiveChain.push({discriminator: "GROUP_NODE", alias: alias, elementTypes: null});
            responseOrder.push(alias);
            referenceNodes.push({alias});
        },

        NonDescribedNodeElement(nodeStart, nodeEnd) {
            naiveChain.push({discriminator: "NON_DESCRIBED_NODE", alias: null, elementTypes: null});
        },

        NodeDescription(nodeName, typeIndicator, type) {
            let alias = "n" + identifiers.length;
            const elementTypesString = type.eval();
            const elementTypes = elementTypesString.split(" or ");

            naiveChain.push({discriminator: "DESCRIBED_NODE", alias: alias, elementTypes: elementTypes});
            responseOrder.push(alias);

            nodeName.eval(); // Order is important here. This must be after the evaluation of "alias"
        },

        ElementName(delimiterStart, name, delimiterEnd) {
            let alias = "n" + identifiers.length;

            identifiers.push({alias: alias, identifier: name.eval().toLowerCase(), id: ""});

            return alias;
        },

        // Lexical
        leftDirection(direction) {
            return "BONDED_LEFT";
        },

        pathLeftDirection(direction) {
            return "PATH_LEFT";
        },

        rightDirection(direction) {
            return "BONDED_RIGHT";
        },

        pathRightDirection(direction) {
            return "PATH_RIGHT";
        },

        baseDirection(direction) {
            return "BONDED_BASE";
        },

        pathBaseDirection(direction) {
            return "PATH_BASE";
        },

        _terminal() {
            return this.sourceString;
        },

        _iter(e) {
            return this.sourceString;
        }

    };
}

module.exports = {

    createAmalSemanticObject() {
        return generateAmalSemantics();
    }

};