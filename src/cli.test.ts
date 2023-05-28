import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

describe("CLI", () => {
    const inputFilePath = path.resolve(__dirname, "..", "test/input.json");

    beforeAll(() => {
        // Create a sample input file
        const inputData = [
            { lat: 10, lng: 20 },
            { lat: 30, lng: 40 },
            { lat: 50, lng: 60 },
        ];
        fs.writeFileSync(inputFilePath, JSON.stringify(inputData, null, 2));
    });

    afterAll(() => {
        // Clean up the created files
        fs.unlinkSync(inputFilePath);
    });

    it("should rank points along a bearing line and output the sorted data", () => {
        const start = "10,20";
        const end = "50,60";
        const distanceWeight = "0.6";
        const bearingWeight = "0.4";
        const threshold = "45";

        const result = spawnSync(
            "node",
            [
                "./dist/cli.js",
                "-i",
                inputFilePath,
                "-s",
                start,
                "-e",
                end,
                "-dw",
                distanceWeight,
                "-bw",
                bearingWeight,
                "-t",
                threshold,
            ],
            { encoding: "utf-8" }
        );

        // Verify the output
        const outputData = JSON.parse(result.stdout);
        const length = outputData.length;
        const isArray = Array.isArray(outputData);
        const exitCode = result.status;

        expect(length).toBe(3);
        expect(isArray).toBe(true);
        expect(exitCode).toBe(0);
    });
});
