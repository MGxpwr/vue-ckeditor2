'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

//
//
//
//
//
//
//
//
//
//
//
//
//
//
var inc = new Date().getTime();
var script = {
  name: 'VueCkeditor',
  props: {
    name: {
      type: String,
      default: function _default() {
        return 'editor-'.concat(++inc);
      }
    },
    value: {
      type: String
    },
    id: {
      type: String,
      default: function _default() {
        return 'editor-'.concat(inc);
      }
    },
    types: {
      type: String,
      default: function _default() {
        return 'classic';
      }
    },
    config: {
      type: Object,
      default: function _default() {}
    },
    instanceReadyCallback: {
      type: Function
    },
    readOnlyMode: {
      type: Boolean,
      default: function _default() {
        return false;
      }
    }
  },
  data: function data() {
    return {
      instanceValue: ''
    };
  },
  computed: {
    instance: function instance() {
      return CKEDITOR.instances[this.id];
    }
  },
  watch: {
    value: function value(val) {
      try {
        if (this.instance) {
          this.update(val);
        }
      } catch (e) {}
    },
    readOnlyMode: function readOnlyMode(val) {
      this.instance.setReadOnly(val);
    }
  },
  mounted: function mounted() {
    var _this = this;

    var ckEditorScript = document.createElement('script');
    ckEditorScript.setAttribute(
      'src',
      '//cdn.ckeditor.com/4.11.2/standard/ckeditor.js'
    );

    ckEditorScript.onload = function() {
      _this.create();
    };

    document.head.appendChild(ckEditorScript);
  },
  methods: {
    create: function create() {
      var _this2 = this;

      if (typeof CKEDITOR === 'undefined') {
        console.log('CKEDITOR is missing (http://ckeditor.com/)');
      } else {
        if (this.types === 'inline') {
          CKEDITOR.inline(this.id, this.config);
        } else {
          CKEDITOR.replace(this.id, this.config);
        }

        this.instance.setData(this.value);
        this.instance.on('instanceReady', function() {
          _this2.instance.setData(_this2.value);
        }); // Ckeditor change event

        this.instance.on('change', this.onChange); // Ckeditor mode html or source

        this.instance.on('mode', this.onMode); // Ckeditor blur event

        this.instance.on('blur', function(evt) {
          _this2.$emit('blur', evt);
        }); // Ckeditor focus event

        this.instance.on('focus', function(evt) {
          _this2.$emit('focus', evt);
        }); // Ckeditor contentDom event

        this.instance.on('contentDom', function(evt) {
          _this2.$emit('content-dom', evt);
        }); // Ckeditor dialog definition event

        CKEDITOR.on('dialogDefinition', function(evt) {
          _this2.$emit('dialog-definition', evt);
        }); // Ckeditor file upload request event

        this.instance.on('fileUploadRequest', function(evt) {
          _this2.$emit('file-upload-request', evt);
        }); // Ckditor file upload response event

        this.instance.on('fileUploadResponse', function(evt) {
          setTimeout(function() {
            _this2.onChange();
          }, 0);

          _this2.$emit('file-upload-response', evt);
        }); // Listen for instanceReady event

        if (typeof this.instanceReadyCallback !== 'undefined') {
          this.instance.on('instanceReady', this.instanceReadyCallback);
        } // Registering the beforeDestroyed hook right after creating the instance

        this.$once('hook:beforeDestroy', function() {
          _this2.destroy();
        });
      }
    },
    update: function update(val) {
      if (this.instanceValue !== val) {
        this.instance.setData(val, {
          internal: false
        });
      }
    },
    destroy: function destroy() {
      try {
        var editor = window['CKEDITOR'];

        if (editor.instances) {
          for (var instance in editor.instances) {
            instance.destroy();
          }
        }
      } catch (e) {}
    },
    onMode: function onMode() {
      var _this3 = this;

      if (this.instance.mode === 'source') {
        var editable = this.instance.editable();
        editable.attachListener(editable, 'input', function() {
          _this3.onChange();
        });
      }
    },
    onChange: function onChange() {
      var html = this.instance.getData();

      if (html !== this.value) {
        this.$emit('input', html);
        this.instanceValue = html;
      }
    }
  }
};

function normalizeComponent(
  template,
  style,
  script,
  scopeId,
  isFunctionalTemplate,
  moduleIdentifier,
  /* server only */
  shadowMode,
  createInjector,
  createInjectorSSR,
  createInjectorShadow
) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.

  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId

  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles

      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference

      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called

    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode
      ? function() {
          style.call(
            this,
            createInjectorShadow(this.$root.$options.shadowRoot)
          );
        }
      : function(context) {
          style.call(this, createInjector(context));
        };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c('div', { staticClass: 'ckeditor' }, [
    _c('textarea', {
      attrs: {
        name: _vm.name,
        id: _vm.id,
        types: _vm.types,
        config: _vm.config,
        disabled: _vm.readOnlyMode
      },
      domProps: { value: _vm.value }
    })
  ]);
};
var __vue_staticRenderFns__ = [];

/* style */
var __vue_inject_styles__ = undefined;
/* scoped */
var __vue_scope_id__ = undefined;
/* module identifier */
var __vue_module_identifier__ = undefined;
/* functional template */
var __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

var VueCkeditor = normalizeComponent_1(
  { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
  __vue_inject_styles__,
  __vue_script__,
  __vue_scope_id__,
  __vue_is_functional_template__,
  __vue_module_identifier__,
  undefined,
  undefined
);

exports.default = VueCkeditor;
