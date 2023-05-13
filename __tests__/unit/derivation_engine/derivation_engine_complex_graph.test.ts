import { DerivationEngine, DerivationRule } from '../../../src';
import { init_complex_graph } from '../utils/graphs/init_complex_graph';
import { EdgeScope } from '../../../src/libs/model/graph_repository/enums/edge_scope.enum';
import { graph_edge_builder } from '../utils/graph_edge_builder';
import { NaiveLogger } from '../utils/naive_logger.class';

describe('Derivation engine', () => {
  let complexGraphEngine;
  let complexGraph;

  beforeAll(async () => {
    const complexGraphRules = [
      new DerivationRule('(a)[e1]>(b)[e2]>(c)', '(1)[e1](3)'),
      new DerivationRule('(a)[e1]>(b)[e3]>(e)', '(2)[e3](1)'),
      new DerivationRule('()[]>(d)[e4]>(f)', '(3)[e1,e2](1)'),
    ];
    // Graph in the form (1:t1,t2)-[et1]->(2:t1)-[et2, et3]->(3:t2,t3)<-[et1]-(4:t3)-[et3]->(5:t2)<-[et2]-(1:t1,t2)
    complexGraph = await init_complex_graph();
    complexGraphEngine = new DerivationEngine(
      complexGraph,
      complexGraphRules,
      graph_edge_builder,
      new NaiveLogger(),
    );

    await complexGraphEngine.deriveEdges(2);
  });

  describe('Constructor', () => {
    it('Should throw error: Invalid edge builder (Void function)', () => {
      expect(() => {
        new DerivationEngine(complexGraph, [], () => {});
      }).toThrowError('Invalid edge builder');
    });

    it('Should throw error: Invalid edge builder (Returning invalid format)', () => {
      expect(() => {
        new DerivationEngine(
          complexGraph,
          [],
          (sourceId, targetId, types, externalId, derivationPath) => {
            return { source: sourceId, target: targetId, types: types };
          },
        );
      }).toThrowError('Invalid edge builder');
    });

    it('Should throw error: Invalid edge builder (Returning invalid partial edge)', () => {
      expect(() => {
        new DerivationEngine(
          complexGraph,
          [],
          (sourceId, targetId, types, externalId, derivationPath) => {
            return { sourceId, targetId, externalId, derivationPath };
          },
        );
      }).toThrowError('Invalid edge builder');
    });
  });

  describe('Complex graph', () => {
    it('Should derive edges: Case 1', async () => {
      const edgeGroupRule1 = await complexGraph.getEdgesByFilter(
        {
          types: ['a'],
        },
        {
          types: ['e1'],
          scope: EdgeScope.ALL,
          isNegated: false,
        },
        {
          types: ['c'],
        },
      );
      expect(edgeGroupRule1.length).toBe(1);
    });

    it('Should derive edges: Case 2', async () => {
      const edgeGroupRule2 = await complexGraph.getEdgesByFilter(
        {
          types: ['b'],
        },
        {
          types: ['e3'],
          scope: EdgeScope.ALL,
          isNegated: false,
        },
        { types: ['a'] },
      );

      expect(edgeGroupRule2.length).toBe(1);
    });

    it('Should derive edges: Case 3', async () => {
      const edgeGroupRule3 = await complexGraph.getEdgesByFilter(
        {
          types: ['f'],
        },
        {
          types: ['e1', 'e2'],
          scope: EdgeScope.ALL,
          isNegated: false,
        },
        null,
      );

      expect(edgeGroupRule3.length).toBe(2);
    });
  });
});
