import { QueryDescriptor } from "../../../src/libs/model/query_descriptor/query_descriptor.class";
import { QueryTriple } from "../../../src/libs/model/query_descriptor/query_triple.class";

export function validate_query_descriptor(
  queryDescriptor: QueryDescriptor,
  triples: Array<QueryTriple>
): boolean {
  if (queryDescriptor.queryChain.length === triples.length) {
    for (let i = 0; i < queryDescriptor.queryChain.length; i++) {
      const triple: QueryTriple = queryDescriptor.queryChain[i];
      const resultTriple: QueryTriple = triples[i];

      if (
        triple.leftNode.searchTerm !== resultTriple.leftNode.searchTerm ||
        !triple.leftNode.types.every(
          (e, i) => e === resultTriple.leftNode.types[i]
        )
      ) {
        return false;
      }

      if (
        triple.relationship.direction !== resultTriple.relationship.direction ||
        triple.relationship.isDerived !== resultTriple.relationship.isDerived ||
        triple.relationship.isNegated !== resultTriple.relationship.isNegated ||
        !triple.relationship.types.every(
          (e, i) => e === resultTriple.relationship.types[i]
        )
      ) {
        return false;
      }

      if (
        triple.rightNode.searchTerm !== resultTriple.rightNode.searchTerm ||
        !triple.rightNode.types.every(
          (e, i) => e === resultTriple.rightNode.types[i]
        )
      ) {
        return false;
      }
    }
  } else {
    return false;
  }

  return true;
}