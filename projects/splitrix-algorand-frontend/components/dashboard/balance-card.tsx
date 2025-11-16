import { ArrowDown, ArrowUp, Wallet } from 'lucide-react'

interface BalanceCardProps {
  title: string
  amount: string
  icon: "wallet" | "arrow-down" | "arrow-up"
  variant?: "default" | "warning" | "success"
  loading?: boolean
}

export function BalanceCard({
  title,
  amount,
  icon,
  variant = "default",
  loading = false,
}: BalanceCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return "border-warning/30 bg-warning/5"
      case "success":
        return "border-success/30 bg-success/5"
      default:
        return "border-primary/30 bg-primary/5"
    }
  }

  const getIconColor = () => {
    switch (variant) {
      case "warning":
        return "text-warning"
      case "success":
        return "text-success"
      default:
        return "text-primary"
    }
  }

  const getIcon = () => {
    switch (icon) {
      case "arrow-down":
        return <ArrowDown className={`${getIconColor()} size-6`} />
      case "arrow-up":
        return <ArrowUp className={`${getIconColor()} size-6`} />
      default:
        return <Wallet className={`${getIconColor()} size-6`} />
    }
  }

  return (
    <div
      className={`glass rounded-xl p-6 border transition-all hover:border-primary/50 ${getVariantStyles()}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          {loading ? (
            <div className="h-8 w-32 bg-surface-light animate-pulse rounded" />
          ) : (
            <h3 className="text-2xl font-bold text-foreground">{amount}</h3>
          )}
        </div>
        <div className="p-3 rounded-lg bg-surface-light border border-border">
          {getIcon()}
        </div>
      </div>
    </div>
  )
}
