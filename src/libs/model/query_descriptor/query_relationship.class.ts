import {RelationshipDiscriminator} from "@libs/model/query_descriptor/enums/relationship_discriminator.enum";
import {ConnectorDiscriminator} from "@libs/model/query_descriptor/enums/connector_discriminator.enum";

export class QueryRelationship {
    constructor(
        protected _discriminator: RelationshipDiscriminator,
        protected _sourceDisc: ConnectorDiscriminator,
        protected _targetDisc: ConnectorDiscriminator,
        protected _alias: string,
        protected _types: Array<string>,
        protected _isNegated: boolean
    ) {}

    get discriminator(): RelationshipDiscriminator {
        return this._discriminator;
    }

    get sourceDisc(): ConnectorDiscriminator {
        return this._sourceDisc;
    }

    set sourceDisc(value: ConnectorDiscriminator) {
        this._sourceDisc = value;
    }

    get targetDisc(): ConnectorDiscriminator {
        return this._targetDisc;
    }

    set targetDisc(value: ConnectorDiscriminator) {
        this._targetDisc = value;
    }

    get alias(): string {
        return this._alias;
    }

    set alias(value: string) {
        this._alias = value;
    }

    get types(): Array<string> {
        return this._types;
    }

    get isNegated(): boolean {
        return this._isNegated;
    }

    /**
     * Provides the direction as a number from -1 to 1
     * @return -1 if the relationship points to the left, 0 if bidirectional and 1 if the relationship points to the right
     */
    getDirectionAsNumber () :number {
        if ((this.sourceDisc === 'BONDED_BASE' && this.targetDisc === 'BONDED_RIGHT') ||
            (this.sourceDisc === 'PATH_BASE' && this.targetDisc === 'PATH_RIGHT')) {
            return 1;
        } else if ((this.sourceDisc === 'BONDED_LEFT' && this.targetDisc === 'BONDED_BASE') ||
            (this.sourceDisc === 'PATH_LEFT' && this.targetDisc === 'PATH_BASE')) {
            return -1;
        } else {
            return 0;
        }
    }
}