/*
 * Eric Ren 2016
 *
 * Simple library for implementing venn diagram functionality.
 */

'use strict';

import {getRandomInt, isEqual} from './helpers';


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

function inBounds(point, maxWidth, maxHeight) {
    return point.x >= 0 && point.x <= maxWidth && point.y >= 0 && point.y <= maxHeight;
}


function isFreeArea(point, circles) {
    return circles.every(function(circle) {
        return (Math.pow((point.x - circle.x),2) + Math.pow((point.y - circle.y),2)) > Math.pow(circle.radius,2);
    });
}

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

function isPoint(point) {
  // cannot be undefined or null, or any falsy value
  if (!point) {
    return false;
  }

  return typeof point.x === 'number' &&
    typeof point.y === 'number' &&
    Array.isArray(point.parentCircles); 
}

export function generateRandomValidPoint(maxWidth, maxHeight, circles) {
    var point = {x: getRandomInt(0, maxWidth), y: getRandomInt(0, maxHeight)};
    while(!isFreeArea(point, circles)) {
        point = {x: getRandomInt(0, maxWidth), y: getRandomInt(0, maxHeight)};
    }
    return point;
}


// Overlaps

/**
 * A list of overlapping circles
 *
 * Note: using this equation to determine if two circles are intersecting or not:
 *
 *   (R0-R1)^2 <= (x0-x1)^2+(y0-y1)^2 <= (R0+R1)^2
 * 
 * See {@link http://stackoverflow.com/questions/8367512/algorithm-to-detect-if-a-circles-intersect-with-any-other-circle-in-the-same-pla}
 * for details on equation.
 *
 * @param {object} circle - Circle we are finding overlaps for
 * @param {array} circles - list of all circles
 * @returns {array} Array of circles that visually overlap with param 'circle' on drawboard
 *
 */
export function getOverlaps(circle, circles) {
  return circles.filter(function(c) {
    if (c.id === circle.id) {
      return false;
    }
    var mid = Math.pow(circle.x - c.x, 2) + Math.pow(circle.y - c.y, 2);
    var low = Math.pow(circle.radius - c.radius, 2);
    var high = Math.pow(circle.radius + c.radius, 2);
    return low <= mid && mid <= high;
  });
}

/**
 * Returns an array of circles that overlap with clicked coordinates
 * @param {array} point - X/Y coordinates of clicked circle on drawboard
 * @param {array} overlaps - Array of circles that overlap with the clicked circle
 * @returns {array} Array of circles that overlap with the param 'point' 
 */
export function getClickedOverlaps(point,overlaps) {
  return overlaps.filter(function(c) {
    var xDiff = point[0] - c.x;
    var yDiff = point[1] - c.y;
    return (Math.pow(xDiff, 2) + Math.pow(yDiff, 2)) < Math.pow(c.radius, 2);
  });
}



// Intersections

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

  i_x1 = Math.round10(xm + i_dx, -2);
  i_x2 = Math.round10(xm - i_dx, -2);

  i_y1 = Math.round10(ym - i_dy, -2);
  i_y2 = Math.round10(ym + i_dy, -2);

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


/*
 * Find out if point is within circle
 * @param {object} point - an intersection point.
 * @param {object} circle - a circle.
 * @returns {boolean} 
 *   Return true if `point` is within the `circle` (including on the line). Otherwise return false.
 *
 * @throws Will throw an Error if both arguments aren't present.
 * @throws Will throw an Type Error if `point` and `circle` are not their respective types.
 *
 * NOTE: because we round off x,y values for points, points might not 
 * satisfy circle equation for cases when the point is on the circumference line.
 *
 * TODO Consider not rounding points until we have to map it to pixel locations 
 * in SVG when rendering.
 *  
 * TODO Consider optimizing by looking into point.parentCircles.  No need to recalculate if point is in circle 'A', if point.parentCircles includes 'A'.
*/
export function isInCircle(point,circle) {
  if (point === undefined || circle === undefined) {
    throw new Error("Not enough arguments");
  }

  if (!isPoint(point)) {
    throw new TypeError("Argument 'point' is not a point");
  }

  if (!isCircle(circle)) {
    throw new TypeError("Argument 'circle' is not a circle");
  }


  var errorMargin = 3;
  var xd = point.x - circle.x;
  var yd = point.y - circle.y;

  // Rounding values to avoid edge cases where points have > 2 sig figs
  // Seems brittle, consider just using 3 sig figs for all x,y values in codebase
  // Turns out JS is brittle with floating point arithmetic, so lets just take floor of answer to ignore decimal values.
  var t1 = (xd*xd + yd*yd);
  var t2 = (circle.radius*circle.radius);
  return (Math.floor(t1) <= (Math.floor(t2) + errorMargin)) || 
    (Math.floor(t1) <= (Math.floor(t2) - errorMargin)); 

}

/*
 * Returns points that are 'covered' by all circles in `circles`.
 *
 * @param {Array} points - list of intersection points.
 * @param {Array} circles - list of circles to test point coverage.
 * @returns {Array} List of intersection points that are also within `circles`.
 *  Also includes points that lie on the circumference line a circle.
 *
 */
export function pointsWithinCircles(points, circles){
  return points.filter((point) => {
    return circles.reduce((memo, circle) => {
      return isInCircle(point, circle) && memo;
    }, true);
  });
}



/*
 * @param circles - list of circles that are 'clicked' from UI
 */
