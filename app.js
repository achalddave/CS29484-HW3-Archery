
/**
 * Module dependencies.
 */

var express = require('express'),
    http    = require('http'),
    path    = require('path'),
    sass    = require('node-sass'),
    io      = require('socket.io').listen(8000),
    routes  = require('./routes'),
    monitor = require('./monitor');

var app = express();

// all environments
app.set('port', process.env.PORT || 8080);
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

io.sockets.on('connection', function (socket) {
  socket.emit('connected', "Hello!");
});

// monitor
var bow = new monitor.Monitor('COM5');

bow.on(bow.events.arrowLeft, function() {
  socket.emit('arrowLeft');
});

bow.on(bow.events.arrowRight, function() {
  socket.emit('arrowRight');
});

bow.on(bow.events.shoot, function() {
  socket.emit('shoot');
});

bow.on(bow.events.tilt, function(tilt) {
  socket.emit('tilt', tilt);
});

bow.on(bow.events.force, function(force) {
  socket.emit('force', force);
});
