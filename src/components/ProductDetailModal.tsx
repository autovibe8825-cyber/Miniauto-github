import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, Order } from '../types';
import { X, Star, Calendar, RefreshCw, Layers, Sparkles, MessageCircle, ShoppingCart, Volume2, Scale, Play, Video, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import SmartRecommendations from './SmartRecommendations';
import { getSharedAudioContext } from '../utils/audio';

const ensureArray = (val: any): any[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
};

const getGalleryImages = (p: Product): string[] => {
  // Category-specific rich cinematic detailed fallback images
  const supercarFallbacks = [
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80", // Alloy rim detail
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80", // Porsche wing structure
    "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800&q=80", // Carbon side skirt
    "https://images.unsplash.com/photo-1600706432502-75a0e2b42907?w=800&q=80", // Headlight crystal reflection
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80", // Cockpit sports toggle
    "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&q=80", // Rear dual exhaust diffusers
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80", // Performance brakes
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80"  // Exposed rear engine bay
  ];

  const suvFallbacks = [
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80", // Heavy offroad treads
    "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800&q=80", // Rugged steel gear-rack
    "https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?w=800&q=80", // High lift suspensions
    "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=800&q=80", // Luxurious leather layout
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80", // Heavy cargo backdoor
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80", // Twin shock absorbers
    "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80"  // Quad beams
  ];

  const jdmFallbacks = [
    "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&q=80", // Customized engine bay layout
    "https://images.unsplash.com/photo-1612462288029-28cd47a2845a?w=800&q=80", // Sleek carbon hoods
    "https://images.unsplash.com/photo-1617469767053-d3b503a0b16c?w=800&q=80", // Custom drift titanium tip
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80", // BBS forged deep dish disc
    "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80", // High-support Recaro bucket seats
    "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&q=80"  // Drifting spoilers
  ];

  const classicFallbacks = [
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80", // Authentic wood-rim wheel
    "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80", // Sleek chrome engine grille
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80", // Vintage dashboard meters
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80", // Classic spokes trim
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80"  // Elegant door handles
  ];

  let chosenFallbacks = supercarFallbacks;
  if (p.category === 'suv') chosenFallbacks = suvFallbacks;
  else if (p.category === 'jdm') chosenFallbacks = jdmFallbacks;
  else if (p.category === 'classic') chosenFallbacks = classicFallbacks;

  const list = ensureArray(p.galleryImages);
  const result = [...list];
  while (result.length < 9) {
    result.push(chosenFallbacks[result.length % chosenFallbacks.length]);
  }
  return result.slice(0, 9);
};

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  allProducts: Product[];
  viewHistory: string[];
  cart: CartItem[];
  orders: Order[];
  onViewProductDetails: (product: Product) => void;
  syncEngineStatus?: 'off' | 'starting' | 'running';
  syncCompareObject?: 'iphone' | 'bankcard' | 'sodacan';
  syncIsFlashing?: boolean;
  onUpdateSyncEngineStatus?: (status: 'off' | 'starting' | 'running') => void;
  onUpdateSyncCompareObject?: (obj: 'iphone' | 'bankcard' | 'sodacan') => void;
  onUpdateSyncIsFlashing?: (val: boolean) => void;
}

