var debugPaper = true;
$(function() {
  var paper = Raphael('game');
  var w = paper.width, h = paper.height;
  paper.target(w/2,h/2,50).attr();
});

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
