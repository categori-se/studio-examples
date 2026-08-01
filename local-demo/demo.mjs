import project from "./project.json" with {type: "json"};
import {createLocalWorkbench, createMockProvider} from "@categori/workbench-core";

const workbench = createLocalWorkbench({projects: [project], provider: createMockProvider()});
const result = await workbench.run({
  capability: "plan",
  projectId: project.id,
  modelPolicy: project.modelPolicy,
  sensitivity: project.dataSensitivity,
  context: [{kind: "instruction", text: "Describe a safe next step."}],
  tools: []
});

console.log(result.output);
