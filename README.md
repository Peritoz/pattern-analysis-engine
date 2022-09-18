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

- **User-friendly query language (AMAQL)**: Graph query language specialized in pattern analysis and designed to be used by non-experts.
- **AMAQL Interpreter**: AMAQL parser engine that is responsible for translating the query from text to object.
- Query engine
- Derivation engine
- Graph Repository interface specification
- In-memory graph repository

The Pattern Analysis Engine was designed for partial or full use. Depending on your needs, you can choose not to use AMAQL and provide a query descriptor directly to the Query Engine. Also, you can implement your Graph Repository and connect the engine to your database.

### Full Usage Example

The image below describes the Pattern Analysis Engine architecture in full usage.

!["Full usage"](./docs/images/full-use.png)

#### The graph

The following example shows how to use the in-memory Graph Repository to get started quickly.

```ts
const graph = new SimpleGraphRepository();

// Adding vertices
// SimpleGraphVertex receives VertexName, Types and External Vertex Id
await graph.addVertex(new SimpleGraphVertex("V1", ["t1", "t2"], "1"));
await graph.addVertex(new SimpleGraphVertex("V2", ["t1"], "2"));

// Adding an edge
// SimpleGraphEdge receives SourceId, TargetId, Types and External Edge Id
await graph.addEdge(new SimpleGraphEdge("1", "2", ["et1", "et2"], "E1"));
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

You can find more details about AMAQL [here](https://github.com/Diorbert/amaql).


