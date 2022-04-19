import {QueryRelationship} from "@libs/model/query_descriptor/query_relationship.class";
import {QueryNode} from "@libs/model/query_descriptor/query_node.class";

export class QueryDescriptor {
    protected query: string = "";
    protected identifiers: Array<{ alias: string, searchTerm: string }> = [];
    protected referenceNodes: Array<string> = [];
    protected referenceRelationships: Array<string> = [];
    protected queryChain: Array<QueryNode | QueryRelationship> = [];
    protected responseOrder: Array<string> = [];

    constructor(query: string) {
        this.query = query;
    }

    addNode(node: QueryNode) {
        this.queryChain.push(node);

        const alias = node.getAlias();

        this.responseOrder.push(alias);

        if (alias) {
            this.referenceNodes.push(alias);

            const searchTerm = node.getSearchTerm();

            if (searchTerm) {
                this.identifiers.push({alias, searchTerm});
            }
        }
    }

    addRelationship(relationship: QueryRelationship) {
        this.queryChain.push(relationship);

        const alias = relationship.getAlias();

        if (alias) {
            this.referenceRelationships.push(alias);
        }
    }
}