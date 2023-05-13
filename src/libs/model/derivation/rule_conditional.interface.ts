import { RuleEdgeDescription } from '@libs/model/derivation/rule_edge_description.interface';

export interface RuleConditional {
  firstPart: RuleEdgeDescription;
  middleElementTypes: Array<string>;
  secondPart: RuleEdgeDescription;
}
