import {
  DerivationRule,
  EdgeDirection,
  RulePart,
} from "../../../src/libs/engine/derivation_engine/derivation_engine.class";

function extractRuleCondition(condition: string) {
  // Extracting vertices from rule condition
  const vertexRegex = /(\([a-z]([a-z0-9])*(,[a-z]([a-z0-9])*)*\))|(\(\))/g;
  const vertexDescriptions = condition.match(vertexRegex);
  const vertices = vertexDescriptions.map((e) => e.replace(/[()]/g, ""));

  // Extracting edges from rule condition
  const edgeRegex = /(<?\[[a-z]([a-z0-9])*(,[a-z]([a-z0-9])*)*]>?)|(<?\[]>?)/g;
  const edgeDescriptions = condition.match(edgeRegex);
  const edgeDirections = edgeDescriptions.map((e) =>
    e.includes(">") ? EdgeDirection.OUTBOUND : EdgeDirection.INBOUND
  );
  const edges = edgeDescriptions.map((e) => e.replace(/[<\[\]>]/g, ""));

  // Validating rule formation
  if (vertices.length === 3 && edges.length === 2) {
    const [v1, v2, v3] = vertices; // From (v1)<[]>(v2)<[]>(v3)
    const [e1, e2] = edges; // From ()<[e1]>()<[e2]>()

    // Assigning vertex metadata
    const firstPartElementTypes = v1.length > 0 ? v1.split(",") : [];
    const middleElementTypes = v2.length > 0 ? v2.split(",") : [];
    const secondPartElementTypes = v3.length > 0 ? v3.split(",") : [];

    // Assigning edge metadata
    const firstPartEdgeTypes = e1.length > 0 ? e1.split(",") : [];
    const secondPartEdgeTypes = e2.length > 0 ? e2.split(",") : [];
    const [firstPartEdgeDirection, secondPartEdgeDirection] = edgeDirections;

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
  } else {
    throw new Error("Invalid rule condition");
  }
}

/**
 * Extracts the rule part based on the vertex index indicated in the string description
 * @param vertexIndex The index of the vertex to be extracted as RulePart
 * @param otherVertexIndex The index of the opposite vertex in the effect edge description
 */
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
  const vertexRegex = /\([0-9]\)/g;
  const vertexDescriptions = then.match(vertexRegex);
  const edgeRegex = /\[[a-z]([a-z0-9])*(,[a-z]([a-z0-9])*)*]/g;
  const edgeDescriptions = then.match(edgeRegex);

  if (vertexDescriptions.length === 2 && edgeDescriptions.length === 1) {
    // Extracting vertex metadata
    const vertexIds = vertexDescriptions.map((e) => e.replace(/[()]/g, ""));
    const [sourceId, targetId] = vertexIds;
    const sourceIndex = +sourceId;
    const targetIndex = +targetId;
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
