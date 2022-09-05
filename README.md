# Pattern Analysis Engine

User-friendly query engine for functional analysis.

## About

This lib was created to provide a customizable pattern analysis engine. Its purpose is to apply rich pattern-matching logic over a given graph.

## Installation

Using npm:

``
npm i --save @peritoz/pattern-analysis-engine
``

Using Yarn:

``
yarn add @peritoz/pattern-analysis-engine
``

## Getting Started

This lib provides a modular pattern analysis engine composed of:

- User-friendly query language (AMAQL)
- AMAQL Interpreter
- Query engine
- Derivation engine
- Graph Repository interface specification
- In-memory graph repository

The Pattern Analysis Engine was designed for partial or full use. Depending on your needs, you can choose not to use AMAQL and provide a query descriptor directly to the Query Engine. Also, you can implement your Graph Repository and connect the engine to your database.

### Full Usage Example

#### The graph

The following example shows how to use the in-memory Graph Repository to get started quickly.

```ts
const graph = new SimpleGraphRepository();

// Adding vertices
await graph.addVertex({
  id: "1",
  name: "V1",
  types: ["t1", "t2"],
});
await graph.addVertex({
  id: "2",
  name: "V2",
  types: ["t1"],
});

// Adding an edge
await graph.addEdge({
  id: "E1",
  sourceId: "1",
  targetId: "2",
  types: ["et1", "et2"]
});
```

> Note: You can specify your own repository by implementing the *GraphRepository* interface

#### Derivation rules

If you want to take advantage of the transitive inference engine, you first need to describe all derivation rules that should be applied to your graph.

A derivation rule is consists of two parts:

1. **Pattern description**: A string describing a relationship pattern to use as a condition for applying the derivation rule. As described in the following example:

```
(vType1,vType2)[eType1,eType2]>(vType3)<[]()
```

The pattern described above indicates: Matches any relationship chain that starts with a Vertex of type *vType1* or *vType2*, which has outbound relationships (of type *eType1* or *eType2*) to Vertices of type *vType3*, which, in turn, have inbound relationships (of any type) from vertices of any type.

> Note: A Pattern Description is not limited to a two-edge chain. It is also possible to describe more complex patterns formed by more than two edges.

2. **Derived edge template**: The derivation rule effect. It describes the edge output that must be created. An example is shown below.

```
(3)[eType1](1)
```

The template describes an output edge of type *eType1* that has as source the third vertex and as target the first vertex, both from the Pattern Description.

> Note: The numbers represent the index (position) of which the element was described in the Pattern Description, starting at 1.

The example below shows how to set up and run a derivation engine.

```ts
const rules = [
  new DerivationRule("()[et1]>()[et2,et3]>()", "(1)[et1](3)"),
  new DerivationRule("(t1)[et2,et3]>()<[et1](t3)", "(2)[et3](1)"),
  new DerivationRule("()<[](t3)[et3]>(t2)", "(3)[et1,et2](1)"),
];

const derivationEngine = new DerivationEngine(graph, rules);

await derivationEngine.deriveEdges(2);
```

> Note: The method *deriveEdges* receives the number of derivation cycles to be applied over the graph

#### Creating and using the Pattern Analysis Engine

In order to execute AMAQL queries, you will need to instantiate a PatternAnalysisEngine.

The code snippet below presents a basic usage example.

```ts
const patternAnalysisEngine = new PatternAnalysisEngine(graph);

const result = await patternAnalysisEngine.run('?(t1)->(t2)');
```

The expected result is in the form:

```ts
Array<Array<OutputVertex | OutputEdge>>
```

Where:

```
OutputVertex {
    identifier: string;
    label: string;
    types: Array<string>;
}

OutputEdge {
    identifier?: string;
    direction: Direction;
    types: Array<string>;
}
```

> Note: The query response will be an array of paths that match the pattern described in the query. Because of this, the path array will always be a chain of **[VERTEX], ([EDGE], [VERTEX])+**

An example of the expected result is presented below:

```json
[
  [
    {
      "identifier": "1",
      "label": "V1",
      "types": [
        "t1",
        "t2"
      ]
    },
    {
      "direction": 1,
      "types": [
        "et1"
      ]
    },
    {
      "identifier": "2",
      "label": "V2",
      "types": [
        "t1"
      ]
    }
  ]
]
```

## The AMAQL Query Language

AMAQL is a custom pattern matching language, designed to be easy to use and an advanced tool for pattern analysis.

The basic constructor of AMAQL is the Triple Pattern:

> ?[NODE_ELEMENT] [RELATIONSHIP] [NODE_ELEMENT]

Of course, you can combine many Triple Patterns to define a single complex pattern, as defined below:

