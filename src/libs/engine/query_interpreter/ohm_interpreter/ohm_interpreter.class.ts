import fs from "fs";
import path from "path";
import ohm, { ActionDict } from "ohm-js";
import { InputDescriptor } from "@libs/model/input_descriptor/input_descriptor.class";

const grammarSpecification = fs.readFileSync(
  path.resolve(__dirname, "./grammar/amaql.ohm"),
  "utf8"
);
const amaqlGrammar = ohm.grammar(grammarSpecification);
import generateAmaqlSemantics from "./semantics/semantics";

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
