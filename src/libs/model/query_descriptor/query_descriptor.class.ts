import {QueryTriple} from "@libs/model/query_descriptor/query_triple";

export class QueryDescriptor {
    protected _query: string;
    protected _queryChain: Array<QueryTriple>;

    constructor(query: string) {
        this._query = query;
        this._queryChain = [];
    }

    get query(): string {
        return this._query;
    }

    get queryChain(): Array<QueryTriple> {
        return this._queryChain;
    }

    addTriple(triple: QueryTriple) {
        this._queryChain.push(triple);
    }

    addTriples(tripleList: Array<QueryTriple>) {
        this._queryChain = this._queryChain.concat(tripleList);
    }
}