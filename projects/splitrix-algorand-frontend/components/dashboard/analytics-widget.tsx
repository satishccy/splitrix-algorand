import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export function AnalyticsWidget() {
  const expenseData = [
    { month: "Jan", amount: 1200 },
    { month: "Feb", amount: 1900 },
    { month: "Mar", amount: 1500 },
    { month: "Apr", amount: 2200 },
    { month: "May", amount: 1800 },
    { month: "Jun", amount: 2400 },
  ]

  const categoryData = [
    { name: "Food & Dining", value: 1200, color: "#ffd300" },
    { name: "Entertainment", value: 800, color: "#00d9ff" },
    { name: "Travel", value: 600, color: "#7c3aed" },
    { name: "Utilities", value: 400, color: "#10b981" },
    { name: "Other", value: 300, color: "#f59e0b" },
  ]

  return (
    <div className="space-y-6">
      {/* Expense Trend */}
      <div className="glass rounded-xl p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Expense Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={expenseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis stroke="#b0b0b0" />
            <YAxis stroke="#b0b0b0" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333333",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#ffffff" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#ffd300"
              strokeWidth={2}
              dot={{ fill: "#ffd300", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="glass rounded-xl p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Spending by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: $${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333333",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#ffffff" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Comparison */}
      <div className="glass rounded-xl p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Monthly Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={expenseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis stroke="#b0b0b0" />
            <YAxis stroke="#b0b0b0" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333333",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#ffffff" }}
            />
            <Bar dataKey="amount" fill="#00d9ff" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
