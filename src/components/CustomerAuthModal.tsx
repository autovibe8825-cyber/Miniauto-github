import React, { useState } from 'react';
import { User, ShieldCheck, Mail, Phone, MapPin, UserCheck, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { playSuccessClick } from '../utils/audio';

interface CustomerAuthModalProps {
  onClose: () => void;
  onLoginSuccess: (userData: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    address: string;
  }) => void;
  onRegisterSuccess: (userData: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    address: string;
  }) => void;
  existingCustomers: {
    phone: string;
    name: string;
    address: string;
    loyaltyPoints: number;
    lifetimePoints: number;
    notes: string;
  }[];
}

export default function CustomerAuthModal({
  onClose,
  onLoginSuccess,
  onRegisterSuccess,
  existingCustomers
}: CustomerAuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form states
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState(''); // Default sandbox password: any or blank
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form states
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState('');

  const handleTabChange = (tab: 'login' | 'register') => {
    playSuccessClick();
    setActiveTab(tab);
    setLoginError('');
    setRegisterError('');
    setRegisterSuccessMsg('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginPhone) {
      setLoginError('Vui lòng điền số điện thoại đăng nhập!');
      return;
    }

    const cleanPhone = loginPhone.trim().replace(/\s+/g, '');
    
    // Look up in loyalty customer records as customer profile source
    const matchedCustomer = existingCustomers.find(
      c => c.phone.trim().replace(/\s+/g, '') === cleanPhone
    );

    if (matchedCustomer) {
      playSuccessClick();
      // Successful login under existing profile!
      onLoginSuccess({
        id: 'cust-' + Math.floor(1000 + Math.random() * 9000),
        email: matchedCustomer.phone + '@miniauto.customer',
        fullName: matchedCustomer.name,
        phone: matchedCustomer.phone,
        address: matchedCustomer.address
      });
      onClose();
    } else {
      // If no profile match is found, we automatically auto-register or give clear feedback.
      // Let's provide clear sandbox check or ask to register
      setLoginError('Số điện thoại chưa tồn tại trong hệ thống! Vui lòng chọn tab "Đăng Ký Mới" phía dưới.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccessMsg('');

    if (!regName.trim() || !regPhone.trim() || !regEmail.trim() || !regAddress.trim()) {
      setRegisterError('Vui lòng điền toàn bộ tất cả trường thông tin dưới đây!');
      return;
    }

    const cleanPhone = regPhone.trim().replace(/\s+/g, '');
    const alreadyExists = existingCustomers.some(
      c => c.phone.trim().replace(/\s+/g, '') === cleanPhone
    );

    if (alreadyExists) {
      setRegisterError('Số điện thoại đăng ký đã được đăng ký trên hệ thống!');
      return;
    }

    playSuccessClick();
    
    // Successfully register!
    onRegisterSuccess({
      id: 'cust-' + Math.floor(10000 + Math.random() * 90000),
      email: regEmail.trim(),
      fullName: regName.trim(),
      phone: regPhone.trim(),
      address: regAddress.trim()
    });

    setRegisterSuccessMsg('Đăng ký tài khoản thành viên thành công! Đang tự động kết nối bưu cục...');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans"
      onClick={onClose}
      id="customer-auth-modal-overlay"
    >
      <div 
        className="bg-white border border-zinc-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
        id="customer-auth-modal-card"
      >
        {/* Soft luxury amber/red backdrop glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5.5 h-5.5 text-red-600 animate-pulse" />
            <h3 className="text-sm font-black text-zinc-900 tracking-wider uppercase font-display">
              Thành Viên MiniAuto.store
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 transition-colors text-sm font-bold font-mono px-2 py-1 hover:bg-zinc-150 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Selectors */}
        <div className="flex border-b border-zinc-100 bg-zinc-50/50 p-2 gap-2" id="auth-tab-buttons-container">
          <button
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-2.5 text-[11px] sm:text-xs font-black uppercase text-center rounded-xl transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white border border-zinc-200 text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-2.5 text-[11px] sm:text-xs font-black uppercase text-center rounded-xl transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white border border-zinc-200 text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50'
            }`}
          >
            Đăng Ký Mới
          </button>
        </div>

        {/* Auth Body Forms container */}
        <div className="p-6">
          {activeTab === 'login' ? (
            /* LOGIN FORM COMPONENTS */
            <form onSubmit={handleLoginSubmit} className="space-y-4" id="customer-login-form">
              <p className="text-[11.5px] text-zinc-600 leading-relaxed font-medium">
                Sử dụng số điện thoại cá nhân của bạn để đăng nhập vào hộc tủ bưu chính cá nhân và kiểm tra trạng thái di chuyển bưu gửi trực tiếp trên bản đồ Sandbox.
              </p>

              {loginError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[10.5px] font-bold p-3 rounded-xl flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] text-zinc-500 font-extrabold uppercase block pl-1">
                  Số điện thoại của bạn:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0912345678"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-950 font-medium outline-none transition-all placeholder-zinc-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] text-zinc-500 font-extrabold uppercase block pl-1">
                  Mật khẩu liên kết (Tự Chọn):
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Bỏ trống hoặc nhập bất kỳ"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-red-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-zinc-950 font-medium outline-none transition-all placeholder-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs py-1 px-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Suggestions / Hints */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10.5px] text-amber-900 leading-normal flex flex-col gap-1">
                <span className="font-bold text-amber-950">💡 THÔNG TIN KHÁCH HÀNG DEMO CÓ SẴN TRÊN HÊ THỐNG:</span>
                <span>• SĐT: <b className="font-mono bg-amber-100 border border-amber-200 px-1 py-0.5 rounded text-amber-950">0912345678</b> (Nhà Sưu Tầm Đẳng Cấp)</span>
                <span>• SĐT: <b className="font-mono bg-amber-100 border border-amber-200 px-1 py-0.5 rounded text-amber-950">0988667788</b> (Anh Trần Hoàng Minh)</span>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-2.5 bg-zinc-100 hover:bg-zinc-205 border border-zinc-200 text-zinc-700 hover:text-zinc-900 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer"
                >
                  Bỏ Qua
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-[11px] font-bold uppercase transition-all shadow-md shadow-red-500/10 cursor-pointer"
                >
                  Đăng Nhập Ngay
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM COMPONENTS */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5" id="customer-register-form">
              <p className="text-[11.5px] text-zinc-600 leading-relaxed font-medium">
                Đăng ký tài khoản thành viên mới để nhận ngay voucher tân thủ 100K tự động kích hoạt thẳng vào ví bưu gửi của bạn!
              </p>

              {registerError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[10.5px] font-bold p-3 rounded-xl flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{registerError}</span>
                </div>
              )}

              {registerSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10.5px] font-bold p-3 rounded-xl leading-relaxed flex items-center gap-1.5 font-sans animate-pulse">
                  <UserCheck className="w-4.5 h-4.5 text-emerald-600" />
                  <span>{registerSuccessMsg}</span>
                </div>
              )}

              {/* Registration Input Fields Grid */}
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-zinc-500 font-extrabold uppercase block pl-1">Họ và tên của bạn:</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Nhập đầy đủ Họ và Tên"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-red-500 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-950 font-medium outline-none transition-all placeholder-zinc-400"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-zinc-500 font-extrabold uppercase block pl-1">Số điện thoại:</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="Ví dụ: 0988667788"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-red-500 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-950 font-medium outline-none transition-all placeholder-zinc-400"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-zinc-500 font-extrabold uppercase block pl-1">Email bưu thư:</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="ví dụ: khachhang@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-red-500 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-950 font-medium outline-none transition-all placeholder-zinc-400"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-zinc-500 font-extrabold uppercase block pl-1">Địa chỉ giao hàng mặc định:</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Nhập số nhà, ngõ ngách, tên đường, tỉnh thành"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-red-500 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-950 font-medium outline-none transition-all placeholder-zinc-400"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-zinc-500 font-extrabold uppercase block pl-1">Mật khẩu:</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Đặt mật khẩu của riêng bạn"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-red-500 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-950 font-medium outline-none transition-all placeholder-zinc-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-2 bg-zinc-100 hover:bg-zinc-205 border border-zinc-200 text-zinc-700 hover:text-zinc-950 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer"
                >
                  Bỏ Qua
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl text-[11px] font-bold uppercase transition-all shadow-md shadow-red-500/10 cursor-pointer"
                >
                  Đăng Ký Ngay
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
