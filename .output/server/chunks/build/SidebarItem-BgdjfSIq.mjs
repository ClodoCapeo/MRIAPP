import { _ as __nuxt_component_0 } from './nuxt-link-B6VuTSwX.mjs';
import { mergeProps, withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = {
  __name: "SidebarItem",
  __ssrInlineRender: true,
  props: {
    icon: String,
    label: String,
    active: Boolean,
    to: String
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: __props.to,
        class: "block"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="${ssrRenderClass([
              "flex items-center gap-3 px-4 py-2 rounded cursor-pointer hover:bg-gray-800",
              __props.active ? "bg-gray-800 text-white font-semibold" : "text-gray-400"
            ])}"${_scopeId}><i class="${ssrRenderClass(`lucide-${__props.icon}`)}"${_scopeId}></i><span${_scopeId}>${ssrInterpolate(__props.label)}</span></div>`);
          } else {
            return [
              createVNode("div", {
                class: [
                  "flex items-center gap-3 px-4 py-2 rounded cursor-pointer hover:bg-gray-800",
                  __props.active ? "bg-gray-800 text-white font-semibold" : "text-gray-400"
                ]
              }, [
                createVNode("i", {
                  class: `lucide-${__props.icon}`
                }, null, 2),
                createVNode("span", null, toDisplayString(__props.label), 1)
              ], 2)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SidebarItem.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=SidebarItem-BgdjfSIq.mjs.map
