"use client";

import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { ProductGrid } from '@/components/dashboard/ProductGrid';
import { AddProductDialog } from '@/components/dashboard/AddProductDialog';
import { TrackedProduct } from '@/components/dashboard/ProductCard';
import { Activity, Bell, Settings, Search, User, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [products, setProducts] = useState<TrackedProduct[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not load products from MongoDB. Check your network or connection string.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (newProductData: any) => {
    const newProduct: Omit<TrackedProduct, 'id'> = {
      name: newProductData.name,
      imageUrl: newProductData.imageUrl || 'https://picsum.photos/seed/placeholder/600/400',
      currentPrice: newProductData.currentPrice,
      targetPrice: newProductData.targetPrice || newProductData.currentPrice * 0.9,
      retailer: newProductData.retailer || 'Unknown',
      url: newProductData.url || '#',
      lastChecked: 'Just now',
      recommendation: 'wait',
      priceHistory: [
        { date: new Date().toISOString(), price: newProductData.currentPrice }
      ]
    };

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        const result = await response.json();
        const savedProduct = { ...newProduct, id: result.id } as TrackedProduct;
        setProducts(prev => [savedProduct, ...prev]);
        toast({
          title: "Success",
          description: `${newProduct.name} is now being tracked.`,
        });
      } else {
        throw new Error('Failed to save to DB');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Your product was found but could not be saved to the database.",
      });
    }
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
                  <p className="text-sm font-bold leading-none">Sumith</p>
                  <p className="text-xs text-muted-foreground">Premium Account</p>
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
                <h1 className="text-3xl font-headline font-bold">Price Tracker</h1>
                <p className="text-muted-foreground">Monitoring {products.length} products across the web.</p>
              </div>
              <AddProductDialog onAdd={handleAddProduct} />
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Tracked', value: products.length, trend: products.length > 0 ? 'Active monitoring' : 'Ready to start' },
                { label: 'Active Alerts', value: '0', trend: 'No price hits yet' },
                { label: 'Tracked Retailers', value: Array.from(new Set(products.map(p => p.retailer))).length, trend: 'Across retailers' },
                { label: 'Market Pulse', value: 'Live', trend: 'Syncing with MongoDB' },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-xl bg-card border border-border/50 space-y-1 shadow-sm">
                  <span className="text-xs text-muted-foreground font-medium uppercase">{stat.label}</span>
                  <div className="text-2xl font-bold font-headline">{stat.value}</div>
                  <div className="text-[10px] text-primary font-bold uppercase tracking-tighter">{stat.trend}</div>
                </div>
              ))}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Syncing with database...</p>
              </div>
            ) : (
              <ProductGrid products={filteredProducts} onAddClick={() => {}} />
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
