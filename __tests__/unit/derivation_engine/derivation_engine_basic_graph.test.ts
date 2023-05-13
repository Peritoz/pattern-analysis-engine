import { DerivationEngine, DerivationRule, SimpleGraphRepository } from '../../../src';
import { init_basic_graph } from '../utils/graphs/init_basic_graph';
import { EdgeScope } from '../../../src/libs/model/graph_repository/enums/edge_scope.enum';
import { graph_edge_builder } from '../utils/graph_edge_builder';

describe('Derivation engine', () => {
  let basicGraphEngine: DerivationEngine;
  let basicGraph: SimpleGraphRepository;

  beforeAll(async () => {
    const basicGraphRules = [
      new DerivationRule('()[et1]>()[et2,et3]>()', '(1)[et1](3)'),
      new DerivationRule('(t1)[et2,et3]>()<[et1](t3)', '(2)[et3](1)'),
      new DerivationRule('()<[](t3)[et3]>(t2)', '(3)[et1,et2](1)'),
    ];

    basicGraph = await init_basic_graph();
    basicGraphEngine = new DerivationEngine(basicGraph, basicGraphRules, graph_edge_builder);

    await basicGraphEngine.deriveEdges(1);
  });

  describe('Basic graph', () => {
    it('Should derive edges: Case 1', async () => {
      const edgeGroupRule1 = await basicGraph.getEdgesByFilter(
        {
          types: ['t1', 't2'],
        },
        {
          types: ['et1'],
          scope: EdgeScope.ALL,
          isNegated: false,
        },
        {
          types: ['t2', 't3'],
        },
      );
      expect(edgeGroupRule1.length).toBe(2);
    });

    it('Should derive edges: Case 2', async () => {
      const edgeGroupRule2 = await basicGraph.getEdgesByFilter(
        {
          types: ['t2', 't3'],
        },
        {
          types: ['et3'],
          scope: EdgeScope.ALL,
          isNegated: false,
        },
        { types: ['t1'] },
      );

      expect(edgeGroupRule2.length).toBe(1);
    });

    it('Should derive edges: Case 3', async () => {
      const edgeGroupRule3 = await basicGraph.getEdgesByFilter(
        {
          types: ['t2'],
        },
        {
          types: ['et1', 'et2'],
          scope: EdgeScope.ALL,
          isNegated: false,
        },
        { types: ['t2', 't3'] },
      );

      expect(edgeGroupRule3.length).toBe(3);
    });
  });
});
