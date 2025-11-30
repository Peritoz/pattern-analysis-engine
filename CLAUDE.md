# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pattern Analysis Engine (@peritoz/pattern-analysis-engine) - A modular, user-friendly query engine for functional analysis over graph structures with logical inference edges. The engine supports pattern matching using AMAQL (a custom graph query language) and provides derivation capabilities to generate inference edges based on custom rules.

## Commands

### Build
```bash
npm run build
```
Compiles TypeScript to JavaScript and resolves path aliases. Output:
- Compiled JS: `dist/lib/`
- Type declarations: `dist/@types/`

### Tests
```bash
# Run all tests
npm test

# Run specific test file
npx jest __tests__/unit/pattern_analysis_engine/basic_graph.test.ts

# Run tests matching a pattern
npx jest --testNamePattern="should match"
```

Tests are located in `__tests__/unit/` and use Jest with ts-jest preset.

## Architecture

### Core Engine Components

The engine is organized into three main execution layers:

**1. PatternAnalysisEngine** (src/libs/engine/pattern_analysis_engine/)
- Entry point for AMAQL query strings
- Delegates to OhmInterpreter to parse AMAQL into QueryDescriptor objects
- Forwards QueryDescriptor to QueryEngine for execution

**2. QueryEngine** (src/libs/engine/query_engine/)
- Executes pattern matching from QueryDescriptor objects
- Two execution modes:
  - `runComplexQuery()`: Multi-triple pattern matching with edge chaining
  - `runLookup()`: Simple vertex lookups by filter
- Processes query chains in stages, linking edges by sourceId/targetId
- Returns paths as alternating vertex-edge arrays: `[OutputVertex, OutputEdge, OutputVertex, ...]`

**3. DerivationEngine** (src/libs/engine/derivation_engine/)
- Generates inferred edges based on DerivationRule patterns
- Executes in cycles with scope management:
  - Cycle 0: NON_DERIVED edges only
  - Odd cycles: Mix of NON_DERIVED and DERIVED edges
  - Even cycles: DERIVED edges only
- Rules consist of:
  - Conditional: Two-part pattern to match (firstPart, secondPart, middleElement)
  - Effect: Template describing the derived edge to create

### Query Descriptor Model (src/libs/model/query_descriptor/)

Programmatic representation of queries, composed of:
- **QueryDescriptor**: Container for QueryTriple chain
- **QueryTriple**: Pattern segment (leftNode, relationship, rightNode)
- **QueryNode**: Vertex criteria (types, searchTerm, ids, shouldBeReturned)
- **QueryRelationship**: Edge criteria (types, direction, isNegated, isDerived)

### Graph Repository Interface (src/libs/model/graph_repository/)

Abstract contract defining graph operations. Key methods:
- `addVertex()`, `addEdge()`: Graph mutations
- `getVerticesByFilter()`, `getEdgesByFilter()`: Pattern matching
- `exists()`: Duplicate detection

**SimpleGraphRepository** (src/libs/engine/simple_graph_repository/) provides an in-memory implementation. For production, implement custom repository backed by your database (Neo4j, PostgreSQL, etc.).

### AMAQL Query Language

AMAQL grammar is defined using Ohm.js in src/libs/engine/query_interpreter/ohm_interpreter/grammar/getGrammar.ts

Key syntax:
- Query prefix: `?`
- Nodes: `(type)`, `(type1 or type2)`, `('name':type)`, `(*)`
- Relationships:
  - Direction: `->` (outbound), `<-` (inbound), `-` (any)
  - Path: `=>` (outbound path), `<=` (inbound path), `=` (any path)
  - Typed: `-[relType]->`, `<-[relType]-`
- Patterns: `?(t1)-[et1]->(t2)<-[et2]-(t3)`

The OhmInterpreter (src/libs/engine/query_interpreter/ohm_interpreter/) translates AMAQL to QueryDescriptor via semantic actions.

## Module Path Aliases

TypeScript and Babel are configured with `@libs/*` alias:
- TypeScript: Maps to `src/libs/*` (tsconfig.json)
- Babel: Transforms aliases during testing (babel.config.js)
- Build: tscpaths resolves aliases in compiled output

Always use `@libs/` imports within the src/ directory.

## Public API Surface

Main exports (src/index.ts):
- Engines: `PatternAnalysisEngine`, `QueryEngine`, `DerivationEngine`
- Graph Repository: `GraphRepository` (interface), `SimpleGraphRepository`, `SimpleGraphVertex`, `SimpleGraphEdge`
- Query Models: `QueryDescriptor`, `QueryNode`, `QueryRelationship`, `QueryTriple`
- Common: `DerivationRule`, `Direction`, `Logger`

## Key Implementation Details

**Direction Handling**: Throughout the codebase, edge traversal considers both relationship direction (Direction.OUTBOUND/INBOUND) and whether edges connect via sourceId or targetId. When processing triples, the engine adjusts source/target filters based on direction to correctly chain pattern segments.

**Cycle Prevention**: QueryEngine tracks visitedVertices during path generation to avoid circular paths (query_engine.class.ts:114-126).

**Derivation Path Tracking**: Derived edges maintain a derivationPath array tracing back to source edges, enabling provenance tracking for inferred relationships.

**Logger Integration**: DerivationEngine accepts optional Logger interface for monitoring derivation cycles and rule processing.
