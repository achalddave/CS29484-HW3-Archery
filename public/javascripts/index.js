// config
var config = {
  numSlots : 9,
  debug : false
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
    currSlot = i;
    target.placeGround(slots[i].center, slots[i].bottom);
    updateArrow(i);
  }

  function updateArrow(slot) {
    arrow.plot(slots[slot].center, arrowStart, slots[slot].center, arrowEnd);
    var p1 = (slots[slot].center - 7) + ',' + arrowEnd;
    var p2 = (slots[slot].center)     + ',' + (arrowEnd-10);
    var p3 = (slots[slot].center + 7) + ',' + arrowEnd;
    forceLine.attr({
      x1 : slots[slot].center - 50,
      x2 : slots[slot].center + 50
    })
  }

  var defaultSlot = Math.round(slots.length/2-0.5);
  var currSlot = defaultSlot;
  var origArrowEnd = h - (h - slots[0].bottom)/2;
  var arrowEnd = origArrowEnd;
  var arrowStart = h;
  var arrowLength = origArrowEnd - arrowStart;
  var forceLineY = h - (h - slots[0].bottom)/4;

  var target = svg.target(40);
  var arrow  = svg.arrow(0,arrowStart,0,arrowEnd);
  var forceLine = svg.line(0,0,0,0).plot(0,forceLineY,0,forceLineY).stroke({width:5, color: '#f00'});
  updateSlot(defaultSlot);

  $('#target-pos').attr({ min : 0, max : slots.length, step: 1 });
  $('#target-pos').change(function() {
    updateSlot($(this).val());
  });

  $('#draw-force').change(function() {
    arrowEnd = origArrowEnd + parseInt($(this).val(),10);
    if (arrowEnd > forceLineY) {
      // shoot arrow
      var timeout;
      var shootAnimator = function() {
        if (arrowEnd < target.cy()+5) {
          clearTimeout(timeout);
          svg.text("Congrats! You hit perfectly!")
            .x(w/2)
            .y(h/8)
            .font({
              size: 40,
              anchor: 'middle',
              weight:'lighter',
              family: 'Segoe UI'
            });
          return;
        }
        arrowEnd -= 2; 
        arrowStart = arrowEnd - arrowLength;
        updateSlot(currSlot);
        timeout = setTimeout(shootAnimator,1);
      }
      timeout = setTimeout(shootAnimator, 1);
    }
    updateArrow(currSlot);
  });

  var aimedCircle = svg.circle(10).fill('red').center(-100,-100);
  $('#draw-angle').change(function() {
    var angle = $(this).val();
    // perfect angle: 50
    // angle: 0   -> bottom -> target.y() + 2*target.r()
    // angle: 100 -> top    -> target.y()
    aimedCircle.center(target.cx(), target.y() + ((angle/100)*(2*target.radius())));
  });

});