> ?[NODE_ELEMENT] [RELATIONSHIP] [NODE_ELEMENT] ( [RELATIONSHIP] [NODE_ELEMENT] )*

Also, you might want to perform a simple model query to retrieve all nodes with a certain name or type. For this purpose, you can also make AMAQL queries giving only one node, with (or not) a label or type.

> ?('LABEL':TYPE)

A basic pair of examples are presented below. The first illustrates how to get all nodes with a given name. The second shows how to get all nodes of a specific type:

> ?('Customer')

> ?(Actor)

The philosophy of an AMAQL query is the "analysis by example", i.e., AMAQL expects from the user a pattern example to match through the model. For example, if you want to discover which Actors use a specific
Process then you might use the following construction:

> ?('business_process_name':Process)<-[Uses]-(Actor)

The result of this query is a list of "BusinessActors" and "BusinessProcesses" that match the described pattern.

### 1.Nodes

There are four types of nodes, which are described in the sequel.

#### 1.1.Described Node

Nodes that contain identifier information about the node. An AMAQL query, in general, only has one Described Node. This type of node can be used when you want to analyze a specific element.

The syntax is presented below:

> ([SEARCH_TEXT]:[DOMAIN_TYPE])

Example:

> ?('Customer':Role)

#### 1.2.Typed Node

A Typed Node describes which nodes you want to return as a result of the query evaluation. Defines a generic node, with the description of its type.

The syntax is presented below:

> ?([DOMAIN_TYPE])

Example:

> ?(Component)

#### 1.3.Inclusive Node

Describes a generic node that captures all nodes of all types. This node is presented in the query result.

The syntax is presented below:

> ?(*)

#### 1.4.Non-Described Node

Describes a generic node that doesn't have to be returned to the query result.

The syntax is presented below:

> ?()

#### 1.5.Identified Node

Describes a node with a search term attached to it and without type assignment.

The syntax is presented below:

> ?('mongodb')

### 2.Relationships

Another important concept of AMAQL is the Relationship constructor. A Relationship allows the user to specify a link between two nodes to describe a pattern. We can classify a relationship from two perspectives: the indication of a type and the number of hoops (graph edges) between the linked nodes. Over the first perspective (indication of a type), we have two kinds of relationships:

- Short Relationship
- Described Relationship

On the other hand (number of hoops between the linked nodes), we have another two kinds useful for defining navigation semantics:

- Bound Relationship
- Path Relationship

In the sequel, we will discuss the many kinds of relationships.

#### 2.1. Bound Relationship

Stands for an actual link between two nodes, without intermediary nodes between them. The number of hoops considered in this kind of relationship is 1. A Bound relationship is represented by a simple dash ("-") and cannot be bidirectional.

#### 2.2.Path Relationship

Stands for a path between two nodes, including possible intermediary nodes between them. Represents a set of relationships and nodes between the described source and target nodes. Its semantics represents an equivalent ( derived) relationship for the chain of relationships between the source and target nodes. A Path Relationship is represented by a double dash ("="). Path Relationships cannot be bidirectional.

#### 2.3. Short Relationship

This kind of relationship doesn't have a type associated. It's the simplest way to define a link between two nodes. Its syntax resembles an arrow, and its semantics indicate that any relationship (of any type) between the two nodes will be matched. Short relationships are not allowed for Path Relationships and cannot be bidirectional.

Bonded Short Relationships:

> -> | <-

#### 2.4.Described Relationship

This kind of relationship has a type associated. For example, for Path Relationships, a relationship type description is required.

In the case of Bonded Relationship, indicate that the relationship between the two nodes must be of the described type.

The syntax of Described Relationships is presented below:

> [SOURCE_DIRECTION] [[RELATIONSHIP_TYPE]] [TARGET_DIRECTION]

Where:

SOURCE_DIRECTION: <- | - | <= | =

TARGET_DIRECTION: -> | - | => | =

RELATIONSHIP_TYPE: Domain relationship types

Examples:

> ?('ERP':Component)<=[Uses]=(Actor)-[Access]->(Data)

> ?('Customer':Role)=[Assignment]=>(Process)

### 3.Constraints

The purpose of AMAQL queries is to provide a suitable platform for complex analysis. To achieve this goal, AMAQL has some constraints to guarantee a predictable performance. The following situations are not allowed.

| Constraint                               | Example                     |
|:-----------------------------------------|:----------------------------|
| Starting a query with Inclusive Node     | ?(*)<=[serving]=(component) |
| Starting a query with Non-Described Node | ?()<=[realization]=(node)   |
| Query with Solitary Inclusive Node       | ?(*)                        |
| Query with Solitary Non-Described Node   | ?()                         |

