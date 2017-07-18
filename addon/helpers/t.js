import Ember from 'ember';

// A dummy `t` helper to use in the dummy app during tests
export function t(params/*, hash*/) {
  return params;
}

export default Ember.Helper.helper(t);
