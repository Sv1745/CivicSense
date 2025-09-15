import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Analytics & Reporting</h1>
          <p className="text-muted-foreground">Insights into issue trends and department performance.</p>
        </div>
      </div>
       <Card>
        <CardHeader>
            <CardTitle>Detailed Analytics</CardTitle>
            <CardDescription>Explore key metrics and trends in detail.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <AnalyticsCharts />
              <AnalyticsCharts />
            </div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Reporting Heatmap</CardTitle>
          <CardDescription>Visual representation of high-frequency issue areas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-16 border rounded-lg bg-muted/30 text-center text-muted-foreground">
            Heatmap Component Placeholder
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
