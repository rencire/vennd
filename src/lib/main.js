import 'd3';
import { addEvent, debounce } from './helpers';
import { splitToWords, calcDifference, calcIntersection} from './files';
import { constructIntersectionPath, getOverlaps, getClickedOverlaps, generateRandomValidPoint, inBounds, isFreeArea } from './circle';


function stopBubbleUp() {
    d3.event.stopPropagation();
}

var views = {};
var settings = {
    radius: 100,
    width: undefined,
    height: undefined,
    id_cnt: 2,
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
    views.sel_file_content = document.querySelector('.sel-file-content');
    
    // bind buttons
    document.querySelector('.clear-btn').addEventListener('click', clearBoard, false);
    document.querySelector('.rm-sel-btn').addEventListener('click', removeCircle, false);

    // bind error msg click
    views.dragzone.addEventListener('click', function(e) {
      renderCtrMsg(false);
    }, false);

    // make text uneditable
    views.sel_file_content.addEventListener('click', function(e) {
      e.preventDefault();
    },false);

}

// State
var Models = {
  Board: {},
  Output: {}
};

Models.Board.intersectionArea = {
  display: false,
  clickedCircles: [],
};

Models.Board.fileArea = {
  content: "",
};

Models.Board.circles = [
  {id: 0, x: 200, y: 200, radius: settings.radius, selected: false, fileContent: null},
  {id: 1, x: 400, y: 300, radius: settings.radius, selected: false, fileContent: null}
];

Models.Output.content = "";




// Init load file for testing
var httpRequest;

function addFileToCircle(id, circles) {
  console.debug(id);
  return function() {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        circles[id].fileContent = httpRequest.responseText;
        console.log(httpRequest.responseText);
      } else {
        console.log('Problem with Status: ' + httpRequest.status);
      }
    } else {
      // not ready
      console.log(id);
      console.log('In state: ' + httpRequest.readyState);
    }
  };
}

Models.Board.circles.forEach((v, i) => {
  httpRequest = new XMLHttpRequest();
  httpRequest.onload = addFileToCircle(i, Models.Board.circles);
  httpRequest.open("GET", "./public/test" + i + ".txt", false);
  httpRequest.send();
});


// State functions


// function renderFiles(){
//     views.files_div.append('div')
//         .attr('class', 'dropbox')
//         .attr('type', 'file');
// }

// TODO break this up into separate operations if needed (update, enter, exit)
function renderBoard(circles) {
    var circle = views.drawboard.selectAll('circle').data(circles, function(d){return d.id;});

    // update
    // NOTE: x, y coords are updated automatically in #dragmove
    //      'selected' also upddated in #toggleSelected

    // enter
    // TODO somehow stop 'mouseup' event fired by drag event from triggering 'handleCircleClick'
    circle.enter().append('circle')
        .attr("r", settings.radius)
        .attr("cx", function(d){return d.x;})
        .attr("cy", function(d){return d.y;})
        .attr('selected', function(d){return d.selected;})
        .on('click', handleCircleClick)
        .on('mousedown', stopBubbleUp) // stop 'click' from being triggered while dragging
 
        .call(dragBehavior);

    // exit
    circle.exit().remove();
}


// Pass in Models.Board.intersectionArea
function renderIntersectionArea(intArea) {
  var pathString = constructIntersectionPath(intArea.clickedCircles);

  if (pathString === '') {
    intArea.display = false;
  }

  var path = document.querySelector('.intersectArea');
  path.setAttribute('stroke', 'red');
  path.setAttribute('stroke-width', '1');
  path.setAttribute('fill', 'red');
  path.setAttribute('d', pathString);
  path.style.display = (intArea.display) ? 'inline' : 'none';
}

// Pass in Models.Board.Output
function renderFileResult(output) {
  views.sel_file_content.value = output.content;
}

// calculate the intersection of list of files
// Using an object as a Set
// TODO refactor this, code smells like duplication of #calcDifference

/**
 * Calculates and displays set operation on circle(s)
 * @param {object} circle - Clicked circle on drawboard.  Datum from d3 library.
 */
function handleCircleClick(circle) {
  var point = d3.mouse(this);
    
  // console.log(circle);
  var overlaps = getOverlaps(circle, Models.Board.circles);
  if (overlaps.length === 0) {
    Models.Output.content = circle.fileContent;
    renderFileResult(Models.Output);    
    console.debug('all content');
    return;
  }
  
  var clickedOverlaps = getClickedOverlaps(point, overlaps);
  var result;

  if (clickedOverlaps.length === 0)  {
    var overlapsFiles = overlaps.map(function(ele) {return ele.fileContent;});
    result = calcDifference(circle.fileContent, overlapsFiles);
    console.debug('calc diff');
  } else {
    var clickedCircles = clickedOverlaps.concat([circle]);

    Models.Board.intersectionArea.display = true;
    Models.Board.intersectionArea.clickedCircles = clickedCircles;

    renderIntersectionArea(Models.Board.intersectionArea);
    console.log('>>> Render intersection area...');
    console.log('<<< Done Rendering interseciton area');

    var clickedOverlapsFiles = clickedOverlaps.map(function(ele){return ele.fileContent;});
    result = calcIntersection(clickedOverlapsFiles.concat([circle.fileContent]));
    console.debug('calc intersect');
  }
  Models.Output.content = result;
  renderFileResult(Models.Output);
}



