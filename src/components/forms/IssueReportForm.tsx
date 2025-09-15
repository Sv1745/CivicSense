"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { LocateIcon, Upload, Mic, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


const formSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  state: z.string().min(1, { message: "State/UT is required." }),
  city: z.string().min(1, { message: "City/District is required." }),
  jurisdiction: z.string().min(1, { message: "Jurisdiction is required." }),
  department: z.string().min(1, { message: "Department is required." }),
  location: z.string().min(1, { message: "Address is required." }),
  photo: z.any().optional(),
});

export function IssueReportForm() {
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      state: "",
      city: "",
      jurisdiction: "",
      department: "",
      location: "",
    },
  });

  async function handleLocation() {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setIsLocating(false);
      toast({
        variant: 'destructive',
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // In a real app, you would use a reverse geocoding service here.
        // For this demo, we'll simulate it.
        console.log("Found location:", { latitude, longitude });
        const mockAddress = "Connaught Place, New Delhi";
        form.setValue("location", mockAddress);
        form.setValue("city", "New Delhi");
        form.setValue("state", "Delhi");
        form.setValue("jurisdiction", "New Delhi Municipal Council");
        setIsLocating(false);
        toast({
          title: "Location Found",
          description: `Set to: ${mockAddress}`,
        });
      },
      (error) => {
        setIsLocating(false);
        toast({
          variant: 'destructive',
          title: 'Unable to retrieve location',
          description: error.message,
        });
      }
    );
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    console.log("Form submitted with values:", values);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    toast({
      title: "Complaint Filed!",
      description: "Thank you for being an active citizen.",
    });
    form.reset();
  }

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry"
  ];
  
  const departments = [
    "BBMP (Public Works)",
    "Noida Authority (Electrical)",
    "MCGM (Solid Waste Mgmt)",
    "Delhi PWD",
    "Traffic Police",
    "Land Department",
    "Other"
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complaint Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., There is severe water-logging near the market after the rain."
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide as much detail as possible.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State / Union Territory</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a state/UT" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {indianStates.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City / District</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mumbai" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="jurisdiction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local Jurisdiction</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Ward A, Brihanmumbai Municipal Corporation" {...field} />
                  </FormControl>
                  <FormDescription>
                    The local governing body for the area (e.g., Municipal Ward, Panchayat).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concerned Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The government department responsible for this type of issue.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />


            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Address or Nearest Landmark</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="e.g., Outside Andheri Station (West)" {...field} />
                    </FormControl>
                    <Button type="button" variant="outline" onClick={handleLocation} disabled={isLocating}>
                      {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateIcon className="h-4 w-4" />}
                      <span className="sr-only">Get current location</span>
                    </Button>
                  </div>
                  <FormDescription>
                    Enter a specific address or use the button to find your location.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Photo</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" asChild className="cursor-pointer">
                          <label htmlFor="photo-upload">
                            <Upload className="mr-2 h-4 w-4" />
                            Choose File
                          </label>
                        </Button>
                        <Input id="photo-upload" type="file" className="hidden" {...field} />
                        <span className="text-sm text-muted-foreground">No file chosen</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Record Voice Note</FormLabel>
                <Button type="button" variant="outline" className="w-full justify-start" disabled>
                  <Mic className="mr-2 h-4 w-4" />
                  Start Recording (coming soon)
                </Button>
              </FormItem>
            </div>
            
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Complaint
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
