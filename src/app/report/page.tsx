import { Header } from "@/components/layout/Header";
import { IssueReportForm } from "@/components/forms/IssueReportForm";

export default function ReportIssuePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="space-y-2 text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">File a Public Complaint</h1>
            <p className="text-muted-foreground">
              Help improve your community. Fill out the form below to report a civic issue.
            </p>
          </div>
          <IssueReportForm />
        </div>
      </main>
    </div>
  );
}
