'use strict';

import {getIntersections} from './circle';

describe('get correct intersections for...', () => {
  it('empty circle list', () => {
    let circles = [];
    expect(getIntersections(circles)).toEqual([]); 
  });

  it('duplicate circles', () => {
    let circles = [
      {
        id: 1,
        point: {x: 100, y: 100},
        radius: 50
      }, 
      {
        id: 2,
        point: {x: 100, y: 100},
        radius: 50
      }, 
    ];
    expect(getIntersections(circles)).toEqual([]); 
  });

  it('circles within other circles', () => {

  });

  it('circles that do not overlap', () => {
    let circles = [
      {
        id: 1,
        point: {x: 100, y: 100},
        radius: 50
      }, 
      {
        id: 2,
        point: {x: 150, y: 150},
        radius: 50
      }, 
    ];

    let points = [];
    expect(getIntersections(circles)).toEqual([]); 
  });

  it('two overlapping circles', () => {
    let circles = [
      {
        id: 1,
        point: {x: 100, y: 100},
        radius: 50
      }, 
      {
        id: 2,
        point: {x: 105, y: 105},
        radius: 50
      }, 
    ];

    let points = [
      {x:95.886, y:109.114, parentCircles: [1,2]},
      {x:109.114, y:95.886, parentCircles: [1,2]},
    ];
    expect(getIntersections(circles)).toEqual(points); 

  });

  it('invalid input', () => {
    expect(getIntersections(null)).toEqual(null); 
    expect(getIntersections(123)).toEqual(null);
    expect(getIntersections('abcd')).toEqual(null); 
  });
});

