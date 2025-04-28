import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _sfc_main$1 } from './SidebarItem-BgdjfSIq.mjs';
import './nuxt-link-B6VuTSwX.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const _sfc_main = {
  __name: "Account",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex h-screen bg-black text-white" }, _attrs))}><aside class="w-60 bg-[#0F0F0F] p-4 flex flex-col justify-between"><div><h1 class="text-xl font-bold mb-8">NeuroAI</h1><nav class="space-y-4">`);
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "cpu",
        label: "Segmentation",
        to: "/"
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "activity",
        label: "Activity",
        to: "/activity"
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "user",
        label: "Account",
        active: ""
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "settings",
        label: "Settings",
        to: "/Settings"
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "box",
        label: "AI Items",
        to: "/AIModel"
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "database",
        label: "Datasets",
        to: "/datasets"
      }, null, _parent));
      _push(`</nav></div><div>`);
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "log-out",
        label: "Logout"
      }, null, _parent));
      _push(`</div></aside><main class="flex-1 flex flex-col overflow-hidden"><header class="flex justify-between items-center px-6 py-4 border-b border-gray-800"><h2 class="text-lg font-semibold">Account</h2></header><div class="p-8 space-y-6 overflow-y-auto"><div class="bg-[#181818] p-6 rounded-xl border border-gray-700 shadow space-y-3"><h3 class="text-xl font-semibold">User Profile</h3><p><span class="text-gray-400">Name:</span> Alex Neuro</p><p><span class="text-gray-400">Email:</span> alex@neuroai.org</p><p><span class="text-gray-400">Role:</span> AI Researcher</p><p><span class="text-gray-400">Member since:</span> March 2024</p></div><div class="bg-[#181818] p-6 rounded-xl border border-gray-700 shadow space-y-3"><h3 class="text-xl font-semibold">Recent Activity</h3><ul class="list-disc list-inside text-gray-400"><li>Launched segmentation with UNet-V3</li><li>Modified settings on DeepSeg Alpha</li><li>Viewed dataset FLAIR2025</li></ul></div></div></main></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/Account.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=Account-RO5AEP57.mjs.map
