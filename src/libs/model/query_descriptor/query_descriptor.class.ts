import { QueryTriple } from '@libs/model/query_descriptor/query_triple.class';

export class QueryDescriptor {
  protected _query: string;
  protected _queryChain: Array<QueryTriple>;
  protected _queryFilter: {
    _types: Array<string>;
    _searchTerm: string;
  } | null;

  constructor(query = '') {
    this._query = query;
    this._queryChain = [];
    this._queryFilter = null;
  }

  get query(): string {
    return this._query;
  }

  get queryChain(): Array<QueryTriple> {
    return this._queryChain;
  }

  get queryFilter(): { types: Array<string>; searchTerm: string } | null {
    if (this._queryFilter) {
      return {
        types: this._queryFilter?._types,
        searchTerm: this._queryFilter?._searchTerm,
      };
    } else {
      return null;
    }
  }

  isComplexQuery(): boolean {
    return this._queryFilter === null;
  }

  setFilter(types: Array<string>, searchTerm: string) {
    if (this._queryChain.length > 0) {
      throw new Error(
        `Query conversion is not allowed. The query ${this._query} has a defined query chain`,
      );
    }

    this._queryFilter = {
      _types: types,
      _searchTerm: searchTerm,
    };
  }

  addTriple(triple: QueryTriple) {
    if (this._queryFilter !== null) {
      throw new Error(
        `Query conversion is not allowed. The query ${this._query} has a filter defined`,
      );
    }

    this._queryChain.push(triple);
  }

  addTriples(tripleList: Array<QueryTriple>) {
    if (this._queryFilter !== null) {
      throw new Error(
        `Query conversion is not allowed. The query ${this._query} has a filter defined`,
      );
    }

    this._queryChain = this._queryChain.concat(tripleList);
  }
}
