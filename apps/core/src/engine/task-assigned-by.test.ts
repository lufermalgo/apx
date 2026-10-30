// A task says who gave it to its agent: the creation with one, or the last assignment; the Team view draws the curve.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { say, scriptedLlm, startCore } from "./testkit.ts";

let env: Awaited<ReturnType<typeof startCore>>;
before(async () => {
  env = await startCore({ llm: scriptedLlm(() => say("ok")) });
});
after(async () => {
  await env.core.close();
  await env.cleanup();
});

const make = (title: string, by: string, assignee?: string) =>
  env.core.store.tasks.create({
    title,
    ...(assignee ? { assignee } : {}),
    status: "todo",
    thread_id: env.core.store.threads.create({ kind: "task", title, agent_ids: ["superagent"] }).id,
    by,
  });

test("the giver is whoever created it with an agent, then whoever assigned it last", () => {
  const { tasks } = env.core.store;
  const t = make("Hand over", "ansel", "zoya");
  assert.equal(tasks.get(t.id)?.assigned_by, "ansel");
  tasks.change(t.id, { assignee: "mira" }, "zoya");
  assert.equal(tasks.get(t.id)?.assigned_by, "zoya");
  assert.equal(tasks.get(t.id)?.assignee, "mira");
});

test("a card nobody was given has no giver, and one that is taken back loses it", () => {
  const { tasks } = env.core.store;
  const t = make("Loose", "ansel");
  assert.equal(tasks.get(t.id)?.assigned_by, undefined);
  tasks.change(t.id, { assignee: "mira" }, "ansel");
  tasks.change(t.id, { assignee: null }, "ansel");
  assert.equal(tasks.get(t.id)?.assigned_by, undefined);
});
