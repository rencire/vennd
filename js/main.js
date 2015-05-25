var controls = d3.select("body").append("div")
    .classed('controls', true);

controls.append("button")
    .text('clear')
    .on('click', clearBoard);

controls.append("button")
    .text('remove selected')
    .on('click', removeSelected);

var svg = d3.select("body").append("div")
    .append("svg")
    .on("mousedown", addCircle);

var width = parseInt(svg.style('width')),
    height = parseInt(svg.style('height')),
    radius = 80;


var id_cnt = 0;

// http://stackoverflow.com/questions/641857/javascript-window-resize-event
// type should be name of event to listen to, e.g 'resize'
var addEvent = function(elem, type, eventHandle) {
    if (elem === null || typeof(elem) === 'undefined') return;
    if ( elem.addEventListener ) {
        elem.addEventListener( type, eventHandle, false );
    } else if ( elem.attachEvent ) {
        elem.attachEvent( "on" + type, eventHandle );
    } else {
        elem["on"+type]=eventHandle;
    }
};

addEvent(window, 'resize', function() {
    height = parseInt(svg.style('height'));
    width = parseInt(svg.style('width'));
});

var coordinates = [];
// d refers to the datum bound to svg(?)
// So, how does 'this' (circle element) know the data of its parent, 'svg'?
//
// Looks like circle has a __data__ reference to parent svg's datum...
//
// How does it work?!
// Answer: child element inherits data from parent.
//
//

// replace custom reduce fn with Array's built-in fn later.
function reduce(a,combine, start) {
    var result = start;
    a.forEach(function(v) {
        result = combine(result, v);
    });
    return result;
}


function isFreeArea(coord) {
    // check if coord is within the area of 
    // each circle in coordinates list.
    // If so, then return false
    // else return true
    return reduce(coordinates, function(memo, value) {
        var outside_circle = (Math.pow((coord.x - value.x),2) + 
                         Math.pow((coord.y - value.y),2)) > Math.pow(radius,2);
        return memo && outside_circle;
    }, true);
}



function renderBoard() {
    console.log(coordinates);
    var circle = svg.selectAll('circle').data(coordinates, function(d){return d.id;});

    // update
    // NOTE: x, y coords are updated automatically by Drag behavior(?)
    circle.classed('selected', function(d){return d.selected;});

    // enter
    circle.enter().append('circle')
        .attr("r", radius)
        .attr("cx", function(d){return d.x;})
        .attr("cy", function(d){return d.y;})
        // .attr("_id", function(d){return d.id;})
        .classed('selected', function(d){return d.selected;})
        .on('click', toggleSelected)
        .call(dragBehavior);

    // exit
    circle.exit().remove();
}

function toggleSelected() {
    if (d3.event.defaultPrevented) return; // click suppressed

    // var id = parseInt(d3.select(this).attr('_id'));
    var selected_id = d3.select(this).datum().id;
    // find coord in data, mark selected as true
    coordinates.forEach(function(v) {
        if ( v.id === selected_id) {
            v.selected = !v.selected;
        }
    });
    // d3.select(this).classed('selected', function(){
    //     return ! d3.select(this).classed('selected');
    // });
    renderBoard();
}

function dragmove(d) {
    d3.select(this)
        .attr("cx", d.x = Math.max(0, Math.min(width, d3.event.x)))
        .attr("cy", d.y = Math.max(0, Math.min(height, d3.event.y)));
}

var dragBehavior = d3.behavior.drag()
    .origin(function(d) { 
        return d; 
    })
    // .on("dragstart", markSelected)
    .on("drag", dragmove);

renderBoard();

function addCircle() {
    // check if not clicking an area with circle
    var point = d3.mouse(this);
    var coord = {id: id_cnt, x: point[0], y: point[1], selected: false};
    if (isFreeArea(coord)) {
        coordinates.push(coord);
        //TODO Q: How to drag a shape after creating it?
        // A: don't implement this feature for now...
        console.log(coord);
        id_cnt += 1;
        renderBoard();
    } else {
        // console.log('not in free area');
    }
}

function removeSelected() {
    coordinates = coordinates.filter(function(d){
        return !d.selected;
    }); 
    // d3.selectAll('circle').data(coordinates).exit().remove(); renderBoard();
    renderBoard();
}

function clearBoard() {
    coordinates = [];
    renderBoard();
}

// function removeCircle(d) {
//     coordinates = coordinates.filter(function(ele,i) {
//         return ele.x !== d.x && ele.y !== d.y;
//     }); 
// }

// var svg2 = d3.select("#test")
//         .attr("width", width)
//         .attr("height", height);
//         .on("click", function() {
//             console.log(d3.mouse(svg2.node));
//         });
