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
    // track width/height of svg for circle bounds
    var drawboard = d3.select('.drawboard');

    settings.width = parseInt(drawboard.style('width'));
    settings.height = parseInt(drawboard.style('height'));

    views.main_div = document.querySelector('#main');
    views.dragzone = document.querySelector('.dragzone');
    views.visuals = document.querySelector('.visuals');
    views.controls = document.querySelector('.controls');
    views.drag_msg = document.querySelector('.drag-msg');
    views.ctr_msg = document.querySelector('.ctr-msg');

    views.drawboard = drawboard;
    views.files_div = document.querySelector('.files');
    views.file_content = document.querySelector('.file-content');
    
    // bind buttons
    document.querySelector('.clear-btn').addEventListener('click', clearBoard, false);
    document.querySelector('.rm-sel-btn').addEventListener('click', removeSelected, false);

    // bind error msg click
    views.dragzone.addEventListener('click', function(e) {
      updateCtrMsg(false);
    }, false);

    // make text uneditable
    views.file_content.addEventListener('click', function(e) {
      e.preventDefault();
    },false);
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
        views.file_content.value = '';
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
    views.file_content.value = '';
}

function clearBoard() {
    circles = [];
    renderBoard();
    views.file_content.value = '';
}

// Render/update fn's
function updateCtrMsg(msg) {
  if (msg === false) {
    views.ctr_msg.textContent = views.ctr_msg.style.display = '';
  } else if (typeof msg === 'string') {
    views.ctr_msg.style.display = 'block';
    views.ctr_msg.textContent = msg;
  }
}


// Files
function handleFiles(files) {
    console.log('handling files..');
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var imageType = /^text\//;

        if (!imageType.test(file.type)) {
            updateCtrMsg('File type needs to be Text');
            continue;
        }
        addCircle(file);
        updateCtrMsg(false);
    }
}

function displayFileContents(file) {
    if (file == null) {
          
    }
    var reader = new FileReader();
    reader.onload = function(e) { 
      views.file_content.value = e.target.result; 
    }; 
    reader.readAsText(file);
}    



// TODO: check if event contains files
function containsFiles(e) {
    return true;
}

// NOTES:
// - Currently, HTML5 dragenter and dragleave are similar to mousein and mouseout.
// - Using a custom event to make dragenter and dragleave behave more like mouseenter and mouseleave.
// - Custom solution also handles Firefox 38's weird behavior of double firing dragenter event...
//
// References:
// - http://stackoverflow.com/questions/10253663/how-to-detect-the-dragleave-event-in-firefox-when-dragging-outside-the-window/10310815#10310815
// - http://developers.arcgis.com/javascript/sandbox/sandbox.html?sample=exp_dragdrop
function handleDragzoneEnter(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log('dragzone:enter');
    updateCtrMsg('Drop your files to visualize!');
}

function handleDragover(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log('dragover');
    var dt = e.dataTransfer;
    dt.dropEffect = dt.effectAllowed = 'copy';
}
function handleDragzoneLeave(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log('dragzone:leave');
    updateCtrMsg(false);
}


var dragzone_ele = document.querySelector('.dragzone');
makeDragzone(dragzone_ele);

dragzone_ele.addEventListener("dragzone:enter", handleDragzoneEnter, false);

// change cursor on drag
dragzone_ele.addEventListener("dragover", handleDragover, false);

dragzone_ele.addEventListener("dragzone:leave", handleDragzoneLeave, false);


// preventDefault uploading behavior when dropping files on dragzone_ele's child elements
dragzone_ele.addEventListener("drop", function(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log('drop');

    // add circle to svg
    console.log(e.dataTransfer);
    if(containsFiles(e)) {
      handleFiles(e.dataTransfer.files);
    } else {
      updateCtrMsg('Can only drop files');
    }

}, false);


initializePage();
renderBoard();