export default function ProductDetailModal({ 
  product, 
  onClose, 
  onAddToCart,
  allProducts,
  viewHistory,
  cart,
  orders,
  onViewProductDetails,
  syncEngineStatus,
  syncCompareObject,
  syncIsFlashing,
  onUpdateSyncEngineStatus,
  onUpdateSyncCompareObject,
  onUpdateSyncIsFlashing
}: ProductDetailModalProps) {
  const getInitialReviewsForProduct = (p: Product) => {
    return [
      { 
        author: 'Trần Minh Quân', 
        rating: 5, 
        date: '10/06/2026', 
        content: `Mô hình ${p.name} tỷ lệ ${p.scale} quá đẹp! Xe đúc nguyên khối siêu nặng và đầm tay, sơn tĩnh điện bóng bảy sờ sướng cực kì.` 
      },
      { 
        author: 'Nguyễn Toàn Võ', 
        rating: 5, 
        date: '08/06/2026', 
        content: `Đóng gói cực ôm cực chắc chắn, 2 lớp hộp chống móp méo tuyệt đối. Chi tiết của hãng xe ${p.brand} chế tác quá đẳng cấp, bẻ vô lăng mượt mà.` 
      },
      { 
        author: 'Lê Thu Thảo', 
        rating: 4, 
        date: '25/05/2026', 
        content: `Giao bưu phẩm cực kỳ nguyên vẹn, bọc xốp bọt bóng cẩn thận. Ngoại hình mô hình của hãng ${p.brand} trưng bày góc tủ kính phòng khách siêu sang luôn.` 
      }
    ];
  };

  const [reviews, setReviews] = useState<Array<{ author: string; rating: number; date: string; content: string }>>([]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isFullFrame, setIsFullFrame] = useState(true);

  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});

  const handleMouseMoveDetail = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeMedia.type !== 'image') return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.2)'
    });
  };

  const handleMouseLeaveDetail = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  // Advanced Interactive features states (With optional remote-control synchronization fallbacks)
  const [localEngineStatus, setLocalEngineStatus] = useState<'off' | 'starting' | 'running'>('off');
  const [localCompareObject, setLocalCompareObject] = useState<'iphone' | 'bankcard' | 'sodacan'>('iphone');
  const [localIsFlashing, setLocalIsFlashing] = useState(false);

  const engineStatus = syncEngineStatus !== undefined ? syncEngineStatus : localEngineStatus;
  const setEngineStatus = (status: 'off' | 'starting' | 'running') => {
    if (onUpdateSyncEngineStatus) onUpdateSyncEngineStatus(status);
    setLocalEngineStatus(status);
  };

  const compareObject = syncCompareObject !== undefined ? syncCompareObject : localCompareObject;
  const setCompareObject = (obj: 'iphone' | 'bankcard' | 'sodacan') => {
    if (onUpdateSyncCompareObject) onUpdateSyncCompareObject(obj);
    setLocalCompareObject(obj);
  };

  const isFlashing = syncIsFlashing !== undefined ? syncIsFlashing : localIsFlashing;
  const setIsFlashing = (val: boolean) => {
    if (onUpdateSyncIsFlashing) onUpdateSyncIsFlashing(val);
    setLocalIsFlashing(val);
  };
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video'; url: string }>({
    type: 'image',
    url: product.imageUrl
  });
  const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'reviews' | 'related'>('info');

  // Compiled full lists of media for arrow navigation
  const allMediaList: Array<{ type: 'image' | 'video'; url: string }> = [
    { type: 'image', url: product.imageUrl },
    ...getGalleryImages(product).map(url => ({ type: 'image' as const, url })),
    { type: 'video', url: product.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-at-night-34449-large.mp4" }
  ];

  const currentMediaIndex = allMediaList.findIndex(
    (item) => item.type === activeMedia.type && item.url === activeMedia.url
  );

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allMediaList.length <= 1) return;
    const prevIdx = (currentMediaIndex - 1 + allMediaList.length) % allMediaList.length;
    setActiveMedia(allMediaList[prevIdx]);
  };

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allMediaList.length <= 1) return;
    const nextIdx = (currentMediaIndex + 1) % allMediaList.length;
    setActiveMedia(allMediaList[nextIdx]);
  };

  // Synthesize model car electronic horn sound (Dual tone high-pitched sine + gain envelope)
  const playHornSound = () => {
    try {
      const ctx = getSharedAudioContext();
      if (!ctx) {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 800);
        return;
      }

      setIsFlashing(true);
      const now = ctx.currentTime;

      // Two oscillators to create the discordant dual tone of a real car horn (e.g. 410Hz and 490Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      const masterGain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(410, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(490, now);

      gain1.gain.setValueAtTime(0.15, now);
      gain2.gain.setValueAtTime(0.15, now);

      masterGain.gain.setValueAtTime(0, now);
      // Double beep
      masterGain.gain.linearRampToValueAtTime(1, now + 0.05);
      masterGain.gain.setValueAtTime(1, now + 0.25);
      masterGain.gain.linearRampToValueAtTime(0, now + 0.28);

      masterGain.gain.linearRampToValueAtTime(1, now + 0.35);
      masterGain.gain.setValueAtTime(1, now + 0.60);
      masterGain.gain.linearRampToValueAtTime(0, now + 0.65);

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(masterGain);
      gain2.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.7);
      osc2.stop(now + 0.7);

      setTimeout(() => setIsFlashing(false), 700);
    } catch (e) {
      console.error(e);
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 800);
    }
  };

  const detailsContainerRef = useRef<HTMLDivElement>(null);

  // Play model engine exhaust sound simulation via Web Audio API Synthesis
  const playEngineSound = () => {
    try {
      const ctx = getSharedAudioContext();
      if (!ctx) {
        setEngineStatus('running');
        setTimeout(() => setEngineStatus('off'), 2000);
        return;
      }
      
      setEngineStatus('starting');
      const now = ctx.currentTime;
      
      // 1. Starter motor whirs (high pitch sawtooth)
      const starter = ctx.createOscillator();
      const starterGain = ctx.createGain();
      starter.type = 'sawtooth';
      starter.frequency.setValueAtTime(140, now);
      starter.frequency.exponentialRampToValueAtTime(320, now + 0.3);
      starterGain.gain.setValueAtTime(0.04, now);
      starterGain.gain.linearRampToValueAtTime(0, now + 0.35);
      
      starter.connect(starterGain);
      starterGain.connect(ctx.destination);
      starter.start(now);
      starter.stop(now + 0.35);
      
      // 2. Combustion cylinders rumble (sub sawtooth + bandpass filter)
      const engineOsc = ctx.createOscillator();
      const engineGain = ctx.createGain();
      engineOsc.type = 'sawtooth';
      
      // Starter finishes -> Engine fires, revs up, then bubbles at idle rumble
      engineOsc.frequency.setValueAtTime(35, now + 0.3);
      engineOsc.frequency.linearRampToValueAtTime(125, now + 0.6); // high rev
      engineOsc.frequency.exponentialRampToValueAtTime(48, now + 1.1); // idle down
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(90, now);
      filter.frequency.exponentialRampToValueAtTime(220, now + 0.7);
      filter.frequency.exponentialRampToValueAtTime(75, now + 1.3);
      filter.Q.value = 1.1;
      
      engineGain.gain.setValueAtTime(0, now);
      engineGain.gain.linearRampToValueAtTime(0.32, now + 0.3);
      engineGain.gain.exponentialRampToValueAtTime(0.42, now + 0.6);
      engineGain.gain.exponentialRampToValueAtTime(0.18, now + 1.2);
      engineGain.gain.linearRampToValueAtTime(0, now + 2.2);
      
      engineOsc.connect(filter);
      filter.connect(engineGain);
      engineGain.connect(ctx.destination);
      
      engineOsc.start(now);
      engineOsc.stop(now + 2.2);
      
      setTimeout(() => setEngineStatus('running'), 300);
      setTimeout(() => setEngineStatus('off'), 2200);
    } catch (e) {
      console.error(e);
      setEngineStatus('running');
      setTimeout(() => setEngineStatus('off'), 2000);
    }
  };

  // Reset and scroll back to top when product changes
  useEffect(() => {
    setReviews(getInitialReviewsForProduct(product));
    setActiveMedia({ type: 'image', url: product.imageUrl });
    if (detailsContainerRef.current) {
      detailsContainerRef.current.scrollTop = 0;
    }
  }, [product.id, product.imageUrl]);

  // Listen for remote sync events to trigger physical sounds
  const prevEngineStatusRef = useRef(syncEngineStatus);
  const prevIsFlashingRef = useRef(syncIsFlashing);

  useEffect(() => {
    if (syncEngineStatus === 'running' && prevEngineStatusRef.current !== 'running' && localEngineStatus === 'off') {
      playEngineSound();
    }
    prevEngineStatusRef.current = syncEngineStatus;
  }, [syncEngineStatus, localEngineStatus]);

  useEffect(() => {
    if (syncIsFlashing === true && prevIsFlashingRef.current !== true && !localIsFlashing) {
      playHornSound();
    }
    prevIsFlashingRef.current = syncIsFlashing;
  }, [syncIsFlashing, localIsFlashing]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAuthor.trim() && newContent.trim()) {
      setReviews([
        {
          author: newAuthor,
          rating: newRating,
          date: 'Hôm nay',
          content: newContent
        },
        ...reviews
      ]);
      setNewAuthor('');
      setNewContent('');
      setNewRating(5);
    }
  };

  const isOutOfStock = product.stock === 0;
  const productPrice = Number(product.price) || 0;
  const hasDiscount = !!product.discountPercentage && Number(product.discountPercentage) > 0;
  const discountedPrice = hasDiscount 
    ? Math.floor(productPrice * (1 - Number(product.discountPercentage)! / 100))
    : productPrice;

  const formattedPrice = (discountedPrice || 0).toLocaleString('vi-VN') + '\u00a0đ';
  const formattedOriginalPrice = (productPrice || 0).toLocaleString('vi-VN') + '\u00a0đ';

  const getScaleInCm = (s: string) => {
    if (s.includes('1:18')) return 26;
    if (s.includes('1:24')) return 18;
    if (s.includes('1:32')) return 14;
    if (s.includes('1:43')) return 10;
    if (s.includes('1:64')) return 7;
    return 15;
  };

  const modelSizeCm = getScaleInCm(product.scale);
  const compareSizeCm = compareObject === 'iphone' ? 14.6 : compareObject === 'bankcard' ? 8.5 : 12.2;
  const compareObjectName = compareObject === 'iphone' ? 'iPhone 15 Pro (~14.6cm)' : compareObject === 'bankcard' ? 'Thẻ ATM (~8.5cm)' : 'Lon Soda (~12.2cm)';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fade-in"
      id={`product-detail-modal-${product.id}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white border border-zinc-200 rounded-3xl text-zinc-805 shadow-2xl relative overflow-hidden flex flex-col w-full max-w-4xl h-[90vh] max-h-[90vh] md:h-[85vh] md:max-h-[85vh]">
        
        {/* 1. Constant Mobile Header with highly accessible Close Button (hidden on desktop) */}
        <div className="flex md:hidden items-center justify-between p-3.5 bg-zinc-50 border-b border-zinc-200 z-20 sticky top-0 shrink-0">
          <div className="text-left max-w-[65%]">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono font-extrabold leading-none block">CHI TIẾT MÔ HÌNH</span>
            <h4 className="text-xs font-black text-zinc-800 truncate mt-0.5 uppercase tracking-wide">{product.name}</h4>
          </div>
          <button 
            onClick={onClose}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 font-extrabold text-[11px] rounded-xl border border-red-250/60 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer touch-none"
            title="Đóng"
          >
            <X className="w-3.5 h-3.5" />
            <span>Đóng lại</span>
          </button>
        </div>

        {/* 2. Desktop Close Button (hidden on mobile) */}
        <button
          onClick={onClose}
          className="hidden md:flex absolute top-4 right-4 z-30 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full border border-zinc-200 text-zinc-600 hover:text-zinc-800 transition-all backdrop-blur-md cursor-pointer"
          id="close-detail-modal"
          title="Đóng chi tiết"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 3. Main contents wrapper: Single-scroller on mobile, dual column with sticky image on desktop */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
          
          {/* Left Side: Large Product Display / Photos & Interactive Gallery */}
          <div className="w-full md:w-1/2 bg-zinc-50 relative flex flex-col p-4 sm:p-5 shrink-0 md:border-r border-zinc-200 overflow-visible md:overflow-y-auto md:h-full">
            {/* Main view container */}
            <div 
              className="relative w-full aspect-square flex items-center justify-center bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-inner group"
              onMouseMove={handleMouseMoveDetail}
              onMouseLeave={handleMouseLeaveDetail}
            >
              {activeMedia.type === 'video' ? (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-contain rounded-xl"
                  id="detail-video-player"
                />
              ) : (
                <img
                  src={activeMedia.url}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full rounded-xl max-h-full transition-transform duration-150 ease-out cursor-zoom-in ${
                    isFullFrame ? 'object-cover' : 'object-contain'
                  }`}
                  style={zoomStyle}
                  id="detail-main-image"
                  onClick={() => setIsFullFrame(!isFullFrame)}
                />
              )}

              {/* Shopee-style Left/Right navigation arrows */}
              <button
                type="button"
                onClick={handlePrevMedia}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-[#dfa35c] text-white hover:text-black hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/10 opacity-70 md:opacity-0 md:group-hover:opacity-100 shadow-2xl cursor-pointer"
                aria-label="Hình ảnh trước"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                type="button"
                onClick={handleNextMedia}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-[#dfa35c] text-white hover:text-black hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/10 opacity-70 md:opacity-0 md:group-hover:opacity-100 shadow-2xl cursor-pointer"
                aria-label="Hình ảnh tiếp theo"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Dynamic Frame control buttons - Premium Luxury overlay */}
              {activeMedia.type === 'image' && (
                <button
                  type="button"
                  onClick={() => setIsFullFrame(!isFullFrame)}
                  className="absolute top-3 right-3 z-20 px-3 py-1.5 bg-black/80 hover:bg-black/95 text-white border border-white/10 rounded-xl text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1.5 transition-all backdrop-blur-md cursor-pointer active:scale-95 shadow-lg"
                  title="Bấm để thay đổi hiển thị: Đủ khung hình (Cover) hoặc Vừa vặn (Contain)"
                >
                  <Layers className={`w-3.5 h-3.5 transition-transform duration-300 ${isFullFrame ? 'text-[#dfa35c] rotate-180' : 'text-zinc-400'}`} />
                  <span>{isFullFrame ? "ĐỦ KHUNG HÌNH (LẤP ĐẦY)" : "VỪA VẶN (GÓC RỘNG)"}</span>
                </button>
              )}

              {/* Simulated Headlights Flashing system (only visible on photos) */}
              {isFlashing && activeMedia.type === 'image' && (
                <div className="absolute inset-0 bg-yellow-500/10 pointer-events-none rounded-xl flex items-center justify-between px-12 md:px-20 z-10 transition-opacity duration-150">
                  {/* Left headlight beam */}
                  <div className="w-16 h-16 rounded-full bg-yellow-300/40 blur-xl animate-ping" />
                  {/* Right headlight beam */}
                  <div className="w-16 h-16 rounded-full bg-yellow-300/40 blur-xl animate-ping" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5 z-10">
                <span className="bg-red-500 text-[9px] sm:text-[10px] font-extrabold text-white border border-red-600 px-2 py-0.5 rounded-md uppercase">
                  TỶ LỆ {product.scale}
                </span>
                <span className="bg-white/80 text-[9px] sm:text-[10px] font-bold text-zinc-800 border border-zinc-300 px-2 py-0.5 rounded-md backdrop-blur-md">
                  {product.brand}
                </span>
              </div>
            </div>

            {/* Thumbnail Navigation Rack (9 Pictures + 1 Video = 10 blocks) */}
            <div className="mt-4 text-left">
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Video className="w-3 h-3 text-zinc-500" /> Khung ảnh chi tiết góc độ (Bấm chọn 9 góc & Video):
              </span>
              
              <div className="grid grid-cols-5 gap-1.5">
                {/* 1. Main cover Image slot */}
                <button
                  type="button"
                  onClick={() => setActiveMedia({ type: 'image', url: product.imageUrl })}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeMedia.type === 'image' && activeMedia.url === product.imageUrl
                      ? 'border-red-500 scale-105 ring-2 ring-red-500/30'
                      : 'border-zinc-200 hover:border-zinc-400 hover:scale-102'
                  }`}
                  title="Ảnh đại diện"
                >
                  <img src={product.imageUrl} className="w-full h-full object-cover" alt="Avatar" />
                  <div className="absolute bottom-0.5 right-0.5 bg-black/80 px-1 text-[7px] text-zinc-350 rounded font-bold uppercase tracking-tighter">Đ.Diện</div>
                </button>

                {/* 2 to 9: Sub gallery images (at least 9 total clickable option pictures) */}
                {getGalleryImages(product).map((imgUrl, idx) => {
                  const isCurrent = activeMedia.type === 'image' && activeMedia.url === imgUrl && activeMedia.url !== product.imageUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveMedia({ type: 'image', url: imgUrl })}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        isCurrent
                          ? 'border-amber-500 scale-105 ring-2 ring-amber-500/30'
                          : 'border-zinc-200 hover:border-zinc-400 hover:scale-102'
                      }`}
                      title={`Ảnh chi tiết ${idx + 1}`}
                      id={`gallery-thumb-${idx + 1}`}
                    >
                      <img src={imgUrl} className="w-full h-full object-cover" alt={`Góc ${idx + 2}`} />
                      <div className="absolute bottom-0.5 right-0.5 bg-zinc-950/80 w-3 h-3 text-[7.5px] leading-tight text-center text-zinc-300 rounded-full font-bold">
                        {idx + 1}
                      </div>
                    </button>
                  );
                })}

                {/* 10. Ultimate Video showcase slot */}
                {(() => {
                  const targetVideoUrl = product.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-at-night-34449-large.mp4";
                  const isCurrentVideo = activeMedia.type === 'video';
                  return (
                    <button
                      type="button"
                      onClick={() => setActiveMedia({ type: 'video', url: targetVideoUrl })}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer bg-red-50 flex flex-col items-center justify-center ${
                        isCurrentVideo
                          ? 'border-red-500 scale-105 ring-2 ring-red-500/30'
                          : 'border-red-200 hover:border-red-400 hover:scale-102'
                      }`}
                      title="Xem Video mô phỏng đỉnh cao"
                      id="view-simulated-video-btn"
                    >
                      <img src={product.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" alt="" />
                      <div className="absolute inset-0 bg-red-100/40 pointer-events-none" />
                      <Play className="w-5 h-5 text-red-500 fill-current animate-pulse relative z-10" />
                      <span className="text-[7.5px] text-zinc-100 mt-0.5 font-extrabold uppercase bg-red-600/80 px-1 rounded relative z-10 tracking-tight">VIDEO HD</span>
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Right Side: Scrollable specs and functions details (scrollable on desktop) */}
          <div 
            ref={detailsContainerRef}
            className="w-full md:w-1/2 p-4 sm:p-6 overflow-visible md:overflow-y-auto md:h-full flex flex-col border-t md:border-t-0 border-zinc-200"
          >
          
          {/* Header */}
          <div className="mb-4">
            <span className="text-[10px] text-red-500 tracking-widest font-extrabold uppercase font-mono block md:hidden">
              Mô hình đúc chất lượng cao
            </span>
            <h2 className="text-xl md:text-2xl font-black text-zinc-900 mt-1 uppercase tracking-tight italic">{product.name}</h2>
            
            <div className="flex md:hidden items-center gap-2 mt-2">
              <div className="flex items-center text-red-500">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating) ? 'fill-current' : 'text-zinc-700'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs text-zinc-400">
                {product.rating} / 5.0 (Xem {reviews.length} lượt đánh giá)
              </span>
            </div>
          </div>

          {/* Price & Warehouse Stock information */}
          <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm text-left">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block">GIÁ CHÍNH THỨC</span>
              {hasDiscount ? (
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-400 line-through font-mono leading-none mb-1">
                    {formattedOriginalPrice}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-red-650 font-mono">
                      {formattedPrice}
                    </span>
                    <span className="text-[10px] font-black tracking-wider bg-amber-500 text-black px-1.5 py-0.5 rounded shadow-xs">
                      GIẢM {product.discountPercentage}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xl font-black text-red-650 font-mono mt-0.5">
                  {formattedPrice}
                </p>
              )}
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-zinc-200 pt-3 sm:pt-0 sm:pl-4 text-left sm:text-right flex flex-col justify-start sm:justify-end">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block mb-1.5">TÌNH TRẠNG KHO</span>
              <div>
                {isOutOfStock ? (
                  <span className="inline-flex text-xs px-2.5 py-1.5 bg-zinc-200 border border-zinc-300 text-zinc-650 rounded-lg font-bold">
                    Tạm hết hàng
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="inline-flex text-xs px-2.5 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg font-bold animate-pulse">
                    Chỉ còn {product.stock} chiếc cuối
                  </span>
                ) : (
                  <span className="inline-flex text-xs px-2.5 py-1.5 bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-lg font-extrabold">
                    Còn {product.stock} chiếc sẵn kho
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Purchase CTA button (Moved up for maximal desktop compact view & high accessibility) */}
          <button
            onClick={() => {
              if (!isOutOfStock) {
                onAddToCart(product);
                onClose();
              }
            }}
            disabled={isOutOfStock}
            className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all mb-4 uppercase tracking-wider ${
              isOutOfStock
                ? 'bg-zinc-150 text-zinc-400 cursor-not-allowed border border-zinc-200'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 active:scale-98 cursor-pointer'
            }`}
            id="detail-add-to-cart-cta"
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span>Thêm vào giỏ ({formattedPrice})</span>
          </button>

          {/* Premium Elegant Tabs Selector */}
          <div className="flex border-b border-zinc-200 mb-4 sticky top-0 bg-white z-10 py-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveDetailTab('info');
                if (detailsContainerRef.current) detailsContainerRef.current.scrollTop = 0;
              }}
              className={`flex-1 pb-2 text-[11px] font-black uppercase tracking-wider border-b-2 text-center transition-all cursor-pointer ${
                activeDetailTab === 'info'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
              }`}
            >
              Cơ Chế & Khối Kích
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveDetailTab('reviews');
                if (detailsContainerRef.current) detailsContainerRef.current.scrollTop = 0;
              }}
              className={`flex-1 pb-2 text-[11px] font-black uppercase tracking-wider border-b-2 text-center transition-all cursor-pointer ${
                activeDetailTab === 'reviews'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
              }`}
            >
              Đánh Giá ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveDetailTab('related');
                if (detailsContainerRef.current) detailsContainerRef.current.scrollTop = 0;
              }}
              className={`flex-1 pb-2 text-[11px] font-black uppercase tracking-wider border-b-2 text-center transition-all cursor-pointer ${
                activeDetailTab === 'related'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
              }`}
            >
              Gợi Ý Sưu Tầm
            </button>
          </div>

          {/* Active Tab contents */}
          <div className="flex-1 min-h-0">
            {activeDetailTab === 'info' && (
              <div className="space-y-4 animate-fade-in">
                {/* Description */}
                <div className="text-xs text-zinc-650 leading-relaxed text-left">
                  <h4 className="font-extrabold text-zinc-850 flex items-center gap-1.5 mb-1.5">
                    <Layers className="w-4 h-4 text-red-500" /> Giới thiệu mô hình
                  </h4>
                  <p className="whitespace-pre-line leading-relaxed text-zinc-600">{product.description}</p>
                </div>

                {/* Features bullet checklist */}
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-left" id="features-highlights">
                  <h4 className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Đặc điểm và Cơ chế hoạt động
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-650">
                    {ensureArray(product.features).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5 select-none">✔</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* TRẢI NGHIỆM ĐỘNG CƠ & QUY ĐỔI TỶ LỆ */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left shadow-xs" id="collector-playground">
                  <h4 className="text-xs font-black text-red-600 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Giả Lập Chủ Xe Collectors
                  </h4>
                  
                  <div className="space-y-4 text-xs">
                    {/* Feature 1: Simulated Electronic Sound & Lights dashboard */}
                    <div className="bg-white border border-zinc-150 rounded-xl p-3 flex flex-col gap-3 shadow-xs">
                      <div className="space-y-0.5 text-left pb-2 border-b border-zinc-100">
                        <p className="font-extrabold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                          <Volume2 className="w-3.5 h-3.5 text-blue-500" /> Hệ Thống Điện Tử Mô Phỏng
                        </p>
                        <p className="text-[10px] text-zinc-400 font-medium">Bấm tương tác thử nghiệm còi, đèn và ống xả của báu vật mô hình</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        <button
                          type="button"
                          onClick={playEngineSound}
                          disabled={engineStatus !== 'off'}
                          className={`px-3 py-2 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer active:scale-95 ${
                            engineStatus === 'starting'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-300'
                              : engineStatus === 'running'
                              ? 'bg-red-500 text-white border border-red-600 animate-pulse font-extrabold'
                              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300'
                          }`}
                        >
                          {engineStatus === 'starting' && <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />}
                          {engineStatus === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                          {engineStatus === 'off' && <Volume2 className="w-3 h-3" />}
                          <span>
                            {engineStatus === 'starting'
                              ? 'Đang đề máy...'
                              : engineStatus === 'running'
                              ? 'VROOOOM (Gầm rú!)'
                              : 'Khởi động động cơ'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={playHornSound}
                          disabled={isFlashing}
                          className={`px-3 py-2 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer active:scale-95 ${
                            isFlashing
                              ? 'bg-yellow-550 text-zinc-950 border border-yellow-600 animate-pulse font-extrabold'
                              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300'
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-yellow-600" />
                          <span>{isFlashing ? 'Còi xe & Nháy đèn!' : 'Bóp còi & Nháy đèn'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Feature 2: Dimensions comparator slider */}
                    <div className="bg-white border border-zinc-150 rounded-xl p-3 text-left shadow-xs">
                      <p className="font-extrabold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide mb-2">
                        <Scale className="w-3.5 h-3.5 text-emerald-500" /> Thước Đo Tỷ Lệ {product.scale}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">So với:</span>
                        {['iphone', 'bankcard', 'coke'].map((obj) => (
                          <button
                            key={obj}
                            type="button"
                            onClick={() => setCompareObject(obj as any)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                              compareObject === obj
                                ? 'bg-zinc-800 text-white border border-zinc-500 font-extrabold shadow-sm'
                                : 'bg-zinc-100 text-zinc-505 hover:text-zinc-800 hover:bg-zinc-200'
                            }`}
                          >
                            {obj === 'iphone' ? 'Phone' : obj === 'bankcard' ? 'Thẻ ATM' : 'Lon Coca'}
                          </button>
                        ))}
                      </div>

                      {/* Bars */}
                      <div className="space-y-3 bg-zinc-100 p-2.5 rounded-lg border border-zinc-200">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-700 font-bold truncate max-w-[70%]">{product.name} ({product.scale})</span>
                            <span className="text-red-650 font-mono font-bold shrink-0">{modelSizeCm}cm</span>
                          </div>
                          <div className="h-2 rounded bg-zinc-200 w-full overflow-hidden relative">
                            <div 
                              className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded transition-all duration-500" 
                              style={{ width: `${Math.min(100, (modelSizeCm / 32) * 100)}%` }} 
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-500 font-medium truncate max-w-[70%]">{compareObjectName}</span>
                            <span className="text-zinc-500 font-mono font-bold shrink-0">{compareSizeCm}cm</span>
                          </div>
                          <div className="h-2 rounded bg-zinc-200 w-full overflow-hidden relative">
                            <div 
                              className="h-full bg-zinc-400 rounded transition-all duration-500" 
                              style={{ width: `${Math.min(100, (compareSizeCm / 32) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeDetailTab === 'reviews' && (
              <div className="space-y-4 animate-fade-in">
                {/* Interactive Customer Reviews */}
                <div className="text-left">
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-3 flex items-center gap-1.5 py-1">
                    <MessageCircle className="w-4 h-4 text-red-500" /> Đánh Giá Từ Nhà Sưu Tầm ({reviews.length})
                  </h4>

                  {/* List */}
                  <div className="space-y-3 mb-5 max-h-[180px] overflow-y-auto pr-1">
                    {reviews.map((rev, idx) => (
                      <div key={idx} className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-zinc-800">{rev.author}</span>
                          <span className="text-[10px] text-zinc-500">{rev.date}</span>
                        </div>
                        <div className="flex items-center text-red-500 mb-1.5">
                          {[...Array(5)].map((_, starI) => (
                            <Star key={starI} className={`w-3 h-3 ${starI < rev.rating ? 'fill-current mr-0.5' : 'text-zinc-300 mr-0.5'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-zinc-650 leading-relaxed">{rev.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Review form */}
                  <form onSubmit={handleReviewSubmit} className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 text-left">
                    <p className="text-[11px] font-bold text-zinc-650 mb-2.5">Đăng đánh giá của bạn:</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
                      <input
                        type="text"
                        required
                        placeholder="Tên nhà sưu tầm"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        className="bg-white border border-zinc-200 text-xs px-3 py-2 rounded-lg text-zinc-850 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-[10px] text-zinc-550 font-bold">Điểm số:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <button
                              type="button"
                              key={starVal}
                              onClick={() => setNewRating(starVal)}
                              className="p-0.5 cursor-pointer"
                            >
                              <Star className={`w-4 h-4 ${starVal <= newRating ? 'text-red-500 fill-current' : 'text-zinc-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <textarea
                      required
                      rows={2}
                      placeholder="Nhận xét sâu hơn về sơn xe, động cơ, lốp hoặc độ đầm tay..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full bg-white border border-zinc-200 text-xs px-3 py-2 rounded-lg text-zinc-850 focus:outline-none focus:ring-1 focus:ring-red-500 mb-2.5"
                    />

                    <button
                      type="submit"
                      className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-xs text-white font-extrabold rounded-lg transition-all border border-zinc-800 cursor-pointer active:scale-98"
                    >
                      Gửi Đánh Giá Mô Hình
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeDetailTab === 'related' && (
              <div className="animate-fade-in text-xs">
                {/* Connected intelligent recommendations list */}
                <div id="detail-modal-recommendations-section">
                  <SmartRecommendations
                    allProducts={allProducts}
                    viewHistory={viewHistory}
                    cart={cart}
                    orders={orders}
                    onAddToCart={onAddToCart}
                    onViewDetails={onViewProductDetails}
                    variant="modal"
                    currentProductId={product.id}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom space padding */}
          <div className="pb-4" />

        </div>
      </div>
    </div>
  </div>
  );
}
