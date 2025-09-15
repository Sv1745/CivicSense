import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { mockIssues } from '@/lib/data';
import Image from 'next/image';
import { MapPin, Calendar, GitBranch } from 'lucide-react';
import { StatusBadge } from '@/components/issues/StatusBadge';
import { format } from 'date-fns';

export default function MyReportsPage() {
  const userIssues = mockIssues.filter(issue => issue.citizenId === 'user-123');

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">My Reported Issues</h1>
            <p className="text-muted-foreground">
              Here you can track the status of all the issues you've reported.
            </p>
          </div>
          
          {userIssues.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p>You haven't reported any issues yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {userIssues.map(issue => (
                <Card key={issue.id} className="overflow-hidden">
                  <div className="grid md:grid-cols-[200px_1fr]">
                    <div className="relative aspect-video md:aspect-auto">
                      <Image 
                        src={issue.imageUrl}
                        alt={issue.description}
                        fill
                        className="object-cover"
                        data-ai-hint={issue.imageHint}
                      />
                    </div>
                    <div>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{issue.category}</CardTitle>
                          <StatusBadge status={issue.status} />
                        </div>
                        <CardDescription className="pt-2">{issue.summary}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground space-y-2">
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4" />
                            <span>{issue.location.address}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Reported on {format(issue.createdAt, 'PPP')}</span>
                          </div>
                          <div className="flex items-center">
                            <GitBranch className="mr-2 h-4 w-4" />
                            <span>Assigned to: {issue.department}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <p className="text-xs text-muted-foreground">Last updated: {format(issue.updatedAt, 'PPP p')}</p>
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
