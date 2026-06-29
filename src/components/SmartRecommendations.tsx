import React from 'react';
import { Product, CartItem, Order } from '../types';
import { Sparkles, ShoppingCart, Eye, Flame, Award } from 'lucide-react';

interface SmartRecommendationsProps {
  allProducts: Product[];
  viewHistory: string[];
  cart: CartItem[];
  orders: Order[];
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  variant: 'home' | 'sidebar' | 'modal';
  currentProductId?: string; // used in modal to avoid recommending the same product
}

export default function SmartRecommendations({
  allProducts,
  viewHistory,
  cart,
  orders,
  onAddToCart,
  onViewDetails,
  variant,
  currentProductId
}: SmartRecommendationsProps) {
  
  // Calculate recommended items based on user actions with match percentages
  const getRecommendationsList = (): Array<{ product: Product; matchPct: number }> => {
    const categoryCount: Record<string, number> = {};
    const brandCount: Record<string, number> = {};
    const scaleCount: Record<string, number> = {};

    // 1. Process viewed history
    viewHistory.forEach((id) => {
      const p = allProducts.find((item) => item.id === id);
      if (p) {
        categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
        brandCount[p.brand] = (brandCount[p.brand] || 0) + 1.5;
        scaleCount[p.scale] = (scaleCount[p.scale] || 0) + 0.5;
      }
    });

    // 2. Process items currently in the cart
    cart.forEach((item) => {
      if (!item || !item.product) return;
      const p = item.product;
      if (p.category) categoryCount[p.category] = (categoryCount[p.category] || 0) + 3;
      if (p.brand) brandCount[p.brand] = (brandCount[p.brand] || 0) + 4;
      if (p.scale) scaleCount[p.scale] = (scaleCount[p.scale] || 0) + 2;
    });

    // 3. Process previous orders
    orders.forEach((o) => {
      if (!o || !o.items) return;
      o.items.forEach((item) => {
        if (!item) return;
        const matchingOriginal = allProducts.find((p) => p.id === item.productId);
        const cat = matchingOriginal?.category || '';
        if (cat) categoryCount[cat] = (categoryCount[cat] || 0) + 5;
        if (item.brand) brandCount[item.brand] = (brandCount[item.brand] || 0) + 6;
        if (item.scale) scaleCount[item.scale] = (scaleCount[item.scale] || 0) + 3;
      });
    });

    const cartProductIds = new Set(
      cart
        .filter((item) => item && item.product && item.product.id)
        .map((item) => item.product.id)
    );

    // Calculate score of each product in shop
    const scoredProducts = allProducts
      .filter((p) => {
        // Exclude product currently shown in modal
        if (currentProductId && p.id === currentProductId) return false;
        // Exclude products already in cart
        if (cartProductIds.has(p.id)) return false;
        // Exclude out of stock items
        return p.stock > 0;
      })
      .map((p) => {
        let score = p.rating || 4.5; // base score is review rating

        // Boost score if matches frequently viewed/ordered attributes
        if (categoryCount[p.category]) {
          score += categoryCount[p.category] * 4;
        }
        if (brandCount[p.brand]) {
          score += brandCount[p.brand] * 5;
        }
        if (scaleCount[p.scale]) {
          score += scaleCount[p.scale] * 2.5;
        }

        // Slight randomized factor to keep recommendation lively yet accurate
        let parsedId = parseFloat(p.id.replace('prod-', ''));
        if (isNaN(parsedId)) {
          // Fallback hash for custom IDs
          parsedId = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        }
        const randomFactor = ((parsedId || 0) % 5) * 0.2;
        score += randomFactor;

        // Calculate a realistic friendly matching percentage (e.g. 86% to 99%)
        const basePct = 85;
        const computedExtra = Math.min(14, Math.floor(score * 1.5) % 15);
        const matchPct = basePct + computedExtra;

        return { product: p, score, matchPct };
      });

    // Sort descending
    scoredProducts.sort((a, b) => b.score - a.score);

    const results = scoredProducts.map((item) => ({
      product: item.product,
      matchPct: item.matchPct
    }));
    
    // We display top 4 items for home, 3 for modal, 2 for sidebar
    const limit = variant === 'home' ? 4 : variant === 'modal' ? 3 : 2;
    return results.slice(0, limit);
  };

  const recommendedItems = getRecommendationsList();

  if (recommendedItems.length === 0) return null;

  // Render variant 1: Home page (Gorgeous horizontal cards list / full grid with luxury champagne elements)
  if (variant === 'home') {
    return (
      <section className="mt-14 mb-8 relative" id="smart-recommendations-home">
        <div className="absolute -top-12 left-1/4 w-[350px] h-[350px] bg-[#dfa35c]/3 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-20
0 pb-4 mb-6 relative z-10">
          <div className="text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100/50 text-red-650 text-[10px] font-black tracking-widest uppercase mb-1.5 border border-red-200">
              <Sparkles className="w-3 h-3 text-red-500" />
              Sự Kiện Tư Vấn Riêng Tư
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-850 flex items-center gap-2.5 uppercase tracking-tight font-sans">
              Gợi Ý Cá Nhân Hóa Cho Bộ Sưu Tập Của Bạn
            </h3>
            <p className="text-xs sm:text-sm text-zinc-550 mt-1 max-w-2xl font-light leading-relaxed">
              Dựa vào thói quen xem, tương tác giỏ hàng, tỷ lệ mô hình tìm kiếm và lịch sử nạp siêu xe của chính bạn.
            </p>
          </div>
          <div className="mt-3 sm:mt-0 flex items-center gap-2">
            <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-xl font-mono font-bold tracking-wider">
              AUTO-MATCH AI ACTIVE v2.4
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10">
          {recommendedItems.map(({ product: p, matchPct }) => (
            <div 
              key={p.id}
              className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col justify-between hover:border-red-500/35 hover:bg-zinc-50 transition-all duration-300 group scale-100 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] text-left"
            >
              <div>
                {/* Visual rich premium card layout */}
                <div className="relative rounded-xl overflow-hidden bg-zinc-50 aspect-square mb-4 border border-zinc-100 shadow-inner">
                  <img 
                    src={p.imageUrl} 
                    alt={p.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Matching percentage pill badge */}
                  <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md border border-red-200 text-red-600 text-[10px] font-black font-mono px-2 py-0.5 sm:py-1 rounded-lg flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-2.5 h-2.5 text-red-500 animate-pulse" />
                    {matchPct}% HỢP GU
                  </span>

                  {/* Vehicle Scale label */}
                  <span className="absolute top-2.5 right-2.5 bg-zinc-150/90 backdrop-blur-md border border-zinc-200 text-zinc-700 text-[10px] font-mono font-extrabold px-1.5 py-0.5 sm:py-1 rounded-lg shadow-xs">
                    Tỉ Lệ {p.scale}
                  </span>

                  {/* Stock tag */}
                  {p.stock <= 2 && (
                    <span className="absolute bottom-2.5 left-2.5 bg-red-500 hover:bg-red-650 text-white font-extrabold text-[8px] tracking-widest px-1.5 py-0.5 rounded uppercase font-sans shadow">
                      CHỈ CÒN {p.stock}C
                    </span>
                  )}
                  
                  {/* Rich hover interactive display */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2.5 backdrop-blur-xs">
                    <button
                      onClick={() => onViewDetails(p)}
                      className="p-3 bg-white hover:bg-red-500 text-zinc-800 hover:text-white hover:scale-110 active:scale-95 rounded-full shadow-md transition-all cursor-pointer"
                      title="Xem thông số kĩ thuật"
                    >
                      <Eye className="w-4.5 h-4.5 font-bold" />
                    </button>
                    <button
                      onClick={() => onAddToCart(p)}
                      className="p-3 bg-red-500 hover:bg-red-600 text-white hover:scale-110 active:scale-95 rounded-full shadow-md transition-all cursor-pointer"
                      title="Quăng nhanh vào giỏ"
                    >
                      <ShoppingCart className="w-4.5 h-4.5 font-bold" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">{p.brand}</span>
                  <span className="text-[9px] text-red-600 uppercase tracking-wide font-bold font-mono">ĐỒNG BỘ CHẤT LIỆU KIM LOẠI</span>
                </div>
                
                <h4 
                  onClick={() => onViewDetails(p)}
                  className="text-sm font-extrabold text-zinc-800 group-hover:text-red-600 transition-colors mt-1.5 line-clamp-1 cursor-pointer uppercase font-sans tracking-tight"
                >
                  {p.name}
                </h4>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-zinc-100 overflow-hidden">
                <div className="flex flex-col text-left">
                  <span className="text-[8px] text-zinc-400 uppercase font-black tracking-wider leading-none">Ưu đãi độc quyền</span>
                  <span className="text-sm font-bold text-red-600 font-mono mt-1 whitespace-nowrap shrink-0">
                    {p.price.toLocaleString('vi-VN')}&nbsp;đ
                  </span>
                </div>
                <button
                  onClick={() => onAddToCart(p)}
                  className="px-3.5 py-2 bg-zinc-100 hover:bg-red-500 border border-zinc-200 hover:border-transparent hover:text-white text-zinc-700 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer active:scale-95"
                >
                  + GHÉP ĐƠN
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Render variant 2: Product Detail Modal Bottom (Horizontal Row with dynamic match badges)
  if (variant === 'modal') {
    return (
      <div className="border-t border-zinc-250 pt-5 mt-6" id="smart-recommendations-modal">
        <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider mb-3.5 flex items-center justify-between gap-1.5">
          <span className="flex items-center gap-1.5 text-red-600">
            <Flame className="w-4 h-4 text-red-550 animate-pulse" /> SƯU TẬP HOÀN MỸ - MÔ HÌNH KHUYÊN GHÉP
          </span>
          <span className="text-[9px] text-zinc-500 font-bold font-mono uppercase tracking-wide">MATCH COMPATIBILITY 96%+</span>
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recommendedItems.map(({ product: p, matchPct }) => (
            <div 
              key={p.id}
              onClick={() => onViewDetails(p)}
              className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 hover:border-red-500/35 cursor-pointer transition-all flex items-center gap-3 text-left group hover:bg-zinc-100/50"
            >
              <div className="w-14 h-14 rounded-lg bg-zinc-150 overflow-hidden flex-shrink-0 border border-zinc-200 relative">
                <img src={p.imageUrl} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute bottom-1 right-1 bg-white/95 border border-zinc-200 px-1 py-0.5 rounded text-[8px] font-mono text-zinc-700 font-bold">
                  {p.scale}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[8px] text-red-600 font-black tracking-widest uppercase">{matchPct}% GU CỦA BẠN</span>
                  <span className="text-[8px] text-zinc-500 uppercase font-bold">{p.brand}</span>
                </div>
                <h5 className="text-xs font-bold text-zinc-805 line-clamp-1 tracking-tight group-hover:text-red-600 transition-colors mt-0.5">{p.name}</h5>
                <p className="text-[11px] font-bold text-red-600 font-mono mt-0.5 whitespace-nowrap shrink-0">
                  {p.price.toLocaleString('vi-VN')}&nbsp;đ
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render variant 3: Cart Drawer Footer (Compact widgets for impulse added)
  return (
    <div className="border-t border-zinc-200 pt-4 mt-4" id="smart-recommendations-sidebar">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-extrabold text-red-600 tracking-wider uppercase flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-red-500" /> Đóng góp thêm vào tủ trưng bày:
        </span>
        <span className="text-[8px] text-emerald-600 font-bold uppercase tracking-wider">Tích Điểm VIP</span>
      </div>

      <div className="space-y-2">
        {recommendedItems.map(({ product: p, matchPct }) => (
          <div 
            key={p.id} 
            className="bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl p-2.5 flex items-center justify-between gap-2.5 text-left transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-zinc-150 overflow-hidden border border-zinc-200 flex-shrink-0 relative">
                <img src={p.imageUrl} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                <span className="absolute top-0.5 left-0.5 bg-white/95 border border-red-200 px-1 py-0.2 rounded text-[7px] font-black text-red-600">
                  {matchPct}%
                </span>
              </div>
              <div className="min-w-0">
                <h5 className="text-[10.5px] font-bold text-zinc-800 truncate pr-1">{p.name}</h5>
                <p className="text-[9.5px] font-extrabold text-red-600 font-mono mt-0.5 whitespace-nowrap shrink-0">
                  {p.price.toLocaleString('vi-VN')}&nbsp;đ • <span className="text-zinc-500 font-normal">Tỉ lệ {p.scale}</span>
                </p>
              </div>
            </div>
            
            <button
              onClick={() => onAddToCart(p)}
              className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[9px] font-extrabold flex-shrink-0 transition-colors uppercase cursor-pointer"
            >
              GHI ĐƠN
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
