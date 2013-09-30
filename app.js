
/**
 * Module dependencies.
 */

var express = require('express'),
    http    = require('http'),
    path    = require('path'),
    sass    = require('node-sass'),
    io      = require('socket.io').listen(7000),
    routes  = require('./routes'),
    monitor = require('./monitor'),
    socket = null;

var app = express();

// all environments
app.set('port', process.env.PORT || 7070);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(sass.middleware({
  src:   path.join(__dirname, 'public'),
  dest:  path.join(__dirname, 'public'),
  debug: true,
  force : true /* https://github.com/andrew/node-sass/issues/157 */
}));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (currSocket) {
  socket = currSocket;
  socket.emit('connected', "Hello!");
  /*
  setTimeout(function() {
    socket.emit('arrowLeft');
    setTimeout(function() {
      socket.emit('arrowRight');
      setTimeout(function() {
        socket.emit('force', 0.7);
        setTimeout(function() {
          socket.emit('tilt', 0.3);
          setTimeout(function() {
            socket.emit('shoot', 0.7);
          }, 3000)
        }, 1000)
      }, 1000);
    }, 1000)
  }, 1000)
  */
});

// monitor
var bow = new monitor.Monitor('COM6');
bow.listen();

bow.on(bow.events.arrowLeft, function() {
  console.log("Emitting arrow left");
  socket.emit('arrowLeft');
});

bow.on(bow.events.arrowRight, function() {
  socket.emit('arrowRight');
});

bow.on(bow.events.shoot, function() {
  socket.emit('shoot');
});

function MedianFilter(numPoints) {
  this.values = new Array(numPoints);
  this.filledVales = 0;
}

MedianFilter.prototype.insert = function(val) {
  if (this.filledValues < this.values.length) {
    this.values.splice(0,0,val);
    this.filledValues++;
    return val;
  } else {
    this.values.splice(0,0,val);
    this.values.pop();
    return this.median();
  }
}

MedianFilter.prototype.median = function() {
  // only called if filled
  var sorted = this.values.slice().sort();
  if (sorted.length % 2 == 0) 
    return (sorted[sorted.length / 2] + sorted[sorted.length / 2 - 1])/2;
  else
    return (sorted[sorted.length / 2 - 0.5]);
}

var tilts = new MedianFilter(9);
bow.on(bow.events.tilt, function(tilt) {
  tilt = tilts.insert(tilt);
  socket.emit('tilt', tilt);
});

var forces = new MedianFilter(50);
bow.on(bow.events.force, function(force) {
  force = forces.insert(force);
  console.log("Force in app.js", force);
  socket.emit('force', force);
});
