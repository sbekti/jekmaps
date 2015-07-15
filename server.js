var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var request = require('request');

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', function(socket) {
  socket.on('location', function(data) {
    fetchGojekDrivers(data, socket);
  });
});

function fetchGojekDrivers(data, socket) {
  var baseURL = 'https://api.gojek.co.id/gojek/drivers/area?location=';
  var lat = data.lat.toFixed(6);
  var lng = data.lng.toFixed(6);
  var requestURL = baseURL + lat + '%2C' + lng;

  request({
    'rejectUnauthorized': false,
    'url': requestURL
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      socket.emit('drivers', JSON.parse(response.body));
    };
  });
}

http.listen(5000, function() {
  console.log('listening on *:5000');
});
