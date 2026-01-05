import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Trash2, Check, X, Archive, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
  onClick: (selectedIds: string[]) => Promise<void>;
}

interface BulkActionsProps {
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
  someSelected: boolean;
  actions: BulkAction[];
  totalCount: number;
}

export function BulkActions({
  selectedIds,
  onSelectAll,
  allSelected,
  someSelected,
  actions,
  totalCount,
}: BulkActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: BulkAction) => {
    if (selectedIds.length === 0) return;
    
    setIsLoading(true);
    try {
      await action.onClick(selectedIds);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-3 py-2 px-3 rounded-lg transition-all",
      selectedIds.length > 0 ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
    )}>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onSelectAll}
          aria-label="Select all"
          className={cn(someSelected && !allSelected && "data-[state=checked]:bg-primary/50")}
        />
        <span className="text-sm text-muted-foreground">
          {selectedIds.length > 0 
            ? `${selectedIds.length} of ${totalCount} selected`
            : `Select all (${totalCount})`
          }
        </span>
      </div>

      {selectedIds.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isLoading}
              className="gap-1"
            >
              Bulk Actions
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {actions.map((action, index) => (
              <DropdownMenuItem
                key={action.id}
                onClick={() => handleAction(action)}
                className={cn(
                  "gap-2 cursor-pointer",
                  action.variant === 'destructive' && "text-destructive focus:text-destructive"
                )}
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// Hook for managing bulk selection
export function useBulkSelection<T extends { id: string | number }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string | number) => {
    const strId = String(id);
    setSelectedIds(prev => 
      prev.includes(strId)
        ? prev.filter(i => i !== strId)
        : [...prev, strId]
    );
  };

  const selectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map(item => String(item.id)));
    } else {
      setSelectedIds([]);
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const isSelected = (id: string | number) => selectedIds.includes(String(id));

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  return {
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
    allSelected,
    someSelected,
  };
}

// Common bulk action creators
export const createBulkDeleteAction = (
  onDelete: (ids: string[]) => Promise<void>,
  itemName: string = 'items'
): BulkAction => ({
  id: 'delete',
  label: `Delete ${itemName}`,
  icon: <Trash2 className="h-4 w-4" />,
  variant: 'destructive',
  onClick: async (ids) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} ${itemName}?`)) return;
    await onDelete(ids);
  },
});

export const createBulkApproveAction = (
  onApprove: (ids: string[], approved: boolean) => Promise<void>
): BulkAction => ({
  id: 'approve',
  label: 'Approve selected',
  icon: <Check className="h-4 w-4" />,
  onClick: (ids) => onApprove(ids, true),
});

export const createBulkRejectAction = (
  onReject: (ids: string[], approved: boolean) => Promise<void>
): BulkAction => ({
  id: 'reject',
  label: 'Reject selected',
  icon: <X className="h-4 w-4" />,
  onClick: (ids) => onReject(ids, false),
});

export const createBulkPublishAction = (
  onPublish: (ids: string[], published: boolean) => Promise<void>
): BulkAction => ({
  id: 'publish',
  label: 'Publish selected',
  icon: <Eye className="h-4 w-4" />,
  onClick: (ids) => onPublish(ids, true),
});

export const createBulkUnpublishAction = (
  onUnpublish: (ids: string[], published: boolean) => Promise<void>
): BulkAction => ({
  id: 'unpublish',
  label: 'Unpublish selected',
  icon: <EyeOff className="h-4 w-4" />,
  onClick: (ids) => onUnpublish(ids, false),
});

export const createBulkArchiveAction = (
  onArchive: (ids: string[]) => Promise<void>
): BulkAction => ({
  id: 'archive',
  label: 'Archive selected',
  icon: <Archive className="h-4 w-4" />,
  onClick: onArchive,
});

export const createBulkStatusAction = (
  status: string,
  label: string,
  icon: React.ReactNode,
  onStatusChange: (ids: string[], status: string) => Promise<void>
): BulkAction => ({
  id: `status-${status}`,
  label,
  icon,
  onClick: (ids) => onStatusChange(ids, status),
});