// function drawIntersectionArea(circles){
//     // not using views.drawboard, want to move away from using d3
//   // var views.drawboard
//   
//   var svg_ns = "http://www.w3.org/2000/svg";
//   // Consider replacing html in .drawboard instead of appending new element to DOM
//   var path = document.createElementNS(svg_ns, 'path');
//   path.setAttribute('stroke', 'red');
//   path.setAttribute('stroke-width', '1');
//   path.setAttribute('fill', 'red');
//   path.setAttribute('d', constructIntersectionPath(circles));
//
//   var drawboard = document.querySelector('.drawboard');
//   drawboard.appendChild(path);
//   
// }


function toggleSelected(d) {
    if (d3.event.defaultPrevented) return; // click suppressed by drag behavior
    d3.event.stopPropagation();
    d3.select(this)
        .classed('selected', d.selected = !d.selected);
    if (d.selected && d.fileContent !== undefined) {
        Models.Output.content = d.fileContent;
        renderFileResult(Models.Output);
    } else {
        views.sel_file_content.value = '';
    }
}

// TODO get rid of d3 and code a drag solution with vanilla javascript
function dragmove(d) {
    d3.select(this)
        .attr("cx", d.x = Math.max(0, Math.min(settings.width, d3.event.x)))
        .attr("cy", d.y = Math.max(0, Math.min(settings.height, d3.event.y)));
    renderBoard(Models.Board.circles);

    if (Models.Board.intersectionArea.display) {
      renderIntersectionArea(Models.Board.intersectionArea);
    }

    // TODO handle case where we drag circle out of an inteserction area.
    // Should change Models.Board.intersectionArea.display = false;
}

var dragBehavior = d3.behavior.drag()
    .origin(function(d) { 
        return {x:d.x, y:d.y}; 
    })
    // .on("dragstart", markSelected)
    .on("drag", dragmove);






// Dispatcher will pass in model to 'action'
function addCircle(file, board) {
    var coord;
    var circle;
    if (file) {
        // generate random coords
        var point = generateRandomValidPoint(settings.width, settings.height, board.circles);

        var reader = new FileReader();
        reader.onload = function(e) { 
          // adding circle to 'circles' model
          circle = {id: settings.id_cnt, x: point.x, y: point.y, radius: settings.radius, selected: false, fileContent: e.target.result};
          board.circles.push(circle);
          //TODO Q: How to drag a shape after creating it?
          // A: don't implement this feature for now...
          settings.id_cnt += 1;
          renderBoard(board.circles);
        }; 
        reader.readAsText(file);

    } else {
        //TODO Review this false condition code
        // check if not clicking an area with circle
      console.log('in else');
        var point = d3.mouse(this);
        circle = {id: settings.id_cnt, x: point[0], y: point[1], selected: false, file: file};

        if (!inBounds({x:circle.x, y:circle.y}, settings.width, settings.height)) {
            console.log('ERROR: circles out of bounds.') ;
            return;
        }
        if (!isFreeArea({x:circle.x, y:circle.y}, board.circles)) {
            // This block will never execute from UI because 'click' event handlers for 'circles' will stopDefaultPropagation for parent 'click' event handlers.
            // Still useful if people are messing with the console to add circles.
            console.log("ERROR: Circle already exists in that spot.");
            return;
        }

        board.circles.push(circle);
          console.log(
            'after no file push'
          );
        //TODO Q: How to drag a shape after creating it?
        // A: don't implement this feature for now...
        settings.id_cnt += 1;
        renderBoard(board.circles);
    }
}

function removeCircle() {
    var board = Models.Board;
    board.circles = board.circles.filter(function(d){
        return !d.selected;
    }); 
    renderBoard(board.circles);
    views.sel_file_content.value = '';
}

function clearBoard() {
    var board = Models.Board;
    board.circles = [];
    renderBoard(board.circles);
    views.sel_file_content.value = '';
}

// Render/update fn's
function renderCtrMsg(msg) {
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
            renderCtrMsg('File type needs to be Text');
            continue;
        }
        // TODO figure out a better way to pass the Board model
        addCircle(file, Models.Board);
          console.log(
            'hi'
          );
        renderCtrMsg(false);
    }
}

import {makeDragzone} from './dragzone';

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
    renderCtrMsg('Drop your files to visualize!');
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
    renderCtrMsg(false);
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
      renderCtrMsg('Can only drop files');
    }

}, false);

// TODO: check if event contains files
function containsFiles(e) {
    return true;
}






initializePage();
renderBoard(Models.Board.circles);
