'use strict';

import {getAllIntersections, getIntersections} from './circle';

describe('get correct intersections for two circles with...', () => {
  it('same radius, translated', () => {
    var c1 = {id:1, center:{x:20, y:20}, radius: 7};
    var c2 = {id:2, center:{x:30, y:20}, radius: 7};

    var exp_p1 = {x:25, y: 15.101};
    var exp_p2 = {x:25, y: 24.899};

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
    var c1 = {id:3, center:{x:20, y:20}, radius: 5};
    var c2 = {id:4, center:{x:25, y:25}, radius: 6};

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

  it('duplicate dimensions', () => {
    var c1 = {id:3, center:{x:20, y:20}, radius: 5};
    var c2 = {id:8, center:{x:20, y:20}, radius: 5};
    expect(getIntersections(c1,c2)).toEqual([]);
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

  it('no intersection points', () => {
    var c1 = {id:42, center:{x:0, y:0}, radius: 5};
    var c2 = {id:3, center:{x:20, y:20}, radius: 5};
    
    expect(getIntersections(c1,c2)).toEqual([]);
  });

  it('circle within another circle', () => {
    var c1 = {
      id: 1,
      center: {x: 20, y: 20},
      radius: 10
    }; 

    var c2 = {
      id: 5,
      center: {x: 20, y: 20},
      radius: 5
    };
    expect(getIntersections(c1,c2)).toEqual([]);
  });

  it('invalid input will throw errors', () => {
    var c1 = {id:4, center:{x:10, y:10}, radius:5};
    expect(getIntersections(c1)).toThrowError("Not enough arguments");
    expect(getIntersections(null,3)).toThrowError("Arguments are not circles");
  });

});



//TODO fill in pending tests
describe('get all correct intersections for...', () => {

  //TODO setup data to test
  xit('multiple overlapping circles', () => {
    // TODO add another circle to test
    // let circles = [
    //   {
    //     id: 1,
    //     center: {x: 100, y: 100},
    //     radius: 50
    //   }, 
    //   {
    //     id: 2,
    //     center: {x: 105, y: 105},
    //     radius: 50
    //   }, 
    // ];
    //
    // let points = [
    //   {x:95.886, y:109.114, parentCircles: [1,2]},
    //   {x:109.114, y:95.886, parentCircles: [1,2]},
    // ];
    // expect(getAllIntersections(circles)).toEqual(points); 

  });

  //TODO setup data to test 'exp_points', 'points', etc.
  xit('multiple circles that do not all overlap', () => {
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

  it('empty circle list', () => {
    let circles = [];
    expect(getAllIntersections(circles)).toEqual([]); 
  });

  it('duplicate circles', () => {
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

  it('circles w/ duplicate dimensions', () => {
    var c1 = {id:3, center:{x:20, y:20}, radius: 5};
    var c2 = {id:8, center:{x:20, y:20}, radius: 5};
    var c3 = {id:8, center:{x:20, y:20}, radius: 5};
    expect(getAllIntersections([c1,c2, c3])).toEqual([]);
  });

  it('circles within other circles', () => {
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

  it('invalid input', () => {
    expect(getAllIntersections(null)).toThrowError('Argument is not a list'); 
    expect(getAllIntersections(123)).toThrowError('Argument is not a list'); 
    expect(getAllIntersections('abcd')).toThrowError('Argument is not a list'); 
  });
});

