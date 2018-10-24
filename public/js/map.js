$(document).ready(function() {
    let centerCoords = L.latLng(60.476, 22.138);

    let mymap = L.map('mapid').setView(centerCoords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(mymap);
});
