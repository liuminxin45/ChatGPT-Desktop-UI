import { useState } from "react";
import { Button, InternalScrollArea, Tooltip } from "../../src";
import {
  Browser,
  LockKey,
  NotePencil,
  PaperPlaneTilt,
  ShareNetwork,
} from "@phosphor-icons/react";
export function ClientProfile({
  onDialog,
}: {
  onDialog: (title: string, body: string) => void;
}) {
  const [period, setPeriod] = useState("Daily");
  return (
    <InternalScrollArea className="client-profile-page">
      <div className="client-profile-tools">
        <Button
          size="sm"
          icon={<NotePencil />}
          actionId="client.profile.edit"
          onClick={() => onDialog("Edit profile", "Alex Taylor · @alex.taylor")}
        >
          Edit
        </Button>
        <Button size="sm" icon={<PaperPlaneTilt />} disabled>
          Invite a friend
        </Button>
        <Button size="sm" icon={<LockKey />} disabled>
          Private
        </Button>
        <Button size="sm" icon={<ShareNetwork />} disabled>
          Share
        </Button>
      </div>
      <div className="client-profile-content">
        <header>
          <span className="client-profile-avatar">🧑‍🚀</span>
          <h1>Alex Taylor</h1>
          <p>@alex.taylor</p>
        </header>
        <div className="client-profile-stats">
          {[
            ["2.4B", "Lifetime tokens"],
            ["18.2M", "Peak tokens"],
            ["2h 48m", "Longest task"],
            ["24 days", "Longest streak"],
            ["12 days", "Current streak"],
          ].map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <h2>Showcase</h2>
        <div className="client-profile-showcase">
          <Browser size={64} />
          <p>Feature sites on your profile</p>
          <Button
            size="sm"
            actionId="client.profile.showcase"
            onClick={() => onDialog("Edit showcase", "No sites added yet.")}
          >
            Edit showcase
          </Button>
        </div>
        <div className="client-profile-activity-heading">
          <h2>Token activity</h2>
          <div>
            {["Daily", "Weekly", "Cumulative"].map((value) => (
              <Button
                key={value}
                size="sm"
                aria-pressed={period === value}
                actionId={"client.profile.activity." + value.toLowerCase()}
                onClick={() => setPeriod(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>
        <div
          className="client-token-heatmap"
          aria-label={period + " token activity"}
        >
          {Array.from({ length: 364 }, (_, index) => {
            const level =
              (index * 17 +
                Math.floor(index / 7) *
                  (period === "Daily" ? 3 : period === "Weekly" ? 5 : 7)) %
              5;
            return (
              <Tooltip key={index} label={`${level * 124000} tokens`}>
                <button
                  aria-label={"Inspect activity day " + (index + 1)}
                  data-desktop-action="client.profile.activity.inspect"
                  style={{ opacity: 0.16 + level * 0.2 }}
                  onClick={() =>
                    onDialog(
                      "Token activity",
                      `${level * 124000} tokens · ${period}`,
                    )
                  }
                />
              </Tooltip>
            );
          })}
        </div>
        <div className="client-profile-months">
          {[
            "Nov",
            "Dec",
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
          ].map((month) => (
            <span key={month}>{month}</span>
          ))}
        </div>
        <h2>Top plugins</h2>
        <div className="client-top-plugins">
          <span>⌘</span>
          <span>◉</span>
          <span>▤</span>
        </div>
      </div>
    </InternalScrollArea>
  );
}
