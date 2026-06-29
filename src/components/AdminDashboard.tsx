import React, { useState, useEffect, useRef } from 'react';
import { Product, Order, OrderStatus, AdminNotification, BankSettings } from '../types';
import { ShieldCheck, Plus, Package, DollarSign, ListOrdered, AlertTriangle, ArrowUpDown, Trash2, Edit2, CheckCircle2, RotateCcw, Printer, FileText, Volume2, Upload, Play, Bell, BellRing, Users, Award, MapPin, Phone, MessageSquare, Search, Sparkles, UserPlus, Database, Save, Download, RefreshCw, Mail, CreditCard, X, Eye, EyeOff, Lock, Edit3, ImagePlus, Camera, Video, Film } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (productId: string, updated: Partial<Product>) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onPrintOrderLabel?: (orderId: string) => void;
  adminNotifications?: AdminNotification[];
  onMarkNotificationRead?: (id: string) => void;
  onClearAllNotifications?: () => void;
  customers?: any[];
  onUpdateCustomers?: React.Dispatch<React.SetStateAction<any[]>>;
  onUpdateProducts?: React.Dispatch<React.SetStateAction<Product[]>>;
  onUpdateOrders?: React.Dispatch<React.SetStateAction<Order[]>>;
  marqueeNotice: string;
  onUpdateMarqueeNotice: (notice: string) => void;
  adminVouchers: { code: string; name: string; amount: number; description: string; }[];
  onUpdateAdminVouchers: (vouchers: { code: string; name: string; amount: number; description: string; }[]) => void;
  bankSettings: BankSettings;
  onUpdateBankSettings: (settings: BankSettings) => void;
  sentEmails?: any[];
  onUpdateSentEmails?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function AdminDashboard({
  products,
  orders,
  onAddProduct,
  onUpdateProduct,
  onUpdateOrderStatus,
  onPrintOrderLabel,
  adminNotifications = [],
  onMarkNotificationRead,
  onClearAllNotifications,
  customers = [],
  onUpdateCustomers,
  onUpdateProducts,
  onUpdateOrders,
  marqueeNotice,
  onUpdateMarqueeNotice,
  adminVouchers,
  onUpdateAdminVouchers,
  bankSettings,
  onUpdateBankSettings,
  sentEmails = [],
  onUpdateSentEmails
}: AdminDashboardProps) {
  // Tabs: 'stats' | 'warehouse_inventory' | 'orders_control' | 'notifications' | 'customers' | 'vouchers_and_notices' | 'backup_settings'
  const [adminTab, setAdminTab] = useState<'stats' | 'warehouse_inventory' | 'orders_control' | 'notifications' | 'customers' | 'vouchers_and_notices' | 'backup_settings'>('warehouse_inventory');
  const [activeWaybillOrder, setActiveWaybillOrder] = useState<Order | null>(null);
  const [pasteJSON, setPasteJSON] = useState('');
  const [backupStatus, setBackupStatus] = useState('');
  const [inspectingEmail, setInspectingEmail] = useState<any | null>(null);

  // States and hooks for interactive bell ringing and auto-scroll actions
  const [bellRinging, setBellRinging] = useState(false);
  const [showLiveOrderBanner, setShowLiveOrderBanner] = useState(false);
  const [latestIncomingNotif, setLatestIncomingNotif] = useState<AdminNotification | null>(null);
  const prevNotifCountRef = useRef(adminNotifications.length);

  useEffect(() => {
    // Check if new notifications have been prepended
    if (adminNotifications.length > prevNotifCountRef.current) {
      const newestNotif = adminNotifications[0];
      if (newestNotif) {
        setLatestIncomingNotif(newestNotif);
        setBellRinging(true);
        setShowLiveOrderBanner(true);

        // Ring the bell for a premium 5-second vibration duration
        const ringTimer = setTimeout(() => {
          setBellRinging(false);
        }, 5000);

        // Auto-scroll instantly if the administrative user is already in the affected panels
        if (adminTab === 'notifications') {
          setTimeout(() => {
            const el = document.getElementById('admin-notifications-panel');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 400);
        } else if (adminTab === 'orders_control') {
          setTimeout(() => {
            const el = document.getElementById('admin-orders-control-panel');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 400);
        }

        return () => clearTimeout(ringTimer);
      }
    }
    // Update reference count
    prevNotifCountRef.current = adminNotifications.length;
  }, [adminNotifications, adminTab]);

  // Bank settings customizable states
  const [tmpBankName, setTmpBankName] = useState(bankSettings.bankName);
  const [tmpBankCode, setTmpBankCode] = useState(bankSettings.bankCodeShort);
  const [tmpAccNum, setTmpAccNum] = useState(bankSettings.accountNumber);
  const [tmpAccHolder, setTmpAccHolder] = useState(bankSettings.accountHolder);
  const [tmpMomoPhone, setTmpMomoPhone] = useState(bankSettings.momoPhone);
  const [tmpAdminEmail, setTmpAdminEmail] = useState(bankSettings.adminEmail);
  const [tmpShowcaseProductId, setTmpShowcaseProductId] = useState(bankSettings.showcaseProductId || 'prod-008');
  const [tmpAdminUsername, setTmpAdminUsername] = useState(bankSettings.adminUsername || 'admin');
  const [tmpAdminPassword, setTmpAdminPassword] = useState(bankSettings.adminPassword || '221293');
  const [showAdminPasswordInSettings, setShowAdminPasswordInSettings] = useState(false);
  const [bankSaveSuccess, setBankSaveSuccess] = useState(false);

  // Form states to Add products
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    brand: '',
    scale: '1:18' as Product['scale'],
    price: 900000,
    discountPercentage: 0,
    imageUrl: '',
    description: '',
    stock: 10,
    category: 'supercar' as Product['category'],
    year: 2024,
    features: ['Khung kim loại đúc hầm hố', 'Đầy đủ vỏ xốp chống sốc'],
    galleryImages: [] as string[],
    videoUrl: ''
  });

  const [featureInput, setFeatureInput] = useState('');

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setNewProd(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (indexToRemove: number) => {
    setNewProd(prev => ({
      ...prev,
      features: prev.features.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Handle direct file uploads to web memory buffer (Base64 for persistence, Object URL for video)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProd(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);
      const loadedImages: string[] = [];
      let loadedCount = 0;

      fileList.forEach((file: any) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          loadedImages.push(reader.result as string);
          loadedCount++;
          if (loadedCount === fileList.length) {
            setNewProd(prev => ({
              ...prev,
              galleryImages: [...prev.galleryImages, ...loadedImages].slice(0, 9)
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For larger video files, ObjectURL is highly performant and doesn't bloat memory
      const url = URL.createObjectURL(file);
      setNewProd(prev => ({ ...prev, videoUrl: url }));
    }
  };

  const autofillDemoData = () => {
    setNewProd({
      name: 'Porsche 911 GT3 RS (992)',
      brand: 'Porsche',
      scale: '1:18',
      price: 1650000,
      discountPercentage: 10,
      imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800',
      description: 'Mô hình Porsche 911 GT3 RS tỉ lệ 1:18 đỉnh cao khí động học. Cánh gió sau thiết kế DRS kép, lốp cao su Michelin Pilot Sport Cup 2, nội thất bọc nỉ Alcantara thể thao siêu thực, capo mở khoang đựng đồ phía trước độc đáo.',
      stock: 12,
      category: 'supercar',
      year: 2023,
      features: ['Khung hợp kim đúc Zinc nguyên tấm', 'Cánh gió DRS đóng mở điều chỉnh góc khí động', 'Giảm xóc độc lập 4 bánh', 'Gương chiếu hậu gập cơ học', 'Nội thất lót thảm mịn'],
      galleryImages: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
        'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800',
        'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800',
        'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800',
        'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800',
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800'
      ],
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-at-night-34449-large.mp4'
    });
  };

  // Edit stock item trigger in table
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editStockAmount, setEditStockAmount] = useState<number>(0);
  const [editPriceAmount, setEditPriceAmount] = useState<number>(0);
  const [editDiscountAmount, setEditDiscountAmount] = useState<number>(0);

  // Full Edit Product states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormName, setEditFormName] = useState('');
  const [editFormBrand, setEditFormBrand] = useState('');
  const [editFormPrice, setEditFormPrice] = useState<number>(0);
  const [editFormDiscount, setEditFormDiscount] = useState<number>(0);
  const [editFormScale, setEditFormScale] = useState<Product['scale']>('1:18');
  const [editFormStock, setEditFormStock] = useState<number>(0);
  const [editFormCategory, setEditFormCategory] = useState<Product['category']>('supercar');
  const [editFormImageUrl, setEditFormImageUrl] = useState('');
  const [editFormDescription, setEditFormDescription] = useState('');
  const [editFormFeatures, setEditFormFeatures] = useState<string[]>([]);
  const [editFormFeatureInput, setEditFormFeatureInput] = useState('');
  const [editFormGalleryImages, setEditFormGalleryImages] = useState<string[]>([]);
  const [editFormVideoUrl, setEditFormVideoUrl] = useState('');

  const handleStartFullEdit = (p: Product) => {
    setEditingProduct(p);
    setEditFormName(p.name);
    setEditFormBrand(p.brand);
    setEditFormPrice(p.price);
    setEditFormDiscount(p.discountPercentage ?? 0);
    setEditFormScale(p.scale);
    setEditFormStock(p.stock);
    setEditFormCategory(p.category);
    setEditFormImageUrl(p.imageUrl);
    setEditFormDescription(p.description);
    setEditFormFeatures(p.features || []);
    setEditFormFeatureInput('');
    setEditFormGalleryImages(p.galleryImages || []);
    setEditFormVideoUrl(p.videoUrl || '');
  };

  const handleSaveFullEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdateProduct(editingProduct.id, {
        name: editFormName,
        brand: editFormBrand,
        price: editFormPrice,
        discountPercentage: editFormDiscount,
        scale: editFormScale,
        stock: editFormStock,
        category: editFormCategory,
        imageUrl: editFormImageUrl,
        description: editFormDescription,
        features: editFormFeatures,
        galleryImages: editFormGalleryImages,
        videoUrl: editFormVideoUrl,
      });
      setEditingProduct(null);
    }
  };

  const handleEditAddFeature = () => {
    if (editFormFeatureInput.trim()) {
      setEditFormFeatures(prev => [...prev, editFormFeatureInput.trim()]);
      setEditFormFeatureInput('');
    }
  };

  const handleEditRemoveFeature = (indexToRemove: number) => {
    setEditFormFeatures(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleEditAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);
      const loadedImages: string[] = [];
      let loadedCount = 0;

      fileList.forEach((file: any) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          loadedImages.push(reader.result as string);
          loadedCount++;
          if (loadedCount === fileList.length) {
            setEditFormGalleryImages(prev => [...prev, ...loadedImages].slice(0, 9));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleEditVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setEditFormVideoUrl(url);
    }
  };

  // CRM Customer Database states
  const [crmSearch, setCrmSearch] = useState('');
  const [crmShowAddForm, setCrmShowAddForm] = useState(false);
  const [crmNewName, setCrmNewName] = useState('');
  const [crmNewPhone, setCrmNewPhone] = useState('');
  const [crmNewAddress, setCrmNewAddress] = useState('');
  const [crmNewNotes, setCrmNewNotes] = useState('');
  const [crmNewPoints, setCrmNewPoints] = useState(150);

  const [crmEditingPhone, setCrmEditingPhone] = useState<string | null>(null);
  const [crmEditName, setCrmEditName] = useState('');
  const [crmEditAddress, setCrmEditAddress] = useState('');
  const [crmEditNotes, setCrmEditNotes] = useState('');
  const [crmEditPoints, setCrmEditPoints] = useState(0);

  // Vouchers and Slogan Marquee states
  const [tempMarquee, setTempMarquee] = useState(marqueeNotice);
  const [newVcode, setNewVcode] = useState('');
  const [newVname, setNewVname] = useState('');
  const [newVamount, setNewVamount] = useState<number>(50000);
  const [newVdesc, setNewVdesc] = useState('');

  const handleStartEditCrm = (c: any) => {
    setCrmEditingPhone(c.phone);
    setCrmEditName(c.name);
    setCrmEditAddress(c.address || '');
    setCrmEditNotes(c.notes || '');
    setCrmEditPoints(c.loyaltyPoints);
  };

  const handleSaveEditCrmCustomer = (phone: string) => {
    if (onUpdateCustomers) {
      onUpdateCustomers(prev => prev.map(c => c.phone === phone ? {
        ...c,
        name: crmEditName.trim(),
        address: crmEditAddress.trim(),
        notes: crmEditNotes.trim(),
        loyaltyPoints: Number(crmEditPoints) || 0,
        lifetimePoints: Math.max(c.lifetimePoints || 0, Number(crmEditPoints) || 0)
      } : c));
    }
    setCrmEditingPhone(null);
  };

  // Stats calculation
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'success' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const lowStockProducts = products.filter((p) => p.stock <= 3);

  // Generate daily revenue & order data for the last 7 days chart
  const getDailyRevenueData = () => {
    const data = [];
    const now = new Date();
    
    // Create the last 7 days ending today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayStr = d.getDate().toString().padStart(2, '0') + '/' + (d.getMonth() + 1).toString().padStart(2, '0');
      data.push({
        date: dayStr,
        revenue: 0,
        ordersCount: 0
      });
    }

    // Baseline mock data to represent a beautiful, active history
    const baseRevenues = [1800000, 2450000, 1500000, 3200000, 2100000, 4300000, 0];
    const baseOrders = [2, 3, 2, 4, 3, 5, 0];
    
    // Seed the past days with some mock base values (day index 0 to 5) so it isn't starting blank
    data.forEach((item, index) => {
      if (index < 6) {
        item.revenue = baseRevenues[index];
        item.ordersCount = baseOrders[index];
      }
    });

    // Parse order dates and accumulate actual successful orders
    orders.forEach((o) => {
      if (o.paymentStatus === 'success' || o.status === 'delivered') {
        const orderDateStr = o.createdAt;
        let parsedDate = '';
        
        if (orderDateStr.includes('Hôm nay') || orderDateStr.includes('Today')) {
          parsedDate = now.getDate().toString().padStart(2, '0') + '/' + (now.getMonth() + 1).toString().padStart(2, '0');
        } else if (orderDateStr.includes('Hôm qua') || orderDateStr.includes('Yesterday')) {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          parsedDate = yesterday.getDate().toString().padStart(2, '0') + '/' + (yesterday.getMonth() + 1).toString().padStart(2, '0');
        } else {
          const match = orderDateStr.match(/(\d{1,2})\/(\d{1,2})/);
          if (match) {
            parsedDate = match[1].padStart(2, '0') + '/' + match[2].padStart(2, '0');
          } else {
            parsedDate = now.getDate().toString().padStart(2, '0') + '/' + (now.getMonth() + 1).toString().padStart(2, '0');
          }
        }

        const found = data.find((d) => d.date === parsedDate);
        if (found) {
          found.revenue += o.totalAmount;
          found.ordersCount += 1;
        }
      }
    });

    return data;
  };

  const chartData = getDailyRevenueData();

  // Custom tooltip component for high-tech look
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950/95 border border-white/10 p-3.5 rounded-2xl shadow-xl backdrop-blur-md text-left">
          <p className="text-[10px] text-zinc-500 font-bold font-mono uppercase tracking-widest">{`Ngày ${label}`}</p>
          <p className="text-sm font-black text-emerald-400 mt-1 font-mono">
            {payload[0].value.toLocaleString('vi-VN')} đ
          </p>
          {payload[1] && (
            <p className="text-[10px] font-bold text-sky-400 mt-0.5">
              ⚡ Chốt {payload[1].value} đơn thành công
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProd.name && newProd.brand && newProd.price) {
      onAddProduct({
        ...newProd,
        imageUrl: newProd.imageUrl || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600',
        rating: 5.0,
        reviewsCount: 1
      });
      setShowAddForm(false);
      setNewProd({
        name: '',
        brand: '',
        scale: '1:18',
        price: 900000,
        discountPercentage: 0,
        imageUrl: '',
        description: '',
        stock: 10,
        category: 'supercar',
        year: 2024,
        features: ['Khung kim loại đúc hầm hố', 'Đầy đủ vỏ xốp chống sốc'],
        galleryImages: [],
        videoUrl: ''
      });
    }
  };

  const startEditingProduct = (p: Product) => {
    setEditingProductId(p.id);
    setEditStockAmount(p.stock);
    setEditPriceAmount(p.price);
    setEditDiscountAmount(p.discountPercentage ?? 0);
  };

  const saveProductChanges = (productId: string) => {
    onUpdateProduct(productId, {
      stock: editStockAmount,
      price: editPriceAmount,
      discountPercentage: editDiscountAmount
    });
    setEditingProductId(null);
  };

  const handleRestockRefill = (productId: string, currentStock: number) => {
    // Quick restock of 10 items
    onUpdateProduct(productId, { stock: currentStock + 10 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="admin-dashboard-container">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 pb-5 mb-6 gap-3 text-left">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-950 flex items-center gap-2 uppercase tracking-wide">
            <ShieldCheck className="w-6 h-6 text-[#0a5cff] shrink-0" />
            Hệ Thống Quản Trị & Kho Tự Động
          </h2>
          <p className="text-xs text-zinc-600 mt-1 font-medium">Cơ chế bảo mật sandbox cấp độ cao • Định hướng xuất lập báo cáo số liệu thực lực.</p>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAdminTab('warehouse_inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              adminTab === 'warehouse_inventory'
                ? 'bg-zinc-950 border-zinc-950 text-white shadow-md shadow-zinc-950/10'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-xs'
            }`}
          >
            Quản Lý Sản Phẩm ({products.length})
          </button>
          <button
            onClick={() => setAdminTab('orders_control')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              adminTab === 'orders_control'
                ? 'bg-zinc-950 border-zinc-950 text-white shadow-md shadow-zinc-950/10'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-xs'
            }`}
          >
            Vận Đơn Cửa Hàng ({orders.length})
          </button>
          <button
            onClick={() => setAdminTab('stats')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              adminTab === 'stats'
                ? 'bg-zinc-950 border-zinc-950 text-white shadow-md shadow-zinc-950/10'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-xs'
            }`}
          >
            Báo Cáo Doanh Thu
          </button>
          <button
            onClick={() => setAdminTab('notifications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border relative cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'notifications'
                ? 'bg-zinc-950 border-zinc-950 text-white shadow-md shadow-zinc-950/10'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-xs'
            }`}
          >
            <span className="relative flex items-center justify-center">
              {adminNotifications.filter(n => !n.read).length > 0 ? (
                <BellRing className={`w-3.5 h-3.5 text-amber-500 shrink-0 ${bellRinging ? 'animate-bell-ring' : 'animate-pulse'}`} />
              ) : (
                <Bell className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              )}
            </span>
            Thông Báo Mới
            {adminNotifications.filter(n => !n.read).length > 0 && (
              <span className={`bg-amber-500 text-black font-black text-[9px] px-1.5 py-0.5 rounded-full ml-1 ${bellRinging ? 'animate-pop-bounce' : 'animate-pulse'}`}>
                {adminNotifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setAdminTab('customers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border relative cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'customers'
                ? 'bg-zinc-950 border-zinc-950 text-white shadow-md shadow-zinc-950/10'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-xs'
            }`}
          >
            Sổ Khách Hàng (CRM)
            <span className="bg-zinc-100 text-zinc-800 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-full border border-zinc-200 ml-1">
              {customers.length}
            </span>
          </button>
          <button
            onClick={() => setAdminTab('vouchers_and_notices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border relative cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'vouchers_and_notices'
                ? 'bg-zinc-950 border-zinc-950 text-white shadow-md shadow-zinc-950/10'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-xs'
            }`}
          >
            Slogan Chạy & Vouchers
            <span className="bg-amber-100 text-amber-900 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-full border border-amber-250 ml-1">
              {adminVouchers.length}
            </span>
          </button>
          <button
            onClick={() => setAdminTab('backup_settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border relative cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'backup_settings'
                ? 'bg-zinc-950 border-zinc-950 text-white shadow-md shadow-zinc-950/10'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-xs'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            Sao Lưu & Cài Đặt
          </button>
        </div>
      </div>

      {/* Floating Interactive Live Order Banner with Auto-scroll capability */}
      {showLiveOrderBanner && latestIncomingNotif && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl animate-pop-bounce text-left relative overflow-hidden" id="admin-live-arrival-banner">
          {/* Subtle background glow decorator */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-300/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
          
          <div className="flex items-start gap-3.5 relative z-10">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl animate-bell-ring shrink-0 shadow-sm border border-amber-200/50">
              <BellRing className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] bg-amber-500 text-black font-black px-2 py-0.5 rounded-lg tracking-wider uppercase">🔔 ĐƠN HÀNG MỚI ĐẾN</span>
                <span className="text-[10px] text-zinc-500 font-mono font-bold bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/30">ID: {latestIncomingNotif.orderId || 'MỚI'}</span>
                <span className="text-[10px] text-zinc-400 font-mono font-bold">{latestIncomingNotif.time}</span>
              </div>
              <h4 className="text-sm font-black text-zinc-900 mt-1.5 leading-snug">
                Phát hiện giao dịch mới đồng bộ thành công!
              </h4>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                {latestIncomingNotif.message}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 shrink-0 relative z-10 sm:self-end md:self-center">
            <button
              onClick={() => {
                setAdminTab('notifications');
                setShowLiveOrderBanner(false);
                setTimeout(() => {
                  const el = document.getElementById('admin-notifications-panel');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 200);
              }}
              className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-850 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all active:scale-95 shadow flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" /> Cuộn xem thông báo
            </button>
            <button
              onClick={() => {
                setAdminTab('orders_control');
                setShowLiveOrderBanner(false);
                setTimeout(() => {
                  const el = document.getElementById('admin-orders-control-panel');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 200);
              }}
              className="px-4 py-2.5 bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 font-extrabold text-xs rounded-xl cursor-pointer transition-all active:scale-95 shadow-xs flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5" /> Cuộn xem bưu tá
            </button>
            <button
              onClick={() => setShowLiveOrderBanner(false)}
              className="p-2 text-zinc-400 hover:text-zinc-600 font-black cursor-pointer bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl"
              title="Đóng cảnh báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Warehousing alerts list - displayed at the top if urgent */}
      {lowStockProducts.length > 0 && adminTab === 'warehouse_inventory' && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">Cảnh báo thiếu hụt kho hàng thực tế!</h4>
              <p className="text-xs text-slate-300 mt-1">
                Phát hiện <b>{lowStockProducts.length} mẫu xe</b> có lượng hàng tồn bé hơn hoặc bằng 3 chiếc. Quý khách vui lòng bổ sung nhập hàng hoặc đổi trạng thái.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockProducts.slice(0, 3).map((lp) => (
              <button
                key={lp.id}
                onClick={() => handleRestockRefill(lp.id, lp.stock)}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-[10px] uppercase shadow-sm transition-all active:scale-95 hover:bg-amber-450"
              >
                Nhập +10 {lp.name.split(' ').slice(0,2).join(' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'warehouse_inventory' && (
        <div className="space-y-6 text-left animate-fade-in" id="admin-warehouse-inventory-panel">
          {/* Action row to Add cars */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm">
            <div>
              <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-5 h-5 text-red-500" /> Hệ Thống Quản Lý Sản Phẩm Xe Mô Hình ({products.length})
              </h3>
              <p className="text-[11px] text-zinc-600 mt-0.5 font-medium">Bổ sung mô hình mới hoặc cập nhật chi tiết các thông số cơ học, số lượng tồn kho và khuyến mại bán hàng.</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-850 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow active:scale-95 cursor-pointer transition-all border border-zinc-950 whitespace-nowrap"
              id="admin-add-car-trigger"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Đóng Form Thêm Xe' : 'Thêm Mô Hình Mới'}</span>
            </button>
          </div>

          {/* ADD MODEL CAR FORM */}
          {showAddForm && (
            <form onSubmit={handleProductSubmit} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xl space-y-4 animate-slide-down text-left">
              <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-100 pb-2.5">
                <Plus className="w-4 h-4 text-[#0a5cff] shrink-0" /> Thêm mô hình ô tô mới vào kho tự động
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-650 mb-1">Tên xe mô hình:</label>
                  <input
                    type="text"
                    required
                    placeholder="ví dụ: Ferrari Daytona SP3"
                    value={newProd.name}
                    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs px-3 py-2 rounded-lg text-zinc-950 font-medium focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-650 mb-1">Thương hiệu:</label>
                  <input
                    type="text"
                    required
                    placeholder="ví dụ: Ferrari"
                    value={newProd.brand}
                    onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs px-3 py-2 rounded-lg text-zinc-950 font-medium focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-650 mb-1">Mức giá nhập (VND):</label>
                  <input
                    type="number"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: parseInt(e.target.value, 10) })}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs px-3 py-2 rounded-lg text-zinc-950 font-mono focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-650 mb-1">Giảm giá (%):</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={99}
                    value={newProd.discountPercentage}
                    onChange={(e) => setNewProd({ ...newProd, discountPercentage: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs px-3 py-2 rounded-lg text-zinc-950 font-mono focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-650 mb-1">Tỷ lệ thiết kế:</label>
                  <select
                    value={newProd.scale}
                    onChange={(e) => setNewProd({ ...newProd, scale: e.target.value as Product['scale'] })}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs px-3 py-2 rounded-lg text-zinc-950 focus:outline-none focus:border-zinc-900"
                  >
                    <option value="1:18" className="bg-white text-zinc-950">Tỷ lệ 1:18 (Mẫu to nặng)</option>
                    <option value="1:24" className="bg-white text-zinc-950">Tỷ lệ 1:24 (Vừa dầm)</option>
                    <option value="1:32" className="bg-white text-zinc-950">Tỷ lệ 1:32 (Để bàn làm việc)</option>
                    <option value="1:64" className="bg-white text-zinc-950">Tỷ lệ 1:64 (Mẫu mini)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-650 mb-1">Tồn kho ban đầu:</label>
                  <input
                    type="number"
                    required
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: parseInt(e.target.value, 10) })}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs px-3 py-2 rounded-lg text-zinc-950 focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-650 mb-1">Thể loại xe (Tự nhập):</label>
                  <input
                    type="text"
                    required
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    placeholder="Nhập thể loại xe (VD: Supercar, SUV, Classic, F1...)"
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs px-3 py-2 rounded-lg text-zinc-950 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              {/* Direct Web Storage Media Uploader Section */}
              <div className="bg-zinc-50/50 p-4 rounded-2xl border border-zinc-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-250">
                  <span className="text-[11px] font-extrabold text-amber-850 uppercase tracking-widest">
                    TẢI LÊN TRỰC TIẾP VÀO BỘ NHỚ LƯU TRỮ (LOCAL STORE/IMAGE GALLERY)
                  </span>
                  
                  <button
                    type="button"
                    onClick={autofillDemoData}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold border border-amber-250 cursor-pointer active:scale-95 transition-all"
                  >
                    ✨ Tự động điền nhanh dữ liệu mẫu & 10 file media siêu nét
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Avatar Upload */}
                  <div className="bg-white p-3.5 rounded-xl border border-zinc-200 flex flex-col items-center justify-center text-center">
                    <p className="text-[11px] font-bold text-zinc-800 mb-2">Ảnh Đại Diện (1 Avatar)</p>
                    
                    {newProd.imageUrl ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 mb-2 bg-zinc-100">
                        <img src={newProd.imageUrl} className="w-full h-full object-cover" alt="Preview avt" />
                        <button
                          type="button"
                          onClick={() => setNewProd(p => ({ ...p, imageUrl: '' }))}
                          className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-[10px] text-red-400 font-bold transition-all"
                        >
                          Xóa
                        </button>
                      </div>
                    ) : (
                      <label className="w-16 h-16 rounded-lg border border-dashed border-zinc-300 hover:border-zinc-500 flex flex-col items-center justify-center cursor-pointer transition-all mb-2 bg-zinc-50">
                        <Upload className="w-4 h-4 text-zinc-400" />
                        <span className="text-[8px] text-zinc-500 mt-1 font-bold">Chọn ảnh</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                    
                    <span className="text-[9px] text-zinc-500 leading-normal font-medium">Định dạng PNG/JPG/Base64</span>
                    <input
                      type="text"
                      placeholder="Hoặc dán link ảnh thủ công..."
                      value={newProd.imageUrl}
                      onChange={(e) => setNewProd(p => ({ ...p, imageUrl: e.target.value }))}
                      className="w-full bg-zinc-50 border border-zinc-200 text-[10px] px-2 py-1.5 rounded mt-2 text-zinc-800 font-mono focus:outline-none focus:border-zinc-950"
                    />
                  </div>

                  {/* Gallery Sub-images Upload */}
                  <div className="bg-white p-3.5 rounded-xl border border-zinc-200 flex flex-col items-center justify-center text-center">
                    <p className="text-[11px] font-bold text-zinc-800 mb-2">Combo Ảnh Chi Tiết (Có {newProd.galleryImages.length}/9 ảnh)</p>
                    
                    <div className="flex flex-wrap gap-1 justify-center max-w-[120px] mb-2">
                      {[...Array(9)].map((_, idx) => {
                        const img = newProd.galleryImages[idx];
                        if (img) {
                          return (
                            <div key={idx} className="relative w-7 h-7 rounded border border-zinc-200 overflow-hidden bg-zinc-150">
                              <img src={img} className="w-full h-full object-cover" alt="" />
                              <button
                                type="button"
                                onClick={() => setNewProd(p => ({ ...p, galleryImages: p.galleryImages.filter((_, i) => i !== idx) }))}
                                className="absolute inset-0 bg-red-650/80 opacity-0 hover:opacity-100 flex items-center justify-center text-[7px] text-white font-bold cursor-pointer"
                              >
                                X
                              </button>
                            </div>
                          );
                        } else {
                          return (
                            <div key={idx} className="w-7 h-7 rounded border border-dashed border-zinc-300 flex items-center justify-center bg-zinc-50 text-[9px] text-zinc-400 font-bold font-mono">
                              {idx + 1}
                            </div>
                          );
                        }
                      })}
                    </div>

                    <label className="px-3 py-1 bg-[#0a5cff]/5 hover:bg-[#0a5cff]/10 text-[#0a5cff] border border-[#0a5cff]/20 rounded-lg text-[10px] font-bold cursor-pointer transition-all active:scale-95 flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Thêm cụm ảnh</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleGalleryUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[9px] text-zinc-500 font-medium mt-1.5">Tải lên ít nhất hoặc tích lũy đủ 9 tấm</span>
                  </div>

                  {/* Video Showcase Upload */}
                  <div className="bg-white p-3.5 rounded-xl border border-zinc-200 flex flex-col items-center justify-center text-center">
                    <p className="text-[11px] font-bold text-zinc-800 mb-2">Video Mô Phỏng (Động cơ/Chạy thử)</p>
                    
                    {newProd.videoUrl ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 mb-2 bg-zinc-150 flex items-center justify-center">
                        <Play className="w-6 h-6 text-red-500" />
                        <button
                          type="button"
                          onClick={() => setNewProd(p => ({ ...p, videoUrl: '' }))}
                          className="absolute inset-0 bg-black/80 opacity-0 hover:opacity-100 flex items-center justify-center text-[10px] text-red-400 font-bold transition-all"
                        >
                          Xóa Video
                        </button>
                      </div>
                    ) : (
                      <label className="w-16 h-16 rounded-lg border border-dashed border-zinc-300 hover:border-zinc-500 flex flex-col items-center justify-center cursor-pointer transition-all mb-2 bg-zinc-50">
                        <Upload className="w-4 h-4 text-zinc-400" />
                        <span className="text-[8px] text-zinc-500 mt-1 font-bold">Thêm clip</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                        />
                      </label>
                    )}

                    <span className="text-[9px] text-zinc-500 leading-normal font-medium">Định dạng MP4/MOV/WebM</span>
                    <input
                      type="text"
                      placeholder="Hoặc dán URL video .mp4..."
                      value={newProd.videoUrl}
                      onChange={(e) => setNewProd(p => ({ ...p, videoUrl: e.target.value }))}
                      className="w-full bg-zinc-50 border border-zinc-200 text-[10px] px-2 py-1.5 rounded mt-2 text-zinc-800 font-mono focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-650 mb-1">Mô tả đặc điểm cơ học cấu thành (Phần viết mô tả dài & chi tiết hơn):</label>
                <textarea
                  rows={10}
                  placeholder="ví dụ: Đúc kim loại nguyên tấm nặng tay, lót nỉ sàn xe, nắp máy sơn xi vàng óng, chi tiết máy mô phỏng sắc sảo..."
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 text-xs px-3 py-2 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900 min-h-[150px]"
                />
              </div>

              {/* Đặc điểm & Cơ chế hoạt động */}
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-250 space-y-3">
                <label className="block text-[11px] font-bold text-zinc-650 uppercase tracking-wider">
                  Đặc điểm và Cơ chế hoạt động:
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ví dụ: Cơ chế vô lăng xoay được kèm giảm xóc bánh sau..."
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    className="flex-1 bg-white border border-zinc-200 text-xs px-3 py-2.5 rounded-lg text-zinc-900 font-medium focus:outline-none focus:border-zinc-900"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                  >
                    Thêm đặc điểm
                  </button>
                </div>

                {newProd.features.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newProd.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 text-zinc-800 text-[11px] px-2.5 py-1 rounded-full">
                        <span>{feat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="text-zinc-400 hover:text-red-500 font-extrabold focus:outline-none text-[10px] w-4 h-4 rounded-full hover:bg-zinc-200 flex items-center justify-center cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-400 italic">Chưa có đặc điểm/cơ chế hoạt động nào được cấu hình.</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-98 uppercase font-mono"
              >
                Xác Nhận Đăng Bán Mô Hình
              </button>
            </form>
          )}

          {/* TABLE OF PRODUCTS DIRECT CONTROL */}
          <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-xs text-zinc-500 font-extrabold uppercase tracking-wider">
                    <th className="px-5 py-4 text-left">Mẫu xe mô hình</th>
                    <th className="px-5 py-4 text-left">Phân khúc</th>
                    <th className="px-5 py-4 text-left">Đơn Giá niêm yết</th>
                    <th className="px-5 py-4 text-center">Khuyến mãi (%)</th>
                    <th className="px-5 py-4 text-center">Tồn Kho hiện tại</th>
                    <th className="px-5 py-4 text-right">Chi tiết thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {products.map((p) => {
                    const isEditing = p.id === editingProductId;

                    return (
                      <tr key={p.id} className="text-xs hover:bg-zinc-50/80 transition-all text-left">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-zinc-200 shadow-sm" />
                            <div>
                              <p className="font-extrabold text-zinc-900 text-xs">{p.name}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[9px] font-extrabold bg-zinc-100 text-zinc-600 font-mono px-1.5 py-0.5 rounded border border-zinc-200 uppercase">
                                  Tỷ Lệ {p.scale}
                                </span>
                                <span className="text-[9px] font-bold text-zinc-500">
                                  Hãng: {p.brand}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-zinc-700 capitalize font-bold">{p.category}</td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editPriceAmount}
                              onChange={(e) => setEditPriceAmount(parseInt(e.target.value, 10) || 0)}
                              className="w-24 bg-white border border-zinc-300 rounded-lg text-center px-1 py-1 font-mono text-red-600 text-xs focus:outline-none focus:border-red-500"
                            />
                          ) : (
                            <span className="font-black text-red-600 font-mono text-xs">{(p.price).toLocaleString('vi-VN')} đ</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              max={90}
                              value={editDiscountAmount}
                              onChange={(e) => setEditDiscountAmount(parseInt(e.target.value, 10) || 0)}
                              className="w-16 bg-white border border-zinc-300 rounded-lg text-center px-1 py-1 font-mono text-amber-600 text-xs focus:outline-none focus:border-red-500"
                            />
                          ) : (
                            <span className="font-black text-amber-600 font-mono">
                              {p.discountPercentage && p.discountPercentage > 0 ? `-${p.discountPercentage}%` : '0%'}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editStockAmount}
                              onChange={(e) => setEditStockAmount(parseInt(e.target.value, 10) || 0)}
                              className="w-16 bg-white border border-zinc-300 rounded-lg text-center px-1 py-1 font-mono text-zinc-800 text-xs focus:outline-none focus:border-red-500"
                            />
                          ) : (
                            <span className={`font-mono font-black px-2 py-1 rounded-lg text-[11px] ${p.stock <= 3 ? 'text-red-600 bg-red-50 border border-red-200' : 'text-zinc-700 bg-zinc-100 border border-zinc-200'}`}>
                              {p.stock} chiếc
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {isEditing ? (
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => saveProductChanges(p.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-[10px] shadow-sm cursor-pointer"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => setEditingProductId(null)}
                                className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold rounded-lg text-[10px] border border-zinc-200 cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-end items-center">
                              <button
                                onClick={() => handleStartFullEdit(p)}
                                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 rounded-lg text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                                title="Chỉnh sửa chi tiết toàn bộ trường tin"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Chi Tiết
                              </button>
                              
                              <button
                                onClick={() => startEditingProduct(p)}
                                className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-lg border border-zinc-200 cursor-pointer transition-all active:scale-95"
                                title="Sửa nhanh giá & kho"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRestockRefill(p.id, p.stock)}
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                                title="Tự động nhập thêm +10 xe"
                              >
                                +10 chiếc
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STATS OVERVIEW PANEL */}
      {adminTab === 'stats' && (
        <div className="space-y-6 text-left animate-fade-in" id="admin-stats-panel">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-zinc-200 shadow-sm p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Doanh Số Thanh Toán</span>
                <p className="text-2xl font-black text-emerald-600 font-mono mt-1">{totalRevenue.toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-zinc-200 shadow-sm p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-extrabold">Số Lượng Đơn Hàng</span>
                <p className="text-2xl font-black text-sky-650 font-mono mt-1">{orders.length} đơn</p>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
                <ListOrdered className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-zinc-200 shadow-sm p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 subpixel-antialiased uppercase tracking-widest font-extrabold">Tổng Mẫu Trong Kho</span>
                <p className="text-2xl font-black text-red-650 font-mono mt-1">
                  {products.reduce((sum, p) => sum + p.stock, 0)} chiếc
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl text-red-600">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Dynamic Daily Revenue Line/Area Chart (Recharts Integration) */}
          <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-5 sm:p-6 space-y-4" id="admin-daily-revenue-chart">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#f43f5e] uppercase tracking-wider flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Biểu Đồ Doanh Thu Thực Tế Hằng Ngày (7 Ngày Qua)
                </h3>
                <p className="text-[11px] text-zinc-550 mt-0.5 font-medium">
                  Thống kê doanh số giao dịch tự động thành công (Realtime Transaction Analytics)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span> Doanh thu (VND)
                </span>
                <span className="flex items-center gap-1.5 font-bold text-sky-600">
                  <span className="w-2.5 h-2.5 bg-sky-550 rounded-full inline-block"></span> Số đơn hàng
                </span>
              </div>
            </div>

            <div className="h-68 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  
                  <XAxis 
                    dataKey="date" 
                    stroke="#27272a" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#27272a" 
                    fontSize={9} 
                    fontFamily="monospace"
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toLocaleString('vi-VN')}k`}
                  />
                  
                  <Tooltip content={<CustomChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                  
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#revenueGrad)" 
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#09090b' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ordersCount" 
                    stroke="#0ea5e9" 
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fillOpacity={0} 
                    fill="url(#ordersGrad)" 
                    activeDot={{ r: 4, stroke: '#0ea5e9', strokeWidth: 1, fill: '#09090b' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Simple Sales visualizer mockup info */}
          <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-6">
            <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-1.5 mb-2 uppercase">Biểu Đồ Sức Bán (Sandbox Output logs)</h3>
            <p className="text-xs text-zinc-600 mb-5 font-medium">Danh sách các sản phẩm đang dẫn đầu lượng chốt hàng từ người chơi.</p>
            
            <div className="space-y-4">
              {products.slice(0, 5).map((p) => {
                const soldQty = 25 - p.stock > 0 ? 25 - p.stock : 2;
                return (
                  <div key={p.id}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-zinc-800">{p.name} ({p.scale})</span>
                      <span className="text-red-650 font-mono font-bold">Đã bán {soldQty} chiếc</span>
                    </div>
                    {/* Visual Bar style */}
                    <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-200">
                      <div 
                        className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-full animate-pulse"
                        style={{ width: `${(soldQty / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* DISPATCH AND ACTION OVER TRADING ORDERS */}
      {adminTab === 'orders_control' && (
        <div className="space-y-6 text-left animate-fade-in" id="admin-orders-control-panel">
          <h3 className="text-sm font-bold text-zinc-300">Xử lý bưu kiện bưu tá (Real-time Flow Override):</h3>

          {orders.length === 0 ? (
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-10 text-center">
              <Package className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
              <p className="text-xs text-zinc-400 font-medium">Danh bạ bưu tá trống. Chưa phát hiện đơn hàng từ khách hàng giao dịch.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => {
                const totalQty = o.items.reduce((sum, item) => sum + item.quantity, 0);
                const isNewestOrder = latestIncomingNotif && latestIncomingNotif.orderId === o.id;

                return (
                  <div 
                    key={o.id} 
                    className={`border backdrop-blur-md rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isNewestOrder 
                        ? 'border-amber-400 bg-amber-500/10 animate-pulse-yellow' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-mono font-bold text-red-400">ĐƠN: {o.id}</span>
                        <span className="text-[10px] bg-black/40 border border-white/5 font-mono text-zinc-500 px-1.5 py-0.5 rounded">
                          {o.createdAt}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-150">Người mua: {o.userName} ({o.userPhone})</p>
                      <p className="text-xs text-zinc-400 mt-1">Giỏ sắm: {o.items[0]?.productName} x{o.items[0]?.quantity} (và {o.items.length - 1} loại khác)</p>
                      <p className="text-xs font-bold text-red-100 mt-1 font-mono">Hoá đơn: {o.totalAmount.toLocaleString('vi-VN')} đ / Phương Thức: {o.paymentMethod.toUpperCase()}</p>
                      {o.carrier && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px]">
                          <span className="text-zinc-500 font-semibold uppercase">Đơn vị:</span>
                          <span className="text-red-400 font-mono font-bold uppercase p-0.5 px-1.5 bg-red-500/10 rounded tracking-wider border border-red-500/20">{o.carrier}</span>
                          <span className="text-zinc-500 font-semibold uppercase ml-1.5">Mã vận đơn:</span>
                          <span className="text-zinc-200 font-mono font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/10 tracking-widest">{o.trackingCode || 'Sắp tạo'}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 items-stretch sm:items-end w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Lộ trình:</span>
                        <span className="text-xs font-bold font-mono text-emerald-400">{o.deliveryProgress}%</span>
                        <span className="text-xs text-zinc-300">Trạng thái: <b className="text-red-400 uppercase">{o.status}</b></span>
                      </div>

                      {/* State Dispatch Controls */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {/* Print shipping list button */}
                        <button
                          onClick={() => {
                            setActiveWaybillOrder(o);
                            if (onPrintOrderLabel) {
                              onPrintOrderLabel(o.id);
                            }
                          }}
                          className={`flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1.5 rounded-lg uppercase shadow-sm transition-all cursor-pointer ${
                            o.carrierLabelPrinted 
                              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700' 
                              : 'bg-red-500 hover:bg-red-450 text-white border border-red-500/30'
                          }`}
                          title="In mã vận đơn bàn giao bưu cục"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{o.carrierLabelPrinted ? 'In Lại Mã (Đã in)' : 'In mã vận đơn'}</span>
                        </button>
                        {/* If status is paid, trigger preparing */}
                        {o.status === 'paid' && (
                          <button
                            onClick={() => onUpdateOrderStatus(o.id, 'preparing')}
                            className="bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-extrabold px-3 py-1.5 rounded-lg uppercase shadow-sm transition-all cursor-pointer"
                          >
                            Xác Nhận Có Hàng & Đóng Gói
                          </button>
                        )}
                        {/* If status is preparing, ship */}
                        {o.status === 'preparing' && (
                          <button
                            onClick={() => onUpdateOrderStatus(o.id, 'shipping')}
                            className="bg-red-500 hover:bg-red-450 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg uppercase shadow-sm transition-all cursor-pointer border border-red-400/30"
                          >
                            Giao Bưu Tá Vận Chuyển
                          </button>
                        )}
                        {/* Deliver button */}
                        {o.status === 'shipping' && (
                          <button
                            onClick={() => onUpdateOrderStatus(o.id, 'delivered')}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-extrabold px-3 py-1.5 rounded-lg uppercase shadow-sm transition-all cursor-pointer"
                          >
                            Xác Nhận Khách Đã Nhận Xe
                          </button>
                        )}
                        {/* Cancel option */}
                        {o.status !== 'delivered' && o.status !== 'cancelled' && (
                          <button
                            onClick={() => onUpdateOrderStatus(o.id, 'cancelled')}
                            className="bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-black text-[10px] font-extrabold px-3 py-1.5 rounded-lg uppercase transition-all cursor-pointer"
                          >
                            Hủy Giao Vận
                          </button>
                        )}

                        {o.status === 'delivered' && (
                          <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Đơn hoàn thành
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* REAL-TIME NOTIFICATIONS LOG PANEL */}
      {adminTab === 'notifications' && (
        <div className="space-y-6 text-left animate-fade-in" id="admin-notifications-panel">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <BellRing className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                Nhật Ký Cảnh Báo Đơn Hàng & Hệ Thống
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Lưu trữ hoạt động real-time theo dõi doanh số chốt đơn của hệ thống.</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (onClearAllNotifications) {
                    onClearAllNotifications();
                  }
                }}
                disabled={adminNotifications.length === 0}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 hover:text-white text-zinc-300 font-bold text-[10px] uppercase rounded-xl transition-all border border-white/10 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
              </button>
            </div>
          </div>

          {adminNotifications.length === 0 ? (
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-12 text-center">
              <Bell className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
              <p className="text-xs text-zinc-400 font-bold">Không có thông báo mới.</p>
              <p className="text-[10px] text-zinc-500 mt-1">Hệ thống tĩnh lặng. Chưa ghi nhận đơn hàng mới phát sinh từ người mua.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {adminNotifications.map((notif) => {
                const isNewestPulse = latestIncomingNotif && latestIncomingNotif.id === notif.id;
                return (
                  <div 
                    key={notif.id}
                    className={`border backdrop-blur-md rounded-2xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isNewestPulse 
                        ? 'border-amber-400 bg-amber-500/10 animate-pulse-yellow' 
                        : !notif.read 
                          ? 'bg-red-500/10 border-red-500/30' 
                          : 'bg-white/5 border-white/5'
                    }`}
                  >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      !notif.read ? 'bg-red-500/20 text-red-450' : 'bg-white/5 text-zinc-500'
                    }`}>
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-extrabold text-white uppercase">{notif.title}</h4>
                        {!notif.read && (
                          <span className="bg-red-500 text-white font-mono font-bold text-[8px] px-1.5 py-0.5 rounded uppercase animate-pulse">Mới</span>
                        )}
                        <span className="text-[10px] text-zinc-500 font-mono">{notif.time}</span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed font-medium">
                        {notif.message}
                      </p>
                      {notif.orderId && (
                        <p className="text-[10px] text-red-400 font-mono mt-1 font-semibold">Mã Đơn hàng: {notif.orderId}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-stretch gap-2 shrink-0">
                    {!notif.read && onMarkNotificationRead && (
                      <button
                        onClick={() => onMarkNotificationRead(notif.id)}
                        className="px-3 py-1.5 bg-red-550/20 hover:bg-red-500 text-red-300 hover:text-white font-bold text-[10px] uppercase rounded-lg transition-all border border-red-500/30 cursor-pointer text-center"
                      >
                        Đánh dấu đọc
                      </button>
                    )}
                    
                    {notif.orderId && (
                      <button
                        onClick={() => {
                          if (onMarkNotificationRead && !notif.read) {
                            onMarkNotificationRead(notif.id);
                          }
                          setAdminTab('orders_control');
                        }}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase rounded-lg transition-all border border-white/10 cursor-pointer text-center"
                      >
                        Xem Vận Đơn
                      </button>
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      )}

      {/* CRM CUSTOMERS PANEL */}
      {adminTab === 'customers' && (
        <div className="space-y-6 text-left animate-fade-in" id="admin-crm-panel">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-5 h-5 text-red-550" />
                Sổ Khách Hàng Thân Thiết (CRM Panel)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Quản lý nâng cao thông số điểm tích lũy, địa chỉ, số dư quà đổi VIP & sở thích của các nhà sưu tầm.</p>
            </div>
            
            <button
              onClick={() => setCrmShowAddForm(!crmShowAddForm)}
              className="px-4 py-2 bg-gradient-to-r from-red-650 to-red-500 hover:opacity-90 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-red-500/10 cursor-pointer active:scale-95 transition-all text-center"
            >
              <UserPlus className="w-4 h-4" /> Đăng Ký Khách Hàng VIP
            </button>
          </div>

          {/* Form to create a new customer profile */}
          {crmShowAddForm && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!crmNewPhone.trim() || !crmNewName.trim()) return;
                if (onUpdateCustomers) {
                  onUpdateCustomers(prev => {
                    const cleanPhoneInput = crmNewPhone.replace(/\s+/g, '');
                    if (prev.find(c => c.phone.replace(/\s+/g, '') === cleanPhoneInput)) {
                      alert('Số điện thoại này đã tồn tại trong cơ sở dữ liệu!');
                      return prev;
                    }
                    return [
                      ...prev,
                      {
                        phone: crmNewPhone.trim(),
                        name: crmNewName.trim(),
                        address: crmNewAddress.trim(),
                        loyaltyPoints: Number(crmNewPoints) || 0,
                        lifetimePoints: Number(crmNewPoints) || 0,
                        notes: crmNewNotes.trim() || 'Người sưu tầm đăng ký thủ công.'
                      }
                    ];
                  });
                }
                setCrmNewPhone('');
                setCrmNewName('');
                setCrmNewAddress('');
                setCrmNewNotes('');
                setCrmNewPoints(150);
                setCrmShowAddForm(false);
              }}
              className="bg-white border border-zinc-200 p-5 rounded-2xl space-y-4 shadow-xl"
            >
              <div className="flex items-center gap-2 border-b border-zinc-150 pb-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">Tạo Hồ Sơ Khách Hàng Mới</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-650 font-bold uppercase tracking-wider mb-1.5">Họ & Tên *</label>
                  <input
                    type="text"
                    required
                    value={crmNewName}
                    onChange={(e) => setCrmNewName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-950 focus:outline-none focus:border-zinc-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-655 font-bold uppercase tracking-wider mb-1.5">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={crmNewPhone}
                    onChange={(e) => setCrmNewPhone(e.target.value)}
                    placeholder="VD: 0912345678"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-950 focus:outline-none focus:border-zinc-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-655 font-bold uppercase tracking-wider mb-1.5">Điểm Tích Lũy Ban Đầu</label>
                  <input
                    type="number"
                    value={crmNewPoints}
                    onChange={(e) => setCrmNewPoints(Number(e.target.value))}
                    placeholder="150"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-950 focus:outline-none focus:border-zinc-950 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-655 font-bold uppercase tracking-wider mb-1.5">Địa Chỉ Nhận Hàng Thường Dùng</label>
                  <input
                    type="text"
                    value={crmNewAddress}
                    onChange={(e) => setCrmNewAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-950 focus:outline-none focus:border-zinc-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-655 font-bold uppercase tracking-wider mb-1.5">Ghi Chú Độc Quyền (Sở thích sưu tầm, ưu tiên...)</label>
                  <input
                    type="text"
                    value={crmNewNotes}
                    onChange={(e) => setCrmNewNotes(e.target.value)}
                    placeholder="Màu sắc sơn bóng hay nhám, chi tiết tháo lắp, đặt thêu vương miện nhựa..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-950 focus:outline-none focus:border-zinc-950"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setCrmShowAddForm(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-950 hover:bg-zinc-850 text-white rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer shadow-md shadow-zinc-400/20"
                >
                  Xác nhận lưu
                </button>
              </div>
            </form>
          )}

          {/* CRM Filters & Search controls */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
            <div className="relative w-full md:max-w-md">
              <input
                type="text"
                placeholder="Tìm khách hàng theo SĐT, Tên, Địa chỉ hoặc ưu tiên sưu tầm..."
                value={crmSearch}
                onChange={(e) => setCrmSearch(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-950 placeholder-zinc-400 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-zinc-905"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
            </div>

            <div className="text-[10px] text-zinc-650 font-bold bg-zinc-50 border border-zinc-205 rounded-xl px-3.5 py-2 font-mono flex items-center gap-1.5 flex-shrink-0">
              <Users className="w-3.5 h-3.5 text-zinc-500" /> 
              <span>TỔNG KHÁCH HÀNG: <strong className="text-zinc-950 text-xs font-black">{customers.length}</strong> HỘ SƠ</span>
            </div>
          </div>

          {/* Bento dynamic cards profile layout */}
          {customers.filter(c => 
            c.name.toLowerCase().includes(crmSearch.toLowerCase()) || 
            c.phone.includes(crmSearch) || 
            c.address.toLowerCase().includes(crmSearch.toLowerCase()) || 
            (c.notes && c.notes.toLowerCase().includes(crmSearch.toLowerCase()))
          ).length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
              <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-xs text-zinc-400 font-extrabold uppercase">Không tìm thấy kết quả phù hợp</p>
              <p className="text-[10px] text-zinc-500 mt-1">Hệ thống CRM không sở hữu thông tin khách hàng trùng khớp yêu cầu tìm kiếm.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.filter(c => 
                c.name.toLowerCase().includes(crmSearch.toLowerCase()) || 
                c.phone.includes(crmSearch) || 
                c.address.toLowerCase().includes(crmSearch.toLowerCase()) || 
                (c.notes && c.notes.toLowerCase().includes(crmSearch.toLowerCase()))
              ).map((customer) => {
                const cCleanPhone = customer.phone.replace(/\s+/g, '');
                // Calculate purchasing orders count from orders state
                const userOrders = orders.filter(o => o.userPhone.replace(/\s+/g, '') === cCleanPhone);
                const isEditing = crmEditingPhone === customer.phone;

                return (
                  <div 
                    key={customer.phone}
                    className={`border rounded-2xl p-5 hover:bg-zinc-50 transition-all flex flex-col justify-between gap-4 relative ${
                      isEditing ? 'border-red-500/50 bg-red-50/50' : 'bg-white border-zinc-200/85 shadow-sm'
                    }`}
                  >
                    {/* Level VIP tag indicators */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full ${
                        customer.loyaltyPoints >= 1000 
                          ? 'bg-amber-50 text-amber-850 border border-amber-250 font-extrabold animate-pulse'
                          : customer.loyaltyPoints >= 300 
                          ? 'bg-red-50 text-red-750 border border-red-200'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}>
                        {customer.loyaltyPoints >= 1000 ? '⭐ PLATINUM VIP' : customer.loyaltyPoints >= 300 ? '🔴 GOLD COLLECTOR' : 'MEMBER'}
                      </span>
                    </div>

                    <div className="space-y-3 text-left">
                      {/* Name and Phone header */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm border shadow-sm ${
                          customer.loyaltyPoints >= 1000 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={crmEditName} 
                              onChange={(e) => setCrmEditName(e.target.value)}
                              className="bg-zinc-50 border border-red-500 text-xs font-bold text-zinc-950 rounded px-2 py-1 max-w-[130px] focus:outline-none"
                            />
                          ) : (
                            <h4 className="text-xs font-black text-zinc-950 hover:text-red-650 transition-all font-sans flex items-center gap-1">
                              {customer.name}
                            </h4>
                          )}
                          <p className="text-[10px] text-zinc-500 font-bold font-mono tracking-wider flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                            {customer.phone}
                          </p>
                        </div>
                      </div>

                      {/* Points Tracker Bar */}
                      <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-600 font-bold uppercase flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-600" /> Điểm Tích Lũy:
                          </span>
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={crmEditPoints} 
                              onChange={(e) => setCrmEditPoints(Number(e.target.value))}
                              className="bg-zinc-50 border border-red-500 text-xs text-amber-850 font-bold rounded px-1.5 py-0.5 max-w-[70px] font-mono text-right focus:outline-none"
                            />
                          ) : (
                            <span className="text-amber-850 font-black font-mono text-sm">{customer.loyaltyPoints} điểm</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-zinc-500 pt-1 border-t border-zinc-200 font-mono">
                          <span>Trọn Đời: {customer.lifetimePoints || customer.loyaltyPoints}đ</span>
                          <span>Đơn Hàng Đã Đặt: <strong className="text-zinc-950 font-black">{userOrders.length} đơn</strong></span>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="space-y-1 text-xs">
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block">Địa chỉ nhận hàng:</span>
                        {isEditing ? (
                          <textarea 
                            value={crmEditAddress} 
                            onChange={(e) => setCrmEditAddress(e.target.value)}
                            rows={2}
                            className="w-full bg-zinc-50 border border-red-300 text-xs text-zinc-950 rounded px-2 py-1 focus:outline-none"
                          />
                        ) : (
                          <p className="text-zinc-700 pr-1 text-xs flex items-start gap-1 leading-normal">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2" title={customer.address}>{customer.address || "Chưa thiết lập địa chỉ mặc định"}</span>
                          </p>
                        )}
                      </div>

                      {/* Special preferences internal staff NOTES */}
                      <div className="space-y-1 text-xs pt-1 border-t border-dashed border-zinc-200">
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-zinc-400" /> Ghi chú nội bộ CRM:
                        </span>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={crmEditNotes} 
                            onChange={(e) => setCrmEditNotes(e.target.value)}
                            placeholder="Sở thích xe SUV, thích thắt nơ bông..."
                            className="w-full bg-zinc-50 border border-red-400 text-xs text-zinc-950 rounded px-2 py-1 focus:outline-none"
                          />
                        ) : (
                          <p className="text-zinc-550 text-[10px] leading-relaxed italic bg-zinc-50 rounded-lg px-2.5 py-1.5 border border-zinc-150">
                            {customer.notes || "Chưa có ghi nhận sở thích đặc biệt."}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons footer */}
                    <div className="flex gap-2 justify-end border-t border-zinc-150 pt-3">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => setCrmEditingPhone(null)}
                            className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-[10px] font-bold rounded-lg transition-all border border-zinc-200 cursor-pointer"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            onClick={() => handleSaveEditCrmCustomer(customer.phone)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold rounded-lg transition-all cursor-pointer shadow"
                          >
                            Lưu ngay
                          </button>
                        </>
                      ) : (
                        <>
                          {onUpdateCustomers && (
                            <button
                              onClick={() => {
                                if (confirm('Bạn có chắc chắn muốn xóa khách hàng thân thiết này khỏi Sổ CRM?')) {
                                  onUpdateCustomers(prev => prev.filter(c => c.phone !== customer.phone));
                                }
                              }}
                              className="px-2 py-1.5 hover:bg-red-55/50 text-red-600 hover:text-red-700 rounded-lg transition-all cursor-pointer"
                              title="Xóa hồ sơ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleStartEditCrm(customer)}
                            className="px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 font-bold text-[10px] rounded-lg border border-zinc-200 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                          >
                            <Edit2 className="w-3 h-3" /> Cập nhật
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VOUCHERS AND SLOGAN RUNNING NOTICES PANEL */}
      {adminTab === 'vouchers_and_notices' && (
        <div className="space-y-8 text-left animate-fade-in" id="admin-vouchers-notices-panel">
          {/* Section 1: Running marquee notice / Slogan settings */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="border-b border-zinc-150 pb-3">
              <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-red-655 animate-pulse" />
                Slogans / Thông Báo Chạy Chữ Trên Trang Chủ
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Đặt câu khẩu hiệu quảng cáo hoặc tin tức nóng hổi chạy liên tục tại thanh thông báo đầu trang.</p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase text-zinc-550">Nội dung thông báo đang viết:</label>
              <textarea
                value={tempMarquee}
                onChange={(e) => setTempMarquee(e.target.value)}
                rows={3}
                placeholder="Ví dụ: 🔥 Khuyến mãi hè rực rỡ..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs text-zinc-950 focus:border-zinc-950 focus:outline-none transition-all leading-relaxed font-sans"
              />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 font-mono">Đoài tương thích: {tempMarquee.length} ký tự.</span>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateMarqueeNotice(tempMarquee);
                    alert('Đã cập nhật slogan chạy chữ trên toàn trang thành công!');
                  }}
                  className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-850 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all active:scale-95 text-center"
                >
                  Áp dụng toàn trang
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Custom Voucher coupons dictionary */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 space-y-6">
            <div className="border-b border-zinc-150 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  Danh Sách Mã Giảm Giá Đang Có ({adminVouchers.length})
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">Thêm, bớt, tùy chỉnh mã chiết khấu trực tiếp và hiển thị tự động trên storefront cho khách hàng gắp mã.</p>
              </div>
            </div>

            {/* Form to append new discount coupon */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 sm:p-5 space-y-4">
              <span className="text-xs font-black text-amber-800 uppercase tracking-wide block font-sans">Tạo Mã Giảm Giá Mới:</span>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase block pl-1">Mã Giảm Giá:</label>
                  <input
                    type="text"
                    value={newVcode}
                    onChange={(e) => setNewVcode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                    placeholder="MÃ VIẾT LIỀN (VD: XEMOI50)"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-950 focus:border-zinc-950 font-mono outline-none"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase block pl-1">Tên Chương Trình:</label>
                  <input
                    type="text"
                    value={newVname}
                    onChange={(e) => setNewVname(e.target.value)}
                    placeholder="VD: Tri Ân Khách Hàng"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-950 focus:border-zinc-950 outline-none"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase block pl-1">Số Tiền Giảm (VNĐ):</label>
                  <input
                    type="number"
                    value={newVamount}
                    onChange={(e) => setNewVamount(Number(e.target.value))}
                    placeholder="VD: 50000"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-950 focus:border-zinc-950 outline-none font-mono"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase block pl-1">Mô tả điều kiện:</label>
                  <input
                    type="text"
                    value={newVdesc}
                    onChange={(e) => setNewVdesc(e.target.value)}
                    placeholder="VD: Áp dụng đơn từ 500k toàn tiệm"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-950 focus:border-zinc-950 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!newVcode || !newVname || newVamount <= 0) {
                      alert('Vui lòng nhập đầy đủ Mã Giảm Giá, Tên và Số tiền giảm lớn hơn 0!');
                      return;
                    }
                    if (adminVouchers.some(v => v.code === newVcode)) {
                      alert('Mã Code giảm giá này đã tồn tại!');
                      return;
                    }
                    onUpdateAdminVouchers([
                      ...adminVouchers,
                      {
                        code: newVcode,
                        name: newVname,
                        amount: newVamount,
                        description: newVdesc || 'Giảm trực tiếp khi thanh toán đơn hàng.'
                      }
                    ]);
                    setNewVcode('');
                    setNewVname('');
                    setNewVamount(0);
                    setNewVdesc('');
                    alert('Đã bổ sung mã giảm giá thành công vào hệ thống MiniAuto!');
                  }}
                  className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-850 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow"
                >
                  <Plus className="w-4 h-4" /> Bổ Sung Mã Giảm Giá
                </button>
              </div>
            </div>

            {/* List vouchers dictionary */}
            <div className="space-y-3">
              <span className="text-xs font-black text-zinc-950 uppercase tracking-wider block">Mã Giảm Giá Đang Lưu Hành:</span>
              {adminVouchers.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  Chưa có mã giảm giá nào tồn tại. Bạn hãy thêm mã mới ở trên!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminVouchers.map((v) => (
                    <div
                      key={v.code}
                      className="bg-white border border-zinc-200 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden group hover:border-[#0a1128] transition-all shadow-sm"
                    >
                      <div className="text-left space-y-1">
                        <span className="text-[9px] bg-red-50 text-red-655 px-1.5 py-0.5 rounded border border-red-200 font-black tracking-widest uppercase font-mono">
                          GIẢM {v.amount.toLocaleString('vi-VN')} Đ
                        </span>
                        <h4 className="text-xs font-black text-zinc-955 uppercase">{v.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-medium">{v.description}</p>
                        <p className="text-[10px] font-mono font-bold text-amber-905 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded inline-block">Mã: {v.code}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa vĩnh viễn voucher ${v.code} này?`)) {
                            onUpdateAdminVouchers(adminVouchers.filter(item => item.code !== v.code));
                          }
                        }}
                        className="px-3 py-2 bg-red-50 text-red-655 hover:bg-red-650 hover:text-white rounded-xl transition-all cursor-pointer text-xs"
                        title="Xóa voucher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BACKUP AND SYSTEM SETTINGS VIEW */}
      {adminTab === 'backup_settings' && (
        <div className="space-y-8 text-left animate-fade-in animate-duration-300" id="admin-backup-settings-panel">
          {/* Section 1: Explanation of Storage */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 space-y-4 relative overflow-hidden shadow-xs">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="border-b border-zinc-150 pb-3">
              <h3 className="text-sm font-extrabold text-[#f43f5e] uppercase tracking-wider flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-500" />
                Vị Trí Lưu Trữ Dữ Liệu Của Bạn
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Tìm hiểu về cơ chế lưu giữ thông tin sản phẩm và đơn hàng của cửa hàng.</p>
            </div>
            
            <div className="text-xs text-zinc-600 leading-relaxed space-y-3 font-sans font-medium">
              <p>
                Toàn bộ dữ liệu của hệ thống <span className="text-amber-600 font-extrabold">MiniAuto.store</span> (bao gồm <strong>Danh mục sản phẩm tự tạo</strong>, <strong>Nhật ký vận đơn giao hàng</strong>, <strong>Thành viên VIP & Sổ tích điểm CRM</strong>, <strong>Danh sách Vouchers chiết khấu</strong> và <strong>Slogan chạy chữ sự kiện</strong>) hiện đang được lưu trữ an toàn và bảo mật ngay tại bộ nhớ cục bộ <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-amber-700 font-mono font-bold border border-zinc-200">localStorage</code> trên Trình duyệt web của thiết bị này.
              </p>
              <div className="bg-amber-50/50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[11px] uppercase tracking-wide text-amber-700">🚨 Khuyến cáo quan trọng bảo vệ số liệu:</span>
                  <span className="text-[11px]">Cơ chế lưu trữ này không tốn tài nguyên mạng và phản hồi tốc độ tức thì. Tuy nhiên, dữ liệu này có thể bị mất nếu bạn thực hiện <b>xóa bộ nhớ cache trình duyệt</b>, chuyển sang chế độ ẩn danh, hoặc mở ứng dụng bằng một trình duyệt/thiết bị khác. Hãy chủ động tiến hành <b>tải tệp sao lưu (.json)</b> định kỳ phía dưới để lưu lại máy tính cá nhân.</span>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC BANK & EMAIL CONFIGURATION BLOCK */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 space-y-6 relative overflow-hidden shadow-xs" id="admin-bank-email-settings">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#f43f5e]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="border-b border-zinc-150 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#f43f5e] uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-red-500 animate-pulse" />
                  Cài Đặt Thanh Toán Ngân Hàng & Thông Báo Email
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Tuỳ chỉnh số tài khoản ngân hàng, mã VietQR, ví Momo và Email của bạn để tự động nhận thông báo khi có đơn hàng mới.
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!tmpAdminEmail) {
                      alert("Vui lòng nhập Email Nhận Thông Báo Mới trước khi kiểm tra!");
                      return;
                    }
                    try {
                      const response = await fetch("/api/smtp/test", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ email: tmpAdminEmail })
                      });
                      const data = await response.json();
                      if (data.success) {
                        alert(`📬 [KẾT NỐI SMTP THÀNH CÔNG]\n\nHệ thống đã kết nối trực tiếp đến máy chủ SMTP Hostinger của bạn và gửi một email mẫu thành công tới "${tmpAdminEmail}"!\n\nVui lòng kiểm tra hòm thư đến (Inbox) hoặc hòm thư rác (Spam) để kiểm chứng.`);
                      } else {
                        alert(`❌ [SMTP THẤT BẠI]\n\nKhông thể gửi thư điện tử.\nChi tiết lỗi từ máy chủ: ${data.error || "Không xác định"}\n\nHướng dẫn: Hãy chắc chắn bạn đã khai báo đầy đủ SMTP_USER và SMTP_PASS trong cài đặt cấu hình biến môi trường của Hostinger.`);
                      }
                    } catch (err: any) {
                      alert(`❌ [LỖI KẾT NỐI API]\n\nKhông thể kết nối đến máy chủ: ${err.message}`);
                    }
                  }}
                  className="px-3 py-1.5 bg-zinc-105 text-zinc-700 rounded-xl text-[10px] font-bold border border-zinc-200 hover:bg-zinc-200 hover:text-zinc-950 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Gửi thử một email thực tế qua máy chủ SMTP cấu hình để kiểm định"
                >
                  <Mail className="w-3.5 h-3.5 text-red-500" /> Gửi Thử Email
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form inputs column */}
              <div className="lg:col-span-2 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bank Name */}
                  <div className="space-y-1.5">
                    <label className="block text-zinc-600 font-bold uppercase tracking-wider text-[10px]">Tên Ngân Hàng Thụ Hưởng:</label>
                    <input
                      type="text"
                      value={tmpBankName}
                      onChange={(e) => setTmpBankName(e.target.value)}
                      placeholder="e.g. MB BANK (Ngân hàng Quân Đội)"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#f43f5e] focus:bg-white transition-all font-sans font-medium"
                    />
                  </div>

                  {/* Bank Short Code */}
                  <div className="space-y-1.5">
                    <label className="block text-zinc-600 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      Mã Viết Tắt (VietQR API):
                      <span className="text-[9px] text-zinc-500 normal-case">(MB, VCB, TCB, ACB, BIDV, etc.)</span>
                    </label>
                    <input
                      type="text"
                      value={tmpBankCode}
                      onChange={(e) => setTmpBankCode(e.target.value.toUpperCase())}
                      placeholder="e.g. MB"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#f43f5e] focus:bg-white transition-all font-mono font-bold"
                    />
                  </div>

                  {/* Account Number */}
                  <div className="space-y-1.5">
                    <label className="block text-zinc-600 font-bold uppercase tracking-wider text-[10px]">Số Tài Khoản Nhận:</label>
                    <input
                      type="text"
                      value={tmpAccNum}
                      onChange={(e) => setTmpAccNum(e.target.value)}
                      placeholder="e.g. 19035658825"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#f43f5e] focus:bg-white transition-all font-mono font-black"
                    />
                  </div>

                  {/* Account Name */}
                  <div className="space-y-1.5">
                    <label className="block text-zinc-600 font-bold uppercase tracking-wider text-[10px]">Tên Người Thụ Hưởng (Không dấu):</label>
                    <input
                      type="text"
                      value={tmpAccHolder}
                      onChange={(e) => setTmpAccHolder(e.target.value.toUpperCase())}
                      placeholder="e.g. NGUYEN VAN A"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#f43f5e] focus:bg-white transition-all font-sans font-bold uppercase"
                    />
                  </div>

                  {/* Momo phone */}
                  <div className="space-y-1.5">
                    <label className="block text-zinc-600 font-bold uppercase tracking-wider text-[10px]">SĐT Đăng Ký Ví Momo:</label>
                    <input
                      type="text"
                      value={tmpMomoPhone}
                      onChange={(e) => setTmpMomoPhone(e.target.value)}
                      placeholder="e.g. 0919288258"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#f43f5e] focus:bg-white transition-all font-mono"
                    />
                  </div>

                  {/* Admin Email notifications address */}
                  <div className="space-y-1.5">
                    <label className="block text-zinc-700 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-red-500" /> Email Nhận Thông Báo Mới:
                    </label>
                    <input
                      type="email"
                      value={tmpAdminEmail}
                      onChange={(e) => setTmpAdminEmail(e.target.value)}
                      placeholder="e.g. autovibe8825@gmail.com"
                      className="w-full bg-zinc-50 border border-red-200 rounded-xl px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#f43f5e] focus:bg-white transition-all font-sans text-red-750 font-bold"
                    />
                  </div>

                  {/* Select Showcase Product */}
                  <div className="space-y-1.5 sm:col-span-2 border-t border-zinc-100 pt-4 mt-2">
                    <label className="block text-zinc-700 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Chọn Xe Cho Mục "Siêu Phẩm Trưng Bày Cao Cấp" (Trang Chủ):
                    </label>
                    <div className="relative">
                      <select
                        value={tmpShowcaseProductId}
                        onChange={(e) => setTmpShowcaseProductId(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 focus:outline-none focus:border-[#f43f5e] focus:bg-white transition-all font-sans font-medium cursor-pointer appearance-none pr-8"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            [{p.scale}] {p.brand} {p.name} - {p.price.toLocaleString('vi-VN')}đ ({p.stock > 0 ? `Sẵn kho: ${p.stock}` : 'Hết hàng'})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-500">
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-550 mt-0.5">
                      Sản phẩm được chọn sẽ tự động hiển thị ở góc VIP trưng bày của trang chủ với đầy đủ hiệu ứng lấp lánh và nút "MỞ XEM CHI TIẾT & CHỐT MUA" liên kết trực tiếp!
                    </p>
                  </div>

                  {/* Admin Credentials Setup */}
                  <div className="space-y-1.5 sm:col-span-2 border-t border-zinc-100 pt-4 mt-2">
                    <h4 className="text-[10px] font-extrabold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                      <Lock className="w-3.5 h-3.5 text-zinc-650" /> THÔNG TIN ĐĂNG NHẬP HỆ THỐNG QUẢN TRỊ:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="block text-zinc-550 font-bold uppercase tracking-wider text-[9px]">Tên đăng nhập Admin:</label>
                        <input
                          type="text"
                          value={tmpAdminUsername}
                          onChange={(e) => setTmpAdminUsername(e.target.value)}
                          placeholder="e.g. admin"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#f43f5e] focus:bg-white transition-all font-sans font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-zinc-550 font-bold uppercase tracking-wider text-[9px]">Mật khẩu Admin mới:</label>
                        <div className="relative">
                          <input
                            type={showAdminPasswordInSettings ? "text" : "password"}
                            value={tmpAdminPassword}
                            onChange={(e) => setTmpAdminPassword(e.target.value)}
                            placeholder="e.g. 221293"
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-3 pr-10 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#f43f5e] focus:bg-white transition-all font-mono font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminPasswordInSettings(!showAdminPasswordInSettings)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 cursor-pointer"
                          >
                            {showAdminPasswordInSettings ? <EyeOff className="w-4 h-4 shrink-0" /> : <Eye className="w-4 h-4 shrink-0" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-[9.5px] text-zinc-500 mt-1">
                      ⚠️ Lưu ý: Khi đổi tài khoản & mật khẩu, thông tin này sẽ được đồng bộ trực tiếp lên cơ chế bảo mật của trình duyệt. Bạn có thể sử dụng công cụ "Quên mật khẩu?" tại ô đăng nhập bất kỳ lúc nào nếu lỡ quên thông tin cấu hình.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!tmpBankName || !tmpBankCode || !tmpAccNum || !tmpAccHolder || !tmpMomoPhone) {
                        alert('Xin vui lòng điền đầy đủ các thông tin thanh toán ngân hàng!');
                        return;
                      }
                      onUpdateBankSettings({
                        bankName: tmpBankName,
                        bankCodeShort: tmpBankCode,
                        accountNumber: tmpAccNum,
                        accountHolder: tmpAccHolder,
                        momoPhone: tmpMomoPhone,
                        adminEmail: tmpAdminEmail,
                        showcaseProductId: tmpShowcaseProductId,
                        adminUsername: tmpAdminUsername,
                        adminPassword: tmpAdminPassword
                      });
                      setBankSaveSuccess(true);
                      setTimeout(() => setBankSaveSuccess(false), 4000);
                    }}
                    className="px-5 py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase rounded-xl tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-red-605/10"
                  >
                    <Save className="w-4 h-4" /> Lưu Cấu Hình Hệ Thống & Thanh Toán
                  </button>
                </div>

                {bankSaveSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-[11px] text-emerald-800 font-extrabold flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã cập nhật thành công toàn bộ cấu hình hệ thống, bao gồm cả tài khoản đăng nhập admin mới và phương thức VietQR!
                  </div>
                )}
              </div>

              {/* Right Previews Column */}
              <div className="space-y-4">
                {/* QR Preview Column */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3 relative shadow-xs">
                  <span className="absolute top-2 left-2 bg-red-50 text-red-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-red-200 uppercase tracking-widest leading-none">
                    Preview trực quan
                  </span>
                  
                  <p className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Sau Khi Lưu, QR Đơn Hàng Sẽ Cấu Hình Như Sau:</p>
                  
                  <div className="p-2.5 bg-white rounded-xl shadow-xl border-2 border-red-500 max-w-[125px]">
                    <img
                      src={`https://img.vietqr.io/image/${tmpBankCode}-${tmpAccNum}-print.png?amount=1200000&addInfo=ODSTEST&accountName=${encodeURIComponent(tmpAccHolder)}`}
                      alt="Bản xem trước VietQR"
                      className="w-24 h-24 object-contain"
                      onError={(e) => {
                        // fallback representation if api delays
                        e.currentTarget.src = "https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=miniauto";
                      }}
                    />
                    <span className="block text-[7px] font-black text-zinc-900 mt-1 font-mono tracking-tighter">
                      {tmpBankCode.toUpperCase()} BANK QR
                    </span>
                  </div>

                  <div className="text-[10px] space-y-1 font-sans">
                    <p className="text-zinc-700 font-extrabold">Số TK: <span className="text-red-600 font-mono text-[11px] font-black">{tmpAccNum}</span></p>
                    <p className="text-zinc-800 text-[9px] uppercase font-bold">{tmpAccHolder}</p>
                    <p className="text-zinc-500 text-[8px] italic leading-tight mt-1">
                      *QR mẫu khởi tạo giả định cho số tiền: 1.200.000 đ
                    </p>
                  </div>
                </div>

                {/* Showcase Product Preview */}
                {(() => {
                  const previewProduct = products.find(p => p.id === tmpShowcaseProductId);
                  if (!previewProduct) return null;
                  return (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col space-y-3 relative shadow-xs text-left">
                      <span className="absolute top-2 right-2 bg-amber-50 text-amber-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-widest leading-none">
                        Showcase VIP
                      </span>
                      <p className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Xem Trước Góc Trưng Bày:</p>
                      
                      <div className="flex gap-3 items-center">
                        <img 
                          src={previewProduct.imageUrl} 
                          className="w-16 h-16 object-cover rounded-xl border border-zinc-200 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-xs space-y-0.5">
                          <p className="font-extrabold text-zinc-950 line-clamp-1">{previewProduct.name}</p>
                          <p className="text-[9px] text-zinc-500 font-medium">Thương hiệu: {previewProduct.brand}</p>
                          <p className="text-red-600 font-mono font-bold text-[11px]">{previewProduct.price.toLocaleString('vi-VN')} đ</p>
                          <p className="text-[9px] text-zinc-400">Tỷ lệ {previewProduct.scale}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box Export Backup */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-500" />
                  Trích Xuất & Tải Bản Sao Lưu (Export)
                </h4>
                <p className="text-xs text-zinc-500 leading-normal">
                  Xuất toàn bộ cơ sở dữ liệu hiện tại thành định dạng tệp tin chuẩn <code className="bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-mono border border-emerald-100">.json</code>. Bạn có thể lưu trữ tệp tin này ở bất kỳ đâu để lưu dấu vết kho hàng.
                </p>
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-[10px] space-y-1 text-zinc-600 font-mono">
                  <div className="flex justify-between"><span>Sản phẩm lưu trữ:</span> <span className="text-zinc-800 font-bold">{products.length} dòng xe</span></div>
                  <div className="flex justify-between"><span>Vận đơn giao dịch:</span> <span className="text-zinc-800 font-bold">{orders.length} tài liệu</span></div>
                  <div className="flex justify-between"><span>Sổ khách hàng CRM:</span> <span className="text-zinc-800 font-bold">{customers.length} thành viên</span></div>
                  <div className="flex justify-between"><span>Chiết khấu Voucher:</span> <span className="text-zinc-800 font-bold">{adminVouchers.length} chiến dịch</span></div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      // Construct the state payload
                      const backupData = {
                        appId: 'miniauto.store',
                        createdAt: new Date().toISOString(),
                        localTime: new Date().toLocaleString('vi-VN'),
                        products: products,
                        orders: orders,
                        customers: customers,
                        adminVouchers: adminVouchers,
                        marqueeNotice: marqueeNotice,
                        bankSettings: bankSettings
                      };
                      
                      const stringified = JSON.stringify(backupData, null, 2);
                      const blob = new Blob([stringified], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      
                      const a = document.createElement('a');
                      const cleanDate = new Date().toISOString().split('T')[0];
                      a.download = `miniauto_backup_${cleanDate}.json`;
                      a.href = url;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      
                      setBackupStatus('✅ Trích xuất dữ liệu thành công! Bản sao lưu đã được tải xuống máy tính.');
                      setTimeout(() => setBackupStatus(''), 5000);
                    } catch (e: any) {
                      alert('Lỗi xuất bản sao lưu: ' + e.message);
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs uppercase rounded-xl tracking-wider transition-all active:scale-97 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
                >
                  <Download className="w-4 h-4" /> Tải Xuống Tệp Sao Lưu (.json)
                </button>
              </div>
            </div>

            {/* Box Import Backup */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-4 h-4 text-sky-500" />
                  Phục Hồi Dữ Liệu Gốc (Import)
                </h4>
                <p className="text-xs text-zinc-500 leading-normal">
                  Chuyển giao tệp bản sao lưu bạn đã lưu trữ trước kia vào trình duyệt hiện tại. <b className="text-red-650">Lưu ý: Thao tác này sẽ ghi đè và thay thế hoàn toàn dữ liệu hiện tại.</b>
                </p>

                {/* File picker */}
                <div className="space-y-2">
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Chọn tệp tin sao lưu (.json):</label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const parsed = JSON.parse(event.target?.result as string);
                          if (!parsed || (!parsed.products && !parsed.orders)) {
                            alert('Định dạng tệp sao lưu không tương thích hoặc dữ liệu trống rỗng!');
                            return;
                          }
                          
                          if (confirm('Các danh mục sản phẩm, đơn hàng và thành viên hiện tại sẽ bị thay thế bằng tệp sao lưu này. Bạn có muốn tiếp tục?')) {
                            if (parsed.products && onUpdateProducts) {
                              onUpdateProducts(parsed.products);
                            }
                            if (parsed.orders && onUpdateOrders) {
                              onUpdateOrders(parsed.orders);
                            }
                            if (parsed.customers && onUpdateCustomers) {
                              onUpdateCustomers(parsed.customers);
                            }
                            if (parsed.adminVouchers) {
                              onUpdateAdminVouchers(parsed.adminVouchers);
                            }
                            if (parsed.marqueeNotice) {
                              onUpdateMarqueeNotice(parsed.marqueeNotice);
                            }
                            if (parsed.bankSettings && onUpdateBankSettings) {
                              onUpdateBankSettings(parsed.bankSettings);
                              if (parsed.bankSettings.bankName) setTmpBankName(parsed.bankSettings.bankName);
                              if (parsed.bankSettings.bankCodeShort) setTmpBankCode(parsed.bankSettings.bankCodeShort);
                              if (parsed.bankSettings.accountNumber) setTmpAccNum(parsed.bankSettings.accountNumber);
                              if (parsed.bankSettings.accountHolder) setTmpAccHolder(parsed.bankSettings.accountHolder);
                              if (parsed.bankSettings.momoPhone) setTmpMomoPhone(parsed.bankSettings.momoPhone);
                              if (parsed.bankSettings.adminEmail) setTmpAdminEmail(parsed.bankSettings.adminEmail);
                              if (parsed.bankSettings.showcaseProductId) setTmpShowcaseProductId(parsed.bankSettings.showcaseProductId);
                              if (parsed.bankSettings.adminUsername) setTmpAdminUsername(parsed.bankSettings.adminUsername);
                              if (parsed.bankSettings.adminPassword) setTmpAdminPassword(parsed.bankSettings.adminPassword);
                            }
                            
                            setBackupStatus('🎉 Khôi phục dữ liệu từ tệp tin thành công!');
                            setTimeout(() => setBackupStatus(''), 5000);
                          }
                        } catch (err: any) {
                          alert('Lỗi đọc file: ' + err.message);
                        }
                      };
                      reader.readAsText(file);
                    }}
                    className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Hoặc dán chuỗi JSON sao lưu:</label>
                <textarea
                  rows={2}
                  value={pasteJSON}
                  onChange={(e) => setPasteJSON(e.target.value)}
                  placeholder="Dán toàn bộ chuỗi JSON sao lưu vào đây..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-[10px] font-mono text-zinc-800 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  disabled={!pasteJSON.trim()}
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(pasteJSON.trim());
                      if (!parsed || (!parsed.products && !parsed.orders)) {
                        alert('Dữ liệu JSON dán vào không hợp lệ hoặc thiếu trường dữ liệu cốt lõi!');
                        return;
                      }
                      
                      if (confirm('Các danh mục sản phẩm, đơn hàng và thành viên hiện tại sẽ bị thay thế bằng dữ liệu dán này. Bạn có muốn tiếp tục?')) {
                        if (parsed.products && onUpdateProducts) {
                          onUpdateProducts(parsed.products);
                        }
                        if (parsed.orders && onUpdateOrders) {
                          onUpdateOrders(parsed.orders);
                        }
                        if (parsed.customers && onUpdateCustomers) {
                          onUpdateCustomers(parsed.customers);
                        }
                        if (parsed.adminVouchers) {
                          onUpdateAdminVouchers(parsed.adminVouchers);
                        }
                        if (parsed.marqueeNotice) {
                          onUpdateMarqueeNotice(parsed.marqueeNotice);
                        }
                        if (parsed.bankSettings && onUpdateBankSettings) {
                          onUpdateBankSettings(parsed.bankSettings);
                          if (parsed.bankSettings.bankName) setTmpBankName(parsed.bankSettings.bankName);
                          if (parsed.bankSettings.bankCodeShort) setTmpBankCode(parsed.bankSettings.bankCodeShort);
                          if (parsed.bankSettings.accountNumber) setTmpAccNum(parsed.bankSettings.accountNumber);
                          if (parsed.bankSettings.accountHolder) setTmpAccHolder(parsed.bankSettings.accountHolder);
                          if (parsed.bankSettings.momoPhone) setTmpMomoPhone(parsed.bankSettings.momoPhone);
                          if (parsed.bankSettings.adminEmail) setTmpAdminEmail(parsed.bankSettings.adminEmail);
                          if (parsed.bankSettings.showcaseProductId) setTmpShowcaseProductId(parsed.bankSettings.showcaseProductId);
                          if (parsed.bankSettings.adminUsername) setTmpAdminUsername(parsed.bankSettings.adminUsername);
                          if (parsed.bankSettings.adminPassword) setTmpAdminPassword(parsed.bankSettings.adminPassword);
                        }
                        
                        setPasteJSON('');
                        setBackupStatus('🎉 Khôi phục dữ liệu và cấu hình từ mã dán thành công!');
                        setTimeout(() => setBackupStatus(''), 5000);
                      }
                    } catch (err: any) {
                      alert('Dán chuỗi không phù hợp cấu trúc JSON hợp chuẩn! Lỗi: ' + err.message);
                    }
                  }}
                  className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    pasteJSON.trim()
                      ? 'bg-sky-550 text-white cursor-pointer hover:bg-sky-500 hover:shadow shadow-sky-500/10'
                      : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  Áp Dụng Mã Dán Để Khôi Phục
                </button>
              </div>
            </div>
          </div>

          {backupStatus && (
            <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-2xl text-xs text-emerald-800 font-bold leading-normal flex items-center gap-2 animate-pulse font-sans">
              <span className="text-lg">⚡</span>
              <span>{backupStatus}</span>
            </div>
          )}

          {/* SMTP AUTOMATED MAILBOX DELIVERY OUTBOX MONITOR */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 space-y-4 relative shadow-xs" id="admin-smtp-mailbox">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#f43f5e]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="border-b border-zinc-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-extrabold text-[#f43f5e] uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-5 h-5 text-red-500" />
                  Nhật Ký Email Báo Đơn Tự Động (SMTP Outbox Hub)
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Theo dõi lịch sử bưu điện điện tử tự động bắn tới hòm thư <b>{bankSettings.adminEmail}</b> khi có khách đặt xe mới.
                </p>
              </div>
              
              {sentEmails.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Bạn có chắc muốn xóa sạch lịch sử ghi nhận email đã gửi đi này?')) {
                      if (onUpdateSentEmails) onUpdateSentEmails([]);
                    }
                  }}
                  className="px-2.5 py-1 text-[10px] text-zinc-555 hover:text-red-655 hover:border-red-500/30 transition-all font-bold border border-zinc-200 rounded-lg uppercase"
                >
                  Xóa Nhật Ký Thư
                </button>
              )}
            </div>

            {sentEmails.length === 0 ? (
              <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl p-6 text-center space-y-2">
                <span className="text-2xl block">📬</span>
                <p className="text-xs text-zinc-500 font-medium">Chưa có giao dịch mail tự động nào được bắn đi.</p>
                <p className="text-[10px] text-zinc-400 leading-normal">
                  Khi khách hàng tiến hành chốt và đặt đơn hàng bất kỳ tại Portal thanh toán, hệ thống sẽ tự động tổng hợp thông tin, áp coupon chiết khấu và gửi một bản báo cáo HTML giao diện tối ưu độc quyền đến email thụ hưởng của sếp!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {sentEmails.map((mail: any) => (
                  <div key={mail.id} className="bg-zinc-50 border border-zinc-250 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-red-500/30 transition-all">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-emerald-50 text-emerald-705 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-250 uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-555 bg-emerald-500 rounded-full animate-ping"></span>
                          ĐÃ GỬI (DELIVERED)
                        </span>
                        <span className="text-zinc-450 font-mono text-[10px]">{mail.id}</span>
                        <span className="text-zinc-650 font-bold font-sans">Khách hàng: {mail.customerName}</span>
                      </div>
                      <p className="font-extrabold text-zinc-900 text-[11px] line-clamp-1">{mail.subject}</p>
                      <p className="text-[10px] text-zinc-555 font-medium">Gửi lúc: {mail.sentAt} • Tới hòm thư: <code className="text-red-650 font-mono bg-red-50 px-1 py-0.5 rounded border border-red-100">{mail.recipient}</code> • Doanh thu: <span className="text-amber-600 font-black font-mono">{mail.orderAmount.toLocaleString('vi-VN')}đ</span> ({mail.totalItems} xe)</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setInspectingEmail(mail)}
                      className="px-3 py-2 bg-zinc-100 hover:bg-[#f43f5e] hover:text-white text-zinc-750 font-bold text-[10px] rounded-xl uppercase transition-all shadow-sm shrink-0 cursor-pointer flex items-center gap-1 border border-zinc-200"
                    >
                      <Eye className="w-3.5 h-3.5" /> Xem Thư HTML
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INSPECT EMAIL RENDER VIEW MODAL */}
          {inspectingEmail && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-55 animate-fade-in" id="smtp-mail-inspector-modal">
              <div className="bg-white border border-zinc-250 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
                
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-red-50 rounded-xl">
                      <Mail className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
                    </span>
                    <div className="text-left">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-red-655 font-mono">SMTP Server Core logs</span>
                      <h3 className="text-xs sm:text-sm font-extrabold text-zinc-900 font-sans">Xem Trước Content Email Báo Đơn Tự Động</h3>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setInspectingEmail(null)}
                    className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer border border-transparent"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Info summary */}
                <div className="p-3 bg-zinc-50 border-b border-zinc-200 text-[10px] sm:text-xs text-zinc-655 flex flex-col sm:flex-row sm:justify-between gap-1 text-left px-5 font-sans font-semibold">
                  <div><strong>Gửi tới:</strong> <code className="text-red-650 font-mono bg-red-50 px-1 py-0.5 rounded border border-red-100">{inspectingEmail.recipient}</code></div>
                  <div><strong>Id:</strong> <span className="text-zinc-850 font-mono">{inspectingEmail.id}</span></div>
                  <div><strong>Mã bưu gửi:</strong> <span className="text-sky-655 font-bold font-mono">{inspectingEmail.sentAt}</span></div>
                </div>

                {/* Mail body frame viewport */}
                <div className="p-4 overflow-y-auto bg-zinc-50/50 flex justify-center flex-1 font-sans">
                  <div className="w-full text-zinc-800" dangerouslySetInnerHTML={{ __html: inspectingEmail.bodyHtml }} />
                </div>

                {/* Footer of modal */}
                <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setInspectingEmail(null)}
                    className="px-5 py-2.5 bg-zinc-200 hover:bg-zinc-350 text-zinc-850 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer border border-zinc-300"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Master Reset & Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="border-b border-red-100 pb-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-red-650 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                  Khu Vực Phục Hồi Dữ Liệu Mẫu (Danger Zone)
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">Đặt lại trạng thái sơ khai cho cửa hàng như ban đầu.</p>
              </div>
            </div>
            
            <p className="text-xs text-zinc-705 leading-normal">
              Nếu bạn lỡ dọn dẹp hoặc nhập sai tệp bị lỗi, bạn có thể thực hiện <strong>Đặt Lại Hệ Thống Ban Đầu</strong>. Hệ thống sẽ dọn dẹp toàn bộ dữ liệu bị lỗi, nạp lại 25+ chiếc siêu xe mô hình tĩnh đẳng cấp Lamborghini, Porsche, Bugatti, Ferrari... đi kèm các vận đơn mẫu và tệp tin mã giảm giá mặc định tuyệt đẹp.
            </p>

            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={() => {
                  if (confirm('BẠN CÓ CHẮC MUỐN ĐẶT LẠI TOÀN BỘ CỬA HÀNG VỀ MÔ HÌNH MẪU? Toàn bộ sản phẩm và đơn hàng tùy biến của bạn sẽ bị dọn sạch!')) {
                    localStorage.removeItem('miniauto_products');
                    localStorage.removeItem('miniauto_orders');
                    localStorage.removeItem('miniauto_customers');
                    localStorage.removeItem('miniauto_admin_vouchers');
                    localStorage.removeItem('miniauto_marquee_notice');
                    localStorage.removeItem('miniauto_admin_notifications');
                    
                    alert('Hệ thống đang tiến hành nạp lại mẫu gốc. Ứng dụng sẽ tự động tải lại ngay bây giờ!');
                    window.location.reload();
                  }
                }}
                className="px-5 py-3 bg-red-650 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow shadow-red-500/10 uppercase tracking-wider"
              >
                <RefreshCw className="w-4 h-4" /> Đặt Lại Hệ Thống Mặc Định (Factory Reset)
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in" id="edit-product-modal">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative text-left flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-white/5 p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Edit3 className="w-5 h-5 text-red-400" /> Chỉnh Sửa Chi Tiết Xe Mô Hình
              </h3>
              <button 
                onClick={() => setEditingProduct(null)}
                className="text-zinc-400 hover:text-white font-black text-lg cursor-pointer border border-transparent px-2"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveFullEdit} className="overflow-y-auto p-6 space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Tên Mô Hình Xe</label>
                  <input
                    type="text"
                    required
                    value={editFormName}
                    onChange={(e) => setEditFormName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Thương Hiệu</label>
                  <input
                    type="text"
                    required
                    value={editFormBrand}
                    onChange={(e) => setEditFormBrand(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Phân Khúc/Category</label>
                  <select
                    value={editFormCategory}
                    onChange={(e) => setEditFormCategory(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  >
                    <option value="supercar">Siêu Xe Thể Thao (Supercars)</option>
                    <option value="luxury">Xe Sang/Cổ Điển (Luxury & Classic)</option>
                    <option value="suv">Xe Đa Dụng/SUV (Offroad)</option>
                    <option value="racing">Xe Đua F1/Chuyên Nghiệp (Racing)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Tỷ Lệ Thiết Kế</label>
                  <select
                    value={editFormScale}
                    onChange={(e) => setEditFormScale(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  >
                    <option value="1:18">Tỷ Lệ 1:18</option>
                    <option value="1:24">Tỷ Lệ 1:24</option>
                    <option value="1:32">Tỷ Lệ 1:32</option>
                    <option value="1:64">Tỷ Lệ 1:64</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Giá Bán Niêm Yết (VND)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={editFormPrice}
                    onChange={(e) => setEditFormPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-all font-mono text-red-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Giảm Giá (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={95}
                    value={editFormDiscount}
                    onChange={(e) => setEditFormDiscount(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-all font-mono text-amber-450"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Số Lượng Tồn Kho</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editFormStock}
                    onChange={(e) => setEditFormStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Đường Dẫn Hình Ảnh Bìa (URL)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={editFormImageUrl}
                      onChange={(e) => setEditFormImageUrl(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                    />
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditAvatarUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <button type="button" className="px-3 py-2 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-white/10 transition-all whitespace-nowrap">
                        <ImagePlus className="w-4 h-4 text-red-400" /> Tải Ảnh
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Mô tả đặc điểm cơ học cấu thành (Hiển thị Chi Tiết & Dài Hơn):</label>
                <textarea
                  required
                  rows={8}
                  style={{ minHeight: '120px' }}
                  value={editFormDescription}
                  onChange={(e) => setEditFormDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-red-500 transition-all placeholder-zinc-600"
                />
              </div>

              {/* FEATURES INTERACTION SECTION */}
              <div className="border border-white/10 rounded-2xl p-4 bg-white/5 space-y-3 text-left">
                <h5 className="text-[10px] text-red-400 font-extrabold uppercase tracking-wider">Cấu hình các khớp động & cơ cấu cơ học:</h5>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editFormFeatureInput}
                    onChange={(e) => setEditFormFeatureInput(e.target.value)}
                    placeholder="e.g. Mở được 4 cửa và capo, vô lăng xoay được..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-all placeholder-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={handleEditAddFeature}
                    className="px-4 py-2 bg-red-550 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                  >
                    Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {editFormFeatures.map((feat, idx) => (
                    <span key={idx} className="bg-black/50 border border-white/10 px-2.5 py-1 text-[10px] text-zinc-300 rounded-lg flex items-center gap-1.5">
                      <span>• {feat}</span>
                      <button
                        type="button"
                        onClick={() => handleEditRemoveFeature(idx)}
                        className="text-red-400 hover:text-red-300 font-black"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {editFormFeatures.length === 0 && (
                    <p className="text-[10px] text-zinc-500 italic">Chưa có đặc điểm/cơ chế hoạt động nào được cấu hình.</p>
                  )}
                </div>
              </div>

              {/* DETAILED GALLERY AND VIDEO CLIP UPLOAD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-white/10 rounded-2xl p-4 bg-white/5 space-y-2 text-left">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-red-400" /> Album ảnh bổ sung (Tối đa 9 góc chụp khác nhau)
                  </label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleEditGalleryUpload}
                      className="hidden"
                      id="edit-modal-gallery-picker"
                    />
                    <label
                      htmlFor="edit-modal-gallery-picker"
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl cursor-pointer border border-white/10 inline-block"
                    >
                      Chọn Album Ảnh
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditFormGalleryImages([])}
                      className="text-[10px] text-red-400 hover:underline"
                    >
                      Xóa album
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {editFormGalleryImages.map((img, idx) => (
                      <img key={idx} src={img} className="w-8 h-8 rounded-lg object-cover border border-white/10" alt="Góc chụp" />
                    ))}
                  </div>
                </div>

                <div className="border border-white/10 rounded-2xl p-4 bg-white/5 space-y-2 text-left">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-red-400" /> Video Clip mô phỏng (URL / File)
                  </label>
                  <input
                    type="text"
                    value={editFormVideoUrl}
                    onChange={(e) => setEditFormVideoUrl(e.target.value)}
                    placeholder="URL video review mô hình"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 placeholder-zinc-600"
                  />
                  <div className="relative mt-1">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleEditVideoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <button type="button" className="px-3 py-1.5 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-white/10 transition-all">
                      <Film className="w-3.5 h-3.5 text-red-400" /> Tải Video từ Máy
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-white/10 pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs rounded-xl transition-all cursor-pointer border border-white/10"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-500 hover:bg-red-450 text-white font-extrabold text-xs rounded-xl transition-all shadow active:scale-95 cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeWaybillOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" id="waybill-print-modal">
          <div className="bg-white border border-zinc-250 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-left">
            {/* Header */}
            <div className="bg-zinc-50 p-4 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-red-655 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <Printer className="w-4 h-4" /> Phiếu Giao Hàng & Mã Vận Đơn
              </h3>
              <button 
                onClick={() => setActiveWaybillOrder(null)}
                className="text-zinc-500 hover:text-zinc-900 font-bold text-sm cursor-pointer border border-transparent px-2"
              >
                Đóng
              </button>
            </div>

            {/* Inner printable container */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Thermal Sticker Design */}
              <div id="printable-waybill" className="bg-white text-black p-5 rounded-lg border-2 border-dashed border-zinc-400 font-sans space-y-4 shadow-md">
                
                {/* Carrier Banner & Barcode */}
                <div className="flex justify-between items-center border-b-2 border-black pb-3">
                  <div>
                    <h5 className="text-[14px] font-black tracking-tighter text-black uppercase leading-none">
                      {activeWaybillOrder.carrier === 'ghn' && 'GHN EXPRESS'}
                      {activeWaybillOrder.carrier === 'jnt' && 'J&T EXPRESS'}
                      {activeWaybillOrder.carrier === 'ghtk' && 'GHTK ECONOMY'}
                      {activeWaybillOrder.carrier === 'viettel' && 'VIETTEL POST'}
                      {activeWaybillOrder.carrier === 'vnpost' && 'VNPOST BULK'}
                      {activeWaybillOrder.carrier === 'shopee' && 'SHOPEE EXPRESS'}
                      {!activeWaybillOrder.carrier && 'SPEEDY SHIPPERS'}
                    </h5>
                    <p className="text-[9px] text-zinc-650 font-medium font-mono mt-1">Bàn giao xe ô tô mô hình tĩnh cao cấp</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold border-2 border-black px-1.5 py-0.5 rounded font-mono">Hỏa Tốc</span>
                  </div>
                </div>

                {/* Simulated Barcode block */}
                <div className="text-center py-2.5 bg-zinc-50 rounded border border-zinc-200">
                  {/* Generated Bars */}
                  <div className="flex justify-center items-stretch h-10 w-full max-w-[280px] mx-auto opacity-90 px-2">
                    {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6].map((width, idx) => (
                      <div 
                        key={idx} 
                        className={`bg-black`} 
                        style={{ 
                          width: `${width * 1.5}px`, 
                          marginLeft: idx % 3 === 0 ? '3px' : '1px',
                          opacity: idx % 4 === 0 ? 0.6 : 1
                        }} 
                      />
                    ))}
                  </div>
                  <p className="text-xs font-mono font-black mt-2 tracking-widest text-black uppercase">
                    {activeWaybillOrder.trackingCode}
                  </p>
                </div>

                {/* Address block */}
                <div className="grid grid-cols-2 text-[10px] border-t-2 border-b-2 border-black divide-x-2 divide-black">
                  {/* Sender details */}
                  <div className="p-2 space-y-1">
                    <p className="font-extrabold uppercase text-[9px] text-zinc-555">Người gửi:</p>
                    <p className="font-bold text-black text-[10px]">XEMOHINH.CLUB</p>
                    <p className="text-zinc-700 leading-tight">72 Nguyễn Trãi, Thanh Xuân, Hà Nội</p>
                    <p className="font-bold">SĐT: 0988.888.888</p>
                  </div>
                  
                  {/* Receiver details */}
                  <div className="p-2 space-y-1 text-left pl-3">
                    <p className="font-extrabold uppercase text-[9px] text-zinc-555">Người nhận:</p>
                    <p className="font-black text-black text-[11px] uppercase">{activeWaybillOrder.userName}</p>
                    <p className="text-zinc-855 leading-tight font-medium">{activeWaybillOrder.userAddress}</p>
                    <p className="font-black text-black">SĐT: {activeWaybillOrder.userPhone}</p>
                  </div>
                </div>

                {/* Content description list */}
                <div className="text-[10px] space-y-1">
                  <p className="font-bold border-b border-zinc-200 pb-1">NỘI DUNG SẢN PHẨM KHAI BÁO SAU ĐÓNG GÓI:</p>
                  {activeWaybillOrder.items.map((item, idx) => (
                    <div key={item.productId} className="flex justify-between items-center text-zinc-855 font-medium py-0.5">
                      <span className="truncate w-4/5">{idx + 1}. Mô hình {item.productName} ({item.scale || '1:18'})</span>
                      <span className="font-bold text-black">SL: {item.quantity}</span>
                    </div>
                  ))}
                  {/* Total Weight mock */}
                  <div className="flex justify-between text-[9px] border-t border-zinc-200 pt-1 text-zinc-555 mt-2">
                    <span>Tổng trọng lượng ước tính: 0.95 kg</span>
                    <span>Hộp xốp bảo vệ chống sốc dúc kín</span>
                  </div>
                </div>

                {/* Cod collection info */}
                <div className="border-t-2 border-black pt-3 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-bold text-zinc-555 uppercase">TIỀN THU HỘ (COD):</p>
                    <h4 className="text-[16px] font-black text-black font-mono">
                      {activeWaybillOrder.paymentMethod === 'cod' 
                        ? `${activeWaybillOrder.totalAmount.toLocaleString('vi-VN')} đ` 
                        : '0đ (Đã thanh toán Online)'}
                    </h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-zinc-555 uppercase text-right">CHỮ KÝ KHÁCH HÀNG / BƯU TÁ:</p>
                    <div className="w-24 h-6 border border-zinc-200 mt-1 opacity-40 text-center text-[7px] flex items-center justify-center italic text-black">Ký nhận nguyên vẹn</div>
                  </div>
                </div>

              </div>

              {/* Tips */}
              <div className="mt-4 p-3 bg-zinc-50 rounded-2xl border border-zinc-200 flex gap-2 text-xs text-zinc-555">
                <FileText className="w-4 h-4 text-emerald-555 shrink-0" />
                <p>Nơi gỡ bưu phẩm: Bưu tá mang theo túi sọt chứa xe mô hình tĩnh mền dập, bảo vệ tối đa hộp mica và vỏ trưng bày acrylic nguyên seal.</p>
              </div>
            </div>

            {/* Print triggers */}
            <div className="bg-zinc-50 p-4 border-t border-zinc-200 flex gap-2.5 justify-end">
              <button
                onClick={() => setActiveWaybillOrder(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-all cursor-pointer border border-zinc-200"
              >
                Thoát
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all shadow flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Gửi lệnh In (Khổ 80x100mm)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
