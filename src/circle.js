'use strict';

// circles = [
//   {id: 3, center: {x,y}, radius: 50, selected: false, fileContent: e.target.result};
// ]
export function getAllIntersections(circles) {
  // 'circles' need to be an array
  if (!circles || circles.constructor !== Array) return null;

  var points = [];
  


  return points;
}


/*
 * Calculates the intersection points between two circles
 * @param {object} c1 - circle one
 * @param {object} c2 - circle two
 * @returns {Array} List of points that intersect a circle, or an empty array if no intersection points exist.
 *
 * @throws Will throw an error if both arguments aren't present.
 * @throws Will throw an error if both arguments aren't circles.
 *
 * @example
 * // returns:
 * // [
 * //   {x:12.5, y:5.7, parentCircles: [1,2]}, 
 * //   {x:12.5, y:14.330, parentCircles: [1,2]}, 
 * // ]
 *
 * var c1 = {id:1, center:{x:10, y:10}, radius: 5}, ... }
 * var c2 = {id:2, center:{x:15, y:10}, radius: 5}, ... }
 * getIntersections(c1,c2);
*/
export function getIntersections(a,b) {
  if (a === undefined || b === undefined) {
   throw "Not enough arguments";
  }
 // if a and b are not circles  {
  // throw "Arguments are not circles"
  //}
  //
}
