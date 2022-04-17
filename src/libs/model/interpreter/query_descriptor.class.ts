import {QueryRelationship} from "@libs/model/interpreter/query_relationship.class";
import {QueryNode} from "@libs/model/interpreter/query_node.class";

export class Query {
    protected query: string = "";
    protected queryChain: Array<QueryNode | QueryRelationship> = [];

    constructor(query: string) {
        this.query = query;
    }
}