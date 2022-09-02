import fs from "fs";
import path from "path";
import ohm from "ohm-js";
import { InputDescriptor } from "@libs/model/input_descriptor/input_descriptor.class";

const grammarSpecification = fs.readFileSync(
  path.resolve(__dirname, "./grammar/amaql.ohm"),
  "utf8"
);
const amaqlGrammar = ohm.grammar(grammarSpecification);
const amaqlSemantics = require("./semantics");

export class OhmInterpreter {
  static mountInputDescriptor(query: string): InputDescriptor {
    const semantics = amaqlGrammar
      .createSemantics()
      .addOperation("eval", amaqlSemantics.createAmalSemanticObject(query));

    let match = amaqlGrammar.match(query);

    if (match.succeeded()) {
      // Evaluates the query
      return semantics(match).eval();
    } else {
      throw new Error("Invalid query");
    }
  }
}
