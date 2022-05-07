import {validateQueryChain} from "./utils/validateQueryChain";
import {InputNode} from "../../src/libs/model/input_descriptor/input_node.class";
import {InputRelationship} from "../../src/libs/model/input_descriptor/input_relationship.class";
import {QueryDescriptor} from "../../src/libs/model/query_descriptor/query_descriptor.class";
import {validateQueryDescriptor} from "./utils/validateQueryDescriptor";
import {OhmInterpreter} from "../../src/libs/engine/query_interpreter";

describe('Complex Pattern Translation', () => {
    let interpreter;

    beforeAll(() => {
        interpreter = new OhmInterpreter();
    });

    it('Simple Chain - Variant 1', done => {
        const inputDescriptor = interpreter.mountInputDescriptor("?(node)-[realization]->(applicationcomponent)=[serving]=>(businessprocess)");

        expect(validateQueryChain(inputDescriptor, [
            new InputNode("TYPED_NODE", "", ["node"], ""),
            new InputRelationship(
                "TYPED_RELATIONSHIP",
                "BONDED_BASE",
                "BONDED_RIGHT",
                "",
                ["realization"],
                false
            ),
            new InputNode("TYPED_NODE", "", ["applicationcomponent"], ""),
            new InputRelationship(
                "TYPED_RELATIONSHIP",
                "PATH_BASE",
                "PATH_RIGHT",
                "",
                ["serving"],
                false
            ),
            new InputNode("TYPED_NODE", "", ["businessprocess"], "")
        ])).toBeTruthy();

        const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

        expect(validateQueryDescriptor(inputDescriptor, queryDescriptor)).toBeTruthy();

        done();
    });

    it('Simple Chain - Variant 2', done => {
        const inputDescriptor = interpreter.mountInputDescriptor("?(artifact)<-[assignment]-(node)=[serving]=>(businessprocess)");

        expect(validateQueryChain(inputDescriptor, [
            new InputNode("TYPED_NODE", "", ["artifact"], ""),
            new InputRelationship(
                "TYPED_RELATIONSHIP",
                "BONDED_LEFT",
                "BONDED_BASE",
                "",
                ["assignment"],
                false
            ),
            new InputNode("TYPED_NODE", "", ["node"], ""),
            new InputRelationship(
                "TYPED_RELATIONSHIP",
                "PATH_BASE",
                "PATH_RIGHT",
                "",
                ["serving"],
                false
            ),
            new InputNode("TYPED_NODE", "", ["businessprocess"], "")
        ])).toBeTruthy();

        const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

        expect(validateQueryDescriptor(inputDescriptor, queryDescriptor)).toBeTruthy();

        done();
    });

    it('Simple Chain - Variant 3', done => {
        const inputDescriptor = interpreter.mountInputDescriptor("?(artifact)<-[assignment]-('atlas':node)=[serving]=>(businessprocess)");

        expect(validateQueryChain(inputDescriptor, [
            new InputNode("TYPED_NODE", "", ["artifact"], ""),
            new InputRelationship(
                "TYPED_RELATIONSHIP",
                "BONDED_LEFT",
                "BONDED_BASE",
                "",
                ["assignment"],
                false
            ),
            new InputNode("DESCRIBED_NODE", "", ["node"], "atlas"),
            new InputRelationship(
                "TYPED_RELATIONSHIP",
                "PATH_BASE",
                "PATH_RIGHT",
                "",
                ["serving"],
                false
            ),
            new InputNode("TYPED_NODE", "", ["businessprocess"], "")
        ])).toBeTruthy();

        const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

        expect(validateQueryDescriptor(inputDescriptor, queryDescriptor)).toBeTruthy();

        done();
    });

    it('Complex Chain - Variant 1', done => {
        const inputDescriptor = interpreter.mountInputDescriptor("?(artifact)<-[assignment]-(node)-[realization]->(applicationcomponent)=[serving]=>(businessprocess)<-[composition]-(businessprocess)");

        expect(validateQueryChain(inputDescriptor, [
            new InputNode("TYPED_NODE", "", ["artifact"], ""),
            new InputRelationship(
                "TYPED_RELATIONSHIP",
                "BONDED_LEFT",
                "BONDED_BASE",
                "",
                ["assignment"],
                false
            ),
            new InputNode("TYPED_NODE", "", ["node"], ""),
            new InputRelationship(
                "TYPED_RELATIONSHIP",
                "BONDED_BASE",
                "BONDED_RIGHT",
                "",
                ["realization"],
                false
            ),
            new InputNode("TYPED_NODE", "", ["applicationcomponent"], ""),
            new InputRelationship(
                "TYPED_RELATIONSHIP",
                "PATH_BASE",
                "PATH_RIGHT",
                "",
                ["serving"],
                false
            ),
            new InputNode("TYPED_NODE", "", ["businessprocess"], ""),
            new InputRelationship(
                "TYPED_RELATIONSHIP",
                "BONDED_LEFT",
                "BONDED_BASE",
                "",
                ["composition"],
                false
            ),
            new InputNode("TYPED_NODE", "", ["businessprocess"], ""),
        ])).toBeTruthy();

        const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

        expect(validateQueryDescriptor(inputDescriptor, queryDescriptor)).toBeTruthy();

        done();
    });
});