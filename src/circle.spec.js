'use strict';

import {getAllIntersections} from './circle';

describe('get correct intersections for two circles with...', () => {
  it('same radius, translated', () => {
    var c1 = {id:1, center:{x:20, y:20}, radius: 49};
    var c2 = {id:2, center:{x:30, y:20}, radius: 49};

    var exp_p1 = {x:25, y: 15.101};
    var exp_p2 = {x:25, y: 24.899};

    var result = getIntersections(c1,c2).sort();
    var res_p1 = result[0];
    var res_p2 = result[1];

    expect({x:res_p1.x y: res_p1.y}).toEqual(exp_p1);
    expect(res_p1.parentCircles).toContain(1);
    expect(res_p1.parentCircles).toContain(2);

    expect({x:res_p2.x y: res_p2.y}).toEqual(exp_p2);
    expect(res_p2.parentCircles).toContain(1);
    expect(res_p2.parentCircles).toContain(2);
  });

  it('different radius, different center coordinates', () => {
    var c1 = {id:3, center:{x:20, y:20}, radius: 25};
    var c2 = {id:4, center:{x:25, y:25}, radius: 36};

    var result = getIntersections(c1,c2).sort();
    var ip1 = result[0];
    var ip2 = result[1];

    expect(ip1.x).toEqual(19);
    expect(ip1.y).toEqual(24.889);
    expect(ip1.parentCircles).toContain(3);
    expect(ip1.parentCircles).toContain(4);

    expect(ip2.x).toEqual(24.899);
    expect(ip2.y).toEqual(19);
    expect(ip2.parentCircles).toContain(3);
    expect(ip2.parentCircles).toContain(4);
  });

  it('duplicate circles', () => {
    var c1 = {id:3, center:{x:20, y:20}, radius: 25};
    expect(getIntersections(c1,c1)).toEqual([]);
  });

  it('only one intersection point', () => {
    var c1 = {id:4, center:{x:10, y:10}, radius:5};
    var c2 = {id:7, center:{x:20, y:10}, radius:5};
    var ip1 = getIntersections(c1, c2)[0];
    expect(ip1.x).toEqual(15);
    expect(ip1.y).toEqual(10);
    expect(ip1.parentCircles).toContain(4);
    expect(ip1.parentCircles).toContain(7);
  });

});

describe('get all correct intersections for...', () => {
  it('empty circle list', () => {
    let circles = [];
    expect(getAllIntersections(circles)).toEqual([]); 
  });

  it('duplicate circles', () => {
    let circles = [
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

  xit('circles within other circles', () => {

  });

  it('circles that do not overlap', () => {
    let circles = [
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
    ];

    let points = [];
    expect(getAllIntersections(circles)).toEqual([]); 
  });

  it('two overlapping circles', () => {
    let circles = [
      {
        id: 1,
        center: {x: 100, y: 100},
        radius: 50
      }, 
      {
        id: 2,
        center: {x: 105, y: 105},
        radius: 50
      }, 
    ];

    let points = [
      {x:95.886, y:109.114, parentCircles: [1,2]},
      {x:109.114, y:95.886, parentCircles: [1,2]},
    ];
    expect(getAllIntersections(circles)).toEqual(points); 

  });

  it('invalid input', () => {
    expect(getAllIntersections(null)).toEqual(null); 
    expect(getAllIntersections(123)).toEqual(null);
    expect(getAllIntersections('abcd')).toEqual(null); 
  });
});

