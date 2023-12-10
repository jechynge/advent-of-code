export function* getCharacterGenerator(input) {
    let i = 0;
    const chars = input.split('');

    while(true) {
        yield chars[i];

        i++;

        if(i === chars.length) {
            i = 0;
        }
    }
}