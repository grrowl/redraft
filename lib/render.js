'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderRaw = exports.render = exports.renderNode = undefined;

var _RawParser = require('./RawParser');

var _RawParser2 = _interopRequireDefault(_RawParser);

var _deprecated = require('./deprecated');

var _deprecated2 = _interopRequireDefault(_deprecated);

var _warn = require('./warn');

var _warn2 = _interopRequireDefault(_warn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Concats or insets a string at given array index
 */
var pushString = function pushString(string, array, index) {
  var tempArray = array;
  if (!array[index]) {
    tempArray[index] = string;
  } else {
    tempArray[index] += string;
  }
  return tempArray;
};

/**
 * Recursively renders a node with nested nodes with given callbacks
 */
var renderNode = exports.renderNode = function renderNode(node, styleRenderers, entityRenderers, entityMap) {
  var children = [];
  var index = 0;
  node.content.forEach(function (part) {
    if (typeof part === 'string') {
      children = pushString(part, children, index);
    } else {
      index += 1;
      children[index] = renderNode(part, styleRenderers, entityRenderers, entityMap);
      index += 1;
    }
  });
  if (node.style && styleRenderers[node.style]) {
    return styleRenderers[node.style](children);
  }
  if (node.entity !== null) {
    var entity = entityMap[node.entity];
    if (entity && entityRenderers[entity.type]) {
      return entityRenderers[entity.type](children, entity.data);
    }
  }
  return children;
};

/**
 * Nests blocks by depth as children
 */
var byDepth = function byDepth(blocks) {
  var group = [];
  var depthStack = [];
  var prevDepth = 0;
  var unwind = function unwind(targetDepth) {
    var i = prevDepth - targetDepth;
    // in case depthStack is too short for target depth
    if (depthStack.length < i) {
      i = depthStack.length;
    }
    for (i; i > 0; i -= 1) {
      var tmp = group;
      group = depthStack.pop();
      group[group.length - 1].children = tmp;
    }
  };

  blocks.forEach(function (block) {
    // if type of the block has changed render the block and clear group
    if (prevDepth < block.depth) {
      depthStack.push(group);
      group = [];
    } else if (prevDepth > block.depth) {
      unwind(block.depth);
    }
    prevDepth = block.depth;
    group.push(block);
  });
  if (prevDepth !== 0) {
    unwind(0);
  }
  return group;
};

/**
 * Renders blocks grouped by type using provided blockStyleRenderers
 */
var renderBlocks = function renderBlocks(blocks) {
  var inlineRendrers = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var blockRenderers = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var entityRenderers = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
  var entityMap = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

  // initialize
  var rendered = [];
  var group = [];
  var prevType = null;
  var prevDepth = 0;
  var prevKey = null;
  var Parser = new _RawParser2.default();

  blocks.forEach(function (block) {
    var node = Parser.parse(block);
    var renderedNode = renderNode(node, inlineRendrers, entityRenderers, entityMap);
    // if type of the block has changed render the block and clear group
    if (prevType && prevType !== block.type) {
      if (blockRenderers[prevType]) {
        rendered.push(blockRenderers[prevType](group, prevDepth, prevKey));
      } else {
        rendered.push(group);
      }
      group = [];
    }
    // handle children
    if (block.children) {
      var children = renderBlocks(block.children, inlineRendrers, blockRenderers, entityRenderers, entityMap);
      renderedNode.push(children);
    }
    // push current node to group
    group.push(renderedNode);

    // lastly save current type for refference
    prevType = block.type;
    prevDepth = block.depth;
    prevKey = block.key;
  });
  // render last group
  if (blockRenderers[prevType]) {
    rendered.push(blockRenderers[prevType](group, prevDepth, prevKey));
  } else {
    rendered.push(group);
  }
  return rendered;
};

/**
 * Converts and renders each block of Draft.js rawState
 */
var render = exports.render = function render(raw) {
  var renderers = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var arg3 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var arg4 = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

  if (!raw || !Array.isArray(raw.blocks)) {
    (0, _warn2.default)('invalid raw object');
    return null;
  }
  // If the lenght of the blocks array is 0 its should not log a warning but still return a null
  if (!raw.blocks.length) {
    return null;
  }
  var inlineRendrers = renderers.inline;
  var blockRenderers = renderers.blocks;
  var entityRenderers = renderers.entities;
  // Fallback to deprecated api

  if (!inlineRendrers && !blockRenderers && !entityRenderers) {
    inlineRendrers = renderers;
    blockRenderers = arg3;
    entityRenderers = arg4;
    // Logs a deprecation warning if not in production
    (0, _deprecated2.default)('passing renderers separetly is deprecated'); // eslint-disable-line
  }
  var blocks = byDepth(raw.blocks);
  return renderBlocks(blocks, inlineRendrers, blockRenderers, entityRenderers, raw.entityMap);
};

var renderRaw = exports.renderRaw = function renderRaw() {
  (0, _deprecated2.default)('renderRaw is deprecated use the default export');
  return render.apply(undefined, arguments);
};