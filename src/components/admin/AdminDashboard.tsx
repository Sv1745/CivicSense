import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, ListFilter, ListTodo } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { IssueDataTable } from "./IssueDataTable";
import { mockIssues } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function AdminDashboard() {
  const newReports = mockIssues.filter(i => i.status === 'Submitted').length;
  const inProgress = mockIssues.filter(i => i.status === 'In Progress').length;
  const resolved = mockIssues.filter(i => i.status === 'Resolved').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of all civic issues.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4"/>
                Filters
            </Button>
            <Button>
                Export Data
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Reports</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newReports}</div>
            <p className="text-xs text-muted-foreground">Awaiting acknowledgement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently being addressed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolved}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Issue Hotspots</CardTitle>
            <CardDescription>Live map of reported issues.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <Image 
                    src={PlaceHolderImages.find(img => img.id === 'admin-map')?.imageUrl || "https://picsum.photos/seed/map/1200/675"}
                    alt="Map of issues"
                    fill
                    className="object-cover"
                    data-ai-hint="city map pins"
                />
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Key metrics and trends.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsCharts />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Recent Issues</CardTitle>
            <CardDescription>A list of the most recently reported issues.</CardDescription>
        </CardHeader>
        <CardContent>
            <IssueDataTable />
        </CardContent>
      </Card>

    </div>
  );
}
