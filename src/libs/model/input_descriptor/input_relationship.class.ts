import {RelationshipDiscriminator} from "@libs/model/input_descriptor/enums/relationship_discriminator.enum";
import {ConnectorDiscriminator} from "@libs/model/input_descriptor/enums/connector_discriminator.enum";

const derivedDiscriminators = [
    ConnectorDiscriminator.PATH_LEFT,
    ConnectorDiscriminator.PATH_RIGHT,
    ConnectorDiscriminator.PATH_BASE
];

export class InputRelationship {
    constructor(
        protected _discriminator: RelationshipDiscriminator,
        protected _sourceDisc: ConnectorDiscriminator,
        protected _targetDisc: ConnectorDiscriminator,
        protected _alias: string,
        protected _types: Array<string>,
        protected _isNegated: boolean
    ) {
    }

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

    get isBidirectional(): boolean {
        return this.getDirectionAsNumber() === 0;
    }

    get isSourceDerived(): boolean {
        return derivedDiscriminators.includes(this._sourceDisc);
    }

    get isTargetDerived(): boolean {
        return derivedDiscriminators.includes(this._targetDisc);
    }

    /**
     * Indicates that the relationship has both connectors of the same nature (PATH or BONDED)
     *
     * @return true if source discriminator and target discriminator are both classified as PATH or BONDED
     */
    get isHomogeneous(): boolean {
        return (this.isSourceDerived && this.isTargetDerived) || (!this.isSourceDerived && !this.isTargetDerived);
    }

    /**
     * Provides the direction as a number from -1 to 1
     *
     * @return -1 if the relationship points to the left, 0 if bidirectional and 1 if the relationship points to the right
     */
    getDirectionAsNumber(): number {
        if ((this.sourceDisc === 'BONDED_BASE' || this.sourceDisc === 'PATH_BASE') &&
            (this.targetDisc === 'BONDED_RIGHT' || this.targetDisc === 'PATH_RIGHT')) {
            return 1;
        } else if ((this.sourceDisc === 'BONDED_LEFT' || this.sourceDisc === 'PATH_LEFT') &&
            (this.targetDisc === 'BONDED_BASE' || this.targetDisc === 'PATH_BASE')) {
            return -1;
        } else {
            return 0;
        }
    }
}