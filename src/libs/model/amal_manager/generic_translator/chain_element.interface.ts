export interface ChainElement {
    discriminator: string,
    alias?: string | null,
    elementTypes?: Array<string> | null,
    source?: string,
    target?: string,
    relationshipType?: string,
    negated?: boolean
}