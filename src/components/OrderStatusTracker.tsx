import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus, User } from '../types';
import { Circle, CheckCircle, Package2, Truck, Check, MapPin, Compass, AlertCircle, RefreshCw, Star } from 'lucide-react';

interface OrderStatusTrackerProps {
  orders: Order[];
  onCancelOrder?: (orderId: string) => void;
  onUpdateDeliveryProgress?: (orderId: string, progress: number, status: OrderStatus) => void;
  currentUser?: User;
  onOpenCustomerAuth?: () => void;
}

export default function OrderStatusTracker({
  orders,
  onCancelOrder,
  onUpdateDeliveryProgress,
  currentUser,
  onOpenCustomerAuth
}: OrderStatusTrackerProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders.length > 0 ? orders[0].id : null
  );

  const activeOrder = orders.find((o) => o.id === selectedOrderId);
  
  // Simulated real time trigger variables
  const [isSimulatingTracking, setIsSimulatingTracking] = useState(false);
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);

  // Real-time Logistics API states (Shopee, GHN, J&T)
  const [apiTrackingDetails, setApiTrackingDetails] = useState<any | null>(null);
  const [isLoadingApiTrack, setIsLoadingApiTrack] = useState(false);

  useEffect(() => {
    if (activeOrder && ['shopee', 'ghn', 'jnt'].includes(activeOrder.carrier || '') && activeOrder.trackingCode) {
      setIsLoadingApiTrack(true);
      fetch(`/api/${activeOrder.carrier}/track/${activeOrder.trackingCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setApiTrackingDetails(data);
          } else {
            setApiTrackingDetails(null);
          }
          setIsLoadingApiTrack(false);
        })
        .catch(() => {
          setApiTrackingDetails(null);
          setIsLoadingApiTrack(false);
        });
    } else {
      setApiTrackingDetails(null);
    }
  }, [activeOrder?.id, activeOrder?.trackingCode, activeOrder?.carrier]);

  // Auto select newly placed orders
  useEffect(() => {
    if (orders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  // Handle simulated tracking loop
  useEffect(() => {
    if (isSimulatingTracking && activeOrder && onUpdateDeliveryProgress) {
      simulationInterval.current = setInterval(() => {
        const nextProgress = activeOrder.deliveryProgress + 4;
        let nextStatus: OrderStatus = activeOrder.status;

        if (nextProgress >= 100) {
          nextStatus = 'delivered';
          setIsSimulatingTracking(false);
          if (simulationInterval.current) clearInterval(simulationInterval.current);
          onUpdateDeliveryProgress(activeOrder.id, 100, 'delivered');
        } else if (nextProgress >= 70) {
          nextStatus = 'shipping';
          onUpdateDeliveryProgress(activeOrder.id, nextProgress, 'shipping');
        } else if (nextProgress >= 30) {
          nextStatus = 'preparing';
          onUpdateDeliveryProgress(activeOrder.id, nextProgress, 'preparing');
        } else {
          onUpdateDeliveryProgress(activeOrder.id, nextProgress, activeOrder.status);
        }
      }, 1000);
    } else {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    }

    return () => {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
    };
  }, [isSimulatingTracking, selectedOrderId, activeOrder?.deliveryProgress]);

  const toggleSimulation = () => {
    setIsSimulatingTracking(!isSimulatingTracking);
  };

  const getStatusStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment': return 0;
      case 'paid': return 1;
      case 'preparing': return 2;
      case 'shipping': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
    }
  };

  const steps = [
    { label: 'Thiết Lập Đơn', desc: 'Đăng ký bưu gửi' },
    { label: 'Đã Thanh Toán', desc: 'Xác thực sandbox' },
    { label: 'Chuẩn Bị Hàng', desc: 'Bọc bóng bong bóng khí' },
    { label: 'Đang Giao Hàng', desc: 'Bưu tá di chuyển' },
    { label: 'Đã Nhận Hàng', desc: 'Hoàn tất giao dịch' }
  ];

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
        return <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-bold">Chờ thanh toán</span>;
      case 'paid':
        return <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold">Đã thanh toán</span>;
      case 'preparing':
        return <span className="px-2.5 py-1 bg-yellow-50 border border-yellow-250 text-yellow-750 rounded-lg text-xs font-bold animate-pulse">Đang chuẩn bị hàng</span>;
      case 'shipping':
        return <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold">Đang giao hàng</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-lg text-xs font-bold">Đã giao hàng</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-650 rounded-lg text-xs font-bold">Đã hủy</span>;
    }
  };

  // Generate simulated dispatching history logs as time moves
  const getSimulatedLogs = (progress: number, status: OrderStatus) => {
    const logs = [];
    logs.push({ icon: '🛒', text: 'Đơn hàng được khởi tạo trên cổng MiniAuto.store', time: '10:15' });
    
    if (progress >= 5 || status !== 'pending_payment') {
      logs.push({ icon: '💳', text: 'Nhận tín hiệu giao dịch ví điện tử thành công - Chốt khóa kho tự động', time: '10:16' });
    }
    if (progress >= 30 || status === 'preparing' || status === 'shipping' || status === 'delivered') {
      logs.push({ icon: '📦', text: 'Thủ kho bọc lót chống sốc bọc bong bóng 2 lớp vào thùng car-box gỗ bảo quản', time: '10:30' });
    }
    if (progress >= 60 || status === 'shipping' || status === 'delivered') {
      logs.push({ icon: '🚛', text: 'Bưu tá bưu cục GHN tiếp nhận gói hàng, bắt đầu chuyển đi hỏa tốc', time: '11:45' });
    }
    if (progress >= 85 || status === 'delivered') {
      logs.push({ icon: '📍', text: 'Shipper đã di chuyển đến khu dân phố người nhận - Liên hệ giao hàng', time: '14:20' });
    }
    if (progress >= 100 || status === 'delivered') {
      logs.push({ icon: '🎁', text: 'Giao hàng thành công! Mô hình đã nguyên vẹn ở trong tủ kính nhà sưu tầm.', time: '14:32' });
    }

    return logs.reverse();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="order-status-tracker-tab">
      
      {/* Title */}
      <div className="mb-6 text-left">
        <h2 className="text-xl font-extrabold text-zinc-900 flex items-center gap-2 uppercase tracking-wide">
          <Truck className="w-6 h-6 text-red-500" />
          Theo Dõi Đơn Hàng Real-time
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Quản lý bưu gửi và xem xe bưu tá di chuyển trực quan trên bản đồ điện tử.</p>
      </div>

      {currentUser?.id === 'user-001' && (
        <div className="mb-6 p-4 sm:p-5 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-55 bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-black animate-pulse shrink-0">
              ℹ
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-zinc-900">Tính Năng Tra Cứu Toàn Diện Chưa Được Đồng Bộ</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Vui lòng <b>Đăng Nhập</b> hoặc <b>Đăng Ký</b> số điện thoại để đồng bộ bưu cục, tích điểm hội viên và theo dõi vị trí lịch trình giao nhận riêng biệt.</p>
            </div>
          </div>
          <button
            onClick={onOpenCustomerAuth}
            className="w-full sm:w-auto px-4.5 py-2.5 bg-red-500 hover:bg-red-650 text-white rounded-xl text-xs font-black uppercase shadow-md shadow-red-500/10 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
          >
            Đăng Nhập / Đăng Ký
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center shadow-xs animate-fade-in" id="no-orders-fallback">
          <Package2 className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-zinc-600">Chưa có đơn hàng nào</h3>
          <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Hộp đơn hàng của bạn đang trống trơn. Hãy quay lại trang Cửa hàng để sở hữu các tuyệt phẩm xế hộp đẳng cấp đầu tiên chi tiết tuyệt hảo nhé.
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left panel: list of orders */}
          <div className="lg:w-1/3 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1 text-left">Danh sách đơn hàng của bạn:</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {orders.map((order) => {
                const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
                const isSelected = order.id === selectedOrderId;

                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setIsSimulatingTracking(false);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected 
                        ? 'bg-zinc-50 border-red-500 shadow-sm' 
                        : 'bg-white border-zinc-200 hover:border-zinc-300'
                    }`}
                    id={`order-item-list-${order.id}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-extrabold text-zinc-800 font-mono truncate">MÃ ĐƠN: {order.id}</p>
                        <p className="text-[10px] text-zinc-500">{order.createdAt}</p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="text-xs text-zinc-650 border-t border-zinc-150 pt-2.5 mt-2 space-y-1">
                      <p className="truncate text-zinc-800 font-medium">🛒 {order.items[0]?.productName} {order.items.length > 1 ? `và ${order.items.length - 1} xe khác` : ''}</p>
                      <p>📦 Quy cách đóng gói: <b>Hộp bảo quản • {totalQty} chiếc</b></p>
                      <p className="font-mono text-red-600 font-bold mt-1">Tổng tiền: {order.totalAmount.toLocaleString('vi-VN')} đ</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel: Live tracker layout of the selected active order */}
          {activeOrder && (
            <div className="lg:w-2/3 space-y-6" id="active-order-tracking-stage">
              
              {/* Core Stepper Status Pipeline */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-200 mb-6">
                  <div>
                    <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider">TIẾN TRÌNH GIAO VẬN HỎA TỐC</span>
                    <h3 className="text-base font-extrabold text-zinc-800 font-mono mt-0.5">VẬN ĐƠN: {activeOrder.id}</h3>
                  </div>
                  
                  {/* Live Simulator control center */}
                  {activeOrder.status !== 'cancelled' && activeOrder.status !== 'delivered' && (
                    <button
                      onClick={toggleSimulation}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                        isSimulatingTracking
                          ? 'bg-red-500 hover:bg-red-650 text-white animate-pulse'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-red-600 border border-zinc-200'
                      }`}
                      id="tracking-mock-sim-toggle"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingTracking ? 'animate-spin' : ''}`} />
                      <span>{isSimulatingTracking ? 'Đang chạy mô phỏng vận bưu...' : 'Bắt đầu mô phỏng bưu tá di chuyển'}</span>
                    </button>
                  )}
                </div>

                {/* Progress bar line */}
                <div className="relative flex justify-between items-center w-full max-w-2xl mx-auto py-6 overflow-x-auto scroller-none mb-4" id="tracking-stepper-visual">
                  <div className="absolute top-1/2 left-4 right-4 h-1 bg-zinc-100 -translate-y-1/2 pointer-events-none" />
                  
                  {/* Active progress color overlay */}
                  <div 
                    className="absolute top-1/2 left-4 h-1 bg-gradient-to-r from-red-505 to-emerald-500 -translate-y-1/2 transition-all duration-550 pointer-events-none"
                    style={{ 
                      width: `${Math.max(0, Math.min(94, Math.max(0, getStatusStepIndex(activeOrder.status)) * 23.5))}%` 
                    }}
                  />

                  {steps.map((st, idx) => {
                    const stepIdx = getStatusStepIndex(activeOrder.status);
                    const isDone = idx <= stepIdx;

                    return (
                      <div key={idx} className="flex flex-col items-center text-center z-10 min-w-[70px]">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isDone 
                            ? 'bg-red-500 border-red-400 text-white shadow-xs' 
                            : 'bg-white border-zinc-200 text-zinc-300'
                        }`}>
                          {isDone ? (
                            <Check className="w-4 h-4 text-white stroke-[3px]" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 fill-current opacity-30 text-zinc-400" />
                          )}
                        </div>
                        <p className={`text-[10px] font-bold mt-2 ${isDone ? 'text-zinc-805' : 'text-zinc-400'}`}>{st.label}</p>
                        <p className="text-[8px] text-zinc-500 font-medium hidden sm:block mt-0.5">{st.desc}</p>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Real-time Simulated Vector Driver Route Map */}
              <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-xs text-left">
                <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-red-500 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-extrabold text-zinc-800 uppercase tracking-wide">Bản đồ bưu tá di chuyển thời gian thực</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Tên shipper: Nguyễn Văn Lâm • Điện thoại: 098****234</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-red-600">
                    Khoảng cách: {Math.max(0, 10 - Math.floor(activeOrder.deliveryProgress / 10))} km
                  </span>
                </div>

                {/* Canvas map representation element */}
                <div className="relative h-60 bg-zinc-100 overflow-hidden flex items-center justify-center p-4 shadow-inner">
                  {/* Map Grid Matrix Background */}
                  <div className="absolute inset-0 bg-dotted bg-[size:20px_20px] opacity-10" />
                  
                  {/* Map Simulated Road vector */}
                  <svg className="absolute inset-0 w-full h-full p-8" xmlns="http://www.w3.org/2000/svg">
                    {/* Simulated winding route road line */}
                    <path
                      d="M 50,150 Q 150,50 250,150 T 450,150"
                      fill="none"
                      stroke="#d4d4d8"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 50,150 Q 150,50 250,150 T 450,150"
                      fill="none"
                      stroke="#fca5a5"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      strokeLinecap="round"
                    />

                    {/* Visited road overlay */}
                    <path
                      id="car-route-path"
                      d="M 50,150 Q 150,50 250,150 T 450,150"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="1000"
                      strokeDashoffset={1000 - (1000 * activeOrder.deliveryProgress) / 100}
                      className="transition-all duration-300"
                    />
                  </svg>

                  {/* Icon point A (Shop warehouse) */}
                  <div className="absolute left-10 bottom-18 bg-red-500 text-white p-1.5 rounded-lg border border-red-400 shadow">
                    <Package2 className="w-4 h-4 text-white animate-pulse" />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white border border-zinc-200 text-zinc-800 px-2 py-0.5 rounded text-[8px] font-black whitespace-nowrap shadow-xs">
                      HOÀNG MAI HUB
                    </span>
                  </div>

                  {/* Icon point B (Customer house) */}
                  <div className="absolute right-14 top-13 bg-red-500 text-white p-1.5 rounded-lg border border-white/10 shadow">
                    <MapPin className="w-4 h-4 text-white" />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white border border-zinc-200 text-zinc-800 px-2 py-0.5 rounded text-[8px] font-black whitespace-nowrap shadow-xs max-w-[80px] truncate">
                      {activeOrder.userPhone}
                    </span>
                  </div>

                  {/* Animated moving vehicle along path (approximated position) */}
                  {activeOrder.status !== 'cancelled' && activeOrder.status !== 'pending_payment' && (
                    <div 
                      className="absolute p-2 bg-red-600 rounded-full border-2 border-white shadow-lg transition-all duration-500 z-10 flex items-center justify-center animate-bounce animate-duration-1000"
                      style={{
                        left: `${15 + (activeOrder.deliveryProgress * 0.65)}%`,
                        bottom: `${20 + Math.sin((activeOrder.deliveryProgress / 100) * Math.PI) * 28}%`
                      }}
                      id="truck-driver-vehicle"
                    >
                      <Truck className="w-4 h-4 text-white fill-current" />
                      
                      {/* Driver text badge */}
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-red-650 text-white px-1.5 py-0.5 rounded-md text-[8px] font-extrabold whitespace-nowrap border border-white shadow">
                        SHIPPER {activeOrder.deliveryProgress}%
                      </span>
                    </div>
                  )}

                  {/* Cancelled state visual */}
                  {activeOrder.status === 'cancelled' && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                      <p className="text-xs font-bold text-red-600 text-center">BẢN ĐỒ GIAO HÀNG ĐÃ ĐÓNG KHOA</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Đơn hàng này đã bị hủy hoặc chưa kích hoạt thanh toán.</p>
                    </div>
                  )}
                  
                  {/* Delivered check */}
                  {activeOrder.status === 'delivered' && (
                    <div className="absolute inset-0 bg-white/30 backdrop-blur-xs flex flex-col items-center justify-center">
                      <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow flex items-center gap-1.5 animate-pulse">
                        <CheckCircle className="w-4 h-4 text-white" />
                        <span>MÔ HÌNH ĐÃ GIAO THÀNH CÔNG!</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Shipping Updates timeline logs below */}
                <div className="p-5 border-t border-zinc-200 font-sans">
                  <h4 className="text-xs font-extrabold text-zinc-700 uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span>Nhật ký xử lý trung chuyển:</span>
                    {activeOrder.carrier === 'shopee' && (
                      <span className="text-[10px] bg-orange-550 text-white px-2 py-0.5 rounded font-black">Shopee API Connected</span>
                    )}
                    {activeOrder.carrier === 'ghn' && (
                      <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded font-black">GHN API Connected</span>
                    )}
                    {activeOrder.carrier === 'jnt' && (
                      <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black">J&T API Connected</span>
                    )}
                  </h4>
                  <div className="space-y-4">
                    {['shopee', 'ghn', 'jnt'].includes(activeOrder.carrier || '') && apiTrackingDetails ? (
                      apiTrackingDetails.milestones.map((milestone: any, idx: number) => {
                        let boxBg = 'bg-orange-50 border-orange-200';
                        let textTitleColor = 'text-orange-600';
                        let emojiSymbol = '🧡';
                        let carrierLabelName = 'Hành trình Shopee Logistics';

                        if (activeOrder.carrier === 'ghn') {
                          boxBg = 'bg-orange-50 border-orange-200';
                          textTitleColor = 'text-orange-700';
                          emojiSymbol = '💚';
                          carrierLabelName = 'Hành trình Giao Hàng Nhanh';
                        } else if (activeOrder.carrier === 'jnt') {
                          boxBg = 'bg-red-50 border-red-200';
                          textTitleColor = 'text-red-700';
                          emojiSymbol = '🔴';
                          carrierLabelName = 'Hành trình J&T Express';
                        }

                        return (
                          <div key={idx} className={`flex gap-3 text-xs leading-relaxed text-zinc-650 p-3.5 rounded-2xl border animate-fade-in text-left ${boxBg}`}>
                            <span className="text-lg shrink-0 select-none">{emojiSymbol}</span>
                            <div className="flex-1">
                              <p className={`font-extrabold flex items-center justify-between ${textTitleColor}`}>
                                <span>{milestone.label}</span>
                                <span className="text-[8px] bg-zinc-800 text-white px-1.5 py-0.5 rounded uppercase font-mono font-extrabold">API REAL</span>
                              </p>
                              <p className="text-zinc-700 font-medium mt-1 text-[11px] leading-normal">{milestone.desc}</p>
                              <span className="text-[9px] font-mono text-zinc-400 block mt-1.5 opacity-60">{carrierLabelName} • {milestone.time}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      getSimulatedLogs(activeOrder.deliveryProgress, activeOrder.status).map((log, idx) => (
                        <div key={idx} className="flex gap-3 text-xs leading-relaxed text-zinc-650 text-left">
                          <span className="text-sm shrink-0 select-none">{log.icon}</span>
                          <div className="flex-1">
                            <p className="font-extrabold text-zinc-800">{log.text}</p>
                            <span className="text-[10px] font-mono text-zinc-400 block">Thời gian hệ thống: Hôm nay • {log.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
              
              {/* Recipient Details Card */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-5 text-left shadow-xs" id="tracking-customer-card">
                <h4 className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest pb-3 border-b border-zinc-200 mb-3">
                  Thông tin khách nhận hàng:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="space-y-0.5">
                    <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Tên người nhận (Khách hàng):</p>
                    <p className="font-extrabold text-zinc-800 text-sm">{activeOrder.userName || 'Nhà Sưu Tầm Thân Thiết'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Số điện thoại bưu tá liên hệ:</p>
                    <p className="font-mono font-bold text-zinc-700">{activeOrder.userPhone || 'Yêu cầu gọi trực tiếp'}</p>
                  </div>
                  <div className="sm:col-span-2 space-y-0.5">
                    <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Địa chỉ giao xe:</p>
                    <p className="font-medium text-zinc-700">{activeOrder.userAddress}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Hình thức chi trả:</p>
                    <p className="font-semibold text-zinc-800 flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${activeOrder.paymentMethod === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {activeOrder.paymentMethod === 'online' ? 'Chuyển khoản QR (Đã duyệt)' : 'Thanh toán COD'}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Mã bưu gửi hỏa tốc & bưu cục:</p>
                    <p className="font-bold text-red-550 flex items-center gap-1 mt-0.5">
                      <span className="uppercase text-xs font-extrabold">{activeOrder.carrier || 'GHN'}</span>
                      <span className="text-zinc-600 font-mono text-[10px] bg-zinc-50 px-1.5 py-0.5 border border-zinc-200 rounded font-normal tracking-tight">
                        {activeOrder.trackingCode}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Items listing inside trackers */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-5 text-left shadow-xs">
                <h4 className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest mb-3">Thông tin gói hàng:</h4>
                <div className="space-y-2">
                  {activeOrder.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-zinc-150 last:border-none">
                      <div className="flex items-center gap-3">
                        <img src={it.imageUrl} className="w-10 h-10 rounded-lg object-cover border border-zinc-200" />
                        <div className="text-left">
                          <p className="font-extrabold text-zinc-850 font-sans">{it.productName}</p>
                          <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-mono border border-red-200 mt-1 inline-block">
                            Tỉ lệ {it.scale}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-zinc-805 font-bold">{it.price.toLocaleString('vi-VN')} đ</p>
                        <p className="text-[10px] text-zinc-500">Số lượng: x{it.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
