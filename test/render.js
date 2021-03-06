import chai from 'chai';
import redraft, { renderRaw } from '../src';

const should = chai.should();

const raw = {
  entityMap: {
    0: {
      data: {
        url: 'http://zombo.com/',
      },
      type: 'LINK',
      mutability: 'MUTABLE',
    },
  },
  blocks: [{
    key: '77n1t',
    text: 'Lorem ipsum dolor sit amet, pro nisl sonet ad. ',
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [
      {
        offset: 0,
        length: 17,
        style: 'BOLD',
      },
      {
        offset: 6,
        length: 21,
        style: 'ITALIC',
      },
    ],
    entityRanges: [
      {
        key: 0,
        offset: 6,
        length: 5,
      },
    ],
  }, {
    key: 'a005',
    text: 'Eos affert numquam id, in est meis nobis. Legimus singulis suscipiantur eum in, ceteros invenire tractatos his id. ', // eslint-disable-line max-len
    type: 'blockquote',
    depth: 0,
    inlineStyleRanges: [
      {
        offset: 80,
        length: 17,
        style: 'ITALIC',
      },
    ],
    entityRanges: [],
  }, {
    key: 'ee96q',
    text: 'Facer facilis definiebas ea pro, mei malis libris latine an. Senserit moderatius vituperata vis in.', // eslint-disable-line max-len
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [
      {
        offset: 0,
        length: 99,
        style: 'BOLD',
      },
    ],
    entityRanges: [],
  }],
};

const raw2 = {
  entityMap: {},
  blocks: [{
    key: 'az45a',
    text: '!', // eslint-disable-line max-len
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [],
    entityRanges: [],
  }],
};

const rawWithEmptyLine = {
  entityMap: {},
  blocks: [{
    key: 'az45a',
    text: '!', // eslint-disable-line max-len
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [],
    entityRanges: [],
  }, {
    key: 'az45b',
    text: '', // eslint-disable-line max-len
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [],
    entityRanges: [],
  }, {
    key: 'az45c',
    text: '!', // eslint-disable-line max-len
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [],
    entityRanges: [],
  }],
};

const rawEmptyFirstLine = {
  entityMap: {},
  blocks: [{
    key: 'az45b',
    text: '', // eslint-disable-line max-len
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [],
    entityRanges: [],
  }, {
    key: 'az45a',
    text: '!', // eslint-disable-line max-len
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [],
    entityRanges: [],
  }],
};

const rawWithDepth = {
  entityMap: {},
  blocks: [
    {
      key: 'eunbc',
      type: 'unordered-list-item',
      text: 'Hey',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
    },
    {
      key: '9nl08',
      type: 'unordered-list-item',
      text: 'Ho',
      depth: 1,
      inlineStyleRanges: [],
      entityRanges: [],
    },
    {
      key: '9qp7i',
      type: 'unordered-list-item',
      text: 'Let\'s',
      depth: 2,
      inlineStyleRanges: [],
      entityRanges: [],
    },
    {
      key: '1hegu',
      type: 'ordered-list-item',
      text: 'Go',
      depth: 2,
      inlineStyleRanges: [],
      entityRanges: [],
    }],
};

const rawWithDepth2 = {
  entityMap: {},
  blocks: [
    {
      key: 'eunbc',
      type: 'unordered-list-item',
      text: 'Hey',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
    },
    {
      key: '9nl08',
      type: 'unordered-list-item',
      text: 'Ho',
      depth: 1,
      inlineStyleRanges: [],
      entityRanges: [],
    },
    {
      key: '9qp7i',
      type: 'unordered-list-item',
      text: 'Let\'s',
      depth: 2,
      inlineStyleRanges: [],
      entityRanges: [],
    },
    {
      key: '1hegu',
      type: 'ordered-list-item',
      text: 'Go',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
    }],
};

const emptyRaw = {
  entityMap: {},
  blocks: [],
};

const invalidRaw = {
  entityMap: {},
  blocks: {},
};

const rawWithDepth3 = {
  entityMap: {},
  blocks: [
    {
      key: 'eunbc',
      type: 'unordered-list-item',
      text: 'Hey',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
    },
    {
      key: '9nl08',
      type: 'unordered-list-item',
      text: 'Ho',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
    },
    {
      key: '9qp7i',
      type: 'unordered-list-item',
      text: 'Let\'s',
      depth: 2,
      inlineStyleRanges: [],
      entityRanges: [],
    },
    {
      key: '1hegu',
      type: 'ordered-list-item',
      text: 'Go',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
    }],
};

// to render to a plain string we need to be sure all the arrays are joined after render
const joinRecursively = (array) => array.map((child) => {
  if (Array.isArray(child)) {
    return joinRecursively(child);
  }
  return child;
}).join('');

