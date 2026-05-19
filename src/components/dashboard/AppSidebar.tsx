"use client";

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from '@/components/ui/sidebar';
import { Home, LayoutDashboard, ShoppingCart, TrendingDown, Settings, HelpCircle, Activity } from 'lucide-react';
import Link from 'next/link';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Activity, label: 'Price Trends', active: false },
  { icon: ShoppingCart, label: 'Wishlists', active: false },
  { icon: TrendingDown, label: 'Hot Deals', active: false },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-sidebar">
      <SidebarHeader className="h-16 flex items-center px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
            P
          </div>
          <span className="text-lg font-headline font-bold group-data-[collapsible=icon]:hidden">PricePulse</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton 
                isActive={item.active} 
                className="hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary data-[active=true]:text-white"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-8 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-data-[collapsible=icon]:hidden">
          Account
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-primary/10 hover:text-primary">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-primary/10 hover:text-primary">
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 group-data-[collapsible=icon]:hidden">
          <p className="text-xs font-bold text-primary mb-1 uppercase tracking-tighter">Pro Plan Active</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Unlimited tracking and SMS alerts enabled.</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
