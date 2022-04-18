import {QueryObject} from "@libs/model/amalManager/genericTranslator/query_object.interface";

const utils = require("./queryObjectUtils");

module.exports = (queryObject: QueryObject) => {
    for (let tripleIndex = 1; tripleIndex < queryObject.naiveChain.length - 1; tripleIndex += 2) {
        let relationship = queryObject.naiveChain[tripleIndex];

        // Optimization Pattern: =()=[type] >> =()-[type]
        if (relationship.discriminator === "TYPED_RELATIONSHIP") {
            let prior = utils.lookPrior(queryObject.naiveChain, tripleIndex);

            if (prior !== null) {
                if (prior.elementB.discriminator === "NON_DESCRIBED_NODE") {
                    relationship.source = "BONDED_BASE";
                }
            }
        }
    }
};