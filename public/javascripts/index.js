// config
var config = {
  numSlots : 9,
  debug : false
}

$(function() {
  var svg = SVG('game');
  var w = $('#game').width(), h = $('#game').height();

  /* setup background */
  var skyGradient = svg.gradient('linear', function(stop) {
    stop.at({ offset: 0, color: '#888FF7', opacity: 0.8 })
    stop.at({ offset: 1, color: 'darkblue', opacity: 0.8 })
  }).from(0.5,0).to(0.5,1);
  var grassGradient = svg.gradient('linear', function(stop) {
    stop.at({ offset: 0, color: '#18A300', opacity: 0.8 })
    stop.at({ offset: 1, color: '#0A7500', opacity: 0.8 })
  }).from(0.5,0).to(0.5,1);
  var grass = svg.rect(w,h*0.7).y(0.3*h).attr({fill : grassGradient});
  var sky = svg.rect(w,h*0.3).attr({fill : skyGradient});

  /* line at which target can be placed */
  var targetGround = svg.line(0,0.7*h,w,0.7*h)
  if (config.debug) targetGround.stroke({ width: 1 });

  /* target can be in one of many slots */
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
    updateAimedCircle()
    updateArrow();
  }
  
  function updateTargetSlot(i) {
    targetSlot = i;
    target.placeGround(slots[targetSlot].center, slots[targetSlot].bottom);
  }

  function updateArrow() {
    arrow.plot(slots[currSlot].center, null, slots[currSlot].center, null);
    forceLine.attr({
      x1 : slots[currSlot].center - 50,
      x2 : slots[currSlot].center + 50
    })
  }

  function updateAimedCircle() {
    aimedCircle.center(target.cx(), target.y() + ((currAngle/100)*(2*target.radius())));
  }

  var currSlot     = Math.round(slots.length/2-0.5);
  var targetSlot   = currSlot;
  var currAngle    = 0;
  var currForce    = 0;
  var arrowEnd     = h - (h - slots[0].bottom)/2;
  var forceLineY   = h - (h - slots[0].bottom)/4;

  var target      = svg.target(40);
  var arrow       = svg.arrow(0,h,0,arrowEnd);
  var forceLine   = svg.line(0,0,0,0).plot(0,forceLineY,0,forceLineY).stroke({width:3, color: 'lightgray'});
  var aimedCircle = svg.circle(10).fill('#AD1515').stroke({color: '#eee', width: 3}).center(-100,-100);

  if (config.debug) window.target = target;

  function shoot() {
    var hitY = aimedCircle.cy();
    arrow.arrowGroup.animate(500).transform({
                      x: 0,
                      y: hitY - arrow.arrowLine.attr('y2') + aimedCircle.attr('ry')
                    }).after(function() {
                      shootCongratulate(target.getScore(aimedCircle.cx(), aimedCircle.cy()));
                    });
                    arrow.arrowGroup.front();
  }

  function shootCongratulate(score) {
    var svgText;
    if (score < 5) 
      svgText = svg.text("You scored " + score + " point" + (score > 1 ? "s" : ""));
    else if (score < 10)
      svgText = svg.text("Congrats! You scored " + score + " points");
    else if (score == 10)
      svgText = svg.text("Bull's eye! Nice job!");
    svgText
      .x(w/2)
      .y(h/8)
      .font({
        size: 40,
        anchor: 'middle',
        weight:'lighter',
        family: 'Segoe UI'
      });
  }

  $('#arrow-pos').attr({ min : 0, max : slots.length, step: 1 });
  $('#arrow-pos').change(function() {
    updateSlot($(this).val());
  });
  $('#arrow-pos').val(targetSlot).change();
  updateTargetSlot(targetSlot);

  $('#draw-force').change(function() {
    var pulled = parseInt($(this).val(), 10);
    /* starting at h+pulled shows up the same as starting at h, but allows us
     * to translate while keeping the length constant when shooting */
    var newPos = arrowEnd - (arrowEnd - h)*(pulled/100);
    arrow.arrowGroup.transform({
      // 0: (arrowEnd)
      // 100: h
      y : newPos - arrow.arrowLine.attr('y2')
    });
    if (newPos > forceLineY) {
      forceLine.stroke('#1AFF00');
      shoot();
      return;
    }
  });
  $('#draw-force').val(0).change();

  $('#draw-angle').change(function() {
    currAngle = $(this).val();
    // perfect angle: 50
    // angle: 0   -> bottom -> target.y() + 2*target.r()
    // angle: 100 -> top    -> target.y()
    updateAimedCircle();
  });
  $('#draw-angle').val(currAngle).change();

  var socket = io.connect('http://localhost:8000');
  socket.on('connected', function(text) { alert(text); });

  socket.on('arrowLeft', function() {
    // % operator in JS allows negative, so can't use it
    updateSlot(currSlot == 0 ? slots.length - 1 : currSlot - 1);
  });

  socket.on('arrowLeft', function() {
    updateSlot((currSlot + 1) % slots.length);
  });

  socket.on('shoot', function() {
    shoot();
  });

  socket.on('tilt', function(tilt) {
    currAngle = tilt;
    updateAimedCircle();
  });

  socket.on('force', function(force) {
    currForce = force;
    updateArrow();
  });

});
