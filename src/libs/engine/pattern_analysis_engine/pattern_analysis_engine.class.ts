import { QueryEngine } from "@libs/engine/query_engine/query_engine.class";

const { OhmInterpreter } = require("../query_interpreter");
import { GraphRepository } from "@libs/engine";
import { QueryDescriptor } from "@libs/model/query_descriptor/query_descriptor.class";
import { OutputVertex } from "@libs/model/output/output_vertex.interface";
import { OutputEdge } from "@libs/model/output/output_edge.interface";

export class PatternAnalysisEngine {
  protected _repo: GraphRepository;
  protected _queryEngine: QueryEngine;

  constructor(repository: GraphRepository) {
    this._repo = repository;
    this._queryEngine = new QueryEngine(this._repo);
  }

  async run(
    query: string,
    initialElementIds: Array<string> = []
  ): Promise<Array<Array<OutputVertex | OutputEdge>>> {
    if (query !== null) {
      let queryDescriptor: QueryDescriptor =
        OhmInterpreter.mountInputDescriptor(query).generateQueryDescriptor();

      return this._queryEngine.run(queryDescriptor, initialElementIds);
    } else {
      throw new Error("Unable to process query");
    }
  }
}
