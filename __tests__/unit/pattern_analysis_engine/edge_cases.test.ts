import { PatternAnalysisEngine, SimpleGraphRepository, SimpleGraphVertex, SimpleGraphEdge } from '../../../src';
import { OutputVertex } from '../../../src/libs/model/output/output_vertex.interface';
import { OutputEdge } from '../../../src/libs/model/output/output_edge.interface';

describe('Pattern Analysis Engine - Edge Cases', () => {
  let engine: PatternAnalysisEngine;
  let graph: SimpleGraphRepository;

  beforeAll(async () => {
    graph = new SimpleGraphRepository();

    // Create a more complex graph for edge case testing
    await graph.addManyVertices([
      new SimpleGraphVertex('Node1', ['type1'], '1'),
      new SimpleGraphVertex('Node2', ['type1', 'type2'], '2'),
      new SimpleGraphVertex('Node3', ['type2'], '3'),
      new SimpleGraphVertex('Node4', ['type3'], '4'),
      new SimpleGraphVertex('Node5', ['type1'], '5'),
    ]);

    await graph.addManyEdges([
      new SimpleGraphEdge('1', '2', ['edge1'], 'E1'),
      new SimpleGraphEdge('2', '3', ['edge2'], 'E2'),
      new SimpleGraphEdge('3', '1', ['edge3'], 'E3'), // Creates a cycle
      new SimpleGraphEdge('2', '4', ['edge1'], 'E4'),
      new SimpleGraphEdge('4', '5', ['edge2'], 'E5'),
    ]);

    engine = new PatternAnalysisEngine(graph);
  });

  describe('Empty results', () => {
    it('should return empty array for non-existent type', async () => {
      const result = await engine.run('?(nonexistent)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });

    it('should return empty array for non-matching pattern', async () => {
      const result = await engine.run('?(type1)-[nonexistent]->(type2)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });

    it('should return empty array for impossible chain', async () => {
      const result = await engine.run('?(type3)-[edge1]->(type3)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });

  describe('Multiple type matching', () => {
    it('should match nodes with multiple types - single type query', async () => {
      const result = await engine.run('?(type2)');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      const matchedIds = result.map(path => (path[0] as OutputVertex).identifier);
      expect(matchedIds).toContain('2'); // Node2 has type2
      expect(matchedIds).toContain('3'); // Node3 has type2
    });

    it('should match OR types correctly', async () => {
      const result = await engine.run('?(type1 or type3)');

      expect(result).toBeDefined();
      const matchedIds = result.map(path => (path[0] as OutputVertex).identifier);
      expect(matchedIds).toContain('1');
      expect(matchedIds).toContain('2'); // Has both type1 and type2
      expect(matchedIds).toContain('4');
      expect(matchedIds).toContain('5');
    });

    it('should handle three-way OR types', async () => {
      const result = await engine.run('?(type1 or type2 or type3)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(5); // All 5 nodes match
    });
  });

  describe('Wildcard patterns', () => {
    it('should match any target with wildcard', async () => {
      const result = await engine.run('?(type1)->(*)');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      result.forEach(path => {
        expect(path).toHaveLength(3); // vertex-edge-vertex
        expect((path[0] as OutputVertex).types).toContain('type1');
      });
    });

    it('should match wildcard in middle of chain', async () => {
      const result = await engine.run('?(type1)->(*)->(type2)');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      result.forEach(path => {
        expect(path).toHaveLength(5); // v-e-v-e-v
        expect((path[0] as OutputVertex).types).toContain('type1');
        expect((path[4] as OutputVertex).types).toContain('type2');
      });
    });
  });

  describe('Direction handling', () => {
    it('should respect outbound direction', async () => {
      const result = await engine.run('?(type1)-[edge1]->(*)');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      result.forEach(path => {
        const edge = path[1] as OutputEdge;
        expect(edge.types).toContain('edge1');
        expect(edge.direction).toBe(1); // OUTBOUND
      });
    });

    it('should respect inbound direction', async () => {
      const result = await engine.run('?(type2)<-[edge1]-(*)');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      result.forEach(path => {
        const edge = path[1] as OutputEdge;
        expect(edge.types).toContain('edge1');
        expect(edge.direction).toBe(-1); // INBOUND
      });
    });

    it('should handle mixed directions in chain', async () => {
      const result = await engine.run('?(type1)-[edge1]->(*)<-[edge3]-(*)');

      expect(result).toBeDefined();

      if (result.length > 0) {
        result.forEach(path => {
          expect(path).toHaveLength(5);
          expect((path[1] as OutputEdge).direction).toBe(1); // First edge outbound
          expect((path[3] as OutputEdge).direction).toBe(-1); // Second edge inbound
        });
      }
    });
  });

  describe('Long chains', () => {
    it('should match 3-edge chain', async () => {
      const result = await engine.run('?(type1)->(*)->(*)->(*)');

      expect(result).toBeDefined();

      result.forEach(path => {
        expect(path.length).toBe(7); // v-e-v-e-v-e-v
      });
    });

    it('should match chain with specific types in middle', async () => {
      const result = await engine.run('?(type1)->(type1 or type2)->(type2)->(*)');

      expect(result).toBeDefined();

      result.forEach(path => {
        expect(path.length).toBe(7);
        const middleNode1 = path[2] as OutputVertex;
        const middleNode2 = path[4] as OutputVertex;
        expect(middleNode1.types.some(t => ['type1', 'type2'].includes(t))).toBeTruthy();
        expect(middleNode2.types).toContain('type2');
      });
    });
  });

  describe('Named vertex search', () => {
    it('should find vertex by exact name', async () => {
      const result = await engine.run("?('Node1')");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect((result[0][0] as OutputVertex).label).toBe('Node1');
    });

    it('should find vertex by name and type', async () => {
      const result = await engine.run("?('Node2':type1)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect((result[0][0] as OutputVertex).label).toBe('Node2');
      expect((result[0][0] as OutputVertex).types).toContain('type1');
    });

    it('should return empty for name with wrong type', async () => {
      const result = await engine.run("?('Node1':type3)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });

    it('should find named vertex in pattern', async () => {
      const result = await engine.run("?('Node1')->(*)");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect((result[0][0] as OutputVertex).label).toBe('Node1');
    });
  });

  describe('Edge type filtering', () => {
    it('should filter by single edge type', async () => {
      const result = await engine.run('?(type1)-[edge1]->(*)');

      expect(result).toBeDefined();

      result.forEach(path => {
        const edge = path[1] as OutputEdge;
        expect(edge.types).toContain('edge1');
      });
    });

    it('should handle non-existent edge type', async () => {
      const result = await engine.run('?(type1)-[nonexistent]->(*)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });

  describe('Invalid queries', () => {
    it('should throw error for malformed query', async () => {
      await expect(async () => {
        await engine.run('?invalid');
      }).rejects.toThrow('Invalid query');
    });

    it('should throw error for query without ?', async () => {
      await expect(async () => {
        await engine.run('(type1)');
      }).rejects.toThrow('Invalid query');
    });

    it('should throw error for null query', async () => {
      await expect(async () => {
        await engine.run(null as any);
      }).rejects.toThrow('Unable to process query');
    });
  });
});
