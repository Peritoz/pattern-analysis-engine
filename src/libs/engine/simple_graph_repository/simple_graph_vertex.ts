import { GraphVertex } from '@libs/model/graph_repository/graph_repository.interface';

export class SimpleGraphVertex implements GraphVertex {
  externalId: string;
  name: string;
  types: Array<string>;

  constructor(name: string, types: Array<string>, externalId: string) {
    this.externalId = externalId;
    this.name = name;
    this.types = types;
  }

  getId(): string {
    return this.externalId;
  }
}
