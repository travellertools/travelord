import {
    BEARING_WEIGHT,
    DISTANCE_WEIGHT,
    calculateBearing,
    calculateBearingDiff,
    calculateDistance,
    deg2rad,
    filterPoints,
    normalize,
    rankPointsAlongBearing,
    sortPoints,
} from "./lib";

describe("normalize", () => {
    it("should normalize a value within the specified range", () => {
        const min = 0;
        const max = 100;
        const normalizedValue = normalize(min, max)(50);
        expect(normalizedValue).toBe(0.5);
    });

    it("should normalize a value at the lower bound of the range", () => {
        const min = 0;
        const max = 100;
        const normalizedValue = normalize(min, max)(0);
        expect(normalizedValue).toBe(0);
    });

    it("should normalize a value at the upper bound of the range", () => {
        const min = 0;
        const max = 100;
        const normalizedValue = normalize(min, max)(100);
        expect(normalizedValue).toBe(1);
    });

    it("should normalize a value outside the range", () => {
        const min = 0;
        const max = 100;
        const normalizedValue = normalize(min, max)(150);
        expect(normalizedValue).toBe(1.5);
    });

    it("should normalize a negative value within the specified range", () => {
        const min = -50;
        const max = 50;
        const normalizedValue = normalize(min, max)(-25);
        expect(normalizedValue).toBe(0.25);
    });
});

describe("deg2rad", () => {
    it("should convert degrees to radians", () => {
        const degrees = 180;
        const radians = deg2rad(degrees);
        expect(radians).toBe(Math.PI);
    });

    it("should convert 0 degrees to 0 radians", () => {
        const degrees = 0;
        const radians = deg2rad(degrees);
        expect(radians).toBe(0);
    });

    it("should convert positive degrees to positive radians", () => {
        const degrees = 45;
        const radians = deg2rad(degrees);
        expect(radians).toBeCloseTo(0.7853981633974483); // Approximately pi/4
    });

    it("should convert negative degrees to negative radians", () => {
        const degrees = -90;
        const radians = deg2rad(degrees);
        expect(radians).toBeCloseTo(-1.5707963267948966); // Approximately -pi/2
    });
});

describe("calculateDistance", () => {
    it("should calculate the distance between two coordinates", () => {
        const coordinateA = { lat: 52.520008, lng: 13.404954 }; // Berlin, Germany
        const coordinateB = { lat: 45.421532, lng: -75.699642 }; // Ottawa, Canada
        const distance = calculateDistance(coordinateA, coordinateB);
        expect(distance).toBeCloseTo(6260, 2); // Approximately 6260.68 km
    });

    it("should calculate the distance between two identical coordinates as 0", () => {
        const coordinateA = { lat: 40.712776, lng: -74.005974 }; // New York City, USA
        const coordinateB = { lat: 40.712776, lng: -74.005974 }; // New York City, USA
        const distance = calculateDistance(coordinateA, coordinateB);
        expect(distance).toBe(0);
    });

    it("should calculate the distance between two coordinates in the same location as 0", () => {
        const coordinateA = { lat: 51.5074, lng: -0.1278 }; // London, UK
        const coordinateB = { lat: 51.5074, lng: -0.1278 }; // London, UK
        const distance = calculateDistance(coordinateA, coordinateB);
        expect(distance).toBe(0);
    });

    it("should calculate the distance between coordinates on opposite poles of the Earth", () => {
        const coordinateA = { lat: 90, lng: 0 }; // North Pole
        const coordinateB = { lat: -90, lng: 0 }; // South Pole
        const distance = calculateDistance(coordinateA, coordinateB);
        expect(distance).toBeCloseTo(20015.09, 2); // Approximately 20015.09 km
    });
});

