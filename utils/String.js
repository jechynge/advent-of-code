export const findAllIndices = (input, searchFor) => {
    if(typeof input !== 'string' && !Array.isArray(input)) {
        throw new Error(`Invalid type for param "input" - expected string or array but got [${typeof input}]`);
    }

    if(typeof searchFor !== 'string') {
        throw new Error(`Invalid type for param "searchFor" - expected string but got [${typeof searchFor}]`);
    }

    if(searchFor.length < 1) {
        throw new Error(`Invalid type value param "searchFor" - must be at least one character.`);
    }

    const indices = [];

    let i = -1;

    while(true) {
        i = input.indexOf(searchFor, i + searchFor.length);

        if(i === -1) {
            return indices;
        }

        indices.push(i);
    }
};