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
  this.constructor.call(this, SVG.create('arrow'));

  this.arrowGroup = parent.group();
  this.arrowLine = parent.line(0,0,0,0).stroke({width:2});
  this.arrowHead = parent.polygon('').stroke('black').fill('none');
  this.arrowHead1 = parent.polyline('').stroke('black').fill('none');
  this.arrowHead2 = parent.polyline('').stroke('black').fill('none');
  this.arrowHead3 = parent.polyline('').stroke('black').fill('none');
  this.arrowGroup.add(this.arrowLine).add(this.arrowHead).add(this.arrowHead1)
                 .add(this.arrowHead2).add(this.arrowHead3);
}

SVG.Arrow.prototype = new SVG.Shape();

SVG.extend(SVG.Arrow, {
  plot : function(x1, y1, x2, y2) {
    x1 = x1 == null ? this.arrowLine.attr('x1') : x1;
    y1 = y1 == null ? this.arrowLine.attr('y1') : y1;
    x2 = x2 == null ? this.arrowLine.attr('x2') : x2;
    y2 = y2 == null ? this.arrowLine.attr('y2') : y2;
    this.arrowLine.attr({
      x1 : x1,
      y1 : y1,
      x2 : x2,
      y2 : y2
    });
    this.head();
    return this;
  },
  head : function(w, h) {
    if (w == null) { w = this.w; } else { this.w = w; }
    if (h == null) { h = this.h; } else { this.h = h; }

    var cx = this.arrowLine.attr('x2'), by = this.arrowLine.attr('y2');
    this.arrowHead.plot([[cx - w/2, by+(h/3)],
                         [cx, by-(2*h/3)],
                         [cx + w/2, by+(h/3)],
                         [cx, by]]);
    this.arrowHead1.plot([[cx-2*w/5, by+(2*h/3)],
                          [cx, by+(h/3)],
                          [cx+2*w/5, by+(2*h/3)]
                          ]);
    this.arrowHead2.plot([[cx-w/3, by+(h)],
                          [cx, by+(2*h/3)],
                          [cx+w/3, by+(h)]
                          ]);
    this.arrowHead3.plot([[cx-w/4, by+(h)],
                          [cx, by+(2*h/3)],
                          [cx+w/4, by+(h)]
                          ]);
    return this;
  }
});

SVG.extend(SVG.Container, {
  target : function(r) {
    // ring colors from outside in
    return this.put(new SVG.Target(this)).size(r).move(0,0);
  },
  arrow : function(x1, y1, x2, y2) {
    return this.put(new SVG.Arrow(this)).plot(x1, y1, x2, y2).head(10,10);
  }
});

