import type { Plugin } from "@opencode-ai/plugin";

import { applyLazyAgentCatalog } from "./config.js";

export const lazyAgentsPlugin: Plugin = async () => ({
  config: async (config) => {
    applyLazyAgentCatalog(config);
  },
});

export default lazyAgentsPlugin;