describe("calculateBearing", () => {
    it("should calculate the bearing between two coordinates", () => {
        const coordinateA = { lat: 52.520008, lng: 13.404954 }; // Berlin, Germany
        const coordinateB = { lat: 45.421532, lng: -75.699642 }; // Ottawa, Canada
        const bearing = calculateBearing(coordinateA, coordinateB);
        expect(bearing).toBeCloseTo(309.89, 2); // Approximately 309.89 degrees
    });

    it("should calculate the bearing between two identical coordinates as 0", () => {
        const coordinateA = { lat: 40.712776, lng: -74.005974 }; // New York City, USA
        const coordinateB = { lat: 40.712776, lng: -74.005974 }; // New York City, USA
        const bearing = calculateBearing(coordinateA, coordinateB);
        expect(bearing).toBe(0);
    });

    it("should calculate the bearing between two coordinates in the same location as 0", () => {
        const coordinateA = { lat: 51.5074, lng: -0.1278 }; // London, UK
        const coordinateB = { lat: 51.5074, lng: -0.1278 }; // London, UK
        const bearing = calculateBearing(coordinateA, coordinateB);
        expect(bearing).toBe(0);
    });

    it("should calculate the bearing between coordinates on opposite sides of the Earth as 180", () => {
        const coordinateA = { lat: 0, lng: 0 }; // Prime Meridian
        const coordinateB = { lat: 0, lng: 180 }; // 180° Longitude
        const bearing = calculateBearing(coordinateA, coordinateB);
        expect(bearing).toBe(180);
    });
});

describe("calculateBearingDiff", () => {
    it("should calculate the difference between two bearings less than 180 degrees", () => {
        const bearing1 = 45;
        const bearing2 = 90;
        const diff = calculateBearingDiff(bearing1, bearing2);
        expect(diff).toBe(45);
    });

    it("should calculate the difference between two bearings equal to 180 degrees", () => {
        const bearing1 = 0;
        const bearing2 = 180;
        const diff = calculateBearingDiff(bearing1, bearing2);
        expect(diff).toBe(180);
    });

    it("should calculate the difference between two bearings greater than 180 degrees", () => {
        const bearing1 = 350;
        const bearing2 = 20;
        const diff = calculateBearingDiff(bearing1, bearing2);
        expect(diff).toBe(30);
    });

    it("should calculate the difference between two identical bearings as 0", () => {
        const bearing1 = 120;
        const bearing2 = 120;
        const diff = calculateBearingDiff(bearing1, bearing2);
        expect(diff).toBe(0);
    });

    it("should calculate the difference between two opposite bearings as 180", () => {
        const bearing1 = 270;
        const bearing2 = 90;
        const diff = calculateBearingDiff(bearing1, bearing2);
        expect(diff).toBe(180);
    });
});

describe("filterPoints", () => {
    const start = { lat: 40.7128, lng: -74.006 };
    const end = { lat: 34.0522, lng: -118.2437 };

    const points = [
        { lat: 41.8781, lng: -87.6298 },
        { lat: 39.9526, lng: -75.1652 },
        { lat: 37.7749, lng: -122.4194 },
        { lat: 29.7604, lng: -95.3698 },
        { lat: 32.7767, lng: -96.797 },
    ];

    const threshold = 30;

    it("should filter points based on bearing difference within the threshold", () => {
        const filteredPoints = filterPoints(start, end, points, threshold);
        expect(filteredPoints).toEqual([
            { lat: 41.8781, lng: -87.6298 },
            { lat: 37.7749, lng: -122.4194 },
            { lat: 29.7604, lng: -95.3698 },
        ]);
    });

    it("should filter all points if threshold is set to 0", () => {
        const filteredPoints = filterPoints(start, end, points, 0);
        expect(filteredPoints).toEqual([]);
    });

    it("should filter no points if threshold is set to a large value", () => {
        const filteredPoints = filterPoints(start, end, points, 100);
        expect(filteredPoints).toEqual(points);
    });

    it("should filter points with the default threshold if no threshold is provided", () => {
        const filteredPoints = filterPoints(start, end, points);
        expect(filteredPoints).toEqual([
            { lat: 41.8781, lng: -87.6298 },
            { lat: 37.7749, lng: -122.4194 },
            { lat: 29.7604, lng: -95.3698 },
        ]);
    });
});

