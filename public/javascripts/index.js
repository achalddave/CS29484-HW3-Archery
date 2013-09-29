// config
var config = {
  numSlots : 9,
  debug : true
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
    target.placeGround(slots[i].center, slots[i].bottom);
    updateArrow(i);
  }

  function updateArrow(slot) {
    slot = slot == null ? currSlot : slot;
    arrow.plot(slots[slot].center, h, slots[slot].center, arrowEnd);
    forceLine.attr({
      x1 : slots[slot].center - 50,
      x2 : slots[slot].center + 50
    })
  }

  var currSlot     = Math.round(slots.length/2-0.5);
  var arrowEnd     = h - (h - slots[0].bottom)/2;
  var forceLineY   = h - (h - slots[0].bottom)/4;

  var target = svg.target(40);
  var arrow  = svg.arrow(0,h,0,arrowEnd);
  var forceLine = svg.line(0,0,0,0).plot(0,forceLineY,0,forceLineY).stroke({width:5, color: '#f00'});
  updateSlot(currSlot);

  if (config.debug) window.target = target;

  $('#target-pos').attr({ min : 0, max : slots.length, step: 1 });
  $('#target-pos').change(function() {
    updateSlot($(this).val());
  });

  function shoot() {
/*.animate(500)*/
    // console.log(0, aimedCircle.cy() + arrow.arrowLine.attr('y2'));
    arrow.arrowGroup.animate(500).transform({
                      x: 0,
                      y: aimedCircle.cy() - arrow.arrowLine.attr('y2')
                    }).after(shootCongratulate);
                    arrow.arrowGroup.front();
  }

  function shootCongratulate() {
    svg.text("Congrats! You hit perfectly!")
      .x(w/2)
      .y(h/8)
      .font({
        size: 40,
        anchor: 'middle',
        weight:'lighter',
        family: 'Segoe UI'
      });
  }

  $('#draw-force').change(function() {
    var pulled = h + parseInt($(this).val(), 10);
    /* starting at h+pulled shows up the same as starting at h, but allows us
     * to translate while keeping the length constant when shooting */
    arrow.plot(null, h + pulled,
               null, arrowEnd + pulled);
    if (arrow.arrowLine.attr('y2') > forceLineY) {
      shoot();
      return;
    }
    updateArrow();
  });

  var aimedCircle = svg.circle(10).fill('#AD1515').stroke({color: '#eee', width: 3}).center(-100,-100);
  $('#draw-angle').change(function() {
    var angle = $(this).val();
    // perfect angle: 50
    // angle: 0   -> bottom -> target.y() + 2*target.r()
    // angle: 100 -> top    -> target.y()
    aimedCircle.center(target.cx(), target.y() + ((angle/100)*(2*target.radius())));
  });

});
