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

      // Add route to map
      let options = {
        color:        '#EBAC00',
        interactive:  false,
        weight:       5
      };

      let routePolyline = L.polyline(data.route, options);
      routePolyline.addTo(map);
      map.fitBounds(routePolyline.getBounds());

      return data;
  })
  .catch((reason) => {
    let errorMessage = 'Error while loading service data from server';
    console.log(errorMessage);
    $('#mapid').html(errorMessage);
  });
});
