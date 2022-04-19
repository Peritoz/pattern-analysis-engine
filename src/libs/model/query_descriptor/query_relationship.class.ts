import {Direction} from "@libs/model/query_descriptor/enums/direction.enum";

export class QueryRelationship {
    constructor(
        protected alias: string,
        protected types: Array<string>,
        protected direction: Direction,
        protected isPath: boolean,
        protected isNegated: boolean
    ) {}

    getAlias(): string {
        return this.alias;
    }
}