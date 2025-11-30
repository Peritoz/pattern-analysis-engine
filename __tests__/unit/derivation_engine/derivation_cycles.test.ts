import { DerivationEngine, DerivationRule, SimpleGraphRepository, SimpleGraphVertex, SimpleGraphEdge, Logger } from '../../../src';
import { graph_edge_builder } from '../utils/graph_edge_builder';
import { EdgeScope } from '../../../src/libs/model/graph_repository/enums/edge_scope.enum';

describe('Derivation Engine - Cycle Testing', () => {
  describe('Multiple derivation cycles', () => {
    let graph: SimpleGraphRepository;
    let engine: DerivationEngine;

    beforeEach(async () => {
      graph = new SimpleGraphRepository();

      await graph.addManyVertices([
        new SimpleGraphVertex('V1', ['t1'], '1'),
        new SimpleGraphVertex('V2', ['t2'], '2'),
        new SimpleGraphVertex('V3', ['t3'], '3'),
        new SimpleGraphVertex('V4', ['t4'], '4'),
      ]);

      await graph.addManyEdges([
        new SimpleGraphEdge('1', '2', ['e1'], 'E1'),
        new SimpleGraphEdge('2', '3', ['e2'], 'E2'),
        new SimpleGraphEdge('3', '4', ['e3'], 'E3'),
      ]);
    });

    it('should derive edges in 1 cycle', async () => {
      const rules = [
        new DerivationRule('()[e1]>()[e2]>()', '(1)[derived](3)'),
      ];

      engine = new DerivationEngine(graph, rules, graph_edge_builder);
      await engine.deriveEdges(1);

      const derivedEdges = await graph.getEdgesByFilter(
        null,
        { types: ['derived'], scope: EdgeScope.DERIVED_ONLY },
        null,
      );

      expect(derivedEdges.length).toBeGreaterThan(0);
      expect(derivedEdges[0].sourceId).toBe('1');
      expect(derivedEdges[0].targetId).toBe('3');
      expect(derivedEdges[0].derivationPath).toBeDefined();
      expect(derivedEdges[0].derivationPath?.length).toBeGreaterThan(0);
    });

    it('should derive edges in 2 cycles', async () => {
      const rules = [
        new DerivationRule('()[e1]>()[e2]>()', '(1)[d1](3)'),
        new DerivationRule('()[d1]>()[e3]>()', '(1)[d2](3)'),
      ];

      engine = new DerivationEngine(graph, rules, graph_edge_builder);
      await engine.deriveEdges(2);

      const firstCycleDerived = await graph.getEdgesByFilter(
        null,
        { types: ['d1'], scope: EdgeScope.DERIVED_ONLY },
        null,
      );

      const secondCycleDerived = await graph.getEdgesByFilter(
        null,
        { types: ['d2'], scope: EdgeScope.DERIVED_ONLY },
        null,
      );

      expect(firstCycleDerived.length).toBeGreaterThan(0);
      expect(secondCycleDerived.length).toBeGreaterThan(0);
      expect(secondCycleDerived[0].derivationPath?.length).toBeGreaterThan(1);
    });

    it('should derive edges in 3 cycles with chaining', async () => {
      const rules = [
        new DerivationRule('()[e1]>()[e2]>()', '(1)[d1](3)'),
        new DerivationRule('()[d1]>()[e3]>()', '(1)[d2](3)'),
      ];

      engine = new DerivationEngine(graph, rules, graph_edge_builder);
      await engine.deriveEdges(3);

      const edges = await graph.getAllEdges();
      const derivedEdges = edges.filter(e => e.derivationPath && e.derivationPath.length > 0);

      expect(derivedEdges.length).toBeGreaterThan(0);
    });

    it('should handle zero cycles gracefully', async () => {
      const rules = [
        new DerivationRule('()[e1]>()[e2]>()', '(1)[derived](3)'),
      ];

      engine = new DerivationEngine(graph, rules, graph_edge_builder);
      await engine.deriveEdges(0);

      const derivedEdges = await graph.getEdgesByFilter(
        null,
        { types: ['derived'], scope: EdgeScope.DERIVED_ONLY },
        null,
      );

      expect(derivedEdges).toHaveLength(0);
    });
  });

  describe('Derivation with logger', () => {
    it('should log derivation process when logger is provided', async () => {
      const graph = new SimpleGraphRepository();
      const mockLogger: Logger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      await graph.addManyVertices([
        new SimpleGraphVertex('V1', ['t1'], '1'),
        new SimpleGraphVertex('V2', ['t2'], '2'),
        new SimpleGraphVertex('V3', ['t3'], '3'),
      ]);

      await graph.addManyEdges([
        new SimpleGraphEdge('1', '2', ['e1'], 'E1'),
        new SimpleGraphEdge('2', '3', ['e2'], 'E2'),
      ]);

      const rules = [
        new DerivationRule('()[e1]>()[e2]>()', '(1)[derived](3)'),
      ];

      const engine = new DerivationEngine(graph, rules, graph_edge_builder, mockLogger);
      await engine.deriveEdges(1);

      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('Complex derivation rules', () => {
    it('should handle rule with specific types', async () => {
      const graph = new SimpleGraphRepository();

      await graph.addManyVertices([
        new SimpleGraphVertex('V1', ['t1'], '1'),
        new SimpleGraphVertex('V2', ['t2'], '2'),
        new SimpleGraphVertex('V3', ['t3'], '3'),
        new SimpleGraphVertex('V4', ['t4'], '4'),
      ]);

      await graph.addManyEdges([
        new SimpleGraphEdge('1', '2', ['e1'], 'E1'),
        new SimpleGraphEdge('2', '3', ['e2'], 'E2'),
        new SimpleGraphEdge('4', '2', ['e1'], 'E3'),
      ]);

      const rules = [
        new DerivationRule('(t1)[e1]>(t2)[e2]>()', '(1)[derived](3)'),
      ];

      const engine = new DerivationEngine(graph, rules, graph_edge_builder);
      await engine.deriveEdges(1);

      const derivedEdges = await graph.getEdgesByFilter(
        null,
        { types: ['derived'], scope: EdgeScope.DERIVED_ONLY },
        null,
      );

      expect(derivedEdges.length).toBeGreaterThan(0);
      expect(derivedEdges[0].sourceId).toBe('1');
      expect(derivedEdges[0].targetId).toBe('3');
    });

    it('should handle inbound derivation rules', async () => {
      const graph = new SimpleGraphRepository();

      await graph.addManyVertices([
        new SimpleGraphVertex('V1', ['t1'], '1'),
        new SimpleGraphVertex('V2', ['t2'], '2'),
        new SimpleGraphVertex('V3', ['t3'], '3'),
      ]);

      await graph.addManyEdges([
        new SimpleGraphEdge('2', '1', ['e1'], 'E1'),
        new SimpleGraphEdge('3', '2', ['e2'], 'E2'),
      ]);

      const rules = [
        new DerivationRule('()<[e1]()<[e2]()', '(1)[derived](3)'),
      ];

      const engine = new DerivationEngine(graph, rules, graph_edge_builder);
      await engine.deriveEdges(1);

      const derivedEdges = await graph.getEdgesByFilter(
        null,
        { types: ['derived'], scope: EdgeScope.DERIVED_ONLY },
        null,
      );

      expect(derivedEdges.length).toBeGreaterThan(0);
    });

    it('should handle mixed direction derivation rules', async () => {
      const graph = new SimpleGraphRepository();

      await graph.addManyVertices([
        new SimpleGraphVertex('V1', ['t1'], '1'),
        new SimpleGraphVertex('V2', ['t2'], '2'),
        new SimpleGraphVertex('V3', ['t3'], '3'),
      ]);

      await graph.addManyEdges([
        new SimpleGraphEdge('1', '2', ['e1'], 'E1'),
        new SimpleGraphEdge('3', '2', ['e2'], 'E2'),
      ]);

      const rules = [
        new DerivationRule('()[e1]>()<[e2]()', '(1)[derived](3)'),
      ];

      const engine = new DerivationEngine(graph, rules, graph_edge_builder);
      await engine.deriveEdges(1);

      const derivedEdges = await graph.getEdgesByFilter(
        null,
        { types: ['derived'], scope: EdgeScope.DERIVED_ONLY },
        null,
      );

      expect(derivedEdges.length).toBeGreaterThan(0);
      expect(derivedEdges[0].sourceId).toBe('1');
      expect(derivedEdges[0].targetId).toBe('3');
    });
  });

  describe('Circular derivation prevention', () => {
    it('should not create self-loops', async () => {
      const graph = new SimpleGraphRepository();

      await graph.addManyVertices([
        new SimpleGraphVertex('V1', ['t1'], '1'),
        new SimpleGraphVertex('V2', ['t2'], '2'),
      ]);

      await graph.addManyEdges([
        new SimpleGraphEdge('1', '2', ['e1'], 'E1'),
        new SimpleGraphEdge('2', '1', ['e2'], 'E2'),
      ]);

      const rules = [
        new DerivationRule('()[e1]>()[e2]>()', '(1)[derived](3)'),
      ];

      const engine = new DerivationEngine(graph, rules, graph_edge_builder);
      await engine.deriveEdges(1);

      const derivedEdges = await graph.getEdgesByFilter(
        null,
        { types: ['derived'], scope: EdgeScope.DERIVED_ONLY },
        null,
      );

      // All edges should have different source and target (no self-loops)
      derivedEdges.forEach(edge => {
        expect(edge.sourceId).not.toBe(edge.targetId);
      });
    });
  });

  describe('Edge builder validation', () => {
    it('should throw error for invalid edge builder', () => {
      const graph = new SimpleGraphRepository();
      const rules = [new DerivationRule('()[e1]>()[e2]>()', '(1)[derived](3)')];

      const invalidBuilder = () => {
        return {} as any;
      };

      expect(() => {
        new DerivationEngine(graph, rules, invalidBuilder);
      }).toThrow('Invalid edge builder');
    });
  });

  describe('Duplicate edge prevention', () => {
    it('should not create duplicate derived edges', async () => {
      const graph = new SimpleGraphRepository();

      await graph.addManyVertices([
        new SimpleGraphVertex('V1', ['t1'], '1'),
        new SimpleGraphVertex('V2', ['t2'], '2'),
        new SimpleGraphVertex('V3', ['t3'], '3'),
      ]);

      await graph.addManyEdges([
        new SimpleGraphEdge('1', '2', ['e1'], 'E1'),
        new SimpleGraphEdge('2', '3', ['e2'], 'E2'),
        new SimpleGraphEdge('2', '3', ['e2'], 'E3'), // Duplicate edge with different ID
      ]);

      const rules = [
        new DerivationRule('()[e1]>()[e2]>()', '(1)[derived](3)'),
      ];

      const engine = new DerivationEngine(graph, rules, graph_edge_builder);
      await engine.deriveEdges(1);

      const derivedEdges = await graph.getEdgesByFilter(
        { ids: ['1'] },
        { types: ['derived'], scope: 2 },
        { ids: ['3'] },
      );

      expect(derivedEdges.length).toBe(1);
    });
  });
});
