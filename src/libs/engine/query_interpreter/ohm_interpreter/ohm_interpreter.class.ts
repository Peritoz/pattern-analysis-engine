import ohm, { ActionDict } from "ohm-js";
import { InputDescriptor } from "@libs/model/input_descriptor/input_descriptor.class";
import generateAmaqlSemantics from "./semantics/semantics";
import {getGrammar} from "@libs/engine/query_interpreter/ohm_interpreter/grammar/getGrammar";

const amaqlGrammar = ohm.grammar(getGrammar());

export class OhmInterpreter {
  static mountInputDescriptor(query: string): InputDescriptor {
    const semantics = amaqlGrammar
      .createSemantics()
      .addOperation("eval", generateAmaqlSemantics(query) as ActionDict<any>);

    let match = amaqlGrammar.match(query);

    if (match.succeeded()) {
      // Evaluates the query
      return semantics(match).eval();
    } else {
      throw new Error("Invalid query");
    }
  }
}
