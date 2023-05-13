import { DerivationEngine, DerivationRule, PatternAnalysisEngine } from '../../../src';
import { init_long_paths_graph } from '../utils/graphs/init_long_paths_graph';
import { graph_edge_builder } from '../utils/graph_edge_builder';

describe('Pattern analysis engine', () => {
  let longPathsGraphDerivationEngine;
  let longPathsGraph;
  let longPathsEngine;

  beforeAll(async () => {
    const longPathsGraphRules = [
      new DerivationRule('()[et1]>()[et2]>()', '(1)[et2](3)'),
      new DerivationRule('()[et2]>()<[et5]()', '(3)[et5](1)'),
      new DerivationRule('()[et2]>()[et3]>()', '(1)[et3](3)'),
      new DerivationRule('()[et3]>()<[et4]()', '(3)[et4](1)'),
      new DerivationRule('()[et2]>()<[et4]()', '(1)[et1](3)'),
    ];

    longPathsGraph = await init_long_paths_graph();
    longPathsGraphDerivationEngine = new DerivationEngine(
      longPathsGraph,
      longPathsGraphRules,
      graph_edge_builder,
    );
    await longPathsGraphDerivationEngine.deriveEdges(4);
    longPathsEngine = new PatternAnalysisEngine(longPathsGraph);
  });

  describe('Long paths graph', () => {
    it('?(t1)=[et2]=>(*)', async () => {
      const result = await longPathsEngine.run('?(t1)=[et2]=>(*)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it('?(t1)=[et3]=>(*)', async () => {
      const result = await longPathsEngine.run('?(t1)=[et3]=>(*)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it('?(t6)=[et5]=>(*)', async () => {
      const result = await longPathsEngine.run('?(t6)=[et5]=>(*)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(3);
    });

    it('?(t5)=[et4]=>(*)', async () => {
      const result = await longPathsEngine.run('?(t5)=[et4]=>(*)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(4);
    });

    it('?(t1)=[et1]=>(t5)', async () => {
      const result = await longPathsEngine.run('?(t1)=[et1]=>(t5)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });
  });
});
