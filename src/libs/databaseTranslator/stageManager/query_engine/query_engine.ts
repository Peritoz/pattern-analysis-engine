import {GraphRepository} from "@libs/model/graph_repository/graph_repository.interface";
import {QueryDescriptor} from "@libs/model/input_descriptor/query_descriptor.class";

export class QueryEngine {
    constructor(protected repository: GraphRepository) {
    }

    run(queryDescriptor: QueryDescriptor) {

    }
}