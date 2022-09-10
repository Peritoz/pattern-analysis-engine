export function getGrammar(){
    return `
        AMAQL {
            
            // 1 Patterns
                
            Pattern = queryStart (FirstLongPattern | FirstNodeElement)
            
            FirstLongPattern
                = (FirstNodeElement Relationship LongPattern) | (FirstNodeElement Relationship NodeElement)
            
            LongPattern = (StartLongPattern LongPattern) | (StartLongPattern NodeElement)
            
            StartLongPattern = NodeElement Relationship
                    
            // 2 Elements
            
            // Relationship
            Relationship = TypedRelationship | BondedShortRelationship
            
            BondedShortRelationship
                = leftDirection | rightDirection
            
            PathShortRelationship
                = pathLeftDirection | pathRightDirection
                    
            TypedRelationship
                = (leftDirection | pathLeftDirection | baseDirection | pathBaseDirection) RelationshipDescription (rightDirection | pathRightDirection | baseDirection | pathBaseDirection)
            
            RelationshipDescription = relationshipStart label relationshipEnd
                    
            // Node
            FirstNodeElement = IdentifiedNodeElement | DescribedNodeElement | TypedNodeElement
            
            NodeElement
                = NonDescribedNodeElement | IdentifiedNodeElement | DescribedNodeElement | TypedNodeElement | GroupNodeElement
            
            IdentifiedNodeElement = nodeStart ElementName nodeEnd
                
            DescribedNodeElement = nodeStart NodeDescription nodeEnd
                    
            TypedNodeElement = nodeStart (ElementType | label) nodeEnd
            
            GroupNodeElement = nodeStart selectAll nodeEnd
                    
            NonDescribedNodeElement = nodeStart nodeEnd
                        
            NodeDescription = ElementName typeIndicator (ElementType | label)
            
            ElementName = stringDelimiter label stringDelimiter
            
            ElementType = label ElementTypeExpansion
            
            ElementTypeExpansion = orSeparator (ElementType | label)
                       
            // 3 Lexical Grammar
            
            // Identifiers
            label = validChar+
            
            validChar = letter | "_" | "-" | " " | "." | "," | digit
                
            // Directions
            leftDirection = "<-"
            
            pathLeftDirection = "<="
                    
            rightDirection = "->"
            
            pathRightDirection = "=>"
                    
            baseDirection = "-"
            
            pathBaseDirection = "="
                
            // General
            queryStart = "?"
            
            negation = "!"
            
            stringDelimiter = "'"
            
            relationshipStart = "["
            
            relationshipEnd = "]"
            
            nodeStart = "("
            
            nodeEnd = ")"
            
            typeIndicator = ":"
            
            selectAll = "*"
            
            orSeparator = "or"
            
        }
    `;
}