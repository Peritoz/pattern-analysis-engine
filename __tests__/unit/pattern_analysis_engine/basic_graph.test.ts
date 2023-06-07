import { DerivationEngine, DerivationRule, PatternAnalysisEngine } from '../../../src';
import { init_basic_graph } from '../utils/graphs/init_basic_graph';
import { graph_edge_builder } from '../utils/graph_edge_builder';

describe('Pattern analysis engine', () => {
  let basicGraphDerivationEngine;
  let basicGraph;
  let basicEngine: PatternAnalysisEngine;

  beforeAll(async () => {
    const basicGraphRules = [
      new DerivationRule('()[et1]>()[et2,et3]>()', '(1)[et1](3)'),
      new DerivationRule('(t1)[et2,et3]>()<[et1](t3)', '(2)[et3](1)'),
      new DerivationRule('()<[](t3)[et3]>(t2)', '(3)[et1,et2](1)'),
    ];

    basicGraph = await init_basic_graph();
    basicGraphDerivationEngine = new DerivationEngine(
      basicGraph,
      basicGraphRules,
      graph_edge_builder,
    );
    await basicGraphDerivationEngine.deriveEdges(1);
    basicEngine = new PatternAnalysisEngine(basicGraph);
  });

  describe('Basic graph', () => {
    it('?(t1)', async () => {
      const result = await basicEngine.run('?(t1)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });

    it('?(t1 or T3)', async () => {
      const result = await basicEngine.run('?(t1 or T3)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(4);
    });

    it("?('1')", async () => {
      const result = await basicEngine.run("?('1')");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it("?('1':T1)", async () => {
      const result = await basicEngine.run("?('1':T1)");

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it('?(t1)->(*)', async () => {
      const result = await basicEngine.run('?(t1)->(*)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(3);
    });

    it('?(t1)-[et2]->(*)', async () => {
      const result = await basicEngine.run('?(t1)-[et2]->(*)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });

    it('?(t3)<-(*)-[et3]->(t2)', async () => {
      const result = await basicEngine.run('?(t3)<-(*)-[et3]->(t2)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it('?(t2)=[et2]=>(*)', async () => {
      const result = await basicEngine.run('?(t2)=[et2]=>(*)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });

    it('?(t2)=[et2]=>(*)<-(*)', async () => {
      const result = await basicEngine.run('?(t2)=[et2]=>(*)<-(*)');

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });
  });
});
