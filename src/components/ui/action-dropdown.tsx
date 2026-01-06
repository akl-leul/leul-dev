import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, LucideIcon } from "lucide-react";
import React from "react";

export interface ActionItem {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  variant?: "default" | "destructive";
  separator?: boolean;
}

interface ActionDropdownProps {
  actions: ActionItem[];
  label?: string;
  triggerIcon?: LucideIcon;
  triggerLabel?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  align?: "start" | "center" | "end";
  className?: string;
}

export const ActionDropdown = ({
  actions,
  label,
  triggerIcon: TriggerIcon = MoreHorizontal,
  triggerLabel,
  variant = "ghost",
  size = "icon",
  align = "end",
  className,
}: ActionDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <TriggerIcon className="h-4 w-4" />
          {triggerLabel && <span className="ml-2">{triggerLabel}</span>}
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48 bg-popover border border-border shadow-lg z-50">
        {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            {action.separator && <DropdownMenuSeparator />}
            {action.href ? (
              <DropdownMenuItem asChild>
                <a
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                  className={`flex items-center gap-2 cursor-pointer ${
                    action.variant === "destructive" ? "text-destructive focus:text-destructive" : ""
                  }`}
                >
                  {action.icon && <action.icon className="h-4 w-4" />}
                  {action.label}
                </a>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={action.onClick}
                className={`flex items-center gap-2 cursor-pointer ${
                  action.variant === "destructive" ? "text-destructive focus:text-destructive" : ""
                }`}
              >
                {action.icon && <action.icon className="h-4 w-4" />}
                {action.label}
              </DropdownMenuItem>
            )}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
