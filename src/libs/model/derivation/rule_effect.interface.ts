import { RulePart } from '@libs/model/derivation/enums/rule_part.enum';

export interface RuleEffect {
  source: RulePart; // Origin of the source element of the derived edge
  target: RulePart; // Origin of the target element of the derived edge
  types: Array<string>; // Types to be assigned to the derived edge
}
