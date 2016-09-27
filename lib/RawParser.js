'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ContentNode = require('./ContentNode');

var _ContentNode2 = _interopRequireDefault(_ContentNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * creates nodes with entity keys and the endOffset
 */
function createEntityNodes(entityRanges, text) {
  var lastIndex = 0;
  var nodes = [];
  // if thers no entities will return just a single item
  if (entityRanges.length < 1) {
    nodes.push(new _ContentNode2.default({ start: 0, end: text.length }));
    return nodes;
  }

  entityRanges.forEach(function (range) {
    // create an empty node for content between previous and this entity
    if (range.offset > lastIndex) {
      nodes.push(new _ContentNode2.default({ start: lastIndex, end: range.offset }));
    }
    // push the node for the entity
    nodes.push(new _ContentNode2.default({
      entity: range.key,
      start: range.offset,
      end: range.offset + range.length
    }));
    lastIndex = range.offset + range.length;
  });

  // finaly add a node for the remaining text if any
  if (lastIndex < text.length) {
    nodes.push(new _ContentNode2.default({
      start: lastIndex,
      end: text.length
    }));
  }
  return nodes;
}

function addIndexes(indexes, ranges) {
  ranges.forEach(function (range) {
    indexes.push(range.offset);
    indexes.push(range.offset + range.length);
  });
  return indexes;
}

/**
 * Creates an array of sorted char indexes to avoid iterating over every single character
 */
function getRelevantIndexes(text, inlineRanges) {
  var entityRanges = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

  var relevantIndexes = [];
  // set indexes to corresponding keys to ensure uniquenes
  relevantIndexes = addIndexes(relevantIndexes, inlineRanges);
  relevantIndexes = addIndexes(relevantIndexes, entityRanges);
  // add text start and end to relevant indexes
  relevantIndexes.push(0);
  relevantIndexes.push(text.length);
  var uniqueRelevantIndexes = relevantIndexes.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
  // and sort it
  return uniqueRelevantIndexes.sort(function (aa, bb) {
    return aa - bb;
  });
}

var RawParser = function () {
  function RawParser() {
    _classCallCheck(this, RawParser);
  }

  _createClass(RawParser, [{
    key: 'relevantStyles',
    value: function relevantStyles(offset) {
      var styles = this.ranges.filter(function (range) {
        return offset >= range.offset && offset < range.offset + range.length;
      });
      return styles.map(function (style) {
        return style.style;
      });
    }

    /**
     * Loops over relevant text indexes
     */

  }, {
    key: 'nodeIterator',
    value: function nodeIterator(node, start, end) {
      var _this = this;

      var indexes = this.relevantIndexes.slice(this.relevantIndexes.indexOf(start), this.relevantIndexes.indexOf(end));
      // loops while next index is smaller than the endOffset
      indexes.forEach(function (index, key) {
        // figure out what styles this char and the next char need
        // (regardless of whether there *is* a next char or not)
        var characterStyles = _this.relevantStyles(index);

        // calculate distance or set it to 1 if thers no next index
        var distance = indexes[key + 1] ? indexes[key + 1] - index : 1;
        // add all the chars up to next relevantIndex
        var text = _this.text.substr(index, distance);
        node.pushContent(text, characterStyles);

        // if thers no next index and thers more text left to push
        if (!indexes[key + 1] && index < end) {
          node.pushContent(_this.text.substring(index + 1, end), _this.relevantStyles(end - 1));
        }
      });
      return node;
    }

    /**
     * Converts raw block to object with nested style objects,
     * while it returns an object not a string
     * the idea is still mostly same as backdraft.js (https://github.com/evanc/backdraft-js)
     */

  }, {
    key: 'parse',
    value: function parse(_ref) {
      var _this2 = this;

      var text = _ref.text;
      var ranges = _ref.inlineStyleRanges;
      var entityRanges = _ref.entityRanges;

      this.text = text;
      this.ranges = ranges;
      this.iterator = 0;
      // get all the relevant indexes for whole block
      this.relevantIndexes = getRelevantIndexes(text, ranges, entityRanges);
      // create entity or empty nodes to place the inline styles in
      var entityNodes = createEntityNodes(entityRanges, text);
      var parsedNodes = entityNodes.map(function (node) {
        // reset the stacks
        _this2.styleStack = [];
        _this2.stylesToRemove = [];
        return _this2.nodeIterator(node, node.start, node.end);
      });
      return new _ContentNode2.default({ content: parsedNodes });
    }
  }]);

  return RawParser;
}();

exports.default = RawParser;