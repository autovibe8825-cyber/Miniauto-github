import React from 'react';
import { Home, ChevronRight, Folder, Package, Compass } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';

interface BreadcrumbsProps {
  activeTab: 'shop' | 'tracking' | 'loyalty' | 'admin';
  selectedCategory: string;
  selectedScale: string;
  selectedProduct: Product | null;
  onNavigate: (
    tab: 'shop' | 'tracking' | 'loyalty' | 'admin',
    category?: string,
    resetProduct?: boolean,
    resetScale?: boolean
  ) => void;
}

const categoryLabels: { [key: string]: string } = {
  all: 'Tất cả sản phẩm',
  supercar: 'Siêu xe',
  suv: 'SUV Sang',
  classic: 'Cổ điển',
  jdm: 'JDM J-Style',
};

export default function Breadcrumbs({
  activeTab,
  selectedCategory,
  selectedScale,
  selectedProduct,
  onNavigate,
}: BreadcrumbsProps) {
  // Helper to format category label
  const getCategoryLabel = (cat: string) => {
    const key = cat.toLowerCase().trim();
    if (categoryLabels[key]) return categoryLabels[key];
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  // Build the list of breadcrumb items
  const items: Array<{
    label: string | React.ReactNode;
    onClick?: () => void;
    active?: boolean;
    icon?: React.ReactNode;
  }> = [];

  // Always start with Home (Trang chủ)
  items.push({
    label: 'Trang chủ',
    icon: <Home className="w-3.5 h-3.5 mr-1" />,
    onClick: () => onNavigate('shop', 'all', true, true),
    active: activeTab === 'shop' && selectedCategory === 'all' && !selectedProduct,
  });

  if (activeTab === 'shop') {
    if (selectedProduct) {
      // If we are looking at a product detail
      items.push({
        label: getCategoryLabel(selectedProduct.category),
        icon: <Folder className="w-3.5 h-3.5 mr-1 text-zinc-400" />,
        onClick: () => onNavigate('shop', selectedProduct.category, true, false),
        active: false,
      });

      items.push({
        label: selectedProduct.name,
        icon: <Package className="w-3.5 h-3.5 mr-1 text-red-500 animate-pulse" />,
        active: true,
      });
    } else {
      // If we are in the shop but filtered by a category
      if (selectedCategory !== 'all') {
        items.push({
          label: getCategoryLabel(selectedCategory),
          icon: <Folder className="w-3.5 h-3.5 mr-1 text-zinc-400" />,
          onClick: () => onNavigate('shop', selectedCategory, true, false),
          active: selectedScale === 'all',
        });
      }

      // If we also filtered by scale
      if (selectedScale !== 'all') {
        items.push({
          label: `Tỷ lệ ${selectedScale}`,
          icon: <Compass className="w-3.5 h-3.5 mr-1 text-zinc-400" />,
          active: true,
        });
      }
    }
  } else if (activeTab === 'tracking') {
    items.push({
      label: 'Tra cứu đơn hàng',
      active: true,
    });
  } else if (activeTab === 'loyalty') {
    items.push({
      label: 'Tích điểm đổi quà',
      active: true,
    });
  } else if (activeTab === 'admin') {
    items.push({
      label: 'Quản trị hệ thống',
      active: true,
    });
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-1.5 mb-1.5 z-20 relative select-none"
      aria-label="Breadcrumb"
      id="site-breadcrumbs"
    >
      <div className="flex items-center flex-wrap bg-white border border-zinc-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-md rounded-2xl py-2 px-4 text-xs">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 flex-wrap leading-none">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="inline-flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-350 mx-1.5 shrink-0" />
                )}
                
                {isLast || !item.onClick ? (
                  <span
                    className={`inline-flex items-center font-bold tracking-tight py-1 transition-colors ${
                      item.active || isLast
                        ? 'text-red-600 font-extrabold'
                        : 'text-zinc-500'
                    }`}
                  >
                    {item.icon}
                    <span className="truncate max-w-[150px] sm:max-w-[320px]">{item.label}</span>
                  </span>
                ) : (
                  <button
                    onClick={item.onClick}
                    className="inline-flex items-center text-zinc-500 hover:text-red-500 font-medium py-1 transition-colors duration-150 cursor-pointer focus:outline-none"
                  >
                    {item.icon}
                    <span className="truncate max-w-[150px] sm:max-w-[320px]">{item.label}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </motion.nav>
  );
}
