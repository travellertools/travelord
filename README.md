# travelord.ts

Travelord is a simple library written in Typescript that provides functions for ranking points of interest along a path of travel.
It offers both a library interface for programmatic use and a command-line interface (CLI) for easy integration into your projects.

This library is almost entirely written using ChatGPT. including this README!

## Features

-   Rank points along a bearing line based on their distance and bearing difference.
-   Filter points based on a bearing difference threshold.
-   Sort points based on distance and bearing difference.
-   access to underlying functions

## Why?

I wanted to plan my travel by train across europe, hitting up as many slacklining/highlining communities along the way using data from SlackMap:

-   https://slackmap.com/communities

Many of the the communities in the dataset are actually inactive, and I needed to check each one then leave a message if its been active recently.

This tool is useful for anyone who needs to plan a route given a list of POIs that they would like to visit along the way.

## Documentation

This library is super simple, all the functions contain JSDoc comments and are well typed.

## Installation

To install Travelord, use pnpm, npm or yarn:

`pnpm install travelord`

## CLI Usage

`travelord --start 45.655651,25.6108 --end 52.520008,13.404954 --input data.json --output output.json`

CLI Options

    --start: The start coordinate in the format lat,lng.
    --end: The end coordinate in the format lat,lng.
    --input: The input JSON file containing the array of points.
    --output: The output JSON file to save the sorted points (specify the input file to overwrite). If not provided, the output goes to STDOUT.

## Library Usage

Here's an example of how to use My Package in your JavaScript/TypeScript code:

```javascript
import { rankPointsAlongBearing } from 'travelord';

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

Contributions are welcome! Please refer to the Contributing Guidelines for more information.

## Possible improvements

-   use a dictionary of coordinates and/or google api to accept city names instead of coordinates
-   improve the ranking algorithm or give it more options
-   add support for an iterative ranking process
-   add examples
-   add ci/cd
-   add csv support
-   publish to npm
-   validate the CLI input data

## License

This project is licensed under the MIT License.
