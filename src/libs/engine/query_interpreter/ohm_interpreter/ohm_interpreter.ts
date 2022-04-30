import fs from "fs";
import path from "path";
import ohm from "ohm-js";
import {QueryDescriptor} from "@libs/model/query_descriptor/query_descriptor.class";

const grammarSpecification = fs.readFileSync(path.resolve(__dirname, "./grammar/amaql.ohm"), "utf8");
const amalGrammar = ohm.grammar(grammarSpecification);
const amalSemantics = require("./semantics");

export class OhmInterpreter{
    mountQueryDescriptor(query: string): QueryDescriptor {
        const semantics = amalGrammar.createSemantics().addOperation(
            "eval",
            amalSemantics.createAmalSemanticObject(query)
        );

        let match = amalGrammar.match(query);

        if (match.succeeded()) {
            let queryDescriptor = semantics(match).eval();  // Evaluates the query

            // Injecting original query in QueryObject
            queryDescriptor.query = query;

            return queryDescriptor;
        } else {
            throw new Error("Invalid query");
        }
    }
}
