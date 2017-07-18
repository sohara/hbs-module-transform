import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import Ember from 'ember';

moduleForAcceptance('Acceptance | transform helper');

test('it renders a component transformed from a helper', function(assert) {
  visit('/');

  andThen(function() {
    assert.equal(Ember.$('p:contains("string.param")').length, 0, 'Param originally passed to helper does not appear');
    assert.equal(Ember.$('.transformed-component').length, 1, 'Component class selector appears on page');
  });
});
