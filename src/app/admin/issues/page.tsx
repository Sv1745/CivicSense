import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IssueDataTable } from "@/components/admin/IssueDataTable";

export default function AdminIssuesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Issue Management</h1>
          <p className="text-muted-foreground">View, filter, and manage all reported issues.</p>
        </div>
      </div>
       <Card>
        <CardHeader>
            <CardTitle>All Issues</CardTitle>
            <CardDescription>A comprehensive list of all issues.</CardDescription>
        </CardHeader>
        <CardContent>
            <IssueDataTable />
        </CardContent>
      </Card>
    </div>
  );
}
