import { InputRelationship } from '@libs/model/input_descriptor/input_relationship.class';
import { InputNode } from '@libs/model/input_descriptor/input_node.class';
import { QueryDescriptor } from '@libs/model/query_descriptor/query_descriptor.class';
import { QueryTriple } from '@libs/model/query_descriptor/query_triple.class';
import { QueryNode } from '@libs/model/query_descriptor/query_node.class';
import { QueryRelationship } from '@libs/model/query_descriptor/query_relationship.class';
import { Direction } from '@libs/model/common/enums/direction.enum';
import { NodeDiscriminator } from '@libs/model/input_descriptor/enums/node_discriminator.enum';

export class InputDescriptor {
  protected _query = '';
  protected _identifiers: Array<{ alias: string; searchTerm: string }> = [];
  protected _referenceNodes: Array<string> = [];
  protected _referenceRelationships: Array<string> = [];
  protected _queryChain: Array<InputNode | InputRelationship> = [];
  protected _responseOrder: Array<string> = [];

  constructor(query: string) {
    this._query = query;
  }

  get identifiers(): Array<{ alias: string; searchTerm: string }> {
    return this._identifiers;
  }

  get referenceNodes(): Array<string> {
    return this._referenceNodes;
  }

  get referenceRelationships(): Array<string> {
    return this._referenceRelationships;
  }

  get queryChain(): Array<InputNode | InputRelationship> {
    return this._queryChain;
  }

  addNode(node: InputNode) {
    this._queryChain.push(node);

    const alias = node.alias;

    this._responseOrder.push(alias);

    if (alias) {
      this.referenceNodes.push(alias);

      const searchTerm = node.searchTerm;

      if (searchTerm) {
        this._identifiers.push({ alias, searchTerm });
      }
    }
  }

  addRelationship(relationship: InputRelationship) {
    this._queryChain.push(relationship);

    const alias = relationship.alias;

    if (alias) {
      this._referenceRelationships.push(alias);
    }
  }

  generateQueryDescriptor(): QueryDescriptor {
    const queryDescriptor = new QueryDescriptor(this._query);

    if (this._queryChain.length > 2) {
      for (let i = 0; i < this._queryChain.length; i = i + 2) {
        if (
          this._queryChain[i] instanceof InputNode &&
          this._queryChain[i + 1] instanceof InputRelationship &&
          this._queryChain[i + 2] instanceof InputNode
        ) {
          const leftNode: InputNode = this._queryChain[i] as InputNode;
          const rel: InputRelationship = this._queryChain[i + 1] as InputRelationship;
          const rightNode: InputNode = this._queryChain[i + 2] as InputNode;
          const triples = InputDescriptor._generateTriple(leftNode, rel, rightNode);

          queryDescriptor.addTriples(triples);
        }
      }
    } else if (this._queryChain.length === 1) {
      const firstElement: InputNode | InputRelationship = this._queryChain[0];

      if (firstElement instanceof InputNode) {
        queryDescriptor.setFilter(firstElement.types, firstElement.searchTerm);
      } else {
        throw new Error(`Inconsistent query: ${this._query}. The first element should be a node`);
      }
    }

    return queryDescriptor;
  }

  protected static _generateTriple(
    leftNode: InputNode,
    rel: InputRelationship,
    rightNode: InputNode,
  ): Array<QueryTriple> {
    let triples: Array<QueryTriple> = [];
    const leftQueryNode = new QueryNode(
      leftNode.types,
      leftNode.searchTerm,
      [],
      leftNode.discriminator !== NodeDiscriminator.NON_DESCRIBED_NODE,
    );
    const rightQueryNode = new QueryNode(
      rightNode.types,
      rightNode.searchTerm,
      [],
      rightNode.discriminator !== NodeDiscriminator.NON_DESCRIBED_NODE,
    );

    if (rel.isHomogeneous) {
      // If homogeneous, there is no need to be expanded
      const isDerived = rel.isSourceDerived; // No need to verify booth connectors
      triples = [
        new QueryTriple(
          leftQueryNode,
          new QueryRelationship(rel.types, rel.getDirectionAsNumber(), rel.isNegated, isDerived),
          rightQueryNode,
        ),
      ];
    } else {
      const nonDefinedNode = new QueryNode([], '', [], false);

      if (rel.isBidirectional) {
        // Is a heterogeneous and bidirectional relationship
        triples = [
          new QueryTriple(
            leftQueryNode,
            new QueryRelationship(rel.types, Direction.INBOUND, rel.isNegated, rel.isSourceDerived),
            nonDefinedNode,
          ),
          new QueryTriple(
            nonDefinedNode,
            new QueryRelationship(
              rel.types,
              Direction.OUTBOUND,
              rel.isNegated,
              rel.isTargetDerived,
            ),
            rightQueryNode,
          ),
        ];
      } else {
        // Is a heterogeneous and directed relationship
        triples = [
          new QueryTriple(
            leftQueryNode,
            new QueryRelationship(
              rel.types,
              rel.getDirectionAsNumber(),
              rel.isNegated,
              rel.isSourceDerived,
            ),
            nonDefinedNode,
          ),
          new QueryTriple(
            nonDefinedNode,
            new QueryRelationship(
              rel.types,
              rel.getDirectionAsNumber(),
              rel.isNegated,
              rel.isTargetDerived,
            ),
            rightQueryNode,
          ),
        ];
      }
    }

    return triples;
  }
}
