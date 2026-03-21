import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Heart, Shield, CheckCircle } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 fade-in">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight tracking-tight">
                  Digital Lost &
                  <span className="bg-gradient-primary bg-clip-text text-transparent"> Found</span>
                  <span className="block text-4xl md:text-5xl mt-2 text-muted-foreground font-medium">
                    System
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-lg">
                  A platform to reunite people with their lost belongings quickly and securely.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/login" className="group">
                  <Button size="lg" className="w-full sm:w-auto btn-gradient text-lg px-8 py-6 h-auto">
                    <span className="flex items-center gap-2">
                      Get Started
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 h-auto border-2 hover:bg-primary/5">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative slide-up">
              <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-2xl rounded-3xl"></div>
              <img
                src={heroImage}
                alt="People reuniting with their lost belongings"
                className="relative rounded-3xl shadow-intense w-full transform hover:scale-105 transition-slow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-20 fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Simple steps to help you
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                find or return lost items
              </span>
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Our intelligent system makes it easy to report, match, and reunite people with their belongings
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="card-enhanced p-8 group hover:scale-105 transition-slow">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-smooth shadow-medium">
                <Search className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Report Items</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Easily report lost or found items with detailed descriptions, photos, and location information.
                </p>
              </div>
              <div className="mt-6 flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-smooth">
                <span>Learn more</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <div className="card-enhanced p-8 group hover:scale-105 transition-slow">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-smooth shadow-medium">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Smart Matching</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Our AI-powered system automatically matches lost and found items based on descriptions and characteristics.
                </p>
              </div>
              <div className="mt-6 flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-smooth">
                <span>Learn more</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <div className="card-enhanced p-8 group hover:scale-105 transition-slow">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-smooth shadow-medium">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Get Reunited</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Connect with finders or owners through our secure notification system and get your items back.
                </p>
              </div>
              <div className="mt-6 flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-smooth">
                <span>Learn more</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-8 backdrop-blur-sm">
              <Shield className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Safe, Secure, and
              <span className="block text-white/90">Reliable</span>
            </h2>
            
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-white/90 leading-relaxed">
              Your security is our priority. All reports are verified and monitored by our admin team
              to ensure a safe and trustworthy experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/report-lost" className="group">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-6 h-auto bg-white text-primary hover:bg-white/90 shadow-xl">
                  <span className="flex items-center gap-2">
                    Report Lost Item
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </Button>
              </Link>
              
              <Link to="/report-found" className="group">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 h-auto border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm">
                  <span className="flex items-center gap-2">
                    Report Found Item
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/20"></div>
        <div className="relative container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 lg:gap-12">
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-bold text-2xl text-foreground">Digital Lost & Found</h3>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                Helping reunite people with their belongings since 2024. Making the world a little more connected, one found item at a time.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-smooth cursor-pointer">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-smooth cursor-pointer">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-xl text-foreground">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-smooth text-lg">About Us</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-smooth text-lg">Contact</Link></li>
                <li><Link to="/login" className="text-muted-foreground hover:text-primary transition-smooth text-lg">Login</Link></li>
                <li><Link to="/register" className="text-muted-foreground hover:text-primary transition-smooth text-lg">Sign Up</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-xl text-foreground">Contact Info</h3>
              <div className="space-y-3 text-muted-foreground">
                <p className="flex items-center gap-3 text-lg">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  support@lostandfound.com
                </p>
                <p className="flex items-center gap-3 text-lg">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  (555) 123-4567
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center">
            <p className="text-muted-foreground text-lg">
              © 2024 Digital Lost & Found System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
