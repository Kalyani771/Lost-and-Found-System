import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false); // 👈
  

  useEffect(() => {
    const fetchMatchDetails = async () => {
      const { data, error } = await supabase
        .from('item_matches')
        .select(`
          *,
          lost_items(*),
          found_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching match:', error);
      } else {
        setMatch(data);
      }
      setLoading(false);
    };

    fetchMatchDetails();
    
    
  }, [id]);

  

    

  if (loading) {
    return <div className="text-center py-12">Loading details...</div>;
  }

  if (!match) {
    return <div className="text-center py-12 text-red-500">No details found for this match</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div className="relative container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 group hover:bg-primary/5 transition-smooth"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Button>

        <div className="space-y-8">
          {/* Header */}
          <div className="card-enhanced p-8 text-center">
            <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-medium">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Match Details</h1>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-semibold">Match Score: {match.similarity_score}%</span>
            </div>
          </div>

          {/* Match Comparison */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Lost Item */}
            <div className="card-enhanced overflow-hidden">
              <div className="p-6 border-b border-border bg-red-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Lost Item</h3>
                    <p className="text-muted-foreground">Reported as missing</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {match.lost_items?.image_url && (
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={match.lost_items.image_url}
                      alt={match.lost_items.item_name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Item Name</h4>
                    <p className="text-lg">{match.lost_items?.item_name}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Category</h4>
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                      {match.lost_items?.category}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Description</h4>
                    <p className="text-muted-foreground leading-relaxed">{match.lost_items?.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground text-sm">Date Lost</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                        </svg>
                        {new Date(match.lost_items?.date_lost).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground text-sm">Location</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {match.lost_items?.location_lost}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Found Item */}
            <div className="card-enhanced overflow-hidden">
              <div className="p-6 border-b border-border bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Found Item</h3>
                    <p className="text-muted-foreground">Reported as found</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {match.found_items?.image_url && (
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={match.found_items.image_url}
                      alt={match.found_items.item_name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Item Name</h4>
                    <p className="text-lg">{match.found_items?.item_name}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Category</h4>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      {match.found_items?.category}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Description</h4>
                    <p className="text-muted-foreground leading-relaxed">{match.found_items?.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground text-sm">Date Found</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(match.found_items?.date_found).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground text-sm">Location</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {match.found_items?.location_found}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="card-enhanced p-8 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-medium">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Ready to Connect?</h3>
                <p className="text-muted-foreground">
                  This match looks promising! The system has automatically notified both parties about this potential match.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="btn-gradient" onClick={() => setShowContact((prev) => !prev)}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {showContact ? 'Hide Contact Info' : 'Contact Owner'}
                </Button>
                <Button variant="outline" className="border-2">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Save Match
                </Button>
              </div>
               {/* 👇 Contact Info Display */}
               {/* {showContact && (
                <div className="mt-8 border-t border-border pt-6 space-y-3">
                  <h4 className="text-lg font-semibold text-primary">Lost Item Owner Contact</h4>
                  <p className="text-muted-foreground">
                    <strong>Email:</strong> {match.lost_items?.email || match.lost_items?.user_email || 'Not provided'}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Phone:</strong> {match.lost_items?.phone_number || 'Not provided'}
                  </p>
                </div>
              )} */}
              {showContact && (
  <div className="mt-6 border-t border-border pt-6 text-center space-y-2">
    <h4 className="text-lg font-semibold text-foreground">Contact Information</h4>
    <p className="text-muted-foreground">
      👤 Name: {match.lost_items?.profiles?.full_name || "Kalyani"}
    </p>
    <p className="text-muted-foreground">
      📧 Email: {match.lost_items?.profiles?.email || "kalyanibugide771@gmail.com"}
    </p>
    <p className="text-muted-foreground">
      📞 Phone: {match.lost_items?.profiles?.phone_number || "7842273045"}
    </p>
  </div>
)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
