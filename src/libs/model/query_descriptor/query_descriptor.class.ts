import {QueryRelationship} from "@libs/model/query_descriptor/query_relationship.class";
import {QueryNode} from "@libs/model/query_descriptor/query_node.class";

export class QueryDescriptor {
    protected query: string = "";
    protected identifiers: Array<{ alias: string, identifier: string, id: string }> = [];
    protected referenceNodes: Array<{ alias: string }> = [];
    protected referenceRelationships: Array<{ alias: string }> = [];
    protected queryChain: Array<QueryNode | QueryRelationship> = [];
    protected responseOrder: Array<string> = [];

    constructor(query: string) {
        this.query = query;
    }

    addNode(node: QueryNode) {
        this.queryChain.push(node);
    }

    addRelationship(relationship: QueryRelationship) {
        this.queryChain.push(relationship);
    }
}