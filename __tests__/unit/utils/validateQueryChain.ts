import { InputDescriptor } from "../../../src/libs/model/input_descriptor/input_descriptor.class";
import { InputNode } from "../../../src/libs/model/input_descriptor/input_node.class";
import { InputRelationship } from "../../../src/libs/model/input_descriptor/input_relationship.class";

export function validateQueryChain(
  inputDescriptor: InputDescriptor,
  result: Array<InputNode | InputRelationship>
): boolean {
  if (inputDescriptor.queryChain.length === result.length) {
    for (let i = 0; i < inputDescriptor.queryChain.length; i++) {
      const element: InputNode | InputRelationship =
        inputDescriptor.queryChain[i];
      const resultElement: InputNode | InputRelationship = result[i];

      if (
        element.discriminator !== resultElement.discriminator ||
        !element.types.every((e, i) => e === resultElement.types[i])
      ) {
        return false;
      }
      if (element instanceof InputNode && resultElement instanceof InputNode) {
        if (element.searchTerm !== resultElement.searchTerm.toLowerCase()) {
          return false;
        }
      }
      if (
        element instanceof InputRelationship &&
        resultElement instanceof InputRelationship
      ) {
        if (
          element.sourceDisc !== resultElement.sourceDisc ||
          element.targetDisc !== resultElement.targetDisc ||
          element.isNegated !== resultElement.isNegated ||
          element.isBidirectional !== resultElement.isBidirectional
        ) {
          return false;
        }
      }
    }
  } else {
    return false;
  }

  return true;
}