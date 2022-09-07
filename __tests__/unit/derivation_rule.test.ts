import { DerivationEngine, DerivationRule } from "../../src/libs";
import { initBasicGraph } from "./utils/graphs/initBasicGraph";
import { initComplexGraph } from "./utils/graphs/initComplexGraph";
import { QueryEngine } from "../../src/libs/engine/query_engine";
import { OhmInterpreter } from "../../src/libs/engine/query_interpreter";
import {
  EdgeDirection,
  RulePart,
} from "../../src/libs/engine/derivation_engine/derivation_rule.class";

describe("Derivation Rule", () => {
  describe("Conditional", () => {
    it("()[et1]>()[et2]>()", async () => {
      const result = new DerivationRule("()[et1]>()[et2]>()", "(1)[et2](3)");

      expect(result).toBeDefined();
      expect(result._conditional.firstPart.elementTypes).toEqual([]);
      expect(result._conditional.firstPart.edgeTypes).toEqual(["et1"]);
      expect(result._conditional.firstPart.direction).toBe(
        EdgeDirection.OUTBOUND
      );
      expect(result._conditional.middleElementTypes).toEqual([]);
      expect(result._conditional.secondPart.elementTypes).toEqual([]);
      expect(result._conditional.secondPart.edgeTypes).toEqual(["et2"]);
      expect(result._conditional.secondPart.direction).toBe(
        EdgeDirection.OUTBOUND
      );
    });

    it("()[et1,et3]>()[et2,et4]>()", async () => {
      const result = new DerivationRule(
        "()[et1,et3]>()[et2,et4]>()",
        "(1)[et2](3)"
      );

      expect(result).toBeDefined();
      expect(result._conditional.firstPart.elementTypes).toEqual([]);
      expect(result._conditional.firstPart.edgeTypes).toEqual(["et1", "et3"]);
      expect(result._conditional.firstPart.direction).toBe(
        EdgeDirection.OUTBOUND
      );
      expect(result._conditional.middleElementTypes).toEqual([]);
      expect(result._conditional.secondPart.elementTypes).toEqual([]);
      expect(result._conditional.secondPart.edgeTypes).toEqual(["et2", "et4"]);
      expect(result._conditional.secondPart.direction).toBe(
        EdgeDirection.OUTBOUND
      );
    });

    it("(t1)[et1,et3]>(t2)[et2,et4]>(t3)", async () => {
      const result = new DerivationRule(
        "(t1)[et1,et3]>(t2)[et2,et4]>(t3)",
        "(1)[et2](3)"
      );

      expect(result).toBeDefined();
      expect(result._conditional.firstPart.elementTypes).toEqual(["t1"]);
      expect(result._conditional.firstPart.edgeTypes).toEqual(["et1", "et3"]);
      expect(result._conditional.firstPart.direction).toBe(
        EdgeDirection.OUTBOUND
      );
      expect(result._conditional.middleElementTypes).toEqual(["t2"]);
      expect(result._conditional.secondPart.elementTypes).toEqual(["t3"]);
      expect(result._conditional.secondPart.edgeTypes).toEqual(["et2", "et4"]);
      expect(result._conditional.secondPart.direction).toBe(
        EdgeDirection.OUTBOUND
      );
    });

    it("(t1,t5)[et1,et3]>(t2)[et2,et4]>(t3,t6)", async () => {
      const result = new DerivationRule(
        "(t1,t5)[et1,et3]>(t2)[et2,et4]>(t3,t6)",
        "(1)[et2](3)"
      );

      expect(result).toBeDefined();
      expect(result._conditional.firstPart.elementTypes).toEqual(["t1", "t5"]);
      expect(result._conditional.firstPart.edgeTypes).toEqual(["et1", "et3"]);
      expect(result._conditional.firstPart.direction).toBe(
        EdgeDirection.OUTBOUND
      );
      expect(result._conditional.middleElementTypes).toEqual(["t2"]);
      expect(result._conditional.secondPart.elementTypes).toEqual(["t3", "t6"]);
      expect(result._conditional.secondPart.edgeTypes).toEqual(["et2", "et4"]);
      expect(result._conditional.secondPart.direction).toBe(
        EdgeDirection.OUTBOUND
      );
    });

    it("()[et1]>()<[et2]()", async () => {
      const result = new DerivationRule("()[et1]>()<[et2]()", "(1)[et2](3)");

      expect(result).toBeDefined();
      expect(result._conditional.firstPart.elementTypes).toEqual([]);
      expect(result._conditional.firstPart.edgeTypes).toEqual(["et1"]);
      expect(result._conditional.firstPart.direction).toBe(
        EdgeDirection.OUTBOUND
      );
      expect(result._conditional.middleElementTypes).toEqual([]);
      expect(result._conditional.secondPart.elementTypes).toEqual([]);
      expect(result._conditional.secondPart.edgeTypes).toEqual(["et2"]);
      expect(result._conditional.secondPart.direction).toBe(
        EdgeDirection.INBOUND
      );
    });

    it("()<[et1]()[et2]>()", async () => {
      const result = new DerivationRule("()<[et1]()[et2]>()", "(1)[et2](3)");

      expect(result).toBeDefined();
      expect(result._conditional.firstPart.elementTypes).toEqual([]);
      expect(result._conditional.firstPart.edgeTypes).toEqual(["et1"]);
      expect(result._conditional.firstPart.direction).toBe(
        EdgeDirection.INBOUND
      );
      expect(result._conditional.middleElementTypes).toEqual([]);
      expect(result._conditional.secondPart.elementTypes).toEqual([]);
      expect(result._conditional.secondPart.edgeTypes).toEqual(["et2"]);
      expect(result._conditional.secondPart.direction).toBe(
        EdgeDirection.OUTBOUND
      );
    });

    it("()<[et1]()<[et2]()", async () => {
      const result = new DerivationRule("()<[et1]()<[et2]()", "(1)[et2](3)");

      expect(result).toBeDefined();
      expect(result._conditional.firstPart.elementTypes).toEqual([]);
      expect(result._conditional.firstPart.edgeTypes).toEqual(["et1"]);
      expect(result._conditional.firstPart.direction).toBe(
        EdgeDirection.INBOUND
      );
      expect(result._conditional.middleElementTypes).toEqual([]);
      expect(result._conditional.secondPart.elementTypes).toEqual([]);
      expect(result._conditional.secondPart.edgeTypes).toEqual(["et2"]);
      expect(result._conditional.secondPart.direction).toBe(
        EdgeDirection.INBOUND
      );
    });
  });

  describe("Effect", () => {
    it("(1)[et2](3)", async () => {
      const result = new DerivationRule("()[et1]>()[et2]>()", "(1)[et2](3)");

      expect(result._effect.types).toEqual(["et2"]);
      expect(result._effect.source).toBe(RulePart.FIRST_PART_ELEMENT);
      expect(result._effect.target).toBe(RulePart.SECOND_PART_ELEMENT);
    });

    it("(1)[et1,et2](3)", async () => {
      const result = new DerivationRule(
        "()[et1]>()[et2]>()",
        "(1)[et1,et2](3)"
      );

      expect(result._effect.types).toEqual(["et1", "et2"]);
      expect(result._effect.source).toBe(RulePart.FIRST_PART_ELEMENT);
      expect(result._effect.target).toBe(RulePart.SECOND_PART_ELEMENT);
    });

    it("(3)[et2](1)", async () => {
      const result = new DerivationRule("()[et1]>()[et2]>()", "(3)[et2](1)");

      expect(result._effect.types).toEqual(["et2"]);
      expect(result._effect.source).toBe(RulePart.SECOND_PART_ELEMENT);
      expect(result._effect.target).toBe(RulePart.FIRST_PART_ELEMENT);
    });

    it("(3)[et2](2)", async () => {
      const result = new DerivationRule("()[et1]>()[et2]>()", "(3)[et2](2)");

      expect(result._effect.types).toEqual(["et2"]);
      expect(result._effect.source).toBe(RulePart.SECOND_PART_ELEMENT);
      expect(result._effect.target).toBe(RulePart.MIDDLE_ELEMENT);
    });
  });

  describe("Error cases", () => {
    describe("Conditional", () => {
      it("More than three nodes case", async () => {
        expect(() => {
          new DerivationRule("()[et1]>()[et2]>()[et3]>()", "(1)[et2](3)");
        }).toThrowError("Invalid rule conditional");
      });

      it("Two nodes case", async () => {
        expect(() => {
          new DerivationRule("()[et1]>()", "(1)[et2](3)");
        }).toThrowError("Invalid rule conditional");
      });

      it("One node case", async () => {
        expect(() => {
          new DerivationRule("()", "(1)[et2](3)");
        }).toThrowError("Invalid rule conditional");
      });

      it("Random string", async () => {
        expect(() => {
          new DerivationRule("(*7dh$)-[<]>()&", "(1)[et2](3)");
        }).toThrowError("Invalid rule conditional");
      });

      it("Bidirectional conditional", async () => {
        expect(() => {
          new DerivationRule("()<[et1]>()<[et2]()", "(1)[et2](3)");
        }).toThrowError("Invalid rule conditional");
      });

      it("Edge without direction", async () => {
        expect(() => {
          new DerivationRule("()[et1]()<[et2]()", "(1)[et2](3)");
        }).toThrowError("Invalid rule conditional");
      });

      it("Space between types", async () => {
        expect(() => {
          new DerivationRule("()[et1, et3]()<[et2]()", "(1)[et2](3)");
        }).toThrowError("Invalid rule conditional");
      });
    });

    describe("Effect", () => {
      it("More than two nodes case", async () => {
        expect(() => {
          new DerivationRule("()[et1]>()[et2]>()", "(1)[et2](3)[et3](4)");
        }).toThrowError(
          "Invalid rule effect: should be in the form (#)[edgeType1,edgeType2](#)"
        );
      });

      it("One node case", async () => {
        expect(() => {
          new DerivationRule("()[et1]>()[et2]>()", "(1)");
        }).toThrowError(
          "Invalid rule effect: should be in the form (#)[edgeType1,edgeType2](#)"
        );
      });

      it("Random string", async () => {
        expect(() => {
          new DerivationRule("()[et1]>()[et2]>()", "(*7dh$)-[<]>()&");
        }).toThrowError(
          "Invalid rule effect: should be in the form (#)[edgeType1,edgeType2](#)"
        );
      });

      it("Reflexive effect", async () => {
        expect(() => {
          new DerivationRule("()[et1]>()[et2]>()", "(1)[et2](1)");
        }).toThrowError(
          "Invalid rule effect: source and target referencing the same element"
        );
      });

      it("Edge with direction", async () => {
        expect(() => {
          new DerivationRule("()[et1]>()[et2]>()", "(1)<[et2](3)");
        }).toThrowError(
          "Invalid rule effect: should be in the form (#)[edgeType1,edgeType2](#)"
        );
      });

      it("Space between types", async () => {
        expect(() => {
          new DerivationRule("()[et1]>()[et2]>()", "(1)[et2, et3](3)");
        }).toThrowError(
          "Invalid rule effect: should be in the form (#)[edgeType1,edgeType2](#)"
        );
      });
    });
  });
});
