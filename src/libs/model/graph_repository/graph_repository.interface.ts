export interface NodeFilter {
    ids?: Array<string>,
    searchTerm?: string,
    types?: Array<string>
}

export interface RelationshipFilter {
    types?: Array<string>,
    isDerived: boolean,
    isNegated: boolean
}

export interface GraphNode {
    id: string,
    name: string,
    types: Array<string>,
    properties?: { [key: string]: any }
}

export interface GraphRelationship {
    id: string
    sourceId: string,
    targetId: string,
    types: Array<string>,
    derivationPath: Array<string>
}

export interface AnalysisPattern {
    analysisChain: Array<GraphNode | GraphRelationship>
}

export interface GraphRepository {
    getNode: (nodeId: string) => Promise<GraphNode>,
    getNodes: (nodeIds: Array<string>) => Promise<Array<GraphNode>>,
    getNodesByFilter: (filter: NodeFilter) => Promise<Array<GraphNode>>,
    getRelationship: (relationshipId: string) => Promise<GraphRelationship>,
    getRelationships: (relationshipIds: Array<string>) => Promise<Array<GraphRelationship>>,
    transverse: (
        sourceFilter: NodeFilter, relationshipFilter: RelationshipFilter, targetFilter: NodeFilter
    ) => Promise<AnalysisPattern>;
}