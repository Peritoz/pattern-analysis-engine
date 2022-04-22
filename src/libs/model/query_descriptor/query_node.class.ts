import {NodeDiscriminator} from "@libs/model/query_descriptor/enums/node_discriminator.enum";

export class QueryNode {
    constructor(
        protected _discriminator: NodeDiscriminator,
        protected _alias: string,
        protected _types: Array<string>,
        protected _searchTerm: string
    ) {}

    get discriminator(): NodeDiscriminator {
        return this._discriminator;
    }

    get alias(): string {
        return this._alias;
    }

    get types(): Array<string> {
        return this._types;
    }

    get searchTerm(): string {
        return this._searchTerm;
    }
}