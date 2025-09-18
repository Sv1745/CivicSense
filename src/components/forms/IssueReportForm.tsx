"use client";

import { useState, useRef, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Upload, 
  Mic,
  Loader2, 
  Camera, 
  X,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { categoryService, departmentService, issueService, storageService } from "@/lib/database";
import type { Database } from "@/lib/database.types";

type Category = Database['public']['Tables']['categories']['Row'];
type Department = Database['public']['Tables']['departments']['Row'];

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category_id: z.string().min(1, "Please select a category"),
  department_id: z.string().min(1, "Please select a department"),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    required_error: "Please select priority level",
  }),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
});

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
}

export function IssueReportForm() {
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      department_id: "",
      priority: "medium",
      address: "",
      city: "",
      state: "",
    },
  });

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry"
  ];

  // Load categories and departments on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        const [categoriesData, departmentsData] = await Promise.all([
          categoryService.getCategories(),
          departmentService.getDepartments()
        ]);
        
        setCategories(categoriesData);
        setDepartments(departmentsData);
        setFilteredDepartments(departmentsData);
      } catch (error) {
        console.error('Error loading form data:', error);
        toast({
          variant: 'destructive',
          title: 'Error loading form data',
          description: 'Please refresh the page and try again.',
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [toast]);

  // Filter departments when city/state changes
  useEffect(() => {
    const city = form.watch('city');
    const state = form.watch('state');
    
    // Show all departments if no location is selected
    if (!city && !state) {
      setFilteredDepartments(departments);
      return;
    }
    
    // More flexible filtering - show departments that serve:
    // 1. The specific city/state
    // 2. Multiple cities/states (Various Cities, Multi-State, All Cities, All Areas)
    // 3. The selected state (even if city doesn't match exactly)
    const filtered = departments.filter(dept => {
      const deptCity = dept.city?.toLowerCase() || '';
      const deptState = dept.state?.toLowerCase() || '';
      const userCity = city?.toLowerCase() || '';
      const userState = state?.toLowerCase() || '';
      
      // Always include departments that serve multiple locations
      if (deptCity.includes('various') || 
          deptCity.includes('all') || 
          deptCity.includes('major') ||
          deptState.includes('various') || 
          deptState.includes('multi')) {
        return true;
      }
      
      // Include if state matches or department serves the user's state
      if (userState && (deptState === userState || deptState.includes(userState))) {
        return true;
      }
      
      // Include if city matches
      if (userCity && deptCity === userCity) {
        return true;
      }
      
      return false;
    });
    
    setFilteredDepartments(filtered.length > 0 ? filtered : departments);
  }, [form.watch('city'), form.watch('state'), departments]);

  const handleLocation = async () => {
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation',
      });
      setIsLocating(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // In production, you would use Google Maps Geocoding API to get real address
      // For now, we just capture the coordinates and let user fill in the address
      const locationData: LocationData = {
        lat: latitude,
        lng: longitude,
        address: "", // Don't auto-fill with mock data
        city: "", // Let user enter their actual city
        state: "" // Let user select their actual state
      };

      setLocationData(locationData);
      // Don't auto-fill form fields with mock data
      // Let the user enter their actual location details

      toast({
        title: "Location captured",
        description: `GPS coordinates recorded: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Location access failed',
        description: error.message || 'Unable to get your location',
      });
    } finally {
      setIsLocating(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      toast({
        variant: 'destructive',
        title: 'Invalid files',
        description: 'Please select only image files',
      });
    }

    if (photos.length + validFiles.length > 5) {
      toast({
        variant: 'destructive',
        title: 'Too many photos',
        description: 'Maximum 5 photos allowed',
      });
      return;
    }

    setPhotos(prev => [...prev, ...validFiles]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      const chunks: BlobPart[] = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak now to record your voice note",
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Recording failed',
        description: 'Could not access microphone',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording stopped",
        description: "Voice note has been saved",
      });
    }
  };

  const uploadFiles = async (userId: string): Promise<string[]> => {
    if (photos.length === 0) return [];

    console.log(`📤 Starting upload of ${photos.length} photos...`);
    
    const uploadPromises = photos.map(async (photo, index) => {
      try {
        console.log(`📤 Uploading photo ${index + 1}/${photos.length}: ${photo.name}`);
        const publicUrl = await storageService.uploadIssuePhoto(
          photo, 
          userId, 
          (progress) => {
            // Update progress for this specific photo
            const baseProgress = 30; // Start after issue creation (30%)
            const maxPhotoProgress = 50; // Photos can contribute up to 50% of total progress
            const photoProgress = Math.floor((progress / 100) * (maxPhotoProgress / photos.length));
            const totalProgress = baseProgress + (index * (maxPhotoProgress / photos.length)) + photoProgress;
            setUploadProgress(Math.min(totalProgress, 80));
          }
        );
        console.log(`✅ Photo ${index + 1} uploaded successfully: ${publicUrl}`);
        return publicUrl;
      } catch (error) {
        console.error(`❌ Error uploading photo ${index + 1}:`, error);
        // Return null for failed uploads but don't stop the entire process
        return null;
      }
    });

    try {
      const photoUrls = await Promise.all(uploadPromises);
      
      // Filter out failed uploads and show warning if any failed
      const successfulUrls = photoUrls.filter(url => url !== null) as string[];
      const failedCount = photoUrls.length - successfulUrls.length;
      
      console.log(`📊 Upload results: ${successfulUrls.length} successful, ${failedCount} failed`);
      
      if (failedCount > 0) {
        if (successfulUrls.length > 0) {
          toast({
            variant: 'default',
            title: 'Some photos uploaded',
            description: `${successfulUrls.length} out of ${photoUrls.length} photos uploaded successfully.`,
          });
        } else {
          toast({
            variant: 'default',
            title: 'Photo upload failed',
            description: 'Your issue was submitted successfully, but photos could not be uploaded.',
          });
        }
      }
      
      return successfulUrls;
      
    } catch (error) {
      console.error('❌ Photo upload process failed:', error);
      toast({
        variant: 'default',
        title: 'Photo upload failed',
        description: 'Your issue was submitted successfully, but photos could not be uploaded.',
      });
      return [];
    }
  };

  const uploadVoiceNote = async (userId: string): Promise<string | null> => {
    if (!audioBlob) return null;

    try {
      console.log('📤 Starting voice note upload...');
      const fileName = `voice_note_${Date.now()}.wav`;
      const file = new File([audioBlob], fileName, { type: 'audio/wav' });
      
      const voiceUrl = await storageService.uploadIssueAudio(
        file, 
        userId,
        (progress) => {
          // Voice note upload contributes to the final part of progress (75-80%)
          const voiceProgress = Math.floor((progress / 100) * 5);
          setUploadProgress(75 + voiceProgress);
        }
      );
      
      if (voiceUrl) {
        console.log('✅ Voice note uploaded successfully:', voiceUrl);
      }
      
      return voiceUrl;
    } catch (error) {
      console.error('❌ Error uploading voice note:', error);
      toast({
        variant: 'default',
        title: 'Voice note upload failed',
        description: 'Your issue was submitted successfully, but the voice note could not be uploaded.',
      });
      return null;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'Please sign in to submit an issue report.',
      });
      return;
    }

    if (!locationData) {
      toast({
        variant: 'destructive',
        title: 'Location required',
        description: 'Please capture your location first',
      });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      // Create issue in database
      const issueData: Database['public']['Tables']['issues']['Insert'] = {
        title: values.title,
        description: values.description,
        category_id: values.category_id,
        department_id: values.department_id,
        user_id: user.id,
        priority: values.priority as 'low' | 'medium' | 'high' | 'urgent',
        latitude: locationData.lat,
        longitude: locationData.lng,
        photo_urls: [], // Will be updated after upload
      };

      console.log('Creating issue with data:', JSON.stringify(issueData, null, 2));
      console.log('User data:', { id: user.id, email: user.email });
      console.log('Location data:', locationData);

      // Add timeout with shorter duration and better error handling
      const issueCreationPromise = issueService.createIssue(issueData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Issue creation timed out after 15 seconds - this usually means database tables need to be set up')), 15000)
      );

      const issue = await Promise.race([issueCreationPromise, timeoutPromise]) as Database['public']['Tables']['issues']['Row'];
      if (!issue || !issue.id) throw new Error('Failed to create issue - no issue returned from service');

      setUploadProgress(30); // Issue created successfully

      // Try to upload files (don't let upload failures block issue creation)
      let photoUrls: string[] = [];
      let voiceNoteUrl: string | null = null;

      // Only attempt uploads if we have files to upload
      if (photos.length > 0 || audioBlob) {
        console.log(`📤 Attempting to upload: ${photos.length} photos, ${audioBlob ? '1 voice note' : '0 voice notes'}`);
        
        try {
          console.log('📤 Starting file uploads...');
          
          // Upload photos and voice note in parallel
          const [photoResults, voiceResult] = await Promise.allSettled([
            photos.length > 0 ? uploadFiles(user.id) : Promise.resolve([]),
            audioBlob ? uploadVoiceNote(user.id) : Promise.resolve(null)
          ]);

          // Process photo upload results
          if (photoResults.status === 'fulfilled') {
            photoUrls = photoResults.value;
            console.log(`✅ Photo uploads completed: ${photoUrls.length} successful`);
          } else {
            console.warn('❌ Photo upload failed:', photoResults.reason);
            toast({
              variant: 'default',
              title: 'Photo upload failed',
              description: 'Your issue was submitted successfully, but photos could not be uploaded.',
            });
          }

          // Process voice note results
          if (voiceResult.status === 'fulfilled') {
            voiceNoteUrl = voiceResult.value;
            if (voiceNoteUrl) {
              console.log('✅ Voice note upload completed');
            } else {
              console.log('ℹ️ No voice note to upload or upload failed');
            }
          } else {
            console.warn('❌ Voice note upload failed:', voiceResult.reason);
          }

          setUploadProgress(80); // File uploads attempted
          
        } catch (uploadError) {
          console.error('❌ Upload error (continuing anyway):', uploadError);
          setUploadProgress(80); // Continue even if uploads fail
          
          // Show specific error message but don't fail the whole submission
          if (uploadError instanceof Error) {
            if (uploadError.message.includes('Storage not available')) {
              toast({
                variant: 'default',
                title: 'Files not uploaded',
                description: 'Your issue was submitted successfully, but attachments could not be uploaded due to storage configuration.',
              });
            } else if (uploadError.message.includes('not configured')) {
              toast({
                variant: 'default',
                title: 'Storage not configured',
                description: 'Your issue was submitted successfully without attachments. Storage will be set up soon.',
              });
            } else {
              toast({
                variant: 'default',
                title: 'Upload partially failed',
                description: 'Your issue was submitted successfully. Some attachments may not have been uploaded.',
              });
            }
          }
        }
      } else {
        // No files to upload, skip directly to 80%
        console.log('ℹ️ No files to upload, skipping upload phase');
        setUploadProgress(80);
      }

      setUploadProgress(90);

      // Update issue with file URLs (only if we have successful uploads)
      if (photoUrls.length > 0 || voiceNoteUrl) {
        try {
          await issueService.updateIssue(issue.id, {
            photo_urls: photoUrls,
            audio_url: voiceNoteUrl
          });
          console.log('✅ Issue updated with file URLs');
        } catch (updateError) {
          console.warn('Failed to update issue with file URLs, but issue was created:', updateError);
          // Don't fail the submission if we can't update file URLs
        }
      }

      setUploadProgress(100);

      toast({
        title: "Report submitted successfully!",
        description: `Issue #${issue.id.slice(-8)} has been created and assigned to ${departments.find(d => d.id === values.department_id)?.name}.`,
      });

      // Reset form
      form.reset();
      setPhotos([]);
      setAudioBlob(null);
      setLocationData(null);
      setUploadProgress(0);

    } catch (error) {
      console.error('Error submitting report:', error);
      console.error('Error details:', { 
        name: error instanceof Error ? error.name : 'Unknown', 
        message: error instanceof Error ? error.message : JSON.stringify(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Report a Civic Issue</CardTitle>
        <p className="text-center text-muted-foreground">
          Help improve your community by reporting civic issues
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading form data...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief title of the issue" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a clear, concise title for your issue
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the issue in detail..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include as much detail as possible to help authorities understand the issue
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <span>{category.icon}</span>
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityLevels.map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className={`font-medium ${priority.color}`}>
                              {priority.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Location Information</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="mr-2 h-4 w-4" />
                  )}
                  {isLocating ? "Getting Location..." : "Get Current Location"}
                </Button>
              </div>

              {locationData && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    GPS coordinates captured successfully! Please fill in your address details below.
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/UT</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {indianStates.map(state => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
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
                      <FormLabel>City/District</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your city/district" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the specific location/address where the issue is located (e.g., Near City Mall, MG Road, Sector 5)"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevant Department</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredDepartments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>
                            <div className="space-y-1">
                              <div className="font-medium">{dept.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {dept.city}, {dept.state}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Department will be filtered based on your selected location
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Evidence (Photos)</h3>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photos
                </Button>
                
                {navigator.mediaDevices && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                Maximum 5 photos. Supported formats: JPG, PNG, WebP<br />
                <span className="text-xs text-blue-600">
                  📝 Note: Your issue will be submitted successfully even if photo uploads fail
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Voice Note (Optional)</h3>
              <FormItem>
                <FormDescription>
                  Record a voice note to provide additional context
                </FormDescription>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!navigator.mediaDevices}
                  >
                    <Mic className={`mr-2 h-4 w-4 ${isRecording ? 'text-red-500' : ''}`} />
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </Button>
                  
                  {audioBlob && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setAudioBlob(null)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
                
                {audioBlob && (
                  <div className="p-2 bg-green-50 rounded text-sm text-green-800">
                    Voice note recorded successfully
                  </div>
                )}
              </FormItem>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {uploadProgress <= 30 ? 'Creating issue...' :
                     uploadProgress <= 80 ? 'Uploading files...' :
                     uploadProgress <= 90 ? 'Finalizing...' :
                     'Almost done...'}
                  </span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} />
                <div className="text-xs text-muted-foreground text-center">
                  Your issue will be submitted successfully even if file uploads fail
                </div>
              </div>
            )}
            
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Issue Report
            </Button>
          </form>
        </Form>
        )}
      </CardContent>
    </Card>
  );
}
