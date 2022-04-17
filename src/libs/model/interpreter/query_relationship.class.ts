export class QueryRelationship {
    protected type: string = "";
    protected direction: Direction = Direction.Bidirectional;
    protected isPath: boolean = true;
    protected isNegated: boolean = false;

    public getDirection(): Direction {
        return this.direction;
    }

    public getType(): string {
        return this.type;
    }
}