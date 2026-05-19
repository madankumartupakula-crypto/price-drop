
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Link as LinkIcon, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { extractProductDetails } from '@/ai/flows/intelligent-product-scraper';

export function AddProductDialog({ onAdd }: { onAdd: (data: any) => void }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleScrape = async () => {
    if (!url) return;
    setLoading(true);
    try {
      // Calling the actual Genkit AI flow
      const details = await extractProductDetails({ url });
      
      const result = {
        name: details.name,
        imageUrl: details.imageUrl,
        currentPrice: details.currentPrice,
        retailer: new URL(url).hostname.replace('www.', ''),
        url: url,
        targetPrice: details.currentPrice * 0.9 // Default 10% target drop
      };

      onAdd(result);
      toast({
        title: "Product Found",
        description: "AI successfully extracted product details.",
      });
      setOpen(false);
      setUrl('');
    } catch (error) {
      console.error("Scraping error:", error);
      toast({
        variant: "destructive",
        title: "Scrape Failed",
        description: "Could not extract details. The website might be blocking access or the content is unavailable.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Track New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Product Scraper
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Paste any e-commerce URL. Our AI will automatically identify the product, price, and image.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="url" className="text-xs uppercase tracking-widest text-muted-foreground">Product URL</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="url"
                placeholder="https://amazon.com/product/..."
                className="pl-10 bg-secondary/50 border-white/10"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleScrape} 
            disabled={!url || loading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Page...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Extract Details
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
