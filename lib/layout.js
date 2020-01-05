import { Meteor } from 'meteor/meteor';

var
  currentLayoutName = null,
  currentLayout = null,
  currentData,
  _isReady = false,
  currentRegions = new ReactiveDict();

const BlazeLayout = {
  render(layout, regions) {
    regions = regions || {};
    Meteor.startup(() => {
      // To make sure dom is loaded before we do rendering layout.
      // Related to issue #25
      if(!_isReady) {
        Meteor.defer(() => {
          _isReady = true;
          this._render(layout, regions)
        });
      } else {
        this._render(layout, regions);
      }
    });
  },
  reset() {
    if(!currentLayout) {
      return;
    }

    const layout = currentLayout;
    if(layout._domrange) {
      // if it's rendered let's remove it right away
      Blaze.remove(layout);
    } else {
      // if not let's remove it when it rendered
      layout.onViewReady(() => {
        Blaze.remove(layout);
      });
    }

    currentLayout = null;
    currentLayoutName = null;
    currentRegions = new ReactiveDict();
  },

  set root(r) {
    this._root = r;
  },
  get root() {
    let r = this._root;
    if(!r) {
      r = Blaze._DOMBackend.parseHTML('<div id="__blaze-root"></div>')[0];
      document.body.appendChild(r);
      this._root = r;
    } else if (typeof r === 'string') {
      r = Blaze._DOMBackend.findBySelector(r, document)[0];
    } else if (r.jquery) {
      r = r[0];
    }
    if(!r) {
      throw new Error('Root element does not exist');
    }
    return r;
  },

  _regionsToData(regions, data) {
    data = data || {};
    _.each(regions, (value, key) => {
      currentRegions.set(key, value);
      data[key] = this._buildRegionGetter(key);
    });

    return data;
  },
  _updateRegions(regions) {
    let needsRerender = false;

    // unset removed regions from the exiting data
    _.each(currentData, (value, key) => {
      if(regions[key] === undefined) {
        currentRegions.delete(key);
        delete currentData[key];
      }
    });

    _.each(regions, (value, key) => {
      // If this key does not yet exist then Blaze has no idea about this key
      // and it won't get the value of this key so, we need to force a re-render.
      if(currentData && currentData[key] === undefined) {
        needsRerender = true;
        // and, add the data function for this new key
        currentData[key] = this._buildRegionGetter(key);
      }
      currentRegions.set(key, value);
    });

    // force re-render if we need to
    if(currentLayout && needsRerender) {
      currentLayout.dataVar.dep.changed();
    }
  },
  _buildRegionGetter(key) {
    return () => currentRegions.get(key);
  },
  _getTemplate(layout, rootDomNode) {
    return Blaze._getTemplate(layout, () => {
      var view = Blaze.getView(rootDomNode);
      // find the closest view with a template instance
      while (view && !view._templateInstance) {
        view = view.originalParentView || view.parentView;
      }
      // return found template instance, or null
      return (view && view._templateInstance) || null;
    });
  },
  _render(layout, regions) {
    if(currentLayoutName === layout) {
      this._updateRegions(regions);
      return;
    }

    const rootDomNode = this.root;

    // remove old view
    this.reset();
    currentData = this._regionsToData(regions);

    currentLayout = Blaze._TemplateWith(currentData, () => {
      const template = this._getTemplate(layout, rootDomNode);

      // 'layout' should be null (to render nothing) or an existing template name
      if(layout !== null && !template) {
        console.warn(`BlazeLayout warning: unknown template "${layout}"`);
      }

      return Spacebars.include(template);
    });

    Blaze.render(currentLayout, rootDomNode, null, Blaze.getView(rootDomNode));
    currentLayoutName = layout;
  },

  /**
   * @deprecated in 2.3.1
   */
  setRoot(r) {
    console.log(`"BlazeLayout.setRoot" function has been deprecated.\nUse "BlazeLayout.root = value" instead.`);
    this.root = r;
  },
  _getRootDomNode() {
    console.log(`"BlazeLayout._getRootDomNode" function has been deprecated.\nUse "const rootDomNode = BlazeLayout.root" instead.`);
    return this.root;
  },

};

export { BlazeLayout };
