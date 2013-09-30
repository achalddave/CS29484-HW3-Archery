var serial = require('serialport'),
    events  = require('events');

function Monitor(port) {
  this.serialPort = new serial.SerialPort(port, {
      parser: serial.parsers.readline('\r\n')
  });

  var self = this;
  this.messageParsers = {
    'Left'  : function() {
      self.emit(self.events.arrowLeft);
    },
    'Right' : function() {
      self.emit(self.events.arrowRight);
    },
    'FINAL' : function() {
      self.emit(self.events.shoot); 
    },
    'Tilt: (-?\\d+\.?\\d+)' : function(match) {
      var tilt = parseInt(match[1], 10);
      tilt = 1-(Math.max(Math.min(tilt, 30), -30) + 30)/60;
      self.emit(self.events.tilt, tilt)
    },
    'Force: (\\d+\.?\\d+)' : function(match) {
      var force = ((parseInt(match[1])) - 100)/ 800
      self.emit(self.events.force, force)
    }
  }
  events.EventEmitter.call(this);
}

Monitor.prototype.events = {
  arrowLeft  : 'left',
  arrowRight : 'right',
  shoot      : 'shoot',
  tilt       : 'tilt',
  force      : 'force'
}

Monitor.prototype.listen = function() {
  var self = this;

  console.log("opening");
  self.serialPort.on('open', function() {
    console.log("Opened");
    /* port doesn't seem to receive data for the first few seconds */
    setTimeout(function() {
      console.log('ready');
      self.serialPort.on('data', function(data) {
        data = data.toString();
        for (var matcher in self.messageParsers) {
          if (self.messageParsers.hasOwnProperty(matcher)) {
            var regex = new RegExp(matcher);
            var match = regex.exec(data);
            if (match) {
              console.log(data, "matched with", matcher);
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
