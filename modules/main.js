import { addEvent, getRandomInt } from './helpers.js';

function stopBubbleUp() {
    d3.event.stopPropagation();
}

// Initialize Elements 
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
    .attr('type', 'file');
    // .on("drop", drop);


var id_cnt = 0;
var file_id_cnt = 0;

addEvent(window, 'resize', function() {
    height = parseInt(svg.style('height'));
    width = parseInt(svg.style('width'));
});


// State
var circles = [];


// State functions

function inBounds(point) {
    return point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height;
}


function isFreeArea(point) {
    return circles.every(function(circle) {
        return (Math.pow((point.x - circle.point.x),2) + Math.pow((point.y - circle.point.y),2)) > Math.pow(radius,2);
    });
}


// TODO break this up into separate operations if needed (update, enter, exit)
function renderBoard() {
    var circle = svg.selectAll('circle').data(circles, function(d){return d.id;});

    // update
    // NOTE: x, y coords are updated automatically in #dragmove
    //      'selected' also upddated in #toggleSelected

    // enter
    circle.enter().append('circle')
        .attr("r", radius)
        .attr("cx", function(d){return d.point.x;})
        .attr("cy", function(d){return d.point.y;})
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
        .attr("cx", d.point.x = Math.max(0, Math.min(width, d3.event.x)))
        .attr("cy", d.point.y = Math.max(0, Math.min(height, d3.event.y)));
}

var dragBehavior = d3.behavior.drag()
    .origin(function(d) { 
        return d.point; 
    })
    // .on("dragstart", markSelected)
    .on("drag", dragmove);

renderBoard();





function generateRandomValidPoint() {
    var point = {x: getRandomInt(0, width), y: getRandomInt(0, height)};
    while(!isFreeArea(point)) {
        point = {x: getRandomInt(0, width), y: getRandomInt(0, height)};
    }
    return point;
};

function addCircle(file) {
    var coord;
    var circle;
    if (file) {
        // generate random coords
        var point = generateRandomValidPoint();
        circle = {id: id_cnt, point: point, selected: false, file: file};
    } else {
        // check if not clicking an area with circle
        var point = d3.mouse(this);
        circle = {id: id_cnt, point: {x: point[0], y: point[1]}, selected: false, file: file};

        if (!inBounds(circle.point)) {
            console.log('ERROR: circles out of bounds.') ;
            return;
        }
        if (!isFreeArea(circle.point)) {
            // This block will never execute from UI because 'click' event handlers for 'circles' will stopDefaultPropagation for parent 'click' event handlers.
            // Still useful if people are messing with the console to add circles.
            console.log("ERROR: Circle already exists in that spot.");
            return;
        }
    }

    circles.push(circle);
    //TODO Q: How to drag a shape after creating it?
    // A: don't implement this feature for now...
    id_cnt += 1;
    renderBoard();
}

function removeSelected() {
    circles = circles.filter(function(d){
        return !d.selected;
    }); 
    renderBoard();
}

function clearBoard() {
    circles = [];
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
var dropboxes;
dropboxes = document.getElementsByClassName("dropbox");

// See: "Why is NodeList not an Array?"
// https://developer.mozilla.org/en-US/docs/Web/API/NodeList
// dropboxes.forEach(function(e) {
//     e.addEventListener("dragenter", dragenter, false);
//     e.addEventListener("dragover", dragover, false);
//     e.addEventListener("drop", drop, false);
//
// });

for (var i = 0, len = dropboxes.length; i < len; i++) {
    var input_ele = dropboxes[i];
    input_ele.addEventListener("dragenter", dragenter, false);
    input_ele.addEventListener("dragover", dragover, false);
    input_ele.addEventListener("drop", drop, false);
}

function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e) {
    e.stopPropagation();
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

//hanldeFiles example from https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
function handleFiles(files) {
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var imageType = /^image\//;

        if (!imageType.test(file.type)) {
            continue;
        }

        // add as a coordinate
        addCircle(file);

        // var img = document.createElement("img");
        // img.classList.add("obj");
        // img.file = file;
        // main_div[0][0].appendChild(img); // Assuming that "preview" is the div output where the content will be displayed.

        // var reader = new FileReader();
        // Q: Why use an immediately invoking function expresssion?
        // reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
        // reader.readAsDataURL(file);
    }
}


// http://developers.arcgis.com/javascript/sandbox/sandbox.html?sample=exp_dragdrop
