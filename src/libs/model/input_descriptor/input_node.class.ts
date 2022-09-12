import { NodeDiscriminator } from "@libs/model/input_descriptor/enums/node_discriminator.enum";

export class InputNode {
  protected _discriminator: NodeDiscriminator;
  protected _alias: string;
  protected _types: Array<string>;
  protected _searchTerm: string;

  constructor(
    _discriminator: NodeDiscriminator,
    _alias: string,
    _types: Array<string>,
    _searchTerm: string
  ) {
    this._discriminator = _discriminator;
    this._alias = _alias;
    this._types = Array.isArray(_types)
      ? _types.map((t) => t.toLowerCase())
      : [];
    this._searchTerm = _searchTerm.toLowerCase();
  }

  get discriminator(): NodeDiscriminator {
    return this._discriminator;
  }

  get alias(): string {
    return this._alias;
  }

  get types(): Array<string> {
    return this._types;
  }

  get searchTerm(): string {
    return this._searchTerm;
  }
}
