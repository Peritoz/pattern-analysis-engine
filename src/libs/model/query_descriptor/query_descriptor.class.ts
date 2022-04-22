import {QueryRelationship} from "@libs/model/query_descriptor/query_relationship.class";
import {QueryNode} from "@libs/model/query_descriptor/query_node.class";

export class QueryDescriptor {
    protected _query: string = "";
    protected _identifiers: Array<{ alias: string, searchTerm: string }> = [];
    protected _referenceNodes: Array<string> = [];
    protected _referenceRelationships: Array<string> = [];
    protected _queryChain: Array<QueryNode | QueryRelationship> = [];
    protected _responseOrder: Array<string> = [];

    constructor(query: string) {
        this._query = query;
    }

    get identifiers(): Array<{ alias: string, searchTerm: string }> {
        return this._identifiers;
    }

    get referenceNodes(): Array<string> {
        return this._referenceNodes;
    }

    get referenceRelationships(): Array<string> {
        return this._referenceRelationships;
    }

    addNode(node: QueryNode) {
        this._queryChain.push(node);

        const alias = node.alias;

        this._responseOrder.push(alias);

        if (alias) {
            this.referenceNodes.push(alias);

            const searchTerm = node.searchTerm;

            if (searchTerm) {
                this._identifiers.push({alias, searchTerm});
            }
        }
    }

    addRelationship(relationship: QueryRelationship) {
        this._queryChain.push(relationship);

        const alias = relationship.alias;

        if (alias) {
            this._referenceRelationships.push(alias);
        }
    }

    getPrior(tripleIndex: number) {
        if (tripleIndex - 3 >= 0) {
            return {
                elementA: this._queryChain[tripleIndex - 3],
                relationship: this._queryChain[tripleIndex - 2],
                elementB: this._queryChain[tripleIndex + -1]
            };
        } else {
            return null;
        }
    }

    getNext(tripleIndex: number) {
        if (tripleIndex + 3 < this._queryChain.length) {
            return {
                elementA: this._queryChain[tripleIndex + 1],
                relationship: this._queryChain[tripleIndex + 2],
                elementB: this._queryChain[tripleIndex + +3]
            };
        } else {
            return null;
        }
    }
}