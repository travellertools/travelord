# travelord

Travelord is a simple library written in Typescript that provides functions for ranking points of interest along a path of travel.
It offers both a library interface for programmatic use and a command-line interface (CLI) for easy integration into your projects.

This library is almost entirely written using ChatGPT. including this README!

## Features

-   Rank points along a bearing line based on their distance and bearing difference.
-   Filter points based on a bearing difference threshold.
-   Sort points based on distance and bearing difference.
-   access to underlying functions

## Why?

I wanted to plan my travel by train across europe, hitting up as many slacklining/highlining communities along the way using data from SlackMap: https://slackmap.com/communities

This tool is useful for anyone who needs to plan a route given a list of POIs that they would like to visit along the way.

## Documentation

This library is super simple, all the functions contain JSDoc comments and are well typed.

## Installation

To install Travelord, use pnpm, npm or yarn:

`npm install travelord`

## CLI Usage

`travelord --input data.json --output output.json`

CLI Options

    --start: The start coordinate in the format lat,lng.
    --end: The end coordinate in the format lat,lng.
    --input: The input JSON file containing the array of points.
    --output: The output JSON file to save the sorted points (specify the input file to overwrite). If not provided, the output goes to STDOUT.

Use `travelord --help` to get a full description

## Library Usage

Here's an example of how to use My Package in your JavaScript/TypeScript code:

```javascript
import { rankPointsAlongBearing } from "travelord";

// Define your start and end coordinates
const start = { lat: 0, lng: 0 };
const end = { lat: 10, lng: 10 };

// Define an array of points
const points = [
    { lat: 2, lng: 2 },
    { lat: 5, lng: 5 },
    { lat: 8, lng: 8 },
];

// Rank the points along the bearing line
const rankedPoints = rankPointsAlongBearing(start, end, points);

console.log(rankedPoints);
```

## Contributing

Contributions are welcome! Please feel free to submit a PR or message me if you need help

## Publish Workflow

-   bump versions in package.json and in cli.ts
-   add to CHANGELOG
-   push to master
-   create a tag and release in github
-   the publish workflow will then publish to npm

## Possible improvements

-   fix lint precommit hook
-   implement automated tagged releases and publish to npm

-   use a dictionary of coordinates and/or google api to accept city names instead of coordinates
-   improve the ranking algorithm or give it more options
-   add support for an iterative ranking process
-   validate the CLI input data
-   add csv support
-   add examples in docs

## License

This project is licensed under the MIT License.
