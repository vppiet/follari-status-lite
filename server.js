const config = require('./readConfig');
const apiQueries = require('./apiQueries');
const express = require('express');
const path = require('path');

// Load configs
const configs = config.readConfig('./config.json');
const openRouteServiceApikey = process.env.OPENROUTESERVICEAPIKEY;
const routePoints = [configs.route.pointA, configs.route.pointB];
const pois = configs.pois;

// Fetch route and Points of Interests around route
let route = undefined;
let pointsOfInterest = undefined;

console.log('Fetching route...');
apiQueries.fetchRoute(openRouteServiceApikey, routePoints)
    .then((apiRouteResponse) => {
        try {
            // Copy route to global memory object and use that object
            // to pass route to client with reversed latitudes and longitudes
            // since Leaflet uses reversed coordinates in respect of API response.
            route = [...apiRouteResponse[0].geometry];

            let pointCount = 0;
            for (let point of route) {
                point.reverse();
                pointCount += 1;
            }

            console.log('Route (' + pointCount + ' nodes) fetched successfully');
            return apiRouteResponse[0].geometry.join();
        }
        catch (err) {
            throw new Error(err);
        }
    })
    // If we don't have route, we can't fetch Point of Interests
    .catch((reason) => {
        console.log('Error while fetching route:', reason);
    })
    .then((polyline) => {
        // After receiving route, fetch Point of Interests
        let radius = configs.radius;

        console.log('Fetching points of interest around the route...');
        apiQueries.fetchPointsOfInterest(polyline, radius, pois)
        .then((apiPOIResponse) => {
            // DEBUGGING RESPONSE: SAVE TO FILE
            // let overpassResponse = JSON.parse(apiPOIResponse);
            // fs.writeFileSync('overpassResponse.json', JSON.stringify(overpassResponse));
            try {
                pointsOfInterest = JSON.parse(apiPOIResponse).elements;
                
                // iteration of horror
                for (let category in pois) {
                    for (let point of pointsOfInterest) {
                        for (let key in pois[category]) {
                            if (point['tags'].hasOwnProperty(key)) {
                                for (let tag of pois[category][key]) {
                                    if (point['tags'][key] == tag) point['category'] = category;
                                }
                            }
                        }
                    }
                }
                console.log('Points of interest (' + pointsOfInterest.length + ' nodes) fetched successfully');
            }
            catch(err) {
                throw new Error(err);
            }
        })
        .catch((reason) => {
            console.log('Error while fetching points of interest:', reason);
        });
    });

// Initialize Express
const app = express();

app.use(express.static('public'));

app.get('/', (req, res, next) => {
    let options = {
        root: path.join(__dirname, '/public/')
    };

    res.sendFile('index.html', options, (err) => {
        if (err) next(err);
        else console.log('Sent index.html');
    });
});

app.get('/servicedata', (req, res, next) => {
    if (route && pointsOfInterest) {
        let data = {
            route:              route,
            pointsOfInterest:   pointsOfInterest
        };
        res.status(200).json(data);
    }
    else {
        res.status(500).send('Error while loading service data');
    }
});

let port = parseInt(process.env.PORT, 10) | 80;

app.listen(port, () => {
    console.log(`Web server is listening on port ${port}`);
});