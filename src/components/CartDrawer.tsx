import { CartItem, Product, Order } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, EyeOff, ShieldAlert } from 'lucide-react';
import SmartRecommendations from './SmartRecommendations';

interface CartDrawerProps {
  cartItems: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  allProducts: Product[];
  viewHistory: string[];
  orders: Order[];
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export default function CartDrawer({
  cartItems,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  allProducts,
  viewHistory,
  orders,
  onAddToCart,
  onViewDetails
}: CartDrawerProps) {
  const isCartEmpty = cartItems.length === 0;
  
  const getItemPrice = (product: Product) => {
    if (product.discountPercentage && product.discountPercentage > 0) {
      return Math.floor(product.price * (1 - product.discountPercentage / 100));
    }
    return product.price;
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item.product) * item.quantity, 
    0
  );

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden animate-fade-in" 
      id="cart-drawer-backdrop"
    >
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full sm:max-w-md md:max-w-lg bg-white text-zinc-800 border-l border-zinc-200 shadow-2xl flex flex-col h-[100vh] h-[100dvh] z-50">
        <div className="w-full flex flex-col h-full relative">
          
          {/* Header */}
          <div className="px-4 py-4 sm:px-5 sm:py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/95 sticky top-0 z-10">
            <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 flex items-center gap-2 uppercase tracking-wide">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              Giỏ hàng ({cartItems.length})
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 bg-white hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 rounded-lg border border-zinc-200 transition-all cursor-pointer active:scale-95"
              title="Đóng giỏ hàng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 space-y-3.5">
            {isCartEmpty ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6" id="empty-cart-state">
                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 border border-zinc-200 mb-4 shadow-xs">
                  <EyeOff className="w-7 h-7 text-zinc-400" />
                </div>
                <h3 className="text-sm font-bold text-zinc-700">Giỏ hàng rỗng</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                  Bạn chưa chọn mô hình ô tô nào để đưa vào bộ sưu tập. Khám phá các mẫu xe siêu chất phía ngoài nhé!
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 bg-zinc-100 hover:bg-white border border-zinc-200 text-zinc-700 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                >
                  Tiếp Tục Mua Sắm
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const limitReached = item.quantity >= item.product.stock;

                return (
                  <div 
                    key={item.product.id}
                    className="bg-zinc-55/40 sm:bg-zinc-50 border border-zinc-200 rounded-2xl p-2.5 sm:p-3 flex gap-2.5 sm:gap-3 relative group text-left shadow-sm"
                    id={`cart-item-${item.product.id}`}
                  >
                    {/* Item Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border border-zinc-200/60 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>

                    {/* Content spec */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-block px-1.5 py-0.5 bg-red-50 text-red-650 rounded text-[9px] font-extrabold font-mono border border-red-200 leading-none">
                          {item.product.scale}
                        </span>
                        <span className="inline-block text-[10px] text-zinc-500 font-bold truncate max-w-[80px]">
                          {item.product.brand}
                        </span>
                      </div>
                      
                      <h4 className="text-xs font-semibold text-zinc-805 truncate mt-1 leading-snug uppercase tracking-tight">
                        {item.product.name}
                      </h4>
                      {item.product.discountPercentage && item.product.discountPercentage > 0 ? (
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap whitespace-nowrap">
                          <span className="text-[9px] sm:text-[10px] text-zinc-400 line-through font-mono whitespace-nowrap shrink-0">
                            {item.product.price.toLocaleString('vi-VN')}&nbsp;đ
                          </span>
                          <span className="text-xs font-bold text-red-500 font-mono whitespace-nowrap shrink-0">
                            {getItemPrice(item.product).toLocaleString('vi-VN')}&nbsp;đ
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-red-500 font-mono mt-0.5 whitespace-nowrap shrink-0">
                          {item.product.price.toLocaleString('vi-VN')}&nbsp;đ
                        </p>
                      )}

                      {/* Stock limit warning inside cart item */}
                      {limitReached && (
                        <div className="flex items-center gap-1 text-[9px] text-amber-600 mt-1 font-bold">
                          <ShieldAlert className="w-3 h-3 text-amber-500" />
                          <span>Đã đạt mức kho tối đa ({item.product.stock})</span>
                        </div>
                      )}

                      {/* Counters and delete */}
                      <div className="flex items-center justify-between mt-2.5 gap-2 flex-wrap">
                        <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-xl shrink-0">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="p-2 px-3 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/50 rounded-l-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center min-w-[36px] min-h-[36px]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs sm:text-sm font-black text-zinc-800 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            disabled={limitReached}
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            className="p-2 px-3 disabled:opacity-30 disabled:hover:text-zinc-400 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/50 rounded-r-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center min-w-[36px] min-h-[36px]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs sm:text-sm font-extrabold text-zinc-750 font-sans ml-auto whitespace-nowrap shrink-0">
                          Tổng: <strong className="text-red-500 font-mono">{(getItemPrice(item.product) * item.quantity).toLocaleString('vi-VN')}&nbsp;đ</strong>
                        </span>
                      </div>
                    </div>

                    {/* Delete entry */}
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="absolute top-2.5 right-2.5 p-1 text-zinc-400 hover:text-red-500 hover:bg-zinc-105 rounded-lg transition-all cursor-pointer active:scale-95"
                      title="Xóa khỏi giỏ"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                );
              })
            )}

            {/* Smart behavioral recommendations drawer footer listing */}
            <div className="pt-4 border-t border-zinc-200 bg-zinc-50 p-3 sm:p-4 rounded-2xl">
              <SmartRecommendations
                allProducts={allProducts}
                viewHistory={viewHistory}
                cart={cartItems}
                orders={orders}
                onAddToCart={onAddToCart}
                onViewDetails={onViewDetails}
                variant="sidebar"
              />
            </div>

          </div>

          {/* Checkout panel section footer */}
          {!isCartEmpty && (
            <div className="border-t border-zinc-200 bg-white/95 p-4 sm:p-5 space-y-4 sticky bottom-0 shrink-0 z-25 backdrop-blur-lg pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">TỔNG THANH TOÁN:</p>
                  <p className="text-[9px] text-zinc-400 mt-0.5">Kho tự động kiểm tra nạp đơn</p>
                </div>
                <span className="text-lg sm:text-xl font-black text-red-600 font-mono whitespace-nowrap shrink-0">
                  {totalAmount.toLocaleString('vi-VN')}&nbsp;đ
                </span>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-black rounded-xl tracking-wider uppercase transition-all shadow-lg shadow-red-600/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                id="cart-drawer-checkout-cta"
              >
                <ShoppingBag className="w-4 h-4 text-white shrink-0" />
                <span>Tiến Hành Đặt Hàng & Thanh Toán</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
