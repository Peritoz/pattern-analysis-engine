import { GraphEdge } from "@libs/model/graph_repository/graph_repository.interface";

export class SimpleGraphEdge implements GraphEdge {
  externalId: string;
  sourceId: string;
  targetId: string;
  types: Array<string>;
  derivationPath: Array<string>;

  constructor(
    sourceId: string,
    targetId: string,
    types: Array<string>,
    externalId: string,
    derivationPath: Array<string> = []
  ) {
    if (!sourceId) {
      throw new Error("Invalid source id");
    }
    if (!targetId) {
      throw new Error("Invalid target id");
    }
    if (!externalId) {
      throw new Error("Invalid external id");
    }

    this.externalId = externalId;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.types = types;
    this.derivationPath = derivationPath;
  }

  getId(): string {
    return this.externalId;
  }
}
