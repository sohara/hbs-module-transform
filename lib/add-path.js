/* eslint-env node */
'use strict';

function AddPath (options) {
  this.syntax = null;
  this.options = options;
}

function firstNodeParam (node) {
  return node.params[node.params.length -1];
}

AddPath.prototype.transform = function AddPath_transform (ast) {
  let walker = new this.syntax.Walker();
  let b = this.syntax.builders;
  let moduleName = this.options.moduleName;
  let environment = this.environment;
  let { transformFrom, transformTo } = this.addon.addonConfig;

  walker.visit(ast, function(node) {
    let lookupPath;
    if (!validate(node, moduleName, transformFrom, transformTo)) { return; }
    if (firstNodeParam(node).type === 'StringLiteral') {
      lookupPath = extractLookupPath(node, moduleName);
    }

    // Able to derive a lookup path from a string
    if (lookupPath) {
      let mystring = b.string(lookupPath);
      node.params[0] = mystring;
    } else {
      console.log(moduleName);
      let subExpressionNode = node.params[0];
      let nestedLookupPath = extractLookupPath(subExpressionNode, moduleName);
      let mystring = b.string(nestedLookupPath);
      node.params[0].params[0] = mystring;
    }
    if ( node.hash && node.hash.pairs && node.hash.pairs.length > 0 ) {
      let mySubExpression = b.sexpr('hash');
      node.hash.pairs.forEach(pair => {
        mySubExpression.hash.pairs.push(pair);
      });
      let subexprPair = b.pair('hash', mySubExpression);
      node.hash.pairs.push(subexprPair);
    }
    if (environment === 'development') {
      node.path = b.path(transformTo);
    }
  
  });
  return ast;
};



function extractLookupPath(node, moduleName) {
  // let originalParam = node.params[node.params.length -1];
  let originalParts;

  originalParts = node.params[0].original.split('.');
  if (originalParts[0] === '$') {
    originalParts.shift()
    return originalParts.join('.');
  }
  let baseModulePath = moduleName.split('.')[0];
  let moduleParts = baseModulePath.split('/');
  moduleParts.shift();
  if (moduleParts[moduleParts.length - 1] === 'template') {
    moduleParts.pop();
  }
  if (moduleParts[0] === 'brands') {
    moduleParts = moduleParts.slice(2);
  }
  moduleParts.push(originalParts.join('.'));
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