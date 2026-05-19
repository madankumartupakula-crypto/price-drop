import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TrendingUp, Bell, Search, Activity, ChevronRight, ShoppingCart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-6 py-4 flex items-center justify-between glass sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
            P
          </div>
          <span className="text-xl font-headline font-bold tracking-tight">PricePulse</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Demo</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-sm font-medium">Log In</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-subtle" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse-subtle delay-700" />
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary tracking-wider uppercase">
              <Activity className="w-3 h-3" />
              AI-Powered Tracking
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tight leading-[1.1]">
              Never Miss a Price Drop <br />
              <span className="text-primary">Again.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-body leading-relaxed">
              PricePulse uses advanced AI to monitor products across any retailer. 
              Set your target, and we'll handle the rest with real-time alerts and predictive insights.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 px-8 bg-primary hover:bg-primary/90 text-lg font-semibold shadow-xl shadow-primary/20 group">
                  Start Tracking Now
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold border-white/10 hover:bg-white/5 transition-all">
                See How It Works
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 bg-secondary/30">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Engineered for Savings</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Advanced tools designed to give you the upper hand in online shopping.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Search className="w-6 h-6 text-primary" />,
                  title: "Intelligent Scraper",
                  desc: "Automatically extracts price, images, and variants from any product URL using GenAI reasoning."
                },
                {
                  icon: <TrendingUp className="w-6 h-6 text-accent" />,
                  title: "Predictive Insights",
                  desc: "AI-driven logic suggests whether to buy now or wait for a predicted deeper discount."
                },
                {
                  icon: <Bell className="w-6 h-6 text-primary" />,
                  title: "Instant Alerts",
                  desc: "Get notified via email, push, or SMS the second a price hits your target threshold."
                }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-headline font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-primary to-accent p-12 text-center text-white space-y-8 shadow-2xl shadow-primary/20">
            <h2 className="text-3xl md:text-5xl font-headline font-bold">Ready to outsmart the market?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">Join thousands of smart shoppers using PricePulse to save an average of 22% on every purchase.</p>
            <Link href="/dashboard" className="inline-block">
              <Button size="lg" className="h-14 px-10 bg-white text-primary hover:bg-white/90 text-lg font-bold">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-white/5 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white text-xs font-bold">P</div>
            <span className="text-lg font-headline font-bold">PricePulse</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Support</Link>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 PricePulse AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
