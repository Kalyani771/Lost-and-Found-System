import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import type { User } from '@supabase/supabase-js';

const categories = ['Wallet', 'Mobile', 'Bag', 'Keys', 'Laptop', 'Documents', 'Jewelry', 'Clothing', 'Other'];

const reportSchema = z.object({
  itemName: z.string().min(2, 'Item name must be at least 2 characters').max(100),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  dateLost: z.string().min(1, 'Date lost is required'),
  locationLost: z.string().min(2, 'Location must be at least 2 characters').max(200),
});

const ReportLost = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    description: '',
    dateLost: '',
    locationLost: '',
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
    };
    checkUser();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const validatedData = reportSchema.parse(formData);

      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // const { error } = await supabase.from('lost_items').insert({
      //   user_id: user.id,
      //   item_name: validatedData.itemName,
      //   category: validatedData.category as any,
      //   description: validatedData.description,
      //   date_lost: validatedData.dateLost,
      //   location_lost: validatedData.locationLost,
      //   image_url: imageUrl,
      // });

      // if (error) throw error;
      console.log("🟡 Submitting to Supabase...");
const { data, error } = await supabase
  .from('lost_items')
  .insert({
    user_id: user.id,
    item_name: validatedData.itemName,
    category: validatedData.category,
    description: validatedData.description,
    date_lost: validatedData.dateLost,
    location_lost: validatedData.locationLost,
    image_url: imageUrl,
  })
  .select(); // to get inserted row back

console.log("🟢 Insert result:", { data, error });

if (error) throw error;

      toast.success('Lost item reported successfully!');
      // Reset form
      setFormData({
        itemName: '',
        category: '',
        description: '',
        dateLost: '',
        locationLost: '',
      });
      setImageFile(null);
      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to report item');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div className="relative container max-w-3xl mx-auto py-8">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-8 group hover:bg-primary/5 transition-smooth">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="card-enhanced shadow-intense backdrop-blur-sm border-0 fade-in">
          <div className="bg-gradient-primary text-white p-8 rounded-t-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Report Lost Item</h1>
                <p className="text-white/90 text-lg">Help us help you find your lost belongings</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="form-section">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  Basic Information
                </h3>
                {/*Basic Info*/}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="itemName" className="text-sm font-semibold text-foreground">Item Name*</Label>
                    <Input
                      id="itemName"
                      name="itemName"
                      placeholder="e.g., Black Leather Wallet"
                      value={formData.itemName}
                      onChange={handleChange}
                      className="h-12 px-4 text-base border-2 focus:border-primary transition-smooth"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="category" className="text-sm font-semibold text-foreground">Category*</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="h-12 text-base border-2 focus:border-primary">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat} className="text-base">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  Description & Details
                </h3>
                
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-semibold text-foreground">Description*</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the item in detail... Include color, size, brand, distinctive features, etc."
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className="text-base border-2 focus:border-primary transition-smooth resize-none"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The more details you provide, the better we can match your item.
                  </p>
                </div>
              </div>

              <div className="form-section">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  When & Where
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="dateLost" className="text-sm font-semibold text-foreground">Date Lost*</Label>
                    <Input
                      id="dateLost"
                      name="dateLost"
                      type="date"
                      value={formData.dateLost}
                      onChange={handleChange}
                      className="h-12 px-4 text-base border-2 focus:border-primary transition-smooth"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="locationLost" className="text-sm font-semibold text-foreground">Location Lost*</Label>
                    <Input
                      id="locationLost"
                      name="locationLost"
                      placeholder="e.g., Central Park, Main Street, Coffee Shop"
                      value={formData.locationLost}
                      onChange={handleChange}
                      className="h-12 px-4 text-base border-2 focus:border-primary transition-smooth"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">4</span>
                  </div>
                  Photo (Optional)
                </h3>
                
                <div className="space-y-4">
                  <Label htmlFor="image" className="text-sm font-semibold text-foreground">Upload Image</Label>
                  <div className="relative border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-smooth">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          {imageFile ? imageFile.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-semibold btn-gradient shadow-medium hover:shadow-strong transition-smooth"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Submitting Report...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Report Lost Item
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportLost;
