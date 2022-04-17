const {processQueryText} = require("../../src/libs/model/amalManager/genericTranslator/amalQueryManager");

describe('AMAL Query Translation (Grammar Test)', () => {
    describe('Basic Query Construction', () => {
        it('Described Node', done => {
            processQueryText("?('name')");

            done();
        });

        it('Described Node / Typed Node', done => {
            processQueryText("?('mongod':systemsoftware)");

            done();
        });

        it('Described Node / Typed Node with Multiple Types', done => {
            processQueryText("?('mongod':systemsoftware or node or artifact)");

            done();
        });

        it('Typed Node', done => {
            processQueryText("?(systemsoftware)");

            done();
        });

        it('Typed Node with Multiple Types', done => {
            processQueryText("?(systemsoftware or node)");

            done();
        });

        it('Typed Node - With Space Before and After', done => {
            processQueryText("    ?(artifact)  ");

            done();
        });

        it('Should Return Error - Empty Query', done => {
            expect(function () {
                processQueryText("?");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Nested Node', done => {
            expect(function () {
                processQueryText("?((artifact)))");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Invalid Nodes Positioning', done => {
            expect(function () {
                processQueryText("?(artifact)(node)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Invalid Relationship', done => {
            expect(function () {
                processQueryText("?(artifact)(node)->");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Group Node Alone', done => {
            expect(function () {
                processQueryText("?(*)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Not Described Node Alone', done => {
            expect(function () {
                processQueryText("?()");
            }).toThrow("Invalid query");

            done();
        });
    });

    describe('Relationship Construction', () => {
        it('Should Return Error - Not starting with Not Described Node', done => {
            expect(function () {
                processQueryText("?()<=[serving]=(component)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Not starting with Inclusive Node', done => {
            expect(function () {
                processQueryText("?(*)<=[serving]=(component)");
            }).toThrow("Invalid query");

            done();
        });

        it('Short Relationship ->', done => {
            processQueryText("?(node)->(artifact)");

            done();
        });

        it('Short Relationship <-', done => {
            processQueryText("?(node)<-(artifact)");

            done();
        });

        it('Short Bidirectional Relationship <->', done => {
            expect(function () {
                processQueryText("?(node)<->(artifact)")
            }).toThrow("Invalid query");

            done();
        });

        it('Binded Bidirectional Relationship <-[type]->', done => {
            expect(function () {
                processQueryText("?(node)<-[assignment]->(artifact)")
            }).toThrow("Invalid query");

            done();
        });

        it('Path Bidirectional Relationship <=[type]=>', done => {
            expect(function () {
                processQueryText("?(node)<=[realization]=>(artifact)")
            }).toThrow("Invalid query");

            done();
        });

        it('Binded Bidirectional Relationship -', done => {
            expect(function () {
                processQueryText("?(node)-[assignment]-(artifact)")
            }).toThrow("Invalid query");

            done();
        });

        it('Short Relationship -', done => {
            expect(function () {
                processQueryText("?(node)-(artifact)")
            }).toThrow("Invalid query");

            done();
        });

        it('Binded Relationship ->', done => {
            processQueryText("?(node)-[assignment]->(artifact)");

            done();
        });

        it('Binded Relationship <-', done => {
            processQueryText("?(node)<-[assignment]-(artifact)");

            done();
        });

        it('Path Relationship ->', done => {
            processQueryText("?(node)=[assignment]=>(artifact)");

            done();
        });

        it('Path Relationship <-', done => {
            processQueryText("?(node)<=[assignment]=(artifact)");

            done();
        });

        it('Should Return Error - Path Relationship <->', done => {
            expect(function () {
                processQueryText("?(node)<=[assignment]=>(artifact)");
            }).toThrow("Invalid query");

            done();
        });

        it('Should Return Error - Path Relationship -', done => {
            expect(function () {
                processQueryText("?(node)=[assignment]=(artifact)");
            }).toThrow("Invalid query");

            done();
        });
    });

    describe('Complex Pattern Matching Construction', () => {
        it('Simple Chain - Variant 1', done => {
            processQueryText("?(node)-[realization]->(applicationcomponent)=[serving]=>(businessprocess)");

            done();
        });

        it('Simple Chain - Variant 2', done => {
            processQueryText("?(artifact)<-[assignment]-(node)=[serving]=>(businessprocess)");

            done();
        });

        it('Simple Chain - Variant 3', done => {
            processQueryText("?(artifact)<-[assignment]-('atlas':node)=[serving]=>(businessprocess)");

            done();
        });

        it('Complex Chain - Variant 1', done => {
            processQueryText("?(artifact)<-[assignment]-(node)-[realization]->(applicationcomponent)=[serving]=>(businessprocess)<-[composition]-(businessprocess)");

            done();
        });
    });
});
