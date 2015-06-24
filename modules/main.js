import { addEvent, getRandomInt, debounce } from './helpers.js';

function stopBubbleUp() {
    d3.event.stopPropagation();
}

var views = {};
var settings = {
    radius: 80,
    width: undefined,
    height: undefined,
    id_cnt: 0,
    file_id_cnt:  0,
};

    
// Adjust svg to window size

function initializePage() {
    // Initialize Elements 
    var main_div = d3.select("body").append("div")
        .attr('id', 'main');


    // visuals
    var visuals = main_div.append('div')
        .attr('class', 'visuals');

    var controls = visuals.append("div")
        .attr('class', 'controls');

    controls.append("button")
        .text('clear')
        .on('click', clearBoard);

    controls.append("button")
        .text('remove selected')
        .on('click', removeSelected);

    var drawboard = visuals.append('div')
        .attr('class', 'drawboard');



    var svg = drawboard.append('svg');

    settings.width = parseInt(svg.style('width'));
    settings.height = parseInt(svg.style('height'));

    // files
    var files_div = main_div.append('div')
        .attr('class', 'files');

    // var files_input = files_div.append('input')
    //     .attr('class', 'dropbox')
    //     .attr('type', 'file');

    var file_content = files_div.append('textarea')
        .attr('class', 'file-content');

    addEvent(window, 'resize', function() {
        settings.height = parseInt(svg.style('height'));
        settings.width = parseInt(svg.style('width'));
    });

    views.main_div = main_div;
    views.visuals = visuals;
    views.controls = controls;
    views.drawboard = drawboard;
    views.svg = svg;
    views.files_div = files_div;
    // views.files_input = files_input;
    views.file_content = file_content;
}


// State

var circles = [];


// State functions

function inBounds(point) {
    return point.x >= 0 && point.x <= settings.width && point.y >= 0 && point.y <= settings.height;
}


function isFreeArea(point) {
    return circles.every(function(circle) {
        return (Math.pow((point.x - circle.point.x),2) + Math.pow((point.y - circle.point.y),2)) > Math.pow(settings.radius,2);
    });
}

function renderFiles(){
    views.files_div.append('div')
        .attr('class', 'dropbox')
        .attr('type', 'file');
}

// TODO break this up into separate operations if needed (update, enter, exit)
function renderBoard() {
    var circle = views.svg.selectAll('circle').data(circles, function(d){return d.id;});

    // update
    // NOTE: x, y coords are updated automatically in #dragmove
    //      'selected' also upddated in #toggleSelected

    // enter
    circle.enter().append('circle')
        .attr("r", settings.radius)
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
    if (d.selected && d.file) {
        displayFileContents(d.file);    
    } else {
        views.file_content.text('');
    }
}

// TODO get rid of d3 and code a drag solution with vanilla javascript
function dragmove(d) {
    d3.select(this)
        .attr("cx", d.point.x = Math.max(0, Math.min(settings.width, d3.event.x)))
        .attr("cy", d.point.y = Math.max(0, Math.min(settings.height, d3.event.y)));
}

var dragBehavior = d3.behavior.drag()
    .origin(function(d) { 
        return d.point; 
    })
    // .on("dragstart", markSelected)
    .on("drag", dragmove);






function generateRandomValidPoint() {
    var point = {x: getRandomInt(0, settings.width), y: getRandomInt(0, settings.height)};
    while(!isFreeArea(point)) {
        point = {x: getRandomInt(0, settings.width), y: getRandomInt(0, settings.height)};
    }
    return point;
}

function addCircle(file) {
    var coord;
    var circle;
    if (file) {
        // generate random coords
        var point = generateRandomValidPoint();
        circle = {id: settings.id_cnt, point: point, selected: false, file: file};
    } else {
        // check if not clicking an area with circle
        var point = d3.mouse(this);
        circle = {id: settings.id_cnt, point: {x: point[0], y: point[1]}, selected: false, file: file};

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
    settings.id_cnt += 1;
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


// Files
function handleFiles(files) {
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var imageType = /^text\//;

        if (!imageType.test(file.type)) {
            continue;
        }

        addCircle(file);

        // var img = document.createElement("img");
        // img.classList.add("obj");
        // img.file = file;
        // main_div[0][0].appendChild(img); // Assuming that "preview" is the div output where the content will be displayed.

        // var reader = new FileReader();
        // Q: Why use an immediately invoking function expresssion?
        // A: because 'img' might come from last iteration in loop. 
        // reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
        // reader.readAsDataURL(file);
    }
}

function displayFileContents(file) {
    if (file == null) {
        
    }
    var reader = new FileReader();
    reader.onload = function(e) { views.file_content.text(e.target.result); }; 
    reader.readAsText(file);
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

    var dt = e.dataTransfer;
    var files = dt.files;
    handleFiles(files);
}

//hanldeFiles example from https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications

function setupFileDrop() {
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
}

// http://developers.arcgis.com/javascript/sandbox/sandbox.html?sample=exp_dragdrop

initializePage();
renderBoard();
setupFileDrop();

function uploadDragEnter(e) {
    e.stopPropagation();
    e.preventDefault();
    var dt = e.dataTransfer;
    console.log(e);

}


function uploadDragLeave(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log(e);
}

function uploadDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    var dt = e.dataTransfer;
    dt.dropEffect = 'copy';
    console.log(e);
}

function uploadDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log(e);
}



var drawboard = document.getElementsByClassName('drawboard')[0];
drawboard.addEventListener("dragenter", uploadDragEnter, false);
drawboard.addEventListener("dragover", uploadDragOver, false);
drawboard.addEventListener("dragleave", uploadDragLeave, false);
drawboard.addEventListener("drop", uploadDrop, false);

// do not allow dropping files anywhere in body
function handleDocumentDragEnter(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log('document enter');
    console.log(e);
    console.log(e.currentTarget);
    console.log(e.target);
    var dt = e.dataTransfer;
    dt.effectAllowed = dt.dropEffect = 'none';
    // insert drop-layer to drawboard
    var text = document.createTextNode('drop your files here!');
    var dropLayer = document.createElement('div');
    dropLayer.setAttribute('class', 'drop-layer');
    dropLayer.appendChild(text);

    drawboard.appendChild(dropLayer);
}

document.body.addEventListener("dragenter", debounce(handleDocumentDragEnter,300, true), false);

// On latest version of firefox, this event keeps propogating unless we call e.stopPropagation...
// ...Why does this happen?
// A: looks like it is fired once from div.files, and once for body... why?

document.body.addEventListener("dragover", function(e) {
    e.stopPropagation();
    e.preventDefault();
    // console.log('document dragover');
    // console.log(e.target);
    var dt = e.dataTransfer;
    dt.effectAllowed = dt.dropEffect = 'none';
}, false);

document.body.addEventListener("dragleave", function(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log('document dragleave');
    console.log(e.target);
    var dropLayer = document.getElementsByClassName('drop-layer')[0];
    drawboard.removeChild(dropLayer);
}, false);

