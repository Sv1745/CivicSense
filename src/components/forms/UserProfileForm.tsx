"use client";

import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Upload,
  Loader2,
  Save,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export function UserProfileForm() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user, updateProfile } = useAuth();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
    },
  });

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry"
  ];

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      citizen: { label: "Citizen", variant: "default" as const },
      admin: { label: "Administrator", variant: "destructive" as const },
      department_head: { label: "Department Head", variant: "secondary" as const },
    };
    
    return roleConfig[role as keyof typeof roleConfig] || roleConfig.citizen;
  };

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      form.reset({
        full_name: user.full_name || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
      });
      
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
    }
  }, [user, form]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Please select an image file',
        });
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;

    setIsUpdating(true);
    
    try {
      let avatarUrl = user.avatar_url;
      
      // Upload avatar if changed
      if (avatarFile) {
        // In a real app, you would upload to Supabase Storage
        // For now, we'll use the preview as the URL
        avatarUrl = avatarPreview;
      }

      // Update profile
      await updateProfile({
        ...values,
        avatar_url: avatarUrl,
      });

      toast({
        title: "Profile updated successfully!",
        description: "Your profile information has been saved.",
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Please sign in to view your profile.</p>
        </CardContent>
      </Card>
    );
  }

  const roleBadge = getRoleBadge(user.role);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
          <User className="h-6 w-6" />
          User Profile
        </CardTitle>
        <p className="text-center text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Profile Header */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview || user.avatar_url || ""} />
                  <AvatarFallback className="text-lg">
                    {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <Button
                  type="button"
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              
              <div className="text-center space-y-2">
                <div className="flex items-center gap-2 justify-center">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
                
                <div className="flex items-center gap-2 justify-center">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This name will be displayed on your issue reports
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your phone number" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional - For important issue updates
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your city" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/UT</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ""}
                    >
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
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your address"
                      className="min-h-[80px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional - Your residential address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Profile Stats */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Account Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full" size="lg" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Update Profile
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}