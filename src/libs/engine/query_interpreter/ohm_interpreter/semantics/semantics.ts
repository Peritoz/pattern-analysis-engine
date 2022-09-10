import { InputDescriptor } from "@libs/model/input_descriptor/input_descriptor.class";
import { InputRelationship } from "@libs/model/input_descriptor/input_relationship.class";
import { RelationshipDiscriminator } from "@libs/model/input_descriptor/enums/relationship_discriminator.enum";
import { ConnectorDiscriminator } from "@libs/model/input_descriptor/enums/connector_discriminator.enum";
import { InputNode } from "@libs/model/input_descriptor/input_node.class";
import { NodeDiscriminator } from "@libs/model/input_descriptor/enums/node_discriminator.enum";
import { extractBondedShortRelationship } from "@libs/engine/query_interpreter/ohm_interpreter/semantics/extractBondedShortRelationship";
import { extractPathShortRelationship } from "@libs/engine/query_interpreter/ohm_interpreter/semantics/extractPathShortRelationship";

export interface GrammarElement {
  sourceString: string;
  eval: () => any;
}

export default function generateAmaqlSemantics(query: string): object {
  const queryDescriptor = new InputDescriptor(query);

  return {
    Pattern(queryStart: GrammarElement, expression: GrammarElement) {
      expression.eval();

      return queryDescriptor;
    },

    FirstLongPattern(
      firstNode: GrammarElement,
      relationship: GrammarElement,
      patternPart: GrammarElement
    ) {
      firstNode.eval();
      relationship.eval();
      patternPart.eval();
    },

    LongPattern(startPattern: GrammarElement, patternPart: GrammarElement) {
      startPattern.eval();
      patternPart.eval();
    },

    StartLongPattern(
      nodeElement: GrammarElement,
      relationship: GrammarElement
    ) {
      nodeElement.eval();
      relationship.eval();
    },

    // Relationships
    Relationship(relationshipType: GrammarElement) {
      const relationship = relationshipType.eval();

      queryDescriptor.addRelationship(relationship);
    },

    BondedShortRelationship(direction: GrammarElement) {
      return extractBondedShortRelationship(direction.eval());
    },

    PathShortRelationship(direction: GrammarElement) {
      return extractPathShortRelationship(direction.eval());
    },

    TypedRelationship(
      typedRelationship: GrammarElement
    ) {
      return typedRelationship.eval();
    },

    RightTypedRelationship(
        leftDirection: GrammarElement,
        relationshipDescription: GrammarElement,
        rightDirection: GrammarElement
    ) {
      let alias = "r" + queryDescriptor.referenceRelationships.length;

      let relationship = relationshipDescription.eval(); // Creates an initialized Relationship element

      relationship.alias = alias;
      relationship.sourceDisc = leftDirection.eval();
      relationship.targetDisc = rightDirection.eval();

      return relationship;
    },

    LeftTypedRelationship(
        leftDirection: GrammarElement,
        relationshipDescription: GrammarElement,
        rightDirection: GrammarElement
    ) {
      let alias = "r" + queryDescriptor.referenceRelationships.length;

      let relationship = relationshipDescription.eval(); // Creates an initialized Relationship element

      relationship.alias = alias;
      relationship.sourceDisc = leftDirection.eval();
      relationship.targetDisc = rightDirection.eval();

      return relationship;
    },

    RelationshipDescription(
      relationshipStart: GrammarElement,
      type: GrammarElement,
      relationshipEnd: GrammarElement
    ) {
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

    DescribedNodeElement(
      nodeStart: GrammarElement,
      nodeDescription: GrammarElement,
      nodeEnd: GrammarElement
    ) {
      nodeDescription.eval();
    },

    IdentifiedNodeElement(
      nodeStart: GrammarElement,
      nodeName: GrammarElement,
      nodeEnd: GrammarElement
    ) {
      let alias = "n" + queryDescriptor.identifiers.length;

      const searchTerm = nodeName.eval(); // Order is important here. This must be after the evaluation of "alias"

      queryDescriptor.addNode(
        new InputNode(NodeDiscriminator.IDENTIFIED_NODE, alias, [], searchTerm)
      );
    },

    TypedNodeElement(
      nodeStart: GrammarElement,
      type: GrammarElement,
      nodeEnd: GrammarElement
    ) {
      const alias = "e" + queryDescriptor.referenceNodes.length;
      const elementTypesString = type.eval();
      const elementTypes = elementTypesString.split(" or ");

      queryDescriptor.addNode(
        new InputNode(NodeDiscriminator.TYPED_NODE, alias, elementTypes, "")
      );
    },

    GroupNodeElement(
      nodeStart: GrammarElement,
      selectAll: GrammarElement,
      nodeEnd: GrammarElement
    ) {
      let alias = "e" + queryDescriptor.referenceNodes.length;

      queryDescriptor.addNode(
        new InputNode(NodeDiscriminator.GROUP_NODE, alias, [], "")
      );
    },

    NonDescribedNodeElement(
      nodeStart: GrammarElement,
      nodeEnd: GrammarElement
    ) {
      queryDescriptor.addNode(
        new InputNode(NodeDiscriminator.NON_DESCRIBED_NODE, "", [], "")
      );
    },

    NodeDescription(
      nodeName: GrammarElement,
      typeIndicator: GrammarElement,
      type: GrammarElement
    ) {
      let alias = "n" + queryDescriptor.identifiers.length;
      const elementTypesString = type.eval();
      const elementTypes = elementTypesString.split(" or ");

      const searchTerm = nodeName.eval(); // Order is important here. This must be after the evaluation of "alias"

      queryDescriptor.addNode(
        new InputNode(
          NodeDiscriminator.DESCRIBED_NODE,
          alias,
          elementTypes,
          searchTerm
        )
      );
    },

    ElementName(
      delimiterStart: GrammarElement,
      name: GrammarElement,
      delimiterEnd: GrammarElement
    ) {
      return name.eval().toLowerCase();
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

    label(validChars: GrammarElement) {
      return validChars.sourceString;
    },

    _terminal(): string {
      // @ts-ignore
      return this.sourceString;
    },
  };
}
