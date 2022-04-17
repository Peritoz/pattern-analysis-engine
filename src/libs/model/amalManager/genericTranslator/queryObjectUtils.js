module.exports = {
    findAlias(aliasList, key) {
        for (let i = 0; i < aliasList.length; i++) {
            if (aliasList[i].alias === key)
                return aliasList[i];
        }

        return null;
    },

    lookPrior(naiveChain, tripleIndex) {
        if (tripleIndex - 3 >= 0) {
            return { elementA: naiveChain[tripleIndex - 3], relationship: naiveChain[tripleIndex - 2], elementB: naiveChain[tripleIndex + -1] };
        } else {
            return null;
        }
    },

    lookNext(naiveChain, tripleIndex) {
        if (tripleIndex + 3 < naiveChain.length) {
            return { elementA: naiveChain[tripleIndex + 1], relationship: naiveChain[tripleIndex + 2], elementB: naiveChain[tripleIndex + +3] };
        } else {
            return null;
        }
    },

    isBondedBidirectional(relationship) {
        return (relationship.source === "BONDED_LEFT" && relationship.target === "BONDED_RIGHT") ||
            (relationship.source === "BONDED_BASE" && relationship.target === "BONDED_BASE");
    },

    isPathRelationship(relationship) {
        return (relationship.source === "PATH_LEFT" && relationship.target === "PATH_BASE") ||
            (relationship.source === "PATH_BASE" && relationship.target === "PATH_RIGHT");
    },

    isBondedRelationship(relationship) {
        return (relationship.source === "BONDED_LEFT" && relationship.target === "BONDED_BASE") ||
            (relationship.source === "BONDED_BASE" && relationship.target === "BONDED_RIGHT");
    }
};