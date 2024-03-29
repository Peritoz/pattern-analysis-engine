import { Direction } from '@libs/model/common/enums/direction.enum';
import { OutputEdge } from '@libs/model/output/output_edge.interface';
import { OutputVertex } from '@libs/model/output/output_vertex.interface';

const createOutputVertex = (
  id: string,
  name: string,
  types: Array<string>,
  shouldBeReturned = true,
): OutputVertex => {
  return {
    identifier: id,
    label: name,
    types,
    shouldBeReturned,
  };
};

const createOutputEdge = (
  direction: Direction,
  types: Array<string>,
  identifier?: string,
  derivationPath?: Array<string>,
): OutputEdge => {
  if (Array.isArray(derivationPath) && derivationPath.length > 0) {
    return {
      identifier,
      direction,
      types,
      derivationPath,
    };
  } else if (identifier) {
    return {
      identifier,
      direction,
      types,
    };
  } else {
    return {
      direction,
      types,
    };
  }
};

export { createOutputVertex, createOutputEdge };
