#!/usr/bin/env node

import { program } from "commander";
import fs from "fs";
import path from "path";
import { exit } from "process";
import {
    BEARING_DIFF_THRESHOLD,
    BEARING_WEIGHT,
    Coordinates,
    DISTANCE_WEIGHT,
    rankPointsAlongBearing,
} from "./lib";

program
    .name("travelord")
    .version("0.1.1")
    .description("CLI tool to rank points along a bearing line")
    .requiredOption(
        "-i, --input <file>",
        "Input JSON file containing points data"
    )
    .requiredOption(
        "-s, --start <coordinates>",
        "Start coordinate in the format lat,lng"
    )
    .requiredOption(
        "-e, --end <coordinates>",
        "End coordinate in the format lat,lng"
    )
    .option(
        "-dw, --distance-weight <value>",
        `Weight for distance calculation (default: ${DISTANCE_WEIGHT})`,
        parseFloat
    )
    .option(
        "-bw, --bearing-weight <value>",
        `Weight for bearing difference calculation (default: ${BEARING_WEIGHT})`,
        parseFloat
    )
    .option(
        "-t, --threshold <value>",
        `Bearing difference threshold (default: ${BEARING_DIFF_THRESHOLD})`,
        parseFloat
    )
    .option("-o, --output <file>", "Output file to store the sorted data")
    .parse();

const options = program.opts();

// Load input data from the JSON file
const inputFile = path.resolve(options["input"]);
const points: Coordinates[] = JSON.parse(fs.readFileSync(inputFile, "utf8"));

const distanceWeight = options["distanceWeight"] || DISTANCE_WEIGHT;
const bearingWeight = options["bearingWeight"] || BEARING_WEIGHT;
const threshold = options["threshold"] || BEARING_DIFF_THRESHOLD;

// Extract start and end coordinates from the provided flags
const [startLat, startLng] = options["start"].split(",").map(parseFloat);
const [endLat, endLng] = options["end"].split(",").map(parseFloat);

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
if (options["output"]) {
    const outputFile = path.resolve(options["output"]);
    fs.writeFileSync(outputFile, JSON.stringify(rankedPoints, null, 2));
    console.log(`data written to ${outputFile}`);
    console.log(`length was ${points.length}, now is ${rankedPoints.length}`);
} else {
    // Output the sorted points to the console
    console.log(JSON.stringify(rankedPoints));
}

exit(0);
