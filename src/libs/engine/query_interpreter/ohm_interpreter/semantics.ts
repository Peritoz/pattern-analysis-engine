import {InputDescriptor} from "@libs/model/input_descriptor/input_descriptor.class";
import {InputRelationship} from "@libs/model/input_descriptor/input_relationship.class";
import {RelationshipDiscriminator} from "@libs/model/input_descriptor/enums/relationship_discriminator.enum";
import {ConnectorDiscriminator} from "@libs/model/input_descriptor/enums/connector_discriminator.enum";
import {InputNode} from "@libs/model/input_descriptor/input_node.class";
import {NodeDiscriminator} from "@libs/model/input_descriptor/enums/node_discriminator.enum";

interface GrammarElement {
    eval: () => any
}

function generateAmalSemantics(query: string) {
    const queryDescriptor = new InputDescriptor(query);

    return {
        Pattern(queryStart: GrammarElement, expression: GrammarElement) {
            expression.eval();

            return queryDescriptor;
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
            const relationship = relationshipType.eval();

            queryDescriptor.addRelationship(relationship);
        },

        BondedShortRelationship(direction: GrammarElement) {
            let sourceType: ConnectorDiscriminator;
            let targetType: ConnectorDiscriminator;
            let relationshipType = direction.eval();

            switch (relationshipType) {
                case "BONDED_RIGHT":
                    sourceType = ConnectorDiscriminator.BONDED_BASE;
                    targetType = ConnectorDiscriminator.BONDED_RIGHT;
                    break;
                case "BONDED_LEFT":
                    sourceType = ConnectorDiscriminator.BONDED_LEFT;
                    targetType = ConnectorDiscriminator.BONDED_BASE;
                    break;
                case "BONDED_BIDIRECTIONAL":
                    sourceType = ConnectorDiscriminator.BONDED_LEFT;
                    targetType = ConnectorDiscriminator.BONDED_RIGHT;
                    break;
                case "BONDED_BASE":
                    sourceType = ConnectorDiscriminator.BONDED_BASE;
                    targetType = ConnectorDiscriminator.BONDED_BASE;
                    break;
                default:
                    sourceType = ConnectorDiscriminator.BONDED_BASE;
                    targetType = ConnectorDiscriminator.BONDED_BASE;
            }

            return new InputRelationship(
                RelationshipDiscriminator.SHORT_RELATIONSHIP,
                sourceType,
                targetType,
                "",
                [],
                false
            );
        },

        PathShortRelationship(direction: GrammarElement) {
            let sourceType: ConnectorDiscriminator;
            let targetType: ConnectorDiscriminator;
            let relationshipType = direction.eval();

            switch (relationshipType) {
                case "PATH_RIGHT":
                    sourceType = ConnectorDiscriminator.PATH_BASE;
                    targetType = relationshipType;
                    break;
                case "PATH_LEFT":
                    sourceType = relationshipType;
                    targetType = ConnectorDiscriminator.PATH_BASE;
                    break;
                case "PATH_BIDIRECTIONAL":
                    sourceType = ConnectorDiscriminator.PATH_LEFT;
                    targetType = ConnectorDiscriminator.PATH_RIGHT;
                    break;
                case "PATH_BASE":
                    sourceType = ConnectorDiscriminator.PATH_LEFT;
                    targetType = ConnectorDiscriminator.PATH_RIGHT;
                    break;
                default:
                    sourceType = ConnectorDiscriminator.PATH_BASE;
                    targetType = ConnectorDiscriminator.PATH_BASE;
            }

            return new InputRelationship(
                RelationshipDiscriminator.SHORT_RELATIONSHIP,
                sourceType,
                targetType,
                "",
                [],
                false
            );
        },

        TypedRelationship(leftDirection: GrammarElement, relationshipDescription: GrammarElement, rightDirection: GrammarElement) {
            let alias = "r" + queryDescriptor.referenceRelationships.length;

            let relationship = relationshipDescription.eval(); // Creates an initialized Relationship element

            relationship.alias = alias;
            relationship.sourceDisc = leftDirection.eval();
            relationship.targetDisc = rightDirection.eval();

            return relationship;
        },

        RelationshipDescription(relationshipStart: GrammarElement, type: GrammarElement, relationshipEnd: GrammarElement) {
            return new InputRelationship(
                RelationshipDiscriminator.TYPED_RELATIONSHIP,
                ConnectorDiscriminator.BONDED_BASE, // DEFAULT VALUE
                ConnectorDiscriminator.BONDED_BASE, // DEFAULT VALUE
                "",
                [type.eval()],
                false
            );
        },

        // Nodes
        NodeElement(node: GrammarElement) {
            return node.eval();
        },

        DescribedNodeElement(nodeStart: GrammarElement, nodeDescription: GrammarElement, nodeEnd: GrammarElement) {
            nodeDescription.eval();
        },

        IdentifiedNodeElement(nodeStart: GrammarElement, nodeName: GrammarElement, nodeEnd: GrammarElement) {
            let alias = "n" + queryDescriptor.identifiers.length;

            const searchTerm = nodeName.eval(); // Order is important here. This must be after the evaluation of "alias"

            queryDescriptor.addNode(new InputNode(
                NodeDiscriminator.IDENTIFIED_NODE,
                alias,
                [],
                searchTerm
            ));
        },

        TypedNodeElement(nodeStart: GrammarElement, type: GrammarElement, nodeEnd: GrammarElement) {
            const alias = "e" + queryDescriptor.referenceNodes.length;
            const elementTypesString = type.eval();
            const elementTypes = elementTypesString.split(" or ");

            queryDescriptor.addNode(new InputNode(
                NodeDiscriminator.TYPED_NODE,
                alias,
                elementTypes,
                ""
            ));
        },

        GroupNodeElement(nodeStart: GrammarElement, selectAll: GrammarElement, nodeEnd: GrammarElement) {
            let alias = "e" + queryDescriptor.referenceNodes.length;

            queryDescriptor.addNode(new InputNode(
                NodeDiscriminator.GROUP_NODE,
                alias,
                [],
                ""
            ));
        },

        NonDescribedNodeElement(nodeStart: GrammarElement, nodeEnd: GrammarElement) {
            queryDescriptor.addNode(new InputNode(
                NodeDiscriminator.NON_DESCRIBED_NODE,
                "",
                [],
                ""
            ));
        },

        NodeDescription(nodeName: GrammarElement, typeIndicator: GrammarElement, type: GrammarElement) {
            let alias = "n" + queryDescriptor.identifiers.length;
            const elementTypesString = type.eval();
            const elementTypes = elementTypesString.split(" or ");

            const searchTerm = nodeName.eval(); // Order is important here. This must be after the evaluation of "alias"

            queryDescriptor.addNode(new InputNode(
                NodeDiscriminator.DESCRIBED_NODE,
                alias,
                elementTypes,
                searchTerm
            ));
        },

        ElementName(delimiterStart: GrammarElement, name: GrammarElement, delimiterEnd: GrammarElement) {
            return name.eval().toLowerCase();
        },

        // Lexical
        bidirectionalDirection(direction: GrammarElement) {
            return "BONDED_BIDIRECTIONAL";
        },

        pathBidirectionalDirection(direction: GrammarElement) {
            return "PATH_BIDIRECTIONAL";
        },

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

    createAmalSemanticObject(query: string) {
        return generateAmalSemantics(query);
    }

};