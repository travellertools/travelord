export const BEARING_DIFF_THRESHOLD = 45; // Adjust the bearing difference threshold as per your preference
export const DISTANCE_WEIGHT = 0.6; // Weight for distance from Start
export const BEARING_WEIGHT = 0.4; // Weight for bearing difference

export interface Coordinates {
    lat: number;
    lng: number;
}

/**
 * Normalizes a value between a minimum and maximum range.
 * @param {number} value - The value to normalize.
 * @param {number} min - The minimum value of the range.
 * @param {number} max - The maximum value of the range.
 * @returns {number} - The normalized value.
 */
export const normalize =
    (min: number, max: number) =>
    (value: number): number =>
        (value - min) / (max - min);

/**
 * Converts degrees to radians.
 * @param {number} deg - The value in degrees.
 * @returns {number} - The value in radians.
 */
export const deg2rad = (deg: number): number => deg * (Math.PI / 180);

/**
 * Calculates the distance between two coordinates on Earth.
 * @param {Coordinates} A - first coordinate.
 * @param {Coordinates} B - second coordinate.
 * @returns {number} - The distance between the coordinates in kilometers.
 */
export const calculateDistance = (A: Coordinates, B: Coordinates): number => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(B.lat - A.lat);
    const dLng = deg2rad(B.lng - A.lng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(A.lat)) *
            Math.cos(deg2rad(B.lat)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
};

/**
 * Calculates the bearing between two coordinates on Earth.
 * @param {Coordinates} A - first coordinate.
 * @param {Coordinates} B - second coordinate.
 * @returns {number} - The bearing between the coordinates in degrees.
 */
export const calculateBearing = (A: Coordinates, B: Coordinates): number => {
    const dLng = deg2rad(B.lng - A.lng);
    const y = Math.sin(dLng) * Math.cos(deg2rad(B.lat));
    const x =
        Math.cos(deg2rad(A.lat)) * Math.sin(deg2rad(B.lat)) -
        Math.sin(deg2rad(A.lat)) * Math.cos(deg2rad(B.lat)) * Math.cos(dLng);
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
};

/**
 * Calculates the difference between two bearings.
 * @param {number} bearing1 - The first bearing in degrees.
 * @param {number} bearing2 - The second bearing in degrees.
 * @returns {number} - The difference between the bearings in degrees.
 */
export const calculateBearingDiff = (
    bearingA: number,
    bearingB: number
): number => {
    const diff = Math.abs(bearingA - bearingB);
    return diff > 180 ? 360 - diff : diff;
};

/**
 * Filters an array of coordinates based on their bearing difference with the line formed by the start and end coordinates.
 * @param {Coordinates} start - The start coordinate.
 * @param {Coordinates} end - The end coordinate.
 * @param {Coordinates[]} points - The array of coordinates to filter.
 * @param {number[]} threshold - The bearing difference threshold. (default: 45)
 * @returns {Coordinates[]} - The filtered array of coordinates.
 */
export const filterPoints = (
    start: Coordinates,
    end: Coordinates,
    points: Coordinates[],
    threshold = BEARING_DIFF_THRESHOLD
): Coordinates[] => {
    const travelBearing = calculateBearing(start, end);
    return points.filter((point) => {
        const bearing = calculateBearing(start, point);
        const bearingDiff = calculateBearingDiff(bearing, travelBearing);
        return bearingDiff <= threshold;
    });
};

/**
 * Calculates the minimum and maximum values for distance and bearing difference in an array of points.
 * @param {Coordinates} start - The start coordinate.
 * @param {Coordinates} end - The end coordinate.
 * @param {Coordinates[]} points - The array of coordinates.
 * @returns {object} - An object containing the minimum and maximum values for distance and bearing difference.
 */
export const calculateMinMaxValues = (
    start: Coordinates,
    end: Coordinates,
    points: Coordinates[]
): {
    minDistance: number;
    maxDistance: number;
    minBearingDiff: number;
    maxBearingDiff: number;
} => {
    let minDistance = Infinity;
    let maxDistance = -Infinity;
    let minBearingDiff = Infinity;
    let maxBearingDiff = -Infinity;

    const travelBearing = calculateBearing(start, end);

    points.forEach((point) => {
        const bearingDiff = calculateBearingDiff(
            calculateBearing(start, point),
            travelBearing
        );
        const distanceFromStart = calculateDistance(start, point);
        if (distanceFromStart < minDistance) minDistance = distanceFromStart;
        if (distanceFromStart > maxDistance) maxDistance = distanceFromStart;
        if (bearingDiff < minBearingDiff) minBearingDiff = bearingDiff;
        if (bearingDiff > maxBearingDiff) maxBearingDiff = bearingDiff;
    });

    return {
        minDistance,
        maxDistance,
        minBearingDiff,
        maxBearingDiff,
    };
};

/**
 * Sorts an array of coordinates based on their distance from the start coordinates,
 * as well as the bearing difference with the line formed by the start and end coordinates.
 * @param {Coordinates} start - The start coordinate.
 * @param {Coordinates} end - The end coordinate.
 * @param {Coordinates[]} points - The array of coordinates to sort.
 * @param {number} distanceWeight - The weight for distance calculation (default: 0.6).
 * @param {number} bearingWeight - The weight for bearing difference calculation (default: 0.4).
 * @returns {Coordinates[]} - The sorted array of coordinates.
 */
export const sortPoints = (
    start: Coordinates,
    end: Coordinates,
    points: Coordinates[],
    distanceWeight = DISTANCE_WEIGHT,
    bearingWeight = BEARING_WEIGHT
): Coordinates[] => {
    const { minDistance, maxDistance, minBearingDiff, maxBearingDiff } =
        calculateMinMaxValues(start, end, points);
    const travelBearing = calculateBearing(start, end);
    const normBearing = normalize(minBearingDiff, maxBearingDiff);
    const normDistance = normalize(minDistance, maxDistance);

    const score = (point: Coordinates): number => {
        const bearingDiff = calculateBearingDiff(
            calculateBearing(start, point),
            travelBearing
        );
        const distanceFromStart = calculateDistance(start, point);
        return (
            distanceWeight * normDistance(distanceFromStart) +
            bearingWeight * normBearing(bearingDiff)
        );
    };

    return points.sort((a, b) => score(a) - score(b));
};

/**
 * Ranks points along a bearing line based on their distance from the start and end coordinates,
 * as well as the bearing difference with the line formed by the start and end coordinates.
 *
 * @param {Coordinates} start - The start coordinate.
 * @param {Coordinates} end - The end coordinate.
 * @param {Coordinates[]} points - The array of coordinates to sort.
 * @param {number} distanceWeight - The weight for distance calculation (default: 0.6).
 * @param {number} bearingWeight - The weight for bearing difference calculation (default: 0.4).
 * @param {number} threshold - The bearing difference threshold.(default: 45)
 * @returns {Coordinates[]} - The sorted array of coordinates.
 */
export const rankPointsAlongBearing = (
    start: Coordinates,
    end: Coordinates,
    points: Coordinates[],
    distanceWeight = DISTANCE_WEIGHT,
    bearingWeight = BEARING_WEIGHT,
    threshold = BEARING_DIFF_THRESHOLD
): Coordinates[] =>
    sortPoints(
        start,
        end,
        filterPoints(start, end, points, threshold),
        distanceWeight,
        bearingWeight
    );
