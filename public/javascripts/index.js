/* 
 * The SVG object extensions are admittedly overkill; I wanted to learn to play
 * with svg.js
 */
SVG.Target = function(parent) {
  this.constructor.call(this, SVG.create('target'))
  // from largest to smallest
  this.rings = parent.doc().set();
  this.stand = parent.rect(0,0).center(0,0).attr({fill : '#AD871C'});

  var self = this;
  this.colors.forEach(function(color) {
    self.rings.add(parent.circle(0)
                      .attr({fill : color, stroke : '#000'}));
  });

  var gradient = parent.gradient('radial', function(stop) {
    stop.at({ offset: 0, color: '#eee', opacity: 0.8 })
    stop.at({ offset: 1, color: '#000', opacity: 0.3 })
  });
  gradient.from(0.3,0.3).to(0.3,0.3).radius(0.3);
  this.gradientRing = parent.circle(0).attr({fill : gradient});
}

// Inherit from SVG.Container
SVG.Target.prototype = new SVG.Shape();

['cx','cy'].forEach(function(prop) {
  SVG.Target.prototype[prop] = function(val) {
    if (val == null) {
      return this.gradientRing[prop]();
    } else {
      this.rings[prop](val);
      this.gradientRing[prop](val);
      this.repositionStand();
      return this;
    }
  }
});

['x','y'].forEach(function(prop) {
  SVG.Target.prototype[prop] = function(val) {
    var rProp = 'r' + prop, cProp = 'c' + prop;
    this[cProp](val + this.gradientRing.attr(rProp));
    return this;
  }
});

SVG.extend(SVG.Target, {
  // from largest to smallest
  colors: ['#eee', 'black', 'blue', 'red', 'yellow', 'yellow'],
  repositionStand: function() {
    this.stand.cx(this.gradientRing.cx());
    // not a typo, align top with center
    this.stand.y(this.gradientRing.cy());
  },
  size: function(r) {
    var currDiameter = 2*r;
    var step = 2*r / this.colors.length;

    this.stand.size(.5*r, 1.3*r);
    this.gradientRing.size(2*r, 2*r);
    this.repositionStand();

    this.rings.each(function() {
      // `this` refers to each ring
      this.size(currDiameter, currDiameter);
      currDiameter -= step;
    });
    return this;
  },
  placeGround: function(cx, by) {
    return this.cx(cx).y(by - this.stand.attr('height') - this.gradientRing.attr('ry'));
  }
});

SVG.extend(SVG.Container, {
  target : function(r) {
    // ring colors from outside in
    return this.put(new SVG.Target(this)).size(r).move(0,0);
  }
});

// config
var config = {
  numSlots : 9,
  debug : true
}
$(function() {
  var svg = SVG('game');
  var w = $('#game').width(), h = $('#game').height();
  // line at which target can be placed
  var skyGradient = svg.gradient('linear', function(stop) {
    stop.at({ offset: 0, color: '#888FF7', opacity: 0.8 })
    stop.at({ offset: 1, color: 'darkblue', opacity: 0.8 })
  }).from(0.5,0).to(0.5,1);
  var grassGradient = svg.gradient('linear', function(stop) {
    stop.at({ offset: 0, color: '#18A300', opacity: 0.8 })
    stop.at({ offset: 1, color: '#28DB09', opacity: 0.8 })
  }).from(0.5,0).to(0.5,1);
  // var grass = svg.rect(w,h*0.7).y(0.3*h).attr({'fill' : '#84FF3D'});
  // var sky = svg.rect(w,h*0.3).attr({'fill' : '#888FF7'});
  var grass = svg.rect(w,h*0.7).y(0.3*h).attr({fill : grassGradient});
  var sky = svg.rect(w,h*0.3).attr({fill : skyGradient});
  var targetGround = svg.line(0,0.7*h,w,0.7*h)
  if (config.debug) targetGround.stroke({ width: 1 });

  var slots = new Array(config.numSlots);
  function Slot(index) { 
    this.center = (index + 0.5)*this.width;
    this.rightLine = null; 
  }
  Slot.prototype.bottom = targetGround.attr('y1');
  Slot.prototype.width = w / slots.length;

  for (var i = 0; i < config.numSlots; ++i) {
    var slot = new Slot(i);
    var rightLineX = (i+1) * slot.width;
    slot.rightLine = svg.line(rightLineX, 0, rightLineX, h);
    if (config.debug) slot.rightLine.stroke({width:1});
    slots[i] = slot;
  }

  function updateSlot(i) {
    target.placeGround(slots[i].center, slots[i].bottom);
    arrow.attr({
      x1 : slots[i].center,
      x2 : slots[i].center
    });
    var p1 = (slots[i].center - 5) + ',' + arrowEnd;
    var p2 = (slots[i].center)     + ',' + (arrowEnd-10);
    var p3 = (slots[i].center + 5) + ',' + arrowEnd;
    arrowHead.attr({
      points : p1 + ' ' + p2 + ' ' + p3
    });
  }

  var defaultSlot = Math.round(slots.length/2-0.5);
  var target = svg.target(40);
  var arrowEnd = h - (h - slots[0].bottom)/4;
  var arrow  = svg.line(0,h,0,arrowEnd).stroke({width:2});
  var arrowHead = svg.polygon('0,0 0,0 0,0').fill('none').stroke({ width: 1 });
  updateSlot(defaultSlot);

  $('#target-pos').attr({ min : 0, max : slots.length, step: 1 });
  $('#target-pos').change(function() {
    updateSlot($(this).val());
  });

});
