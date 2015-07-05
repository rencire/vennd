// Eric Ren 2015
// dragzone.js
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
