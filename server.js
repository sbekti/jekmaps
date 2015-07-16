var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var request = require('request');

var dbURL = process.env.COUCHDB_URL || 'http://localhost:5984';
var nano = require('nano')(dbURL);
var db = nano.use('jekmaps');

var onlineUsers = 0;
var userCount = {};

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/stats', function(req, res) {
  var payload = {
    onlineUsers: onlineUsers,
    userCount: userCount
  };

  res.json(payload);
});

io.on('connection', function(socket) {
  ++onlineUsers;

  var today = new Date().toJSON().slice(0,10);
  var todayData = userCount[today];

  if (todayData != undefined) {
    userCount[today].count++;
  } else {
    userCount[today] = {
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

function syncUserStats() {
  db.get('stats', { revs_info: true }, function(err, body) {
    if (!err) {
      var payload = {
        userCount: userCount,
        _rev: body._rev
      };

      db.insert(payload, 'stats', function(err, body) {});
    }
  });
}

function fetchInitialUserStats() {
  db.get('stats', { revs_info: true }, function(err, body) {
    if (!err) {
      userCount = body.userCount == undefined ? {} : body.userCount;
    }
  });
}

fetchInitialUserStats();
setInterval(syncUserStats, 60000);

http.listen(5000, function() {
  console.log('listening on *:5000');
});
