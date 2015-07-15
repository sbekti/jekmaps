var socket = io();

var markers = [];

function submitLocation(location) {
  var payload = {
    lat: location.lat,
    lng: location.lng
  };

  socket.emit('location', payload);
}

L.mapbox.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q';

var map = L.mapbox.map('map', 'mapbox.osm-bright')
  .setView([-6.886831823908739, 107.61399149894714], 16)
  .addControl(L.mapbox.geocoderControl('mapbox.places'));

map.on('moveend', function(e) {
  submitLocation(map.getCenter());
});

map.on('zoomend', function(e) {
  submitLocation(map.getCenter());
});

socket.on('drivers', function(data) {
  console.log(data);

  for (var i = 0; i < markers.length; ++i) {
    map.removeLayer(markers[i]);
  }

  for (var i = 0; i < data.length; ++i) {
    var lat = data[i].driverLatLong.split(',')[0];
    var lng = data[i].driverLatLong.split(',')[1];

    var marker = L.marker([lat, lng], {
      icon: L.mapbox.marker.icon({
          'marker-size': 'large',
          'marker-symbol': 'scooter',
          'marker-color': '#009900'
      })
    });
    marker.bindPopup('<h3 class="popup-header">' + data[i].driverName + '</h3><br>' + data[i].driverNoTelp + '<br>' + data[i].driverTypeName);
    marker.addTo(map);
    markers.push(marker);
  }
});

submitLocation(map.getCenter());

$('#welcomeModal').modal();
