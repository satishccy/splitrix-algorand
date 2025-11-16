import { MoreVertical, Shield, Ban } from "lucide-react"

export function UserManagement() {
  const users = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "admin",
      status: "active",
      joinDate: "Jan 15, 2024",
      transactions: 24,
    },
    {
      id: 2,
      name: "Alex Kim",
      email: "alex@example.com",
      role: "user",
      status: "active",
      joinDate: "Feb 3, 2024",
      transactions: 18,
    },
    {
      id: 3,
      name: "Jordan Martinez",
      email: "jordan@example.com",
      role: "user",
      status: "active",
      joinDate: "Feb 10, 2024",
      transactions: 12,
    },
    {
      id: 4,
      name: "Sam Wilson",
      email: "sam@example.com",
      role: "user",
      status: "inactive",
      joinDate: "Mar 1, 2024",
      transactions: 5,
    },
  ]

  return (
    <div className="glass rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-light">
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">User</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Joined</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Transactions</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-surface-light/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-primary/10 border border-primary/30 text-primary"
                        : "bg-surface border border-border text-foreground"
                    }`}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.status === "active"
                        ? "bg-success/10 border border-success/30 text-success"
                        : "bg-warning/10 border border-warning/30 text-warning"
                    }`}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{user.joinDate}</td>
                <td className="px-6 py-4 text-sm font-semibold text-foreground">{user.transactions}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-surface-light transition-colors">
                      <Shield size={16} className="text-accent" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-surface-light transition-colors">
                      <Ban size={16} className="text-destructive" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-surface-light transition-colors">
                      <MoreVertical size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
