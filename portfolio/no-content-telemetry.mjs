import {normalizeGenAiOperationEvent} from "@categori/studio-contracts";

export const event = normalizeGenAiOperationEvent({
  operationName: "invoke_agent",
  providerName: "local",
  requestModel: "deterministic-local-demo",
  responseModel: "deterministic-local-demo",
  projectId: "evidence-review",
  runId: "synthetic-run",
  inputMessages: [{role: "user", parts: [{type: "text", content: "private input"}]}],
  outputMessages: [{role: "assistant", parts: [{type: "text", content: "private output"}]}],
  systemInstructions: [{type: "text", content: "private instructions"}],
  toolDefinitions: [{type: "function", name: "private_tool"}],
  promptVariables: {client_material: "private value"},
  usage: {inputTokens: 12, outputTokens: 4}
});

if (import.meta.main) console.log(JSON.stringify(event, null, 2));
