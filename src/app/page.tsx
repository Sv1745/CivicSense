import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { mockIssues } from '@/lib/data';
import { StatusBadge } from '@/components/issues/StatusBadge';

export default function Home() {
  const recentIssues = mockIssues.slice(0, 3);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Raise Your Voice, Better Your Neighbourhood
                  </h1>
                  <p className="max-w-[600px] text-foreground/80 md:text-xl">
                    CivicConnect helps you report local issues like potholes, water-logging, or waste management directly to your municipal corporation.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link href="/report">
                      File a Complaint
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/issues">
                      Track My Complaints
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src={PlaceHolderImages.find(img => img.id === 'hero-map')?.imageUrl || "https://picsum.photos/seed/1/600/400"}
                data-ai-hint="city map India"
                width={600}
                height={400}
                alt="Hero Map"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Recent Public Complaints</h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  See what fellow citizens are reporting in their communities across India.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
              {recentIssues.map((issue) => (
                <Card key={issue.id} className="flex flex-col">
                  <CardHeader>
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src={issue.imageUrl}
                        alt={issue.description}
                        fill
                        className="rounded-t-lg object-cover"
                        data-ai-hint={issue.imageHint}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-2">
                    <CardTitle className="text-lg">{issue.category}</CardTitle>
                    <CardDescription>{issue.summary}</CardDescription>
                     <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-4 w-4" />
                        {issue.location.address}
                      </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                     <StatusBadge status={issue.status} />
                     <Link href="#" className="text-sm font-medium text-primary hover:underline">
                      View Details <ArrowRight className="inline h-4 w-4"/>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
       <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 CivicConnect India. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
