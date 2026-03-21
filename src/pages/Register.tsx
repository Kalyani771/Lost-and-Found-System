import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const baseRegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  phoneNumber: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
});

const registerSchema = baseRegisterSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const adminRegisterSchema = baseRegisterSchema.extend({
  adminCode: z.string().min(1, 'Admin code is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // User registration state
  const [userFormData, setUserFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  // Admin registration state
  const [adminFormData, setAdminFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    adminCode: '',
  });

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validatedData = registerSchema.parse(userFormData);

      // First, try to sign up
      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            full_name: validatedData.fullName,
            phone_number: validatedData.phoneNumber || '',
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        // Check if the error is because the user already exists
        if (error.message.includes('User already registered')) {
          // Try to sign in instead to check if they're verified
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: validatedData.email,
            password: validatedData.password,
          });

          if (signInError) {
            if (signInError.message.includes('Email not confirmed')) {
              toast.error('This email is already registered but not verified. Please check your email for the verification link or use the resend option on the login page.');
              navigate('/login');
            } else {
              toast.error('This email is already registered. Please try logging in instead.');
              navigate('/login');
            }
          } else if (signInData.user) {
            toast.success('Welcome back! You are already registered and verified.');
            navigate('/dashboard');
          }
        } else {
          throw error;
        }
      } else if (data.user) {
        if (data.user.email_confirmed_at) {
          toast.success('Registration successful! Welcome to the platform.');
          navigate('/dashboard');
        } else {
          toast.success('Registration successful! Please check your email to verify your account.');
          navigate('/login');
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validatedData = adminRegisterSchema.parse(adminFormData);

      // Validate admin code - this is the only check needed
      if (validatedData.adminCode !== 'RGU123') {
        toast.error('Invalid admin code');
        setIsLoading(false);
        return;
      }

      // Admin code is valid, proceed with registration
      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            full_name: validatedData.fullName,
            phone_number: validatedData.phoneNumber || '',
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        // Check if the error is because the user already exists
        if (error.message.includes('User already registered')) {
          toast.error('This email is already registered. Please try logging in instead.');
          navigate('/login');
        } else {
          throw error;
        }
      } else if (data.user) {
        if (data.user.email_confirmed_at) {
          toast.success('Admin registration successful! Welcome to the platform.');
          navigate('/admin');
        } else {
          toast.success('Admin registration successful! Please check your email to verify your account.');
          navigate('/login');
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message || 'Admin registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-md card-enhanced shadow-intense backdrop-blur-sm border-0 fade-in">
        <CardHeader className="space-y-6 text-center pb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-medium mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">Create Account</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Join us to start reporting and finding lost items
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-muted/50 p-1">
              <TabsTrigger value="user" className="text-sm font-medium h-10">User Registration</TabsTrigger>
              <TabsTrigger value="admin" className="text-sm font-medium h-10">Admin Registration</TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="slide-up">
              <form onSubmit={handleUserSubmit} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="user-fullName" className="text-sm font-semibold text-foreground">Full Name</Label>
                  <Input
                    id="user-fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={userFormData.fullName}
                    onChange={handleUserChange}
                    className="h-12 px-4 text-base border-2 focus:border-primary transition-smooth"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="user-email" className="text-sm font-semibold text-foreground">Email Address</Label>
                  <Input
                    id="user-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={userFormData.email}
                    onChange={handleUserChange}
                    className="h-12 px-4 text-base border-2 focus:border-primary transition-smooth"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="user-phoneNumber" className="text-sm font-semibold text-foreground">Phone Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                  <Input
                    id="user-phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={userFormData.phoneNumber}
                    onChange={handleUserChange}
                    className="h-12 px-4 text-base border-2 focus:border-primary transition-smooth"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="user-password" className="text-sm font-semibold text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="user-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={userFormData.password}
                      onChange={handleUserChange}
                      className="h-12 px-4 pr-12 text-base border-2 focus:border-primary transition-smooth"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="user-confirmPassword" className="text-sm font-semibold text-foreground">Confirm Password</Label>
                  <Input
                    id="user-confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={userFormData.confirmPassword}
                    onChange={handleUserChange}
                    className="h-12 px-4 text-base border-2 focus:border-primary transition-smooth"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold btn-gradient shadow-medium hover:shadow-strong transition-smooth mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin" className="slide-up">
              <form onSubmit={handleAdminSubmit} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="admin-fullName" className="text-sm font-semibold text-foreground">Full Name</Label>
                  <Input
                    id="admin-fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={adminFormData.fullName}
                    onChange={handleAdminChange}
                    className="h-12 px-4 text-base border-2 focus:border-primary transition-smooth"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="admin-email" className="text-sm font-semibold text-foreground">Admin Email</Label>
                  <Input
                    id="admin-email"
                    name="email"
                    type="email"
                    placeholder="admin@email.com"
                    value={adminFormData.email}
                    onChange={handleAdminChange}
                    className="h-12 px-4 text-base border-2 focus:border-primary transition-smooth"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="admin-phoneNumber" className="text-sm font-semibold text-foreground">Phone Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                  <Input
                    id="admin-phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={adminFormData.phoneNumber}
                    onChange={handleAdminChange}
                    className="h-12 px-4 text-base border-2 focus:border-primary transition-smooth"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="admin-password" className="text-sm font-semibold text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={adminFormData.password}
                      onChange={handleAdminChange}
                      className="h-12 px-4 pr-12 text-base border-2 focus:border-primary transition-smooth"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="admin-confirmPassword" className="text-sm font-semibold text-foreground">Confirm Password</Label>
                  <Input
                    id="admin-confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={adminFormData.confirmPassword}
                    onChange={handleAdminChange}
                    className="h-12 px-4 text-base border-2 focus:border-primary transition-smooth"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="admin-code" className="text-sm font-semibold text-foreground">Admin Code</Label>
                  <Input
                    id="admin-code"
                    name="adminCode"
                    type="password"
                    placeholder="Enter admin code"
                    value={adminFormData.adminCode}
                    onChange={handleAdminChange}
                    className="h-12 px-4 text-base border-2 focus:border-primary transition-smooth"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold btn-gradient shadow-medium hover:shadow-strong transition-smooth mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating admin account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Admin Account
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8 space-y-4 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">Already have an account?</span>
              </div>
            </div>
            
            <Link to="/login" className="group inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-smooth">
              Sign in to your account
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </Link>
            
            <div className="pt-2">
              <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
