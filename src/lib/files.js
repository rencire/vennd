import { intersectArrays } from './helpers';
// NOTE: Default element we are calculating are for words

/**
 * String result from performing Set Difference between text and each. 
 * Treating a word as a set element.
 * @param {string} - text - String we will diff from.
 * @param {array} - others - Array of strings that we want to diff against param 'text'
 * @returns {string} String result of text - (others[0] + others[1] + ...)
 */
//TODO once es6 is supported on browser, use Set object

export function splitToWords(text, others) {
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


export function calcDifference(text, others) {
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

export function calcIntersection(fileList) {
  var allWords = fileList.map(function(file) {
    return file.split(/\s+/).sort();
  });

  var result = allWords.reduce(function(memo, words) {
    return intersectArrays(memo, words);
  });

  return result.join("\n");
}
