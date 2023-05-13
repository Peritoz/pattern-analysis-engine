import { DerivationEngine, DerivationRule } from '../../../src';
import { init_basic_graph } from '../utils/graphs/init_basic_graph';
import { init_complex_graph } from '../utils/graphs/init_complex_graph';
import { QueryEngine } from '../../../src/libs/engine/query_engine';
import { OhmInterpreter } from '../../../src/libs/engine/query_interpreter';
import { graph_edge_builder } from '../utils/graph_edge_builder';

describe('Query engine', () => {
  let basicGraphEngine;
  let basicGraph;
  let complexGraphEngine;
  let complexGraph;
  let basicQueryEngine;
  let complexQueryEngine;

  beforeAll(async () => {
    const basicGraphRules = [
      new DerivationRule('()[et1]>()[et2,et3]>()', '(1)[et1](3)'),
      new DerivationRule('(t1)[et2,et3]>()<[et1](t3)', '(2)[et3](1)'),
      new DerivationRule('()<[](t3)[et3]>(t2)', '(3)[et1,et2](1)'),
    ];
    const complexGraphRules = [
      new DerivationRule('(a)[e1]>(b)[e2]>(c)', '(1)[e1](3)'),
      new DerivationRule('(a)[e1]>(b)[e3]>(e)', '(2)[e3](1)'),
      new DerivationRule('()[]>(d)[e4]>(f)', '(3)[e1,e2](1)'),
    ];

    basicGraph = await init_basic_graph();
    complexGraph = await init_complex_graph();
    basicGraphEngine = new DerivationEngine(basicGraph, basicGraphRules, graph_edge_builder);
    complexGraphEngine = new DerivationEngine(complexGraph, complexGraphRules, graph_edge_builder);

    await basicGraphEngine.deriveEdges(1);
    await complexGraphEngine.deriveEdges(1);

    basicQueryEngine = new QueryEngine(basicGraph);
    complexQueryEngine = new QueryEngine(complexGraph);
  });

  describe('Basic graph', () => {
    it('?(t1)->(*)', async () => {
      const result = await basicQueryEngine.run(
        OhmInterpreter.mountInputDescriptor('?(t1)->(*)').generateQueryDescriptor(),
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(3);
    });

    it('?(t1)->()', async () => {
      const result = await basicQueryEngine.run(
        OhmInterpreter.mountInputDescriptor('?(t1)->()').generateQueryDescriptor(),
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveLength(3);
      expect(result[0][0].shouldBeReturned).toBeTruthy();
      expect(result[0][2].shouldBeReturned).toBeFalsy();
    });

    it('?(t1)-[et2]->(*)', async () => {
      const result = await basicQueryEngine.run(
        OhmInterpreter.mountInputDescriptor('?(t1)-[et2]->(*)').generateQueryDescriptor(),
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });

    it('?(t3)<-(*)-[et3]->(t2)', async () => {
      const result = await basicQueryEngine.run(
        OhmInterpreter.mountInputDescriptor('?(t3)<-(*)-[et3]->(t2)').generateQueryDescriptor(),
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it('?(t3)<-()-[et3]->(t2)', async () => {
      const result = await basicQueryEngine.run(
        OhmInterpreter.mountInputDescriptor('?(t3)<-()-[et3]->(t2)').generateQueryDescriptor(),
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(5);
      expect(result[0][0].shouldBeReturned).toBeTruthy();
      expect(result[0][2].shouldBeReturned).toBeFalsy();
      expect(result[0][4].shouldBeReturned).toBeTruthy();
    });

    it('?(t2)=[et2]=>(*)', async () => {
      const result = await basicQueryEngine.run(
        OhmInterpreter.mountInputDescriptor('?(t2)=[et2]=>(*)').generateQueryDescriptor(),
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });

    it('?(t2)=[et2]=>(*)<-(*)', async () => {
      const result = await basicQueryEngine.run(
        OhmInterpreter.mountInputDescriptor('?(t2)=[et2]=>(*)<-(*)').generateQueryDescriptor(),
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });
  });

  describe('Complex graph', () => {
    it('?(a)->(*)', async () => {
      const result = await complexQueryEngine.run(
        OhmInterpreter.mountInputDescriptor('?(a)->(*)').generateQueryDescriptor(),
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it('?(a)-[e1]->(*)', async () => {
      const result = await complexQueryEngine.run(
        OhmInterpreter.mountInputDescriptor('?(a)-[e1]->(*)').generateQueryDescriptor(),
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it('?(a)->(*)-[e2]->(c)', async () => {
      const result = await complexQueryEngine.run(
        OhmInterpreter.mountInputDescriptor('?(a)->(*)-[e2]->(c)').generateQueryDescriptor(),
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it('?(b)=[e3]=>(*)', async () => {
      const result = await complexQueryEngine.run(
        OhmInterpreter.mountInputDescriptor('?(b)=[e3]=>(*)').generateQueryDescriptor(),
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });

    it('?(f)=[e1]=>(*)', async () => {
      const result = await complexQueryEngine.run(
        OhmInterpreter.mountInputDescriptor('?(f)=[e1]=>(*)').generateQueryDescriptor(),
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });
  });
});
