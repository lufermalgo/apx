import assert from "node:assert/strict";
import { test } from "node:test";
import type { Task } from "@apx/protocol";
import { handoffEdges } from "./handoffs.ts";

const task = (o: Partial<Task>) => ({ id: "t", state: "open", ...o }) as Task;

test("a card given by an agent to an agent that is working lights the curve", () => {
  const edges = handoffEdges([task({ assignee: "zoya", assigned_by: "ansel" })], new Set(["zoya"]));
  assert.deepEqual([...edges], ["ansel>zoya"]);
});

test("nothing lights when the agent is idle, the owner gave it, the agent gave it to itself or the card is closed", () => {
  const working = new Set(["zoya"]);
  assert.equal(handoffEdges([task({ assignee: "zoya", assigned_by: "ansel" })], new Set()).size, 0);
  assert.equal(handoffEdges([task({ assignee: "zoya", assigned_by: "owner" })], working).size, 0);
  assert.equal(handoffEdges([task({ assignee: "zoya", assigned_by: "zoya" })], working).size, 0);
  assert.equal(handoffEdges([task({ assignee: "zoya", assigned_by: "ansel", state: "done" })], working).size, 0);
  assert.equal(handoffEdges([task({ assigned_by: "ansel" })], working).size, 0);
});
