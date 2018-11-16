const { URL } = require('url');
const request = require('request');
// require('request-debug')(request);

// Returns an array of routes for two coordinate points
exports.fetchRoute = (apiKey, points) => {
    return new Promise((resolve, reject) => {
        let apiEndpoint = new URL('https://api.openrouteservice.org/directions');
        let queryStrings = {
            api_key:            apiKey,
            coordinates:        points[0] + '|' + points[1],
            profile:            'driving-car',
            geometry_format:    'polyline',
            instructions:       'false'
        };
        let options = {
            method: 'GET',
            url:    apiEndpoint,
            qs:     queryStrings,
            json:   true
        };

        request(options, (err, response, body) => {
            if (err) reject(err);

            try {
                resolve(body.routes);
            }
            catch (err) {
                reject(err);
            }
        });
    });
};

// Returns Points of Interest around a given polyline
exports.fetchPointsOfInterest = (polyline, radius, pointsOfInterest) => {
    return new Promise((resolve, reject) => {
        let apiEndpoint = new URL('https://overpass-api.de/api/interpreter');
        // let overpassQuery = `[out:json][timeout:60];node["amenity"](around:${radius},${polyline});out;`;
        // let overpassQuery = `[out:json][timeout:60];(node["amenity"](around:${radius},${polyline});way["amenity"](around:${radius},${polyline});relation["amenity"](around:${radius},${polyline}));out;`;
        let overpassQuery = '[out:json][timeout:180];(';

        for (let category in pointsOfInterest) {
            for (let key in pointsOfInterest[category]) {
                for (let tag of pointsOfInterest[category][key]) {
                    overpassQuery += 'node["' + key + '"="' + tag + '"](around:' + radius + ',' + polyline + ');';
                }
            }
        }

        overpassQuery += ');out;'

        let options = {
            method:     'POST',
            url:        apiEndpoint,
            headers: {
                'Accept':       'application/json',
                'Content-Type': 'text/plain'
            },
            encoding:   'utf8',
            body:       overpassQuery
        };

        request(options, (err, response, body) => {
            if (err) reject(err);
            resolve(body);
        });
    });
};