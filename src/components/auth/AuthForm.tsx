'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
// Base schema that includes all possible fields
const baseSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().optional(),
});

const loginSchema = baseSchema.refine(() => true);

const signupSchema = baseSchema
  .refine((data) => data.displayName && data.displayName.length >= 2, {
    message: 'Name must be at least 2 characters',
    path: ['displayName'],
  })
  .refine((data) => data.confirmPassword && data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSwitchMode: () => void;
}

export function AuthForm({ mode, onSwitchMode }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const { toast } = useToast();

  const isLogin = mode === 'login';

  // Use appropriate schema based on mode
  const schema = isLogin ? loginSchema : signupSchema;
  const form = useForm<z.infer<typeof baseSchema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Clear form errors and reset unnecessary fields when mode changes
  useEffect(() => {
    form.clearErrors();
    
    if (isLogin) {
      // Clear signup-specific fields when switching to login
      form.setValue('displayName', '');
      form.setValue('confirmPassword', '');
    }
  }, [mode, form, isLogin]);

  const onSubmit = async (values: z.infer<typeof baseSchema>) => {
    setLoading(true);
    
    try {
      if (isLogin) {
        await signIn(values.email, values.password);
        toast({
          title: 'Welcome back!',
          description: 'You have been successfully logged in.',
        });
      } else {
        // Ensure required signup fields are present
        if (!values.displayName || !values.confirmPassword) {
          throw new Error('Missing required fields for signup');
        }
        await signUp(values.email, values.password, values.displayName);
        toast({
          title: 'Account created!',
          description: 'Welcome to CivicSense. You can now report issues.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      await signInWithGoogle();
      toast({
        title: 'Welcome!',
        description: 'You have been successfully signed in with Google.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Google sign-in failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = form.getValues('email');
    
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await resetPassword(email);
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for password reset instructions.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset email',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isLogin ? 'Sign In' : 'Create Account'}</CardTitle>
        <CardDescription>
          {isLogin
            ? 'Enter your credentials to access your account'
            : 'Join CivicSense to report and track civic issues'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isLogin && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </Form>

        {isLogin && (
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="text-sm text-muted-foreground"
              onClick={handleForgotPassword}
            >
              Forgot your password?
            </Button>
          </div>
        )}

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={onSwitchMode}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}