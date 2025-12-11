// import { readFileSync } from 'fs';
// import * as shapefile from 'shapefile';
// import * as turf from '@turf/turf';
// import * as PriorityQueue from 'js-priority-queue';

// let roadData: any[] = [];

// // Load the shapefile during initialization
// (async function loadShapefile() {
//     const shapefilePath = 'src/common/YE_osm_roads_lines_20230523.shp'; // Corrected path format
//     try {
//         const source = await shapefile.open(shapefilePath);
//         console.log(source, "sourcesourcesource")
//         while (true) {
//             const feature = await source.read();
//             if (feature.done) break;
//             roadData.push(feature.value);
//         }
//         console.log('Shapefile loaded successfully');
//     } catch (error) {
//         console.error('Failed to load shapefile', error);
//     }
// })();

// function calculateDistanceBetweenPoints(lat1: number, lon1: number, lat2: number, lon2: number): number {
//     const point1 = turf.point([lon1, lat1]);
//     const point2 = turf.point([lon2, lat2]);
//     return turf.distance(point1, point2, { units: 'kilometers' });
// }

// // Helper to format distance (in meters) into a readable format
// function formatDistance(distance: number): any {
//     if (distance >= 1000) {
//         return `${(distance / 1000).toFixed(2)} km`;  // Convert to kilometers if distance is greater than 1000 meters
//     } else {
//         return `${distance.toFixed(0)} m`;  // Else display in meters
//     }
// }

// // Helper to format duration (in seconds) into hours and minutes
// function formatDuration(duration: number): any {
//     const hours = Math.floor(duration / 3600); // Get total hours
//     const minutes = Math.floor((duration % 3600) / 60); // Get remaining minutes
//     const seconds = Math.floor(duration % 60); // Get remaining seconds

//     // Format the duration as HH:mm:ss
//     return `${hours}h ${minutes}m ${seconds}s`;
// }

// // Routing logic using shapefile data
// async function calculateShortestPath(start: [number, number], end: [number, number]): Promise<{ distance: string; duration: string }> {
//     const graph = buildGraph(roadData);
//     const result = dijkstra(graph, start, end);
//     if (!result) throw new Error('No route found');

//     const totalDistance = result.distance; // in kilometers
//     const averageSpeed = 40; // Average speed in km/h (adjust as needed)
//     const totalDuration = (totalDistance / averageSpeed) * 3600; // in seconds

//     return {
//         distance: formatDistance(totalDistance * 1000), // in meters
//         duration: formatDuration(totalDuration), // in HH:mm:ss
//     };
// }

// // Build graph from shapefile data
// function buildGraph(data: any[]): any {
//     const graph: any = {};
//     data.forEach((road) => {
//         const { geometry, properties } = road;
//         if (geometry.type === 'LineString') {
//             const coords = geometry.coordinates;
//             for (let i = 0; i < coords.length - 1; i++) {
//                 const start = coords[i];
//                 const end = coords[i + 1];
//                 const distance = calculateDistanceBetweenPoints(start[1], start[0], end[1], end[0]);
//                 graph[start] = graph[start] || {};
//                 graph[end] = graph[end] || {};
//                 graph[start][end] = distance;
//                 graph[end][start] = distance;
//             }
//         }
//     });
//     return graph;
// }

// // Dijkstra's algorithm for shortest path
// function dijkstra(graph: any, start: [number, number], end: [number, number]): any {
//     const queue = new PriorityQueue({ comparator: (a: any, b: any) => a.cost - b.cost });
//     const costs: any = {};
//     const visited: any = {};
//     const previous: any = {};

//     // Convert start and end coordinates to strings for use as keys
//     const startKey = start.join(',');
//     const endKey = end.join(',');

//     queue.queue({ node: startKey, cost: 0 });
//     costs[startKey] = 0;

//     while (queue.length > 0) {
//         const current = queue.dequeue();
//         const currentNode = current.node;

//         if (visited[currentNode]) continue;
//         visited[currentNode] = true;

//         if (currentNode === endKey) {
//             let distance = costs[currentNode];
//             return { distance };
//         }

//         const neighbors = graph[currentNode];
//         for (const neighbor in neighbors) {
//             const newCost = costs[currentNode] + neighbors[neighbor];
//             if (newCost < (costs[neighbor] || Infinity)) {
//                 costs[neighbor] = newCost;
//                 previous[neighbor] = currentNode;
//                 queue.queue({ node: neighbor, cost: newCost });
//             }
//         }
//     }

//     return null; // No path found
// }

// // Main route calculation function
// async function getRouteInfo(start: string, end: string): Promise<{ distance: any; duration: any }> {
//     const [startLon, startLat] = start.split(',').map(parseFloat);
//     const [endLon, endLat] = end.split(',').map(parseFloat);

//     return calculateShortestPath([startLon, startLat], [endLon, endLat]);
// }

// // Function to calculate distance and timing for multiple nearby locations
// async function calculateForNearbyLocations(start: string, nearbyLocations: string[]): Promise<void> {
//     const [startLon, startLat] = start.split(',').map(parseFloat);

//     for (const location of nearbyLocations) {
//         const [endLon, endLat] = location.split(',').map(parseFloat);
//         const { distance, duration } = await getRouteInfo(start, location);
//         console.log(`To location ${location}:`);
//         console.log(`Distance: ${distance}`);
//         console.log(`Duration: ${duration}`);
//         console.log('---');
//     }
// }

// // Example static start location and nearby locations
// const startLocation = "40.7128,-74.0060"; // Example: New York City (Lat, Lon)
// const nearbyLocations = [
//     "40.730610,-73.935242", // Example nearby location 1 (Brooklyn, NY)
//     "40.7580,-73.9855",     // Example nearby location 2 (Times Square, NY)
//     "40.748817,-73.985428"  // Example nearby location 3 (Empire State Building, NY)
// ];

// // Call function to calculate and log results
// calculateForNearbyLocations(startLocation, nearbyLocations);

// // Export all functions
// export { calculateDistanceBetweenPoints, calculateShortestPath, buildGraph, formatDistance, formatDuration, dijkstra, getRouteInfo, roadData };
