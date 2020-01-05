import { BlazeLayout } from '../lib/layout.js';

Tinytest.add('Unit - BlazeLayout._regionsToData', (test) => {
  const data = BlazeLayout._regionsToData({aa: 10, bb: 'hello'});

  test.equal(data.aa(), 10);
  test.equal(data.bb(), 'hello');
});

Tinytest.addAsync('Unit - BlazeLayout._updateRegions', (test, done) => {
  var aa = null;
  var bb = null;

  const data = BlazeLayout._regionsToData({aa: 10, bb: 'hello'});
  const c1 = Tracker.autorun(c => {
    aa = data.aa();
  });

  var c2 = Tracker.autorun(c => {
    bb = data.bb();
  });

  BlazeLayout._updateRegions({aa: 20});

  Meteor.setTimeout(() => {
    test.equal(aa, 20);
    test.equal(bb, 'hello');
    done();
  }, 100);
});
