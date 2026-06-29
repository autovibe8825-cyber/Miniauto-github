import React, { useState } from 'react';
import { User } from '../types';
import { Award, Trophy, Crown, Gift, GiftIcon, HelpCircle, ArrowRight, ShieldCheck, Ticket, Check } from 'lucide-react';

interface LoyaltyHubProps {
  currentUser: User;
  onRedeemGift: (giftId: string, pointCost: number, giftName: string, isVoucher: boolean, voucherValue?: number) => void;
}

export default function LoyaltyHub({ currentUser, onRedeemGift }: LoyaltyHubProps) {
  const [activeTab, setActiveTab] = useState<'rewards' | 'inventory'>('rewards');
  const [successAnimationMsg, setSuccessAnimationMsg] = useState<string | null>(null);

  const loyaltyPoints = currentUser.loyaltyPoints ?? 350;
  const lifetimePoints = currentUser.lifetimePoints ?? 350;
  const redeemedGifts = currentUser.redeemedGifts ?? [];
  const vouchers = currentUser.vouchers ?? [];

  // Helper to resolve Tier
  const getTierInfo = (points: number) => {
    if (points >= 1500) {
      return {
        level: 'Gold',
        label: 'Thành viên Vàng (Gold Elite)',
        color: 'from-amber-600 to-yellow-500 text-amber-600',
        borderColor: 'border-amber-400',
        glowColor: 'shadow-amber-500/5',
        badge: Crown,
        discountRate: 10,
        perks: [
          'Giảm giá trực tiếp 10% trên toàn bộ đơn hàng',
          'Tự động gửi kèm Hộp đựng bảo quản Acrylic cao cấp có LED',
          'Vận đơn bưu tá hỏa tốc - Xử lý đóng gói siêu đặc quyền',
          'Hỗ trợ tư vấn VIP 24/7 trực tiếp từ tổng kho thành viên'
        ],
        nextMin: null,
        progressPct: 100
      };
    } else if (points >= 500) {
      return {
        level: 'Silver',
        label: 'Thành viên Bạc (Silver Pro)',
        color: 'from-zinc-500 to-zinc-400 text-zinc-600',
        borderColor: 'border-zinc-300',
        glowColor: 'shadow-zinc-500/5',
        badge: Trophy,
        discountRate: 5,
        perks: [
          'Giảm giá trực tiếp 5% trên toàn bộ đơn hàng',
          'Đóng gói 2 lớp bọt khí chống chấn động đặc biệt',
          'Ưu tiên ký gửi đơn vị vận chuyển bưu phòng',
          'Tích lũy 1.2x tốc độ điểm thưởng khi nhận hàng'
        ],
        nextMin: 1500,
        progressPct: ((points - 500) / 1000) * 100
      };
    } else {
      return {
        level: 'Bronze',
        label: 'Thành viên Đồng (Bronze Base)',
        color: 'from-orange-600 to-amber-600 text-orange-600',
        borderColor: 'border-orange-200',
        glowColor: 'shadow-orange-500/5',
        badge: Award,
        discountRate: 0,
        perks: [
          'Mức giảm giá gốc standard',
          'Đồng gói tiêu chuẩn bưu tá bọc đệm',
          'Tích điểm thưởng sau mỗi lần chốt đơn thanh toán',
          'Đổi nhiều phần quà vật lý độc quyền chỉ dành riêng thiết kế'
        ],
        nextMin: 500,
        progressPct: (points / 500) * 100
      };
    }
  };

  const currentTier = getTierInfo(lifetimePoints);

  // Gifts definition
  const AVAILABLE_REWARDS = [
    {
      id: 'reward-001',
      name: 'Đế trưng bày Mica Acrylic cao cấp',
      cost: 120,
      description: 'Chống bám bụi cực tốt, bổ sung đế lót vân gỗ tuyệt đẹp cho ô tô tỉ lệ 1:24 hoặc 1:18.',
      isVoucher: false,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'reward-002',
      name: 'Khăn tơ & Dung dịch Siêu Bóng sơn Nano',
      cost: 200,
      description: 'Làm mờ vết trầy dăm siêu nhỏ, tạo độ bóng lộng lẫy hệt như lớp sơn zin Rolls-Royce.',
      isVoucher: false,
      image: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'reward-003',
      name: 'Voucher Khuyến Mãi Cửa Hàng 100.000 đ',
      cost: 350,
      description: 'Áp dụng trực thăng khấu trừ giá trị đơn hàng lúc chốt đơn thanh toán mọi tỷ lệ.',
      isVoucher: true,
      voucherValue: 100000,
      image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'reward-004',
      name: 'Nắp Gara Gỗ có đèn LED Neon ấm áp',
      cost: 450,
      description: 'Thắp sáng toàn bộ nội thất và nắp máy siêu xe hầm hố ban đêm, cắm nguồn USB tiện dụng.',
      isVoucher: false,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'reward-005',
      name: 'Voucher Khuyến Mãi Cửa Hàng 250.000 đ',
      cost: 800,
      description: 'Voucher ưu đãi cao cho người chơi có tiềm năng. Sử dụng thanh toán trực tiếp.',
      isVoucher: true,
      voucherValue: 250000,
      image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=300&auto=format&fit=crop&q=80'
    }
  ];

  const handleRedeem = (reward: typeof AVAILABLE_REWARDS[0]) => {
    if (loyaltyPoints < reward.cost) return;

    onRedeemGift(reward.id, reward.cost, reward.name, reward.isVoucher, reward.voucherValue);

    setSuccessAnimationMsg(`Chúc mừng! Bạn đã đổi hàng thành công: "${reward.name}". Điểm số đã khấu trừ.`);
    setTimeout(() => {
      setSuccessAnimationMsg(null);
    }, 4000);
  };

  const TierBadgeIcon = currentTier.badge;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="loyalty-club-tab">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 pb-5 mb-8 gap-3 text-left">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 flex items-center gap-2 uppercase tracking-wide">
            <Crown className="w-6 h-6 text-amber-500 animate-pulse" />
            MiniAuto.store Loyalty Club • Đặc Quyền Sưu Tầm
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Ghi nhận từng giao dịch, nâng bậc tối cao nhận ưu đãi giảm giá đến 10% hóa đơn xe hợp kim kẽm!
          </p>
        </div>
        
        {/* Simple Tab Control inside */}
        <div className="flex bg-zinc-100 border border-zinc-200 rounded-xl p-0.5">
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rewards'
                ? 'bg-red-500 text-white'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Đổi Quà Tặng ({AVAILABLE_REWARDS.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-red-500 text-white'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Tủ Kho Cá Nhân
            {(vouchers.length > 0 || redeemedGifts.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {successAnimationMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <Check className="w-4 h-4 bg-emerald-500 text-white rounded-full p-0.5 font-bold" />
          <span>{successAnimationMsg}</span>
        </div>
      )}

      {/* Grid of statistics and current membership tier profile details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 text-left">
        
        {/* Tier Card Profile Info */}
        <div className={`lg:col-span-1 bg-white border border-zinc-200 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xs ${currentTier.glowColor}`}>
          <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-zinc-100/50 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest font-mono">Bảng Xếp Hạng Hạng VIP:</span>
              <span className="text-xs bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-200 text-zinc-700 font-mono font-bold">
                Mã: VIP-{currentUser.id.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-5">
              <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200">
                <TierBadgeIcon className="w-9 h-9 text-amber-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black italic uppercase text-zinc-800 tracking-tight">{currentTier.label}</h3>
                <span className="text-[10px] text-red-650 tracking-wider font-extrabold uppercase bg-red-50 border border-red-200 px-2 py-0.5 rounded mt-1.5 inline-block">
                  {currentTier.discountRate > 0 ? `Giảm giá VIP: ${currentTier.discountRate}% Hóa Đơn` : 'Standard Price tier'}
                </span>
              </div>
            </div>

            {/* Loyalty points dynamic status */}
            <div className="grid grid-cols-2 gap-4 mt-6 bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Điểm khả dụng:</p>
                <p className="text-2xl font-black text-amber-650 font-mono mt-0.5">{loyaltyPoints} <span className="text-xs font-bold text-zinc-500">đ</span></p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Tích lũy trọn đời:</p>
                <p className="text-2xl font-black text-zinc-850 font-mono mt-0.5">{lifetimePoints} <span className="text-xs font-bold text-zinc-500">đ</span></p>
              </div>
            </div>
          </div>

          {/* Progress to next Tier level bar */}
          <div className="mt-6 pt-5 border-t border-zinc-200">
            {currentTier.nextMin ? (
              <div>
                <div className="flex justify-between items-center text-xs text-zinc-500 mb-2">
                  <span className="font-bold text-zinc-650">Cấp kế tiếp: <b>{currentTier.level === 'Bronze' ? 'Bạc (500đ)' : 'Vàng (1500đ)'}</b></span>
                  <span className="text-zinc-500 font-mono">Đủ {lifetimePoints}/{currentTier.nextMin}đ</span>
                </div>
                
                {/* Visual bar progress */}
                <div className="w-full bg-zinc-100 border border-zinc-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-amber-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${currentTier.progressPct}%` }}
                  />
                </div>
                <p className="text-[10.5px] text-zinc-500 mt-2 font-medium leading-relaxed">
                  Thiếu <b>{currentTier.nextMin - lifetimePoints} điểm</b> nữa để nâng cấp. Mua xe và tích điểm ngay nào!
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-amber-600 flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
                  👑 Thượng đỉnh Hoàng Kim Elite
                </p>
                <p className="text-xs text-zinc-550 leading-relaxed">
                  Bạn đang nắm giữ đặc quyền cao cấp nhất cửa hàng. Mọi giao dịch được khấu trừ trực tiếp 10% một cách thông minh tự động!
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Perks list panels */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Quyền Lợi Thẻ Sưu Tầm Theo Xếp Hạng Hạng VIP:
            </h3>

            {/* Bronze vs Silver vs Gold bento perks description */}
            <div className="space-y-4">
              
              {/* Gold elite perks highlight */}
              <div className={`p-4 rounded-2xl border transition-all ${currentTier.level === 'Gold' ? 'bg-amber-50/50 border-amber-300' : 'bg-zinc-50/50 border-zinc-150 opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider italic font-sans">Hạng Vàng Hoàng Kim (Gold Elite)</span>
                  </div>
                  <span className="text-[10px] text-amber-600 font-bold font-mono">Từ 1500đ tích lũy</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-zinc-650">
                  <li className="flex items-center gap-1"><span className="text-amber-500 font-bold">✔</span> Giảm 10% toàn cửa hàng</li>
                  <li className="flex items-center gap-1"><span className="text-amber-500 font-bold">✔</span> Free quà tặng hộp LED theo đơn</li>
                  <li className="flex items-center gap-1"><span className="text-amber-500 font-bold">✔</span> Đóng gói hỏa tốc siêu ưu tiên</li>
                  <li className="flex items-center gap-1"><span className="text-amber-500 font-bold">✔</span> Hỗ trợ đường dây nóng VIP 24/7</li>
                </ul>
              </div>

              {/* Silver pro perks highlight */}
              <div className={`p-4 rounded-2xl border transition-all ${currentTier.level === 'Silver' ? 'bg-zinc-50 border-zinc-300' : 'bg-zinc-50/50 border-zinc-150 opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-zinc-500" />
                    <span className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider italic font-sans">Hạng Bạc Chuyên Nghiệp (Silver Pro)</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold font-mono">Từ 500đ tích lũy</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-zinc-650 font-medium">
                  <li className="flex items-center gap-1"><span className="text-zinc-500 font-bold">✔</span> Giảm 5% toàn cửa hàng</li>
                  <li className="flex items-center gap-1"><span className="text-zinc-500 font-bold">✔</span> Bọc đệm chống sốc 2 lớp</li>
                  <li className="flex items-center gap-1"><span className="text-zinc-500 font-bold">✔</span> Ưu tiên bưu phòng xử lý đơn</li>
                  <li className="flex items-center gap-1"><span className="text-zinc-500 font-bold">✔</span> Tích điểm thưởng 1.2x</li>
                </ul>
              </div>

              {/* Bronze perks highlight */}
              <div className={`p-4 rounded-2xl border transition-all ${currentTier.level === 'Bronze' ? 'bg-orange-50 border-orange-200' : 'bg-zinc-50/50 border-zinc-150 opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider italic font-sans">Hạng Đồng Trải Nghiệm (Bronze Base)</span>
                  </div>
                  <span className="text-[10px] text-orange-600 font-bold font-mono">Dưới 500đ tích lũy</span>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-200 bg-zinc-50 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs leading-relaxed text-zinc-550">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span>
                Thanh toán thành công đơn hàng sẽ được <b>tích lũy ngay 1 điểm trên mỗi 10.000đ hóa đơn hoàn tất</b> để đổi quà tặng trực tiếp!
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* REWARDS TAB DISPLAY */}
      {activeTab === 'rewards' && (
        <div className="space-y-6" id="loyalty-hub-rewards-grid">
          <div className="text-left mb-4">
            <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-widest pl-1">Danh Sách Quà Tặng Đang Ở Trong Kho:</h4>
            <p className="text-xs text-zinc-500 mt-1">Gợi ý đổi ưu đãi chi tiết quý báu của nhà sưu tầm.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVAILABLE_REWARDS.map((reward) => {
              const userHasEnoughPoints = loyaltyPoints >= reward.cost;
              
              return (
                <div 
                  key={reward.id}
                  className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-red-500/35 transition-all text-left"
                >
                  <div className="relative h-40 overflow-hidden bg-zinc-100">
                    <img 
                      src={reward.image} 
                      alt={reward.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-3 left-3 bg-red-500 text-white font-mono font-black text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                      <GiftIcon className="w-3.5 h-3.5" />
                      Yêu cầu: {reward.cost} Điểm
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-extrabold pr-1">
                        {reward.isVoucher ? 'VOUCHER KHẤU TRỪ VÍ' : 'PHẦN QUÀ TRƯNG BÀY VẬT LÝ'}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-850 uppercase group-hover:text-red-600 transition-colors mt-1 line-clamp-1 font-sans">
                        {reward.name}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                        {reward.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-zinc-200">
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!userHasEnoughPoints}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer ${
                          userHasEnoughPoints
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-xs active:scale-95'
                            : 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                        }`}
                      >
                        {userHasEnoughPoints ? (
                          <>
                            <span>Xác Nhận Đổi Quà</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <span>Cần tích lũy thêm {reward.cost - loyaltyPoints} điểm</span>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIRTUAL COLLECTOR STORAGE INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="space-y-6" id="loyalty-hub-user-inventory">
          <div className="text-left mb-4">
            <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-widest pl-1">Hòm Kho Cá Nhân Của Bạn:</h4>
            <p className="text-xs text-zinc-500 mt-1">Nơi lưu giữ các quà tặng vật lý và mã Voucher đã quy đổi hoàn tất thành công.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Voucher Storage */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest border-b border-zinc-150 pb-3 mb-4 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-500" /> Vouchers Giảm Giá Sẵn Có ({vouchers.length})
              </h3>

              {vouchers.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs text-zinc-450 font-medium">Bạn chưa quy đổi và nắm giữ Voucher giảm giá nào.</p>
                  <button
                    onClick={() => setActiveTab('rewards')}
                    className="mt-3 px-4 py-1.5 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-700 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
                  >
                    Đến Chợ Đổi Quà
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {vouchers.map((v) => (
                    <div 
                      key={v.id}
                      className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between"
                    >
                      <div className="text-left">
                        <p className="text-xs font-bold text-amber-700 uppercase">{v.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-1">Mã code: <span className="font-mono text-zinc-800 font-bold bg-white border border-amber-200 px-1.5 py-0.5 rounded shadow-inner">{v.code}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-amber-805 font-mono">Giảm {(v.amount).toLocaleString('vi-VN')} đ</p>
                        <span className="text-[8px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-extrabold uppercase inline-block mt-1">Ready</span>
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-zinc-500 leading-relaxed text-center mt-3">
                    *Mã voucher này sẽ hiển thị như một tùy chọn giảm giá tự động tại màn hình Thanh toán bưu tá (Checkout).
                  </p>
                </div>
              )}
            </div>

            {/* Physical Gift Storage */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-xs font-black text-red-600 uppercase tracking-widest border-b border-zinc-150 pb-3 mb-4 flex items-center gap-2">
                <Gift className="w-4 h-4 text-red-500 animate-pulse" /> Quà Khối Trưng Bày Đã Đổi ({redeemedGifts.length})
              </h3>

              {redeemedGifts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs text-zinc-455 font-medium">Chưa có bưu phẩm quà tặng vật lý nào được chuyển đổi.</p>
                  <button
                    onClick={() => setActiveTab('rewards')}
                    className="mt-3 px-4 py-1.5 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-700 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
                  >
                    Xem Phần Thưởng Thiết Kế
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {redeemedGifts.map((name, index) => (
                    <div 
                      key={index}
                      className="bg-zinc-50 border border-zinc-150 p-3.5 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center font-bold text-red-650">
                          🎁
                        </div>
                        <p className="text-xs font-extrabold text-zinc-800 truncate pr-4">{name}</p>
                      </div>
                      <span className="text-[9px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded font-mono font-bold whitespace-nowrap">
                        Gửi kèm Đơn Sau
                      </span>
                    </div>
                  ))}
                  <p className="text-[10px] text-zinc-500 leading-relaxed text-center mt-3">
                    *Tất cả các món quà lưu niệm vật tư bọc bệ bên trên sẽ được MiniAuto.store <b>tự động gửi tặng kèm chung hộp bưu tá đóng gói đơn tiếp theo</b> của quý khách.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
