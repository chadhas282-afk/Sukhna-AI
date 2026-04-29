import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

// Hookup an engine to a worker handler
const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg) => {
  handler.onmessage(msg);
};
