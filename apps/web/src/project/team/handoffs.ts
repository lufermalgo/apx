import type { Task } from "@apx/protocol";

/**
 * "giver>agent" pairs for the Team view's moving dot: an open card that one agent gave to another, while the one it
 * was given to is working. Teams that hand work over by reassigning cards (no delegation between runs) light up the
 * same curves as the ones that delegate.
 */
export function handoffEdges(tasks: Iterable<Task>, working: ReadonlySet<string>): Set<string> {
  const out = new Set<string>();
  for (const t of tasks) {
    if (t.state !== "open" || !t.assignee || !working.has(t.assignee)) continue;
    const giver = t.assigned_by;
    if (giver && giver !== "owner" && giver !== t.assignee) out.add(`${giver}>${t.assignee}`);
  }
  return out;
}
