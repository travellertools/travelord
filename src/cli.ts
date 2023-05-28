#!/usr/bin/env node

import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import {
    BEARING_DIFF_THRESHOLD,
    BEARING_WEIGHT,
    Coordinates,
    DISTANCE_WEIGHT,
    rankPointsAlongBearing,
} from './lib';

interface InputData {
    points: Coordinates[];
}

program
    .name('travelord')
    .version('1.0.0')
    .description('CLI tool to rank points along a bearing line')
    .requiredOption(
        '-i, --input <file>',
        'Input JSON file containing points data'
    )
    .requiredOption(
        '-s, --start <coordinates>',
        'Start coordinate in the format "lat,lng"'
    )
    .requiredOption(
        '-e, --end <coordinates>',
        'End coordinate in the format "lat,lng"'
    )
    .option(
        '-dw, --distance-weight <value>',
        `Weight for distance calculation (default: ${DISTANCE_WEIGHT})`,
        parseFloat
    )
    .option(
        '-bw, --bearing-weight <value>',
        `Weight for bearing difference calculation (default: ${BEARING_WEIGHT})`,
        parseFloat
    )
    .option(
        '-t, --threshold <value>',
        `Bearing difference threshold (default: ${BEARING_DIFF_THRESHOLD})`,
        parseFloat
    )
    .option('-o, --output <file>', 'Output file to store the sorted data')
    .parse(process.argv);

// Load input data from the JSON file
const inputFile = path.resolve(program.input);
const inputData: InputData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

const { points } = inputData;
const distanceWeight = program.distanceWeight || DISTANCE_WEIGHT;
const bearingWeight = program.bearingWeight || BEARING_WEIGHT;
const threshold = program.threshold || BEARING_DIFF_THRESHOLD;

// Extract start and end coordinates from the provided flags
const [startLat, startLng] = program.start.split(',').map(parseFloat);
const [endLat, endLng] = program.end.split(',').map(parseFloat);

const start: Coordinates = { lat: startLat, lng: startLng };
const end: Coordinates = { lat: endLat, lng: endLng };

// Call the rankPointsAlongBearing function with the provided data
const rankedPoints = rankPointsAlongBearing(
    start,
    end,
    points,
    distanceWeight,
    bearingWeight,
    threshold
);

// Write the sorted points to the output file if specified
if (program.output) {
    const outputFile = path.resolve(program.output);
    fs.writeFileSync(
        outputFile,
        JSON.stringify({ points: rankedPoints }, null, 2)
    );
    console.log(`Sorted data written to ${outputFile}`);
} else {
    // Output the sorted points to the console
    console.log(rankedPoints);
}
