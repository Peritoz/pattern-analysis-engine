import { mountInputDescriptor } from '../../../src/libs/engine/query_interpreter';
import { InputNode } from '../../../src/libs/model/input_descriptor/input_node.class';
import { InputRelationship } from '../../../src/libs/model/input_descriptor/input_relationship.class';
import { validate_query_chain } from '../utils/validate_query_chain';
import { QueryDescriptor } from '../../../src';
import { NodeDiscriminator } from '../../../src/libs/model/input_descriptor/enums/node_discriminator.enum';
import { RelationshipDiscriminator } from '../../../src/libs/model/input_descriptor/enums/relationship_discriminator.enum';
import { ConnectorDiscriminator } from '../../../src/libs/model/input_descriptor/enums/connector_discriminator.enum';

describe('Query Translation', () => {
  describe('Basic Query Construction', () => {
    it('Described Node', done => {
      const inputDescriptor = mountInputDescriptor("?('name')");

      expect(
        validate_query_chain(inputDescriptor, [
          new InputNode(NodeDiscriminator.IDENTIFIED_NODE, '', [], 'name'),
        ]),
      ).toBeTruthy();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

      expect(queryDescriptor?.isComplexQuery()).toBeFalsy();
      expect(queryDescriptor?.queryFilter?.types.length).toBe(0);
      expect(queryDescriptor?.queryFilter?.searchTerm).toBe('name');

      done();
    });

    it('Described Node / Typed Node', done => {
      const inputDescriptor = mountInputDescriptor("?('mongod':software)");

      expect(
        validate_query_chain(inputDescriptor, [
          new InputNode(NodeDiscriminator.DESCRIBED_NODE, '', ['software'], 'mongod'),
        ]),
      ).toBeTruthy();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

      expect(queryDescriptor?.isComplexQuery()).toBeFalsy();
      expect(queryDescriptor?.queryFilter?.types).toContain('software');
      expect(queryDescriptor?.queryFilter?.searchTerm).toBe('mongod');

      done();
    });

    it('Described Node / Typed Node with Multiple Types', done => {
      const inputDescriptor = mountInputDescriptor("?('mongod':software or node or artifact)");

      expect(
        validate_query_chain(inputDescriptor, [
          new InputNode(
            NodeDiscriminator.DESCRIBED_NODE,
            '',
            ['software', 'node', 'artifact'],
            'mongod',
          ),
        ]),
      ).toBeTruthy();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

      expect(queryDescriptor?.isComplexQuery()).toBeFalsy();
      expect(queryDescriptor?.queryFilter?.types).toContain('software');
      expect(queryDescriptor?.queryFilter?.types).toContain('node');
      expect(queryDescriptor?.queryFilter?.types).toContain('artifact');
      expect(queryDescriptor?.queryFilter?.searchTerm).toBe('mongod');

      done();
    });

    it('Typed Node', done => {
      const inputDescriptor = mountInputDescriptor('?(software)');

      expect(
        validate_query_chain(inputDescriptor, [
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['software'], ''),
        ]),
      ).toBeTruthy();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

      expect(queryDescriptor?.isComplexQuery()).toBeFalsy();
      expect(queryDescriptor?.queryFilter?.types).toContain('software');
      expect(queryDescriptor?.queryFilter?.searchTerm).toBe('');

      done();
    });

    it('Typed Node with Multiple Types', done => {
      const inputDescriptor = mountInputDescriptor('?(software or node)');

      expect(
        validate_query_chain(inputDescriptor, [
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['software', 'node'], ''),
        ]),
      ).toBeTruthy();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

      expect(queryDescriptor?.isComplexQuery()).toBeFalsy();
      expect(queryDescriptor?.queryFilter?.types).toContain('software');
      expect(queryDescriptor?.queryFilter?.types).toContain('node');
      expect(queryDescriptor?.queryFilter?.searchTerm).toBe('');

      done();
    });

    it('Typed Node - With Space Before and After', done => {
      const inputDescriptor = mountInputDescriptor('    ?(artifact)  ');

      expect(
        validate_query_chain(inputDescriptor, [
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['artifact'], ''),
        ]),
      ).toBeTruthy();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

      expect(queryDescriptor?.isComplexQuery()).toBeFalsy();
      expect(queryDescriptor?.queryFilter?.types).toContain('artifact');
      expect(queryDescriptor?.queryFilter?.searchTerm).toBe('');

      done();
    });
  });

  describe('Complex Query Construction', () => {
    it("?(a)=[r1]=>(b)=[r2]=>('C':c)<-(*)", done => {
      const inputDescriptor = mountInputDescriptor("?(a)=[r1]=>(b)=[r2]=>('C':c)<-(*)");

      expect(
        validate_query_chain(inputDescriptor, [
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['a'], ''),
          new InputRelationship(
            RelationshipDiscriminator.TYPED_RELATIONSHIP,
            ConnectorDiscriminator.PATH_BASE,
            ConnectorDiscriminator.PATH_RIGHT,
            '',
            ['r1'],
            false,
          ),
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['b'], ''),
          new InputRelationship(
            RelationshipDiscriminator.TYPED_RELATIONSHIP,
            ConnectorDiscriminator.PATH_BASE,
            ConnectorDiscriminator.PATH_RIGHT,
            '',
            ['r2'],
            false,
          ),
          new InputNode(NodeDiscriminator.DESCRIBED_NODE, '', ['c'], 'C'),
          new InputRelationship(
            RelationshipDiscriminator.SHORT_RELATIONSHIP,
            ConnectorDiscriminator.BONDED_LEFT,
            ConnectorDiscriminator.BONDED_BASE,
            '',
            [],
            false,
          ),
          new InputNode(NodeDiscriminator.GROUP_NODE, '', [], ''),
        ]),
      ).toBeTruthy();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

      expect(queryDescriptor.isComplexQuery()).toBeTruthy();
      expect(queryDescriptor.queryChain).toHaveLength(3);

      done();
    });
  });

  describe('Relationship Construction', () => {
    it('Short Relationship ->', done => {
      const inputDescriptor = mountInputDescriptor('?(node)->(artifact)');

      expect(
        validate_query_chain(inputDescriptor, [
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['node'], ''),
          new InputRelationship(
            RelationshipDiscriminator.SHORT_RELATIONSHIP,
            ConnectorDiscriminator.BONDED_BASE,
            ConnectorDiscriminator.BONDED_RIGHT,
            '',
            [],
            false,
          ),
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['artifact'], ''),
        ]),
      ).toBeTruthy();

      done();
    });

    it('Short Relationship <-', done => {
      const inputDescriptor = mountInputDescriptor('?(node)<-(artifact)');

      expect(
        validate_query_chain(inputDescriptor, [
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['node'], ''),
          new InputRelationship(
            RelationshipDiscriminator.SHORT_RELATIONSHIP,
            ConnectorDiscriminator.BONDED_LEFT,
            ConnectorDiscriminator.BONDED_BASE,
            '',
            [],
            false,
          ),
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['artifact'], ''),
        ]),
      ).toBeTruthy();

      done();
    });

    it('Bonded Relationship ->', done => {
      const inputDescriptor = mountInputDescriptor('?(node)-[assignment]->(artifact)');

      expect(
        validate_query_chain(inputDescriptor, [
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['node'], ''),
          new InputRelationship(
            RelationshipDiscriminator.TYPED_RELATIONSHIP,
            ConnectorDiscriminator.BONDED_BASE,
            ConnectorDiscriminator.BONDED_RIGHT,
            '',
            ['assignment'],
            false,
          ),
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['artifact'], ''),
        ]),
      ).toBeTruthy();

      done();
    });

    it('Bonded Relationship <-', done => {
      const inputDescriptor = mountInputDescriptor('?(node)<-[assignment]-(artifact)');

      expect(
        validate_query_chain(inputDescriptor, [
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['node'], ''),
          new InputRelationship(
            RelationshipDiscriminator.TYPED_RELATIONSHIP,
            ConnectorDiscriminator.BONDED_LEFT,
            ConnectorDiscriminator.BONDED_BASE,
            '',
            ['assignment'],
            false,
          ),
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['artifact'], ''),
        ]),
      ).toBeTruthy();

      done();
    });

    it('Path Relationship ->', done => {
      const inputDescriptor = mountInputDescriptor('?(node)=[assignment]=>(artifact)');

      expect(
        validate_query_chain(inputDescriptor, [
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['node'], ''),
          new InputRelationship(
            RelationshipDiscriminator.TYPED_RELATIONSHIP,
            ConnectorDiscriminator.PATH_BASE,
            ConnectorDiscriminator.PATH_RIGHT,
            '',
            ['assignment'],
            false,
          ),
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['artifact'], ''),
        ]),
      ).toBeTruthy();

      done();
    });

    it('Path Relationship <-', done => {
      const inputDescriptor = mountInputDescriptor('?(node)<=[assignment]=(artifact)');

      expect(
        validate_query_chain(inputDescriptor, [
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['node'], ''),
          new InputRelationship(
            RelationshipDiscriminator.TYPED_RELATIONSHIP,
            ConnectorDiscriminator.PATH_LEFT,
            ConnectorDiscriminator.PATH_BASE,
            '',
            ['assignment'],
            false,
          ),
          new InputNode(NodeDiscriminator.TYPED_NODE, '', ['artifact'], ''),
        ]),
      ).toBeTruthy();

      done();
    });
  });

  describe('Bad Query Construction', () => {
    it('Should Return Error - Empty Query', done => {
      expect(() => {
        mountInputDescriptor('?');
      }).toThrow('Invalid query');

      done();
    });

    it('Should Return Error - Nested Node', done => {
      expect(() => {
        mountInputDescriptor('?((artifact)))');
      }).toThrow('Invalid query');

      done();
    });

    it('Should Return Error - Invalid Nodes Positioning', done => {
      expect(() => {
        mountInputDescriptor('?(artifact)(node)');
      }).toThrow('Invalid query');

      done();
    });

    it('Should Return Error - Invalid Relationship', done => {
      expect(() => {
        mountInputDescriptor('?(artifact)(node)->');
      }).toThrow('Invalid query');

      done();
    });

    it('Should Return Error - Group Node Alone', done => {
      expect(() => {
        mountInputDescriptor('?(*)');
      }).toThrow('Invalid query');

      done();
    });

    it('Should Return Error - Not Described Node Alone', done => {
      expect(() => {
        mountInputDescriptor('?()');
      }).toThrow('Invalid query');

      done();
    });

    it('Should Return Error - Not starting with Not Described Node', done => {
      expect(() => {
        mountInputDescriptor('?()<=[serving]=(component)');
      }).toThrow('Invalid query');

      done();
    });

    it('Should Return Error - Not starting with Inclusive Node', done => {
      expect(() => {
        mountInputDescriptor('?(*)<=[serving]=(component)');
      }).toThrow('Invalid query');

      done();
    });

    it('Should Return Error - Bidirectional bound relationship', done => {
      expect(() => {
        mountInputDescriptor('?(software)-(server)');
      }).toThrow('Invalid query');

      done();
    });

    it('Should Return Error - Bidirectional bound relationship (Variant)', done => {
      expect(() => {
        mountInputDescriptor('?(software)<->(server)');
      }).toThrow('Invalid query');

      done();
    });

    it('Should Return Error - Bidirectional bound relationship with type', done => {
      expect(() => {
        mountInputDescriptor('?(software)-[type]-(server)');
      }).toThrow('Invalid query');

      done();
    });

    it('Should Return Error - Bidirectional bound relationship with type (Variant)', done => {
      expect(() => {
        mountInputDescriptor('?(software)<-[type]->(server)');
      }).toThrow('Invalid query');

      done();
    });

    it('Should Return Error - Bidirectional path relationship', done => {
      expect(() => {
        mountInputDescriptor('?(software)=(server)');
      }).toThrow('Invalid query');

      done();
    });

    it('Should Return Error - Bidirectional path relationship (Variant)', done => {
      expect(() => {
        mountInputDescriptor('?(software)<=>(server)');
      }).toThrow('Invalid query');

      done();
    });

    it('Should Return Error - Bidirectional path relationship with type', done => {
      expect(() => {
        mountInputDescriptor('?(software)=[type]=(server)');
      }).toThrow('Invalid query');

      done();
    });

    it('Should Return Error - Bidirectional path relationship with type (Variant)', done => {
      expect(() => {
        mountInputDescriptor('?(software)<=[type]=>(server)');
      }).toThrow('Invalid query');

      done();
    });
  });
});
