exports.removeDuplicatedPaths = (elementPaths, relationshipPaths) => {
    let ids = [];
    let result = {paths: [], relationships: []};
    let pathsWithId = elementPaths.map((path, i) => {
        let id = "";

        for (let j = 0; j < path.length; j++) {
            id += path[j].identifier.slice(-4);
        }

        ids.push(id);

        return {elements: path, relationships: relationshipPaths[i], pathid: id};
    });

    let uniqueIds = [...new Set(ids)];

    let uniquePaths = uniqueIds.map(pathid => {
        let path = pathsWithId.find(a => a.pathid === pathid);

        return {elements: path.elements, relationships: path.relationships};
    });

    uniquePaths.forEach((path) => {
        result.paths.push(path.elements);

        // Avoid undefined assignment for elements without relationship (This case is known to happen when the query search for Elements, not patterns)
        // TODO: Test AMAL justification
        if (path.relationships !== undefined) {
            result.relationships.push(path.relationships);
        }
    });

    return result;
};