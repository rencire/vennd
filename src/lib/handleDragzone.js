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

// TODO: check if event contains files
function containsFiles(e) {
    return true;
}
console.log('loaded hanldeDragzone');
