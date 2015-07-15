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

// Hiring smart people
if (typeof console !== 'undefined' && typeof console.log === 'function' && !window.test) {
    console.log('\r\n%c                     *      .--.\r\n%c                           \/ \/  `\r\n%c          +               | |\r\n%c                 \'         \\ \\__,\r\n%c             *          +   \'--\'  *\r\n%c                 +   \/\\\r\n%c    +              .\'  \'.   *\r\n%c           *      \/======\\      +\r\n%c                 ;:.  _   ;\r\n%c                 |:. (_)  |\r\n%c                 |:.  _   |\r\n%c       +         |:. (_)  |          *\r\n%c                 ;:.      ;\r\n%c               .\' \\:.    \/ `.\r\n%c              \/ .-\'\':._.\'`-. \\\r\n%c              |\/    \/||\\    \\|\r\n%c            _..--\"\"\"````\"\"\"--.._\r\n%c      _.-\'``                    ``\'-._\r\n%c    -\'         %cAnjinglah maneh%c        \'-\r\n%c',
    'color:#D0E3F1','color:#D0E3F1','color:#C0DAEC','color:#C0DAEC','color:#B0D1E8','color:#B0D1E8','color:#A1C7E3','color:#A1C7E3','color:#91BEDE','color:#91BEDE','color:#81B5D9','color:#81B5D9','color:#72ABD5','color:#72ABD5','color:#62A2D0','color:#62A2D0','color:#5299CB','color:#5299CB','color:#4390C7','color:#4390C7', 'color:#4390C7', 'color: #000000');
}
