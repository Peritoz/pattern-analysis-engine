# Pattern Analysis Engine

User-friendly query engine for functional analysis.

## Getting Started with AMAQL

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

The purpose of AMAQL queries is to provide a suitable platform for complex analysis. To achieve this goal, AMAQL has some constraints to guarantee a predictable performance.

| Constraint                               | Example                     |
|:-----------------------------------------|:----------------------------|
| Starting a query with Inclusive Node     | ?(*)<=[serving]=(component) |
| Starting a query with Non-Described Node | ?()<=[realization]=(node)   |
| Query with Solitary Inclusive Node       | ?(*)                        |
| Query with Solitary Non-Described Node   | ?()                         |

