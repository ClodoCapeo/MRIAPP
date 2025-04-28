import { ref, mergeProps, useSSRContext } from 'vue';
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
  __name: "AIModel",
  __ssrInlineRender: true,
  setup(__props) {
    const models = ref([
      {
        name: "DeepMedic",
        description: "The DeepMedic algorithm is a deep learning-based model designed for semantic segmentation, specifically used in medical image analysis, such as brain tumor detection, by leveraging 3D convolutional neural networks to process and classify volumetric data.",
        status: "Ready"
      },
      {
        name: "SegNet",
        description: "SegNet is a deep learning model for semantic image segmentation using an encoder-decoder architecture.",
        status: "Trained"
      },
      {
        name: "Slant",
        description: "SLANT is a deep learning model designed for real-time semantic segmentation with a focus on improving accuracy and efficiency in edge devices..",
        status: "Idle"
      },
      {
        name: "Unet",
        description: "U-Net is a convolutional neural network architecture designed for semantic segmentation, particularly in medical image analysis, using an encoder-decoder structure with skip connections for precise pixel-level predictions.",
        status: "Ready"
      },
      {
        name: "Vnet",
        description: "ChatGPT a dit\xA0:\nV-Net is a deep learning architecture for 3D image segmentation, using volumetric convolutions and an encoder-decoder structure with skip connections, primarily applied in medical imaging tasks.",
        status: "Ready"
      }
    ]);
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
        to: "/Settings"
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "box",
        label: "AI Items",
        active: ""
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "database",
        label: "Datasets",
        to: "/Datasets"
      }, null, _parent));
      _push(`</nav></div><div>`);
      _push(ssrRenderComponent(_sfc_main$1, {
        icon: "log-out",
        label: "Logout"
      }, null, _parent));
      _push(`</div></aside><main class="flex-1 flex flex-col overflow-hidden"><header class="flex justify-between items-center px-6 py-4 border-b border-gray-800"><h2 class="text-lg font-semibold">AI Models Management</h2><button class="px-4 py-2 bg-blue-700 rounded hover:bg-blue-600 text-sm"> Add New Model </button></header><div class="p-6 space-y-6 overflow-y-auto"><!--[-->`);
      ssrRenderList(models.value, (model, index) => {
        _push(`<div class="bg-[#181818] p-6 rounded-xl border border-gray-700 shadow space-y-4"><div class="flex justify-between items-center"><div><h3 class="text-xl font-semibold">${ssrInterpolate(model.name)}</h3><p class="text-sm text-gray-400">Status: ${ssrInterpolate(model.status)}</p></div><div class="flex gap-2"><button class="px-3 py-1 bg-blue-700 rounded hover:bg-blue-600 text-sm">Train</button><button class="px-3 py-1 bg-green-700 rounded hover:bg-green-600 text-sm">Load</button><button class="px-3 py-1 bg-yellow-700 rounded hover:bg-yellow-600 text-sm">Save</button><button class="px-3 py-1 bg-red-700 rounded hover:bg-red-600 text-sm">Reset</button></div></div><p class="text-sm text-gray-400">${ssrInterpolate(model.description)}</p></div>`);
      });
      _push(`<!--]--></div></main></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/AIModel.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=AIModel-BoB2Yx1I.mjs.map
