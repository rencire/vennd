'use strict';

import {getAllIntersections, getIntersections} from './circle';

describe('get correct intersections for two circles with...', () => {
  it('same radius, translated', () => {
    var c1 = {id:1, x:20, y:20, radius: 7};
    var c2 = {id:2, x:30, y:20, radius: 7};

    var exp_p1 = {x:25, y: 15};
    var exp_p2 = {x:25, y: 25};

    var result = getIntersections(c1,c2).sort();
    var res_p1 = result[0];
    var res_p2 = result[1];

    expect({x: res_p1.x, y: res_p1.y}).toEqual(exp_p1);
    expect(res_p1.parentCircles).toContain(1);
    expect(res_p1.parentCircles).toContain(2);

    expect({x: res_p2.x, y: res_p2.y}).toEqual(exp_p2);
    expect(res_p2.parentCircles).toContain(1);
    expect(res_p2.parentCircles).toContain(2);
  });

  it('different radius, different center coordinates', () => {
    var c1 = {id:3, x:20, y:20, radius: 5};
    var c2 = {id:4, x:25, y:25, radius: 6};

    var result = getIntersections(c1,c2).sort();
    var ip1 = result[0];
    var ip2 = result[1];

    expect(ip1.x).toEqual(25);
    expect(ip1.y).toEqual(19);
    expect(ip1.parentCircles).toContain(3);
    expect(ip1.parentCircles).toContain(4);

    expect(ip2.x).toEqual(19);
    expect(ip2.y).toEqual(25);
    expect(ip2.parentCircles).toContain(3);
    expect(ip2.parentCircles).toContain(4);
  });

  it('duplicate dimensions', () => {
    var c1 = {id:3, x:20, y:20, radius: 5};
    var c2 = {id:8, x:20, y:20, radius: 5};
    expect(getIntersections(c1,c2)).toEqual([]);
  });

  it('only one intersection point', () => {
    var c1 = {id:4, x:10, y:10, radius:5};
    var c2 = {id:7, x:20, y:10, radius:5};
    var result = getIntersections(c1, c2);
    var ip1 = result[0];

    expect(result.length).toEqual(1);
    expect(ip1.x).toEqual(15);
    expect(ip1.y).toEqual(10);
    expect(ip1.parentCircles).toContain(4);
    expect(ip1.parentCircles).toContain(7);
  });

  it('no intersection points', () => {
    var c1 = {id:42, x:0, y:0, radius: 5};
    var c2 = {id:3, x:20, y:20, radius: 5};
    
    expect(getIntersections(c1,c2)).toEqual([]);
  });

  it('circle within another circle', () => {
    var c1 = {
      id: 1,
      x: 20,
      y: 20,
      radius: 10
    }; 

    var c2 = {
      id: 5,
      x: 20, 
      y: 20,
      radius: 5
    };
    expect(getIntersections(c1,c2)).toEqual([]);
  });

  it('invalid input will throw errors', () => {
    var c1 = {id:4, x:10, y:10, radius:5};
    expect(function(){getIntersections(c1)}).toThrowError("Not enough arguments");
    expect(function(){getIntersections(null,3)}).toThrowError(TypeError, "Arguments are not circles");
    expect(function(){getIntersections({},{})}).toThrowError(TypeError, "Arguments are not circles");
    expect(function(){getIntersections({}, {radius:4}); }).toThrowError(TypeError, "Arguments are not circles");
  });

});



//TODO fill in pending tests
describe('get all correct intersections for...', () => {

  it('all overlap each other', () => {
    var circles = [
      {id:1, x:5, y:10, radius:5},
      {id:4, x:10, y:10, radius:5},
      {id:7, x:2, y:13, radius:4},
    ];

    var expected = [
      {x:8, y:6,  parentCircles:[1,4]},
      {x:8, y:14, parentCircles:[1,4]},
      {x:0, y:10, parentCircles:[1,7]},
      {x:5, y:15, parentCircles:[1,7]},
      {x:5, y:10, parentCircles:[4,7]},
      {x:6, y:13, parentCircles:[4,7]},
    ];

    var result = getAllIntersections(circles);

    expect(result).toContain(expected[0]);
    expect(result).toContain(expected[1]);
    expect(result).toContain(expected[2]);
    expect(result).toContain(expected[3]);
    expect(result).toContain(expected[4]);
    expect(result).toContain(expected[5]);

  });

  //TODO setup data to test 'exp_points', 'points', etc.
  xit('two overlap each other, one overlap only one', () => {
    var circles = [
      {
        id: 1,
        center: {x: 100, y: 100},
        radius: 50
      }, 
      {
        id: 2,
        center: {x: 150, y: 150},
        radius: 50
      }, 
      {
        id: 3,
        center: {x: 333, y: 333},
        radius: 33
      }
    ];

    var points = [];
    var exp_points = [];

    expect(getAllIntersections(circles)).toEqual(exp_points); 
  });

  xit('multiple circles with no overlap', () => {
  });

  xit('empty circle list', () => {
    let circles = [];
    expect(getAllIntersections(circles)).toEqual([]); 
  });

  xit('duplicate circles', () => {
    var circles = [
      {
        id: 1,
        center: {x: 100, y: 100},
        radius: 50
      }, 
      {
        id: 2,
        center: {x: 100, y: 100},
        radius: 50
      }, 
    ];
    expect(getAllIntersections(circles)).toEqual([]); 
  });

  xit('circles w/ duplicate dimensions', () => {
    var c1 = {id:3, x:20, y:20, radius: 5};
    var c2 = {id:8, x:20, y:20, radius: 5};
    var c3 = {id:8, x:20, y:20, radius: 5};
    expect(getAllIntersections([c1,c2, c3])).toEqual([]);
  });

  xit('circles within other circles', () => {
    var circles = [
      {
        id: 1,
        center: {x: 10, y: 10},
        radius: 10
      }, 
      {
        id: 5,
        center: {x: 10, y: 10},
        radius: 5
      }, 
      {
        id: 9,
        center: {x: 10, y: 10},
        radius: 2
      }, 
    ];
    expect(getAllIntersections(circles)).toEqual([]);
  });

  xit('circle1 intersect w/ circle2, both within circle3', () => {
  });

  xit('invalid input', () => {
    expect(getAllIntersections(null)).toThrowError('Argument is not a list'); 
    expect(getAllIntersections(123)).toThrowError('Argument is not a list'); 
    expect(getAllIntersections('abcd')).toThrowError('Argument is not a list'); 
  });
});

