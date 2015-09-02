'use strict';

import {isEqual} from 'helpers';

/*
 * @see {@link http://stackoverflow.com/a/18358056/849172 | Mark G's answer} for correct implementation of rounding floating points.  
 * Also look into 'dedekind cut'.  In JS, 1.0049999999999999 and 1.005 are considered the same number. So both will round to 1.01 for two decimal places.
 *
 */

// Closure
(function() {
  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
})();

function isCircle(circle) {
  // cannot be undefined or null, or any falsy value
  if (!circle) {
    return false;
  }

  return typeof circle === 'object' &&
    typeof circle.radius === 'number' && 
    typeof circle.center === 'object' &&
    typeof circle.center.x === 'number' &&
    typeof circle.center.y === 'number';
}

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
 * @param {object} c0 - circle one
 * @param {object} c1 - circle two
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
 * var c1 = {id:1, center:{x:10, y:10}, r: 5}, ... }
 * var c2 = {id:2, center:{x:15, y:10}, r: 5}, ... }
 * getIntersections(c1,c2);
 *
 * @see {@link http://mathworld.wolfram.com/Circle-CircleIntersection.html | Mathworld} for the math behind the code.
 *
 * @see {@link http://paulbourke.net/geometry/circlesphere/tvoght.c | Tim Voght's implementation} for reference.
*/
export function getIntersections(c0,c1) {
  if (c0 === undefined || c1 === undefined) {
    throw new Error("Not enough arguments");
  }

  if (!(isCircle(c0) && isCircle(c1)))  {
    throw new TypeError("Arguments are not circles");
  }

  
  var dx, dy;
  var a, d, h;
  var xm, ym;
  var i_dx, i_dy;

  var i_x1, i_x2;
  var i_y1, i_y2;
    
  var result = [];

  // console.log('c0.radius', c0.radius);
  // console.log('c1.radius', c1.radius);

  dx = c1.center.x - c0.center.x;
  dy = c1.center.y - c0.center.y;
  // console.log('dx', dx);
  // console.log('dy', dy);

  // will be floating point number
  // Find distance between radii
  d = Math.sqrt((dx*dx) + (dy*dy));
  // console.log('d', d);

  // Circle within another circle 
  if (d < Math.abs(c0.radius - c1.radius)) { 
    return result;  
  } 
  
  // Circles not overlapping 
  if (d > (c0.radius + c1.radius)) {
    return result;
  }
   
  // Same circle
  if (isEqual(c0.center, c1.center) && c0.radius === c1.radius ) {
    return result; 
  } 

  // Calculate distance from c0.center to 'midpoint'
  a = ((c0.radius*c0.radius) - (c1.radius*c1.radius) + (d*d))/(2*d);
  // console.log('a', a);

  // Calculate distance from 'midpoint' to either intersection point along the 'radical line'
  h = Math.sqrt((c0.radius*c0.radius) - (a*a));
  // console.log('h', h);
                  
  // Calculate x coordinate of 'midpoint'
  xm = c0.center.x + (a/d) * dx; 
  ym = c0.center.y + (a/d) * dy; 

  // Calculate delta between midpoint and intersection points
  i_dx = h * (dy/d);
  i_dy = h * (dx/d);

  // console.log('i_dx', i_dx);
  // console.log('i_dy', i_dy);
  // console.log('math.round', Math.round10(123.456, -2));
  
  
  i_x1 = Math.round10(xm + i_dx, 0);
  i_x2 = Math.round10(xm - i_dx, 0);

  i_y1 = Math.round10(ym - i_dy, 0);
  i_y2 = Math.round10(ym + i_dy, 0);

  // Add first intersection point
  result.push({
    x: i_x1,
    y: i_y1,
    parentCircles: [c0.id, c1.id],
  });

  // Add second intersection point if different from first point
  if (!(i_x1 == i_x2 && i_y1 === i_y2)) {
    result.push({
      x: i_x2,
      y: i_y2,
      parentCircles: [c0.id, c1.id],
    });
  }

  return result;
}


// var a = {id:3, center:{x:20, y:20}, radius: 5};
// var b = {id:4, center:{x:25, y:25}, radius: 6};
//
// var c = {id:1, center:{x:20, y:20}, radius: 7};
// var d = {id:2, center:{x:30, y:20}, radius: 7};
//
// console.log(getIntersections(a,b));
// console.log(getIntersections(c,d));
