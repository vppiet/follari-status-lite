const { URL } = require('url');
const request = require('request');

// Returns an array of routes for two or more coordinate points
exports.fetchRoute = (apiKey, point1, point2) => {
    return new Promise((resolve, reject) => {
        let apiEndpoint = new URL('https://api.openrouteservice.org/directions');
        let queryStrings = {
            api_key:            apiKey,
            coordinates:        point1 + '|' + point2,
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