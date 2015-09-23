// Eric Ren 2015
// dragzone.js
//
// Drag events that actually make sense.
//
// By default, 'dragenter' event always fires when entering an element.
// Conversely, 'dragleave' event always fires when leaving an element.
//
// If we want a dragzone composed of a hiearchy of elements, then dragging over the hiearchy will result in
// a LOT of 'dragenter/dragleave' events as you enter and leave elements. 
//
// What we really want is to designate this hiearcy of elements as a 'dragzone', so that whenever we enter 
// this zone, an 'enter' event fires only once, and a 'leave' event fires only once when we drag out of the
// parent element. Dragging over child elements within the parent element will NOT fire all those extraneous
// 'dragenter/dragleave' events.
//
export function makeDragzone(el, debug=false) {
  var firedEvents = [];
  var dragzone_enter = new Event('dragzone:enter', {"bubble": true, "cancelable":true});
  var dragzone_leave = new Event('dragzone:leave', {"bubble": true, "cancelable":true});
  var timeout;

  el.addEventListener("dragenter", function(e){
      var dt = e.dataTransfer;
      if (firedEvents.length === 0) {
          dragzone_enter.dataTransfer = dt;
          el.dispatchEvent(dragzone_enter);
      }
      firedEvents.push(e.target);
      if(debug === true) console.log('dragenter', e, firedEvents);
  }, false);

  el.addEventListener("dragleave", function(e){
      firedEvents = firedEvents.filter(function(elem) {
          return elem !== e.target;
      });
      if(debug === true) console.log('dragleave',e, firedEvents);
      if (firedEvents.length === 0) {
          dragzone_leave.dataTransfer = e.dataTransfer;
          el.dispatchEvent(dragzone_leave);
      }
  }, false);

  el.addEventListener("drop", function(e){
    firedEvents = [];
  }, false);

}
