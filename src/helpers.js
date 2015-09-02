// Not bulletproof code...
export function isEqual(a,b) {
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
