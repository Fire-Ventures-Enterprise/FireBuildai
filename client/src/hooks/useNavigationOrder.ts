import { useState, useEffect } from 'react';
import { LucideIcon, LayoutDashboard, FileText, MapPin, Users, Receipt, BarChart3, MessageCircle, Truck, Settings, DollarSign, Calculator } from "lucide-react";

export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
}

const DEFAULT_NAVIGATION: NavigationItem[] = [
  { id: "dashboard", name: "Dashboard", href: "/", icon: LayoutDashboard },
  { id: "invoices", name: "Invoices", href: "/invoices", icon: DollarSign },
  { id: "estimates", name: "Estimates", href: "/estimates", icon: Calculator },
  { id: "documents", name: "Documents", href: "/documents", icon: FileText },
  { id: "tracking", name: "GPS Tracking", href: "/tracking", icon: MapPin },
  { id: "contractors", name: "Contractors", href: "/contractors", icon: Users },
  { id: "expenses", name: "Expenses", href: "/expenses", icon: Receipt },
  { id: "analytics", name: "Analytics", href: "/analytics", icon: BarChart3 },
  { id: "clients", name: "Client Portal", href: "/clients", icon: MessageCircle },
  { id: "fleet", name: "Fleet", href: "/fleet", icon: Truck },
  { id: "settings", name: "Settings", href: "/settings", icon: Settings },
];

const STORAGE_KEY = 'firebuild-navigation-order';

export function useNavigationOrder() {
  const [navigation, setNavigation] = useState<NavigationItem[]>(DEFAULT_NAVIGATION);

  // Load saved order from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedIds = JSON.parse(saved);
        if (Array.isArray(savedIds)) {
          // Reorder navigation based on saved order
          const reorderedNav = savedIds
            .map(id => DEFAULT_NAVIGATION.find(item => item.id === id))
            .filter(Boolean) as NavigationItem[];
          
          // Add any new items that weren't in saved order
          const existingIds = new Set(savedIds);
          const newItems = DEFAULT_NAVIGATION.filter(item => !existingIds.has(item.id));
          
          setNavigation([...reorderedNav, ...newItems]);
        }
      } catch (error) {
        console.error('Failed to parse saved navigation order:', error);
      }
    }
  }, []);

  // Save order to localStorage
  const saveOrder = (newOrder: NavigationItem[]) => {
    try {
      const orderIds = newOrder.map(item => item.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orderIds));
    } catch (error) {
      console.error('Failed to save navigation order:', error);
    }
  };

  const reorderNavigation = (activeId: string, overId: string) => {
    setNavigation(items => {
      const oldIndex = items.findIndex(item => item.id === activeId);
      const newIndex = items.findIndex(item => item.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return items;

      const newItems = [...items];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);
      
      saveOrder(newItems);
      return newItems;
    });
  };

  const resetOrder = () => {
    setNavigation(DEFAULT_NAVIGATION);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    navigation,
    reorderNavigation,
    resetOrder
  };
}