import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
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
  __name: "Datasets",
  __ssrInlineRender: true,
  setup(__props) {
    const datasets = [
      { name: "BrainSet_A", description: "Standard MRI dataset for training.", samples: 240 },
      { name: "NeuroScan_03", description: "Advanced multi-slice set.", samples: 180 },
      { name: "ScanLab", description: "Preprocessed MRI scans with annotations.", samples: 320 },
      { name: "T1Data", description: "T1-weighted MRI dataset.", samples: 140 },
      { name: "FLAIR2025", description: "FLAIR MRI scans with lesion annotations.", samples: 200 },
      { name: "MixedNeuroSet", description: "Combined dataset of multiple sources.", samples: 400 },
      { name: "NeuroStack", description: "Stacked volume sequences.", samples: 190 },
      { name: "AxialSet", description: "Axial slices from multiple institutions.", samples: 150 }
    ];
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
        icon: "settings",
        label: "Account",
        to: "/Account"
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "settings",
        label: "Settings",
        to: "/settings"
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "box",
        label: "AI Items",
        to: "/AIModel"
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "database",
        label: "Datasets",
        to: "/datasets",
        active: ""
      }, null, _parent));
      _push(`</nav></div><div>`);
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "log-out",
        label: "Logout"
      }, null, _parent));
      _push(`</div></aside><main class="flex-1 flex flex-col overflow-hidden"><header class="flex justify-between items-center px-6 py-4 border-b border-gray-800"><h2 class="text-lg font-semibold">Datasets</h2><button class="px-4 py-2 bg-blue-700 rounded hover:bg-blue-600 text-sm"> Add New Dataset </button></header><div class="p-6 space-y-4 overflow-y-auto"><!--[-->`);
      ssrRenderList(datasets, (dataset, index) => {
        _push(`<div class="bg-[#181818] p-5 rounded-xl border border-gray-700 shadow space-y-2"><div class="flex justify-between items-center"><div><h3 class="text-lg font-semibold">${ssrInterpolate(dataset.name)}</h3><p class="text-sm text-gray-400">${ssrInterpolate(dataset.description)}</p><p class="text-xs text-gray-500 mt-1">Samples: ${ssrInterpolate(dataset.samples)}</p></div><div class="flex gap-2"><button class="bg-blue-700 px-3 py-1 rounded hover:bg-blue-600 text-sm">View</button><button class="bg-red-700 px-3 py-1 rounded hover:bg-red-600 text-sm">Delete</button></div></div></div>`);
      });
      _push(`<!--]--></div></main></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/Datasets.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=Datasets-v6_C0wQL.mjs.map
