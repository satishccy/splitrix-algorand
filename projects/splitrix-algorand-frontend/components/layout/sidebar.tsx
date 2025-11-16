"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Receipt, Users, UserPlus, Settings, ChevronDown, Wallet, Menu, X, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@txnlab/use-wallet-react";
import WalletConnectModal from "@/components/wallet/WalletConnectModal";

interface SidebarProps {
  // No props needed - using Next.js router
}

export function Sidebar({}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const { activeAccount, activeWallet } = useWallet();

  const handleDisconnectWallet = async () => {
    try {
      if (activeWallet) {
        await activeWallet.disconnect();
      }
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  const getShortAddress = (address: string | null) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletProvider = () => {
    return activeWallet?.metadata?.name || "Not Connected";
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "groups", label: "Groups", icon: Users, path: "/groups" },
    { id: "friends", label: "Friends", icon: UserPlus, path: "/friends" },
    // { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-surface border border-border hover:bg-surface-light transition-colors"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-40 h-screen w-64 bg-surface border-r border-border transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary to-primary-dark flex items-center justify-center">
              <Wallet size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Splitrix</h1>
              <p className="text-xs text-muted-foreground">Web3 Expense Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname?.startsWith(item.path + "/");
            return (
              <button
                key={item.id}
                onClick={() => {
                  router.push(item.path);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "text-foreground hover:bg-surface-light"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-3">
          {activeAccount ? (
            <div className="px-4 py-3 rounded-lg bg-success/10 border border-success/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">Wallet Connected</p>
                <button onClick={() => setShowWalletDetails(!showWalletDetails)} className="p-1 hover:bg-surface rounded transition-colors">
                  <ChevronDown size={16} className={`transition-transform ${showWalletDetails ? "rotate-180" : ""}`} />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-success">{getWalletProvider()}</p>
                <p className="text-xs font-mono text-foreground">{getShortAddress(activeAccount.address)}</p>

                {showWalletDetails && (
                  <div className="space-y-2 pt-2 border-t border-success/20">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (activeAccount?.address) {
                            navigator.clipboard.writeText(activeAccount.address);
                          }
                        }}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Copy size={12} />
                        Copy Address
                      </button>
                    </div>
                    <Button
                      onClick={handleDisconnectWallet}
                      size="sm"
                      className="w-full bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30"
                    >
                      Disconnect
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 rounded-lg bg-surface-light border border-border">
              <p className="text-xs text-muted-foreground mb-2">Wallet Status</p>
              <p className="text-sm font-semibold text-muted-foreground">Not Connected</p>
              <Button
                onClick={() => setIsWalletModalOpen(true)}
                className="w-full mt-3 bg-primary hover:bg-primary-dark text-primary-foreground"
              >
                <div className="flex items-center gap-2">
                  <Wallet size={16} />
                  Connect Wallet
                </div>
              </Button>
            </div>
          )}
        </div>

        {/* Wallet Connect Modal */}
        <WalletConnectModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
}
