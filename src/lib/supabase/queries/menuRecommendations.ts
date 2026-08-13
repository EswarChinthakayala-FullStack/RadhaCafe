import { supabase } from '../client';
import type { MenuItem, BestSellerItemStat } from '../../../types';

/**
 * Get Today's Specials from Supabase.
 * Filtered by daily_special_date = CURRENT_DATE (YYYY-MM-DD) and is_available = true.
 */
export async function fetchTodaysSpecials(): Promise<MenuItem[]> {
  const todayStr = new Date().toISOString().split('T')[0];

  const { data, error } = await (supabase as any)
    .from('menu_items')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('is_available', true)
    .eq('daily_special_date', todayStr)
    .order('name', { ascending: true });

  if (error) {
    console.warn('Failed to fetch Today Specials:', error.message);
    return [];
  }

  return (data as MenuItem[] || []).map((item) => ({
    ...item,
    is_today_special: true,
  }));
}

/**
 * Fetch top Best Selling Items based on RPC calculation with a fallback query.
 */
export async function fetchBestSellingItems(limit = 6, days = 30): Promise<MenuItem[]> {
  try {
    // 1. Attempt to invoke the Postgres RPC get_best_selling_menu_items
    const { data: stats, error: rpcError } = await (supabase as any).rpc('get_best_selling_menu_items', {
      p_limit: limit,
      p_days: days,
    });

    if (!rpcError && Array.isArray(stats) && stats.length > 0) {
      const itemIds = stats.map((s: BestSellerItemStat) => s.menu_item_id);
      
      const { data: menuItems, error: itemsError } = await (supabase as any)
        .from('menu_items')
        .select(`
          *,
          category:categories(*)
        `)
        .in('id', itemIds)
        .eq('is_available', true);

      if (!itemsError && menuItems) {
        // Map scores and preserve RPC ranking order
        const scoreMap = new Map(stats.map((s: BestSellerItemStat) => [s.menu_item_id, s.best_seller_score]));
        
        const ranked = (menuItems as MenuItem[])
          .map((item) => ({
            ...item,
            is_best_seller: true,
            best_seller_score: scoreMap.get(item.id) || 0,
          }))
          .sort((a, b) => (b.best_seller_score || 0) - (a.best_seller_score || 0));

        return ranked;
      }
    }

    // 2. Fallback: Aggregate order_items from past 30 days if RPC not created yet
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data: rawItems, error: fallbackError } = await (supabase as any)
      .from('order_items')
      .select('menu_item_id, quantity, total_price, order:orders!inner(status, created_at)')
      .eq('order.status', 'completed')
      .gte('order.created_at', cutoffDate);

    if (fallbackError || !rawItems || rawItems.length === 0) {
      return [];
    }

    // Group sales quantity per menu item
    const itemQtyMap: Record<string, number> = {};
    rawItems.forEach((ri: any) => {
      if (ri.menu_item_id) {
        itemQtyMap[ri.menu_item_id] = (itemQtyMap[ri.menu_item_id] || 0) + (ri.quantity || 1);
      }
    });

    const sortedIds = Object.entries(itemQtyMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id);

    if (sortedIds.length === 0) return [];

    const { data: fallbackMenuItems } = await (supabase as any)
      .from('menu_items')
      .select(`
        *,
        category:categories(*)
      `)
      .in('id', sortedIds)
      .eq('is_available', true);

    return ((fallbackMenuItems as MenuItem[]) || []).map((item) => ({
      ...item,
      is_best_seller: true,
    }));
  } catch (err: any) {
    console.warn('Best selling calculation fallback:', err.message);
    return [];
  }
}
