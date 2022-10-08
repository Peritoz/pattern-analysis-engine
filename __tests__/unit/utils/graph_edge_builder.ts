import {SimpleGraphEdge} from "../../../src";

export const graph_edge_builder = (
    sourceId: string,
    targetId: string,
    types: Array<string>,
    externalId: string = "",
    derivationPath: Array<string> = []
) => {
    return new SimpleGraphEdge(
        sourceId,
        targetId,
        types,
        externalId,
        derivationPath
    );
};