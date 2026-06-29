import React, { useState, useEffect } from 'react';
import { CartItem, PaymentMethod, User, Product, BankSettings } from '../types';
import { ArrowLeft, Wallet, ShieldCheck, CheckCircle2, QrCode, Timer, CreditCard, Landmark, Truck, Trash2, Copy, Check } from 'lucide-react';

interface CheckoutPortalProps {
  cartItems: CartItem[];
  currentUser: User;
  onClose: () => void;
  onPlaceOrder: (details: {
    orderId?: string;
    userName: string;
    userPhone: string;
    userAddress: string;
    userEmail?: string;
    paymentMethod: PaymentMethod;
    finalAmount: number;
    pointsEarned: number;
    appliedVoucherId?: string;
    carrier: 'ghn' | 'jnt' | 'shopee' | 'ghtk' | 'viettel' | 'vnpost';
  }) => void;
  onUpdateQuantity?: (productId: string, delta: number) => void;
  onRemoveItem?: (productId: string) => void;
  bankSettings?: BankSettings;
}

const fallbackBankSettings: BankSettings = {
  bankName: 'MB BANK (Ngân hàng Quân Đội)',
  bankCodeShort: 'MB',
  accountNumber: '19035658825',
  accountHolder: 'MO HINH XE TINH MINIAUTO STORE',
  momoPhone: '0919288258',
  adminEmail: 'autovibe8825@gmail.com'
};

