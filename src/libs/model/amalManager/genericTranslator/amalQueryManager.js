const fs = require("fs");
const path = require("path");
const ohm = require("ohm-js");

const grammarSpecification = fs.readFileSync(path.resolve(__dirname, "./grammar/amal.ohm"), "utf8");
const amalGrammar = ohm.grammar(grammarSpecification);
const amalSemantics = require("./amalSemantics.js");
const semantics = amalGrammar.createSemantics().addOperation("eval", amalSemantics.createAmalSemanticObject());

module.exports = {

    processQueryText(query) {
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

};
