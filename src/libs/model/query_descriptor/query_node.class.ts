import {NodeDiscriminator} from "@libs/model/query_descriptor/enums/node_discriminator.enum";

export class QueryNode {
    constructor(
        protected discriminator: NodeDiscriminator,
        protected alias: string,
        protected types: Array<string>,
        protected searchTerm: string
    ) {}
}