export class QueryNode {
    protected alias: string = "";
    protected type: string = "";
    protected searchTerm: string = "";

    public getSearchTerm(): string {
        return this.searchTerm;
    }

    public getAlias(): string {
        return this.alias;
    }

    public getType(): string {
        return this.type;
    }
}