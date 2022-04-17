const DIAPO_GLYPHS_DIRECTORY = "/img/glyphs/diapo/";
const GLYPHS_DIRECTORY = "/img/glyphs/black/";
const EXTENSION = ".svg";

exports.typeToLayer = (type, languageversion) => {
    if (type === "requirement" ||
        type === "principle" ||
        type === "constraint" ||
        type === "goal" ||
        type === "outcome" ||
        type === "driver" ||
        type === "assessment" ||
        type === "stakeholder" ||
        type === "value" ||
        type === "meaning"
    ) {
        return "motivational";
    }

    if (type === "plateau" ||
        type === "workpackage" ||
        type === "deliverable" ||
        type === "implementationevent" ||
        type === "gap"
    ) {
        return "implementation_and_migration";
    }

    if (type === "businesscollaboration" ||
        type === "businessinteraction" ||
        type === "businessactor" ||
        type === "businessrole" ||
        type === "businessprocess" ||
        type === "businessfunction" ||
        type === "businessservice" ||
        type === "businessinterface" ||
        type === "businessobject" ||
        type === "businessevent" ||
        type === "representation" ||
        type === "location" ||
        type === "product" ||
        type === "contract"
    ) {
        return "business";
    }

    if (type === "applicationcomponent" ||
        type === "applicationcollaboration" ||
        type === "applicationinteraction" ||
        type === "applicationfunction" ||
        type === "applicationservice" ||
        type === "applicationinterface" ||
        type === "applicationprocess" ||
        type === "dataobject"
    ) {
        return "application";
    }

    if (type === "node" ||
        type === "systemsoftware" ||
        type === "infrastructurefunction" ||
        type === "infrastructureservice" ||
        type === "infrastructureinterface" ||
        type === "technologyfunction" ||
        type === "technologyservice" ||
        type === "technologyinterface" ||
        type === "technologyprocess" ||
        type === "technologycollaboration" ||
        type === "technologyinteraction" ||
        type === "artifact" ||
        type === "communicationnetwork" ||
        type === "path" ||
        type === "device"
    ) {
        return "technology";
    }

    if (type === "material" ||
        type === "facility" ||
        type === "equipment" ||
        type === "distributionnetwork"
    ) {
        return "physical";
    }

    if (type === "resource" ||
        type === "capability" ||
        type === "courseofaction" ||
        type === "valuestream"
    ) {
        return "strategy";
    }

    if (type === "grouping") {
        return "other";
    }

    if (type === "group" || type === "note") {
        return "viewelement";
    }

    return "unknown";
};

exports.typeToStrength = (type, languageversion) => {
    let relationshipType = type.toLowerCase();

    switch (relationshipType) {
        case 'influencerelationship':
            return 10;
        case 'accessrelationship':
            return 20;
        case 'servingrelationship':
            return 30;
        case 'realizationrelationship':
            return 40;
        case 'assignmentrelationship':
            return 50;
        case 'aggregationrelationship':
            return 60;
        case 'compositionrelationship':
            return 70;
        default:
            return 0;
    }
};

/*
    Used to define Transitive Derivation Constraints

    Transitive derivation is part of Archimate derivation rules, indicating that a chain of relationships
    (with different types in the chain) can be replaced by one relationship based on relationship strength.

    This case doesnt cover all the derivation rules of Archimate. The other cases are covered by another function.
 */
exports.getDerivationFilter = (type, languageversion) => {
    if (type !== null) {
        let relationshipType = type.toLowerCase();

        switch (relationshipType) {
            case 'influencerelationship':
                return [
                    'influencerelationship',
                    'accessrelationship',
                    'servingrelationship',
                    'realizationrelationship',
                    'assignmentrelationship',
                    'aggregationrelationship',
                    'compositionrelationship'
                ];
            case 'accessrelationship':
                return [
                    'accessrelationship',
                    'servingrelationship',
                    'realizationrelationship',
                    'assignmentrelationship',
                    'aggregationrelationship',
                    'compositionrelationship'
                ];
            case 'servingrelationship':
                return [
                    'servingrelationship',
                    'realizationrelationship',
                    'assignmentrelationship',
                    'aggregationrelationship',
                    'compositionrelationship'
                ];
            case 'realizationrelationship':
                return [
                    'realizationrelationship',
                    'assignmentrelationship',
                    'aggregationrelationship',
                    'compositionrelationship'
                ];
            case 'assignmentrelationship':
                return [
                    'assignmentrelationship',
                    'aggregationrelationship',
                    'compositionrelationship'
                ];
            case 'aggregationrelationship':
                return [
                    'aggregationrelationship',
                    'compositionrelationship'
                ];
            case 'compositionrelationship':
                return [
                    'compositionrelationship'
                ];
            case 'triggeringrelationship':
                return [
                    'triggeringrelationship'
                ];
            case 'specializationrelationship':
                return [
                    'specializationrelationship'
                ];
            default:
                return [];
        }
    }
};

/*
    Used to define Derivation Constraints
 */
