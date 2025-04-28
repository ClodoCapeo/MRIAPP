import { ref, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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

const itemsPerPage = 10;
const _sfc_main = {
  __name: "Activity",
  __ssrInlineRender: true,
  setup(__props) {
    const allHistory = [
      { date: "2025-04-01", method: "UNet-V2", dataset: "BrainSet_A", mode: "training" },
      { date: "2025-04-02", method: "DeepSeg-Alpha", dataset: "NeuroScan_03", mode: "test" },
      { date: "2025-04-03", method: "VisionMixer", dataset: "ScanLab", mode: "training" },
      { date: "2025-04-04", method: "HoloNet", dataset: "T1Data", mode: "training" },
      { date: "2025-04-05", method: "UNet-V2", dataset: "BrainSet_B", mode: "test" },
      { date: "2025-04-06", method: "DeepSeg-Alpha", dataset: "NeuroScan_03", mode: "training" },
      { date: "2025-04-07", method: "VisionMixer", dataset: "ScanLab", mode: "test" },
      { date: "2025-04-08", method: "HoloNet", dataset: "T2Data", mode: "test" },
      { date: "2025-04-09", method: "UNet-V2", dataset: "FLAIR2025", mode: "training" },
      { date: "2025-04-10", method: "DeepSeg-Alpha", dataset: "MixedNeuroSet", mode: "test" },
      { date: "2025-04-11", method: "DeepSeg-X", dataset: "NeuroStack", mode: "training" },
      { date: "2025-04-12", method: "UNet-V3", dataset: "AxialSet", mode: "test" }
    ];
    const currentPage = ref(1);
    const totalPages = computed(() => Math.ceil(allHistory.length / itemsPerPage));
    const paginatedItems = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      return allHistory.slice(start, start + itemsPerPage);
    });
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
        to: "/Activity",
        active: ""
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "settings",
        label: "Account",
        to: "/Account"
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "account",
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
      _push(`</div></aside><main class="flex-1 flex flex-col overflow-hidden"><header class="flex justify-between items-center px-6 py-4 border-b border-gray-800"><h2 class="text-lg font-semibold">Activity - Historique des Segmentations</h2></header><div class="flex-1 overflow-y-auto p-6 space-y-4"><!--[-->`);
      ssrRenderList(paginatedItems.value, (item, index) => {
        _push(`<div class="bg-[#181818] p-4 rounded shadow border border-gray-700"><h3 class="font-semibold text-base mb-1">Segmentation #${ssrInterpolate(index + 1 + (currentPage.value - 1) * itemsPerPage)}</h3><p class="text-sm text-gray-400">Date: ${ssrInterpolate(item.date)}</p><p class="text-sm text-gray-400">M\xE9thode: ${ssrInterpolate(item.method)}</p><p class="text-sm text-gray-400">Dataset: ${ssrInterpolate(item.dataset)}</p><p class="text-sm text-gray-400">Mode: ${ssrInterpolate(item.mode)}</p></div>`);
      });
      _push(`<!--]--></div><footer class="border-t border-gray-800 px-6 py-4 flex justify-center gap-3"><button class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"${ssrIncludeBooleanAttr(currentPage.value === 1) ? " disabled" : ""}> Prev </button><span class="px-2">Page ${ssrInterpolate(currentPage.value)} / ${ssrInterpolate(totalPages.value)}</span><button class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"${ssrIncludeBooleanAttr(currentPage.value === totalPages.value) ? " disabled" : ""}> Next </button></footer></main></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/Activity.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=Activity-CooIhiG9.mjs.map
