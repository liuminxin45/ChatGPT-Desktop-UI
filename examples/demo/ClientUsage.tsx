import { useState } from "react";
import {
  Button,
  IconButton,
  Select,
  Tabs,
  SettingsGroup,
  SettingsField,
  Switch,
  Tooltip,
} from "../../src";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
const models: Record<string, string> = {
  handoff: "GPT-6.1 Sol",
  unknown: "GPT-6 Sol",
  tasks: "GPT-6 Luna",
};
const date = (day: number) =>
  new Date(Date.UTC(2026, 9, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
const features = [
  {
    id: "handoff",
    label: "ChatGPT handoffs",
    share: "67.3%",
    color: "var(--desktop-color-unread)",
  },
  {
    id: "unknown",
    label: "Unknown",
    share: "18.2%",
    color: "var(--desktop-color-warning)",
  },
  {
    id: "tasks",
    label: "Tasks",
    share: "14.4%",
    color: "var(--desktop-color-success)",
  },
  {
    id: "suggestions",
    label: "Proactive suggestions",
    share: "<0.1%",
    color: "var(--desktop-color-danger)",
  },
  {
    id: "titles",
    label: "Task titles",
    share: "<0.1%",
    color: "var(--desktop-color-info)",
  },
  {
    id: "descriptions",
    label: "Task descriptions",
    share: "<0.1%",
    color: "var(--desktop-color-text-muted)",
  },
];
export function ClientUsage({
  onDialog,
}: {
  onDialog: (title: string, body: string) => void;
}) {
  const [tab, setTab] = useState("overview"),
    [period, setPeriod] = useState("7d"),
    [group, setGroup] = useState("By feature"),
    [week, setWeek] = useState(0),
    [resets, setResets] = useState(false);
  return (
    <div className="client-usage">
      <Tabs
        actionId="client.usage.tab"
        ariaLabel="Usage view"
        value={tab}
        onValueChange={setTab}
        items={[
          { value: "overview", label: "Overview" },
          { value: "analytics", label: "Analytics" },
          { value: "review", label: "Code review" },
        ]}
      />
      <div hidden={tab !== "overview"}>
        <SettingsGroup title="Your plan">
          <SettingsField label="ChatGPT Pro" description="$200 / month">
            <Button
              size="sm"
              actionId="client.usage.plans"
              onClick={() =>
                onDialog(
                  "View plans",
                  "Subscriptions are not connected in this preview.",
                )
              }
            >
              View plans
            </Button>
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup title="Plan limits">
          <p>
            Shared across Codex, Work, Workspace Agents, and ChatGPT for Excel.
            Chat conversations are not included.
          </p>
          <SettingsField label="Weekly limit" description="Resets in 4d 17h">
            <span>79% left</span>
          </SettingsField>
          <div className="client-usage-meter">
            <span />
          </div>
        </SettingsGroup>
        <SettingsGroup title="Credits">
          <SettingsField
            label="12,500 credits remaining"
            description="Current balance"
          >
            <Button
              size="sm"
              actionId="client.usage.credits"
              onClick={() =>
                onDialog("Add more", "Credits are fictional in this preview.")
              }
            >
              Add more
            </Button>
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup>
          <SettingsField
            label="Allow Codex to use resets"
            description="Give codex the ability to use a reset when you explicitly request it during a conversation, and your current limit has 10% or less remaining. Resets are never used automatically."
          >
            <Switch
              aria-label="Allow Codex to use resets"
              actionId="client.usage.resets"
              checked={resets}
              onClick={() => setResets(!resets)}
            />
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup title="Usage limit resets">
          <SettingsField label="Full reset" description="Expires October 23">
            <Button size="sm" disabled>
              Use reset
            </Button>
          </SettingsField>
        </SettingsGroup>
      </div>
      <div hidden={tab !== "analytics"}>
        <h2>Usage history</h2>
        <p>
          See how plan usage and credits were consumed in Work, Codex, and other
          agentic tasks. Conversations in Chat are not included.
        </p>
        <div className="client-analytics-toolbar">
          <div>
            {["7d", "30d"].map((value) => (
              <Button
                key={value}
                size="sm"
                aria-pressed={period === value}
                actionId={"client.usage.period." + value}
                onClick={() => setPeriod(value)}
              >
                {value}
              </Button>
            ))}
          </div>
          <Select
            aria-label="Usage grouping"
            actionId="client.usage.group"
            value={group}
            onValueChange={setGroup}
            options={["By feature", "By model"].map((value) => ({
              value,
              label: value,
            }))}
          />
        </div>
        <div className="client-analytics-card">
          <header>
            <span>
              {period === "7d"
                ? `${date((period === "7d" ? 3 : -20) - week * (period === "7d" ? 7 : 30))} – ${date(9 - week * (period === "7d" ? 7 : 30))}, 2026`
                : `${date(-20 - week * 30)} – ${date(9 - week * 30)}, 2026`}
            </span>
            <IconButton
              aria-label="Previous period"
              actionId="client.usage.previous"
              onClick={() => setWeek(Math.min(2, week + 1))}
            >
              <CaretLeft size={16} />
            </IconButton>
            <IconButton
              aria-label="Next period"
              actionId="client.usage.next"
              disabled={!week}
              onClick={() => setWeek(Math.max(0, week - 1))}
            >
              <CaretRight size={16} />
            </IconButton>
          </header>
          <div
            className="client-usage-chart"
            role="img"
            aria-label="Daily usage by feature"
          >
            <div className="client-usage-grid" />
            {Array.from({ length: period === "7d" ? 7 : 30 }, (_, index) => {
              const height =
                ([6, 36, 98, 22, 8, 0, 0][index % 7] + week * 3) % 100;
              return (
                <Tooltip
                  key={index}
                  label={`${date(index + (period === "7d" ? 3 : -20) - week * (period === "7d" ? 7 : 30))}: ${(height / 13).toFixed(2)}% of weekly limit`}
                >
                  <button
                    type="button"
                    className="client-usage-bar"
                    aria-label={"Inspect day " + (index + 1)}
                    data-desktop-action="client.usage.day.inspect"
                    style={{ height: height + "%" }}
                    onClick={() =>
                      onDialog(
                        "Daily usage",
                        `${date(index + (period === "7d" ? 3 : -20) - week * (period === "7d" ? 7 : 30))}: ${(height / 13).toFixed(2)}% of weekly limit`,
                      )
                    }
                  >
                    <i />
                    <i />
                    <i />
                  </button>
                </Tooltip>
              );
            })}
          </div>
          <div className="client-chart-axis">
            <span>
              {date(
                (period === "7d" ? 3 : -20) - week * (period === "7d" ? 7 : 30),
              )}
            </span>
            <span>
              {date(
                (period === "7d" ? 6 : -5) - week * (period === "7d" ? 7 : 30),
              )}
            </span>
            <span>{date(9 - week * (period === "7d" ? 7 : 30))}</span>
          </div>
          <div className="client-usage-legend">
            {features.map((item) => (
              <div key={item.id} style={{ borderColor: item.color }}>
                <span>
                  {group === "By model"
                    ? models[item.id] || item.label
                    : item.label}
                </span>
                <strong>{item.share}</strong>
              </div>
            ))}
          </div>
        </div>
        <h2>Top chats</h2>
        <p>Compare each chat’s plan and credit usage</p>
        <div className="client-usage-table">
          <div>
            <span>Chat</span>
            <span>% of weekly limit</span>
            <span>Credits used</span>
          </div>
          {[
            ["Refine desktop navigation", "4.01%"],
            ["Review the release checklist", "0.72%"],
            ["Prepare the component handoff", "0.58%"],
            ["Align settings with the Windows client", "0.41%"],
            ["Write the weekly update", "0.40%"],
          ].map(([title, usage]) => (
            <Button
              key={title}
              actionId="client.usage.chat.inspect"
              onClick={() => onDialog(title, usage + " of weekly limit")}
            >
              <span>
                <CaretRight size={13} />
                {title}
              </span>
              <span>{usage}</span>
              <span>0</span>
            </Button>
          ))}
        </div>
      </div>
      <div hidden={tab !== "review"}>
        <SettingsGroup title="Code review">
          <SettingsField label="Weekly limit" description="Resets in 4d 17h">
            <span>100% left</span>
          </SettingsField>
          <div className="client-usage-meter">
            <span style={{ width: "100%" }} />
          </div>
        </SettingsGroup>
      </div>
    </div>
  );
}
