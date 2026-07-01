import agentsPlugin, { lazyAgentsPlugin } from "@lazy-opencode/agents";
import { lazyOpencodeCore } from "@lazy-opencode/core";
import loopPlugin from "@lazy-opencode/loop";

const coreName: "@lazy-opencode/core" = lazyOpencodeCore.name;

const agentsPluginFactory: typeof lazyAgentsPlugin = agentsPlugin;
const loopPluginFactory: typeof loopPlugin = loopPlugin;

void coreName;
void agentsPluginFactory;
void loopPluginFactory;