const makeList = children => children.map(child => `<li>${joinRecursively(child)}</li>`).join('');

// render to HTML

const inline = {
  BOLD: (children) => `<strong>${children.join('')}</strong>`,
  ITALIC: (children) => `<em>${children.join('')}</em>`,
};

const blocks = {
  unstyled: (children) => `<p>${joinRecursively(children)}</p>`,
  blockquote: (children) => `<blockquote>${joinRecursively(children)}</blockquote>`,
  'ordered-list-item': (children) => `<ol>${makeList(children)}</ol>`,
  'unordered-list-item': (children) => `<ul>${makeList(children)}</ul>`,
};

const entities = {
  LINK: (children, entity) => `<a href="${entity.url}" >${joinRecursively(children)}</a>`,
};

const renderers = {
  inline,
  blocks,
  entities,
};

describe('renderRaw', () => {
  it('should render correctly', () => {
    const rendered = redraft(raw, renderers);
    const joined = joinRecursively(rendered);
    joined.should.equal('<p><strong>Lorem </strong><a href="http://zombo.com/" ><strong><em>ipsum</em></strong></a><strong><em> dolor</em></strong><em> sit amet,</em> pro nisl sonet ad. </p><blockquote>Eos affert numquam id, in est meis nobis. Legimus singulis suscipiantur eum in, <em>ceteros invenire </em>tractatos his id. </blockquote><p><strong>Facer facilis definiebas ea pro, mei malis libris latine an. Senserit moderatius vituperata vis in.</strong></p>'); // eslint-disable-line max-len
  });
  it('should render blocks with single char correctly', () => {
    const rendered = redraft(raw2, renderers);
    const joined = joinRecursively(rendered);
    joined.should.equal('<p>!</p>');
  });
  it('should render correctly with deprecated api', () => {
    const rendered = renderRaw(raw, inline, blocks, entities);
    const joined = joinRecursively(rendered);
    joined.should.equal('<p><strong>Lorem </strong><a href="http://zombo.com/" ><strong><em>ipsum</em></strong></a><strong><em> dolor</em></strong><em> sit amet,</em> pro nisl sonet ad. </p><blockquote>Eos affert numquam id, in est meis nobis. Legimus singulis suscipiantur eum in, <em>ceteros invenire </em>tractatos his id. </blockquote><p><strong>Facer facilis definiebas ea pro, mei malis libris latine an. Senserit moderatius vituperata vis in.</strong></p>'); // eslint-disable-line max-len
  });
  it('should render blocks with depth correctly 1/2', () => {
    const rendered = redraft(rawWithDepth, renderers);
    const joined = joinRecursively(rendered);
    joined.should.equal("<ul><li>Hey<ul><li>Ho<ul><li>Let's</li></ul><ol><li>Go</li></ol></li></ul></li></ul>"); // eslint-disable-line max-len
  });
  it('should render blocks with depth correctly 2/2', () => {
    const rendered = redraft(rawWithDepth2, renderers);
    const joined = joinRecursively(rendered);
    joined.should.equal("<ul><li>Hey<ul><li>Ho<ul><li>Let's</li></ul></li></ul></li></ul><ol><li>Go</li></ol>"); // eslint-disable-line max-len
  });
  it('should render blocks containing empty lines', () => {
    const rendered = redraft(rawWithEmptyLine, renderers);
    const joined = joinRecursively(rendered);
    joined.should.equal('<p>!!</p>');
  });
  it('should render blocks when first block is empty', () => {
    const rendered = redraft(rawEmptyFirstLine, renderers);
    const joined = joinRecursively(rendered);
    joined.should.equal('<p>!</p>');
  });
  it('should render blocks with depth when depth jumps from 0 to 2', () => {
    const rendered = redraft(rawWithDepth3, renderers);
    const joined = joinRecursively(rendered);
    joined.should.equal("<ul><li>Hey</li><li>Ho<ul><li>Let's</li></ul></li></ul><ol><li>Go</li></ol>"); // eslint-disable-line max-len
  });
  it('should render null for empty raw blocks array', () => {
    const rendered = redraft(emptyRaw, renderers);
    should.equal(rendered, null);
  });
  it('should render null for an invalid input 1/2', () => {
    const rendered = redraft(invalidRaw, renderers);
    should.equal(rendered, null);
  });
  it('should render null for an invalid input 2/2', () => {
    const rendered = redraft([], renderers);
    should.equal(rendered, null);
  });
  it('should render null for no input', () => {
    const rendered = redraft();
    should.equal(rendered, null);
  });
});
