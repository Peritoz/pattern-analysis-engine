import {ChainElement} from "@libs/model/amalManager/genericTranslator/chain_element.interface";

interface GrammarElement {
    eval: () => any
}

function generateAmalSemantics() {
    let identifiers: Array<{ alias: string, identifier: string, id: string }> = [];
    let referenceNodes: Array<{ alias: string }> = [];
    let referenceRelationships: Array<{ alias: string }> = [];
    let naiveChain: Array<ChainElement> = [];
    let responseOrder: Array<string> = [];

    return {
        Pattern(queryStart: GrammarElement, expression: GrammarElement) {
            expression.eval();

            return {identifiers, referenceNodes, referenceRelationships, naiveChain, responseOrder};
        },

        FirstLongPattern(firstNode: GrammarElement, relationship: GrammarElement, patternPart: GrammarElement) {
            firstNode.eval();
            relationship.eval();
            patternPart.eval();
        },

        LongPattern(startPattern: GrammarElement, patternPart: GrammarElement) {
            startPattern.eval();
            patternPart.eval();
        },

        StartLongPattern(nodeElement: GrammarElement, relationship: GrammarElement) {
            nodeElement.eval();
            relationship.eval();
        },

        // Relationships
        Relationship(relationshipType: GrammarElement) {
            naiveChain.push(relationshipType.eval());
        },

        BondedShortRelationship(direction: GrammarElement) {
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

        TypedBondedRelationship(leftDirection: GrammarElement, relationshipDescription: GrammarElement, rightDirection: GrammarElement) {
            let alias = "r" + referenceRelationships.length;

            let relationshipObject = relationshipDescription.eval(); // Creates an initialized Relationship element

            relationshipObject.alias = alias;
            relationshipObject.source = leftDirection.eval();
            relationshipObject.target = rightDirection.eval();

            referenceRelationships.push({alias});

            return relationshipObject;
        },

        TypedPathRelationship(leftDirection: GrammarElement, relationshipDescription: GrammarElement, rightDirection: GrammarElement) {
            let alias = "r" + referenceRelationships.length;

            let relationshipObject = relationshipDescription.eval(); // Creates an initialized Relationship element

            relationshipObject.alias = alias;
            relationshipObject.source = leftDirection.eval();
            relationshipObject.target = rightDirection.eval();

            referenceRelationships.push({alias});

            return relationshipObject;
        },

        BondedRelationshipDescription(relationshipStart: GrammarElement, type: GrammarElement, relationshipEnd: GrammarElement) {
            return {
                discriminator: "TYPED_RELATIONSHIP",
                source: relationshipStart.eval(),
                target: relationshipEnd.eval(),
                alias: null,
                relationshipType: type.eval(),
                negated: false
            };
        },

        PathRelationshipDescription(relationshipStart: GrammarElement, type: GrammarElement, relationshipEnd: GrammarElement) {
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
        NodeElement(node: GrammarElement) {
            return node.eval();
        },

        DescribedNodeElement(nodeStart: GrammarElement, nodeDescription: GrammarElement, nodeEnd: GrammarElement) {
            nodeDescription.eval();
        },

        IdentifiedNodeElement(nodeStart: GrammarElement, nodeName: GrammarElement, nodeEnd: GrammarElement) {
            let alias = "n" + identifiers.length;

            naiveChain.push({discriminator: "IDENTIFIED_NODE", alias: alias, elementTypes: null});
            responseOrder.push(alias);

            nodeName.eval(); // Order is important here. This must be after the evaluation of "alias"
        },

        TypedNodeElement(nodeStart: GrammarElement, type: GrammarElement, nodeEnd: GrammarElement) {
            const alias = "e" + referenceNodes.length;
            const elementTypesString = type.eval();
            const elementTypes = elementTypesString.split(" or ");

            naiveChain.push({discriminator: "TYPED_NODE", alias: alias, elementTypes: elementTypes});
            responseOrder.push(alias);
            referenceNodes.push({alias});
        },

        GroupNodeElement(nodeStart: GrammarElement, selectAll: GrammarElement, nodeEnd: GrammarElement) {
            let alias = "e" + referenceNodes.length;

            naiveChain.push({discriminator: "GROUP_NODE", alias: alias, elementTypes: null});
            responseOrder.push(alias);
            referenceNodes.push({alias});
        },

        NonDescribedNodeElement(nodeStart: GrammarElement, nodeEnd: GrammarElement) {
            naiveChain.push({discriminator: "NON_DESCRIBED_NODE", alias: null, elementTypes: null});
        },

        NodeDescription(nodeName: GrammarElement, typeIndicator: GrammarElement, type: GrammarElement) {
            let alias = "n" + identifiers.length;
            const elementTypesString = type.eval();
            const elementTypes = elementTypesString.split(" or ");

            naiveChain.push({discriminator: "DESCRIBED_NODE", alias: alias, elementTypes: elementTypes});
            responseOrder.push(alias);

            nodeName.eval(); // Order is important here. This must be after the evaluation of "alias"
        },

        ElementName(delimiterStart: GrammarElement, name: GrammarElement, delimiterEnd: GrammarElement) {
            let alias = "n" + identifiers.length;

            identifiers.push({alias: alias, identifier: name.eval().toLowerCase(), id: ""});

            return alias;
        },

        // Lexical
        leftDirection(direction: GrammarElement) {
            return "BONDED_LEFT";
        },

        pathLeftDirection(direction: GrammarElement) {
            return "PATH_LEFT";
        },

        rightDirection(direction: GrammarElement) {
            return "BONDED_RIGHT";
        },

        pathRightDirection(direction: GrammarElement) {
            return "PATH_RIGHT";
        },

        baseDirection(direction: GrammarElement) {
            return "BONDED_BASE";
        },

        pathBaseDirection(direction: GrammarElement) {
            return "PATH_BASE";
        },

        _terminal() {
            // @ts-ignore
            return this.sourceString;
        },

        _iter(e: GrammarElement): any {
            // @ts-ignore
            return this.sourceString;
        }

    };
}

module.exports = {

    createAmalSemanticObject() {
        return generateAmalSemantics();
    }

};