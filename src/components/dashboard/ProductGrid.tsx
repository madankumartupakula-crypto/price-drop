"use client";

import { ShoppingBag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard, TrackedProduct } from './ProductCard';

interface ProductGridProps {
  products: TrackedProduct[];
  onAddClick: () => void;
}

export function ProductGrid({ products, onAddClick }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-border rounded-3xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-headline font-bold">No items tracked yet</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Add your first product URL to start monitoring price drops and trends.
          </p>
        </div>
        <Button onClick={onAddClick} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add First Product
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
