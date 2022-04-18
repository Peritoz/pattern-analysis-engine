import {ChainElement} from "@libs/model/amalManager/genericTranslator/chain_element.interface";

export interface QueryObject {
    identifiers: Array<{ alias: string, identifier: string, id: string }>;
    referenceNodes: Array<{ alias: string }>;
    referenceRelationships: Array<{ alias: string }>;
    naiveChain: Array<ChainElement>;
    responseOrder: Array<string>;
}