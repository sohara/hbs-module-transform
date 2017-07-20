import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('module-transform', 'Integration | Component | module transform', {
  integration: true
});

// The module-transform is just a wrapper (exists in test dummy only) to
// allow test rendering of aribitrary handlebars markup per our test cases.
// We also need to use individual components placed in the dummy app for each
// test case so that it is compiled through the regular compilation pipeline,
// including our custom transform.
test('it transforms a helper invocation to a component', function(assert) {
  this.render(hbs`
    {{#module-transform}}
      {{test-cases/basic-invocation}}
    {{/module-transform}}
  `);
  assert.equal(this.$('.transformed-component').length, 1, 'Component class selector appears on page');
  assert.ok(this.$('.transformed-component').text().includes('templates.components.test-cases.basic-invocation.my.basic.path'), 'Our dummy component outputs the passed path param');
});

test('it transforms a helper invocation with a subexpression using concat and a bound value', function(assert) {
  this.render(hbs`
    {{#module-transform}}
      {{test-cases/subexpression-param myValue="halp"}}
    {{/module-transform}}
  `);
  assert.ok(this.$('.transformed-component').text().includes('templates.components.test-cases.subexpression-param.my.special.path.halp'), 'Dummy component outputs the concated path with bound value');
});
