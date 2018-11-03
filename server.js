const config = require('./readConfig');
const openRouteService = require('./fetch-openroute');
const express = require('express');
const path = require('path');

// Load configs
const configs = config.readConfig('./config.json');

// Fetch initial route
let route;
openRouteService.fetchRoute(configs.openrouteservice.apikey, configs.route.pointA, configs.route.pointB)
    .then((value) => {
        console.log('Fetched route from OpenRouteService successfully.');
        route = value;
    })
    .catch((reason) => {
        console.log('Error while fetching route from OpenRouteService:', reason);
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

app.get('/route', (req, res, next) => {
    if (route) res.json(route);
    else res.send(404, 'Error while loading route.');
});

app.listen(configs.webserver.port, () => {
    console.log(`Web server is listening on port ${configs.webserver.port}.`);
});