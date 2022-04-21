**TEST CASES**

1 ) Simple Search

```('mongo')``` 

2 ) Typed Search

```('mongod':systemsoftware)```

3 ) Portfolio

```(systemsoftware)```

4 ) Get Relationships

```(node)->(artifact)```

5 ) Get Typed Relationships

```(node)-[assignment]->(artifact)```

6 ) Get Derivation

```(node)=[serving]=>(applicationcomponent)```

7 ) Generic Node

```(node)-[assignment]->()```

8 ) Returned Group Generic Node

```(node)-[assignment]->(*)```

9 ) Path Generic Node

```(node)=[assignment]=>()```

10 ) Path Returned Group Generic Node

```(node)=[assignment]=>(*)```

11 ) Simple Chain

```(node)-[realization]->(applicationcomponent)=[serving]=>(businessprocess)```

12 ) Pattern Matching

```(artifact)<-[assignment]-(node)=[serving]=>(businessprocess)```

13 ) Pattern Matching Chain

```(artifact)<-[assignment]-(node)-[realization]->(applicationcomponent)=[serving]=>(businessprocess)<-[composition]-(businessprocess)```

13 ) Identified Pattern Matching

```(artifact)<-[assignment]-('atlas':node)=[serving]=>(businessprocess)```

14 ) Generic Node (Short)

```(node)->()```