"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingDown, TrendingUp, Bell, MoreHorizontal, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PriceChart } from './PriceChart';

export interface PricePoint {
  date: string;
  price: number;
}

export interface TrackedProduct {
  id: string;
  name: string;
  imageUrl: string;
  currentPrice: number;
  targetPrice: number;
  priceHistory: PricePoint[];
  retailer: string;
  url: string;
  lastChecked: string;
  recommendation?: 'buy_now' | 'wait';
  reason?: string;
}

export function ProductCard({ product }: { product: TrackedProduct }) {
  const latestPrice = product.currentPrice;
  const previousPrice = product.priceHistory[product.priceHistory.length - 2]?.price || latestPrice;
  const priceDropped = latestPrice < previousPrice;
  const priceDiff = Math.abs(latestPrice - previousPrice);
  const diffPercent = ((priceDiff / previousPrice) * 100).toFixed(1);

  const progressToTarget = Math.min(100, (product.targetPrice / latestPrice) * 100);

  return (
    <Card className="group overflow-hidden bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300">
      <CardHeader className="p-0 relative h-48 overflow-hidden">
        <Image 
          src={product.imageUrl} 
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          data-ai-hint="product image"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge className="bg-background/80 backdrop-blur-md text-foreground border-white/10">
            {product.retailer}
          </Badge>
          {product.recommendation && (
            <Badge className={product.recommendation === 'buy_now' ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}>
              <Zap className="w-3 h-3 mr-1 fill-current" />
              {product.recommendation === 'buy_now' ? 'Buy Now' : 'Wait'}
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-md hover:bg-primary hover:text-white border-white/10">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="font-headline font-bold text-lg line-clamp-1">{product.name}</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Last checked {product.lastChecked}</p>
        </div>

        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Current Price</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${latestPrice.toFixed(2)}</span>
              {latestPrice !== previousPrice && (
                <div className={`flex items-center text-xs font-bold ${priceDropped ? 'text-green-400' : 'text-red-400'}`}>
                  {priceDropped ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
                  {diffPercent}%
                </div>
              )}
            </div>
          </div>
          <div className="text-right space-y-1">
            <span className="text-xs text-muted-foreground">Target</span>
            <div className="text-lg font-bold text-primary">${product.targetPrice.toFixed(2)}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress to target</span>
            <span className="font-medium text-accent">{progressToTarget.toFixed(0)}%</span>
          </div>
          <Progress value={progressToTarget} className="h-1.5 bg-secondary" />
        </div>

        <div className="h-24 pt-2">
          <PriceChart data={product.priceHistory} />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" className="flex-1 h-10 border-white/10 hover:bg-white/5">
          <Bell className="w-4 h-4 mr-2 text-primary" />
          Manage Alerts
        </Button>
        <Button className="w-10 h-10 p-0 bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all border border-primary/20" asChild>
          <a href={product.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
