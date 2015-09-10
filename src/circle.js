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
    typeof circle.x === 'number' &&
    typeof circle.y === 'number';
}

// circles = [
//   {id: 3, x:23, y:22, radius: 50, selected: false, fileContent: e.target.result};
// ]

/*
 * Calculates all the intersection points between all the circles.
 * @param {Array} List of circles. 
 * @returns {Array} List of intersection points between all circles.
 *
 * @throws Will throw an Error if no argument is given.
 * @throws Will throw a Type Error if `circles` is not an array of circles.
 *
 * @example
 * circle 1 overlaps with circle 4 and cricle 7
 * // returns:
 * // [
 * //   {x:8, y:6, parentCircles:[1,4]},
 * //   {x:8, y:14, parentCircles:[1,4]},
 * //   {x:0, y:10, parentCircles:[1,7]},
 * //   {x:5, y:15, parentCircles:[1,7]},
 * //   {x:5, y:10, parentCircles:[4,7]},
 * //   {x:6, y:13, parentCircles:[4,7]},
 * // ]
 *
 * var list = [
 *  {id:1, x:5, y:10, radius:5},
 *  {id:4, x:10, y:10, radius:5},
 *  {id:7, x:2, y:13, radius:4},
 * ]
 *
 */
export function getAllIntersections(circles) {
  // 'circles' need to be an array
  // if (!circles || circles.constructor !== Array) return null;
  if (arguments.length === 0 || arguments.length > 1) {
    throw new Error('Wrong number of arguments. Need one and only one argument');
  }

  if (!Array.isArray(circles)) {
    throw new TypeError('Argument is not an array');
  } 

  var allCircles = circles.reduce((memo, circle) => {
    return memo && isCircle(circle);
  }, true);

  if (!allCircles ) {
     throw new TypeError('List is not all circles');
  }

  var points = [];
   
  for (let i = 0, len = circles.length; i < len; i++) {
    for (let j = i+1; j < len; j++) {
      points = points.concat(getIntersections(circles[i], circles[j]));
    }
  }


  return points;
}


/*
 * Calculates the intersection points between two circles
 * @param {object} c0 - circle one
 * @param {object} c1 - circle two
 * @returns {Array} List of points that intersect a circle, or an empty array if no intersection points exist.
 *
 * @throws Will throw an Error if both arguments aren't present.
 * @throws Will throw an Type Error if both arguments aren't circles.
 *
 * @example
 * // returns:
 * // [
 * //   {x:12.5, y:5.7, parentCircles: [1,2]}, 
 * //   {x:12.5, y:14.330, parentCircles: [1,2]}, 
 * // ]
 *
 * var c0 = {id:1, x:10, y:10, r: 5}, ... }
 * var c1 = {id:2, x:15, y:10, r: 5}, ... }
 * getIntersections(c0,c1);
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

  dx = c1.x - c0.x;
  dy = c1.y - c0.y;
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
  if (c0.x === c1.x && c0.y === c1.y && c0.radius === c1.radius ) {
    return result; 
  } 

  // Calculate distance from c0.center to 'midpoint'
  a = ((c0.radius*c0.radius) - (c1.radius*c1.radius) + (d*d))/(2*d);
  // console.log('a', a);

  // Calculate distance from 'midpoint' to either intersection point along the 'radical line'
  h = Math.sqrt((c0.radius*c0.radius) - (a*a));
  // console.log('h', h);
                  
  // Calculate x coordinate of 'midpoint'
  xm = c0.x + (a/d) * dx; 
  ym = c0.y + (a/d) * dy; 

  // Calculate delta between midpoint and intersection points
  i_dx = h * (dy/d);
  i_dy = h * (dx/d);

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


