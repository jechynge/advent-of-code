import axios from 'axios';
import { existsSync } from 'node:fs';
import { open, writeFile } from 'node:fs/promises';


export default async function FetchInput(year, day) {

    const inputFileLocation = `./${year}/input/${day}.txt`;

    // check for an existing file first
    if(existsSync(inputFileLocation)) {
        const file = await open(inputFileLocation);

        const input = await file.readFile('ascii');

        file.close();

        return input;
    }

    const sessionFile = await open(`./session.txt`);

    const session = await sessionFile.readFile('ascii');

    sessionFile.close();
    
    if(!session) {
        throw new Error('Session file was not found or is invalid!');
    }

    // Remove any leading zeroes
    const dayNumber = parseInt(day).toString();
      
    const response = await axios.get(`https://adventofcode.com/${year}/day/${dayNumber}/input`, {
        withCredentials: true,
        headers: {
            cookie: `session=${session}`
        }
    });

    if(response.status !== 200) {
        throw new Error(`Received non-success response [${response.status}] and error ${response.statusText}`);
    }

    const input = response.data.trim();

    await writeFile(inputFileLocation, input);

    return input;
};