import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { z } from 'zod';
import type { User } from '@supabase/supabase-js';

const categories = ['Wallet', 'Mobile', 'Bag', 'Keys', 'Laptop', 'Documents', 'Jewelry', 'Clothing', 'Other'];

const reportSchema = z.object({
  itemName: z.string().min(2, 'Item name must be at least 2 characters').max(100),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  dateFound: z.string().min(1, 'Date found is required'),
  locationFound: z.string().min(2, 'Location must be at least 2 characters').max(200),
});

const ReportFound = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    description: '',
    dateFound: '',
    locationFound: '',
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

  // const checkForMatches = async () => {
  //   if (!formData.category || !formData.itemName) return;

  //   const { data, error } = await supabase
  //     .from('lost_items')
  //     .select('*')
  //     .eq('category', formData.category)
  //     .eq('status', 'active')
  //     .ilike('item_name', `%${formData.itemName}%`);

  //   if (!error && data) {
  //     setPotentialMatches(data);
  //   }
  // };
const checkForMatches = async () => {
  if (!formData.category || !formData.itemName) return;

  // Raw SQL query to compute similarity score
  const { data, error } = await supabase.rpc('match_lost_items', {
    item_name: formData.itemName,
    category: formData.category,
    location: formData.locationFound || '',
    description: formData.description || ''
  });

  if (error) {
    console.error('Error checking matches:', error);
    toast.error('Failed to check potential matches');
  }
  if (data && data.length>0) {
    setPotentialMatches(data);
    toast.info(`Found ${data.length} potential match(es)!`);
  }else{
    setPotentialMatches([]);
  }
};
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
    if (!user) return toast.error('Please log in to report a found item.');;

    setIsLoading(true);
    try {
      const validatedData = reportSchema.parse(formData);

      let imageUrl:string | null = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('item-images')
          .getPublicUrl(fileName);
        
        imageUrl = urlData.publicUrl;
      }

      // const { data: foundItem, error } = await supabase.from('found_items').insert({
      //   user_id: user.id,
      //   item_name: validatedData.itemName,
      //   category: validatedData.category as any,
      //   description: validatedData.description,
      //   date_found: validatedData.dateFound,
      //   location_found: validatedData.locationFound,
      //   image_url: imageUrl,
      // }).select().single();

      // if (error) throw error;
      const { data: foundItem, error: insertError } = await supabase
      .from('found_items')
      .insert({
        user_id: user.id,
        item_name: validatedData.itemName,
        category: validatedData.category,
        description: validatedData.description,
        date_found: validatedData.dateFound,
        location_found: validatedData.locationFound,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log("🟢 Found item inserted:", foundItem);

      // Create matches for similar lost items
  //     if (potentialMatches.length > 0 && foundItem) {
  //       const matches = potentialMatches.map((lostItem: any) => ({
  //         lost_item_id: lostItem.id,
  //         found_item_id: foundItem.id,
  //         similarity_score: lostItem.similarity_score, // Basic score, can be improved with better matching algorithm
  //       }));

  //       await supabase.from('item_matches').insert(matches);
  //     }

  //     toast.success('Found item reported successfully!');
  //     if (potentialMatches.length > 0) {
  //       toast.info(`Found ${potentialMatches.length} potential match(es)!`);
  //     }
      
  //     // Reset form
  //     setFormData({
  //       itemName: '',
  //       category: '',
  //       description: '',
  //       dateFound: '',
  //       locationFound: '',
  //     });
  //     setImageFile(null);
  //     setPotentialMatches([]);
  //     // Navigate after a short delay to show success message
  //     setTimeout(() => {
  //       navigate('/dashboard');
  //     }, 1000);
  //   } catch (error) {
  //     if (error instanceof z.ZodError) {
  //       toast.error(error.errors[0].message);
  //     } else if (error instanceof Error) {
  //       toast.error(error.message || 'Failed to report item');
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

    // ✅ 2. Get potential lost matches using RPC
    const { data: matches, error: matchError } = await supabase.rpc('match_lost_items', {
      p_item_name: validatedData.itemName,
      p_category: validatedData.category,
      p_location: validatedData.locationFound,
      p_description: validatedData.description
    });

    if (matchError) throw matchError;

    console.log("🟣 Potential matches:", matches);

    // ✅ 3. Insert into item_matches if any matches found
    if (matches && matches.length > 0) {
      const insertData = matches.map((lostItem: any) => ({
        lost_item_id: lostItem.id,
        found_item_id: foundItem.id,
        similarity_score: lostItem.similarity_score,
      }));
      //added
     // await supabase.from('item_matches').insert(insertData);
      // for (const lostItem of matches) {
      //   await fetch('https://qpfjtvqwjebmkxexvruf.functions.supabase.co/notify_match', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       lostItemUserId: lostItem.user_id,
      //       foundItemUserId: user.id,
      //       foundItemDetails: foundItem,
      //     }),
      //   });
      // }
      const { error: matchInsertError } = await supabase
        .from('item_matches')
        .insert(insertData);

      if (matchInsertError) throw matchInsertError;

      // Send notifications to all matched lost item owners using EmailJS
      for (const lostItem of matches) {
        try {
          console.log('📧 Sending notification for lost item:', lostItem.id);

          // Fetch lost item owner's email
          const { data: lostUser, error: lostUserError } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", lostItem.user_id)
            .single();

          if (lostUserError || !lostUser?.email) {
            console.error('❌ Could not fetch lost user email:', lostUserError);
            continue;
          }

          // Fetch found item's user mobile number
          const { data: foundUser, error: foundUserError } = await supabase
            .from("profiles")
            .select("phone_number")
            .eq("id", user.id)
            .single();

          console.log('👤 Found user data:', foundUser);
          console.log('📱 Phone number from DB:', foundUser?.phone_number);

          const finderMobile = foundUser?.phone_number || "Not provided";
          console.log('📱 Final finder mobile:', finderMobile);

          // Prepare email template parameters
          const templateParams = {
            to_email: lostUser.email,
            lost_item_name: lostItem.item_name,
            found_item_name: foundItem.item_name,
            found_item_description: foundItem.description,
            found_item_location: foundItem.location_found,
            found_item_date: foundItem.date_found,
            finder_mobile: finderMobile,
            lost_item_user_name: lostUser.email.split('@')[0], // Simple name extraction
          };

          console.log('📨 Sending email with params:', templateParams);

          // Send email using EmailJS
          const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              service_id: 'service_b176pl7', // Your EmailJS service ID
              template_id: 'item_match_notification', // Template ID
              user_id: 'vfRBIt9S8Sotp5qV_', // Your EmailJS user ID
              template_params: templateParams,
            }),
          });

          if (response.ok) {
            console.log('✅ Email sent successfully to:', lostUser.email);
            toast.success('Notification sent to lost item owner!');
          } else {
            const errorText = await response.text();
            console.error('❌ Email send failed:', errorText);
            toast.error('Failed to send notification email');
          }
        } catch (err) {
          console.error('❌ Exception in email send:', err);
          toast.error('Failed to send notification due to exception');
        }
      }
      toast.info(`Found ${matches.length} potential match(es)!`);
    }
  
    toast.success('Found item reported successfully!');
    // Reset form
    setFormData({
      itemName: '',
      category: '',
      description: '',
      dateFound: '',
      locationFound: '',
    });
    setImageFile(null);

    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  } catch (error) {
    console.error("❌ Error during submission:", error);
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
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-t-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Report Found Item</h1>
                <p className="text-white/90 text-lg">Help reunite someone with their lost belongings</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="form-section">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">1</span>
                  </div>
                  Basic Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="itemName" className="text-sm font-semibold text-foreground">Item Name*</Label>
                    <Input
                      id="itemName"
                      name="itemName"
                      placeholder="e.g., Black Leather Wallet"
                      value={formData.itemName}
                      onChange={handleChange}
                      onBlur={checkForMatches}
                      className="h-12 px-4 text-base border-2 focus:border-primary transition-smooth"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="category" className="text-sm font-semibold text-foreground">Category*</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, category: value }));
                        setTimeout(checkForMatches, 100);
                      }}
                    >
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

                {potentialMatches.length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl slide-up">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800 mb-1">Potential Matches Found!</h4>
                        <p className="text-sm text-green-700">
                          We found {potentialMatches.length} potential match(es) in lost items. Continue filling the form to help us match better.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-section">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">2</span>
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
                    Detailed descriptions help us match items with their owners more accurately.
                  </p>
                </div>
              </div>

              <div className="form-section">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">3</span>
                  </div>
                  When & Where
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="dateFound" className="text-sm font-semibold text-foreground">Date Found*</Label>
                    <Input
                      id="dateFound"
                      name="dateFound"
                      type="date"
                      value={formData.dateFound}
                      onChange={handleChange}
                      className="h-12 px-4 text-base border-2 focus:border-primary transition-smooth"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="locationFound" className="text-sm font-semibold text-foreground">Location Found*</Label>
                    <Input
                      id="locationFound"
                      name="locationFound"
                      placeholder="e.g., Central Park, Main Street, Coffee Shop"
                      value={formData.locationFound}
                      onChange={handleChange}
                      className="h-12 px-4 text-base border-2 focus:border-primary transition-smooth"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">4</span>
                  </div>
                  Photo (Optional)
                </h3>
                
                <div className="space-y-4">
                  <Label htmlFor="image" className="text-sm font-semibold text-foreground">Upload Image</Label>
                  <div className="relative border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-smooth">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 text-green-600" />
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
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-medium hover:shadow-strong transition-smooth"
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Report Found Item
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

export default ReportFound;
