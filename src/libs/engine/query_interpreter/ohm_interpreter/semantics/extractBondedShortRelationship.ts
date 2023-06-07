import { ConnectorDiscriminator } from '@libs/model/input_descriptor/enums/connector_discriminator.enum';
import { InputRelationship } from '@libs/model/input_descriptor/input_relationship.class';
import { RelationshipDiscriminator } from '@libs/model/input_descriptor/enums/relationship_discriminator.enum';

export function extractBondedShortRelationship(relationshipType: string) {
  let sourceType: ConnectorDiscriminator;
  let targetType: ConnectorDiscriminator;

  switch (relationshipType) {
    case 'BONDED_RIGHT':
      sourceType = ConnectorDiscriminator.BONDED_BASE;
      targetType = ConnectorDiscriminator.BONDED_RIGHT;
      break;
    case 'BONDED_LEFT':
      sourceType = ConnectorDiscriminator.BONDED_LEFT;
      targetType = ConnectorDiscriminator.BONDED_BASE;
      break;
    case 'BONDED_BIDIRECTIONAL':
      sourceType = ConnectorDiscriminator.BONDED_LEFT;
      targetType = ConnectorDiscriminator.BONDED_RIGHT;
      break;
    case 'BONDED_BASE':
      sourceType = ConnectorDiscriminator.BONDED_BASE;
      targetType = ConnectorDiscriminator.BONDED_BASE;
      break;
    default:
      sourceType = ConnectorDiscriminator.BONDED_BASE;
      targetType = ConnectorDiscriminator.BONDED_BASE;
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
