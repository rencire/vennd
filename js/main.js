// main div
var main_div = d3.select("body").append("div")
    .attr('id', 'main');


// visuals
var visuals = main_div.append('div')
    .attr('id', 'visuals');

var controls = visuals.append("div")
    .classed('controls', true);

controls.append("button")
    .text('clear')
    .on('click', clearBoard);

controls.append("button")
    .text('remove selected')
    .on('click', removeSelected);

var svg = visuals.append("svg")
    // .on("dragenter", dragenter)
    // .on("dragover", dragover)
    .on("mousedown", addCircle);

    // .on('click', handleClickTest);


var width = parseInt(svg.style('width')),
    height = parseInt(svg.style('height')),
    radius = 80;

// files
var files = main_div.append('div')
    .attr('id', 'files');

var input = files.append('input')
    .attr('class', 'dropbox')
    .attr('type', 'file')
    .on("drop", drop);




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

// initialize empty data on page load
var coordinates = [];

function stopBubbleUp() {
    d3.event.stopPropagation();
}

function inBounds(coord) {
    return coord.x >= 0 && coord.x <= width && coord.y >= 0 && coord.y <= height;
}


function isFreeArea(coord) {
    return coordinates.every(function(c) {
        return (Math.pow((coord.x - c.x),2) + Math.pow((coord.y - c.y),2)) > Math.pow(radius,2);
    });
}


// TODO break this up into separate operations if needed (update, enter, exit)
function renderBoard() {
    var circle = svg.selectAll('circle').data(coordinates, function(d){return d.id;});

    // update
    // NOTE: x, y coords are updated automatically in #dragmove
    //      'selected' also upddated in #toggleSelected

    // enter
    circle.enter().append('circle')
        .attr("r", radius)
        .attr("cx", function(d){return d.x;})
        .attr("cy", function(d){return d.y;})
        .classed('selected', function(d){return d.selected;})
        .on('click', toggleSelected)
        .on('mousedown', stopBubbleUp)
        .call(dragBehavior);

    // exit
    circle.exit().remove();
}

function toggleSelected(d) {
    if (d3.event.defaultPrevented) return; // click suppressed by drag behavior
    d3.event.stopPropagation();
    d3.select(this)
        .classed('selected', d.selected = !d.selected);
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

    if (!inBounds(coord)) {
        console.log('ERROR: Coordinates out of bounds.') ;
        return;
    }
    if (!isFreeArea(coord)) {
        // This block will never execute from UI because 'click' event handlers for 'circles' will stopDefaultPropagation for parent 'click' event handlers.
        // Still useful if people are messing with the console to add circles.
        console.log("ERROR: Circle already exists in that spot.");
        return;
    }
    coordinates.push(coord);
    //TODO Q: How to drag a shape after creating it?
    // A: don't implement this feature for now...
    id_cnt += 1;
    renderBoard();
}

function removeSelected() {
    coordinates = coordinates.filter(function(d){
        return !d.selected;
    }); 
    renderBoard();
}

function clearBoard() {
    coordinates = [];
    renderBoard();
}



// File Input
// var inputElement = document.getElementById("input");
// // var inputElement = d3.select("input");
// inputElement.addEventListener("change", handleFiles, false);
// function handleFiles() {
//     var fileList = this.files;
//     console.log(fileList);
// }

// Vanilla JS for binding drop events
// var dropboxes;
// dropboxes = document.getElementsByClassName("dropbox");
// dropboxes.forEach(function(e) {
//     e.addEventListener("dragenter", dragenter, false);
//     e.addEventListener("dragover", dragover, false);
//     e.addEventListener("drop", drop, false);
//
// });

function dragenter(e) {
    e.stopPropogation();
    e.preventDefault();
}

function dragover(e) {
    e.stopPropogation();
    e.preventDefault();
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();

    console.log('registered drop');
    var dt = e.dataTransfer;
    var files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    console.log(files.length);
}
function handleClickTest() {
    console.log('clicked on input');
}

// http://developers.arcgis.com/javascript/sandbox/sandbox.html?sample=exp_dragdrop

