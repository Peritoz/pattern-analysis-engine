import {
  QueryDescriptor,
  QueryNode,
  QueryRelationship,
  QueryTriple,
  Direction,
  SimpleGraphRepository,
  SimpleGraphVertex,
  SimpleGraphEdge,
} from '../../../src';
import { QueryEngine } from '../../../src/libs/engine/query_engine';
import { OutputVertex } from '../../../src/libs/model/output/output_vertex.interface';
import { OutputEdge } from '../../../src/libs/model/output/output_edge.interface';

describe('Query Engine - Advanced Query Descriptor Tests', () => {
  let graph: SimpleGraphRepository;
  let queryEngine: QueryEngine;

  beforeAll(async () => {
    graph = new SimpleGraphRepository();

    await graph.addManyVertices([
      new SimpleGraphVertex('A', ['typeA'], '1'),
      new SimpleGraphVertex('B', ['typeB'], '2'),
      new SimpleGraphVertex('C', ['typeC'], '3'),
      new SimpleGraphVertex('D', ['typeD'], '4'),
      new SimpleGraphVertex('E', ['typeE'], '5'),
    ]);

    await graph.addManyEdges([
      new SimpleGraphEdge('1', '2', ['relAB'], 'E1'),
      new SimpleGraphEdge('2', '3', ['relBC'], 'E2'),
      new SimpleGraphEdge('3', '4', ['relCD'], 'E3'),
      new SimpleGraphEdge('1', '4', ['relAD'], 'E4'),
      new SimpleGraphEdge('5', '1', ['relEA'], 'E5'),
    ]);

    queryEngine = new QueryEngine(graph);
  });

  describe('Query Descriptor construction', () => {
    it('should execute simple query descriptor', async () => {
      const leftNode = new QueryNode(['typeA'], '', [], true);
      const relationship = new QueryRelationship(['relAB'], Direction.OUTBOUND, false, false);
      const rightNode = new QueryNode(['typeB'], '', [], true);

      const triple = new QueryTriple(leftNode, relationship, rightNode);
      const descriptor = new QueryDescriptor();
      descriptor.addTriple(triple);

      const result = await queryEngine.run(descriptor);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveLength(3);
      expect((result[0][0] as OutputVertex).types).toContain('typeA');
      expect((result[0][2] as OutputVertex).types).toContain('typeB');
    });

    it('should handle chain query descriptor', async () => {
      const node1 = new QueryNode(['typeA'], '', [], true);
      const rel1 = new QueryRelationship(['relAB'], Direction.OUTBOUND, false, false);
      const node2 = new QueryNode(['typeB'], '', [], true);

      const rel2 = new QueryRelationship(['relBC'], Direction.OUTBOUND, false, false);
      const node3 = new QueryNode(['typeC'], '', [], true);

      const triple1 = new QueryTriple(node1, rel1, node2);
      const triple2 = new QueryTriple(node2, rel2, node3);

      const descriptor = new QueryDescriptor();
      descriptor.addTriple(triple1);
      descriptor.addTriple(triple2);

      const result = await queryEngine.run(descriptor);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveLength(5); // v-e-v-e-v
    });

    it('should filter by initial element IDs', async () => {
      const leftNode = new QueryNode([], '', [], true);
      const relationship = new QueryRelationship([], Direction.OUTBOUND, false, false);
      const rightNode = new QueryNode([], '', [], true);

      const triple = new QueryTriple(leftNode, relationship, rightNode);
      const descriptor = new QueryDescriptor();
      descriptor.addTriple(triple);

      const result = await queryEngine.run(descriptor, ['1']);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      result.forEach(path => {
        expect((path[0] as OutputVertex).identifier).toBe('1');
      });
    });

    it('should handle inbound relationships', async () => {
      const leftNode = new QueryNode(['typeA'], '', [], true);
      const relationship = new QueryRelationship(['relEA'], Direction.INBOUND, false, false);
      const rightNode = new QueryNode(['typeE'], '', [], true);

      const triple = new QueryTriple(leftNode, relationship, rightNode);
      const descriptor = new QueryDescriptor();
      descriptor.addTriple(triple);

      const result = await queryEngine.run(descriptor);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect((result[0][1] as OutputEdge).direction).toBe(Direction.INBOUND);
    });
  });

  describe('shouldBeReturned flag', () => {
    it('should exclude nodes when shouldBeReturned is false', async () => {
      const leftNode = new QueryNode(['typeA'], '', [], true);
      const relationship = new QueryRelationship(['relAB'], Direction.OUTBOUND, false, false);
      const rightNode = new QueryNode(['typeB'], '', [], false); // Not returned

      const triple = new QueryTriple(leftNode, relationship, rightNode);
      const descriptor = new QueryDescriptor();
      descriptor.addTriple(triple);

      const result = await queryEngine.run(descriptor);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      result.forEach(path => {
        expect((path[0] as OutputVertex).shouldBeReturned).toBeTruthy();
        expect((path[2] as OutputVertex).shouldBeReturned).toBeFalsy();
      });
    });

    it('should handle mixed shouldBeReturned in chain', async () => {
      const node1 = new QueryNode(['typeA'], '', [], true);
      const rel1 = new QueryRelationship([], Direction.OUTBOUND, false, false);
      const node2 = new QueryNode([], '', [], false); // Not returned

      const rel2 = new QueryRelationship([], Direction.OUTBOUND, false, false);
      const node3 = new QueryNode(['typeC'], '', [], true);

      const triple1 = new QueryTriple(node1, rel1, node2);
      const triple2 = new QueryTriple(node2, rel2, node3);

      const descriptor = new QueryDescriptor();
      descriptor.addTriple(triple1);
      descriptor.addTriple(triple2);

      const result = await queryEngine.run(descriptor);

      expect(result).toBeDefined();

      result.forEach(path => {
        if (path.length === 5) {
          expect((path[0] as OutputVertex).shouldBeReturned).toBeTruthy();
          expect((path[2] as OutputVertex).shouldBeReturned).toBeFalsy();
          expect((path[4] as OutputVertex).shouldBeReturned).toBeTruthy();
        }
      });
    });
  });

  describe('Search term filtering', () => {
    it('should filter by search term', async () => {
      const leftNode = new QueryNode([], 'a', [], true); // Search for 'a'
      const relationship = new QueryRelationship([], Direction.OUTBOUND, false, false);
      const rightNode = new QueryNode([], '', [], true);

      const triple = new QueryTriple(leftNode, relationship, rightNode);
      const descriptor = new QueryDescriptor();
      descriptor.addTriple(triple);

      const result = await queryEngine.run(descriptor);

      expect(result).toBeDefined();

      result.forEach(path => {
        expect((path[0] as OutputVertex).label.toLowerCase()).toContain('a');
      });
    });

    it('should combine type and search term', async () => {
      const leftNode = new QueryNode(['typeA'], 'a', [], true);
      const relationship = new QueryRelationship([], Direction.OUTBOUND, false, false);
      const rightNode = new QueryNode([], '', [], true);

      const triple = new QueryTriple(leftNode, relationship, rightNode);
      const descriptor = new QueryDescriptor();
      descriptor.addTriple(triple);

      const result = await queryEngine.run(descriptor);

      expect(result).toBeDefined();

      result.forEach(path => {
        const vertex = path[0] as OutputVertex;
        expect(vertex.types).toContain('typeA');
        expect(vertex.label.toLowerCase()).toContain('a');
      });
    });
  });

  describe('Lookup queries', () => {
    it('should perform simple lookup by type', async () => {
      const descriptor = new QueryDescriptor();
      descriptor.setFilter(['typeA'], '');

      const result = await queryEngine.runLookup(descriptor);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveLength(1); // Only vertex, no edges
      expect((result[0][0] as OutputVertex).types).toContain('typeA');
    });

    it('should perform lookup by search term', async () => {
      const descriptor = new QueryDescriptor();
      descriptor.setFilter([], 'b');

      const result = await queryEngine.runLookup(descriptor);

      expect(result).toBeDefined();

      result.forEach(path => {
        expect((path[0] as OutputVertex).label.toLowerCase()).toContain('b');
      });
    });

    it('should perform lookup with multiple types', async () => {
      const descriptor = new QueryDescriptor();
      descriptor.setFilter(['typeA', 'typeB', 'typeC'], '');

      const result = await queryEngine.runLookup(descriptor);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      result.forEach(path => {
        const vertex = path[0] as OutputVertex;
        expect(
          vertex.types.some(t => ['typeA', 'typeB', 'typeC'].includes(t))
        ).toBeTruthy();
      });
    });
  });

  describe('Empty result handling', () => {
    it('should return empty array for no matches', async () => {
      const leftNode = new QueryNode(['nonexistent'], '', [], true);
      const relationship = new QueryRelationship([], Direction.OUTBOUND, false, false);
      const rightNode = new QueryNode([], '', [], true);

      const triple = new QueryTriple(leftNode, relationship, rightNode);
      const descriptor = new QueryDescriptor();
      descriptor.addTriple(triple);

      const result = await queryEngine.run(descriptor);

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });

    it('should break chain on empty intermediate result', async () => {
      const node1 = new QueryNode(['typeA'], '', [], true);
      const rel1 = new QueryRelationship(['nonexistent'], Direction.OUTBOUND, false, false);
      const node2 = new QueryNode([], '', [], true);

      const rel2 = new QueryRelationship([], Direction.OUTBOUND, false, false);
      const node3 = new QueryNode([], '', [], true);

      const triple1 = new QueryTriple(node1, rel1, node2);
      const triple2 = new QueryTriple(node2, rel2, node3);

      const descriptor = new QueryDescriptor();
      descriptor.addTriple(triple1);
      descriptor.addTriple(triple2);

      const result = await queryEngine.run(descriptor);

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });

  describe('Query complexity detection', () => {
    it('should detect simple query', () => {
      const descriptor = new QueryDescriptor();
      descriptor.setFilter(['typeA'], '');

      expect(descriptor.isComplexQuery()).toBeFalsy();
    });

    it('should detect complex query', () => {
      const leftNode = new QueryNode(['typeA'], '', [], true);
      const relationship = new QueryRelationship([], Direction.OUTBOUND, false, false);
      const rightNode = new QueryNode([], '', [], true);

      const triple = new QueryTriple(leftNode, relationship, rightNode);
      const descriptor = new QueryDescriptor();
      descriptor.addTriple(triple);

      expect(descriptor.isComplexQuery()).toBeTruthy();
    });
  });
});
