import { Badge } from "@/components/ui/badge";
import type { IssueStatus } from "@/lib/types";
import { UploadCloud, Check, LoaderCircle, CheckCheck } from "lucide-react";
import type { LucideProps } from "lucide-react";
import * as React from "react";

type StatusBadgeProps = {
  status: IssueStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusMap: Record<IssueStatus, { variant: "default" | "secondary" | "outline", Icon: React.ComponentType<LucideProps> }> = {
    Submitted: { variant: 'outline', Icon: UploadCloud },
    Acknowledged: { variant: 'secondary', Icon: Check },
    'In Progress': { variant: 'default', Icon: LoaderCircle },
    Resolved: { variant: 'secondary', Icon: CheckCheck },
  };
  
  const { variant, Icon } = statusMap[status];

  return (
    <Badge variant={variant} className={className}>
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {status}
    </Badge>
  );
}
