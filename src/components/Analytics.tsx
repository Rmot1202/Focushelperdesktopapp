import { Card } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockSessions = [
  { date: "Nov 14", reason: "CS Midterm", duration: "1h 30m", energyDrinks: 1, snacks: 0, timeSaved: "0.3h" },
  { date: "Nov 13", reason: "Math Homework", duration: "2h 15m", energyDrinks: 0, snacks: 2, timeSaved: "0.5h" },
  { date: "Nov 12", reason: "History Reading", duration: "1h 45m", energyDrinks: 2, snacks: 1, timeSaved: "0.2h" },
  { date: "Nov 11", reason: "Physics Project", duration: "3h 00m", energyDrinks: 1, snacks: 3, timeSaved: "0.8h" },
  { date: "Nov 10", reason: "English Essay", duration: "2h 30m", energyDrinks: 0, snacks: 0, timeSaved: "0.4h" },
  { date: "Nov 9", reason: "Chemistry Lab", duration: "1h 20m", energyDrinks: 1, snacks: 1, timeSaved: "0.3h" },
  { date: "Nov 8", reason: "Biology Quiz", duration: "1h 00m", energyDrinks: 0, snacks: 0, timeSaved: "0.2h" },
];

// Focus data for a single session - showing focus over time
const focusChartData = [
  { time: "0m", focus: 85 },
  { time: "10m", focus: 82 },
  { time: "20m", focus: 88 },
  { time: "30m", focus: 79 },
  { time: "40m", focus: 83 },
  { time: "50m", focus: 87 },
  { time: "60m", focus: 81 },
  { time: "70m", focus: 85 },
  { time: "80m", focus: 83 },
  { time: "90m", focus: 86 },
];

const detectionChartData = [
  { week: "Week 1", energyDrinks: 2, snacks: 3 },
  { week: "Week 2", energyDrinks: 4, snacks: 5 },
  { week: "Week 3", energyDrinks: 3, snacks: 4 },
  { week: "Week 4", energyDrinks: 5, snacks: 8 },
];

export function Analytics() {
  const totalSessions = mockSessions.length;
  const totalEnergyDrinks = mockSessions.reduce((sum, s) => sum + s.energyDrinks, 0);
  const totalTimeSaved = mockSessions.reduce((sum, s) => sum + parseFloat(s.timeSaved), 0).toFixed(1);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-2xl text-white mb-2">Your Stats</h2>
          <p className="text-zinc-400">
            See how your focus and habits change over time.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <p className="text-zinc-400 text-sm mb-2">Sessions Completed</p>
            <p className="text-3xl text-white mb-1">{totalSessions}</p>
            <p className="text-xs text-zinc-500">all time</p>
          </Card>

          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <p className="text-zinc-400 text-sm mb-2">Energy Drinks Detected</p>
            <p className="text-3xl text-white mb-1">{totalEnergyDrinks}</p>
            <p className="text-xs text-zinc-500">last 7 days</p>
          </Card>

          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <p className="text-zinc-400 text-sm mb-2">Total Time Saved (Slides)</p>
            <p className="text-3xl text-white mb-1">{totalTimeSaved}h</p>
            <p className="text-xs text-zinc-500">all time</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <h3 className="text-white mb-6">Focus Over Session (Latest)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={focusChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="time" stroke="#71717a" />
                  <YAxis domain={[0, 100]} stroke="#71717a" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                    labelStyle={{ color: '#a1a1aa' }}
                  />
                  <Line type="monotone" dataKey="focus" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <h3 className="text-white mb-6">Binge/Energy events per week</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={detectionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="week" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                    labelStyle={{ color: '#a1a1aa' }}
                  />
                  <Bar dataKey="energyDrinks" fill="#f59e0b" />
                  <Bar dataKey="snacks" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Session Table */}
        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <h3 className="text-white mb-6">Session History</h3>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Date</TableHead>
                <TableHead className="text-zinc-400">Reason</TableHead>
                <TableHead className="text-zinc-400">Duration</TableHead>
                <TableHead className="text-zinc-400">Energy Drinks</TableHead>
                <TableHead className="text-zinc-400">Snacks</TableHead>
                <TableHead className="text-zinc-400">Time Saved (slides)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSessions.map((session, idx) => (
                <TableRow key={idx} className="border-zinc-800">
                  <TableCell className="text-white">{session.date}</TableCell>
                  <TableCell className="text-white">{session.reason}</TableCell>
                  <TableCell className="text-zinc-400">{session.duration}</TableCell>
                  <TableCell className="text-zinc-400">{session.energyDrinks}</TableCell>
                  <TableCell className="text-zinc-400">{session.snacks}</TableCell>
                  <TableCell className="text-zinc-400">{session.timeSaved}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}