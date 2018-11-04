// Fetches route from web server
function getRoute() {
    return new Promise((resolve, reject) => {
        let url = document.location.href + 'route';
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

  let busRoute = getRoute()
    .then((value) => {
      console.log('Route loaded successfully.');
      let route = value[0].geometry;
      
      // Openroute service returns coordinates in [lat, long] format.
      // In order to use them with Leaflet, we need to reverse them to [long, lat] format.
      for (let point of route) {
        point.reverse();
      }

      let options = {
        color:        '#EBAC00',
        interactive:  false,
        weight:       5
      };

      let routePolyline = L.polyline(route, options);
      routePolyline.addTo(map);
      map.fitBounds(routePolyline.getBounds());

      return value[0].geometry;
  })
  .catch((reason) => {
    let errorMessage = 'Error while loading route from server.';
    console.log(errorMessage);
    $('body').append(errorMessage);
  });
});
