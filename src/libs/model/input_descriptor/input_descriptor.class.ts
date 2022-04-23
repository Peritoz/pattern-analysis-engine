import {InputRelationship} from "@libs/model/input_descriptor/input_relationship.class";
import {InputNode} from "@libs/model/input_descriptor/input_node.class";

export class InputDescriptor {
    protected _query: string = "";
    protected _identifiers: Array<{ alias: string, searchTerm: string }> = [];
    protected _referenceNodes: Array<string> = [];
    protected _referenceRelationships: Array<string> = [];
    protected _queryChain: Array<InputNode | InputRelationship> = [];
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

    addNode(node: InputNode) {
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

    addRelationship(relationship: InputRelationship) {
        this._queryChain.push(relationship);

        const alias = relationship.alias;

        if (alias) {
            this._referenceRelationships.push(alias);
        }
    }
}