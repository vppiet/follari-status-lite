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

// Creates a Leaflet map into target element
function loadMap(targetID) {
  let myMap = L.map(targetID);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(myMap);

  return myMap;
}

$(document).ready(() => {
  let map = loadMap('mapid');

  let busRoute = getServiceData()
  .then((data) => {
    console.log('Service data loaded successfully');
    console.log(data);

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
      // remember to fix popup info
      pointMarker.bindPopup(JSON.stringify(point, null, 2));
      // DEBUG addTo -> IMPLEMENT FEATUREGROUPS & CONTROL LAYER GODDAMIT
      pointMarker.addTo(map);
      if (!markers.hasOwnProperty(point.category)) { markers[point.category] = []; }
      markers[point.category].push(pointMarker);
    }

    console.log(markers);
  })
});
