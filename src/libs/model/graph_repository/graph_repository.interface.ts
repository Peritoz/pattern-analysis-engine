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
    getNode: (nodeId: string) => GraphNode,
    getNodes: (nodeIds: Array<string>) => Array<GraphNode>,
    getRelationship: (relationshipId: string) => GraphRelationship,
    getRelationships: (relationshipIds: Array<string>) => Array<GraphRelationship>,
    transverse: (sourceFilter: NodeFilter, relationshipFilter: RelationshipFilter, targetFilter: NodeFilter) => AnalysisPattern;
}