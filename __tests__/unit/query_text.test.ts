import {OhmInterpreter} from "../../src/libs/engine/query_interpreter";

describe('AMAL Query Translation (Grammar Test)', () => {
    let interpreter;
    
    beforeAll(() => {
        interpreter = new OhmInterpreter();
    });
    
    describe('Basic Query Construction', () => {
        it('Described Node', done => {
            interpreter.mountQueryDescriptor("?('name')");

            done();
        });

        it('Described Node / Typed Node', done => {
            interpreter.mountQueryDescriptor("?('mongod':systemsoftware)");

            done();
        });

        it('Described Node / Typed Node with Multiple Types', done => {
            interpreter.mountQueryDescriptor("?('mongod':systemsoftware or node or artifact)");

            done();
        });

        it('Typed Node', done => {
            interpreter.mountQueryDescriptor("?(systemsoftware)");

            done();
        });

        it('Typed Node with Multiple Types', done => {
            interpreter.mountQueryDescriptor("?(systemsoftware or node)");

            done();
        });

        it('Typed Node - With Space Before and After', done => {
            interpreter.mountQueryDescriptor("    ?(artifact)  ");

            done();
        });

        it('Should Return Error - Empty Query', done => {
            expect(function () {
                interpreter.mountQueryDescriptor("?");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Nested Node', done => {
            expect(function () {
                interpreter.mountQueryDescriptor("?((artifact)))");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Invalid Nodes Positioning', done => {
            expect(function () {
                interpreter.mountQueryDescriptor("?(artifact)(node)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Invalid Relationship', done => {
            expect(function () {
                interpreter.mountQueryDescriptor("?(artifact)(node)->");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Group Node Alone', done => {
            expect(function () {
                interpreter.mountQueryDescriptor("?(*)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Not Described Node Alone', done => {
            expect(function () {
                interpreter.mountQueryDescriptor("?()");
            }).toThrow("Invalid query");

            done();
        });
    });

    describe('Relationship Construction', () => {
        it('Should Return Error - Not starting with Not Described Node', done => {
            expect(function () {
                interpreter.mountQueryDescriptor("?()<=[serving]=(component)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Not starting with Inclusive Node', done => {
            expect(function () {
                interpreter.mountQueryDescriptor("?(*)<=[serving]=(component)");
            }).toThrow("Invalid query");

            done();
        });

        it('Short Relationship ->', done => {
            interpreter.mountQueryDescriptor("?(node)->(artifact)");

            done();
        });

        it('Short Relationship <-', done => {
            interpreter.mountQueryDescriptor("?(node)<-(artifact)");

            done();
        });

        it('Short Bidirectional Relationship <->', done => {
            expect(function () {
                interpreter.mountQueryDescriptor("?(node)<->(artifact)")
            }).toThrow("Invalid query");

            done();
        });

        it('Bonded Bidirectional Relationship <-[type]->', done => {
            expect(function () {
                interpreter.mountQueryDescriptor("?(node)<-[assignment]->(artifact)")
            }).toThrow("Invalid query");

            done();
        });

        it('Path Bidirectional Relationship <=[type]=>', done => {
            expect(function () {
                interpreter.mountQueryDescriptor("?(node)<=[realization]=>(artifact)")
            }).toThrow("Invalid query");

            done();
        });

        it('Bonded Bidirectional Relationship -', done => {
            expect(function () {
                interpreter.mountQueryDescriptor("?(node)-[assignment]-(artifact)")
            }).toThrow("Invalid query");

            done();
        });

        it('Short Relationship -', done => {
            expect(function () {
                interpreter.mountQueryDescriptor("?(node)-(artifact)")
            }).toThrow("Invalid query");

            done();
        });

        it('Bonded Relationship ->', done => {
            interpreter.mountQueryDescriptor("?(node)-[assignment]->(artifact)");

            done();
        });

        it('Bonded Relationship <-', done => {
            interpreter.mountQueryDescriptor("?(node)<-[assignment]-(artifact)");

            done();
        });

        it('Path Relationship ->', done => {
            interpreter.mountQueryDescriptor("?(node)=[assignment]=>(artifact)");

            done();
        });

        it('Path Relationship <-', done => {
            interpreter.mountQueryDescriptor("?(node)<=[assignment]=(artifact)");

            done();
        });

        it('Should Return Error - Path Relationship <->', done => {
            expect(function () {
                interpreter.mountQueryDescriptor("?(node)<=[assignment]=>(artifact)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Path Relationship -', done => {
            expect(function () {
                interpreter.mountQueryDescriptor("?(node)=[assignment]=(artifact)");
            }).toThrow("Invalid query");

            done();
        });
    });

    describe('Complex Pattern Matching Construction', () => {
        it('Simple Chain - Variant 1', done => {
            interpreter.mountQueryDescriptor("?(node)-[realization]->(applicationcomponent)=[serving]=>(businessprocess)");

            done();
        });

        it('Simple Chain - Variant 2', done => {
            interpreter.mountQueryDescriptor("?(artifact)<-[assignment]-(node)=[serving]=>(businessprocess)");

            done();
        });

        it('Simple Chain - Variant 3', done => {
            interpreter.mountQueryDescriptor("?(artifact)<-[assignment]-('atlas':node)=[serving]=>(businessprocess)");

            done();
        });

        it('Complex Chain - Variant 1', done => {
            interpreter.mountQueryDescriptor("?(artifact)<-[assignment]-(node)-[realization]->(applicationcomponent)=[serving]=>(businessprocess)<-[composition]-(businessprocess)");

            done();
        });
    });
});
