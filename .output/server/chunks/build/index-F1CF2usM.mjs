import { a as buildAssetsURL } from '../routes/renderer.mjs';
import { ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { _ as _sfc_main$1 } from './SidebarItem-BgdjfSIq.mjs';
import { _ as _export_sfc } from './server.mjs';
import 'vue-bundle-renderer/runtime';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import './nuxt-link-B6VuTSwX.mjs';
import 'vue-router';

const _imports_0 = "" + buildAssetsURL("brain-scan.DkZ-zJAE.jpg");
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const methods = ref([]);
    const datasets = ref([]);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex h-screen bg-black text-white" }, _attrs))} data-v-a7119513><aside class="w-60 bg-[#0F0F0F] p-4 flex flex-col justify-between" data-v-a7119513><div data-v-a7119513><h1 class="text-xl font-bold mb-8" data-v-a7119513>NeuroAI</h1><nav class="space-y-4" data-v-a7119513>`);
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "user",
        label: "Segmentation",
        active: ""
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "activity",
        label: "Activity",
        to: "/Activity"
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "account",
        label: "Account",
        to: "/Account"
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "accountd",
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
        to: "/Datasets"
      }, null, _parent));
      _push(`</nav></div><div data-v-a7119513>`);
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "log-out",
        label: "Logout"
      }, null, _parent));
      _push(`</div></aside><main class="flex-1 flex flex-col" data-v-a7119513><header class="flex justify-between items-center px-6 py-4 border-b border-gray-800" data-v-a7119513><h2 class="text-lg font-semibold" data-v-a7119513>DICOM Segmentation</h2><div class="flex items-center gap-4" data-v-a7119513><input type="text" placeholder="Search" class="bg-gray-900 rounded px-3 py-1.5 text-sm" data-v-a7119513><div class="bg-gray-800 px-3 py-1.5 rounded" data-v-a7119513>NeuroAlgia</div></div></header><div class="flex flex-1 overflow-hidden" data-v-a7119513><section class="flex w-full flex-col justify-between p-0 overflow-auto bg-black" data-v-a7119513><div class="flex justify-center align-middle h-full items-center" data-v-a7119513><img${ssrRenderAttr("src", _imports_0)} alt="Brain Scan" class="max-h-[400px] rounded-lg shadow-xl border border-gray-700" data-v-a7119513></div><div class="mt-10 bg-[#181818] p-6 shadow-md" data-v-a7119513><h3 class="text-xl font-semibold mb-6" data-v-a7119513>Analyse &amp; Contr\xF4le du Scanner</h3><div class="grid grid-cols-3 gap-6" data-v-a7119513><div data-v-a7119513><label class="block text-sm font-medium mb-2" data-v-a7119513>\u{1F50D} Zoom</label><input type="range" min="1" max="10" class="w-full accent-cyan-500" data-v-a7119513></div><div data-v-a7119513><label class="block text-sm font-medium mb-2" data-v-a7119513>\u{1F9ED} Coupe</label><select class="w-full bg-gray-900 px-3 py-2 rounded" data-v-a7119513><option data-v-a7119513>Axiale</option><option data-v-a7119513>Coronale</option><option data-v-a7119513>Sagittale</option></select></div><div data-v-a7119513><label class="block text-sm font-medium mb-2" data-v-a7119513>\u{1F4D0} Plan</label><select class="w-full bg-gray-900 px-3 py-2 rounded" data-v-a7119513><option data-v-a7119513>Standard</option><option data-v-a7119513>FLAIR</option><option data-v-a7119513>T1</option><option data-v-a7119513>T2</option></select></div><div data-v-a7119513><label class="block text-sm font-medium mb-2" data-v-a7119513>\u{1F9EC} Mode 3D</label><label class="flex items-center gap-2" data-v-a7119513><input type="checkbox" class="toggle toggle-sm" data-v-a7119513> Activer </label></div><div class="col-span-2" data-v-a7119513><label class="block text-sm font-medium mb-2" data-v-a7119513>Explication IA</label><textarea class="w-full bg-gray-900 px-3 py-2 rounded h-24 text-sm" placeholder="R\xE9sum\xE9 g\xE9n\xE9r\xE9 par le mod\xE8le d\u2019IA, incluant d\xE9tection de l\xE9sions, segmentation, etc..." data-v-a7119513></textarea></div></div></div></section><aside class="w-[380px] border-l border-gray-800 p-6 space-y-6 bg-[#0F0F0F]" data-v-a7119513><div class="flex items-center justify-between" data-v-a7119513><h3 class="text-lg font-semibold" data-v-a7119513>NeuralNet Segmentation</h3><input type="checkbox" class="toggle toggle-sm" checked data-v-a7119513></div><div data-v-a7119513><label class="block text-sm font-medium mb-1" data-v-a7119513>Time Model</label><input type="range" class="w-full" data-v-a7119513><input type="range" class="w-full" data-v-a7119513></div><div data-v-a7119513><label class="block text-sm font-medium mb-1" data-v-a7119513>Networks</label><select class="w-full bg-gray-900 px-3 py-2 rounded" data-v-a7119513><option data-v-a7119513>AI Mixer feed x8 Transformation</option></select></div><div class="space-y-3" data-v-a7119513><div data-v-a7119513><label class="block text-sm font-medium" data-v-a7119513>User AI Protocol</label><select class="w-full bg-gray-900 px-3 py-2 rounded" data-v-a7119513><option data-v-a7119513>Pre. AI Fusion Hologrammode</option></select></div><div data-v-a7119513><label class="block text-sm font-medium" data-v-a7119513>Cerebral Origin</label><label class="flex items-center gap-2 mt-1" data-v-a7119513><input type="checkbox" class="toggle toggle-sm" checked data-v-a7119513> Lobe confirmed </label></div></div><div data-v-a7119513><label class="block text-sm font-medium mb-1" data-v-a7119513>Method</label><select class="w-full bg-gray-900 px-3 py-2 rounded" data-v-a7119513><!--[-->`);
      ssrRenderList(methods.value, (method) => {
        _push(`<option${ssrRenderAttr("value", method)} data-v-a7119513>${ssrInterpolate(method)}</option>`);
      });
      _push(`<!--]--></select></div><div data-v-a7119513><label class="block text-sm font-medium mb-1" data-v-a7119513>Dataset</label><select class="w-full bg-gray-900 px-3 py-2 rounded" data-v-a7119513><!--[-->`);
      ssrRenderList(datasets.value, (dataset) => {
        _push(`<option${ssrRenderAttr("value", dataset)} data-v-a7119513>${ssrInterpolate(dataset)}</option>`);
      });
      _push(`<!--]--></select></div><div data-v-a7119513><label class="block text-sm font-medium mb-1" data-v-a7119513>Mode</label><div class="flex gap-4" data-v-a7119513><label class="flex items-center gap-2" data-v-a7119513><input type="radio" name="mode" class="text-cyan-500" value="training" checked data-v-a7119513> Training </label><label class="flex items-center gap-2" data-v-a7119513><input type="radio" name="mode" class="text-cyan-500" value="test" data-v-a7119513> Test </label></div></div></aside></div></main></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a7119513"]]);

export { index as default };
//# sourceMappingURL=index-F1CF2usM.mjs.map
