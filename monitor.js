var serial = require('serialport'),
    events  = require('events'),
    predictions = require('./predictions.js');

function Monitor(port) {
  this.serialPort = new serial.SerialPort(port, {
      parser: serial.parsers.readline('\r\n')
  });

  events.EventEmitter.call(this);
}

Monitor.prototype.events = {
  arrowLeft  : 'left',
  arrowRight : 'right',
  shoot      : 'shoot'
  tilt       : 'tilt',
  force      : 'force'
}

Monitor.prototype.messageParsers = { 
  '/Left/'  : function() { self.emit(self.events.targetLeft); }
  '/Right/' : function() { self.emit(self.events.targetRight); }
  '/FINAL/' : function() { self.emit(self.events.shoot); }
  /* ensure tilt in 0-1 */
  '/Tilt: (\d+\.?\d+)/' : function(match) { self.emit(self.events.tilt, match[1])}
  /* ensure force in 0-1 */
  '/Force: (\d+\.?\d+)/' : function(match) { self.emit(self.events.force, match[1])}
}

Monitor.prototype.listen = function() {
  var self = this;

  self.serialPort.on('open', function() {
    /* port doesn't seem to receive data for the first few seconds */
    setTimeout(function() {
      self.serialPort.on('data', function(data) {
        data = data.toString();
        for (var matcher in self.messageParsers) {
          if (self.messageParsers.hasOwnProperty(matcher)) {
            var matcher = new RegExp(matcher);
            var match = matcher.exec(data);
            if (match) {
              self.messageParsers[matcher](match);
              return;
            }
          }
        }
      });
    }, 5000);
  });
}

Monitor.prototype.__proto__ = events.EventEmitter.prototype;

exports.Monitor = Monitor;
