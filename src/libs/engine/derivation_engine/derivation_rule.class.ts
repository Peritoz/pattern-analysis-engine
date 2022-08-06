export enum EdgeDirection {
  OUTBOUND,
  INBOUND,
}

export enum RulePart {
  FIRST_PART_ELEMENT,
  MIDDLE_ELEMENT,
  SECOND_PART_ELEMENT,
}

export interface RuleEdgeDescription {
  elementTypes: Array<string>;
  edgeTypes: Array<string>;
  direction: EdgeDirection;
}

export interface RuleConditional {
  firstPart: RuleEdgeDescription;
  middleElementTypes: Array<string>;
  secondPart: RuleEdgeDescription;
}

export interface RuleEffect {
  source: RulePart; // Origin of the source element of the derived edge
  target: RulePart; // Origin of the target element of the derived edge
  types: Array<string>; // Types to be assigned to the derived edge
}

export class DerivationRule {
  condition: RuleConditional;
  effect: RuleEffect;

  constructor(
    condition: RuleConditional | string,
    effect: RuleEffect | string
  ) {
    if (typeof condition === "string") {
      this.condition = this.extractRuleConditional(condition);
    } else {
      this.condition = condition;
    }

    if (typeof effect === "string") {
      this.effect = this.extractRuleEffect(effect);
    } else {
      this.effect = effect;
    }
  }

  /**
   * Creates a rule conditional object from the string "conditional" passed as parameter
   * @param conditional Conditional in the form: (t1,t2)[et1,et2]>(t1,t2)<[et1,et2](t1,t2)
   * @return RuleConditional
   */
  private extractRuleConditional(conditional: string): RuleConditional {
    // Extracting vertices from rule conditional
    const vertexRegex = /(\([a-z]([a-z0-9])*(,[a-z]([a-z0-9])*)*\))|(\(\))/g;
    const vertexDescriptions = conditional.match(vertexRegex);
    const vertices = vertexDescriptions?.map((e) => e.replace(/[()]/g, ""));

    // Extracting edges from rule conditional
    const edgeRegex =
      /(<?\[[a-z]([a-z0-9])*(,[a-z]([a-z0-9])*)*]>?)|(<?\[]>?)/g;
    const edgeDescriptions = conditional.match(edgeRegex);
    const edgeDirections = edgeDescriptions?.map((e) =>
      e.includes(">") ? EdgeDirection.OUTBOUND : EdgeDirection.INBOUND
    );
    const edges = edgeDescriptions?.map((e) => e.replace(/[<\[\]>]/g, ""));

    // Validating rule formation
    if (
      vertices &&
      edges &&
      edgeDirections &&
      vertices.length === 3 &&
      edges.length === 2 &&
      edgeDirections.length === 2
    ) {
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
      throw new Error("Invalid rule conditional");
    }
  }

  /**
   * Extracts the rule part based on the vertex index indicated in the string description
   * @param vertexIndex The index of the vertex to be extracted as RulePart
   * @param otherVertexIndex The index of the opposite vertex in the effect edge description
   */
  private getRulePart(vertexIndex: number, otherVertexIndex: number): RulePart {
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

  /**
   * Creates a rule effect object from the string "effect" passed as parameter
   * @param effect Effect in the form: (1)[et1,et2](3), where the numbers represent the elements in the condition statement. The
   * number 1 represents the first element, the number 2 the middle element and the number 3 the last (third) element
   * @return RuleEffect
   */
  private extractRuleEffect(effect: string): RuleEffect {
    const vertexRegex = /\([0-9]\)/g;
    const vertexDescriptions = effect.match(vertexRegex);
    const edgeRegex = /\[[a-z]([a-z0-9])*(,[a-z]([a-z0-9])*)*]/g;
    const edgeDescriptions = effect.match(edgeRegex);

    if (
      vertexDescriptions &&
      edgeDescriptions &&
      vertexDescriptions.length === 2 &&
      edgeDescriptions.length === 1
    ) {
      // Extracting vertex metadata
      const vertexIds = vertexDescriptions.map((e) => e.replace(/[()]/g, ""));
      const [sourceId, targetId] = vertexIds;
      const sourceIndex = +sourceId;
      const targetIndex = +targetId;
      let source = this.getRulePart(sourceIndex, targetIndex);
      let target = this.getRulePart(targetIndex, sourceIndex);

      // Extracting edge metadata
      const edgeTypes = edgeDescriptions?.map((e) =>
        e.replace(/[<\[\]>]/g, "")
      );

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
}
