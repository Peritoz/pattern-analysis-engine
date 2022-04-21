import fs from "fs";
import path from "path";
import ohm from "ohm-js";
import {QueryDescriptor} from "@libs/model/query_descriptor/query_descriptor.class";

const grammarSpecification = fs.readFileSync(path.resolve(__dirname, "./grammar/amal.ohm"), "utf8");
const amalGrammar = ohm.grammar(grammarSpecification);
const amalSemantics = require("./amal_semantics");

export function processQueryText(query: string) {
    const semantics = amalGrammar.createSemantics().addOperation(
        "eval",
        amalSemantics.createAmalSemanticObject(query)
    );

    let match = amalGrammar.match(query);

    if (match.succeeded()) {
        let queryObject = semantics(match).eval();  // Evaluates the query

        // Injecting original query in QueryObject
        queryObject.query = query;

        return queryObject;
    } else {
        throw new Error("Invalid query");
    }
}
