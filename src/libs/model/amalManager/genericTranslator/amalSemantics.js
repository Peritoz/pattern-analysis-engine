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
        Relationship(relationshiptType) {
            naiveChain.push(relationshiptType.eval());
        },

        BindedShortRelationship(direction) {
            let sourceType;
            let targetType;
            let relationshipType = direction.eval();

            switch (relationshipType) {
                case "BINDED_RIGHT":
                    sourceType = "BINDED_BASE";
                    targetType = relationshipType;
                    break;
                case "BINDED_LEFT":
                    sourceType = relationshipType;
                    targetType = "BINDED_BASE";
                    break;
                case "BINDED_BIDIRECTIONAL":
                    sourceType = "BINDED_LEFT";
                    targetType = "BINDED_RIGHT";
                    break;
                case "BINDED_BASE":
                    sourceType = "BINDED_LEFT";
                    targetType = "BINDED_RIGHT";
                    break;
                default:
                    sourceType = "BINDED_BASE";
                    targetType = "BINDED_BASE";
            }

            let relationshipObject = {
                discriminator: "SHORT_RELATIONSHIP",
                source: sourceType,
                target: targetType,
                relationshipType: null,
                negated: false
            };

            return relationshipObject;
        },

        TypedBindedRelationship(leftDirection, relationshipDescription, rightDirection) {
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

        /*
        ExcludedRelationshipDescription(relationshipStart, negation, type, relationshipEnd) {
            return {
                discriminator: "TYPED_RELATIONSHIP",
                source: relationshipStart.eval(),
                target: relationshipEnd.eval(),
                alias: null,
                relationshipType: type.eval(),
                negated: true
            };
        },

         */

        BindedRelationshipDescription(relationshipStart, type, relationshipEnd) {
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
            let alias = "e" + referenceNodes.length;

            naiveChain.push({discriminator: "TYPED_NODE", alias: alias, elementTypes: type.eval()});
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

            naiveChain.push({discriminator: "DESCRIBED_NODE", alias: alias, elementTypes: type.eval()});
            responseOrder.push(alias);

            nodeName.eval(); // Order is important here. This must be after the evaluation of "alias"
        },

        ElementName(delimiterStart, name, delimiterEnd) {
            let alias = "n" + identifiers.length;

            identifiers.push({alias: alias, identifier: name.eval().toLowerCase(), id: ""});

            return alias;
        },

        ElementType(nodeType, elementTypeExpansion) {
            let type = nodeType.eval();

            if(elementTypeExpansion){
                let expandedTypes = elementTypeExpansion.eval();

                if(Array.isArray(expandedTypes)){
                    return [...type, ...expandedTypes];
                }else{
                    return [...type, expandedTypes];
                }
            }else{
                return type;
            }
        },

        ElementTypeExpansion(orSeparator, elementType) {
            return elementType.eval();
        },

        /*
        Parameter(indicator, parameterName) { // TODO: Register parameters
            return parameterName.eval();
        },
         */

        // Lexical

        nodeType(e) {
            return [e.eval().toLowerCase()];
            //return this.sourceString;
        },

        typeBehaviourElement(e) {
            return this.sourceString;
        },

        typeActiveStructureElement(e) {
            switch (e._node.ctorName) {
                case "typeApplicationComponent":
                    return "ApplicationComponent";
                case "typeBusinessActor":
                    return "BusinessActor";
                case "typeBusinessRole":
                    return "BusinessRole";
                default:
                    return this.sourceString;
            }
        },

        typePassiveStructureElement(e) {
            return this.sourceString;
        },

        typeCompositeElement(e) {
            return this.sourceString;
        },

        typePhysicalElement(e) {
            return this.sourceString;
        },

        typeStrategyElement(e) {
            return this.sourceString;
        },

        typeMotivationalElement(e) {
            return this.sourceString;
        },

        leftDirection(direction) {
            return "BINDED_LEFT";
        },

        pathLeftDirection(direction) {
            return "PATH_LEFT";
        },

        rightDirection(direction) {
            return "BINDED_RIGHT";
        },

        pathRightDirection(direction) {
            return "PATH_RIGHT";
        },

        baseDirection(direction) {
            return "BINDED_BASE";
        },

        pathBaseDirection(direction) {
            return "PATH_BASE";
        },

        associationRelationship(relationship) {
            return "AssociationRelationship";
        },

        servingRelationship(relationship) {
            return "ServingRelationship";
        },

        triggeringRelationship(relationship) {
            return "TriggeringRelationship";
        },

        assignmentRelationship(relationship) {
            return "AssignmentRelationship";
        },

        flowRelationship(relationship) {
            return "FlowRelationship";
        },

        accessRelationship(relationship) {
            return "AccessRelationship";
        },

        compositionRelationship(relationship) {
            return "CompositionRelationship";
        },

        aggregationRelationship(relationship) {
            return "AggregationRelationship";
        },

        realizationRelationship(relationship) {
            return "RealizationRelationship";
        },

        specializationRelationship(relationship) {
            return "SpecializationRelationship";
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