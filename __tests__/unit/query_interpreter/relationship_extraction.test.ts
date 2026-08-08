import { extractBondedShortRelationship } from '../../../src/libs/engine/query_interpreter/ohm_interpreter/semantics/extractBondedShortRelationship';
import { extractPathShortRelationship } from '../../../src/libs/engine/query_interpreter/ohm_interpreter/semantics/extractPathShortRelationship';
import { ConnectorDiscriminator } from '../../../src/libs/model/input_descriptor/enums/connector_discriminator.enum';
import { RelationshipDiscriminator } from '../../../src/libs/model/input_descriptor/enums/relationship_discriminator.enum';

describe('short relationship extraction', () => {
  it.each([
    ['BONDED_RIGHT', ConnectorDiscriminator.BONDED_BASE, ConnectorDiscriminator.BONDED_RIGHT],
    ['BONDED_LEFT', ConnectorDiscriminator.BONDED_LEFT, ConnectorDiscriminator.BONDED_BASE],
    [
      'BONDED_BIDIRECTIONAL',
      ConnectorDiscriminator.BONDED_LEFT,
      ConnectorDiscriminator.BONDED_RIGHT,
    ],
    ['BONDED_BASE', ConnectorDiscriminator.BONDED_BASE, ConnectorDiscriminator.BONDED_BASE],
    ['UNKNOWN', ConnectorDiscriminator.BONDED_BASE, ConnectorDiscriminator.BONDED_BASE],
  ])('maps %s to its bonded connectors', (relationshipType, sourceDisc, targetDisc) => {
    const relationship = extractBondedShortRelationship(relationshipType);

    expect(relationship.discriminator).toBe(RelationshipDiscriminator.SHORT_RELATIONSHIP);
    expect(relationship.sourceDisc).toBe(sourceDisc);
    expect(relationship.targetDisc).toBe(targetDisc);
  });

  it.each([
    ['PATH_RIGHT', ConnectorDiscriminator.PATH_BASE, ConnectorDiscriminator.PATH_RIGHT],
    ['PATH_LEFT', ConnectorDiscriminator.PATH_LEFT, ConnectorDiscriminator.PATH_BASE],
    ['PATH_BIDIRECTIONAL', ConnectorDiscriminator.PATH_LEFT, ConnectorDiscriminator.PATH_RIGHT],
    ['PATH_BASE', ConnectorDiscriminator.PATH_LEFT, ConnectorDiscriminator.PATH_RIGHT],
    ['UNKNOWN', ConnectorDiscriminator.PATH_BASE, ConnectorDiscriminator.PATH_BASE],
  ])('maps %s to its path connectors', (relationshipType, sourceDisc, targetDisc) => {
    const relationship = extractPathShortRelationship(relationshipType);

    expect(relationship.discriminator).toBe(RelationshipDiscriminator.SHORT_RELATIONSHIP);
    expect(relationship.sourceDisc).toBe(sourceDisc);
    expect(relationship.targetDisc).toBe(targetDisc);
  });
});
