import React, { useState } from 'react';
import { ShoppingCart, Search, ShieldCheck, User as UserIcon, Wallet, Plus, Sparkles, Filter, RefreshCw, Heart, Scale, LogOut } from 'lucide-react';
import { User, Product } from '../types';

interface NavbarProps {
  currentUser: User;
  onSwitchRole: (role: 'customer' | 'admin') => void;
  onCartClick: () => void;
  cartCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedScale: string;
  onScaleChange: (scale: string) => void;
  activeTab: 'shop' | 'tracking' | 'loyalty' | 'admin';
  onTabChange: (tab: 'shop' | 'tracking' | 'loyalty' | 'admin') => void;
  showOnlyWishlist: boolean;
  onToggleWishlistFilter: () => void;
  wishlistCount: number;
  adminNotificationsCount?: number;
  products?: Product[];
  onOpenCustomerAuth?: () => void;
  onLogoutCustomer?: () => void;
}

export default function Navbar({
  currentUser,
  onSwitchRole,
  onCartClick,
  cartCount,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedScale,
  onScaleChange,
  activeTab,
  onTabChange,
  showOnlyWishlist,
  onToggleWishlistFilter,
  wishlistCount,
  adminNotificationsCount = 0,
  products = [],
  onOpenCustomerAuth,
  onLogoutCustomer
}: NavbarProps) {
  const defaultCategories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'supercar', label: 'Siêu xe' },
    { value: 'suv', label: 'SUV Sang' },
    { value: 'classic', label: 'Cổ điển' },
    { value: 'jdm', label: 'JDM' }
  ];

  // Scan products array for any custom category, filter out empty/dupes
  const customCategories = Array.from(
    new Set(
      products
        .map(p => p.category?.trim())
        .filter(cat => cat && !['supercar', 'suv', 'classic', 'jdm'].includes(cat.toLowerCase()))
    )
  ).map(cat => ({
    value: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1)
  }));

  const categories = [...defaultCategories, ...customCategories];

  const scales = [
    { value: 'all', label: 'Tỷ lệ: Tất cả' },
    { value: '1:18', label: 'Tỷ lệ 1:18' },
    { value: '1:24', label: 'Tỷ lệ 1:24' },
    { value: '1:32', label: 'Tỷ lệ 1:32' },
    { value: '1:64', label: 'Tỷ lệ 1:64' }
  ];

  return (
    <header className="sticky top-0 z-40 py-1.5 sm:py-3 px-1.5 sm:px-4 bg-transparent">
      <div className="max-w-7xl mx-auto rounded-xl sm:rounded-2xl bg-white border border-zinc-200/80 backdrop-blur-xl shadow-xl shadow-zinc-200/30 px-1.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-1.5">
          
          {/* Logo Brand */}
          <div 
            onClick={() => onTabChange('shop')} 
            className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group flex-shrink-0 select-none"
            id="nav-logo"
          >
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-red-500 hover:scale-105 transition-all duration-300 shadow-md shadow-red-500/20">
              <svg viewBox="0 0 100 100" className="w-6.5 h-6.5 sm:w-8 sm:h-8" style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.1))" }}>
                <defs>
                  <linearGradient id="tiemxe-white-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#fca5a5" />
                  </linearGradient>
                </defs>
                {/* Elegant sports car outline in white gradient */}
                <path
                  d="M15 62 L22 38 C24 33 30 30 38 30 H62 C70 30 76 33 78 38 L85 62 C88 62 90 65 90 68 V74 C90 78 87 81 83 81 H79 C76 81 74 79 74 76 V72 H26 V76 C26 79 24 81 21 81 H17 C13 81 10 78 10 74 V68 C10 65 12 62 15 62 Z M28 62 H72 L66 43 C65 40 60 38 50 38 C40 38 35 40 34 43 L28 62 Z"
                  fill="url(#tiemxe-white-grad)"
                />
                <circle cx="21" cy="71" r="3.5" fill="#ef4444" />
                <circle cx="79" cy="71" r="3.5" fill="#ef4444" />
              </svg>
            </div>
            <div className="text-left hidden min-[450px]:block leading-none">
              <div className="flex items-baseline gap-0.5">
                <span className="text-sm sm:text-lg font-black tracking-tighter text-zinc-900 uppercase font-sans">
                  TIỆM XE
                </span>
                <span className="text-xs sm:text-sm font-black text-red-600 font-mono uppercase tracking-tight">
                  MÔ HÌNH
                </span>
              </div>
              <span className="block text-[7px] sm:text-[8px] text-zinc-400 font-extrabold tracking-[0.12em] mt-0.5 uppercase">
                Thế giới xe mô hình
              </span>
            </div>
          </div>

          {/* Desktop Search Center - only visible on shop page */}
          {activeTab === 'shop' && (
            <div className="hidden md:flex flex-1 max-w-sm mx-4 lg:mx-8" id="nav-search-bar">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Tìm mô hình ô tô..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-zinc-50 hover:bg-zinc-100/80 text-zinc-900 placeholder-zinc-400 pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-red-450 transition-all text-sm"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
              </div>
            </div>
          )}

          {/* User Settings & Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            {/* Quick Navigation Tabs */}
            <div className="flex gap-px sm:gap-0.5 bg-zinc-100 border border-zinc-200/60 p-0.5 rounded-lg font-medium" id="nav-tabs">
              <button
                onClick={() => onTabChange('shop')}
                className={`px-1.5 sm:px-2.5 text-[9.5px] sm:text-[11px] font-extrabold leading-none py-1 sm:py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'shop'
                    ? 'bg-white text-zinc-805 font-black shadow-sm border border-zinc-200/50'
                    : 'text-zinc-650 hover:text-zinc-900 hover:bg-white/40'
                }`}
              >
                Cửa Hàng
              </button>
              <button
                onClick={() => onTabChange('tracking')}
                className={`px-1.5 sm:px-2.5 text-[9.5px] sm:text-[11px] font-extrabold leading-none py-1 sm:py-1.5 rounded-md relative transition-all cursor-pointer ${
                  activeTab === 'tracking'
                    ? 'bg-white text-zinc-805 font-black shadow-sm border border-zinc-200/50'
                    : 'text-zinc-650 hover:text-zinc-900 hover:bg-white/40'
                }`}
              >
                Đơn Hàng
              </button>
              <button
                onClick={() => onTabChange('loyalty')}
                className={`px-1.5 sm:px-2.5 text-[9.5px] sm:text-[11px] font-extrabold leading-none py-1 sm:py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'loyalty'
                    ? 'bg-white text-zinc-805 font-black shadow-sm border border-zinc-200/50'
                    : 'text-zinc-650 hover:text-zinc-900 hover:bg-white/40'
                }`}
                id="view-membership-rank-tab-btn"
              >
                Hạng VIP
              </button>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => onTabChange('admin')}
                  className={`px-1 sm:px-2 py-1 sm:py-1.5 rounded-md text-[9.5px] sm:text-[11px] font-extrabold flex items-center gap-0.5 sm:gap-1 relative transition-all cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-red-500 text-white shadow-xs font-black'
                      : 'text-red-500 hover:text-red-600 hover:bg-red-50'
                  }`}
                  id="nav-admin-tab"
                >
                  <ShieldCheck className="w-3 h-3 text-current shrink-0" />
                  <span className="hidden sm:inline">Quản Lý</span>
                  {adminNotificationsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black font-mono text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white animate-pulse">
                      {adminNotificationsCount}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* User Profile Selector with Multi-Role Switcher */}
            <div className="flex items-center gap-1 sm:gap-2 border-l border-zinc-200 pl-1 sm:pl-3" id="role-selector-container">
              {currentUser.id !== 'user-001' ? (
                <div className="flex items-center gap-1 sm:gap-2" id="user-avatar-badge">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-50 text-red-650 font-black text-xs flex items-center justify-center border border-red-250 uppercase shrink-0" title={currentUser.fullName}>
                    {currentUser.fullName.split(' ').slice(-2).map(n => n ? n[0] : '').join('') || 'U'}
                  </div>
                  <div className="hidden sm:block text-left max-w-[120px]">
                    <p className="text-xs font-black text-zinc-900 leading-none truncate">{currentUser.fullName}</p>
                    <span className="text-[8px] text-zinc-500 font-extrabold uppercase tracking-wide whitespace-nowrap">
                      {currentUser.role === 'admin' ? '🛡️ Ban Quản Trị' : '👤 VIP'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="hidden lg:block text-right">
                  <p className="text-xs font-extrabold text-zinc-900 leading-none mb-0.5">{currentUser.fullName}</p>
                  <span className="inline-flex items-center gap-1 text-[9px] bg-red-50 text-red-650 px-1.5 py-0.5 rounded font-mono font-bold border border-red-200 uppercase tracking-wider">
                    👤 DEMO GUEST
                  </span>
                </div>
              )}
              
              {/* Customer specific Login/Register/Logout UI */}
              <div className="flex items-center gap-1">
                {currentUser.id === 'user-001' ? (
                  <button
                    onClick={onOpenCustomerAuth}
                    className="w-7 h-7 sm:w-auto sm:px-2.5 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full sm:rounded-lg transition-all border border-red-700 flex items-center justify-center cursor-pointer shadow-xs active:scale-95 whitespace-nowrap shrink-0"
                    id="guest-login-btn"
                    title="Đăng Nhập / Đăng Ký"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-white" />
                    <span className="hidden sm:inline text-xs font-black ml-1">Đăng Nhập</span>
                  </button>
                ) : (
                  <button
                    onClick={onLogoutCustomer}
                    className="w-7 h-7 sm:w-auto sm:px-2.5 sm:py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full sm:rounded-lg transition-all border border-zinc-200 flex items-center justify-center cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                    id="customer-logout-btn"
                    title="Đăng xuất hội viên"
                  >
                    <LogOut className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="hidden sm:inline text-xs font-extrabold ml-1">Thoát</span>
                  </button>
                )}

                {/* Direct quick role switch helper */}
                <button
                  onClick={() => onSwitchRole(currentUser.role === 'admin' ? 'customer' : 'admin')}
                  className={`w-7 h-7 sm:w-auto sm:p-1.5 sm:py-1.5 rounded-full sm:rounded-lg border transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                  title={`Đổi vai trò: ${currentUser.role === 'admin' ? 'Khách' : 'Admin'}`}
                  id="role-switch-button"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-500 animate-spin-hover" />
                  <span className="text-[9px] font-black sm:inline hidden uppercase ml-1">
                    {currentUser.role === 'admin' ? 'Khách' : 'Admin'}
                  </span>
                </button>
              </div>
            </div>

            {/* Shopping Cart Indicator */}
            <button
              onClick={onCartClick}
              className="p-1.5 sm:p-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-805 rounded-lg sm:rounded-xl border border-zinc-200 relative transition-all hover:scale-105 cursor-pointer shrink-0"
              id="cart-indicator-button"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 font-mono text-[9px] sm:text-[10px] font-bold text-white w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Submenu for Filters (Only on Shop Tab) */}
      {activeTab === 'shop' && (
        <div className="py-2 px-2.5 sm:px-4 z-10 relative mt-1 sm:mt-2" id="mobile-filter-bar">
          <div className="max-w-7xl mx-auto rounded-3xl bg-white border border-zinc-150 p-2.5 md:p-3 flex flex-col gap-2.5 shadow-xl shadow-zinc-100/50">
            {/* Mobile Search input */}
            <div className="relative md:hidden w-full">
              <input
                type="text"
                placeholder="Tìm xe cổ, siêu xe, JDM..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-zinc-50/80 border border-zinc-200 text-zinc-900 placeholder-zinc-400 pl-10 pr-4 py-2 rounded-2xl focus:outline-none focus:border-red-400 focus:bg-white text-xs font-medium"
              />
              <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
            </div>

            {/* Main Filters Container: Flex rows for horizontal scrolling on mobile, crisp layout on desktop */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 w-full overflow-hidden">
              {/* Category Filter Chips Rack */}
              <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-nowrap" id="horizontal-categories-rack">
                <div className="flex items-center gap-1 text-zinc-550 text-[10px] sm:text-xs font-black uppercase tracking-wider h-7 shrink-0 mr-1">
                  <Filter className="w-3 h-3 text-red-500" />
                  <span>Bộ sưu tập:</span>
                </div>
                <div className="flex gap-1.5 flex-nowrap shrink-0">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => onCategoryChange(cat.value)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer select-none active:scale-95 ${
                        selectedCategory === cat.value && !showOnlyWishlist
                          ? 'bg-red-500 text-white font-black shadow-sm'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/60'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scale Filter Chips Rack */}
              <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto pb-0.5 md:pb-0 scrollbar-none flex-nowrap border-t md:border-t-0 border-zinc-100 pt-1.5 md:pt-0" id="horizontal-scales-rack">
                <div className="flex items-center gap-1 text-zinc-550 text-[10px] sm:text-xs font-black uppercase tracking-wider h-7 shrink-0 mr-1">
                  <Scale className="w-3 h-3 text-blue-500" />
                  <span>Chọn Tỷ lệ:</span>
                </div>
                <div className="flex gap-1 flex-nowrap shrink-0">
                  {scales.map((sc) => (
                    <button
                      key={sc.value}
                      onClick={() => onScaleChange(sc.value)}
                      className={`px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer select-none active:scale-95 ${
                        selectedScale === sc.value
                          ? 'bg-zinc-800 text-white font-black shadow-inner border border-zinc-900'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/60'
                      }`}
                    >
                      {sc.value === 'all' ? 'Tất cả tỷ lệ' : sc.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
