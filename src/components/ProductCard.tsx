import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Eye, ShoppingCart, Star, AlertTriangle, PackageCheck, Zap, Clock, Truck } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onQuickCheckout?: (product: Product) => void;
  key?: string | number;
}

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onViewDetails,
  onQuickCheckout
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [minutes, setMinutes] = useState(14);
  const [seconds, setSeconds] = useState(42);

  // Simple simulated countdown for FOMO Flash Sale
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev === 0) {
          setMinutes(m => (m === 0 ? 15 : m - 1));
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseLeaveImage = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      onAddToCart(product);
    }
  };

  const handleQuickCheckout = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock && onQuickCheckout) {
      onQuickCheckout(product);
    }
  };

  const hasDiscount = !!product.discountPercentage && product.discountPercentage > 0;
  const discountedPrice = hasDiscount 
    ? Math.floor(product.price * (1 - product.discountPercentage! / 100))
    : product.price;

  const formattedPrice = discountedPrice.toLocaleString('vi-VN') + '\u00a0đ';
  const formattedOriginalPrice = product.price.toLocaleString('vi-VN') + '\u00a0đ';

  // Determine which image to show based on hover and gallery availability
  const hasGallery = product.galleryImages && product.galleryImages.length > 0;
  const activeImage = (isHovered && hasGallery) ? product.galleryImages![0] : product.imageUrl;
  
  return (
    <div 
      className="bg-white border border-zinc-150/90 rounded-2xl overflow-hidden group hover:border-[#f43f5e]/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col h-full relative"
      id={`product-card-${product.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Stage - Pristine & Clean */}
      <div 
        className="relative aspect-square w-full bg-zinc-50 overflow-hidden cursor-pointer"
        onClick={() => onViewDetails(product)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeaveImage}
        title="Bấm để xem chi tiết & tương tác còi đèn ô tô"
      >
        <img
          src={activeImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-150 ease-out"
          style={zoomStyle}
        />

        {/* Scale Badge Overlay */}
        <div className="absolute top-2.5 left-2.5 z-20 flex gap-1.5 items-center pointer-events-none select-none">
          <span className="bg-red-500 text-white font-black px-2 py-0.5 rounded-lg text-[9px] uppercase shadow-md border border-white/10 tracking-wide">
            {product.scale}
          </span>
        </div>

        {/* Free Shipping Badge Overlay */}
        <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none select-none">
          <span className="bg-emerald-600 text-white font-black px-2 py-0.5 rounded-lg text-[8.5px] uppercase shadow-md border border-white/10 tracking-wider flex items-center gap-1">
            <Truck className="w-3 h-3 text-white shrink-0" />
            <span>Freeship</span>
          </span>
        </div>
        
        {/* Subtle, highly realistic bottom shadow gradient for natural depth */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0c0c0e]/15 to-transparent pointer-events-none" />

        {/* High revenue instant-checkout button - Only overlayed when mouse hovered */}
        {!isOutOfStock && onQuickCheckout && (
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-15">
            <button
               onClick={handleQuickCheckout}
              className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all active:scale-95 shadow-md flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-white" />
              CHỐT NGAY ⚡
            </button>
          </div>
        )}
      </div>

      {/* Product Content Block - High Density, Compact & Neat */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 text-left bg-white">
        
        {/* Meta Info Rows - Highly Structured for Zero Wrapping & Premium Appeal */}
        <div className="flex flex-col gap-1 mb-2 text-[10px] font-mono">
          <div className="flex items-center justify-between gap-1.5">
            {/* Brand - Span entire width of its row to avoid truncation */}
            <div className="text-[9.5px] font-black text-zinc-500 uppercase tracking-wider truncate max-w-[65%]">
              {product.brand}
            </div>
            
            {/* Stock State - guaranteed space */}
            <div className="shrink-0 font-sans text-[9px] font-black">
              {isOutOfStock ? (
                <span className="text-zinc-550 bg-zinc-100 px-1.5 py-0.5 rounded uppercase border border-zinc-200/50">HẾT HÀNG</span>
              ) : isLowStock ? (
                <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded uppercase border border-rose-100 animate-pulse">CÒN {product.stock} XE</span>
              ) : (
                <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase border border-emerald-100">KHO: {product.stock}</span>
              )}
            </div>
          </div>
        </div>

        {/* Product Title / Name */}
        <h3 
          onClick={() => onViewDetails(product)}
          className="text-xs sm:text-sm font-semibold text-zinc-800 hover:text-red-500 cursor-pointer min-h-[16px] sm:min-h-[40px] truncate sm:line-clamp-2 sm:whitespace-normal transition-all uppercase tracking-tight duration-300 leading-tight"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Rating star & Discount badge inline - Clean & anti-wrapping */}
        <div className="flex items-center justify-between gap-1.5 mt-2 mb-2.5">
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span className="text-[10px] sm:text-[10.5px] text-zinc-700 font-mono font-bold leading-none">
              {product.rating}
            </span>
            <span className="text-[9px] text-zinc-400 font-mono leading-none">
              ({product.reviewsCount})
            </span>
          </div>

          {/* Discount marker stays strictly on the right, no wrap */}
          {hasDiscount && (
            <span 
              className="bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded text-[8.5px] font-extrabold shrink-0"
              title={`Giảm ${product.discountPercentage}%`}
            >
              Giảm {product.discountPercentage}%
            </span>
          )}
        </div>

        {/* Pricing tag and Add-to-cart button */}
        <div className="mt-auto pt-2 border-t border-zinc-100 flex items-center justify-between gap-2 overflow-hidden">
          <div className="text-left shrink-0">
            {hasDiscount ? (
              <div className="flex flex-col">
                <span className="text-[9px] text-zinc-400 line-through font-mono leading-none">
                  {formattedOriginalPrice}
                </span>
                <span className="text-xs sm:text-sm font-black text-red-600 font-mono mt-0.5 leading-none">
                  {formattedPrice}
                </span>
              </div>
            ) : (
              <span className="text-xs sm:text-sm font-black text-red-600 font-mono leading-none">
                {formattedPrice}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-1.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-xl flex items-center gap-1 transition-all uppercase cursor-pointer ${
              isOutOfStock
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200/50'
                : 'bg-red-500 hover:bg-red-400 text-white active:scale-95 shadow-md shadow-red-500/10'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thêm</span>
          </button>
        </div>
      </div>
    </div>
  );
}
