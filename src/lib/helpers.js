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

function once(callback) {
  var fired;
  return function() {
    // var self = this, args = arguments;
    callback.apply(self, arguments);
  };
}

// Not bulletproof code...
function isEqual(a,b) {
  if (!(typeof a === 'object' || typeof b === 'object')){
    return a === b;
  } 

  for (var prop in a) {
    if (a.hasOwnProperty(prop)) {
      var bool = isEqual(a[prop], b[prop]);
      if (!bool) {
        return false;
      }
    }
  }
  return true;
}
// console.log(isEqual({},{}));
// // true
// console.log(isEqual({a:1},{a:1}));
// // true
// console.log(isEqual({a:2},{b:2}));
// // false
// console.log(isEqual({a:{}},{a:{}}));
// // true
// console.log(isEqual({a:{b:2}},{a:{b:1}}));
// // false
// console.log(isEqual({a:{b:2, c:3}},{a:{b:2, c:4}}));
// // false

export { addEvent, getRandomInt, debounce, isEqual};
