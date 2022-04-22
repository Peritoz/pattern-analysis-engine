exports.getDirection = (relationship) => {
    if ((relationship.sourceDisc === 'BONDED_BASE' && relationship.targetDisc === 'BONDED_RIGHT') ||
        (relationship.sourceDisc === 'PATH_BASE' && relationship.targetDisc === 'PATH_RIGHT')) {
        return 1;
    } else if ((relationship.sourceDisc === 'BONDED_LEFT' && relationship.targetDisc === 'BONDED_BASE') ||
        (relationship.sourceDisc === 'PATH_LEFT' && relationship.targetDisc === 'PATH_BASE')) {
        return -1;
    } else {
        return 0;
    }
};