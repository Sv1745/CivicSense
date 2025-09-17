import { Badge } from "@/components/ui/badge";
import { UploadCloud, Check, LoaderCircle, CheckCheck, XCircle } from "lucide-react";
import type { LucideProps } from "lucide-react";
import * as React from "react";

type IssueStatus = 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected';

type StatusBadgeProps = {
  status: IssueStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusMap: Record<IssueStatus, { 
    variant: "default" | "secondary" | "outline" | "destructive", 
    Icon: React.ComponentType<LucideProps>,
    label: string 
  }> = {
    submitted: { variant: 'outline', Icon: UploadCloud, label: 'Submitted' },
    acknowledged: { variant: 'secondary', Icon: Check, label: 'Acknowledged' },
    in_progress: { variant: 'default', Icon: LoaderCircle, label: 'In Progress' },
    resolved: { variant: 'secondary', Icon: CheckCheck, label: 'Resolved' },
    rejected: { variant: 'destructive', Icon: XCircle, label: 'Rejected' },
  };
  
  const statusInfo = statusMap[status];
  
  // Handle cases where status might not be mapped
  if (!statusInfo) {
    return (
      <Badge variant="outline" className={className}>
        <UploadCloud className="mr-1.5 h-3.5 w-3.5" />
        {status || 'Unknown'}
      </Badge>
    );
  }
  
  const { variant, Icon, label } = statusInfo;

  return (
    <Badge variant={variant} className={className}>
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
