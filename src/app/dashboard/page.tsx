"use client";

import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { ProductGrid } from '@/components/dashboard/ProductGrid';
import { AddProductDialog } from '@/components/dashboard/AddProductDialog';
import { TrackedProduct } from '@/components/dashboard/ProductCard';
import { Activity, Bell, Settings, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const INITIAL_PRODUCTS: TrackedProduct[] = [
  {
    id: '1',
    name: 'Apple AirPods Max - Sky Blue',
    imageUrl: 'https://picsum.photos/seed/airpods/600/400',
    currentPrice: 479.00,
    targetPrice: 449.00,
    retailer: 'amazon.com',
    url: '#',
    lastChecked: '2 hours ago',
    recommendation: 'wait',
    priceHistory: [
      { date: '2024-01-01', price: 549 },
      { date: '2024-01-15', price: 529 },
      { date: '2024-02-01', price: 499 },
      { date: '2024-02-15', price: 519 },
      { date: '2024-03-01', price: 479 },
    ]
  },
  {
    id: '2',
    name: 'Keychron Q1 Mechanical Keyboard',
    imageUrl: 'https://picsum.photos/seed/keyboard/600/400',
    currentPrice: 159.00,
    targetPrice: 160.00,
    retailer: 'bestbuy.com',
    url: '#',
    lastChecked: '45 mins ago',
    recommendation: 'buy_now',
    priceHistory: [
      { date: '2024-01-01', price: 189 },
      { date: '2024-01-15', price: 189 },
      { date: '2024-02-01', price: 179 },
      { date: '2024-02-15', price: 159 },
    ]
  }
];

export default function Dashboard() {
  const [products, setProducts] = useState<TrackedProduct[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Simulate hydration delay
    setProducts(INITIAL_PRODUCTS);
  }, []);

  const handleAddProduct = (data: any) => {
    const newProduct: TrackedProduct = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      imageUrl: data.imageUrl,
      currentPrice: data.currentPrice,
      targetPrice: data.targetPrice,
      retailer: data.retailer,
      url: '#',
      lastChecked: 'just now',
      recommendation: 'wait',
      priceHistory: [
        { date: '2024-01-01', price: data.currentPrice + 50 },
        { date: '2024-02-01', price: data.currentPrice + 20 },
        { date: '2024-03-01', price: data.currentPrice },
      ]
    };
    setProducts([...products, newProduct]);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.retailer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1 overflow-hidden flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border/50 px-6 flex items-center justify-between glass sticky top-0 z-30">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger />
              <div className="relative w-full max-w-md hidden md:block">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search tracked items..." 
                  className="pl-10 bg-secondary/30 border-none h-10 ring-1 ring-white/10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Settings className="w-5 h-5" />
              </Button>
              <div className="h-8 w-px bg-border/50 mx-2" />
              <div className="flex items-center gap-3 pl-2">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold leading-none">Alex Rivera</p>
                  <p className="text-xs text-muted-foreground">Pro Member</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/20 cursor-pointer hover:bg-primary/30 transition-all">
                  <User className="w-5 h-5" />
                </div>
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Real-time pulse</span>
                </div>
                <h1 className="text-3xl font-headline font-bold">Your Tracking Hub</h1>
                <p className="text-muted-foreground">Monitoring {products.length} active products across 4 retailers.</p>
              </div>
              <AddProductDialog onAdd={handleAddProduct} />
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Tracked', value: products.length, trend: '+1 this week' },
                { label: 'Potential Savings', value: '$240.50', trend: 'Based on targets' },
                { label: 'Alerts Triggered', value: '12', trend: 'Last 30 days' },
                { label: 'Market Pulse', value: 'Bearish', trend: 'Prices trending down' },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-xl bg-card border border-border/50 space-y-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase">{stat.label}</span>
                  <div className="text-2xl font-bold font-headline">{stat.value}</div>
                  <div className="text-[10px] text-primary font-bold uppercase tracking-tighter">{stat.trend}</div>
                </div>
              ))}
            </div>

            <ProductGrid products={filteredProducts} onAddClick={() => {}} />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
