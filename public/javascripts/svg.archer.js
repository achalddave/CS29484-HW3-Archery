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
    stop.at({ offset: 1, color: '#000', opacity: 0.2 })
  });
  gradient.from(0.3,0.3).to(0.3,0.3).radius(0.3);
  this.gradientRing = parent.circle(0).attr({fill : gradient});
}

// Inherit from SVG.Shape
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
    if (val == null) {
      return this.gradientRing[prop]();
    } else {
      var cProp = 'c' + prop;
      this[cProp](val + this.radius());
      console.log(this[cProp]());
      return this;
    }
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

    this.stand.size(1.3*r, 1.3*r);
    this.gradientRing.size(2*r, 2*r);
    this.repositionStand();

    this.rings.each(function() {
      // `this` refers to each ring
      this.size(currDiameter, currDiameter);
      currDiameter -= step;
    });
    return this;
  },
  radius: function() {
    return this.gradientRing.attr('rx');
  },
  placeGround: function(cx, by) {
    return this.cx(cx).y(by - this.stand.attr('height') - this.gradientRing.attr('ry'));
  }
});

SVG.Arrow = function(parent) {
  this.arrowLine = parent.line(0,0,0,0).stroke({width:2});
  this.arrowHead = parent.polygon('').fill('black');
}

SVG.extend(SVG.Container, {
  target : function(r) {
    // ring colors from outside in
    return this.put(new SVG.Target(this)).size(r).move(0,0);
  },
  arrow : function() {
    return this.put(new SVG.Arrow(this)).attr({
      x1: 0, y1: 0, x2: 0, y2: 0
    });
  }
});

