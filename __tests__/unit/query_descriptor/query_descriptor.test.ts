import { Direction } from '../../../src/libs/model/common/enums/direction.enum';
import { ConnectorDiscriminator } from '../../../src/libs/model/input_descriptor/enums/connector_discriminator.enum';
import { NodeDiscriminator } from '../../../src/libs/model/input_descriptor/enums/node_discriminator.enum';
import { RelationshipDiscriminator } from '../../../src/libs/model/input_descriptor/enums/relationship_discriminator.enum';
import { InputDescriptor } from '../../../src/libs/model/input_descriptor/input_descriptor.class';
import { InputNode } from '../../../src/libs/model/input_descriptor/input_node.class';
import { InputRelationship } from '../../../src/libs/model/input_descriptor/input_relationship.class';
import { QueryDescriptor } from '../../../src/libs/model/query_descriptor/query_descriptor.class';
import { QueryNode } from '../../../src/libs/model/query_descriptor/query_node.class';
import { QueryRelationship } from '../../../src/libs/model/query_descriptor/query_relationship.class';
import { QueryTriple } from '../../../src/libs/model/query_descriptor/query_triple.class';

const makeNode = (alias: string, discriminator = NodeDiscriminator.TYPED_NODE) =>
  new InputNode(discriminator, alias, ['Type'], alias ? `${alias}Name` : '');

const makeRelationship = (sourceDisc: ConnectorDiscriminator, targetDisc: ConnectorDiscriminator) =>
  new InputRelationship(
    RelationshipDiscriminator.TYPED_RELATIONSHIP,
    sourceDisc,
    targetDisc,
    'relationship',
    ['RELATES_TO'],
    false,
  );

describe('query descriptors', () => {
  it('records aliases and converts a homogeneous relationship to one triple', () => {
    const descriptor = new InputDescriptor('?(left)-[rel]->(right)');
    descriptor.addNode(makeNode('left'));
    descriptor.addRelationship(
      makeRelationship(ConnectorDiscriminator.BONDED_BASE, ConnectorDiscriminator.BONDED_RIGHT),
    );
    descriptor.addNode(makeNode('right'));

    const query = descriptor.generateQueryDescriptor();

    expect(descriptor.referenceNodes).toEqual(['left', 'right']);
    expect(descriptor.referenceRelationships).toEqual(['relationship']);
    expect(descriptor.identifiers).toEqual([
      { alias: 'left', searchTerm: 'leftname' },
      { alias: 'right', searchTerm: 'rightname' },
    ]);
    expect(query.queryChain).toHaveLength(1);
    expect(query.queryChain[0].relationship.direction).toBe(Direction.OUTBOUND);
    expect(query.queryChain[0].relationship.isDerived).toBe(false);
  });

  it('expands heterogeneous relationships and preserves the derivation side', () => {
    const descriptor = new InputDescriptor('?(left)=[rel]->(right)');
    descriptor.addNode(makeNode('left'));
    descriptor.addRelationship(
      makeRelationship(ConnectorDiscriminator.PATH_BASE, ConnectorDiscriminator.BONDED_RIGHT),
    );
    descriptor.addNode(makeNode('right', NodeDiscriminator.NON_DESCRIBED_NODE));

    const query = descriptor.generateQueryDescriptor();

    expect(query.queryChain).toHaveLength(2);
    expect(query.queryChain[0].relationship.isDerived).toBe(true);
    expect(query.queryChain[1].relationship.isDerived).toBe(false);
    expect(query.queryChain[0].rightNode.shouldBeReturned).toBe(false);
    expect(query.queryChain[1].rightNode.shouldBeReturned).toBe(false);
  });

  it('rejects attempts to mix query filters and triples', () => {
    const filterQuery = new QueryDescriptor('?()');
    filterQuery.setFilter(['type'], 'name');

    expect(filterQuery.queryFilter).toEqual({ types: ['type'], searchTerm: 'name' });
    expect(filterQuery.isComplexQuery()).toBe(false);
    expect(() => filterQuery.addTriple(makeTriple(Direction.OUTBOUND))).toThrow('filter defined');

    const chainQuery = new QueryDescriptor('?(a)->(b)');
    chainQuery.addTriples([makeTriple(Direction.OUTBOUND)]);

    expect(chainQuery.isComplexQuery()).toBe(true);
    expect(() => chainQuery.setFilter([], '')).toThrow('defined query chain');
  });
});

const makeTriple = (direction: Direction) =>
  new QueryTriple(
    new QueryNode([], ''),
    new QueryRelationship([], direction, false),
    new QueryNode([], ''),
  );

describe('query triples', () => {
  it.each([
    [Direction.INBOUND, 'right'],
    [Direction.OUTBOUND, 'left'],
  ])('assigns input IDs to the correct endpoint for direction %s', (direction, inputNode) => {
    const triple = makeTriple(direction);

    triple.setInputIds(['input']);

    expect(inputNode === 'left' ? triple.leftNode.ids : triple.rightNode.ids).toEqual(['input']);
  });

  it('assigns IDs to both endpoints for bidirectional triples', () => {
    const triple = makeTriple(Direction.BIDIRECTIONAL);

    triple.setInputIds(['input']);
    triple.setOutputIds(['output']);

    expect(triple.leftNode.ids).toEqual(['output']);
    expect(triple.rightNode.ids).toEqual(['output']);
    expect(triple.getInputIds()).toEqual(['output']);
    expect(triple.getOutputIds()).toEqual(['output']);
  });
});
