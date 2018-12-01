// Fetches service data from server
function getServiceData() {
    return new Promise((resolve, reject) => {
        let url = document.location.href + 'servicedata';
        let settings = {
            dataType: 'json'
        };
        let request = $.ajax(url, settings)
          .done((data) => {
            resolve(data);
          })
          .fail((err) => { 
            reject(err)
          });
    });
}

// Creates a Leaflet map with OpenStreetMap baselayer into target element
function loadMap(targetID) {
  let myMap = L.map(targetID);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(myMap);

  return myMap;
}

// Create marker popups
function popupMaker(point) {
  let pointPopup = $('<table/>').append('<thead><th>Field</th><th>Value</th></thead>');
  pointPopup.find('thead').after('<tbody/>');

  function markerInfoIterator(markerInfo) {
    for (let field in markerInfo) {
      if (markerInfo.hasOwnProperty(field)) {
        if (typeof markerInfo[field] == 'object') {
          markerInfoIterator(markerInfo[field]);
        }
        else {
          pointPopup.find('tbody').append(`<tr><th>${field}</th><td>${markerInfo[field]}</td></tr>`);
        }
      }
    }
  }

  markerInfoIterator(point);

return pointPopup[0];
}

$(document).ready(() => {
  let map = loadMap('mapid');

  let busRoute = getServiceData()
  .then((data) => {
    console.log('Service data loaded successfully');
    console.log('Route:',JSON.stringify(data.route));
    console.log('Points of Interest:',JSON.stringify(data.pointsOfInterest));

    return data;
  })
  .catch((reason) => {
    let errorMessage = 'Error while loading service data from server';
    console.log(errorMessage);
    $('#mapid').html(errorMessage);
  })
  .then((data) => {
    // Add route layer to map
    let options = {
      color:        '#EBAC00',
      interactive:  false,
      weight:       5
    };

    let routePolyline = L.polyline(data.route, options);
    routePolyline.addTo(map);
    map.fitBounds(routePolyline.getBounds());

    // Create marker layers
    let markers = {};

    for (let point of data.pointsOfInterest) {
      let pointMarker = L.marker(L.latLng(point.lat, point.lon), {icon: L.icon({iconUrl: 'img/'+point.category+'.png', iconSize: L.point(26, 26)})});

      pointMarker.bindPopup(popupMaker(point));

      // DEBUG addTo -> IMPLEMENT FEATUREGROUPS & CONTROL LAYER GODDAMIT
      // pointMarker.addTo(map);
      if (!markers.hasOwnProperty(point.category)) { markers[point.category] = []; }
      markers[point.category].push(pointMarker);
    }

    // Create marker group layers
    let layerGroups = {};
    for (let category in markers) {
      layerGroups[category] = L.layerGroup(markers[category]);
      layerGroups[category].addTo(map);
    }

    // Create control overlay and add marker layer groups
    let control = L.control.layers(null, layerGroups, { collapsed: false, sortLayers: true });
    control.addTo(map);
  });
});