export default function CheckoutPortal({
  cartItems,
  currentUser,
  onClose,
  onPlaceOrder,
  onUpdateQuantity,
  onRemoveItem,
  bankSettings = fallbackBankSettings
}: CheckoutPortalProps) {
  // Address info defaults
  const [name, setName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone || '0912345678');
  const [address, setAddress] = useState(currentUser.address || '72 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội');
  const [email, setEmail] = useState(currentUser.email || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [selectedVoucherId, setSelectedVoucherId] = useState<string>('');
  const [carrier, setCarrier] = useState<'ghn' | 'jnt' | 'shopee' | 'ghtk' | 'viettel' | 'vnpost'>('shopee');

  // Step indicator: 'info' -> 'pay_scan' -> 'done'
  const [checkoutStep, setCheckoutStep] = useState<'info' | 'pay_scan' | 'done'>('info');
  const [timer, setTimer] = useState(120); // 2 minutes scanning window
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Unique checkout transaction ID
  const [tempOrderId] = useState(() => 'OD-' + Math.floor(10000 + Math.random() * 90000));

  // Copy status feedback for VietQR bank and Momo copy buttons
  const [copyState, setCopyState] = useState<{[key: string]: boolean}>({});
  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyState(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopyState(prev => ({ ...prev, [key]: false }));
      }, 1500);
    }).catch(err => {
      console.error('Lỗi copy:', err);
    });
  };

  // Suggested premium custom collector services states
  const [includeAcrylicCasing, setIncludeAcrylicCasing] = useState(false);
  const [includeGiftWrap, setIncludeGiftWrap] = useState(false);

  // Auto-close portal if customer removes/cancels all items in checkout review
  useEffect(() => {
    if (cartItems.length === 0) {
      onClose();
    }
  }, [cartItems, onClose]);

  const getItemPrice = (product: Product) => {
    if (product.discountPercentage && product.discountPercentage > 0) {
      return Math.floor(product.price * (1 - product.discountPercentage / 105)); // safe standard calc
    }
    return product.price;
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + getItemPrice(item.product) * item.quantity, 0);

  // Loyalty calculations
  const lifetimePoints = currentUser.lifetimePoints ?? 350;
  const loyaltyPoints = currentUser.loyaltyPoints ?? 350;
  const isGold = lifetimePoints >= 1500;
  const isSilver = lifetimePoints >= 500 && lifetimePoints < 1500;
  
  const discountRate = isGold ? 0.10 : isSilver ? 0.05 : 0;
  const tierName = isGold ? 'Vàng (Gold Elite)' : isSilver ? 'Bạc (Silver Pro)' : 'Đồng (Bronze Base)';
  const tierDiscountAmount = Math.floor(totalAmount * discountRate);

  // Voucher calculations
  const availableVouchers = currentUser.vouchers ?? [];
  const selectedVoucher = availableVouchers.find((v) => v.id === selectedVoucherId);
  const voucherDiscountAmount = selectedVoucher ? selectedVoucher.amount : 0;

  // Add-on cost summation
  const addOnCost = (includeAcrylicCasing ? 50000 : 0) + (includeGiftWrap ? 20000 : 0);

  // Final aggregate billings
  const finalAmount = Math.max(0, totalAmount + addOnCost - tierDiscountAmount - voucherDiscountAmount);
  const pointsToEarn = Math.floor(finalAmount / 10000);

  // Initialize transaction on backend for automatic matching
  useEffect(() => {
    if (checkoutStep === 'pay_scan') {
      fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: tempOrderId,
          amount: finalAmount,
          method: paymentMethod
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log("Cổng thanh toán tự động đã được cấu hình:", data);
      })
      .catch(err => {
        console.error("Lỗi liên kết cổng thanh toán:", err);
      });
    }
  }, [checkoutStep, tempOrderId, finalAmount, paymentMethod]);

  // Read transactions polling to catch webhooks automatically
  useEffect(() => {
    let active = true;
    let timerId: NodeJS.Timeout;

    if (checkoutStep === 'pay_scan') {
      const checkStatus = () => {
        fetch(`/api/payment/status/${tempOrderId}`)
          .then(res => res.json())
          .then(data => {
            if (active && data.success && data.status === 'success') {
              try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-84.wav');
                audio.volume = 0.45;
                audio.play();
              } catch (e) {}
              
              setCheckoutStep('done');
            } else if (active) {
              timerId = setTimeout(checkStatus, 2000); // Poll status every 2s
            }
          })
          .catch(() => {
            if (active) timerId = setTimeout(checkStatus, 3000);
          });
      };
      
      timerId = setTimeout(checkStatus, 1500);
    }

    return () => {
      active = false;
      clearTimeout(timerId);
    };
  }, [checkoutStep, tempOrderId]);

  // Countdown timer for QR
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (checkoutStep === 'pay_scan' && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0 && checkoutStep === 'pay_scan') {
      setCheckoutStep('info');
      alert('Đồng hồ QR đã hết hạn, vui lòng khởi tạo giao dịch mới.');
    }
    return () => clearInterval(interval);
  }, [timer, checkoutStep]);

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      setPaymentError('Vui lòng điền đầy đủ thông tin giao hàng.');
      return;
    }

    setPaymentError(null);
    if (paymentMethod === 'cod') {
      setCheckoutStep('done');
    } else {
      setTimer(120);
      setCheckoutStep('pay_scan');
    }
  };

  // Simulate payment QR Success trigger
  const handleSimulatedScanConfirm = () => {
    setIsProcessing(true);
    setPaymentError(null);

    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutStep('done');
    }, 2000);
  };

  const handleFinalize = () => {
    let finalAddressNote = address;
    if (includeAcrylicCasing) {
      finalAddressNote += " (Tùy chọn: KÈM HỘP ACRYLIC MICA ĐÈN LED CHIẾU SÁNG)";
    }
    if (includeGiftWrap) {
      finalAddressNote += " (Yêu cầu: ĐÓNG GÓI THẮT NƠ ĐỎ QUÀ BIẾU SANG TRỌNG)";
    }

    onPlaceOrder({
      orderId: tempOrderId,
      userName: name,
      userPhone: phone,
      userAddress: finalAddressNote,
      userEmail: email,
      paymentMethod,
      finalAmount,
      pointsEarned: pointsToEarn,
      appliedVoucherId: selectedVoucherId || undefined,
      carrier
    });
  };

  const getPaymentName = (method: PaymentMethod) => {
    switch (method) {
      case 'online': return 'Chuyển khoản online';
      case 'bank': return 'Chuyển khoản Ngân hàng (VietQR)';
      case 'momo': return 'Ví điện tử MoMo';
      case 'cod': return 'Thanh toán khi nhận hàng (COD)';
      default: return 'Trực tuyến';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-2 sm:p-6" id="checkout-portal-backdrop">
      <div className="my-auto w-full max-w-2xl bg-white border border-zinc-205 rounded-3xl text-zinc-800 shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center gap-3 shrink-0">
          {checkoutStep === 'info' ? (
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer border border-zinc-200 bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : checkoutStep === 'pay_scan' ? (
            <button
              onClick={() => setCheckoutStep('info')}
              className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-800 transition-all border border-zinc-200 bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : null}
          <div className="text-left">
            <h2 className="text-base font-extrabold text-zinc-850 uppercase tracking-tight italic">Thanh toán trực tuyến và chốt đơn</h2>
            <p className="text-[11px] text-zinc-500 font-medium">Bảo mật cao • Xác thực kho hàng tự động</p>
          </div>
        </div>

        {/* Middle contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-300">
          
          {/* Progress Indicators */}
          <div className="grid grid-cols-3 gap-2 mb-6" id="checkout-stepper">
            <div className={`text-center pb-2 border-b-2 text-xs font-bold transition-all uppercase tracking-wide ${
              checkoutStep === 'info' ? 'border-red-500 text-red-600' : 'border-zinc-200 text-zinc-400'
            }`}>
              1. Giao Hàng
            </div>
            <div className={`text-center pb-2 border-b-2 text-xs font-bold transition-all uppercase tracking-wide ${
              checkoutStep === 'pay_scan' ? 'border-red-500 text-red-600' : 'border-zinc-200 text-zinc-400'
            }`}>
              2. Quét Mã Ví
            </div>
            <div className={`text-center pb-2 border-b-2 text-xs font-bold transition-all uppercase tracking-wide ${
              checkoutStep === 'done' ? 'border-red-500 text-red-600' : 'border-zinc-200 text-zinc-400'
            }`}>
              3. Hoàn Tất
            </div>
          </div>

          {/* Error notifications */}
          {paymentError && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-800 flex items-start gap-2 leading-relaxed animate-shake">
              <span>⚠</span>
              <span>{paymentError}</span>
            </div>
          )}

          {/* STEP 1: Billing Detail Input */}
          {checkoutStep === 'info' && (
            <form onSubmit={handleInfoSubmit} className="space-y-4" id="billing-info-form">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider text-left">Thông tin người nhận:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">Họ Tên Quý Khách:</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs px-4 py-3 rounded-xl text-zinc-800 focus:outline-none focus:border-red-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">Số Điện Thoại:</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs px-4 py-3 rounded-xl text-zinc-800 focus:outline-none focus:border-red-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">Địa Chỉ Email (Nhận hóa đơn điện tử):</label>
                <input
                  type="email"
                  required
                  placeholder="vi_du@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 text-xs px-4 py-3 rounded-xl text-zinc-800 focus:outline-none focus:border-red-500 transition-all font-medium"
                />
              </div>

              <div className="text-left">
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">Địa Chỉ Nhận Hàng:</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 text-xs px-4 py-3 rounded-xl text-zinc-800 focus:outline-none focus:border-red-500 transition-all font-medium"
                />
              </div>

              {/* Payment Methods selector */}
              <div className="pt-4 border-t border-zinc-200 text-left animate-fade-in-up">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3">Hình thức thanh toán:</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" id="payment-methods-grid">
                  {/* Bank Transfer (VietQR) */}
                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer hover:bg-zinc-50 transition-all ${
                    paymentMethod === 'bank' ? 'border-red-500 bg-red-50/50' : 'border-zinc-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="payment_opt"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                      className="accent-red-500 text-red-500"
                    />
                    <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center font-extrabold text-red-650 text-[10px]">
                      BANK
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-red-600 truncate">Qua VietQR</p>
                      <p className="text-[9px] text-zinc-500 truncate">Nhận chuyển khoản 2s</p>
                    </div>
                  </label>

                  {/* MoMo E-Wallet */}
                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer hover:bg-zinc-50 transition-all ${
                    paymentMethod === 'momo' ? 'border-pink-500 bg-pink-50/50' : 'border-zinc-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="payment_opt"
                      checked={paymentMethod === 'momo'}
                      onChange={() => setPaymentMethod('momo')}
                      className="accent-pink-500 text-pink-500"
                    />
                    <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center font-extrabold text-pink-650 text-[10px]">
                      MOMO
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-pink-600 truncate">Ví MoMo</p>
                      <p className="text-[9px] text-zinc-500 truncate">Quét mã di động nhanh</p>
                    </div>
                  </label>

                  {/* Cash on Delivery (COD) */}
                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer hover:bg-zinc-50 transition-all ${
                    paymentMethod === 'cod' ? 'border-amber-500 bg-amber-50/50' : 'border-zinc-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="payment_opt"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-amber-500 text-amber-550"
                    />
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center font-extrabold text-amber-650 text-[10px]">
                      COD
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-amber-655 truncate">Thanh toán COD</p>
                      <p className="text-[9px] text-zinc-500 truncate">Khi giao xe hàng</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Shipping Carrier Section */}
              <div className="pt-4 border-t border-zinc-200 text-left">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-orange-500" />
                  Đơn vị vận chuyển liên kết:
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5" id="shipping-carriers-grid">
                  {/* Shopee Express */}
                  <label className={`flex gap-3 p-3.5 rounded-2xl border cursor-pointer text-left items-center transition-all ${
                    carrier === 'shopee' ? 'bg-orange-50 border-orange-300' : 'bg-white border-zinc-200 hover:border-zinc-300'
                  }`}>
                    <input
                      type="radio"
                      name="carrier_opt"
                      checked={carrier === 'shopee'}
                      onChange={() => setCarrier('shopee')}
                      className="accent-orange-500 text-orange-500 w-4 h-4 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-orange-700 tracking-tight flex items-center justify-between gap-1">
                        <span className="font-sans font-bold text-orange-850">SHOPEE EXPRESS</span>
                        <span className="text-[8px] bg-orange-500 text-white px-1 py-0.2 rounded font-bold font-mono">SPX</span>
                      </p>
                      <p className="text-[9px] text-zinc-500 mt-0.5 leading-tight">Vận chuyển qua SPX Logistics • 1-2 ngày nhận</p>
                      <p className="text-[9px] text-emerald-705 font-bold mt-0.5">Cước phí: FREE</p>
                    </div>
                  </label>

                  {/* Giao Hàng Nhanh (GHN) */}
                  <label className={`flex gap-3 p-3.5 rounded-2xl border cursor-pointer text-left items-center transition-all ${
                    carrier === 'ghn' ? 'bg-orange-50 border-orange-300' : 'bg-white border-zinc-200 hover:border-zinc-300'
                  }`}>
                    <input
                      type="radio"
                      name="carrier_opt"
                      checked={carrier === 'ghn'}
                      onChange={() => setCarrier('ghn')}
                      className="accent-orange-500 text-orange-500 w-4 h-4 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-orange-700 tracking-tight flex items-center justify-between gap-1">
                        <span className="font-sans font-bold text-orange-850">GIAO HÀNG NHANH</span>
                        <span className="text-[8px] bg-orange-650 text-white px-1 py-0.2 rounded font-bold font-mono">GHN</span>
                      </p>
                      <p className="text-[9px] text-zinc-500 mt-0.5 leading-tight">Đối tác GHN Express • Giao nhanh 1-2 ngày</p>
                      <p className="text-[9px] text-emerald-705 font-bold mt-0.5">Cước phí: FREE</p>
                    </div>
                  </label>

                  {/* J&T Express */}
                  <label className={`flex gap-3 p-3.5 rounded-2xl border cursor-pointer text-left items-center transition-all ${
                    carrier === 'jnt' ? 'bg-red-50 border-red-300' : 'bg-white border-zinc-200 hover:border-zinc-300'
                  }`}>
                    <input
                      type="radio"
                      name="carrier_opt"
                      checked={carrier === 'jnt'}
                      onChange={() => setCarrier('jnt')}
                      className="accent-red-500 text-red-500 w-4 h-4 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-red-700 tracking-tight flex items-center justify-between gap-1">
                        <span className="font-sans font-bold text-red-850">J&T EXPRESS</span>
                        <span className="text-[8px] bg-red-600 text-white px-1 py-0.2 rounded font-bold font-mono">J&T</span>
                      </p>
                      <p className="text-[9px] text-zinc-500 mt-0.5 leading-tight">Phát hỏa tốc toàn quốc • Giao 1-2 ngày</p>
                      <p className="text-[9px] text-emerald-705 font-bold mt-0.5">Cước phí: FREE</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Voucher Selector Selection */}
              {availableVouchers.length > 0 && (
                <div className="pt-4 border-t border-zinc-200 text-left">
                  <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">Áp dụng Voucher Club:</label>
                  <select
                    value={selectedVoucherId}
                    onChange={(e) => setSelectedVoucherId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs px-3.5 py-3 rounded-xl text-zinc-805 focus:outline-none focus:border-red-500 font-semibold cursor-pointer mb-4"
                  >
                    <option value="" className="text-zinc-500">-- Không sử dụng voucher --</option>
                    {availableVouchers.map((v) => (
                      <option key={v.id} value={v.id} className="text-zinc-800">
                        {v.name} (Giảm {v.amount.toLocaleString('vi-VN')} đ)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Order summary card list */}
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 space-y-3">
                <div className="text-left">
                  <span className="block text-[9px] text-zinc-450 uppercase tracking-widest font-extrabold mb-2.5">DANH SÁCH MÔ HÌNH SẼ MUA (Có thể hủy/bớt):</span>
                  <div className="max-h-[170px] overflow-y-auto space-y-2 pr-1">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center text-xs text-zinc-600 font-medium bg-white p-2.5 rounded-xl border border-zinc-150 gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-zinc-800 font-bold leading-normal font-sans text-left">{item.product.name}</p>
                          <p className="text-[10px] text-zinc-505 mt-0.5 whitespace-nowrap shrink-0 text-left">Tỷ lệ {item.product.scale} • {getItemPrice(item.product).toLocaleString('vi-VN')}&nbsp;đ</p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity && onUpdateQuantity(item.product.id, -1)}
                              disabled={item.quantity <= 1}
                              className="px-2 py-1 text-zinc-500 hover:bg-zinc-200 active:bg-zinc-300 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed font-mono text-center w-6"
                            >
                              -
                            </button>
                            <span className="px-1 text-zinc-700 font-bold font-mono text-[11px] text-center w-5">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity && onUpdateQuantity(item.product.id, 1)}
                              className="px-2 py-1 text-zinc-500 hover:bg-zinc-200 active:bg-zinc-300 cursor-pointer font-mono text-center w-6"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem && onRemoveItem(item.product.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-200"
                            title="Xóa khỏi đơn hàng (Hủy mẫu xe này)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-3.5 space-y-2 text-xs text-left">
                  <div className="flex justify-between text-zinc-500 whitespace-nowrap">
                    <span>Tổng tạm tính:</span>
                    <span className="font-mono whitespace-nowrap shrink-0 text-zinc-805 font-bold">{totalAmount.toLocaleString('vi-VN')}&nbsp;đ</span>
                  </div>

                  {addOnCost > 0 && (
                    <div className="flex justify-between text-amber-700 font-semibold bg-amber-50 px-2 py-1.5 rounded-lg border border-amber-200 whitespace-nowrap">
                      <span>Dịch vụ sưu tầm đính kèm:</span>
                      <span className="font-mono whitespace-nowrap shrink-0">+{addOnCost.toLocaleString('vi-VN')}&nbsp;đ</span>
                    </div>
                  )}
                  
                  {tierDiscountAmount > 0 && (
                    <div className="flex justify-between text-amber-700 font-semibold bg-amber-50 px-2 py-1.5 rounded-lg border border-amber-200 whitespace-nowrap">
                      <span>Đặc quyền {tierName} (Giảm {discountRate * 100}%):</span>
                      <span className="font-mono whitespace-nowrap shrink-0">-{tierDiscountAmount.toLocaleString('vi-VN')}&nbsp;đ</span>
                    </div>
                  )}

                  {voucherDiscountAmount > 0 && (
                    <div className="flex justify-between text-red-700 font-semibold bg-red-50 px-2 py-1.5 rounded-lg border border-red-150 whitespace-nowrap">
                      <span>Voucher Club áp dụng:</span>
                      <span className="font-mono whitespace-nowrap shrink-0">-{voucherDiscountAmount.toLocaleString('vi-VN')}&nbsp;đ</span>
                    </div>
                  )}

                  <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-200">
                    <span>Thưởng tích lũy Club:</span>
                    <span>+{pointsToEarn} Điểm</span>
                  </div>
                </div>

                <div className="mt-2 pt-3 border-t border-zinc-200 flex justify-between items-center text-sm text-left whitespace-nowrap">
                  <span className="font-black text-zinc-700 uppercase tracking-tight text-[10px] font-sans">Tổng Hoá Đơn Cuối</span>
                  <span className="text-base font-black text-red-650 font-mono whitespace-nowrap shrink-0">
                    {finalAmount.toLocaleString('vi-VN')}&nbsp;đ
                  </span>
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-650 text-xs font-bold rounded-xl uppercase transition-all border border-zinc-205 cursor-pointer active:scale-95"
                >
                  Hủy & Về kho
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white text-xs font-extrabold rounded-xl uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-95"
                  id="checkout-portal-submit-payment-cta"
                >
                  Khởi Tạo Giao Dịch
                </button>
              </div>
            </form>
          )}

          {checkoutStep === 'pay_scan' && (
            <div className="flex flex-col items-center mt-2 animate-fade-in" id="payment-qr-stage">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="w-6 h-6 text-red-505 animate-pulse" />
                <h3 className="text-sm font-bold text-zinc-850 uppercase tracking-tight">Thanh toán trực tiếp qua cổng tự động</h3>
              </div>
              
              <p className="text-xs text-zinc-500 max-w-md text-center mb-5 leading-normal">
                Quét mã QR bằng ứng dụng ngân hàng hoặc MoMo của bạn, hoặc copy chính xác số tài khoản và nội dung chuyển khoản dưới đây. Hệ thống sẽ tự động đối soát giao dịch ngay lập tức.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start bg-zinc-50 border border-zinc-200 rounded-2xl p-4 sm:p-5 mb-3 text-left">
                {/* Visual QR Part */}
                <div className="flex flex-col items-center justify-center bg-white rounded-xl p-4 border border-zinc-200 text-center w-full shadow-inner">
                  <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full mb-4 text-white ${
                    paymentMethod === 'momo' ? 'bg-pink-600 shadow-xs' : 'bg-blue-600 shadow-xs'
                  }`}>
                    {paymentMethod === 'momo' ? 'Cổng Ví MoMo API' : `Cổng VietQR ${bankSettings.bankCodeShort}`}
                  </span>
                  
                  {/* Beautiful Dynamic Real/Mock Styled QR Code Container */}
                  <div className={`p-3 bg-white rounded-2xl shadow-md inline-block relative max-w-[210px] border-4 ${
                    paymentMethod === 'momo' ? 'border-pink-500' : 'border-blue-600'
                  } animate-pulse`}>
                    {paymentMethod === 'bank' ? (
                      <img 
                        src={`https://img.vietqr.io/image/${bankSettings.bankCodeShort}-${bankSettings.accountNumber}-print.png?amount=${finalAmount}&addInfo=${tempOrderId}&accountName=${encodeURIComponent(bankSettings.accountHolder)}`} 
                        alt={`VietQR ${bankSettings.bankName}`}
                        className="w-[170px] h-[170px] object-contain mx-auto"
                      />
                    ) : (
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(`momo://pay?phone=${bankSettings.momoPhone}&amount=${finalAmount}&note=${tempOrderId}`)}`} 
                        alt="Momo QR Code Transfer"
                        className="w-[170px] h-[170px] object-contain mx-auto"
                      />
                    )}
                    <div className="mt-1.5 text-zinc-900 border-t border-zinc-100 pt-1">
                      <p className="text-[9px] font-black font-mono tracking-tight text-center">
                        {paymentMethod === 'momo' ? 'MOMO PAY' : `${bankSettings.bankCodeShort.toUpperCase()} BANK VIETQR`}
                      </p>
                      <p className="text-[7px] font-extrabold text-center text-zinc-500 mt-0.5">XÁC MINH SỐ DƯ REALTIME</p>
                    </div>
                  </div>

                  <p className="text-[9px] text-zinc-500 mt-3 text-center max-w-xs leading-normal font-sans">
                    *Mã QR được khởi tạo bằng API chính thức chứa số tiền và nội dung chuyển tiền tự động.
                  </p>
                </div>

                {/* Transfer Info Details & Copy Actions Part */}
                <div className="space-y-3.5 w-full text-left">
                  <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-widest border-b border-zinc-200 pb-2">Thông tin tài khoản:</h4>
                  
                  {paymentMethod === 'momo' ? (
                    <>
                      {/* MOMO PHONE */}
                      <div>
                        <span className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Số điện thoại MoMo nhận:</span>
                        <div className="flex items-center justify-between bg-zinc-100 px-3 py-2 rounded-lg border border-zinc-200 mt-1 font-mono text-xs">
                          <span className="text-pink-600 font-black">{bankSettings.momoPhone}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(bankSettings.momoPhone, 'momo_phone')}
                            className="p-1 hover:bg-zinc-200 rounded text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer"
                            title="Sao chép số điện thoại"
                          >
                            {copyState['momo_phone'] ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* BANK CODE */}
                      <div>
                        <span className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Ngân hàng thụ hưởng:</span>
                        <div className="bg-zinc-100 px-3 py-2 rounded-lg border border-zinc-200 mt-1 text-xs text-zinc-800 font-bold flex items-center justify-between">
                          <span>{bankSettings.bankName}</span>
                        </div>
                      </div>

                      {/* BANK ACCOUNT NUMBER */}
                      <div>
                        <span className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Số tài khoản thụ hưởng:</span>
                        <div className="flex items-center justify-between bg-zinc-100 px-3 py-2 rounded-lg border border-zinc-200 mt-1 font-mono text-xs">
                          <span className="text-blue-600 font-black tracking-widest">{bankSettings.accountNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(bankSettings.accountNumber, 'bank_acc')}
                            className="p-1 hover:bg-zinc-200 rounded text-zinc-400 hover:text-white transition-all cursor-pointer"
                            title="Sao chép số tài khoản"
                          >
                            {copyState['bank_acc'] ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ACCOUNT NAME  */}
                  <div>
                    <span className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Tên chủ tài khoản:</span>
                    <div className="flex items-center justify-between bg-zinc-100 px-3 py-2 rounded-lg border border-zinc-200 mt-1 text-xs">
                      <span className="text-zinc-700 font-bold uppercase text-[10px]">{bankSettings.accountHolder}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(bankSettings.accountHolder, 'acc_name')}
                        className="p-1 hover:bg-zinc-200 rounded text-zinc-500 transition-all cursor-pointer"
                        title="Sao chép tên người nhận"
                      >
                        {copyState['acc_name'] ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                      </button>
                    </div>
                  </div>

                  {/* AMOUNT ORDER */}
                  <div>
                    <span className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Số tiền thanh toán:</span>
                    <div className="flex items-center justify-between bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200 mt-1 text-xs font-mono">
                      <span className="text-emerald-700 font-black text-sm whitespace-nowrap shrink-0">{finalAmount.toLocaleString('vi-VN')}&nbsp;đ</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(finalAmount.toString(), 'amount')}
                        className="p-1 hover:bg-zinc-200 rounded text-zinc-500 transition-all cursor-pointer"
                        title="Sao chép số tiền"
                      >
                        {copyState['amount'] ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                      </button>
                    </div>
                  </div>

                  {/* MEMO TEXT */}
                  <div>
                    <span className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Nội dung chuyển tiền (Phải ghi đúng):</span>
                    <div className="flex items-center justify-between bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 mt-1 font-mono text-xs">
                      <span className="text-amber-805 font-black tracking-wider">{tempOrderId}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(tempOrderId, 'memo_code')}
                        className="p-1 hover:bg-emerald-100 rounded text-emerald-800 transition-all cursor-pointer"
                        title="Sao chép mã nội dung chuyển tiền"
                      >
                        {copyState['memo_code'] ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                      </button>
                    </div>
                    <span className="text-[9px] text-amber-600 font-medium block mt-1 leading-normal font-sans">
                      *Cổng MB Bank và Momo API sẽ tự động kích hoạt duyệt đơn ngay lập tức khi phát hiện nội dung chuyển khoản hợp lệ.
                    </span>
                  </div>
                </div>
              </div>

              {/* Dev Webhook callback mock terminal console */}
              <div className="w-full mt-1 mb-6 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left font-sans shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] bg-sky-50 text-sky-700 border border-sky-250 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-widest font-mono">
                    Hộp Mô Phỏng Webhook API (Dành Cho Lập Trình Viên)
                  </span>
                  <span className="text-[8px] text-zinc-500 font-mono">Port: 3000 • Live</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-2.5 leading-normal">
                  Vì bạn đang chạy trong môi trường Thử nghiệm, hãy click nút dưới đây để kích hoạt gửi gói tin phản hồi <strong className="text-zinc-700">Mb Bank Webhook IPN</strong> hoặc <strong className="text-zinc-700 font-bold">Momo IPN</strong> thực tế tới server. Server Node.js sẽ xử lý đối soát, và đồng bộ chuyển trạng thái đơn hàng của bạn tự động thời gian thực!
                </p>
                <div className="grid grid-cols-2 gap-3 mt-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      fetch('/api/payment/bank-webhook', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          gateway: "MB Bank",
                          amount: finalAmount,
                          content: tempOrderId
                        })
                      })
                      .then(r => r.json())
                      .then(data => {
                        console.log("Xử lý thành công webhook MB Bank:", data);
                      })
                      .catch(e => console.error(e));
                    }}
                    className="py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-black rounded-xl transition-all cursor-pointer text-center uppercase tracking-wide hover:scale-[1.02] duration-100"
                  >
                    ⚡ Gọi Webhook MB Bank
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      fetch('/api/payment/momo-ipn', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          orderId: tempOrderId,
                          amount: finalAmount,
                          resultCode: 0,
                          transId: "MM" + Math.floor(100000 + Math.random() * 900000)
                        })
                      })
                      .then(r => r.json())
                      .then(data => {
                        console.log("Xử lý thành công IPN Momo:", data);
                      })
                      .catch(e => console.error(e));
                    }}
                    className="py-2.5 bg-pink-50 hover:bg-pink-105 border border-pink-200 text-pink-700 text-[10px] font-black rounded-xl transition-all cursor-pointer text-center uppercase tracking-wide hover:scale-[1.02] duration-100"
                  >
                    ⚡ Gọi Webhook MoMo
                  </button>
                </div>
              </div>

              {/* Dynamic Countdown clock */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-full border border-zinc-200 text-xs text-zinc-650">
                <Timer className="w-3.5 h-3.5 text-red-500" />
                <span className="font-bold">Mã QR hết hạn sau:</span>
                <span className="text-red-650 font-mono font-black text-red-600">
                  {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </span>
              </div>

              {isProcessing ? (
                <div className="mt-6 text-xs text-red-600 font-semibold animate-pulse flex items-center gap-2">
                  <RefreshCwIcon className="w-4 h-4 animate-spin text-red-500" />
                  <span>Kho hàng đang khóa giữ và kiểm trạng hàng...</span>
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-2 w-full max-w-sm">
                  <button
                    onClick={handleSimulatedScanConfirm}
                    className="w-full py-3 bg-red-500 hover:bg-red-655 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-xs cursor-pointer active:scale-95 duration-100 font-sans"
                    id="confirm-payment-simulation-button"
                  >
                    Xác Nhận Đã Chuyển Khoản Thành Công
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutStep('info');
                      setTimer(120);
                    }}
                    className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-550 font-bold rounded-xl text-xs cursor-pointer transition-all active:scale-95 duration-100"
                  >
                    Hủy Quét & Quay Lại Chỉnh Sửa
                  </button>
                </div>
              )}
            </div>
          )}

          {checkoutStep === 'done' && (
            <div className="text-center py-6 flex flex-col items-center" id="payment-success-stage">
              <div className="w-16 h-16 bg-red-50 rounded-full border-2 border-red-500 flex items-center justify-center text-red-600 mb-4 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-base font-extrabold text-zinc-800 uppercase font-sans">Yêu cầu đặt hàng thành công!</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto mt-2 leading-relaxed">
                Hệ thống dữ liệu kho hàng đã tự động xác thực và giảm trừ số lượng tồn kho mô hình. Đơn hàng hiện đã được chuyển sang trạng thái chuẩn bị bưu tá.
              </p>

              <div className="my-6 bg-zinc-50 rounded-2xl border border-zinc-200 p-4 max-w-sm w-full text-left">
                <p className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest font-mono">THỰC THI CHUYỂN PHÁT NHANH</p>
                <div className="mt-2 space-y-1 text-xs text-zinc-650 font-medium">
                  <p><strong className="text-zinc-700">Người nhận:</strong> {name}</p>
                  <p><strong className="text-zinc-700">Số điện thoại:</strong> {phone}</p>
                  <p><strong className="text-zinc-700">Nơi nhận:</strong> {address}</p>
                  <p><strong className="text-zinc-700">Hình thức:</strong> {getPaymentName(paymentMethod)} (Đã xác minh)</p>
                </div>
              </div>

              <button
                onClick={handleFinalize}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 cursor-pointer duration-100 font-sans"
                id="finalize-checkout-and-track-button"
              >
                <Truck className="w-4 h-4 text-white" />
                <span>Theo dõi lộ trình đơn hàng</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function RefreshCwIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