describe("sortPoints", () => {
    const start = { lat: 40.7128, lng: -74.006 };
    const end = { lat: 34.0522, lng: -118.2437 };

    const points = [
        { lat: 41.8781, lng: -87.6298 },
        { lat: 39.9526, lng: -75.1652 },
        { lat: 37.7749, lng: -122.4194 },
        { lat: 29.7604, lng: -95.3698 },
        { lat: 32.7767, lng: -96.797 },
    ];

    const distanceWeight = 1;
    const bearingWeight = 1;

    it("should sort points based on distance and bearing difference with default weights", () => {
        const sortedPoints = sortPoints(start, end, points);
        expect(sortedPoints).toEqual([
            { lat: 29.7604, lng: -95.3698 },
            { lat: 41.8781, lng: -87.6298 },
            { lat: 32.7767, lng: -96.797 },
            { lat: 39.9526, lng: -75.1652 },
            { lat: 37.7749, lng: -122.4194 },
        ]);
    });

    it("should sort points based on distance and bearing difference with custom weights", () => {
        const sortedPoints = sortPoints(
            start,
            end,
            points,
            distanceWeight,
            bearingWeight
        );
        expect(sortedPoints).toEqual([
            { lat: 29.7604, lng: -95.3698 },
            { lat: 41.8781, lng: -87.6298 },
            { lat: 32.7767, lng: -96.797 },
            { lat: 39.9526, lng: -75.1652 },
            { lat: 37.7749, lng: -122.4194 },
        ]);
    });
});

describe("rankPointsAlongBearing", () => {
    const start = { lat: 40.7128, lng: -74.006 };
    const end = { lat: 34.0522, lng: -118.2437 };

    const points = [
        { lat: 41.8781, lng: -87.6298 },
        { lat: 39.9526, lng: -75.1652 },
        { lat: 37.7749, lng: -122.4194 },
        { lat: 29.7604, lng: -95.3698 },
        { lat: 32.7767, lng: -96.797 },
    ];

    it("should rank points along the bearing line based on distance and bearing difference", () => {
        const rankedPoints = rankPointsAlongBearing(start, end, points);
        expect(rankedPoints).toEqual([
            { lat: 29.7604, lng: -95.3698 },
            { lat: 41.8781, lng: -87.6298 },
            { lat: 32.7767, lng: -96.797 },
            { lat: 39.9526, lng: -75.1652 },
            { lat: 37.7749, lng: -122.4194 },
        ]);
    });
});

describe("rankPointsAlongBearing", () => {
    const start = { lat: 0, lng: 0 };
    const end = { lat: 10, lng: 10 };
    const points = [
        { lat: 1, lng: 1 },
        { lat: 2, lng: 2 },
        { lat: 3, lng: 3 },
        { lat: 4, lng: 4 },
    ];

    it("should rank points along the bearing line", () => {
        const rankedPoints = rankPointsAlongBearing(start, end, points);
        expect(rankedPoints).toEqual([
            { lat: 1, lng: 1 },
            { lat: 2, lng: 2 },
            { lat: 3, lng: 3 },
            { lat: 4, lng: 4 },
        ]);
    });

    it("should apply distance weight and bearing weight", () => {
        const distanceWeight = 0.6;
        const bearingWeight = 0.4;
        const rankedPoints = rankPointsAlongBearing(
            start,
            end,
            points,
            distanceWeight,
            bearingWeight
        );
        expect(rankedPoints).toEqual([
            { lat: 1, lng: 1 },
            { lat: 2, lng: 2 },
            { lat: 3, lng: 3 },
            { lat: 4, lng: 4 },
        ]);
    });

    it("should respect the bearing difference threshold", () => {
        const threshold = 45;
        const rankedPoints = rankPointsAlongBearing(
            start,
            end,
            points,
            DISTANCE_WEIGHT,
            BEARING_WEIGHT,
            threshold
        );
        expect(rankedPoints).toEqual([
            { lat: 1, lng: 1 },
            { lat: 2, lng: 2 },
            { lat: 3, lng: 3 },
            { lat: 4, lng: 4 },
        ]);
    });
});
