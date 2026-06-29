import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, Order, User, OrderStatus, PaymentMethod, AdminNotification, BankSettings } from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutPortal from './components/CheckoutPortal';
import OrderStatusTracker from './components/OrderStatusTracker';
import AdminDashboard from './components/AdminDashboard';
import SmartRecommendations from './components/SmartRecommendations';
import LoyaltyHub from './components/LoyaltyHub';
import CustomerAuthModal from './components/CustomerAuthModal';
import { Sparkles, Trophy, ShieldAlert, ShieldCheck, BadgeCheck, Clock, Bookmark, Heart, Send, Bell, BellRing, Volume2, X, RefreshCw, ChevronRight, Flame, Check, Zap, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { playChimeSound, playSuccessClick } from './utils/audio';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // 1. Data states persistent loads database
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('miniauto_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse products', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('miniauto_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse orders', e);
      }
    }
    
    // Default initial mock order to demonstrate beautiful tracking out of the box!
    return [
      {
        id: 'OD-77983',
        userId: 'user-001',
        userName: 'Nguyễn Toàn Thắng',
        userPhone: '0978223123',
        userAddress: '88 Láng Hạ, Quận Đống Đa, Hà Nội',
        items: [
          {
            productId: 'prod-004',
            productName: 'Toyota AE86 Trueno Initial D Spirit',
            brand: 'Toyota',
            scale: '1:24',
            price: 680000,
            imageUrl: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop&q=80',
            quantity: 1
          }
        ],
        totalAmount: 680000,
        status: 'shipping',
        paymentMethod: 'momo' as PaymentMethod,
        paymentStatus: 'success',
        createdAt: 'Hôm nay lúc 09:30',
        updatedAt: 'Hôm nay lúc 09:30',
        deliveryProgress: 42,
        deliveryRouteIndex: 2
      }
    ];
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('miniauto_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
    return {
      id: 'user-001',
      email: 'miniauto.store@gmail.com',
      fullName: 'Nhà Sưu Tầm Đẳng Cấp',
      phone: '0912345678',
      address: '72 Nguyễn Trãi, Thanh Xuân, Hà Nội',
      role: 'customer',
      loyaltyPoints: 350,
      lifetimePoints: 350,
      redeemedGifts: [],
      vouchers: [
        { id: 'vch-hello-50k', name: 'Voucher Chào Mừng Lính Mới', amount: 50000, code: 'HELLOMINIAUTO50K' }
      ],
      viewHistory: ['prod-004']
    };
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('miniauto_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    return [];
  });

  // Wishlist: array of product IDs
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('miniauto_wishlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse wishlist', e);
      }
    }
    return [];
  });

  // Admin real-time notifications
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(() => {
    const saved = localStorage.getItem('miniauto_admin_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse admin notifications', e);
      }
    }
    return [
      {
        id: 'NF-init01',
        title: 'Hệ thống kích hoạt',
        message: 'Tổng phân kho MiniAuto.store đã kết nối thành công. Đang đứng lớp sẵn sàng nhận đơn đặt hàng mô hình.',
        time: 'Hôm nay',
        orderId: '',
        read: false
      }
    ];
  });

  // Hot toast notification banner overlays
  const [adminToast, setAdminToast] = useState<AdminNotification | null>(null);
  const [voucherToast, setVoucherToast] = useState<{ text: string; success: boolean } | null>(null);
  const [globalToast, setGlobalToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: 'success' | 'info' | 'error' }>;
      if (customEvent.detail) {
        setGlobalToast({
          message: customEvent.detail.message,
          type: customEvent.detail.type || 'info'
        });
      }
    };
    
    window.addEventListener('autovibe-toast', handleToastEvent);
    return () => {
      window.removeEventListener('autovibe-toast', handleToastEvent);
    };
  }, []);

  useEffect(() => {
    if (globalToast) {
      const timer = setTimeout(() => {
        setGlobalToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [globalToast]);

  // CRM customer database state
  const [customers, setCustomers] = useState<{
    phone: string;
    name: string;
    address: string;
    loyaltyPoints: number;
    lifetimePoints: number;
    notes: string;
  }[]>(() => {
    const saved = localStorage.getItem('miniauto_customers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        phone: '0912345678',
        name: 'Nhà Sưu Tầm Đẳng Cấp',
        address: '72 Nguyễn Trãi, Thanh Xuân, Hà Nội',
        loyaltyPoints: 350,
        lifetimePoints: 350,
        notes: 'Khách VIP chuyên sưu tầm xe thể thao tỷ lệ 1:18. Thích lót nhung bệ.'
      },
      {
        phone: '0988667788',
        name: 'Anh Trần Hoàng Minh',
        address: '15 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
        loyaltyPoints: 1200,
        lifetimePoints: 1200,
        notes: 'Khách thích sơn bóng Nano bóng loáng. Hay mua xe Roll-Royce siêu dài.'
      },
      {
        phone: '0905554433',
        name: 'Chị Nguyễn Phương Thảo',
        address: '42 Phùng Hưng, Hoàn Kiếm, Hà Nội',
        loyaltyPoints: 150,
        lifetimePoints: 650,
        notes: 'Mẹ mua quà sinh nhật cho con trai. Cần bọc quà thắt nơ đỏ cẩn thận.'
      }
    ];
  });

  // Customizable Admin Vouchers list
  const [adminVouchers, setAdminVouchers] = useState<{ code: string; name: string; amount: number; description: string; }[]>(() => {
    const saved = localStorage.getItem('miniauto_admin_vouchers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse admin vouchers', e);
      }
    }
    return [
      { code: 'VIBENEW100', name: 'Mã Giảm Giá Tân Thủ Gia Nhập', amount: 100000, description: 'Cho đơn hàng xe mô hình tĩnh bất kỳ' },
      { code: 'VIBESUPER150', name: 'Mã Giảm Giá Mô Hình Siêu Xe Cao Cấp', amount: 150000, description: 'Áp dụng cho dòng Supercar đúc tĩnh' },
      { code: 'AUTOSHIP40', name: 'Mã Miễn Phí Vận Chuyển Toàn Quốc', amount: 40000, description: 'Tất cả hãng vận chuyển toàn quốc' }
    ];
  });

  // Ticker tape running notice slogan
  const [marqueeNotice, setMarqueeNotice] = useState<string>(() => {
    return localStorage.getItem('miniauto_marquee_notice') || '🔥 KHUYẾN MÃI ĐẶC BIỆT: Giảm giá 10% cho tất cả các sản phẩm xe mô hình tĩnh duy nhất tuần này! Miễn phí vận chuyển hỏa tốc toàn quốc!';
  });

  // Customizable Bank & Email settings
  const [bankSettings, setBankSettings] = useState<BankSettings>(() => {
    const saved = localStorage.getItem('miniauto_bank_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          adminUsername: parsed.adminUsername || 'admin',
          adminPassword: parsed.adminPassword || '123'
        };
      } catch (e) {}
    }
    return {
      bankName: 'MB BANK (Ngân hàng Quân Đội)',
      accountNumber: '19035658825',
      accountHolder: 'TO THE ANH',
      momoPhone: '0919288258',
      bankCodeShort: 'MB',
      adminEmail: 'autovibe8825@gmail.com',
      adminUsername: 'admin',
      adminPassword: '123'
    };
  });

  useEffect(() => {
    localStorage.setItem('miniauto_bank_settings', JSON.stringify(bankSettings));
  }, [bankSettings]);

  // Automated SMTP email notifications outbox state
  const [sentEmails, setSentEmails] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('miniauto_sent_emails');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('miniauto_sent_emails', JSON.stringify(sentEmails));
  }, [sentEmails]);

  // Admin access authenticator
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showAdminRecovery, setShowAdminRecovery] = useState(false);
  const [adminLoginUser, setAdminLoginUser] = useState('');
  const [adminLoginPass, setAdminLoginPass] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [revealedCredentials, setRevealedCredentials] = useState<{user: string, pass: string} | null>(null);

  // Customer registration and authorization states
  const [showCustomerAuthModal, setShowCustomerAuthModal] = useState(false);
  const [showcaseImgError, setShowcaseImgError] = useState(false);

  useEffect(() => {
    setShowcaseImgError(false);
  }, [bankSettings.showcaseProductId]);

  // 2. UI interaction states
  const [activeTab, setActiveTab] = useState<'shop' | 'tracking' | 'loyalty' | 'admin'>('shop');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedScale, setSelectedScale] = useState('all');
  const [showOnlyWishlist, setShowOnlyWishlist] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Load initial data from PostgreSQL/Supabase database on mount
  useEffect(() => {
    console.log("%c[DB DIAGNOSTIC] Bắt đầu đồng bộ hóa dữ liệu từ PostgreSQL/Supabase...", "color: #2563eb; font-weight: bold; font-size: 13px;");

    // 1. Fetch Products from Database
    console.log("[DB DIAGNOSTIC] 1. Đang fetch: /api/db/products");
    fetch('/api/db/products')
      .then(async r => {
        console.log(`[DB DIAGNOSTIC] Phản hồi /api/db/products: Status = ${r.status} (${r.statusText}), Ok = ${r.ok}`);
        const data = await r.json();
        if (!r.ok || !data.success) {
          throw new Error(`API thất bại: ${data.error || r.statusText || 'Không rõ nguyên nhân'}`);
        }
        return data;
      })
      .then(data => {
        console.log(`[DB DIAGNOSTIC SUCCESS] Tải thành công sản phẩm! Số lượng: ${data.products?.length || 0}`, data);
        if (data.success && data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          console.warn("[DB DIAGNOSTIC WARNING] Không có sản phẩm nào được trả về từ cơ sở dữ liệu.");
        }
      })
      .catch(e => {
        console.error("%c[DB DIAGNOSTIC ERROR] Lỗi tải sản phẩm từ DB:", "color: #ef4444; font-weight: bold;", e);
      });

    // 2. Fetch Orders from Database
    console.log("[DB DIAGNOSTIC] 2. Đang fetch: /api/db/orders");
    fetch('/api/db/orders')
      .then(async r => {
        console.log(`[DB DIAGNOSTIC] Phản hồi /api/db/orders: Status = ${r.status} (${r.statusText}), Ok = ${r.ok}`);
        const data = await r.json();
        if (!r.ok || !data.success) {
          throw new Error(`API thất bại: ${data.error || r.statusText || 'Không rõ nguyên nhân'}`);
        }
        return data;
      })
      .then(data => {
        console.log(`[DB DIAGNOSTIC SUCCESS] Tải thành công đơn hàng! Số lượng: ${data.orders?.length || 0}`, data);
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      })
      .catch(e => {
        console.error("%c[DB DIAGNOSTIC ERROR] Lỗi tải đơn hàng từ DB:", "color: #ef4444; font-weight: bold;", e);
      });

    // 3. Fetch Bank Settings from Database
    console.log("[DB DIAGNOSTIC] 3. Đang fetch: /api/db/bank-settings");
    fetch('/api/db/bank-settings')
      .then(async r => {
        console.log(`[DB DIAGNOSTIC] Phản hồi /api/db/bank-settings: Status = ${r.status} (${r.statusText}), Ok = ${r.ok}`);
        const data = await r.json();
        if (!r.ok || !data.success) {
          throw new Error(`API thất bại: ${data.error || r.statusText || 'Không rõ nguyên nhân'}`);
        }
        return data;
      })
      .then(data => {
        console.log("[DB DIAGNOSTIC SUCCESS] Tải cấu hình ngân hàng thành công:", data.settings);
        if (data.success && data.settings) {
          setBankSettings(data.settings);
        }
      })
      .catch(e => {
        console.error("%c[DB DIAGNOSTIC ERROR] Lỗi tải cấu hình ngân hàng từ DB:", "color: #ef4444; font-weight: bold;", e);
      });

    // 4. Fetch Notifications from Database
    console.log("[DB DIAGNOSTIC] 4. Đang fetch: /api/db/notifications");
    fetch('/api/db/notifications')
      .then(async r => {
        console.log(`[DB DIAGNOSTIC] Phản hồi /api/db/notifications: Status = ${r.status} (${r.statusText}), Ok = ${r.ok}`);
        const data = await r.json();
        if (!r.ok || !data.success) {
          throw new Error(`API thất bại: ${data.error || r.statusText || 'Không rõ nguyên nhân'}`);
        }
        return data;
      })
      .then(data => {
        console.log(`[DB DIAGNOSTIC SUCCESS] Tải thông báo thành công! Số lượng: ${data.notifications?.length || 0}`, data);
        if (data.success && data.notifications) {
          setAdminNotifications(data.notifications);
        }
      })
      .catch(e => {
        console.error("%c[DB DIAGNOSTIC ERROR] Lỗi tải thông báo từ DB:", "color: #ef4444; font-weight: bold;", e);
      });

    // 5. Fetch Customers from Database
    console.log("[DB DIAGNOSTIC] 5. Đang fetch: /api/db/customers");
    fetch('/api/db/customers')
      .then(async r => {
        console.log(`[DB DIAGNOSTIC] Phản hồi /api/db/customers: Status = ${r.status} (${r.statusText}), Ok = ${r.ok}`);
        const data = await r.json();
        if (!r.ok || !data.success) {
          throw new Error(`API thất bại: ${data.error || r.statusText || 'Không rõ nguyên nhân'}`);
        }
        return data;
      })
      .then(data => {
        console.log(`[DB DIAGNOSTIC SUCCESS] Tải danh sách khách hàng thành công! Số lượng: ${data.customers?.length || 0}`, data);
        if (data.success && data.customers) {
          const formatted = data.customers.map((c: any) => ({
            phone: c.phone || '',
            name: c.fullName || '',
            address: c.address || '',
            loyaltyPoints: c.loyaltyPoints ?? 0,
            lifetimePoints: c.lifetimePoints ?? 0,
            notes: c.notes || ''
          }));
          setCustomers(formatted);
        }
      })
      .catch(e => {
        console.error("%c[DB DIAGNOSTIC ERROR] Lỗi tải khách hàng từ DB:", "color: #ef4444; font-weight: bold;", e);
      });
  }, []);

  // Synchronise state changes to local storages
  useEffect(() => {
    localStorage.setItem('miniauto_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('miniauto_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('miniauto_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('miniauto_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('miniauto_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('miniauto_admin_notifications', JSON.stringify(adminNotifications));
  }, [adminNotifications]);

  useEffect(() => {
    localStorage.setItem('miniauto_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('miniauto_admin_vouchers', JSON.stringify(adminVouchers));
  }, [adminVouchers]);

  useEffect(() => {
    localStorage.setItem('miniauto_marquee_notice', marqueeNotice);
  }, [marqueeNotice]);

  // Synchronise current client user stats if they match a customer in our loyalty DB
  useEffect(() => {
    const matched = customers.find(c => c.phone.replace(/\s+/g, '') === currentUser.phone.replace(/\s+/g, ''));
    if (matched) {
      if (currentUser.loyaltyPoints !== matched.loyaltyPoints || currentUser.lifetimePoints !== matched.lifetimePoints || currentUser.fullName !== matched.name || currentUser.address !== matched.address) {
        setCurrentUser(prev => ({
          ...prev,
          loyaltyPoints: matched.loyaltyPoints,
          lifetimePoints: matched.lifetimePoints,
          fullName: matched.name,
          address: matched.address
        }));
      }
    } else {
      // Auto register current user into the loyalty CRM database if they do not exist matches
      setCustomers(prev => {
        const phoneClean = currentUser.phone.replace(/\s+/g, '');
        if (!prev.find(c => c.phone.replace(/\s+/g, '') === phoneClean)) {
          return [
            ...prev,
            {
              phone: currentUser.phone,
              name: currentUser.fullName,
              address: currentUser.address || '',
              loyaltyPoints: currentUser.loyaltyPoints ?? 350,
              lifetimePoints: currentUser.lifetimePoints ?? 350,
              notes: 'Thành viên đăng ký mới tự động.'
            }
          ];
        }
        return prev;
      });
    }
  }, [currentUser.phone, customers]);

  // Check URL query parameters to auto-open shared product
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prdId = params.get('product') || params.get('id');
    if (prdId) {
      const match = products.find(p => p.id === prdId);
      if (match) {
        setSelectedProduct(match);
      }
    }
  }, [products]);

  // 3. System core handles
  const handleCustomerLoginSuccess = (userData: { id: string; email: string; fullName: string; phone: string; address: string; }) => {
    const matched = customers.find(c => c.phone.replace(/\s+/g, '') === userData.phone.replace(/\s+/g, ''));
    let updatedUser: User;
    if (matched) {
      updatedUser = {
        id: userData.id,
        email: userData.email,
        fullName: matched.name,
        phone: matched.phone,
        address: matched.address,
        role: 'customer',
        loyaltyPoints: matched.loyaltyPoints,
        lifetimePoints: matched.lifetimePoints,
        redeemedGifts: [],
        vouchers: currentUser.id === 'user-001' ? currentUser.vouchers : [],
        viewHistory: currentUser.viewHistory
      };
    } else {
      updatedUser = {
        ...userData,
        role: 'customer',
        loyaltyPoints: 350,
        lifetimePoints: 350,
        redeemedGifts: [],
        vouchers: [],
        viewHistory: []
      };
    }
    setCurrentUser(updatedUser);

    // Sync to PostgreSQL DB
    fetch('/api/db/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        address: updatedUser.address
      })
    }).catch(e => console.error("Lỗi đồng bộ đăng nhập lên DB:", e));

    playSuccessClick();
  };

  const handleCustomerRegisterSuccess = (userData: { id: string; email: string; fullName: string; phone: string; address: string; }) => {
    const newUser: User = {
      id: userData.id,
      email: userData.email,
      fullName: userData.fullName,
      phone: userData.phone,
      address: userData.address,
      role: 'customer',
      loyaltyPoints: 100,
      lifetimePoints: 100,
      redeemedGifts: [],
      vouchers: [
        { id: 'vch-welcome-100k', name: 'Mã Quà Tặng Thành Viên Mới', amount: 100000, code: 'WELCOME100K' }
      ],
      viewHistory: []
    };

    setCurrentUser(newUser);

    // Sync new register to PostgreSQL DB
    fetch('/api/db/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        phone: newUser.phone,
        address: newUser.address
      })
    })
    .then(() => {
      // Give initial 100 welcome loyalty points in database
      fetch(`/api/db/users/${newUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loyaltyPoints: 100,
          lifetimePoints: 100,
          vouchers: newUser.vouchers
        })
      }).catch(e => console.error(e));
    })
    .catch(e => console.error("Lỗi đồng bộ đăng ký lên DB:", e));

    // Register customer in CRM state
    setCustomers(prev => {
      const clean = userData.phone.replace(/\s+/g, '');
      if (!prev.some(c => c.phone.replace(/\s+/g, '') === clean)) {
        return [
          ...prev,
          {
            phone: userData.phone,
            name: userData.fullName,
            address: userData.address,
            loyaltyPoints: 100,
            lifetimePoints: 100,
            notes: 'Đăng ký thành viên trực tuyến mới!'
          }
        ];
      }
      return prev;
    });
  };

  const handleLogoutCustomer = () => {
    playSuccessClick();
    setCurrentUser({
      id: 'user-001',
      email: 'miniauto.store@gmail.com',
      fullName: 'Nhà Sưu Tầm Đẳng Cấp',
      phone: '0912345678',
      address: '72 Nguyễn Trãi, Thanh Xuân, Hà Nội',
      role: 'customer',
      loyaltyPoints: 350,
      lifetimePoints: 350,
      redeemedGifts: [],
      vouchers: [
        { id: 'vch-hello-50k', name: 'Voucher Chào Mừng Lính Mới', amount: 50000, code: 'HELLOMINIAUTO50K' }
      ],
      viewHistory: []
    });
    if (activeTab === 'admin' || activeTab === 'loyalty' || activeTab === 'tracking') {
      setActiveTab('shop');
    }
  };

  const handleSwitchRole = (newRole: 'customer' | 'admin') => {
    if (newRole === 'admin') {
      setAdminLoginUser('');
      setAdminLoginPass('');
      setAdminLoginError('');
      setShowAdminLoginModal(true);
    } else {
      setCurrentUser({
        ...currentUser,
        role: 'customer'
      });
      // If setting to customer, switch active tabs out of administrative pages
      if (activeTab === 'admin') {
        setActiveTab('shop');
      }
    }
  };

  const handleAddToCart = (product: Product) => {
    // Check stock limitations first
    const cartEntry = cart.find((item) => item.product.id === product.id);
    const existingQty = cartEntry ? cartEntry.quantity : 0;

    if (existingQty >= product.stock) {
      alert(`Rất tiếc! Mẫu xe ${product.name} này hiện chỉ còn tối đa ${product.stock} chiếc trong kho tự động.`);
      return;
    }

    playSuccessClick();

    if (cartEntry) {
      setCart(
        cart.map((item) => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    
    // Quick mini animation/notifier feedback
    setShowCart(true);
  };

  const handleToggleWishlist = (productId: string) => {
    playSuccessClick();
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.product.id === productId) {
          const nextQty = item.quantity + delta;
          const targetProduct = products.find((p) => p.id === productId);
          
          if (targetProduct && nextQty > targetProduct.stock) {
            alert(`Kho tự động chỉ còn tối đa ${targetProduct.stock} chiếc mẫu này.`);
            return item;
          }

          return nextQty > 0 ? { ...item, quantity: nextQty } : item;
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  // Placing order and executing loyalty updates
  const handlePlaceOrder = (details: {
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
  }) => {
    setCurrentUser((prev) => ({
      ...prev,
      fullName: details.userName || prev.fullName,
      phone: details.userPhone || prev.phone,
      address: details.userAddress || prev.address,
      email: details.userEmail || prev.email || '',
      loyaltyPoints: (prev.loyaltyPoints ?? 350) + details.pointsEarned,
      lifetimePoints: (prev.lifetimePoints ?? 350) + details.pointsEarned,
      vouchers: details.appliedVoucherId 
         ? (prev.vouchers ?? []).filter((v) => v.id !== details.appliedVoucherId) 
         : prev.vouchers
    }));

    // Update User Profile in Database if registered user
    if (currentUser.id && currentUser.id !== 'user-001') {
      fetch(`/api/db/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: details.userName,
          phone: details.userPhone,
          address: details.userAddress,
          loyaltyPoints: (currentUser.loyaltyPoints ?? 350) + details.pointsEarned,
          lifetimePoints: (currentUser.lifetimePoints ?? 350) + details.pointsEarned,
        })
      }).catch(e => console.error("Lỗi đồng bộ hồ sơ thành viên lên DB:", e));
    }

    const getProductPriceVal = (p: Product) => {
      if (p.discountPercentage && p.discountPercentage > 0) {
        return Math.floor(p.price * (1 - p.discountPercentage / 100));
      }
      return p.price;
    };

    // Prepare purchased products to list (using discount-adjusted price)
    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      brand: item.product.brand,
      scale: item.product.scale,
      price: getProductPriceVal(item.product),
      imageUrl: item.product.imageUrl,
      quantity: item.quantity
    }));

    // Deduct actual product stocks automatically inside local state (Kho hàng tự động)
    const updatedProducts = products.map((prod) => {
      const cartItem = cart.find((item) => item.product.id === prod.id);
      if (cartItem) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - cartItem.quantity)
        };
      }
      return prod;
    });

    setProducts(updatedProducts);

    // Create or use the pre-allocated checkout unique ID
    const uniqueOrderId = details.orderId || 'OD-' + Math.floor(10000 + Math.random() * 90000);

    // Generate courier dynamic shipping code (mã vận đơn)
    let shippingCode = '';
    const randomNum = Math.floor(100000000 + Math.random() * 900000000);
    if (details.carrier === 'ghn') {
      shippingCode = `GHN-VN${randomNum}`;
    } else if (details.carrier === 'jnt') {
      shippingCode = `JNT-VN${randomNum}`;
    } else if (details.carrier === 'shopee') {
      shippingCode = `SPX-VN${randomNum}`;
    } else if (details.carrier === 'ghtk') {
      shippingCode = `GHTK-TB${randomNum}`;
    } else if (details.carrier === 'viettel') {
      shippingCode = `VTP-VT${randomNum}`;
    } else {
      shippingCode = `VNP-VN${randomNum}`;
    }

    const newOrder: Order = {
      id: uniqueOrderId,
      userId: currentUser.id,
      userName: details.userName,
      userPhone: details.userPhone,
      userAddress: details.userAddress,
      userEmail: details.userEmail || currentUser.email || '',
      items: orderItems,
      totalAmount: details.finalAmount,
      status: 'paid', // Instant validation via simulated API
      paymentMethod: details.paymentMethod,
      paymentStatus: 'success',
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - Hôm nay',
      updatedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - Hôm nay',
      deliveryProgress: 4,
      deliveryRouteIndex: 0,
      carrier: details.carrier,
      trackingCode: shippingCode,
      carrierLabelPrinted: false
    };

    setOrders([newOrder, ...orders]);

    // Save order persistently in PostgreSQL/Supabase database
    fetch('/api/db/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        console.log("Đơn hàng đã lưu thành công vào database:", data.order);
      } else {
        console.error("Lỗi lưu đơn hàng vào database:", data.error);
      }
    })
    .catch(e => console.error("Lỗi mạng khi lưu đơn hàng:", e));

    // CRM update or register customer account and point balance based on phone number
    setCustomers(prev => {
      const phoneClean = details.userPhone.replace(/\s+/g, '');
      const idx = prev.findIndex(c => c.phone.replace(/\s+/g, '') === phoneClean);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          name: details.userName,
          address: details.userAddress,
          loyaltyPoints: copy[idx].loyaltyPoints + details.pointsEarned,
          lifetimePoints: copy[idx].lifetimePoints + details.pointsEarned
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            phone: details.userPhone,
            name: details.userName,
            address: details.userAddress,
            loyaltyPoints: details.pointsEarned + 100, // bonus 100 on first checkout registration
            lifetimePoints: details.pointsEarned + 100,
            notes: 'Khách hàng chốt đơn bưu tá lần đầu tiên.'
          }
        ];
      }
    });

    setCart([]); // Clear cart
    setShowCheckout(false);

    // Create real-time Admin Notification
    const adminNotif: AdminNotification = {
      id: 'NF-' + Math.floor(100000 + Math.random() * 900000),
      title: 'Đơn Hàng Mới Chốt Thành Công',
      message: `Nhà sưu tầm "${details.userName}" vừa hoàn tất đặt mua ${orderItems.length} mẫu ô tô trị giá ${details.finalAmount.toLocaleString('vi-VN')}đ. Hãng vận chuyển: ${details.carrier.toUpperCase()}`,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      orderId: uniqueOrderId,
      read: false,
      amount: details.finalAmount
    };
    
    setAdminNotifications(prev => [adminNotif, ...prev]);
    setAdminToast(adminNotif);

    // Save Notification to Database
    fetch('/api/db/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminNotif)
    }).catch(e => console.error("Lỗi đồng bộ thông báo lên DB:", e));

    // DYNAMIC AUTOMATED EMAIL DISPATCH SIMULATOR
    const emailBodyHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #3f3f46; border-radius: 16px; background-color: #18181b; color: #f4f4f5;">
        <div style="text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 15px;">
          <h1 style="color: #ef4444; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">🏎️ MINIAUTO.STORE NEW ORDER</h1>
          <p style="margin: 5px 0 0; font-size: 11px; color: #a1a1aa; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">MÁY CHỦ BÁO ĐƠN TỰ ĐỘNG (REALTIME BACKEND DIRECT)</p>
        </div>
        
        <div style="padding: 20px 0; font-size: 13px; line-height: 1.6;">
          <p style="color: #e4e4e7;">Chào sếp! Hệ thống cửa hàng vừa được tích hợp tính năng giao dịch và chốt đơn tự động. Có một đơn hàng mới vừa hoàn thành giao dịch thành công:</p>
          
          <div style="background-color: #27272a; padding: 18px; border-radius: 12px; margin: 18px 0; border: 1px solid #3f3f46;">
            <h3 style="margin-top: 0; color: #ffffff; font-size: 13px; border-bottom: 1px dashed #3f3f46; padding-bottom: 8px; font-weight: 800;">📋 THÔNG TIN VẬN ĐƠN: #${uniqueOrderId}</h3>
            <table style="width: 100%; font-size: 13px; line-height: 1.8; color: #d4d4d8;">
              <tr><td style="color: #a1a1aa; width: 140px;">Khách hàng:</td><td style="font-weight: bold; color: #ffffff;">${details.userName}</td></tr>
              <tr><td style="color: #a1a1aa;">SĐT người nhận:</td><td style="font-weight: bold; color: #ef4444;">${details.userPhone}</td></tr>
              <tr><td style="color: #a1a1aa;">Địa chỉ giao hàng:</td><td style="color: #ffffff;">${details.userAddress}</td></tr>
              <tr><td style="color: #a1a1aa;">Cổng thanh toán:</td><td><strong style="background-color: #10b981; color: #ffffff; padding: 2px 6px; border-radius: 6px; font-size: 11px;">${details.paymentMethod.toUpperCase()} (ĐÃ KIỂM SOÁT)</strong></td></tr>
              <tr><td style="color: #a1a1aa;">Đối tác bưu cục:</td><td style="color: #ffffff; font-weight: bold;">${details.carrier.toUpperCase()} (<span style="color: #38bdf8; font-family: monospace;">${shippingCode}</span>)</td></tr>
            </table>
          </div>

          <div style="margin: 20px 0;">
            <h4 style="margin: 0 0 10px; color: #ffffff; font-size: 13px; font-weight: bold; border-left: 3px solid #ef4444; padding-left: 8px;">🛒 MÔ HÌNH XE ĐÃ CHỐT:</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #d4d4d8;">
              <thead>
                <tr style="background-color: #27272a; text-align: left; border-bottom: 1px solid #3f3f46; color: #ffffff;">
                  <th style="padding: 10px; font-weight: bold;">Tên xế hộp</th>
                  <th style="padding: 10px; font-weight: bold; text-align: center;">Tỷ lệ</th>
                  <th style="padding: 10px; font-weight: bold; text-align: center;">SL</th>
                  <th style="padding: 10px; font-weight: bold; text-align: right;">Đơn giá</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems.map(item => `
                  <tr style="border-bottom: 1px solid #27272a;">
                    <td style="padding: 10px; color: #ffffff;"><strong>${item.productName}</strong><br/><span style="font-size: 10px; color: #a1a1aa;">Hãng: ${item.brand}</span></td>
                    <td style="padding: 10px; text-align: center; color: #f4f4f5; font-family: monospace;">${item.scale}</td>
                    <td style="padding: 10px; text-align: center; font-weight: bold; color: #fbbf24;">${item.quantity}</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold; color: #f87171; font-family: monospace;">${item.price.toLocaleString('vi-VN')} đ</td>
                  </tr>
                `).join('')}
                <tr style="border-top: 1px solid #3f3f46; font-weight: bold; background-color: #27272a;">
                  <td colspan="3" style="padding: 12px; text-align: right; font-size: 12px; color: #ffffff;">TỔNG THANH TOÁN (ĐÃ CHUYỂN):</td>
                  <td style="padding: 12px; text-align: right; font-size: 15px; color: #f43f5e; font-weight: 900; font-family: monospace;">${details.finalAmount.toLocaleString('vi-VN')} đ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style="font-size: 11px; color: #71717a; text-align: justify; border-top: 1px solid #27272a; padding-top: 15px; margin-top: 25px;">
            Hệ thống email tự động đã bắn thành công thư xác nhận điện tử này đến trực tiếp địa chỉ sếp cấu hình tại mục quản trị: <strong style="color: #ef4444;">${bankSettings.adminEmail}</strong>. Vui lòng truy cập phân mục Admin để tiến hành ra đơn và in phiếu dán vận chuyển cho bưu cục!
          </p>
        </div>
      </div>
    `;

    const automaticMailLog = {
      id: 'EM-' + Math.floor(100000 + Math.random() * 900000),
      recipient: bankSettings.adminEmail,
      subject: `🚨 [MiniAuto.store-Realtime] Có Đơn Hàng Mới Chốt Thành Công - Mã Vận Đơn #${uniqueOrderId}`,
      sentAt: new Date().toLocaleTimeString('vi-VN') + ' - ' + new Date().toLocaleDateString('vi-VN'),
      status: 'DELIVERED',
      bodyHtml: emailBodyHtml,
      customerName: details.userName,
      orderAmount: details.finalAmount,
      totalItems: orderItems.length
    };

    setSentEmails(prev => [automaticMailLog, ...prev]);
    playChimeSound();

    setActiveTab('tracking'); // Redirect path tracking screen
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(
      orders.map((o) => 
        o.id === orderId 
          ? { ...o, status: 'cancelled' as OrderStatus } 
          : o
      )
    );

    // Sync to database
    fetch(`/api/db/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' })
    }).catch(e => console.error("Lỗi đồng bộ hủy đơn lên DB:", e));
  };

  const handleUpdateDeliveryProgress = (orderId: string, progress: number, status: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        o.id === orderId
          ? { ...o, deliveryProgress: progress, status }
          : o
      )
    );

    // Sync to database
    fetch(`/api/db/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryProgress: progress, status })
    }).catch(e => console.error("Lỗi đồng bộ tiến trình bưu tá lên DB:", e));
  };

  const handleViewProductDetails = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      setCurrentUser((prev) => {
        const history = prev.viewHistory ?? [];
        if (history.includes(product.id)) return prev;
        return {
          ...prev,
          viewHistory: [product.id, ...history].slice(0, 20)
        };
      });
    }
  };

  const handleClaimVoucher = (voucherCode: string, name: string, amount: number) => {
    const alreadyClaimed = (currentUser.vouchers ?? []).some(v => v.code === voucherCode);
    if (alreadyClaimed) {
      setVoucherToast({
        text: `Bạn đã thu thập mã "${voucherCode}" rồi! Bạn hãy dùng ở bước thanh toán nhé.`,
        success: false
      });
      setTimeout(() => setVoucherToast(null), 3500);
      return;
    }

    const newVoucher = {
      id: 'VCH-' + Date.now() + '-' + Math.floor(Math.random() * 100),
      name,
      amount,
      code: voucherCode
    };

    setCurrentUser(prev => ({
      ...prev,
      vouchers: [...(prev.vouchers ?? []), newVoucher]
    }));

    playSuccessClick();
    setVoucherToast({
      text: `Nhận thành công mã giảm giá ${amount.toLocaleString('vi-VN')}đ (Mã: ${voucherCode}) vào ví!`,
      success: true
    });
    setTimeout(() => setVoucherToast(null), 3500);
  };


  const handleRedeemGift = (giftId: string, pointCost: number, giftName: string, isVoucher: boolean, voucherValue?: number) => {
    setCurrentUser((prev) => {
      const updatedPoints = (prev.loyaltyPoints ?? 350) - pointCost;
      const updatedGifts = prev.redeemedGifts ?? [];
      const updatedVouchers = prev.vouchers ?? [];

      if (isVoucher && voucherValue) {
        const code = 'VCH-' + Math.floor(1000 + Math.random() * 9000) + 'X';
        const newVoucher = {
          id: giftId + '-' + Date.now(),
          name: giftName,
          amount: voucherValue,
          code
        };
        return {
          ...prev,
          loyaltyPoints: updatedPoints,
          vouchers: [...updatedVouchers, newVoucher]
        };
      } else {
        return {
          ...prev,
          loyaltyPoints: updatedPoints,
          redeemedGifts: [...updatedGifts, giftName]
        };
      }
    });
  };

  // Add customized products (Admin)
  const handleAdminAddProduct = (newProductDetails: Omit<Product, 'id'>) => {
    const id = 'prod-' + (products.length + 1).toString().padStart(3, '0');
    const newProduct: Product = {
      ...newProductDetails,
      id
    };
    setProducts([newProduct, ...products]);

    // Sync to database
    fetch('/api/db/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    }).catch(e => console.error("Lỗi đồng bộ thêm sản phẩm lên DB:", e));
  };

  // Edit price or replenish stock (Admin)
  const handleAdminUpdateProduct = (productId: string, updatedFields: Partial<Product>) => {
    setProducts((prevProds) =>
      prevProds.map((p) => (p.id === productId ? { ...p, ...updatedFields } : p))
    );

    // Sync to database
    fetch(`/api/db/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    }).catch(e => console.error("Lỗi đồng bộ cập nhật sản phẩm lên DB:", e));
  };

  const handleAdminUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const nextProgress = status === 'delivered' ? 100 : status === 'shipping' ? 70 : status === 'preparing' ? 30 : undefined;
    setOrders((prevOrders) =>
      prevOrders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            deliveryProgress: nextProgress !== undefined ? nextProgress : o.deliveryProgress,
            updatedAt: 'Vừa xong'
          };
        }
        return o;
      })
    );

    // Sync to database
    fetch(`/api/db/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        ...(nextProgress !== undefined ? { deliveryProgress: nextProgress } : {})
      })
    }).catch(e => console.error("Lỗi đồng bộ cập nhật trạng thái đơn hàng lên DB:", e));
  };

  const handlePrintOrderLabel = (orderId: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.id === orderId ? { ...o, carrierLabelPrinted: true } : o))
    );

    // Sync to database
    fetch(`/api/db/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carrierLabelPrinted: true })
    }).catch(e => console.error("Lỗi đồng bộ nhãn đơn hàng lên DB:", e));
  };

  // Filters core
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesScale = selectedScale === 'all' || p.scale === selectedScale;
    const matchesWishlist = !showOnlyWishlist || wishlist.includes(p.id);

    return matchesSearch && matchesCategory && matchesScale && matchesWishlist;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] via-[#fcfcfd] to-[#fafbfa] text-zinc-805 flex flex-col font-sans relative overflow-hidden" id="applet-root">
      
      {/* Background Ambient Glow Blobs - Soft Champagne Premium Aura */}
      <div className="absolute inset-0 z-0 opacity-45 pointer-events-none">
        <div className="absolute top-[0%] left-[-10%] w-[600px] h-[500px] bg-red-400/5 rounded-full blur-[150px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[650px] h-[600px] bg-amber-400/5 rounded-full blur-[180px]"></div>
        <div className="absolute bottom-[30%] left-[20%] w-[500px] h-[500px] bg-yellow-400/3 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[0%] right-[5%] w-[600px] h-[600px] bg-red-400/4 rounded-full blur-[165px]"></div>
      </div>

      {/* Upper navigation utilities (Navbar) */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onCartClick={() => setShowCart(true)}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => {
          setSelectedCategory(cat);
          setShowOnlyWishlist(false);
        }}
        selectedScale={selectedScale}
        onScaleChange={setSelectedScale}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showOnlyWishlist={showOnlyWishlist}
        onToggleWishlistFilter={() => setShowOnlyWishlist(!showOnlyWishlist)}
        wishlistCount={wishlist.length}
        adminNotificationsCount={adminNotifications.filter(n => !n.read).length}
        products={products}
        onOpenCustomerAuth={() => setShowCustomerAuthModal(true)}
        onLogoutCustomer={handleLogoutCustomer}
      />

      {/* Beautified Site-wide Running Marquee Banner - placed below categories/scale selectors */}
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 relative z-30 mt-1 mb-2 shrink-0 select-none" id="header-marquee-notice">
        <div className="relative flex overflow-hidden whitespace-nowrap bg-white border border-zinc-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] backdrop-blur-xl rounded-full h-11 items-center justify-start">
          {/* Badge indicator on the left side */}
          <div className="absolute left-0 top-0 bottom-0 bg-white border-r border-zinc-100/90 px-3.5 flex items-center gap-1.5 z-20 rounded-l-full shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
            <span className="font-sans font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-900">
              SỰ KIỆN HOT
            </span>
          </div>

          {/* Safe mask container to hide left overlay overflow */}
          <div className="w-full h-full flex flex-row flex-nowrap items-center overflow-hidden pl-32 sm:pl-36 relative z-10 pr-4 whitespace-nowrap">
            {/* Smooth running continuous ticker */}
            <div className="animate-marquee-text text-zinc-800 font-extrabold tracking-wide text-[11px] sm:text-xs whitespace-nowrap flex flex-row flex-nowrap shrink-0 items-center">
              <span className="mr-24 shrink-0 flex flex-row flex-nowrap items-center gap-2 whitespace-nowrap">
                <span className="whitespace-nowrap inline-block max-h-5 overflow-hidden">{marqueeNotice.replace(/\r?\n|\r/g, ' ')}</span>
                <span className="text-amber-500 font-black text-xs shrink-0">✦</span>
              </span>
              <span className="mr-24 shrink-0 flex flex-row flex-nowrap items-center gap-2 whitespace-nowrap">
                <span className="whitespace-nowrap inline-block max-h-5 overflow-hidden">{marqueeNotice.replace(/\r?\n|\r/g, ' ')}</span>
                <span className="text-amber-500 font-black text-xs shrink-0">✦</span>
              </span>
              <span className="mr-24 shrink-0 flex flex-row flex-nowrap items-center gap-2 whitespace-nowrap">
                <span className="whitespace-nowrap inline-block max-h-5 overflow-hidden">{marqueeNotice.replace(/\r?\n|\r/g, ' ')}</span>
                <span className="text-amber-500 font-black text-xs shrink-0">✦</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero promo Section (Mobile-responsive high impact card banner) */}
      {activeTab === 'shop' && (
        <section className="relative z-10 py-6 sm:py-10 px-4" id="hero-banner">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-br from-white via-zinc-50/50 to-zinc-100/70 border border-zinc-200 shadow-2xl relative overflow-hidden p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch text-zinc-805"
          >
            {/* Ambient glows decoration */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            
            {/* Decorative race line details */}
            <div className="absolute top-0 right-0 w-24 h-full opacity-5 pointer-events-none flex flex-col justify-between py-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-[2px] w-full bg-amber-500 rotate-12" />
              ))}
            </div>

            <div className="text-left space-y-5 flex flex-col justify-center relative z-10 md:col-span-7 lg:col-span-8">
              <div className="inline-flex flex-wrap items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg sm:rounded-full text-[10px] sm:text-xs max-[480px]:text-xs max-[480px]:flex-wrap font-black uppercase tracking-wider border border-red-100 shadow-xs select-none max-w-full leading-normal whitespace-normal">
                <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse shrink-0" />
                <span className="break-words font-black max-[480px]:text-xs whitespace-normal">Siêu phẩm chế tác giới hạn 2026 • Đẳng cấp chơi xe VIP</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic text-zinc-900">
                <span className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-800 bg-clip-text text-transparent block">
                  Thế giới xe mô hình
                </span>
                <span className="relative inline-block bg-gradient-to-r from-red-600 via-red-500 to-amber-550 bg-clip-text text-transparent mt-1.5 sm:mt-2 w-auto">
                  ĐÚC HỢP KIM ĐẦM TAY
                  <span className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r from-red-500 to-amber-550 rounded-full shadow-sm" />
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed pt-2">
                Cảm nhận sức nặng cơ khí đích thực dưới lòng bàn tay. Sở hữu tuyệt phẩm siêu xe thu nhỏ từ hợp kim kẽm siêu đầm chắc, tinh xảo với lớp sơn tĩnh điện 4 lớp bóng bẩy, giả lập âm thanh gầm rú chân thực và nắp khoang động cơ chi tiết tinh xảo đến ngỡ ngàng. Đặt hàng hỏa tốc trong 2 giờ - kiểm tra ưng ý trọn vẹn mới thanh toán.
              </p>

              {/* Grid bullet points optimized for chốt đơn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                <div className="flex items-start gap-2.5 text-xs text-zinc-700">
                  <span className="p-1 rounded bg-red-50 shrink-0 border border-red-100 text-red-600 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <div>
                    <strong className="text-zinc-900 block font-black text-[12px]">Sơn Tĩnh Điện 4 Lớp</strong>
                    <span className="text-[10.5px] text-zinc-500">Độ bóng tuyệt mỹ, nhẵn mịn chống bay màu rạn nứt</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-zinc-700">
                  <span className="p-1 rounded bg-amber-50 shrink-0 border border-amber-100 text-amber-600 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <div>
                    <strong className="text-zinc-900 block font-black text-[12px]">Âm Thanh & Đèn LED Siêu Thực</strong>
                    <span className="text-[10.5px] text-zinc-500">Kích hoạt tiếng nổ động cơ thể thao và nháy pha rực rỡ</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-zinc-700">
                  <span className="p-1 rounded bg-blue-50 shrink-0 border border-blue-100 text-blue-600 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <div>
                    <strong className="text-zinc-900 block font-black text-[12px]">Ship Hỏa Tốc Sẵn Kho 2 Giờ</strong>
                    <span className="text-[10.5px] text-zinc-500">Nhận trong ngày, kiểm khách ưng ý mới xuống tiền</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-zinc-700">
                  <span className="p-1 rounded bg-emerald-50 shrink-0 border border-emerald-100 text-emerald-600 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <div>
                    <strong className="text-zinc-900 block font-black text-[12px]">Mở Cúp Toàn Diện & Bẻ Lái Xịn</strong>
                    <span className="text-[10.5px] text-zinc-500">Mở full cửa/capo, xoay chuyển vô lăng đánh lái mượt mà</span>
                  </div>
                </div>
              </div>

              {/* Call-to-actions buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    playSuccessClick();
                    document.getElementById('shop-catalog-view')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 bg-gradient-to-r from-red-600 to-amber-550 hover:from-red-500 hover:to-amber-500 text-white text-xs sm:text-sm font-black uppercase rounded-2xl shadow-lg shadow-red-505/10 hover:shadow-red-505/20 transition-all hover:-translate-y-0.5 active:scale-95 tracking-widest flex items-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
                  <span>SĂN NGAY BÁU VẬT SẮN KHO</span>
                </button>
                
                <button
                  onClick={() => {
                    playSuccessClick();
                    document.getElementById('welcome-vouchers-board')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 text-xs font-bold uppercase rounded-2xl border border-zinc-200 transition-all hover:-translate-y-0.5 active:scale-95 tracking-widest cursor-pointer flex items-center gap-1.5"
                >
                  <span>MÃ GIẢM GIÁ</span>
                  <span className="bg-red-500 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded-full leading-none animate-pulse">GIẢM 10%</span>
                </button>
              </div>
            </div>

            {/* Simulated interactive premium card with Frosted Glass theme */}
            {(() => {
               const showcaseId = bankSettings.showcaseProductId || 'prod-008';
               const showcaseProduct = products.find(p => p.id === showcaseId) || products[0];
               if (!showcaseProduct) return null;
               
               const hasDiscount = !!showcaseProduct.discountPercentage && showcaseProduct.discountPercentage > 0;
               const discountPercent = showcaseProduct.discountPercentage || 10;
               const originalPrice = hasDiscount
                 ? Math.round(showcaseProduct.price / (1 - discountPercent / 100))
                 : Math.round(showcaseProduct.price * 1.1);
                 
               return (
                 <div className="md:col-span-5 lg:col-span-4 flex items-center justify-center w-full">
                   <div className="rounded-3xl bg-white border border-zinc-250 p-5 w-full max-w-[340px] flex flex-col justify-between text-left relative overflow-hidden group hover:border-red-500/40 transition-all shadow-md min-h-[380px]">
                     <div className="absolute top-0 right-0 bg-gradient-to-l from-red-600 to-amber-550 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-bl-xl tracking-widest shadow-sm flex items-center gap-1 z-10 select-none">
                       <Flame className="w-3 h-3 text-white animate-pulse" />
                       <span>HOT WEEK</span>
                     </div>

                     <div>
                       <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 uppercase tracking-wider select-none">
                         👑 SIÊU PHẨM TRƯNG BÀY CAO CẤP
                       </span>

                       <h3 className="text-sm sm:text-base font-black text-zinc-900 mt-2 group-hover:text-red-600 transition-colors line-clamp-1" title={showcaseProduct.name}>
                         {showcaseProduct.name}
                       </h3>
                       
                       <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mt-0.5">
                         <span className="text-base sm:text-lg font-black text-red-600 font-mono">{showcaseProduct.price.toLocaleString('vi-VN')} đ</span>
                         <span className="text-xs text-zinc-400 line-through font-mono">{originalPrice.toLocaleString('vi-VN')}đ</span>
                         <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded-md font-mono font-black select-none">-{discountPercent}%</span>
                       </div>

                       <div className="mt-3 overflow-hidden rounded-2xl aspect-[16/10] relative border border-zinc-200 shadow-inner bg-zinc-100">
                         <img 
                           src={showcaseImgError ? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80' : showcaseProduct.imageUrl} 
                           onError={() => setShowcaseImgError(true)}
                           className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 select-none pointer-events-none" 
                           referrerPolicy="no-referrer"
                         />
                         <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold text-zinc-200 border border-zinc-900/50">
                           Tỷ lệ {showcaseProduct.scale} • Sắc nét hoàn thiện VIP
                         </div>
                       </div>

                       {/* Micro ratings indicator */}
                       <div className="flex flex-wrap items-center gap-1.5 mt-3 text-zinc-500 text-[11px]">
                         <div className="flex items-center text-amber-500">
                           {[...Array(5)].map((_, i) => (
                             <span key={i} className="text-xs">★</span>
                           ))}
                         </div>
                         <span className="font-bold text-zinc-800 text-[10px]/none mt-0.5">{showcaseProduct.rating?.toFixed(1) || '5.0'} / 5.0</span>
                         <span className="text-[10px] text-zinc-400 mt-0.5">• {showcaseProduct.reviewsCount || 42} Đánh giá</span>
                       </div>
                     </div>

                     <div className="mt-4 pt-3.5 border-t border-zinc-100">
                       <button
                         onClick={() => {
                           playChimeSound();
                           handleViewProductDetails(showcaseProduct);
                         }}
                         className="w-full py-3 bg-zinc-900 hover:bg-zinc-950 text-white text-[10px] sm:text-xs font-black uppercase rounded-xl tracking-widest transition-all active:scale-97 flex items-center justify-center gap-1.5 cursor-pointer shadow-md select-none"
                       >
                         <span>MỞ XEM CHI TIẾT & CHỐT MUA</span>
                         <ChevronRight className="w-3.5 h-3.5 text-white stroke-[3]" />
                       </button>
                     </div>
                   </div>
                 </div>
               );
            })()}
          </motion.div>
        </section>
      )}
      {/* Primary Tab displays */}
      <main className="flex-1 pb-16 relative z-10">
        
        <AnimatePresence mode="wait">
          {/* TAB 1: SHOP PRODUCT CATALOG */}
          {activeTab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
              id="shop-catalog-view"
            >
              
              {/* Smart behavioral recommendation engine feed */}
              <SmartRecommendations 
                allProducts={products}
                viewHistory={currentUser.viewHistory ?? []}
                cart={cart}
                orders={orders}
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewProductDetails}
                variant="home"
              />
              
              {/* Voucher/Coupon Claiming board (Thống nhất tiếng Việt cực kỳ gọn gàng & tối ưu diện tích cho điện thoại) */}
              <div className="mb-6 bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-lg shadow-zinc-100" id="welcome-vouchers-board">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
                  <div>
                    <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      Chương trình Khuyến mãi từ MiniAuto
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-zinc-650 mt-0.5">Bấm lưu mã nhận ngay ưu đãi khấu trừ trực tiếp khi thanh toán đơn hàng.</p>
                  </div>
                  {voucherToast && (
                    <div className={`px-2.5 py-0.5 rounded text-[10px] font-bold animate-pulse font-mono max-w-max sm:max-w-none ${
                      voucherToast.success ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {voucherToast.text}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 w-full">
                  {adminVouchers.map((v) => {
                    const alreadyClaimed = (currentUser.vouchers ?? []).some(item => item.code === v.code);
                    return (
                      <div 
                        key={v.code} 
                        className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 px-3.5 flex flex-row items-center justify-between gap-3 group hover:border-[#f43f5e]/30 transition-all text-left w-full"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* Red Tag Discount amount */}
                          <span className="text-[9px] sm:text-[10px] bg-red-50 text-red-650 border border-red-200 px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0">
                            GIẢM {v.amount >= 1000 ? `${v.amount / 1000}K` : `${v.amount}đ`}
                          </span>
                          
                          {/* Voucher info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9.5px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50 leading-none">
                                {v.code}
                              </span>
                              <h4 className="text-[11px] sm:text-xs font-bold text-zinc-800 truncate max-w-[125px] sm:max-w-none">{v.name}</h4>
                            </div>
                            <p className="text-[9.5px] text-zinc-500 mt-0.5 truncate hidden sm:block">
                              {v.description}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleClaimVoucher(v.code, v.name, v.amount)}
                          disabled={alreadyClaimed}
                          className={`px-3 py-1.5 text-[9.5px] font-extrabold uppercase rounded-lg transition-all shadow cursor-pointer active:scale-95 shrink-0 select-none ${
                            alreadyClaimed 
                              ? 'bg-zinc-205 text-zinc-400 border border-zinc-300 cursor-not-allowed'
                              : 'bg-red-500 hover:bg-red-400 text-white shadow-md shadow-red-500/10'
                          }`}
                        >
                          {alreadyClaimed ? 'Đã Lưu' : 'Lưu Mã'}
                        </button>
                      </div>
                    );
                  })}
                  {adminVouchers.length === 0 && (
                    <div className="text-center py-4 text-zinc-500 text-xs w-full">
                      Hôm nay chưa có mã giảm giá nào được phát hành.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-base font-extrabold text-zinc-800 uppercase tracking-widest pl-1">
                  {selectedCategory === 'all' ? 'Tất Cả Sản Phẩm' : `${selectedCategory} Collection`}
                  {selectedScale !== 'all' && ` • Tỷ lệ ${selectedScale}`}
                </h2>
                <span className="text-xs font-mono font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 shadow-sm px-3 py-1 rounded-full">
                  Tìm thấy {filteredProducts.length} ô tô
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div 
                  key={`${selectedCategory}-${selectedScale}`}
                  className="rounded-3xl bg-white border border-zinc-200 shadow-lg p-12 text-center animate-fade-in" 
                  id="empty-search-state"
                >
                  <p className="text-sm font-bold text-zinc-700">Không tìm thấy mẫu phù hợp</p>
                  <p className="text-xs text-zinc-500 mt-1">Bạn hãy thử gõ từ khóa đơn giản như "Mustang" hoặc hạ cấp tỷ lệ lọc.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedScale('all');
                    }}
                    className="mt-4 px-4 py-2 bg-zinc-100 hover:bg-white border border-zinc-200 hover:border-red-400 text-zinc-700 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Xóa toàn bộ bộ lọc
                  </button>
                </div>
              ) : (
                /* GRID OF PRODUCTS CARD */
                <div 
                  key={`${selectedCategory}-${selectedScale}`}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 animate-fade-in" 
                  id="products-display-grid"
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onViewDetails={handleViewProductDetails}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: ORDER LIFETIME STATUS TRACKING */}
          {activeTab === 'tracking' && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <OrderStatusTracker
                orders={currentUser.id === 'user-001' ? orders : orders.filter(o => o.userPhone.trim().replace(/\s+/g, '') === currentUser.phone.trim().replace(/\s+/g, ''))}
                onCancelOrder={handleCancelOrder}
                onUpdateDeliveryProgress={handleUpdateDeliveryProgress}
                currentUser={currentUser}
                onOpenCustomerAuth={() => setShowCustomerAuthModal(true)}
              />
            </motion.div>
          )}

          {/* TAB 3: LOYALTY CLUB HUB */}
          {activeTab === 'loyalty' && (
            <motion.div
              key="loyalty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <LoyaltyHub
                currentUser={currentUser}
                onRedeemGift={handleRedeemGift}
              />
            </motion.div>
          )}

          {/* TAB 4: ADMIN PORTAL STATISTIC */}
          {activeTab === 'admin' && currentUser.role === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <AdminDashboard
                products={products}
                orders={orders}
                onAddProduct={handleAdminAddProduct}
                onUpdateProduct={handleAdminUpdateProduct}
                onUpdateOrderStatus={handleAdminUpdateOrderStatus}
                onPrintOrderLabel={handlePrintOrderLabel}
                adminNotifications={adminNotifications}
                onMarkNotificationRead={(id) => setAdminNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
                onClearAllNotifications={() => setAdminNotifications([])}
                customers={customers}
                onUpdateCustomers={setCustomers}
                onUpdateProducts={setProducts}
                onUpdateOrders={setOrders}
                marqueeNotice={marqueeNotice}
                onUpdateMarqueeNotice={setMarqueeNotice}
                adminVouchers={adminVouchers}
                onUpdateAdminVouchers={setAdminVouchers}
                bankSettings={bankSettings}
                onUpdateBankSettings={setBankSettings}
                sentEmails={sentEmails}
                onUpdateSentEmails={setSentEmails}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Floating Cart Panel Drawer */}
      {showCart && (
        <CartDrawer
          cartItems={cart}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={() => {
            setShowCart(false);
            setShowCheckout(true);
          }}
          allProducts={products}
          viewHistory={currentUser.viewHistory ?? []}
          orders={orders}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewProductDetails}
        />
      )}

      {/* High precision Checkout Payment Gateway Portal */}
      {showCheckout && (
        <CheckoutPortal
          cartItems={cart}
          currentUser={currentUser}
          onClose={() => setShowCheckout(false)}
          onPlaceOrder={handlePlaceOrder}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
        />
      )}

      {/* Product specs drawer modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          allProducts={products}
          viewHistory={currentUser.viewHistory ?? []}
          cart={cart}
          orders={orders}
          onViewProductDetails={handleViewProductDetails}
        />
      )}

      {/* Footer bar branding */}
      <footer className="relative z-10 mt-6 py-8 border-t border-white/10 text-xs text-zinc-400 backdrop-blur-md bg-white/1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="font-extrabold text-zinc-200 tracking-tight">© 2026 MINIAUTO.STORE</p>
            <p className="text-[10px] text-zinc-500 mt-1">Trang web bán hàng mô hình ô tô tích hợp thanh toán trực tuyến & quản trị tối ưu.</p>
          </div>
          <div className="flex gap-4 text-[11px] text-zinc-400">
            <a href="#rules" className="hover:text-white transition-colors">Điều khoản Sandbox</a>
            <a href="#security" className="hover:text-white transition-colors">Bảo mật giao dịch</a>
            <a href="#help" className="hover:text-white transition-colors">Trung tâm bưu tá</a>
          </div>
        </div>
      </footer>

      {/* Real-time Order Placement Admin Toast Notification (Tiện ích thông báo quản trị viên mượt mà) */}
      {adminToast && activeTab === 'admin' && currentUser.role === 'admin' && (
        <div className="fixed bottom-4 right-4 z-[100] max-w-sm w-full bg-slate-900 border border-amber-500/30 text-white rounded-2xl shadow-2xl p-4 sm:p-5 animate-slide-in" id="admin-toast-banner">
          <div className="flex gap-3">
            <div className="w-10 h-10 shrink-0 bg-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-black uppercase text-amber-500 tracking-wider">🔔 ĐƠN HÀNG MỚI ĐẾN!</span>
                <button 
                  onClick={() => setAdminToast(null)}
                  className="text-zinc-400 hover:text-white font-bold text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="text-xs font-bold mt-1 text-zinc-100">{adminToast.title}</h4>
              <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                {adminToast.message}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setAdminToast(null);
                  }}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-400 text-white font-extrabold text-[10px] uppercase rounded-lg transition-all cursor-pointer shadow-md active:scale-95"
                >
                  XỬ LÝ NGAY
                </button>
                <button
                  onClick={() => {
                    setAdminToast(null);
                  }}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-350 hover:text-white font-semibold text-[10px] rounded-lg transition-all cursor-pointer"
                >
                  Bỏ qua
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Credentials Login Modal - WHITE LUXURY DESIGN */}
      {showAdminLoginModal && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-sans"
          onClick={() => setShowAdminLoginModal(false)}
        >
          <div 
            className="bg-white border border-zinc-200 rounded-3xl w-full max-w-sm p-6 relative overflow-hidden shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Red Glow */}
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Title / Header */}
            <div className="border-b border-zinc-100 pb-3 mb-4 flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-zinc-950 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-650 animate-pulse shrink-0" />
                Xác Thực Đăng Nhập Quản Trị
              </h4>
              <button 
                onClick={() => setShowAdminLoginModal(false)}
                className="text-zinc-400 hover:text-zinc-800 transition-colors text-xs font-mono font-bold px-2 py-1 hover:bg-zinc-50 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-zinc-650 leading-normal mb-4 font-medium">
              Vòng kiểm tra bảo mật. Bạn cần nhập tài khoản và mật khẩu của Người bán hàng để có quyền cấu hình mã giảm giá, chạy thông báo hoặc quản lý sản phẩm.
            </p>

            {adminLoginError && !showAdminRecovery && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-650 text-[10px] font-bold p-3 rounded-lg leading-relaxed flex items-center gap-1.5 font-sans">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                {adminLoginError}
              </div>
            )}

            {showAdminRecovery ? (
              <div className="space-y-4 pt-1 animate-fade-in">
                <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-[10.5px] text-zinc-650 leading-relaxed flex flex-col gap-1.5">
                  <span className="font-extrabold text-zinc-900 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
                    KHÔI PHỤC TÀI KHOẢN QUẢN TRỊ:
                  </span>
                  <p>Vui lòng nhập chính xác địa chỉ Email Admin đã cấu hình hệ thống để xác thực quyền truy cập và hiển thị thông tin đăng nhập.</p>
                </div>

                {recoveryError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-650 text-[10px] font-bold p-3 rounded-lg leading-relaxed flex items-center gap-1.5 font-sans">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                    {recoveryError}
                  </div>
                )}

                {revealedCredentials ? (
                  <div className="space-y-3.5 animate-fade-in">
                    <div className="bg-emerald-50 border border-emerald-250/70 p-3.5 rounded-xl text-xs text-emerald-900 leading-normal flex flex-col gap-2">
                      <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        Xác Thực Thành Công!
                      </span>
                      <div className="space-y-1 pt-1 border-t border-emerald-200/50">
                        <div>• Tài khoản: <b className="font-mono bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded select-all font-black text-emerald-950">{revealedCredentials.user}</b></div>
                        <div>• Mật khẩu: <b className="font-mono bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded select-all font-black text-emerald-950">{revealedCredentials.pass}</b></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Bạn có chắc chắn muốn đặt lại tài khoản admin về mặc định (admin / 123)? Thao tác này sẽ ghi đè tài khoản hiện tại.")) {
                            setBankSettings(prev => ({
                              ...prev,
                              adminUsername: 'admin',
                              adminPassword: '123'
                            }));
                            setRevealedCredentials({ user: 'admin', pass: '123' });
                            alert("Đã khôi phục thông tin đăng nhập mặc định thành công!");
                          }
                        }}
                        className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-750 text-[10px] font-extrabold uppercase rounded-lg border border-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-3 h-3 text-zinc-500" />
                        Đặt Lại Về Mặc Định
                      </button>
                    </div>

                    <div className="border-t border-zinc-100 pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAdminRecovery(false);
                          setRevealedCredentials(null);
                          setRecoveryEmail('');
                          setRecoveryError('');
                        }}
                        className="text-red-650 font-black text-[11px] hover:underline cursor-pointer uppercase"
                      >
                        Quay lại Đăng nhập
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const configuredEmail = (bankSettings.adminEmail || 'autovibe8825@gmail.com').trim().toLowerCase();
                      if (recoveryEmail.trim().toLowerCase() === configuredEmail) {
                        setRevealedCredentials({
                          user: bankSettings.adminUsername || 'admin',
                          pass: bankSettings.adminPassword || '123'
                        });
                        setRecoveryError('');
                      } else {
                        setRecoveryError('Email không khớp với cấu hình hệ thống! Vui lòng kiểm tra lại.');
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase block pl-1">Email Admin liên kết:</label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="e.g. admin@yourdomain.com"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-950 placeholder-zinc-400 focus:border-red-650 focus:bg-white outline-none leading-none transition-all font-sans font-medium"
                        />
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAdminRecovery(false);
                          setRecoveryEmail('');
                          setRecoveryError('');
                        }}
                        className="w-1/2 py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 hover:text-zinc-950 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer"
                      >
                        Hủy Bỏ
                      </button>
                      <button
                        type="submit"
                        className="w-1/2 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-xl text-[11px] font-black uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
                      >
                        Xác Thực Email
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const reqUser = bankSettings.adminUsername || 'admin';
                  const reqPass = bankSettings.adminPassword || '123';
                  if (adminLoginUser === reqUser && adminLoginPass === reqPass) {
                    setCurrentUser({
                      ...currentUser,
                      role: 'admin'
                    });
                    setActiveTab('admin');
                    setShowAdminLoginModal(false);
                    setAdminLoginUser('');
                    setAdminLoginPass('');
                    setAdminLoginError('');
                    playSuccessClick();
                  } else if (!adminLoginUser || !adminLoginPass) {
                    setAdminLoginError('Vui lòng hoàn thành đầy đủ thông tin hai hộp thoại!');
                  } else {
                    setAdminLoginError('Sai tài khoản hoặc mật khẩu! Vui lòng kiểm tra lại.');
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase block pl-1">Tài khoản:</label>
                  <input
                    type="text"
                    placeholder="Nhập tài khoản"
                    value={adminLoginUser}
                    onChange={(e) => setAdminLoginUser(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-950 placeholder-zinc-400 focus:border-red-650 focus:bg-white outline-none leading-none transition-all font-sans font-medium"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase block">Mật khẩu:</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminRecovery(true);
                        setRecoveryEmail('');
                        setRecoveryError('');
                        setRevealedCredentials(null);
                      }}
                      className="text-[9.5px] font-extrabold text-zinc-550 hover:text-red-650 hover:underline select-none cursor-pointer uppercase transition-all"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      value={adminLoginPass}
                      onChange={(e) => setAdminLoginPass(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-3 pr-10 py-2.5 text-xs text-zinc-950 placeholder-zinc-400 focus:border-red-650 focus:bg-white outline-none leading-none transition-all font-sans font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4 shrink-0" /> : <Eye className="w-4 h-4 shrink-0" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdminLoginModal(false)}
                    className="w-1/2 py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 hover:text-zinc-950 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer"
                  >
                    Bỏ Qua
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-red-650 hover:bg-red-600 text-white rounded-xl text-[11px] font-black uppercase transition-all shadow-md shadow-red-500/15 cursor-pointer"
                  >
                    Đăng Nhập
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showCustomerAuthModal && (
        <CustomerAuthModal
          onClose={() => setShowCustomerAuthModal(false)}
          onLoginSuccess={handleCustomerLoginSuccess}
          onRegisterSuccess={handleCustomerRegisterSuccess}
          existingCustomers={customers}
        />
      )}

      {/* Modern non-blocking notification toast overlay */}
      {globalToast && (
        <div className="fixed bottom-4 left-4 z-[100] max-w-sm w-full bg-white/95 border border-zinc-200/80 text-zinc-900 rounded-2xl shadow-2xl p-4 animate-slide-in flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full ${
              globalToast.type === 'success' ? 'bg-emerald-500' : globalToast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`} />
            <p className="text-xs font-semibold text-zinc-800 tracking-tight leading-normal">
              {globalToast.message}
            </p>
          </div>
          <button 
            onClick={() => setGlobalToast(null)}
            className="text-zinc-400 hover:text-zinc-650 shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
