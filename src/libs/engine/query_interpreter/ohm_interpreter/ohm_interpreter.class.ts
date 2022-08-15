import fs from "fs";
import path from "path";
import ohm from "ohm-js";
import { InputDescriptor } from "@libs/model/input_descriptor/input_descriptor.class";

const grammarSpecification = fs.readFileSync(
  path.resolve(__dirname, "./grammar/amaql.ohm"),
  "utf8"
);
const amalGrammar = ohm.grammar(grammarSpecification);
const amalSemantics = require("./semantics");

export class OhmInterpreter {
  static mountInputDescriptor(query: string): InputDescriptor {
    const semantics = amalGrammar
      .createSemantics()
      .addOperation("eval", amalSemantics.createAmalSemanticObject(query));

    let match = amalGrammar.match(query);

    if (match.succeeded()) {
      // Evaluates the query
      return semantics(match).eval();
    } else {
      throw new Error("Invalid query");
    }
  }
}
