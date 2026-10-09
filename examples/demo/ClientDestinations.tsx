import { useState } from "react";
import {
  Button,
  Input,
  IconButton,
  InternalScrollArea,
  DesktopMenu,
} from "../../src";
import { Folder, PushPin, NotePencil, DotsThree } from "@phosphor-icons/react";
import { projectMenu, type Actions } from "./client-menus";
import type { DemoProject } from "./client-data";
export function ProjectDirectory({
  projects,
  actions,
  onOpen,
}: {
  projects: DemoProject[];
  actions: Actions;
  onOpen: (id: string) => void;
}) {
  const [query, setQuery] = useState(""),
    [reverse, setReverse] = useState(false);
  const visible = projects.filter((project) =>
    project.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <InternalScrollArea className="client-project-directory">
      <div>
        <header>
          <h1>Projects</h1>
          <Input
            aria-label="Search projects"
            placeholder="Search projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button actionId="client.directory.create" onClick={actions.create}>
            + Create
          </Button>
        </header>
        <div className="client-project-directory-columns">
          <span>Name</span>
          <Button
            size="sm"
            actionId="client.directory.sort"
            onClick={() => setReverse(!reverse)}
          >
            Updated {reverse ? "↑" : "↓"}
          </Button>
        </div>
        {(reverse ? [...visible].reverse() : visible).map((project) => (
          <div className="client-project-directory-row" key={project.id}>
            <Button
              actionId="client.directory.open"
              icon={<Folder size={16} />}
              onClick={() => onOpen(project.id)}
            >
              {project.name}
            </Button>
            <span>1h</span>
            <DesktopMenu
              trigger={
                <button
                  className="desktop-icon-control"
                  aria-label={"Project actions for " + project.name}
                >
                  <DotsThree size={16} />
                </button>
              }
              items={projectMenu(project, actions)}
            />
            <IconButton
              aria-label={"Pin " + project.name}
              aria-pressed={!!project.pinned}
              actionId="client.directory.pin"
              onClick={() => actions.projectPin(project)}
            >
              <PushPin size={16} />
            </IconButton>
            <IconButton
              aria-label={"New chat in " + project.name}
              actionId="client.directory.chat.new"
              onClick={() => onOpen(project.id)}
            >
              <NotePencil size={16} />
            </IconButton>
          </div>
        ))}
        {!visible.length ? <p role="status">No projects found</p> : null}
      </div>
    </InternalScrollArea>
  );
}
export function ScheduleLanding({
  onDialog,
}: {
  onDialog: (title: string, body: string) => void;
}) {
  return (
    <InternalScrollArea className="client-schedule-landing">
      <div>
        <span>🕒</span>
        <h1>Schedule a task</h1>
        <p>ChatGPT can take care of ongoing tasks so you don’t have to.</p>
        <div>
          {[
            [
              "flights",
              "✈",
              "Find flights for a trip",
              "Find the best deal on flights for an upcoming trip.",
            ],
            [
              "email",
              "✉",
              "Email monitor",
              "Scan my emails and let me know anything that needs my attention.",
            ],
            [
              "finance",
              "💰",
              "Weekly finances update",
              "Review my recent spending, and anything that needs attention.",
            ],
            [
              "sleep",
              "😴",
              "Sleep coaching",
              "Track my sleep quality and help me improve my habits.",
            ],
            [
              "meals",
              "🥗",
              "Weekly meal plan",
              "Plan meals for the week and make a grocery list.",
            ],
          ].map(([id, emoji, title, description]) => (
            <Button
              key={id}
              actionId={"client.schedule.template." + id}
              onClick={() =>
                onDialog(
                  title,
                  "Scheduling services are not connected in this browser preview.",
                )
              }
            >
              <span>{emoji}</span>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </InternalScrollArea>
  );
}
