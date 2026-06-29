export interface Product {
  id: string;
  name: string;
  brand: string; // e.g. Lamborghini, Ferrari, Rolls-Royce, Porsche
  scale: '1:18' | '1:24' | '1:32' | '1:64';
  price: number; // in VND
  imageUrl: string;
  description: string;
  stock: number;
  category: string;
  year: number;
  features: string[]; // e.g. ["Mỏ nguyên khối hợp kim", "Hệ thống treo lò xo", "Đèn pha phát sáng", "Mở được 4 cửa và capo"]
  rating: number;
  reviewsCount: number;
  discountPercentage?: number; // percentage discount (e.g. 15 for 15% off)
  galleryImages?: string[]; // Up to 9 additional screenshots/angles
  videoUrl?: string; // Optional video clip showcase
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending_payment' | 'paid' | 'preparing' | 'shipping' | 'delivered' | 'cancelled';
export type PaymentMethod = 'online' | 'bank' | 'momo' | 'cod';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  scale: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  userEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  deliveryProgress: number; // 0 to 100 for live animation
  deliveryRouteIndex: number; // current waypoint index or step
  carrier?: 'ghn' | 'jnt' | 'shopee' | 'ghtk' | 'viettel' | 'vnpost';
  trackingCode?: string;
  carrierLabelPrinted?: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  role: 'customer' | 'admin';
  loyaltyPoints?: number;
  lifetimePoints?: number;
  redeemedGifts?: string[];
  vouchers?: { id: string; name: string; amount: number; code: string }[];
  viewHistory?: string[];
}

export interface SalesStat {
  date: string;
  sales: number;
  orders: number;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  orderId: string;
  read: boolean;
  amount?: number;
}

export interface BankSettings {
  bankName: string;
  bankCodeShort: string;
  accountNumber: string;
  accountHolder: string;
  momoPhone: string;
  adminEmail: string;
  showcaseProductId?: string;
  adminUsername?: string;
  adminPassword?: string;
}

