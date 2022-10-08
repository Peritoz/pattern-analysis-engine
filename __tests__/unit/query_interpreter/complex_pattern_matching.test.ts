import { validate_query_chain } from "../utils/validate_query_chain";
import { InputNode } from "../../../src/libs/model/input_descriptor/input_node.class";
import { InputRelationship } from "../../../src/libs/model/input_descriptor/input_relationship.class";
import {
  QueryDescriptor,
  QueryTriple,
  QueryNode,
  QueryRelationship,
  Direction,
} from "../../../src";
import { validate_query_descriptor } from "../utils/validate_query_descriptor";
import { OhmInterpreter } from "../../../src/libs/engine/query_interpreter";

describe("Complex Pattern Translation", () => {
  it("Mixed Chain", (done) => {
    const inputDescriptor = OhmInterpreter.mountInputDescriptor(
      "?('env1':node)-[realizes]=>('app':app)=[serving]->(process)"
    );

    expect(
      validate_query_chain(inputDescriptor, [
        new InputNode("DESCRIBED_NODE", "", ["node"], "env1"),
        new InputRelationship(
          "TYPED_RELATIONSHIP",
          "BONDED_BASE",
          "PATH_RIGHT",
          "",
          ["realizes"],
          false
        ),
        new InputNode("DESCRIBED_NODE", "", ["app"], "app"),
        new InputRelationship(
          "TYPED_RELATIONSHIP",
          "PATH_BASE",
          "BONDED_RIGHT",
          "",
          ["serving"],
          false
        ),
        new InputNode("TYPED_NODE", "", ["process"], ""),
      ])
    ).toBeTruthy();

    const queryDescriptor: QueryDescriptor =
      inputDescriptor.generateQueryDescriptor();

    expect(
      validate_query_descriptor(queryDescriptor, [
        new QueryTriple(
          new QueryNode(["node"], "env1", []),
          new QueryRelationship(["realizes"], Direction.OUTBOUND, false, false),
          new QueryNode([], "", [])
        ),
        new QueryTriple(
          new QueryNode([], "", []),
          new QueryRelationship(["realizes"], Direction.OUTBOUND, false, true),
          new QueryNode(["app"], "app", [])
        ),
        new QueryTriple(
          new QueryNode(["app"], "app", []),
          new QueryRelationship(["serving"], Direction.OUTBOUND, false, true),
          new QueryNode([], "", [])
        ),
        new QueryTriple(
          new QueryNode([], "", []),
          new QueryRelationship(["serving"], Direction.OUTBOUND, false, false),
          new QueryNode(["process"], "", [])
        ),
      ])
    ).toBeTruthy();

    done();
  });

  it("Simple Chain - Variant 1", (done) => {
    const inputDescriptor = OhmInterpreter.mountInputDescriptor(
      "?(node)-[realizes]->(app)=[serving]=>(process)"
    );

    expect(
      validate_query_chain(inputDescriptor, [
        new InputNode("TYPED_NODE", "", ["node"], ""),
        new InputRelationship(
          "TYPED_RELATIONSHIP",
          "BONDED_BASE",
          "BONDED_RIGHT",
          "",
          ["realizes"],
          false
        ),
        new InputNode("TYPED_NODE", "", ["app"], ""),
        new InputRelationship(
          "TYPED_RELATIONSHIP",
          "PATH_BASE",
          "PATH_RIGHT",
          "",
          ["serving"],
          false
        ),
        new InputNode("TYPED_NODE", "", ["process"], ""),
      ])
    ).toBeTruthy();

    const queryDescriptor: QueryDescriptor =
      inputDescriptor.generateQueryDescriptor();

    expect(
      validate_query_descriptor(queryDescriptor, [
        new QueryTriple(
          new QueryNode(["node"], "", []),
          new QueryRelationship(["realizes"], Direction.OUTBOUND, false, false),
          new QueryNode(["app"], "", [])
        ),
        new QueryTriple(
          new QueryNode(["app"], "", []),
          new QueryRelationship(["serving"], Direction.OUTBOUND, false, true),
          new QueryNode(["process"], "", [])
        ),
      ])
    ).toBeTruthy();

    done();
  });

  it("Simple Chain - Variant 2", (done) => {
    const inputDescriptor = OhmInterpreter.mountInputDescriptor(
      "?(database)<-[hosts]-(node)=[serving]=>(process)"
    );

    expect(
      validate_query_chain(inputDescriptor, [
        new InputNode("TYPED_NODE", "", ["database"], ""),
        new InputRelationship(
          "TYPED_RELATIONSHIP",
          "BONDED_LEFT",
          "BONDED_BASE",
          "",
          ["hosts"],
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
        new InputNode("TYPED_NODE", "", ["process"], ""),
      ])
    ).toBeTruthy();

    const queryDescriptor: QueryDescriptor =
      inputDescriptor.generateQueryDescriptor();

    expect(
      validate_query_descriptor(queryDescriptor, [
        new QueryTriple(
          new QueryNode(["database"], "", []),
          new QueryRelationship(["hosts"], -1, false, false),
          new QueryNode(["node"], "", [])
        ),
        new QueryTriple(
          new QueryNode(["node"], "", []),
          new QueryRelationship(["serving"], 1, false, true),
          new QueryNode(["process"], "", [])
        ),
      ])
    ).toBeTruthy();

    done();
  });

  it("Simple Chain - Variant 3", (done) => {
    const inputDescriptor = OhmInterpreter.mountInputDescriptor(
      "?(database)<-[hosts]-('atlas':node)=[serving]=>(process)"
    );

    expect(
      validate_query_chain(inputDescriptor, [
        new InputNode("TYPED_NODE", "", ["database"], ""),
        new InputRelationship(
          "TYPED_RELATIONSHIP",
          "BONDED_LEFT",
          "BONDED_BASE",
          "",
          ["hosts"],
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
        new InputNode("TYPED_NODE", "", ["process"], ""),
      ])
    ).toBeTruthy();

    const queryDescriptor: QueryDescriptor =
      inputDescriptor.generateQueryDescriptor();

    expect(
      validate_query_descriptor(queryDescriptor, [
        new QueryTriple(
          new QueryNode(["database"], "", []),
          new QueryRelationship(["hosts"], Direction.INBOUND, false, false),
          new QueryNode(["node"], "atlas", [])
        ),
        new QueryTriple(
          new QueryNode(["node"], "atlas", []),
          new QueryRelationship(["serving"], Direction.OUTBOUND, false, true),
          new QueryNode(["process"], "", [])
        ),
      ])
    ).toBeTruthy();

    done();
  });

  it("Complex Chain - Variant 1", (done) => {
    const inputDescriptor = OhmInterpreter.mountInputDescriptor(
      "?(database)<-[hosts]-(node)-[realizes]->(app)=[serving]=>(process)<-[composition]-(process)"
    );

    expect(
      validate_query_chain(inputDescriptor, [
        new InputNode("TYPED_NODE", "", ["database"], ""),
        new InputRelationship(
          "TYPED_RELATIONSHIP",
          "BONDED_LEFT",
          "BONDED_BASE",
          "",
          ["hosts"],
          false
        ),
        new InputNode("TYPED_NODE", "", ["node"], ""),
        new InputRelationship(
          "TYPED_RELATIONSHIP",
          "BONDED_BASE",
          "BONDED_RIGHT",
          "",
          ["realizes"],
          false
        ),
        new InputNode("TYPED_NODE", "", ["app"], ""),
        new InputRelationship(
          "TYPED_RELATIONSHIP",
          "PATH_BASE",
          "PATH_RIGHT",
          "",
          ["serving"],
          false
        ),
        new InputNode("TYPED_NODE", "", ["process"], ""),
        new InputRelationship(
          "TYPED_RELATIONSHIP",
          "BONDED_LEFT",
          "BONDED_BASE",
          "",
          ["composition"],
          false
        ),
        new InputNode("TYPED_NODE", "", ["process"], ""),
      ])
    ).toBeTruthy();

    const queryDescriptor: QueryDescriptor =
      inputDescriptor.generateQueryDescriptor();

    expect(
      validate_query_descriptor(queryDescriptor, [
        new QueryTriple(
          new QueryNode(["database"], "", []),
          new QueryRelationship(["hosts"], Direction.INBOUND, false, false),
          new QueryNode(["node"], "", [])
        ),
        new QueryTriple(
          new QueryNode(["node"], "", []),
          new QueryRelationship(["realizes"], Direction.OUTBOUND, false, false),
          new QueryNode(["app"], "", [])
        ),
        new QueryTriple(
          new QueryNode(["app"], "", []),
          new QueryRelationship(["serving"], Direction.OUTBOUND, false, true),
          new QueryNode(["process"], "", [])
        ),
        new QueryTriple(
          new QueryNode(["process"], "", []),
          new QueryRelationship(
            ["composition"],
            Direction.INBOUND,
            false,
            false
          ),
          new QueryNode(["process"], "", [])
        ),
      ])
    ).toBeTruthy();

    done();
  });
});
