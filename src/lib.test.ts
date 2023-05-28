import {
    BEARING_WEIGHT,
    Coordinates,
    DISTANCE_WEIGHT,
    calculateBearing,
    calculateBearingDiff,
    calculateDistance,
    deg2rad,
    filterPoints,
    normalize,
    rad2deg,
    rankPointsAlongBearing,
    sortPoints,
} from "./lib";

function generateRandomCoordinates(): Coordinates {
    const minLat = -90;
    const maxLat = 90;
    const minLng = -180;
    const maxLng = 180;

    const lat = Math.random() * (maxLat - minLat) + minLat;
    const lng = Math.random() * (maxLng - minLng) + minLng;

    return { lat, lng };
}

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

describe("rad2deg", () => {
    it("should convert 0 radians to 0 degrees", () => {
        const result = rad2deg(0);
        expect(result).toEqual(0);
    });

    it("should convert pi/2 radians to 90 degrees", () => {
        const result = rad2deg(Math.PI / 2);
        expect(result).toEqual(90);
    });

    it("should convert pi radians to 180 degrees", () => {
        const result = rad2deg(Math.PI);
        expect(result).toEqual(180);
    });

    it("should convert 2pi radians to 360 degrees", () => {
        const result = rad2deg(2 * Math.PI);
        expect(result).toEqual(360);
    });

    it("should convert negative radians to negative degrees", () => {
        const result = rad2deg(-Math.PI / 4);
        expect(result).toEqual(-45);
    });
});

describe("calculateDistance", () => {
    it("should calculate the distance between two coordinates", () => {
        const coordinateA = { lat: 52.520008, lng: 13.404954 }; // Berlin, Germany
        const coordinateB = { lat: 45.421532, lng: -75.699642 }; // Ottawa, Canada
        const distance = calculateDistance(coordinateA, coordinateB);
        expect(distance).toBeCloseTo(6128.57, 2); // Approximately 6128.57
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
        expect(bearing).toBeCloseTo(301.18, 2); // Approximately 309.89 degrees
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
        expect(bearing).toBe(90);
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
    const start = generateRandomCoordinates();
    const end = generateRandomCoordinates();
    const points = Array.from({ length: 200 }, () =>
        generateRandomCoordinates()
    );

    it("filters out points that exceed bearing difference and distance threshold", () => {
        const threshold = 45;
        const filteredPoints = filterPoints(start, end, points, threshold);

        filteredPoints.forEach((point) => {
            const bearing = calculateBearing(start, point);
            const bearingDiff = calculateBearingDiff(
                bearing,
                calculateBearing(start, end)
            );
            const distance = calculateDistance(start, point);

            expect(bearingDiff).toBeLessThanOrEqual(threshold);
            expect(distance).toBeLessThanOrEqual(calculateDistance(start, end));
        });
    });

    it("does not filter any points if they are all within the threshold", () => {
        // maximum possible distance between two points on Earth
        const start = { lat: 90, lng: 0 }; // North Pole
        const end = { lat: -90, lng: 0 }; // South Pole
        // maximum possible bearing difference
        const threshold = 180;
        const filteredPoints = filterPoints(start, end, points, threshold);

        expect(filteredPoints).toEqual(points);
    });

    it("returns an empty array if there are no points to filter", () => {
        const filteredPoints = filterPoints(start, end, []);
        expect(filteredPoints).toEqual([]);
    });
});

describe("sortPoints", () => {
    const start = generateRandomCoordinates();
    const end = generateRandomCoordinates();
    const points = Array.from({ length: 200 }, () =>
        generateRandomCoordinates()
    );

    it("should sort points based completely on distance if weighted as such", () => {
        const sortedPoints = sortPoints(start, end, points, 1, 0);
        expect(sortedPoints).toEqual(
            points.sort(
                (a, b) =>
                    calculateDistance(start, a) - calculateDistance(start, b)
            )
        );
    });

    it("should sort points based completely on bearing if weighted as such", () => {
        const sortedPoints = sortPoints(start, end, points, 0, 1);
        const bearing = calculateBearing(start, end);
        expect(sortedPoints).toEqual(
            points.sort(
                (a, b) =>
                    calculateBearingDiff(calculateBearing(start, a), bearing) -
                    calculateBearingDiff(calculateBearing(start, b), bearing)
            )
        );
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
