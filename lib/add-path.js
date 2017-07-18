/* eslint-env node */
'use strict';

function AddPath (options) {
  this.syntax = null;
  this.options = options;
}

AddPath.prototype.transform = function AddPath_transform (ast) {
  var walker = new this.syntax.Walker();
  var b = this.syntax.builders;
  var moduleName = this.options.moduleName;
  var environment = this.environment;
  let { transformFrom, transformTo } = this.addon.addonConfig;

  walker.visit(ast, function(node) {
    if (!validate(node, moduleName, transformFrom, transformTo)) { return; }
    var lookupPath = extractLookupPath(node, moduleName);
    var mystring = b.string(lookupPath);
    node.params.push(mystring);
    if ( node.hash && node.hash.pairs && node.hash.pairs.length > 0 ) {
      var mySubExpression = b.sexpr('hash');
      node.hash.pairs.forEach(pair => {
        mySubExpression.hash.pairs.push(pair);
      });
      var subexprPair = b.pair('hash', mySubExpression);
      node.hash.pairs.push(subexprPair);
    }
    if (environment === 'development') {
      node.path = b.path(transformTo);
    }
  });
  return ast;
};

function extractLookupPath(node, moduleName) {
  var originalParam = node.params.pop();
  var originalParts;
  if (originalParam.type === 'SubExpression') {
    return;
  }
  originalParts = originalParam.original.split('.');
  if (originalParts[0] === '$') {
    originalParts.shift()
    return originalParts.join('.');
  }
  var baseModulePath = moduleName.split('.')[0];
  var moduleParts = baseModulePath.split('/');
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
  var moduleParts = moduleName && moduleName.split('/');
  return node.type === 'MustacheStatement' &&
    node.path.original === transformFrom &&
    moduleParts &&
    !moduleParts.includes(transformTo)
}

module.exports = AddPath;
