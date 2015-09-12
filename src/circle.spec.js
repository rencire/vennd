'use strict';

import {getAllIntersections, getIntersections, isInCircle} from './circle';

// NOTE: Test data generated from Wolfram Alpha.
// e.g; http://www.wolframalpha.com/input/?i=%28x-10%29^2+%2B+%28y-10%29^2+%3D+25%2C+%28x-2%29^2+%2B+%28y-13%29^2+%3D+16%2C+
//
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
    expect(() => {getIntersections(c1)}).toThrowError("Not enough arguments");
    expect(() => {getIntersections(null,3)}).toThrowError(TypeError, "Arguments are not circles");
    expect(() => {getIntersections({},{})}).toThrowError(TypeError, "Arguments are not circles");
    expect(() => {getIntersections({}, {radius:4}); }).toThrowError(TypeError, "Arguments are not circles");
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

    for (var i = expected.length - 1; i >= 0; i--) {
      expect(result).toContain(expected[i]);
    }

  });

  it('two overlap each other, one overlap only one', () => {
    var circles = [
      {id:1, x:20, y:20, radius:5},
      {id:2, x:25, y:25, radius:4},
      {id:3, x:12, y:20, radius:5},
    ];

    var expected = [
      {x:16, y:17,  parentCircles:[1,3]},
      {x:16, y:23, parentCircles:[1,3]},
      {x:21, y:25,  parentCircles:[1,2]},
      {x:25, y:21, parentCircles:[1,2]},
    ];

    var result = getAllIntersections(circles);

    for (var i = expected.length - 1; i >= 0; i--) {
      expect(result).toContain(expected[i]);
    }
  });

  it('multiple circles with no overlap', () => {
    var circles = [
      {id:1, x:7, y:7, radius:5},
      {id:2, x:10, y:25, radius:4},
      {id:3, x:20, y:15, radius:4},
    ];

    expect(getAllIntersections(circles)).toEqual([]);
    
  });

  it('empty circle list', () => {
    expect(getAllIntersections([])).toEqual([]); 
  });

  it('duplicate circles', () => {
    var c0 = {
      id: 1,
      x: 369, 
      y: 369,
      radius: 369,
    };

    expect(getAllIntersections([c0,c0])).toEqual([]); 
    expect(getAllIntersections([c0,c0, c0])).toEqual([]); 
  });

  it('same dimensions', () => {
    var same_1 = [
      {
        id: 1,
        x: 100, 
        y: 100,
        radius: 50,
      }, 
      {
        id: 2,
        x: 100, 
        y: 100,
        radius: 50,
      },
    ];

    var same_2 = [
      {
        id: 1,
        x: 42, 
        y: 42,
        radius: 42,
      }, 
      {
        id: 2,
        x: 42, 
        y: 42,
        radius: 42,
      }, 
      {
        id: 3,
        x: 42, 
        y: 42,
        radius: 42,
      }, 
    ];
    expect(getAllIntersections(same_1)).toEqual([]); 
    expect(getAllIntersections(same_2)).toEqual([]); 
  });

  it('circle within a circle within another circle', () => {
    var circles = [
      {
        id: 1,
        x: 10, 
        y: 10,
        radius: 10
      }, 
      {
        id: 5,
        x: 10,
        y: 10,
        radius: 5
      }, 
      {
        id: 9,
        x: 10,
        y: 10,
        radius: 2
      }, 
    ];
    expect(getAllIntersections(circles)).toEqual([]);
  });

  // TODO add test data
  it('circle1 intersect w/ circle2, both within circle3', () => {
    var circles = [
      {id:3, x:22, y:20, radius:10},
      {id:2, x:25, y:20, radius:5},
      {id:1, x:20, y:20, radius:5},
    ];

    var expected = [
      {x:23, y:16,  parentCircles:[2,1]},
      {x:23, y:24,  parentCircles:[2,1]},
    ];

    var result = getAllIntersections(circles);

    expect(result).toContain(expected[0]);
    expect(result).toContain(expected[1]);
  });

  it('invalid input', () => {
    expect(() => {getAllIntersections()}).toThrowError('Wrong number of arguments. Need one and only one argument'); 
    expect(() => {getAllIntersections(null)}).toThrowError(TypeError, 'Argument is not an array'); 
    expect(() => {getAllIntersections(123)}).toThrowError(TypeError, 'Argument is not an array'); 
    expect(() => {getAllIntersections('abcd')}).toThrowError(TypeError, 'Argument is not an array'); 
    expect(() => {getAllIntersections(undefined)}).toThrowError(TypeError, 'Argument is not an array'); 
    var circles = [{id:1, x:1, y:2, radius:5}, {blah:'bloop'}];
    expect(() => {getAllIntersections(circles)}).toThrowError(TypeError, 'List is not all circles'); 
  });
});


// Tests for checking if point is within a list of circles

describe('isInCircle correctly checks if point is in a circle...', () => {
  xit('points are in a circle', () => {
    var c = {id:2, x:20, y:30, radius:5};
    var p = {x:21, y:33, parentCircles:[3]};

    expect(isInCircle(p,c).toEqual(true));
  }); 

  xit('point not in circle', () => {
    var c = {id:2, x:20, y:30, radius:5};
    var p = {x:19, y:23, parentCircles:[42]};
    expect(isInCircle(p,c).toEqual(true));
  }); 

  xit('points exactly on the circumference line of circle', () => {
    var c0 = {id:2, x:20, y:30, radius:5};
    var c1 = {id:3, x:23, y:30, radius:5};
    var p = {x:22, y:25, parentCircles:[2,3]}; //intersection point on c0
    expect(isInCircle(p,c0).toEqual(true));
    expect(isInCircle(p,c1).toEqual(true));
  }); 


  it('invalid/valid circles', () => {
    var p = {x:20, y:30, parentCircles:[2,3]};
    var c0 = {blah:1}; // missing 'id', 'x', 'y', and 'radius'
    var c1 = {id:3, y:20, radius:10}; // missing 'x'

    var c2 = {id:3, x:10, y:20, radius:10}; 
 
    // something is very wrong here, 
    expect(() => {isInCircle(p, c0)}).toThrowError(TypeError, "Argument 'circle' is not a circle"); 
    expect(() => {isInCircle(p, c1)}).toThrowError(TypeError, "Argument 'circle' is not a circle"); 

    expect(() => {isInCircle(p, c2)}).not.toThrowError(); 
  }); 

  xit('invalid points', () => {

  }); 

  it('not enough arguments', ()=> {
    var p = {x:20, y:30, radius:5, parentCircles:[2,3]};
    expect(() => {isInCircle()}).toThrowError('Not enough arguments'); 
    expect(() => {isInCircle(p)}).toThrowError('Not enough arguments'); 
    expect(() => {isInCircle('hi')}).toThrowError('Not enough arguments'); 
  });

});

describe('pointsWithinCircles() returns correct list of points for...', () => {
  xit('point in circle', () => {

  }); 

  xit('point not in circle', () => {

  }); 

  xit('point exactly on the circumference line of circle', () => {

  }); 

  xit('empty list of points', () => {

  }); 

  xit('empty list of circles', () => {

  }); 

  // xit('invalid circles', () => {
  //
  // }); 
});


