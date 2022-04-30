import {QueryEngine} from "@libs/engine/query_engine/query_engine";

const {processQueryText} = require("../query_interpreter");
import {GraphRepository} from "../../model/graph_repository/graph_repository.interface";
import {QueryDescriptor} from "@libs/model/query_descriptor/query_descriptor.class";

export class PatternAnalysisEngine {
    protected _repo: GraphRepository;
    protected _queryEngine: QueryEngine;

    constructor(repository: GraphRepository) {
        this._repo = repository;
        this._queryEngine = new QueryEngine(this._repo);
    }

    async run(query: string, initialElementIds: Array<string>): Promise<object[]> {
        if (query !== null) {
            let queryDescriptor: QueryDescriptor = processQueryText(query);

            return this._queryEngine.run(queryDescriptor, initialElementIds);
        } else {
            throw new Error("Unable to process query");
        }
    }
}
