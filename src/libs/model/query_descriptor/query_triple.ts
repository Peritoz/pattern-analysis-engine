import {QueryNode} from "@libs/model/query_descriptor/query_node.class";
import {QueryRelationship} from "@libs/model/query_descriptor/query_relationship.class";

export class QueryTriple {
    constructor(
        protected _leftNode: QueryNode,
        protected _relationship: QueryRelationship,
        protected _rightNode: QueryNode
    ) {
    }

    setInputIds(ids: Array<string>) {
        switch (this._relationship.direction) {
            case -1:
                this._rightNode.ids = ids;
                break;
            case 0:
                this._leftNode.ids = ids;
                this._rightNode.ids = ids;
                break;
            case 1:
                this._leftNode.ids = ids;
                break;
        }
    }

    getInputIds() {
        return this._leftNode.ids;
    }

    setOutputIds(ids: Array<string>) {
        switch (this._relationship.direction) {
            case -1:
                this._leftNode.ids = ids;
                break;
            case 0:
                this._leftNode.ids = ids;
                this._rightNode.ids = ids;
                break;
            case 1:
                this._rightNode.ids = ids;
                break;
        }
    }

    getOutputIds() {
        return this._rightNode.ids;
    }

    get leftNode(): QueryNode {
        return this._leftNode;
    }

    get relationship(): QueryRelationship {
        return this._relationship;
    }

    get rightNode(): QueryNode {
        return this._rightNode;
    }
}