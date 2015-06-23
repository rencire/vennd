var addEvent = function(elem, type, eventHandle) {
  if (elem == null || typeof(elem) == 'undefined') return;
  if ( elem.addEventListener ) {
    elem.addEventListener( type, eventHandle, false );
  } else if ( elem.attachEvent ) {
    elem.attachEvent( "on" + type, eventHandle );
  } else {
    elem["on"+type]=eventHandle;
  }
};

// http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
// min inclusive, max inclusive
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};


function debounce(callback, wait, immediate) {
  var timeout;
  return function() {
    var self = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) callback.apply(self, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) callback.apply(self, args);
  };
};

export { addEvent, getRandomInt, debounce};
