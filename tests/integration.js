import { BlazeLayout } from '../lib/layout.js';
import { TemplateStats, ResetStats } from './init.templates.js';

Tinytest.addAsync("Integration - render to the dom", (test, done) => {
  BlazeLayout.reset();
  BlazeLayout.render('layout1', {aa: 200});

  Meteor.setTimeout(() => {
    Tracker.afterFlush(() => {
      test.isTrue(/200/.test($('#__blaze-root').text()));
      Meteor.setTimeout(done, 0);
    });
  }, 100);
});

Tinytest.addAsync("Integration - do not re-render", (test, done) => {
  BlazeLayout.reset();
  ResetStats('layout1');
  BlazeLayout.render('layout1', {aa: 2000});

  Tracker.afterFlush(() => {
    BlazeLayout.render('layout1', {aa: 3000});
    Tracker.afterFlush(checkStatus);
  });

  function checkStatus() {
    test.isTrue(/3000/.test($('#__blaze-root').text()));
    test.equal(TemplateStats.layout1.rendered, 1);
    test.equal(TemplateStats.layout1.destroyed, 0);
    Meteor.setTimeout(done, 0);
  }
});

Tinytest.addAsync("Integration - re-render for the new layout", (test, done) => {
  BlazeLayout.reset();
  ResetStats('layout1');
  ResetStats('layout2');

  BlazeLayout.render('layout1');

  Tracker.afterFlush(() => {
    BlazeLayout.render('layout2', {aa: 899});
    Tracker.afterFlush(checkStatus);
  });

  function checkStatus() {
    test.isTrue(/899/.test($('#__blaze-root').text()));
    Meteor.setTimeout(done, 0);
  }
});

Tinytest.addAsync("Integration - render the new layout with data", (test, done) => {
  BlazeLayout.reset();
  ResetStats('layout1');
  ResetStats('layout2');

  BlazeLayout.render('layout1');

  Tracker.afterFlush(() => {
    BlazeLayout.render('layout2', {});
    Tracker.afterFlush(checkStatus);
  });

  function checkStatus() {
    test.isTrue(/layout2/.test($('#__blaze-root').text()));
    test.equal(TemplateStats.layout1.rendered, 1);
    test.equal(TemplateStats.layout1.destroyed, 1);
    Meteor.setTimeout(done, 0);
  }
});

Tinytest.addAsync("Integration - modify data", (test, done) => {
  BlazeLayout.reset();

  BlazeLayout.render('layout3', {aa: 10});

  Tracker.afterFlush(() => {
    test.isTrue(/10/.test($('#__blaze-root').text()));
    BlazeLayout.render('layout3', {aa: 30});
    Tracker.afterFlush(checkStatus);
  });

  function checkStatus() {
    test.isTrue(/30/.test($('#__blaze-root').text()));
    Meteor.setTimeout(done, 0);
  }
});

Tinytest.addAsync("Integration - pick new data", (test, done) => {
  BlazeLayout.reset();

  BlazeLayout.render('layout3', {aa: 10});

  Tracker.afterFlush(() => {
    test.isTrue(/10/.test($('#__blaze-root').text()));
    BlazeLayout.render('layout3', {aa: 30, bb: 20});
    Tracker.afterFlush(checkStatus);
  });

  function checkStatus() {
    test.isTrue(/30/.test($('#__blaze-root').text()));
    test.isTrue(/20/.test($('#__blaze-root').text()));
    Meteor.setTimeout(done, 0);
  }
});

Tinytest.addAsync("Integration - when data not exits in the second time", (test, done) => {
  BlazeLayout.reset();

  BlazeLayout.render('layout3', {aa: 30, bb: 100});

  Tracker.afterFlush(() => {
    test.isTrue(/100/.test($('#__blaze-root').text()));
    test.isTrue(/30/.test($('#__blaze-root').text()));
    BlazeLayout.render('layout3', {aa: 20});
    Tracker.afterFlush(checkStatus);
  });

  function checkStatus() {
    test.isTrue(/20/.test($('#__blaze-root').text()));
    test.isFalse(/100/.test($('#__blaze-root').text()));
    Meteor.setTimeout(done, 0);
  }
});

Tinytest.addAsync("Integration - do not re-render vars again", (test, done) => {
  BlazeLayout.reset();

  BlazeLayout.render('layout3', {aa: 10, bb: 20});

  Tracker.afterFlush(() => {
    test.isTrue(/10/.test($('#__blaze-root').text()));
    test.isTrue(/20/.test($('#__blaze-root').text()));
    $('#__blaze-root').html('');
    BlazeLayout.render('layout3', {aa: 10, bb: 20});
    Tracker.afterFlush(checkStatus);
  });

  function checkStatus() {
    test.equal($('#__blaze-root').html(), '');
    Meteor.setTimeout(done, 0);
  }
});

Tinytest.addAsync("Integration - render to the dom with no regions", (test, done) => {
  BlazeLayout.reset();
  BlazeLayout.render('layout1', {aa: 200});
  BlazeLayout.render('layout1');
  Tracker.afterFlush(() => {
    test.isTrue(/aa/.test($('#__blaze-root').text()));
    Meteor.setTimeout(done, 0);
  });
});

Tinytest.addAsync("Integration - using a different ROOT", (test, done) => {
  BlazeLayout.reset();
  const rootNode = $('<div id="iam-root"></div>');
  $('body').append(rootNode);
  BlazeLayout.root = '#iam-root';

  BlazeLayout.render('layout1', {aa: 200});
  Tracker.afterFlush(() => {
    test.isTrue(/200/.test($('#iam-root').text()));
    // @deprecation warning!
    // BlazeLayout.setRoot("#__blaze-root");
    BlazeLayout.root = '#__blaze-root';
    Meteor.setTimeout(done, 0);
    rootNode.remove();
  });
});
