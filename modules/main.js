import { addEvent, getRandomInt, debounce } from './helpers.js';
import { makeDragzone } from './dragzone.js';

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

// forget this intialize page
function initializePage() {
    // bind buttons
    document.querySelector('.clear-btn').addEventListener('click', clearBoard, false);
    document.querySelector('.rm-sel-btn').addEventListener('click', removeSelected, false);

    // track width/height of svg for circle bounds
    var drawboard = d3.select('.drawboard');

    settings.width = parseInt(drawboard.style('width'));
    settings.height = parseInt(drawboard.style('height'));

    views.main_div = document.querySelector('#main');
    views.dragzone = document.querySelector('.dragzone');
    views.visuals = document.querySelector('.visuals');
    views.controls = document.querySelector('.controls');
    views.show_msg = document.querySelector('.show-msg');

    views.drawboard = drawboard;
    views.files_div = document.querySelector('.files');
    views.file_content = document.querySelector('.file-content');
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
    var circle = views.drawboard.selectAll('circle').data(circles, function(d){return d.id;});

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

// Since svg.drawboard is a child element of a Dragzone, we need to make sure dragenter and dragleave events propogate up
function uploadDragEnter(e) {
    e.preventDefault();
    var dt = e.dataTransfer;
    dt.dropEffect = 'copy';
}


function uploadDragLeave(e) {
    e.preventDefault();
    var dt = e.dataTransfer;
    dt.dropEffect = 'move';
}

function uploadDragOver(e) {
    // e.stopPropagation();
    // e.preventDefault();
    // var dt = e.dataTransfer;
    // dt.dropEffect = 'copy';
}

function uploadDrop(e) {
    e.stopPropagation();
    e.preventDefault();
}


var drawboard = document.getElementsByClassName('drawboard')[0];
drawboard.addEventListener("dragenter", uploadDragEnter, false);
drawboard.addEventListener("dragover", uploadDragOver, false);
drawboard.addEventListener("dragleave", uploadDragLeave, false);
drawboard.addEventListener("drop", uploadDrop, false);


// TODO: check if event contains files
function containsFiles(e) {
    return true;
}
// NOTE: do not allow dropping files anywhere in body
// TODO Since dragenter events are triggered on almost every div,
// we should restrict adding div.drop-layer to an event from one event.target

// NOTES:
// - Currently, HTML5 dragenter and dragleave are similar to mousein and mouseout.
// - Using a custom event to make dragenter and dragleave behave more like mouseenter and mouseleave.
// - Custom solution also handles Firefox 38's weird behavior of double firing dragenter event...
// - TODO Firefox 38 also fires our custom event when we reload the page.. Fix this!
//
// References:
// - http://stackoverflow.com/questions/10253663/how-to-detect-the-dragleave-event-in-firefox-when-dragging-outside-the-window/10310815#10310815

// Lets create a custom event to handle this.
// NOTE on firefox,

function handleDragzoneEnter(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log('dragzone:enter');
    // need to change effect of drag upon entering dropzone
    // dt.effectAllowed = dt.dropEffect = 'none';
    // insert drop-layer to drawboard
    views.show_msg.style.display = 'block';
}

function handleDragzoneLeave(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log('dragzone:leave');
    views.show_msg.style.display = '';
}

var dragzone_ele = document.querySelector('.dragzone');
makeDragzone(dragzone_ele,true);

dragzone_ele.addEventListener("dragzone:enter", handleDragzoneEnter, false);

dragzone_ele.addEventListener("dragzone:leave", handleDragzoneLeave, false);



// NOTE: Code below was used to troubleshoot an irreproducible issue. can safely delete.
// document.querySelector('.files').addEventListener('dragenter', function(e) {
//     console.log(e);
//     console.log('is this serioiusly being fired?');
// },false);

dragzone_ele.addEventListener("drop", function(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log('body drop');
}, false);

dragzone_ele.addEventListener("dragover", function(e) {
  e.stopPropagation();
  e.preventDefault();
  // console.log('document dragover');
  // console.log(e.target);
  var dt = e.dataTransfer;
  dt.effectAllowed = dt.dropEffect = 'none';
}, false);
