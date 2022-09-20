import {SimpleGraphEdge} from "../../../src";

export const graphEdgeBuilder = (
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