exports.getChildrenTypes = (supertype, languageversion) => {
    if (supertype !== null) {
        let relationshipType = supertype.toLowerCase();

        switch (relationshipType) {
            case 'structural':
                return [
                    'realizationrelationship',
                    'assignmentrelationship',
                    'aggregationrelationship',
                    'compositionrelationship'
                ];
            case 'dependency':
                return [
                    'servingrelationship',
                    'accessrelationship',
                    'influencerelationship',
                    'associationrelationship',
                ];
            case 'dynamic':
                return [
                    'triggeringrelationship',
                    'flowrelationship',
                ];
            default:
                return [];
        }
    }
};

exports.expandType = (type, languageversion) => {
    if (type === 'capability' || type === 'courseofaction' || type === "valuestream") {
        return ['behaviour'];
    } else if (type === 'businessevent' || type === 'applicationevent' || type === 'technologyevent' || type === 'implementationevent') {
        return ['event', 'behaviour'];
    } else if (type === 'businessprocess' || type === 'applicationprocess' || type === 'technologyprocess') {
        return ['process', 'internalbehaviour', 'behaviour'];
    } else if (type === 'businessfunction' || type === 'applicationfunction' || type === 'technologyfunction') {
        return ['function', 'internalbehaviour', 'behaviour'];
    } else if (type === 'businessinteraction' || type === 'applicationinteraction' || type === 'technologyinteraction') {
        return ['interaction', 'internalbehaviour', 'behaviour'];
    } else if (type === 'businesscollaboration' || type === 'applicationcollaboration' || type === 'technologycollaboration') {
        return ['collaboration', 'internalactivestructure', 'activestructure', 'structure'];
    } else if (type === 'businessactor' || type === 'businessrole' || type === 'applicationcomponent' || type === 'node' || type === 'device') {
        return ['internalactivestructure', 'activestructure', 'structure'];
    } else if (type === 'businessinterface' || type === 'applicationinterface' || type === 'technologyinterface') {
        return ['externalactivestructure', 'activestructure', 'structure'];
    } else if (type === 'businessobject' || type === 'dataobject' || type === 'artifact') {
        return ['passivestructure', 'structure'];
    } else {
        return [];
    }
};

exports.typeToIcon = (type, diapo, languageversion) => {
    let directory = null;

    if (diapo) {
        directory = DIAPO_GLYPHS_DIRECTORY;
    } else {
        directory = GLYPHS_DIRECTORY;
    }

    if (type === "requirement" ||
        type === "principle" ||
        type === "constraint" ||
        type === "goal" ||
        type === "driver" ||
        type === "assessment" ||
        type === "plateau" ||
        type === "workpackage" ||
        type === "deliverable" ||
        type === "gap" ||
        type === "businessactor" ||
        type === "representation" ||
        type === "location" ||
        type === "product" ||
        type === "contract" ||
        type === "value" ||
        type === "meaning" ||
        type === "applicationcomponent" ||
        type === "node" ||
        type === "systemsoftware" ||
        type === "artifact" ||
        type === "communicationnetwork" ||
        type === "path" ||
        type === "device" ||
        type === "outcome" ||
        type === "material" ||
        type === "facility" ||
        type === "equipment" ||
        type === "distributionnetwork" ||
        type === "courseofaction" ||
        type === "capability" ||
        type === "resource" ||
        type === "valuestream" ||
        type === "grouping" ||
        type === "group"
    ) {
        return directory + type + EXTENSION;
    }

    if (type === "stakeholder" ||
        type === "businessrole"
    ) {
        return directory + "role" + EXTENSION;
    }

    if (type === "businessobject" ||
        type === "dataobject"
    ) {
        return directory + "object" + EXTENSION;
    }

    if (type === "businessevent" ||
        type === "applicationevent" ||
        type === "technologyevent" ||
        type === "implementationevent"
    ) {
        return directory + "event" + EXTENSION;
    }

    if (type === "businessfunction" ||
        type === "applicationfunction" ||
        type === "infrastructurefunction" ||
        type === "technologyfunction"
    ) {
        return directory + "function" + EXTENSION;
    }

    if (type === "businessprocess" ||
        type === "applicationprocess" ||
        type === "technologyprocess"
    ) {
        return directory + "process" + EXTENSION;
    }

    if (type === "businessservice" ||
        type === "applicationservice" ||
        type === "infrastructureservice" ||
        type === "technologyservice"
    ) {
        return directory + "domainservice" + EXTENSION;
    }

    if (type === "businessinterface" ||
        type === "applicationinterface" ||
        type === "infrastructureinterface" ||
        type === "technologyinterface"
    ) {
        return directory + "interface" + EXTENSION;
    }

    if (type === "businesscollaboration" ||
        type === "applicationcollaboration" ||
        type === "technologycollaboration"
    ) {
        return directory + "collaboration" + EXTENSION;
    }

    if (type === "businessinteraction" ||
        type === "applicationinteraction" ||
        type === "technologyinteraction"
    ) {
        return directory + "interaction" + EXTENSION;
    }

    return "";
};