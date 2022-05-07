import {OhmInterpreter} from "../../src/libs/engine/query_interpreter";
import {InputDescriptor} from "../../src/libs/model/input_descriptor/input_descriptor.class";
import {InputNode} from "../../src/libs/model/input_descriptor/input_node.class";
import {InputRelationship} from "../../src/libs/model/input_descriptor/input_relationship.class";

function validateQueryChain(inputDescriptor: InputDescriptor, result: Array<InputNode | InputRelationship>) {
    if (inputDescriptor.queryChain.length === result.length) {
        for (let i = 0; i < inputDescriptor.queryChain.length; i++) {
            const element: InputNode | InputRelationship = inputDescriptor.queryChain[i];
            const resultElement: InputNode | InputRelationship = result[i];

            if (element.discriminator !== resultElement.discriminator ||
                !element.types.every((e, i) => e === resultElement.types[i])) {
                return false;
            }
            if (element instanceof InputNode && resultElement instanceof InputNode) {
                if (element.searchTerm !== resultElement.searchTerm) {
                    return false;
                }
            }
            if (element instanceof InputRelationship && resultElement instanceof InputRelationship) {
                if (element.sourceDisc !== resultElement.sourceDisc ||
                    element.targetDisc !== resultElement.targetDisc) {
                    return false;
                }
            }
        }
    } else {
        return false;
    }

    return true;
}

describe('Input Query Translation (Grammar Test)', () => {
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

            done();
        });

        it('Described Node / Typed Node', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?('mongod':systemsoftware)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("DESCRIBED_NODE", "", ["systemsoftware"], "mongod")
            ])).toBeTruthy();

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

            done();
        });

        it('Typed Node', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?(systemsoftware)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["systemsoftware"], "")
            ])).toBeTruthy();

            done();
        });

        it('Typed Node with Multiple Types', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("?(systemsoftware or node)");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["systemsoftware", "node"], "")
            ])).toBeTruthy();

            done();
        });

        it('Typed Node - With Space Before and After', done => {
            const inputDescriptor = interpreter.mountInputDescriptor("    ?(artifact)  ");

            expect(validateQueryChain(inputDescriptor, [
                new InputNode("TYPED_NODE", "", ["artifact"], "")
            ])).toBeTruthy();

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

        it('Should Return Error - Short Bidirectional Relationship <->', done => {
            expect(function () {
                interpreter.mountInputDescriptor("?(node)<->(artifact)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Bonded Bidirectional Relationship <-[type]->', done => {
            expect(function () {
                interpreter.mountInputDescriptor("?(node)<-[assignment]->(artifact)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Path Bidirectional Relationship <=[type]=>', done => {
            expect(function () {
                interpreter.mountInputDescriptor("?(node)<=[realization]=>(artifact)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Bonded Bidirectional Relationship -', done => {
            expect(function () {
                interpreter.mountInputDescriptor("?(node)-[assignment]-(artifact)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Short Relationship -', done => {
            expect(function () {
                interpreter.mountInputDescriptor("?(node)-(artifact)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Path Relationship <->', done => {
            expect(function () {
                const inputDescriptor = interpreter.mountInputDescriptor("?(node)<=[assignment]=>(artifact)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Path Relationship -', done => {
            expect(function () {
                const inputDescriptor = interpreter.mountInputDescriptor("?(node)=[assignment]=(artifact)");
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

    describe('Complex Pattern Matching Construction', () => {
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

            done();
        });
    });
});
