import { addEvent, getRandomInt, debounce } from './helpers.js';
import { makeDragzone } from './dragzone.js';

function stopBubbleUp() {
    d3.event.stopPropagation();
}

var views = {};
var settings = {
    radius: 100,
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
    views.sel_file_content = document.querySelector('.sel-file-content');
    
    // bind buttons
    document.querySelector('.clear-btn').addEventListener('click', clearBoard, false);
    document.querySelector('.rm-sel-btn').addEventListener('click', removeSelected, false);

    // bind error msg click
    views.dragzone.addEventListener('click', function(e) {
      updateCtrMsg(false);
    }, false);

    // make text uneditable
    views.sel_file_content.addEventListener('click', function(e) {
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
        .on('click', handleCircleClick)
        .on('mousedown', stopBubbleUp)
        .call(dragBehavior);

    // exit
    circle.exit().remove();
}

/**
 * A list of overlapping circles
 *
 * Note: using this equation to determine if two circles are intersecting or not:
 *
 *   (R0-R1)^2 <= (x0-x1)^2+(y0-y1)^2 <= (R0+R1)^2
 * 
 * See {@link http://stackoverflow.com/questions/8367512/algorithm-to-detect-if-a-circles-intersect-with-any-other-circle-in-the-same-pla}
 * for details on equation.
 *
 * @param {object} circle - Circle we are finding overlaps for
 * @returns {array} Array of circles that visually overlap with param 'circle' on drawboard
 *
 */
function getOverlaps(circle) {
  return circles.filter(function(c) {
    if (c.id === circle.id) {
      return false;
    }
    var mid = Math.pow(circle.point.x - c.point.x, 2) + Math.pow(circle.point.y - c.point.y, 2);
    var low = Math.pow(circle.radius - c.radius, 2);
    var high = Math.pow(circle.radius + c.radius, 2);
    return low <= mid && mid <= high;
  });
}

/**
 * Returns an array of circles that overlap with clicked coordinates
 * @param {array} point - X/Y coordinates of clicked circle on drawboard
 * @param {array} overlaps - Array of circles that overlap with the clicked circle
 * @returns {array} Array of circles that overlap with the param 'point' 
 */
function getClickedOverlaps(point,overlaps) {
  return overlaps.filter(function(c) {
    var xDiff = point[0] - c.point.x;
    var yDiff = point[1] - c.point.y;
    return (Math.pow(xDiff, 2) + Math.pow(yDiff, 2)) < Math.pow(c.radius, 2);
  });
}

// NOTE: Default element we are calculating are for words

/**
 * String result from performing Set Difference between text and each. 
 * Treating a word as a set element.
 * @param {string} - text - String we will diff from.
 * @param {array} - others - Array of strings that we want to diff against param 'text'
 * @returns {string} String result of text - (others[0] + others[1] + ...)
 */
//TODO once es6 is supported on browser, use Set object

function splitToWords(text, others) {
  var wordsSet = {};
  var words = text.split(/\s+/);
  words.forEach(function(word) {
    if(!Object.prototype.hasOwnProperty.call(wordsSet, word)) {
      wordsSet[word] = true;
    }
  });

  var otherWordsSet = {};
  others.forEach(function(str) {
    var words = str.split(/\s+/);
    words.forEach(function(word) {
      if(!Object.prototype.hasOwnProperty.call(otherWordsSet, word)) {
        otherWordsSet[word] = true;
      }
    });
  });

  return {
    theseWords:  Object.keys(wordsSet),
    otherWords:  Object.keys(otherWordsSet)
  };
}

function calcDifference(text, others) {
  var wordSets = splitToWords(text, others);

  var sortedWords = wordSets.theseWords.sort();
  var sortedOtherWords = wordSets.otherWords.sort();

  var result = [];
  var i = 0;
  var j = 0;
  while (i < sortedWords.length && j < sortedOtherWords.length) {
    if(sortedWords[i] < sortedOtherWords[j]) {
      result.push(sortedWords[i]);
      i = i + 1;
    } else if(sortedWords[i] > sortedOtherWords[j]) {
      j = j + 1;
    } else {
      i = i + 1;
      j = j + 1;
    }
  }

  return result.concat(sortedWords.slice(i)).join("\n");

}

// find intersection of sorted arrays
function intersectArrays(a,b) {
  var result = [];
  var i = 0;
  var j = 0;
  while (i < a.length && j < b.length) {
    if(a[i] < b[j]) {
      i = i + 1;
    } else if(a[i] > b[j]) {
      j = j + 1;
    } else {
      result.push(a[i]);
      i = i + 1;
      j = j + 1;
    }
  }
  return result;
}
// calculate the intersection of list of files
// Using an object as a Set
// TODO refactor this, code smells like duplication of #calcDifference
function calcIntersection(fileList) {
  var allWords = fileList.map(function(file) {
    return file.split(/\s+/).sort();
  });

  var result = allWords.reduce(function(memo, words) {
    return intersectArrays(memo, words);
  });

  return result.join("\n");
}

/**
 * Calculates and displays set operation on circle(s)
 * @param {object} circle - Clicked circle on drawboard.  Datum from d3 library.
 */
function handleCircleClick(circle) {
  var point = d3.mouse(this);
    
  console.log(circle);
  var overlaps = getOverlaps(circle);
  if (overlaps.length === 0) {
    displayResult(circle.fileContent);    
    console.log('all content');
    return;
  }
  
  var clickedOverlaps = getClickedOverlaps(point, overlaps);
  var result;

  if (clickedOverlaps.length === 0)  {
    var overlapsFiles = overlaps.map(function(ele) {return ele.fileContent;});
    result = calcDifference(circle.fileContent, overlapsFiles);
    console.log('calc diff');
  } else {
    var clickedOverlapsFiles = clickedOverlaps.map(function(ele){return ele.fileContent;});
    result = calcIntersection(clickedOverlapsFiles.concat([circle.fileContent]));
    console.log('calc intersect');
  }
  displayResult(result);
}

function displayResult(content) {
  views.sel_file_content.value = content;
}

function toggleSelected(d) {
    if (d3.event.defaultPrevented) return; // click suppressed by drag behavior
    d3.event.stopPropagation();
    d3.select(this)
        .classed('selected', d.selected = !d.selected);
    if (d.selected && d.fileContent !== undefined) {
        displayResult(d.fileContent);    
    } else {
        views.sel_file_content.value = '';
    }
}

// TODO get rid of d3 and code a drag solution with vanilla javascript
function dragmove(d) {
    d3.select(this)
        .attr("cx", d.point.x = Math.max(0, Math.min(settings.width, d3.event.x)))
        .attr("cy", d.point.y = Math.max(0, Math.min(settings.height, d3.event.y)));
    renderBoard();
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

        var reader = new FileReader();
        reader.onload = function(e) { 
          circle = {id: settings.id_cnt, point: point, radius: settings.radius, selected: false, fileContent: e.target.result};
          circles.push(circle);
          //TODO Q: How to drag a shape after creating it?
          // A: don't implement this feature for now...
          settings.id_cnt += 1;
          renderBoard();
        }; 
        reader.readAsText(file);

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

        circles.push(circle);
        //TODO Q: How to drag a shape after creating it?
        // A: don't implement this feature for now...
        settings.id_cnt += 1;
        renderBoard();
    }
}

function removeSelected() {
    circles = circles.filter(function(d){
        return !d.selected;
    }); 
    renderBoard();
    views.sel_file_content.value = '';
}

function clearBoard() {
    circles = [];
    renderBoard();
    views.sel_file_content.value = '';
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
