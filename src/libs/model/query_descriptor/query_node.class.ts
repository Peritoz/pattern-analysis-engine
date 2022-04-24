export class QueryNode {
    constructor(
        protected _types: Array<string>,
        protected _searchTerm?: string,
        protected _ids?: Array<string>
    ) {}

    get ids(): Array<string> {
        return this._ids || [];
    }

    set ids(value: Array<string>) {
        this._ids = value;
    }

    get types(): Array<string> {
        return this._types;
    }

    get searchTerm(): string {
        return this._searchTerm || "";
    }
}