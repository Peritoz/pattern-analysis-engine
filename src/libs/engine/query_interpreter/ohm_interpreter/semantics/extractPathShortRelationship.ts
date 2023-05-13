import { ConnectorDiscriminator } from '@libs/model/input_descriptor/enums/connector_discriminator.enum';
import { InputRelationship } from '@libs/model/input_descriptor/input_relationship.class';
import { RelationshipDiscriminator } from '@libs/model/input_descriptor/enums/relationship_discriminator.enum';

export function extractPathShortRelationship(relationshipType: string) {
  let sourceType: ConnectorDiscriminator;
  let targetType: ConnectorDiscriminator;

  switch (relationshipType) {
    case 'PATH_RIGHT':
      sourceType = ConnectorDiscriminator.PATH_BASE;
      targetType = relationshipType as ConnectorDiscriminator;
      break;
    case 'PATH_LEFT':
      sourceType = relationshipType as ConnectorDiscriminator;
      targetType = ConnectorDiscriminator.PATH_BASE;
      break;
    case 'PATH_BIDIRECTIONAL':
      sourceType = ConnectorDiscriminator.PATH_LEFT;
      targetType = ConnectorDiscriminator.PATH_RIGHT;
      break;
    case 'PATH_BASE':
      sourceType = ConnectorDiscriminator.PATH_LEFT;
      targetType = ConnectorDiscriminator.PATH_RIGHT;
      break;
    default:
      sourceType = ConnectorDiscriminator.PATH_BASE;
      targetType = ConnectorDiscriminator.PATH_BASE;
  }

  return new InputRelationship(
    RelationshipDiscriminator.SHORT_RELATIONSHIP,
    sourceType,
    targetType,
    '',
    [],
    false,
  );
}
