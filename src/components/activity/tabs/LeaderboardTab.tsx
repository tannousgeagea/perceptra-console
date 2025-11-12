import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/ui/card";
import type { LeaderboardEntry } from "@/types/activity";

interface LeaderboardTabProps {
  leaderboard: LeaderboardEntry[];
}

export const LeaderboardTab = ({ leaderboard }: LeaderboardTabProps) => {
  const [selectedMetric, setSelectedMetric] = useState("annotations_created");

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-5))",
  ];

  return (
    <div className="space-y-6">
      {/* Metric Selector */}
      <Card className="p-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          Select Metric
        </label>
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-input"
        >
          <option value="annotations_created">Total Annotations</option>
          <option value="images_reviewed">Images Reviewed</option>
          <option value="images_finalized">Images Finalized</option>
        </select>
      </Card>

      {/* Top 3 Podium */}
      <div className="bg-gradient-to-br from-primary-light to-warning-light rounded-lg shadow-sm border border-border p-8">
        <h3 className="text-xl font-bold text-foreground mb-6 text-center">
          Top Contributors
        </h3>
        <div className="flex items-end justify-center gap-4">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted-foreground/30 rounded-full flex items-center justify-center text-2xl mb-2 text-foreground font-bold">
              {leaderboard[1].full_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <span className="text-3xl mb-2">🥈</span>
            <p className="font-bold text-foreground">
              {leaderboard[1].full_name}
            </p>
            <p className="text-2xl font-bold text-primary">
              {leaderboard[1].metric_value.toLocaleString()}
            </p>
            <div className="bg-secondary rounded px-3 py-1 mt-2">
              <span className="text-xs text-muted-foreground">
                {leaderboard[1].percentage_of_total}%
              </span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center -mt-8">
            <div className="w-24 h-24 bg-gradient-to-br from-warning to-warning-light rounded-full flex items-center justify-center text-3xl mb-2 ring-4 ring-warning-light text-foreground font-bold">
              {leaderboard[0].full_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <span className="text-4xl mb-2">🥇</span>
            <p className="font-bold text-foreground text-lg">
              {leaderboard[0].full_name}
            </p>
            <p className="text-3xl font-bold text-warning">
              {leaderboard[0].metric_value.toLocaleString()}
            </p>
            <div className="bg-warning-light rounded px-3 py-1 mt-2">
              <span className="text-xs text-warning-foreground font-medium">
                {leaderboard[0].percentage_of_total}%
              </span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-warning/60 to-warning/40 rounded-full flex items-center justify-center text-2xl mb-2 text-foreground font-bold">
              {leaderboard[2].full_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <span className="text-3xl mb-2">🥉</span>
            <p className="font-bold text-foreground">
              {leaderboard[2].full_name}
            </p>
            <p className="text-2xl font-bold text-primary">
              {leaderboard[2].metric_value.toLocaleString()}
            </p>
            <div className="bg-warning-light/50 rounded px-3 py-1 mt-2">
              <span className="text-xs text-muted-foreground">
                {leaderboard[2].percentage_of_total}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Annotations
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contribution
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {leaderboard.map((entry) => (
                <tr
                  key={entry.user_id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-2xl">{getMedalEmoji(entry.rank)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center font-bold text-primary mr-3">
                        {entry.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {entry.full_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @{entry.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-lg font-bold text-foreground">
                      {entry.metric_value.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-muted-foreground">
                      {entry.percentage_of_total}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-secondary rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all"
                        style={{ width: `${entry.percentage_of_total}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Distribution Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Contribution Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={leaderboard}
              dataKey="metric_value"
              nameKey="full_name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry) =>
                `${entry.full_name}: ${entry.percentage_of_total}%`
              }
            >
              {leaderboard.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
