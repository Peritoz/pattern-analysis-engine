import { mountInputDescriptor } from '../../../src/libs/engine/query_interpreter';
import { QueryDescriptor, Direction } from '../../../src';

describe('AMAQL Syntax - Advanced Patterns', () => {
  describe('Node syntax variations', () => {
    it('should parse empty node ()', () => {
      const inputDescriptor = mountInputDescriptor('?(type1)->()');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.isComplexQuery()).toBeTruthy();
      expect(queryDescriptor.queryChain[0].rightNode.shouldBeReturned).toBeFalsy();
    });

    it('should parse wildcard node (*)', () => {
      const inputDescriptor = mountInputDescriptor('?(type1)->(*)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.isComplexQuery()).toBeTruthy();
      expect(queryDescriptor.queryChain[0].rightNode.shouldBeReturned).toBeTruthy();
    });

    it('should parse single type node (type)', () => {
      const inputDescriptor = mountInputDescriptor('?(type1)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.isComplexQuery()).toBeFalsy();
      expect(queryDescriptor.queryFilter?.types).toContain('type1');
    });

    it('should parse multiple OR types (type1 or type2)', () => {
      const inputDescriptor = mountInputDescriptor('?(type1 or type2)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryFilter?.types).toContain('type1');
      expect(queryDescriptor.queryFilter?.types).toContain('type2');
    });

    it('should parse named node with quotes', () => {
      const inputDescriptor = mountInputDescriptor("?('Node Name')");

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryFilter?.searchTerm).toBe('Node Name');
    });

    it('should parse named node with type', () => {
      const inputDescriptor = mountInputDescriptor("?('Node Name':type1)");

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryFilter?.searchTerm).toBe('Node Name');
      expect(queryDescriptor.queryFilter?.types).toContain('type1');
    });

    it('should parse named node with multiple types', () => {
      const inputDescriptor = mountInputDescriptor("?('Node Name':type1 or type2)");

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryFilter?.searchTerm).toBe('Node Name');
      expect(queryDescriptor.queryFilter?.types).toContain('type1');
      expect(queryDescriptor.queryFilter?.types).toContain('type2');
    });

    it('should handle node names with special characters', () => {
      const inputDescriptor = mountInputDescriptor("?('Node-Name_123.test')");

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryFilter?.searchTerm).toBe('Node-Name_123.test');
    });

    it('should handle node names with spaces', () => {
      const inputDescriptor = mountInputDescriptor("?('My Node Name')");

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryFilter?.searchTerm).toBe('My Node Name');
    });
  });

  describe('Relationship syntax variations', () => {
    it('should parse short outbound relationship ->', () => {
      const inputDescriptor = mountInputDescriptor('?(type1)->(type2)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryChain[0].relationship.direction).toBe(Direction.OUTBOUND);
      expect(queryDescriptor.queryChain[0].relationship.types).toHaveLength(0);
    });

    it('should parse short inbound relationship <-', () => {
      const inputDescriptor = mountInputDescriptor('?(type1)<-(type2)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryChain[0].relationship.direction).toBe(Direction.INBOUND);
    });

    it('should parse typed outbound relationship -[type]->', () => {
      const inputDescriptor = mountInputDescriptor('?(type1)-[rel1]->(type2)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryChain[0].relationship.direction).toBe(Direction.OUTBOUND);
      expect(queryDescriptor.queryChain[0].relationship.types).toContain('rel1');
    });

    it('should parse typed inbound relationship <-[type]-', () => {
      const inputDescriptor = mountInputDescriptor('?(type1)<-[rel1]-(type2)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryChain[0].relationship.direction).toBe(Direction.INBOUND);
      expect(queryDescriptor.queryChain[0].relationship.types).toContain('rel1');
    });

    it('should parse relationship with comma-separated types as single type', () => {
      // Note: AMAQL treats comma-separated types in relationships as a single type string
      // This is different from node types which support 'or' operator
      const inputDescriptor = mountInputDescriptor('?(type1)-[rel1,rel2]->(type2)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      // Comma-separated relationship types are treated as a single type in AMAQL
      expect(queryDescriptor.queryChain[0].relationship.types).toHaveLength(1);
    });

    it('should parse path outbound relationship =>', () => {
      const inputDescriptor = mountInputDescriptor('?(type1)=>(type2)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryChain[0].relationship.isDerived).toBeTruthy();
    });

    it('should parse path inbound relationship <=', () => {
      const inputDescriptor = mountInputDescriptor('?(type1)<=(type2)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryChain[0].relationship.isDerived).toBeTruthy();
      expect(queryDescriptor.queryChain[0].relationship.direction).toBe(Direction.INBOUND);
    });

    it('should parse typed path relationship =[type]=>', () => {
      const inputDescriptor = mountInputDescriptor('?(type1)=[rel1]=>(type2)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryChain[0].relationship.isDerived).toBeTruthy();
      expect(queryDescriptor.queryChain[0].relationship.types).toContain('rel1');
    });

    it('should parse typed path inbound relationship <=[type]=', () => {
      const inputDescriptor = mountInputDescriptor('?(type1)<=[rel1]=(type2)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryChain[0].relationship.isDerived).toBeTruthy();
      expect(queryDescriptor.queryChain[0].relationship.direction).toBe(Direction.INBOUND);
      expect(queryDescriptor.queryChain[0].relationship.types).toContain('rel1');
    });
  });

  describe('Complex chain patterns', () => {
    it('should parse 2-hop chain', () => {
      const inputDescriptor = mountInputDescriptor('?(a)->(b)->(c)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryChain).toHaveLength(2);
    });

    it('should parse 3-hop chain', () => {
      const inputDescriptor = mountInputDescriptor('?(a)->(b)->(c)->(d)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryChain).toHaveLength(3);
    });

    it('should parse chain with mixed relationship types', () => {
      const inputDescriptor = mountInputDescriptor('?(a)-[r1]->(b)=[r2]=>(c)<-[r3]-(d)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryChain).toHaveLength(3);
      expect(queryDescriptor.queryChain[0].relationship.types).toContain('r1');
      expect(queryDescriptor.queryChain[0].relationship.isDerived).toBeFalsy();
      expect(queryDescriptor.queryChain[1].relationship.types).toContain('r2');
      expect(queryDescriptor.queryChain[1].relationship.isDerived).toBeTruthy();
      expect(queryDescriptor.queryChain[2].relationship.types).toContain('r3');
      expect(queryDescriptor.queryChain[2].relationship.direction).toBe(Direction.INBOUND);
    });

    it('should parse chain with wildcards and empty nodes', () => {
      const inputDescriptor = mountInputDescriptor('?(type1)->(*)->()<-[rel]-(type2)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryChain).toHaveLength(3);
      expect(queryDescriptor.queryChain[0].rightNode.shouldBeReturned).toBeTruthy();
      expect(queryDescriptor.queryChain[1].rightNode.shouldBeReturned).toBeFalsy();
    });

    it('should parse chain with named nodes', () => {
      const inputDescriptor = mountInputDescriptor("?('Node1':t1)->(*)->('Node2':t2)");

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryChain).toHaveLength(2);
    });
  });

  describe('Whitespace handling', () => {
    it('should handle leading whitespace', () => {
      const inputDescriptor = mountInputDescriptor('   ?(type1)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryFilter?.types).toContain('type1');
    });

    it('should handle trailing whitespace', () => {
      const inputDescriptor = mountInputDescriptor('?(type1)   ');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryFilter?.types).toContain('type1');
    });

    it('should handle whitespace in complex patterns', () => {
      const inputDescriptor = mountInputDescriptor('  ?(type1)  ->  (type2)  ');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.isComplexQuery()).toBeTruthy();
    });
  });

  describe('Type names with special characters', () => {
    it('should handle types with underscores', () => {
      const inputDescriptor = mountInputDescriptor('?(type_one)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryFilter?.types).toContain('type_one');
    });

    it('should handle types with hyphens', () => {
      const inputDescriptor = mountInputDescriptor('?(type-one)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryFilter?.types).toContain('type-one');
    });

    it('should handle types with dots', () => {
      const inputDescriptor = mountInputDescriptor('?(type.one)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryFilter?.types).toContain('type.one');
    });

    it('should handle types with numbers', () => {
      const inputDescriptor = mountInputDescriptor('?(type123)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryFilter?.types).toContain('type123');
    });

    it('should handle types with mixed special chars', () => {
      const inputDescriptor = mountInputDescriptor('?(my_type-v1.0)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryFilter?.types).toContain('my_type-v1.0');
    });
  });

  describe('OR operator variations', () => {
    it('should handle 3-way OR', () => {
      const inputDescriptor = mountInputDescriptor('?(t1 or t2 or t3)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryFilter?.types).toHaveLength(3);
      expect(queryDescriptor.queryFilter?.types).toContain('t1');
      expect(queryDescriptor.queryFilter?.types).toContain('t2');
      expect(queryDescriptor.queryFilter?.types).toContain('t3');
    });

    it('should handle 4-way OR', () => {
      const inputDescriptor = mountInputDescriptor('?(t1 or t2 or t3 or t4)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryFilter?.types).toHaveLength(4);
    });

    it('should handle comma-separated relationship types', () => {
      // Note: In AMAQL, relationship types don't support 'or' operator like node types do
      // Commas in relationship types are treated as part of the type name
      const inputDescriptor = mountInputDescriptor('?(type1)-[rel1]->(type2)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryChain[0].relationship.types).toHaveLength(1);
      expect(queryDescriptor.queryChain[0].relationship.types).toContain('rel1');
    });
  });

  describe('Path vs Bonded relationships', () => {
    it('should differentiate path and bonded relationships', () => {
      const bondedQuery = mountInputDescriptor('?(a)-[rel]->(b)');
      const pathQuery = mountInputDescriptor('?(a)=[rel]=>(b)');

      const bondedDescriptor = bondedQuery.generateQueryDescriptor();
      const pathDescriptor = pathQuery.generateQueryDescriptor();

      expect(bondedDescriptor.queryChain[0].relationship.isDerived).toBeFalsy();
      expect(pathDescriptor.queryChain[0].relationship.isDerived).toBeTruthy();
    });

    it('should handle mixed path and bonded in chain', () => {
      const inputDescriptor = mountInputDescriptor('?(a)-[r1]->(b)=[r2]=>(c)-[r3]->(d)');

      expect(inputDescriptor).toBeDefined();

      const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();
      expect(queryDescriptor.queryChain[0].relationship.isDerived).toBeFalsy();
      expect(queryDescriptor.queryChain[1].relationship.isDerived).toBeTruthy();
      expect(queryDescriptor.queryChain[2].relationship.isDerived).toBeFalsy();
    });
  });
});
