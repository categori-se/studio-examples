import test from "node:test";
import assert from "node:assert/strict";
import project from "../local-demo/project.json" with {type: "json"};
import {validateProject} from "@categori/workbench-contracts";

test("local example uses the public project contract", () => {
  assert.deepEqual(validateProject(project), []);
});
