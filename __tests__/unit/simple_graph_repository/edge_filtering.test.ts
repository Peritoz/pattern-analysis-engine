import { SimpleGraphRepository, SimpleGraphVertex, SimpleGraphEdge } from '../../../src';
import { EdgeScope } from '../../../src/libs/model/graph_repository/enums/edge_scope.enum';

describe('Simple Graph Repository - Edge Filtering', () => {
  let repository: SimpleGraphRepository;

  beforeEach(async () => {
    repository = new SimpleGraphRepository();

    await repository.addManyVertices([
      new SimpleGraphVertex('V1', ['t1'], '1'),
      new SimpleGraphVertex('V2', ['t2'], '2'),
      new SimpleGraphVertex('V3', ['t3'], '3'),
      new SimpleGraphVertex('V4', ['t4'], '4'),
      new SimpleGraphVertex('V5', ['t1', 't2'], '5'),
    ]);

    await repository.addManyEdges([
      new SimpleGraphEdge('1', '2', ['et1'], 'E1'),
      new SimpleGraphEdge('2', '3', ['et2'], 'E2'),
      new SimpleGraphEdge('3', '4', ['et3'], 'E3'),
      new SimpleGraphEdge('1', '5', ['et1', 'et2'], 'E4'),
      new SimpleGraphEdge('5', '4', ['et3'], 'E5'),
      new SimpleGraphEdge('1', '2', ['et1'], 'E1_derived', ['E1']), // Derived edge
      new SimpleGraphEdge('2', '4', ['et4'], 'E6', ['E2', 'E3']), // Derived edge
    ]);
  });

  describe('Basic edge filtering', () => {
    it('should filter edges by single type', async () => {
      const edges = await repository.getEdgesByFilter(
        null,
        { types: ['et1'], scope: EdgeScope.ALL },
        null,
      );

      expect(edges.length).toBeGreaterThan(0);
      edges.forEach(edge => {
        expect(edge.types).toContain('et1');
      });
    });

    it('should filter edges by multiple types', async () => {
      const edges = await repository.getEdgesByFilter(
        null,
        { types: ['et1', 'et2'], scope: EdgeScope.ALL },
        null,
      );

      expect(edges.length).toBeGreaterThan(0);
      edges.forEach(edge => {
        expect(
          edge.types.some(t => ['et1', 'et2'].includes(t))
        ).toBeTruthy();
      });
    });

    it('should return all edges when no type filter', async () => {
      const edges = await repository.getEdgesByFilter(
        null,
        { scope: EdgeScope.ALL },
        null,
      );

      expect(edges.length).toBe(7); // All edges including derived
    });
  });

  describe('Source and target filtering', () => {
    it('should filter by source type', async () => {
      const edges = await repository.getEdgesByFilter(
        { types: ['t1'] },
        { scope: EdgeScope.ALL },
        null,
      );

      expect(edges.length).toBeGreaterThan(0);

      for (const edge of edges) {
        const sourceVertex = await repository.getVertex(edge.sourceId);
        expect(sourceVertex?.types).toContain('t1');
      }
    });

    it('should filter by target type', async () => {
      const edges = await repository.getEdgesByFilter(
        null,
        { scope: EdgeScope.ALL },
        { types: ['t2'] },
      );

      expect(edges.length).toBeGreaterThan(0);

      for (const edge of edges) {
        const targetVertex = await repository.getVertex(edge.targetId);
        expect(targetVertex?.types).toContain('t2');
      }
    });

    it('should filter by both source and target types', async () => {
      const edges = await repository.getEdgesByFilter(
        { types: ['t1'] },
        { scope: EdgeScope.ALL },
        { types: ['t2'] },
      );

      expect(edges.length).toBeGreaterThan(0);

      for (const edge of edges) {
        const sourceVertex = await repository.getVertex(edge.sourceId);
        const targetVertex = await repository.getVertex(edge.targetId);
        expect(sourceVertex?.types).toContain('t1');
        expect(targetVertex?.types).toContain('t2');
      }
    });

    it('should filter by source ID', async () => {
      const edges = await repository.getEdgesByFilter(
        { ids: ['1'] },
        { scope: EdgeScope.ALL },
        null,
      );

      expect(edges.length).toBeGreaterThan(0);
      edges.forEach(edge => {
        expect(edge.sourceId).toBe('1');
      });
    });

    it('should filter by target ID', async () => {
      const edges = await repository.getEdgesByFilter(
        null,
        { scope: EdgeScope.ALL },
        { ids: ['4'] },
      );

      expect(edges.length).toBeGreaterThan(0);
      edges.forEach(edge => {
        expect(edge.targetId).toBe('4');
      });
    });

    it('should filter by multiple source IDs', async () => {
      const edges = await repository.getEdgesByFilter(
        { ids: ['1', '2'] },
        { scope: EdgeScope.ALL },
        null,
      );

      expect(edges.length).toBeGreaterThan(0);
      edges.forEach(edge => {
        expect(['1', '2']).toContain(edge.sourceId);
      });
    });

    it('should filter by source name', async () => {
      const edges = await repository.getEdgesByFilter(
        { searchTerm: 'v1' },
        { scope: EdgeScope.ALL },
        null,
      );

      expect(edges.length).toBeGreaterThan(0);

      for (const edge of edges) {
        const sourceVertex = await repository.getVertex(edge.sourceId);
        expect(sourceVertex?.name.toLowerCase()).toContain('v1');
      }
    });

    it('should filter by target name', async () => {
      const edges = await repository.getEdgesByFilter(
        null,
        { scope: EdgeScope.ALL },
        { searchTerm: 'v2' },
      );

      expect(edges.length).toBeGreaterThan(0);

      for (const edge of edges) {
        const targetVertex = await repository.getVertex(edge.targetId);
        expect(targetVertex?.name.toLowerCase()).toContain('v2');
      }
    });
  });

  describe('Derived edge filtering', () => {
    it('should get only non-derived edges', async () => {
      const edges = await repository.getEdgesByFilter(
        null,
        { scope: EdgeScope.NON_DERIVED_ONLY },
        null,
      );

      expect(edges.length).toBe(5); // Only non-derived edges
      edges.forEach(edge => {
        expect(edge.derivationPath || []).toHaveLength(0);
      });
    });

    it('should get only derived edges', async () => {
      const edges = await repository.getEdgesByFilter(
        null,
        { scope: EdgeScope.DERIVED_ONLY },
        null,
      );

      expect(edges.length).toBe(2); // Only derived edges
      edges.forEach(edge => {
        expect(edge.derivationPath).toBeDefined();
        expect(edge.derivationPath!.length).toBeGreaterThan(0);
      });
    });

    it('should get all edges regardless of derivation', async () => {
      const edges = await repository.getEdgesByFilter(
        null,
        { scope: EdgeScope.ALL },
        null,
      );

      expect(edges.length).toBe(7); // All edges
    });

    it('should combine type and scope filters', async () => {
      const edges = await repository.getEdgesByFilter(
        null,
        { types: ['et1'], scope: EdgeScope.NON_DERIVED_ONLY },
        null,
      );

      expect(edges.length).toBeGreaterThan(0);
      edges.forEach(edge => {
        expect(edge.types).toContain('et1');
        expect(edge.derivationPath || []).toHaveLength(0);
      });
    });
  });

  describe('Complex combined filters', () => {
    it('should apply all filters together', async () => {
      const edges = await repository.getEdgesByFilter(
        { types: ['t1'], ids: ['1'] },
        { types: ['et1'], scope: EdgeScope.NON_DERIVED_ONLY },
        { types: ['t2'] },
      );

      expect(edges.length).toBeGreaterThan(0);

      for (const edge of edges) {
        const sourceVertex = await repository.getVertex(edge.sourceId);
        const targetVertex = await repository.getVertex(edge.targetId);

        expect(sourceVertex?.types).toContain('t1');
        expect(edge.sourceId).toBe('1');
        expect(edge.types).toContain('et1');
        expect(edge.derivationPath || []).toHaveLength(0);
        expect(targetVertex?.types).toContain('t2');
      }
    });

    it('should return empty for impossible filter combination', async () => {
      const edges = await repository.getEdgesByFilter(
        { types: ['t1'] },
        { types: ['et1'] },
        { types: ['t4'] }, // No edge from t1 to t4 with et1
      );

      edges.forEach(edge => {
        expect(edge.types).toContain('et1');
      });
    });
  });

  describe('Edge negation', () => {
    it('should handle isNegated flag', async () => {
      const edges = await repository.getEdgesByFilter(
        null,
        { types: ['et1'], isNegated: true, scope: EdgeScope.ALL },
        null,
      );

      edges.forEach(edge => {
        expect(edge.types).not.toContain('et1');
      });
    });
  });

  describe('Edge existence check', () => {
    it('should confirm edge exists by object', async () => {
      const exists = await repository.exists(
        new SimpleGraphEdge('1', '2', ['et1'], 'E1')
      );

      expect(exists).toBeTruthy();
    });

    it('should confirm edge does not exist', async () => {
      const exists = await repository.exists(
        new SimpleGraphEdge('99', '100', ['nonexistent'], 'E99')
      );

      expect(exists).toBeFalsy();
    });

    it('should check edge by ID', async () => {
      const edge = await repository.getEdge('E1');

      expect(edge).toBeDefined();
      expect(edge?.getId()).toBe('E1');
    });

    it('should return undefined for non-existent edge ID', async () => {
      const edge = await repository.getEdge('E999');

      expect(edge).toBeUndefined();
    });
  });

  describe('Edge removal edge cases', () => {
    it('should handle removing non-existent edge gracefully', async () => {
      await expect(
        repository.removeEdge('nonexistent')
      ).resolves.not.toThrow();
    });

    it('should update adjacency lists after removal', async () => {
      const edgeId = 'E1';
      await repository.removeEdge(edgeId);

      const outboundEdges = await repository.getEdgesByFilter(
        { ids: ['1'] },
        { scope: EdgeScope.ALL },
        null,
      );

      const removedEdge = outboundEdges.find(e => e.getId() === edgeId);
      expect(removedEdge).toBeUndefined();
    });
  });

  describe('Multiple edges between same vertices', () => {
    it('should handle multiple edges with different types', async () => {
      await repository.addEdge(
        new SimpleGraphEdge('1', '2', ['et_new'], 'E_new')
      );

      const edges = await repository.getEdgesByFilter(
        { ids: ['1'] },
        { scope: EdgeScope.ALL },
        { ids: ['2'] },
      );

      const edgeTypes = edges.flatMap(e => e.types);
      expect(edgeTypes).toContain('et1');
      expect(edgeTypes).toContain('et_new');
    });
  });

  describe('Edge type arrays', () => {
    it('should handle edges with multiple types', async () => {
      const edges = await repository.getEdgesByFilter(
        { ids: ['1'] },
        { scope: EdgeScope.ALL },
        { ids: ['5'] },
      );

      const multiTypeEdge = edges.find(e => e.types.length > 1);
      expect(multiTypeEdge).toBeDefined();
      expect(multiTypeEdge?.types).toContain('et1');
      expect(multiTypeEdge?.types).toContain('et2');
    });

    it('should match edge if any type matches filter', async () => {
      const edges = await repository.getEdgesByFilter(
        null,
        { types: ['et2'], scope: EdgeScope.ALL },
        null,
      );

      const hasMultiTypeEdge = edges.some(e =>
        e.types.includes('et2') && e.types.length > 1
      );

      expect(hasMultiTypeEdge).toBeTruthy();
    });
  });
});
