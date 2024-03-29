import { DerivationRule, Direction } from '../../../src';
import { RulePart } from '../../../src/libs/model/derivation/enums/rule_part.enum';

describe('Derivation Rule', () => {
  describe('Conditional', () => {
    it('()[et1]>()[et2]>()', () => {
      const result = new DerivationRule('()[et1]>()[et2]>()', '(1)[et2](3)');

      expect(result).toBeDefined();
      expect(result._conditional.firstPart.elementTypes).toEqual([]);
      expect(result._conditional.firstPart.edgeTypes).toEqual(['et1']);
      expect(result._conditional.firstPart.direction).toBe(Direction.OUTBOUND);
      expect(result._conditional.middleElementTypes).toEqual([]);
      expect(result._conditional.secondPart.elementTypes).toEqual([]);
      expect(result._conditional.secondPart.edgeTypes).toEqual(['et2']);
      expect(result._conditional.secondPart.direction).toBe(Direction.OUTBOUND);
    });

    it('()[et1,et3]>()[et2,et4]>()', () => {
      const result = new DerivationRule('()[et1,et3]>()[et2,et4]>()', '(1)[et2](3)');

      expect(result).toBeDefined();
      expect(result._conditional.firstPart.elementTypes).toEqual([]);
      expect(result._conditional.firstPart.edgeTypes).toEqual(['et1', 'et3']);
      expect(result._conditional.firstPart.direction).toBe(Direction.OUTBOUND);
      expect(result._conditional.middleElementTypes).toEqual([]);
      expect(result._conditional.secondPart.elementTypes).toEqual([]);
      expect(result._conditional.secondPart.edgeTypes).toEqual(['et2', 'et4']);
      expect(result._conditional.secondPart.direction).toBe(Direction.OUTBOUND);
    });

    it('(t1)[et1,et3]>(t2)[et2,et4]>(t3)', () => {
      const result = new DerivationRule('(t1)[et1,et3]>(t2)[et2,et4]>(t3)', '(1)[et2](3)');

      expect(result).toBeDefined();
      expect(result._conditional.firstPart.elementTypes).toEqual(['t1']);
      expect(result._conditional.firstPart.edgeTypes).toEqual(['et1', 'et3']);
      expect(result._conditional.firstPart.direction).toBe(Direction.OUTBOUND);
      expect(result._conditional.middleElementTypes).toEqual(['t2']);
      expect(result._conditional.secondPart.elementTypes).toEqual(['t3']);
      expect(result._conditional.secondPart.edgeTypes).toEqual(['et2', 'et4']);
      expect(result._conditional.secondPart.direction).toBe(Direction.OUTBOUND);
    });

    it('(t1,t5)[et1,et3]>(t2)[et2,et4]>(t3,t6)', () => {
      const result = new DerivationRule('(t1,t5)[et1,et3]>(t2)[et2,et4]>(t3,t6)', '(1)[et2](3)');

      expect(result).toBeDefined();
      expect(result._conditional.firstPart.elementTypes).toEqual(['t1', 't5']);
      expect(result._conditional.firstPart.edgeTypes).toEqual(['et1', 'et3']);
      expect(result._conditional.firstPart.direction).toBe(Direction.OUTBOUND);
      expect(result._conditional.middleElementTypes).toEqual(['t2']);
      expect(result._conditional.secondPart.elementTypes).toEqual(['t3', 't6']);
      expect(result._conditional.secondPart.edgeTypes).toEqual(['et2', 'et4']);
      expect(result._conditional.secondPart.direction).toBe(Direction.OUTBOUND);
    });

    it('()[et1]>()<[et2]()', () => {
      const result = new DerivationRule('()[et1]>()<[et2]()', '(1)[et2](3)');

      expect(result).toBeDefined();
      expect(result._conditional.firstPart.elementTypes).toEqual([]);
      expect(result._conditional.firstPart.edgeTypes).toEqual(['et1']);
      expect(result._conditional.firstPart.direction).toBe(Direction.OUTBOUND);
      expect(result._conditional.middleElementTypes).toEqual([]);
      expect(result._conditional.secondPart.elementTypes).toEqual([]);
      expect(result._conditional.secondPart.edgeTypes).toEqual(['et2']);
      expect(result._conditional.secondPart.direction).toBe(Direction.INBOUND);
    });

    it('()<[et1]()[et2]>()', () => {
      const result = new DerivationRule('()<[et1]()[et2]>()', '(1)[et2](3)');

      expect(result).toBeDefined();
      expect(result._conditional.firstPart.elementTypes).toEqual([]);
      expect(result._conditional.firstPart.edgeTypes).toEqual(['et1']);
      expect(result._conditional.firstPart.direction).toBe(Direction.INBOUND);
      expect(result._conditional.middleElementTypes).toEqual([]);
      expect(result._conditional.secondPart.elementTypes).toEqual([]);
      expect(result._conditional.secondPart.edgeTypes).toEqual(['et2']);
      expect(result._conditional.secondPart.direction).toBe(Direction.OUTBOUND);
    });

    it('()<[et1]()<[et2]()', () => {
      const result = new DerivationRule('()<[et1]()<[et2]()', '(1)[et2](3)');

      expect(result).toBeDefined();
      expect(result._conditional.firstPart.elementTypes).toEqual([]);
      expect(result._conditional.firstPart.edgeTypes).toEqual(['et1']);
      expect(result._conditional.firstPart.direction).toBe(Direction.INBOUND);
      expect(result._conditional.middleElementTypes).toEqual([]);
      expect(result._conditional.secondPart.elementTypes).toEqual([]);
      expect(result._conditional.secondPart.edgeTypes).toEqual(['et2']);
      expect(result._conditional.secondPart.direction).toBe(Direction.INBOUND);
    });
  });

  describe('Effect', () => {
    it('(1)[et2](3)', () => {
      const result = new DerivationRule('()[et1]>()[et2]>()', '(1)[et2](3)');

      expect(result._effect.types).toEqual(['et2']);
      expect(result._effect.source).toBe(RulePart.FIRST_PART_ELEMENT);
      expect(result._effect.target).toBe(RulePart.SECOND_PART_ELEMENT);
    });

    it('(1)[et1,et2](3)', () => {
      const result = new DerivationRule('()[et1]>()[et2]>()', '(1)[et1,et2](3)');

      expect(result._effect.types).toEqual(['et1', 'et2']);
      expect(result._effect.source).toBe(RulePart.FIRST_PART_ELEMENT);
      expect(result._effect.target).toBe(RulePart.SECOND_PART_ELEMENT);
    });

    it('(3)[et2](1)', () => {
      const result = new DerivationRule('()[et1]>()[et2]>()', '(3)[et2](1)');

      expect(result._effect.types).toEqual(['et2']);
      expect(result._effect.source).toBe(RulePart.SECOND_PART_ELEMENT);
      expect(result._effect.target).toBe(RulePart.FIRST_PART_ELEMENT);
    });

    it('(3)[et2](2)', () => {
      const result = new DerivationRule('()[et1]>()[et2]>()', '(3)[et2](2)');

      expect(result._effect.types).toEqual(['et2']);
      expect(result._effect.source).toBe(RulePart.SECOND_PART_ELEMENT);
      expect(result._effect.target).toBe(RulePart.MIDDLE_ELEMENT);
    });

    it('(3)<[et2](2) - Direction should be ignored', () => {
      const result = new DerivationRule('()[et1]>()[et2]>()', '(3)[et2](2)');

      expect(result._effect.types).toEqual(['et2']);
      expect(result._effect.source).toBe(RulePart.SECOND_PART_ELEMENT);
      expect(result._effect.target).toBe(RulePart.MIDDLE_ELEMENT);
    });
  });

  describe('Error cases', () => {
    describe('Conditional', () => {
      it('More than three nodes case', () => {
        expect(() => {
          new DerivationRule('()[et1]>()[et2]>()[et3]>()', '(1)[et2](3)');
        }).toThrowError('Invalid rule conditional');
      });

      it('Two nodes case', () => {
        expect(() => {
          new DerivationRule('()[et1]>()', '(1)[et2](3)');
        }).toThrowError('Invalid rule conditional');
      });

      it('One node case', () => {
        expect(() => {
          new DerivationRule('()', '(1)[et2](3)');
        }).toThrowError('Invalid rule conditional');
      });

      it('Random string', () => {
        expect(() => {
          new DerivationRule('(*7dh$)-[<]>()&', '(1)[et2](3)');
        }).toThrowError('Invalid rule conditional');
      });

      it('Bidirectional conditional', () => {
        expect(() => {
          new DerivationRule('()<[et1]>()<[et2]()', '(1)[et2](3)');
        }).toThrowError('Invalid rule conditional');
      });

      it('Edge without direction', () => {
        expect(() => {
          new DerivationRule('()[et1]()<[et2]()', '(1)[et2](3)');
        }).toThrowError('Invalid rule conditional');
      });

      it('Space between types', () => {
        expect(() => {
          new DerivationRule('()[et1, et3]()<[et2]()', '(1)[et2](3)');
        }).toThrowError('Invalid rule conditional');
      });
    });

    describe('Effect', () => {
      it('More than two nodes case', () => {
        expect(() => {
          new DerivationRule('()[et1]>()[et2]>()', '(1)[et2](3)[et3](4)');
        }).toThrowError('Invalid rule effect: should be in the form (#)[edgeType1,edgeType2](#)');
      });

      it('One node case', () => {
        expect(() => {
          new DerivationRule('()[et1]>()[et2]>()', '(1)');
        }).toThrowError('Invalid rule effect: should be in the form (#)[edgeType1,edgeType2](#)');
      });

      it('Random string', () => {
        expect(() => {
          new DerivationRule('()[et1]>()[et2]>()', '(*7dh$)-[<]>()&');
        }).toThrowError('Invalid rule effect: should be in the form (#)[edgeType1,edgeType2](#)');
      });

      it('Reflexive effect', () => {
        expect(() => {
          new DerivationRule('()[et1]>()[et2]>()', '(1)[et2](1)');
        }).toThrowError('Invalid rule effect: source and target referencing the same element');
      });

      it('Space between types', () => {
        expect(() => {
          new DerivationRule('()[et1]>()[et2]>()', '(1)[et2, et3](3)');
        }).toThrowError('Invalid rule effect: should be in the form (#)[edgeType1,edgeType2](#)');
      });
    });
  });
});
