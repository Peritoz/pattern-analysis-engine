import {OhmInterpreter} from "../../src/libs/engine/query_interpreter";
import {InputNode} from "../../src/libs/model/input_descriptor/input_node.class";
import {InputRelationship} from "../../src/libs/model/input_descriptor/input_relationship.class";
import {validateQueryChain} from "./utils/validateQueryChain";
import {QueryDescriptor} from "../../src/libs/model/query_descriptor/query_descriptor.class";
import {validateQueryDescriptor} from "./utils/validateQueryDescriptor";
import {QueryTriple} from "../../src/libs/model/query_descriptor/query_triple";
import {QueryNode} from "../../src/libs/model/query_descriptor/query_node.class";
import {QueryRelationship} from "../../src/libs/model/query_descriptor/query_relationship.class";

describe('Simple Query Translation', () => {
    let interpreter;

    beforeAll(() => {
        interpreter = new OhmInterpreter();
    });

    describe('Basic Query Construction', () => {
        it('Described Node', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?('name')");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("IDENTIFIED_NODE", "", [], "name")
            ])).toBeTruthy();

            const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

            expect(queryDescriptor.isComplexQuery()).toBeFalsy();
            expect(queryDescriptor.queryFilter.types.length).toBe(0);
            expect(queryDescriptor.queryFilter.searchTerm).toBe("name");

            done();
        });

        it('Described Node / Typed Node', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?('mongod':systemsoftware)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("DESCRIBED_NODE", "", ["systemsoftware"], "mongod")
            ])).toBeTruthy();

            const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

            expect(queryDescriptor.isComplexQuery()).toBeFalsy();
            expect(queryDescriptor.queryFilter.types).toContain("systemsoftware");
            expect(queryDescriptor.queryFilter.searchTerm).toBe("mongod");

            done();
        });

        it('Described Node / Typed Node with Multiple Types', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?('mongod':systemsoftware or node or artifact)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("DESCRIBED_NODE", "", [
                    "systemsoftware",
                    "node",
                    "artifact"
                ], "mongod")
            ])).toBeTruthy();

            const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

            expect(queryDescriptor.isComplexQuery()).toBeFalsy();
            expect(queryDescriptor.queryFilter.types).toContain("systemsoftware");
            expect(queryDescriptor.queryFilter.types).toContain("node");
            expect(queryDescriptor.queryFilter.types).toContain("artifact");
            expect(queryDescriptor.queryFilter.searchTerm).toBe("mongod");

            done();
        });

        it('Typed Node', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?(systemsoftware)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["systemsoftware"], "")
            ])).toBeTruthy();

            const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

            expect(queryDescriptor.isComplexQuery()).toBeFalsy();
            expect(queryDescriptor.queryFilter.types).toContain("systemsoftware");
            expect(queryDescriptor.queryFilter.searchTerm).toBe("");

            done();
        });

        it('Typed Node with Multiple Types', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?(systemsoftware or node)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["systemsoftware", "node"], "")
            ])).toBeTruthy();

            const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

            expect(queryDescriptor.isComplexQuery()).toBeFalsy();
            expect(queryDescriptor.queryFilter.types).toContain("systemsoftware");
            expect(queryDescriptor.queryFilter.types).toContain("node");
            expect(queryDescriptor.queryFilter.searchTerm).toBe("");

            done();
        });

        it('Typed Node - With Space Before and After', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("    ?(artifact)  ");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["artifact"], "")
            ])).toBeTruthy();

            const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

            expect(queryDescriptor.isComplexQuery()).toBeFalsy();
            expect(queryDescriptor.queryFilter.types).toContain("artifact");
            expect(queryDescriptor.queryFilter.searchTerm).toBe("");

            done();
        });
    });

    describe('Bad Query Construction', () => {
        it('Should Return Error - Empty Query', done => {
            expect(function () {
                interpreter.mountInputDescriptor("?");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Nested Node', done => {
            expect(function () {
                interpreter.mountInputDescriptor("?((artifact)))");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Invalid Nodes Positioning', done => {
            expect(function () {
                interpreter.mountInputDescriptor("?(artifact)(node)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Invalid Relationship', done => {
            expect(function () {
                interpreter.mountInputDescriptor("?(artifact)(node)->");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Group Node Alone', done => {
            expect(function () {
                interpreter.mountInputDescriptor("?(*)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Not Described Node Alone', done => {
            expect(function () {
                interpreter.mountInputDescriptor("?()");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Not starting with Not Described Node', done => {
            expect(function () {
                interpreter.mountInputDescriptor("?()<=[serving]=(component)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Not starting with Inclusive Node', done => {
            expect(function () {
                interpreter.mountInputDescriptor("?(*)<=[serving]=(component)");
            }).toThrow("Invalid query");

            done();
        });
    });

    describe('Relationship Construction', () => {
        it('Short Relationship ->', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?(node)->(artifact)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["node"], ""),
                new InputRelationship(
                    "SHORT_RELATIONSHIP",
                    "BONDED_BASE",
                    "BONDED_RIGHT",
                    "",
                    [],
                    false
                ),
                new InputNode("TYPED_NODE", "", ["artifact"], "")
            ])).toBeTruthy();

            done();
        });

        it('Short Relationship <-', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?(node)<-(artifact)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["node"], ""),
                new InputRelationship(
                    "SHORT_RELATIONSHIP",
                    "BONDED_LEFT",
                    "BONDED_BASE",
                    "",
                    [],
                    false
                ),
                new InputNode("TYPED_NODE", "", ["artifact"], "")
            ])).toBeTruthy();

            done();
        });

        it('Bonded Relationship ->', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?(node)-[assignment]->(artifact)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["node"], ""),
                new InputRelationship(
                    "TYPED_RELATIONSHIP",
                    "BONDED_BASE",
                    "BONDED_RIGHT",
                    "",
                    ["assignment"],
                    false
                ),
                new InputNode("TYPED_NODE", "", ["artifact"], "")
            ])).toBeTruthy();

            done();
        });

        it('Bonded Relationship <-', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?(node)<-[assignment]-(artifact)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["node"], ""),
                new InputRelationship(
                    "TYPED_RELATIONSHIP",
                    "BONDED_LEFT",
                    "BONDED_BASE",
                    "",
                    ["assignment"],
                    false
                ),
                new InputNode("TYPED_NODE", "", ["artifact"], "")
            ])).toBeTruthy();

            done();
        });

        it('Path Relationship ->', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?(node)=[assignment]=>(artifact)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["node"], ""),
                new InputRelationship(
                    "TYPED_RELATIONSHIP",
                    "PATH_BASE",
                    "PATH_RIGHT",
                    "",
                    ["assignment"],
                    false
                ),
                new InputNode("TYPED_NODE", "", ["artifact"], "")
            ])).toBeTruthy();

            done();
        });

        it('Path Relationship <-', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?(node)<=[assignment]=(artifact)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["node"], ""),
                new InputRelationship(
                    "TYPED_RELATIONSHIP",
                    "PATH_LEFT",
                    "PATH_BASE",
                    "",
                    ["assignment"],
                    false
                ),
                new InputNode("TYPED_NODE", "", ["artifact"], "")
            ])).toBeTruthy();

            done();
        });
    });

    describe('Bidirectional Construction', () => {
        it('Short Bidirectional Relationship <->', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?(node)<->(artifact)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["node"], ""),
                new InputRelationship(
                    "SHORT_RELATIONSHIP",
                    "BONDED_LEFT",
                    "BONDED_RIGHT",
                    "",
                    [],
                    false
                ),
                new InputNode("TYPED_NODE", "", ["artifact"], "")
            ])).toBeTruthy();

            const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

            expect(validateQueryDescriptor(queryDescriptor, [
                new QueryTriple(
                    new QueryNode(["node"], "", []),
                    new QueryRelationship([], 0, false, false),
                    new QueryNode(["artifact"], "", []),
                )
            ])).toBeTruthy();

            done();
        });

        it('Bonded Bidirectional Relationship <-[type]->', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?(node)<-[assignment]->(artifact)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["node"], ""),
                new InputRelationship(
                    "TYPED_RELATIONSHIP",
                    "BONDED_LEFT",
                    "BONDED_RIGHT",
                    "",
                    ["assignment"],
                    false
                ),
                new InputNode("TYPED_NODE", "", ["artifact"], "")
            ])).toBeTruthy();

            const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

            expect(validateQueryDescriptor(queryDescriptor, [
                new QueryTriple(
                    new QueryNode(["node"], "", []),
                    new QueryRelationship(["assignment"], 0, false, false),
                    new QueryNode(["artifact"], "", []),
                )
            ])).toBeTruthy();

            done();
        });

        it('Path Bidirectional Relationship <=[type]=>', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?(node)<=[realization]=>(artifact)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["node"], ""),
                new InputRelationship(
                    "TYPED_RELATIONSHIP",
                    "PATH_LEFT",
                    "PATH_RIGHT",
                    "",
                    ["realization"],
                    false
                ),
                new InputNode("TYPED_NODE", "", ["artifact"], "")
            ])).toBeTruthy();

            const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

            expect(validateQueryDescriptor(queryDescriptor, [
                new QueryTriple(
                    new QueryNode(["node"], "", []),
                    new QueryRelationship(["realization"], 0, false, true),
                    new QueryNode(["artifact"], "", []),
                )
            ])).toBeTruthy();

            done();
        });

        it('Bonded Bidirectional Relationship -', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?(node)-[assignment]-(artifact)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["node"], ""),
                new InputRelationship(
                    "TYPED_RELATIONSHIP",
                    "BONDED_BASE",
                    "BONDED_BASE",
                    "",
                    ["assignment"],
                    false
                ),
                new InputNode("TYPED_NODE", "", ["artifact"], "")
            ])).toBeTruthy();

            const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

            expect(validateQueryDescriptor(queryDescriptor, [
                new QueryTriple(
                    new QueryNode(["node"], "", []),
                    new QueryRelationship(["assignment"], 0, false, false),
                    new QueryNode(["artifact"], "", []),
                )
            ])).toBeTruthy();

            done();
        });

        it('Short Relationship -', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?(node)-(artifact)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["node"], ""),
                new InputRelationship(
                    "SHORT_RELATIONSHIP",
                    "BONDED_BASE",
                    "BONDED_BASE",
                    "",
                    [],
                    false
                ),
                new InputNode("TYPED_NODE", "", ["artifact"], "")
            ])).toBeTruthy();

            const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

            expect(validateQueryDescriptor(queryDescriptor, [
                new QueryTriple(
                    new QueryNode(["node"], "", []),
                    new QueryRelationship(["assignment"], 0, false, false),
                    new QueryNode(["artifact"], "", []),
                )
            ])).toBeTruthy();

            done();
        });

        it('Path Relationship ==', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?(node)=[assignment]=(artifact)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["node"], ""),
                new InputRelationship(
                    "TYPED_RELATIONSHIP",
                    "PATH_BASE",
                    "PATH_BASE",
                    "",
                    ["assignment"],
                    false
                ),
                new InputNode("TYPED_NODE", "", ["artifact"], "")
            ])).toBeTruthy();

            const queryDescriptor: QueryDescriptor = inputDescriptor.generateQueryDescriptor();

            expect(validateQueryDescriptor(queryDescriptor, [
                new QueryTriple(
                    new QueryNode(["node"], "", []),
                    new QueryRelationship(["assignment"], 0, false, true),
                    new QueryNode(["artifact"], "", []),
                )
            ])).toBeTruthy();

            done();
        });
    });
});
