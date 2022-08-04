import {
  DerivationRule,
  EdgeDirection,
  RulePart,
} from "../../../src/libs/engine/derivation_engine/derivation_engine.class";

function extractRuleCondition(condition: string) {
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
  };
}

function getRulePart(vertexIndex: number, otherVertexIndex: number) {
  if (vertexIndex === 1) {
    if (otherVertexIndex !== 1) {
      return RulePart.FIRST_PART_ELEMENT;
    }
  } else if (vertexIndex === 2) {
    if (otherVertexIndex !== 2) {
      return RulePart.MIDDLE_ELEMENT;
    }
  } else if (vertexIndex === 3) {
    if (otherVertexIndex !== 3) {
      return RulePart.SECOND_PART_ELEMENT;
    }
  }

  throw new Error(
    "Invalid rule effect: source and target referencing the same element"
  );
}

function extractRuleEffect(then: string) {
  const vertexDescriptions = then.match(/\([0-9]\)/g);
  const edgeDescriptions = then.match(
    /<?\[[a-z]([a-z0-9])*(,[a-z]([a-z0-9])*)*]>?/g
  );

  if (vertexDescriptions.length === 2 && edgeDescriptions.length === 1) {
    // Extracting vertex metadata
    const vertexTypes = vertexDescriptions.map((e) => e.replace(/[()]/g, ""));
    const sourceIndex = +vertexTypes[0];
    const targetIndex = +vertexTypes[1];
    let source = getRulePart(sourceIndex, targetIndex);
    let target = getRulePart(targetIndex, sourceIndex);

    // Extracting edge metadata
    const edgeTypes = edgeDescriptions.map((e) => e.replace(/[<\[\]>]/g, ""));

    return {
      source,
      target,
      types: edgeTypes,
    };
  } else {
    throw new Error(
      "Invalid rule effect: should be in the form (#)[edgeType1,edgeType2](#)"
    );
  }
}

/**
 * Creates a derivation rule object from the string "condition" and the string "then" passed as parameters
 * @param condition Condition in the form: (t1,t2)[et1,et2]>(t1,t2)<[et1,et2](t1,t2)
 * @param then Then in the form: (1)[et1,et2](3), where the numbers represent the elements in the condition statement. The
 * number 1 represents the first element, the number 2 the middle element and the number 3 the last (third) element
 */
export function createRuleFromText(
  condition: string,
  then: string
): DerivationRule {
  return {
    condition: extractRuleCondition(condition),
    then: extractRuleEffect(then),
  };
}
