import {QueryRelationship} from "@libs/model/query_descriptor/query_relationship.class";
import {QueryNode} from "@libs/model/query_descriptor/query_node.class";
import {ChainElement} from "@libs/model/amal_manager/generic_translator/chain_element.interface";

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

        const alias = node.alias;

        this.responseOrder.push(alias);

        if (alias) {
            this.referenceNodes.push(alias);

            const searchTerm = node.searchTerm;

            if (searchTerm) {
                this.identifiers.push({alias, searchTerm});
            }
        }
    }

    addRelationship(relationship: QueryRelationship) {
        this.queryChain.push(relationship);

        const alias = relationship.alias;

        if (alias) {
            this.referenceRelationships.push(alias);
        }
    }

    getPrior(tripleIndex: number) {
        if (tripleIndex - 3 >= 0) {
            return {
                elementA: this.queryChain[tripleIndex - 3],
                relationship: this.queryChain[tripleIndex - 2],
                elementB: this.queryChain[tripleIndex + -1]
            };
        } else {
            return null;
        }
    }

    getNext(tripleIndex: number) {
        if (tripleIndex + 3 < this.queryChain.length) {
            return {
                elementA: this.queryChain[tripleIndex + 1],
                relationship: this.queryChain[tripleIndex + 2],
                elementB: this.queryChain[tripleIndex + +3]
            };
        } else {
            return null;
        }
    }
}