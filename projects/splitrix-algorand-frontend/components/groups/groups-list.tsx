"use client";

import { useRouter } from "next/navigation";
import { Users, Settings } from "lucide-react";
import { AddressDisplay } from "@/components/common/AddressDisplay";

interface GroupsListProps {
  searchQuery: string;
  groups?: any[];
  loading?: boolean;
}

export function GroupsList({ searchQuery, groups = [], loading = false }: GroupsListProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading groups...</p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No groups found. Create your first group to get started!</p>
      </div>
    );
  }

  const filteredGroups = groups.filter((group) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const groupId = group.id?.toLowerCase() || "";
    const admin = group.admin?.toLowerCase() || "";
    return groupId.includes(searchLower) || admin.includes(searchLower);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredGroups.length === 0 ? (
        <div className="md:col-span-2 glass rounded-xl p-12 border border-border text-center">
          <p className="text-muted-foreground">No groups found matching your search</p>
        </div>
      ) : (
        filteredGroups.map((group) => {
          const memberCount = group.memberCount || group.members?.length || 0;
          const billCount = group._count?.bills || 0;
          const createdAt = group.createdAt ? new Date(group.createdAt).toLocaleDateString() : "Unknown";

          return (
            <div
              key={group.id}
              onClick={() => router.push(`/groups/${group.id}`)}
              className="glass rounded-xl p-6 border border-border hover:border-primary/50 transition-all cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground mb-1 truncate">Group {group.id}</h3>
                  <p className="text-sm text-muted-foreground">Created {createdAt}</p>
                </div>
              </div>

              {/* Members */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                <Users size={16} className="text-accent" />
                <span className="text-sm text-muted-foreground">
                  {memberCount} {memberCount === 1 ? "member" : "members"}
                </span>
                {billCount > 0 && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {billCount} {billCount === 1 ? "bill" : "bills"}
                    </span>
                  </>
                )}
              </div>

              {/* Admin Info */}
              <div className="p-3 rounded-lg bg-surface-light border border-border">
                <p className="text-xs text-muted-foreground mb-2">Group Admin</p>
                <AddressDisplay address={group.admin} showFull={false} />
              </div>

              {/* Members List (if available) */}
              {group.members && group.members.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-2">Members</p>
                  <div className="flex flex-wrap gap-2">
                    {group.members.slice(0, 5).map((member: any, idx: number) => (
                      member.address !== group.admin && <AddressDisplay key={idx} address={member.address} showFull={false} className="text-xs" showAddressBelow={false} />
                    ))}
                    {group.members.length > 5 && <span className="text-xs text-muted-foreground">+{group.members.length - 5} more</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
