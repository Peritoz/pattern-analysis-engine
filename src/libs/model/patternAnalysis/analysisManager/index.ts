const {processQueryText} = require("../../amalManager/index");
import {GraphController} from "../../amalManager/graph_controller/graph_controller.interface";

module.exports = {
    async run(graphController: GraphController, query: string, initialElementIds: Array<string>): Promise<object[]> {
        if (query !== null) {
            let queryObject = processQueryText(query);

            return graphController.run(queryObject, initialElementIds);
        } else {
            throw new Error("Unable to process the query parameter");
        }
    },
};
