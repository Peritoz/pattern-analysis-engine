import {
  DerivationRule,
  EdgeDirection,
  RulePart,
} from "../../../src/libs/engine/derivation_engine/derivation_engine.class";

/**
 * Creates a derivation rule object from the string "condition" and the string "then" passed as parameters
 * @param condition Condition in the form: (t1,t2)[et1,et2]>(t1,t2)<[et1,et2](t1,t2)
 * @param then Then in the form: (1)[et1,et2]>(3), where the numbers represent the elements in the condition statement. The
 * number 1 represents the first element, the number 2 the middle element and the number 3 the last (third) element
 */
export function createRuleFromText(
  condition: string,
  then: string
): DerivationRule {
  const vertexDescriptions = condition.match(
    /(\([a-z]([a-z0-9])*(,[a-z]([a-z0-9])*)*\))|(\(\))/g
  );
  const edgeDescriptions = condition.match(
    /(<?\[[a-z]([a-z0-9])*(,[a-z]([a-z0-9])*)*]>?)|(<?\[]>?)/g
  );

  // Extracting vertex metadata
  const vertexTypes = vertexDescriptions.map((e) => e.replace(/[()]/g, ""));
  let firstPartElementTypes = [];
  let middleElementTypes = [];
  let secondPartElementTypes = [];
  let firstPartEdgeTypes = [];
  let secondPartEdgeTypes = [];
  let firstPartEdgeDirection = EdgeDirection.OUTBOUND;
  let secondPartEdgeDirection = EdgeDirection.OUTBOUND;

  if (vertexTypes.length === 3) {
    firstPartElementTypes =
      vertexTypes[0].length > 0 ? vertexTypes[0].split(",") : [];
    middleElementTypes =
      vertexTypes[1].length > 0 ? vertexTypes[1].split(",") : [];
    secondPartElementTypes =
      vertexTypes[2].length > 0 ? vertexTypes[2].split(",") : [];
  }

  // Extracting edge metadata
  const edgeDirections = edgeDescriptions.map((e) =>
    e.includes(">") ? EdgeDirection.OUTBOUND : EdgeDirection.INBOUND
  );
  const edgeTypes = edgeDescriptions.map((e) => e.replace(/[<\[\]>]/g, ""));

  if (edgeTypes.length === 2) {
    firstPartEdgeTypes = edgeTypes[0].length > 0 ? edgeTypes[0].split(",") : [];
    secondPartEdgeTypes =
      edgeTypes[1].length > 0 ? edgeTypes[1].split(",") : [];
    firstPartEdgeDirection = edgeDirections[0];
    secondPartEdgeDirection = edgeDirections[1];
  }

  return {
    condition: {
      firstPart: {
        elementTypes: firstPartElementTypes,
        edgeTypes: firstPartEdgeTypes,
        direction: firstPartEdgeDirection,
      },
      middleElementTypes: middleElementTypes,
      secondPart: {
        elementTypes: secondPartElementTypes,
        edgeTypes: secondPartEdgeTypes,
        direction: secondPartEdgeDirection,
      },
    },
    then: {
      source: RulePart.FIRST_PART_ELEMENT,
      target: RulePart.SECOND_PART_ELEMENT,
      types: [],
    },
  };
}
