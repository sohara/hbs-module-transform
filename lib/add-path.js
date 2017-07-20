/* eslint-env node */
'use strict';

function AddPath (options) {
  this.syntax = null;
  this.options = options;
}


AddPath.prototype.transform = function AddPath_transform (ast) {
  let walker = new this.syntax.Walker();
  let builders = this.syntax.builders;
  let moduleName = this.options.moduleName;
  let environment = this.environment;
  let { transformFrom, transformTo } = this.addon.addonConfig;

  walker.visit(ast, function(node) {
    if (!validate(node, moduleName, transformFrom, transformTo)) { return; }
    let firstParamType = node.params[0].type;
    if (firstParamType === 'StringLiteral') {
      // Able to derive a lookup path from a string
      node.params[0] = buildStringNode(node, moduleName, builders);
    } else if (firstParamType === 'SubExpression') {
      node.params[0].params[0] = buildStringNode(node.params[0], moduleName, builders);
    } else if (firstParamType === 'PathExpression') {
      let params = [];
      let basePath = getModulePath(moduleName);
      let pathParam = builders.path(node.params[0].original);
      params.push(builders.string(basePath));
      params.push(builders.string('.'));
      params.push(pathParam);
      let subExpression = builders.sexpr('concat', params);
      node.params[0] = subExpression;
    }
    collectArgsAsHash(node);
    replaceComponent(node, builders, transformTo, environment);
  });
  return ast;
};

function replaceComponent (node, builders, transformTo, environment) {
  if (environment === 'development') {
    node.path = builders.path(transformTo);
  }
}

function collectArgsAsHash(node) {
  if (node.hash && node.hash.pairs && node.hash.pairs.length > 0 ) {
    let mySubExpression = builders.sexpr('hash');
    node.hash.pairs.forEach(pair => {
      mySubExpression.hash.pairs.push(pair);
    });
    let subexprPair = builders.pair('hash', mySubExpression);
    node.hash.pairs.push(subexprPair);
  }
}

function buildStringNode (node, moduleName, builders) {
  let path = extractLookupPath(node, moduleName);
  return builders.string(path);
}

function extractLookupPath(node, moduleName) {
  let originalParts;

  originalParts = node.params[0].original.split('.');
  if (originalParts[0] === '$') {
    originalParts.shift()
    return originalParts.join('.');
  }
  let modulePath = getModulePath(moduleName);
  // moduleParts.push(originalParts.join('.'));
  return modulePath.concat('.', originalParts.join('.'));
}

function getModulePath (moduleName) {
  let baseModulePath = moduleName.split('.')[0];
  let moduleParts = baseModulePath.split('/');
  moduleParts.shift();
  if (moduleParts[moduleParts.length - 1] === 'template') {
    moduleParts.pop();
  }
  if (moduleParts[0] === 'brands') {
    moduleParts = moduleParts.slice(2);
  }
  return moduleParts.join('.');
}

function validate(node, moduleName, transformFrom, transformTo) {
  let moduleParts = moduleName && moduleName.split('/');
  return node.type === 'MustacheStatement' &&
    node.path.original === transformFrom &&
    moduleParts &&
    !moduleParts.includes(transformTo)
}

module.exports = AddPath;