export function constructIntersectionPath(circles) {
  var points = getAllIntersections(circles);

  console.log('points:');
  console.log(points);
  if (points.length < 2) {
    // Then nothing to draw...
    // TODO Come up with a better return value then ''
    return "";
  }

  var origin = getCentroid(points);
  var sortedPoints = points.sort((a,b) => {

    var angle_A = computeAngle(a, origin);
    var angle_B = computeAngle(b, origin);

    if (angle_A < angle_B) {
      return -1; 
    }
    if (angle_A > angle_B) {
      return 1;
    }
    return 0;
  });

  // Round off points?

  // Construct Path string
  var coveredPoints = pointsWithinCircles(sortedPoints, circles);
  console.log('coveredPoints:');
  console.log(coveredPoints);

  var start = "M" + coveredPoints[0].x.toString() + " " + coveredPoints[0].y.toString();
  console.log(start);
  var arcs = genArcs(coveredPoints, circles);
  console.log('arcs:');
  console.log(arcs);
  var arcString = genArcString(arcs);
  console.log('arcstring:');
  console.log(arcString);

  return start + arcString + ' Z';
}

function genArcString(arcs) {
  return arcs.reduce((memo, arc) => {
    return memo + " A " + arc.rx.toString() + " " + 
     arc.ry.toString() + ", " +
     arc.xAxisRotation.toString() + ", " + 
     arc.largeArcFlag.toString() + ", " +
     arc.sweepFlag.toString() + ", " +
     arc.x.toString() + " " + arc.y.toString(); 
  }, '');
}

// Generate paths to draw arcs
//
// NOTE: if Math.atan2(dy, dx) < 0, add 2*Math.PI
/*
 * @param {Array} points - list of points representing an intersection area. Points are ordered by degrees in respect to midpoint (centroid). Degree 0 starts on positive x-axis, and increases as we go counterclockwise. 
 * @param {Array} circles - list of all circles.
 * @returns {Array} list of Objects with data for drawing an Arc.
 */
export function genArcs(points, circles){
  // get midpoint
  // in counterclockwise direction from angle 0 to 360 from center, create arc for each pair of points 
  // return list of arcs

  if (points.length <= 1) {
    return [];
  }

  if (points.length === 2) {
    // TODO handle this case:
    // gen arc for with values from parentCircles[0] and parentCircles[1]
    // NOTE:parentCircles should be same for both points

    if (!isEqual(points[0].parentCircles, points[1].parentCircles)) {
      console.log(points);
      throw Error('Both points should have same parentCircles');
    }

    let pCircles = points[0].parentCircles;

    let circleA = circles.filter((c) => {return c.id === pCircles[0]}).shift();
    let circleB = circles.filter((c) => {return c.id === pCircles[1]}).shift();
    
    //NOTE:
    //hardcode sweepFlag to 1 for now.
    //for simple intersection case, arcs go counterclockwise
    return [
      {
        rx: circleB.radius,
        ry: circleB.radius,
        xAxisRotation: 0,
        largeArcFlag: 0,
        sweepFlag: 1,
        x: points[1].x,
        y: points[1].y
      },
      {
        rx: circleA.radius,
        ry: circleA.radius,
        xAxisRotation: 0,
        largeArcFlag: 0,
        sweepFlag: 1,
        x: points[0].x,
        y: points[0].y
      },
    ];
  }  



  var result = [];

  // generate arcs between each point; x_1..x_n
  for (let i = 0, len = points.length; i < len; i++) {
    // get common circle between i and i+1
    let a = points[i];
    // generate arc for last point to first point; x_n -> x_1
    let b = (i === (len - 1)) ? points[0] : points[i+1];
    // if (i === (len-1)) {
    //   console.log(a);
    //   console.log(b);
    // }

    let circleIDs = arrayIntersection(a.parentCircles, b.parentCircles);
    if (circleIDs.length === 2) {
      console.log(circleIDs);
    }

    let circle = circles.filter((n) => {
      return n.id === circleIDs[0];
    }).shift();

    result.push({
      rx: circle.radius,
      ry: circle.radius,
      xAxisRotation: 0,
      largeArcFlag: 0,
      sweepFlag: 1,
      x: b.x,
      y: b.y
    });
  }

  return result;
}

// Takes two arrays, returns an array of intersections
function arrayIntersection(a,b) {
  return a.filter((n) => {
    return (b.indexOf(n) !== -1);
  });
}

function computeAngle(point, origin) {
  var angle = Math.atan2(point.y - origin.y, point.x - origin.x);
  if (angle < 0) {
    angle += (2 * Math.PI);
  }
  return angle;
}

/*
 * Calculates centroid from list of points.
 * @param {Array} points - List of Objects that have 'x' and 'y' properties.
 * @returns {Object} centroid as an Object with x,y coordinates, if centroid exists.  Else returns null.
 *
 * NOTE: points do not need to have parentCircles
 */
export function getCentroid(points) {
  if (points.length === 0) {
    return null; 
  }
  var sum = points.reduce((memo, point) => {
    memo.x += point.x;
    memo.y += point.y;
    return memo;
  }, {x:0, y:0});

  sum.x = sum.x / points.length;
  sum.y = sum.y / points.length;
  return sum;
}


// TODO clean this up, not using at the moment.
// Alternative, more rigorous approach: check if args are instances of respective Class. 
// However we will have to refactor the rest of code to use Classes as well.
function check(arg, checker) {
  if (!checker.call(undefined, arg)) {
    throw new Error('Checker failed for argument\n\tChecker: ' + checker + '\n\tArg: ' + arg); 
  }
}
