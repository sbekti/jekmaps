var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var request = require('request');

var onlineUsers = 0;
var visitorCount = {};

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/v1/stats', function(req, res) {
  var payload = {
    online_users: onlineUsers,
    visitor_count: visitorCount
  };

  res.json(payload);
});

io.on('connection', function(socket) {
  ++onlineUsers;

  var today = new Date().toJSON().slice(0,10);
  var todayData = visitorCount[today];

  if (todayData != undefined) {
    visitorCount[today].count++;
  } else {
    visitorCount[today] = {
      count: 1
    };
  }

  socket.on('location', function(data) {
    fetchGojekDrivers(data, socket);
  });

  socket.on('disconnect', function() {
    --onlineUsers;
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
