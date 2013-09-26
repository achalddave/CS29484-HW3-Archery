SVG.Target = function(type) {
  this.constructor.call(this, SVG.create('target'))
}

// Inherit from SVG.Container
SVG.Target.prototype = new SVG.Shape

//
SVG.extend(SVG.Container, {
  target : function(x,y,r) {
    // ring colors from outside in
    var colors = ['#eee',
                  'black',
                  'blue',
                  'red',
                  'yellow','yellow'];

    // radius of each ring
    var step = r / colors.length;
    var currRadius = r;
    var svg = this;
    colors.forEach(function(color) {
      svg.circle(currRadius).center(x,y).attr({'fill' : color, 'stroke' : '#000'});
      currRadius -= step;
    });
    // svg.circle(r).center(x,y).attr({'fill' : 'r(0.5, 0.5)rgba(0,0,0,255)-rgba(0,0,0,0)', 'opacity' : 0, 'opacityStops'});
    // return svg.rect(50,50).attr({ fill : '#f06' });
  }
});

var debugPaper = true;
$(function() {
  var svg = SVG('game');
  var w = $('#game').width(), h = $('#game').height();
  if (debugPaper) window.svg = svg;
  svg.target(20,20,50);
  // svg.rect(50,50).center(w/2, h/2).attr({ fill: '#f06' });
});

/*
Raphael.fn.target = function(x,y,r) {
  // ring colors from outside in
  var colors = ['#eee',
                'black',
                'blue',
                'red',
                'yellow','yellow'];

  // radius of each ring
  var step = r / colors.length;
  var currRadius = r;
  var paper = this;
  colors.forEach(function(color) {
    paper.circle(x,y,currRadius).attr({'fill' : color, 'stroke' : '#000'});
    currRadius -= step;
  });
  paper.circle(x,y,r).attr({'fill' : 'r(0.5, 0.5)rgba(0,0,0,255)-rgba(0,0,0,0)', 'opacity' : 0, 'opacityStops'});
}

Raphael.fn.bow = function(x,y,h) {
  
}
*/
