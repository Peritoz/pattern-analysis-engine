import {InputRelationship} from "@libs/model/input_descriptor/input_relationship.class";
import {InputNode} from "@libs/model/input_descriptor/input_node.class";
import {QueryDescriptor} from "@libs/model/query_descriptor/query_descriptor.class";
import {QueryTriple} from "@libs/model/query_descriptor/query_triple";
import {QueryNode} from "@libs/model/query_descriptor/query_node.class";
import {QueryRelationship} from "@libs/model/query_descriptor/query_relationship.class";

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

    generateQueryDescriptor(): QueryDescriptor {
        const queryDescriptor = new QueryDescriptor(this._query);

        for (let i = 0; i < this._queryChain.length; i = i + 3) {
            // TODO: Verify instanceOf before casting
            const leftNode: InputNode = this._queryChain[i] as InputNode;
            const rel: InputRelationship = this._queryChain[i + 1] as InputRelationship;
            const rightNode: InputNode = this._queryChain[i + 2] as InputNode;
            const triple = new QueryTriple(
                new QueryNode(leftNode.types, leftNode.searchTerm),
                new QueryRelationship(rel.types, rel.getDirectionAsNumber(), rel.isNegated, false),
                new QueryNode(rightNode.types, rightNode.searchTerm));

            queryDescriptor.addTriple(triple);
        }

        return queryDescriptor;
    }
}