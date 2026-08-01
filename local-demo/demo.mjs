import project from "./project.json" with {type: "json"};
import {createLocalStudio, createMockProvider} from "@categori/studio-core";

const studio = createLocalStudio({projects: [project], provider: createMockProvider()});
const result = await studio.run({
  capability: "plan",
  projectId: project.id,
  modelPolicy: project.modelPolicy,
  sensitivity: project.dataSensitivity,
  context: [{kind: "instruction", text: "Describe a safe next step."}],
  tools: []
});

console.log(result.output);
