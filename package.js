'use strict';

Package.describe({
  summary: 'Layout Manager for Blaze (works well with FlowRouter)',
  version: '2.3.1',
  name: 'illusionfield:blaze-layout',
  git: 'https://github.com/illusionfield/blaze-layout',
});

Package.onUse(api => {
  api.versionsFrom('1.8.1');
  configure(api);

  api.mainModule('lib/layout.js', 'client');
  api.export('BlazeLayout', 'client');
});

Package.onTest(api => {
  configure(api);

  api.use([
    'tinytest',
    'templating',
    'tracker',
    'jquery',
  ], 'client');

  api.addFiles([
    'tests/unit.js',
    'tests/integration.js',
  ], 'client');
});

function configure(api) {
  api.use([
    'ecmascript',
    'blaze',
    'spacebars',
    'reactive-dict',
    'underscore',
  ], 'client');
}
