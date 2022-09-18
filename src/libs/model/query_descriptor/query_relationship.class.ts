import {Direction} from "@libs/model/common/enums/direction.enum";

export class QueryRelationship {
    constructor(
        protected _types: Array<string>,
        protected _direction: Direction,
        protected _isNegated: boolean,
        protected _isDerived?: boolean
    ) {}

    get types(): Array<string> {
        return this._types;
    }

    get direction(): number {
        return this._direction;
    }

    get isNegated(): boolean {
        return this._isNegated;
    }

    get isDerived(): boolean | undefined {
        return this._isDerived;
    }
}