import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const readings = getLinesFromInput(input).map(reading => reading.split('').map(bit => parseInt(bit)));

    const sums = new Array(readings[0].length).fill(0);

    readings.forEach(reading => reading.forEach((bit, i) => sums[i] += bit));

    const gamma_string = sums.map(sum => sum > readings.length / 2 ? '1' : '0').join('');
    const epsilon_string = sums.map(sum => sum > readings.length / 2 ? '0' : '1').join('');

    const gamma_int = parseInt(gamma_string, 2);
    const epsilon_int = parseInt(epsilon_string, 2);

    return { answer: gamma_int * epsilon_int };

}


////////////
// Part 2 //
////////////

const getMostCommonBits = (readings) => {
    const sums = new Array(readings[0].length).fill(0);

    readings.forEach(reading => reading.forEach((bit, i) => sums[i] += bit));

    return sums.map(sum => sum >= readings.length / 2 ? 1 : 0);
};


export async function secondPuzzle(input) {

    const readings = getLinesFromInput(input).map(reading => reading.split('').map(bit => parseInt(bit)));

    const most_common_bits = getMostCommonBits(readings);

    let possible_oxygen_ratings = [...readings];
    let current_oxygen_common_bits = [...most_common_bits];

    for(let i = 0; i < readings[0].length; i++) {

        possible_oxygen_ratings = possible_oxygen_ratings.filter(rating => rating[i] === current_oxygen_common_bits[i]);

        if(possible_oxygen_ratings.length === 1) {
            break;
        }

        current_oxygen_common_bits = getMostCommonBits(possible_oxygen_ratings);

    }

    const oxygen_rating_string = possible_oxygen_ratings[0].join('');

    let possible_co2_ratings = [...readings];
    let current_co2_common_bits = [...most_common_bits];

    for(let i = 0; i < readings[0].length; i++) {

        possible_co2_ratings = possible_co2_ratings.filter(rating => rating[i] !== current_co2_common_bits[i]);

        if(possible_co2_ratings.length === 1) {
            break;
        }

        current_co2_common_bits = getMostCommonBits(possible_co2_ratings);

    }

    const co2_rating_string = possible_co2_ratings[0].join('');

    const oxygen_rating_int = parseInt(oxygen_rating_string, 2);
    const co2_rating_int = parseInt(co2_rating_string, 2);

    return { answer: oxygen_rating_int * co2_rating_int };

}
