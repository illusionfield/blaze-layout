import './init.templates.html';

const TemplateStats = {};

ResetStats('layout1');

Template.layout1.onRendered(function() {
  TemplateStats.layout1.rendered++;
});

Template.layout1.onDestroyed(function() {
  TemplateStats.layout1.destroyed++;
});

function ResetStats(layoutName) {
  TemplateStats[layoutName] = {
    rendered: 0,
    destroyed: 0
  };
}

export {
  TemplateStats,
  ResetStats,
};
