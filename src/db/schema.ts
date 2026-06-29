import { pgTable, text, integer, timestamp, boolean, real, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (using Firebase Auth UID as primary key)
export const users = pgTable('users', {
  uid: text('uid').primaryKey(),
  email: text('email').notNull(),
  fullName: text('full_name').notNull().default(''),
  phone: text('phone').notNull().default(''),
  address: text('address').notNull().default(''),
  role: text('role').$type<'customer' | 'admin'>().notNull().default('customer'),
  loyaltyPoints: integer('loyalty_points').notNull().default(0),
  lifetimePoints: integer('lifetime_points').notNull().default(0),
  redeemedGifts: text('redeemed_gifts').notNull().default('[]'), // JSON serialized array
  vouchers: text('vouchers').notNull().default('[]'), // JSON serialized array
  viewHistory: text('view_history').notNull().default('[]'), // JSON serialized array
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Products table
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  scale: text('scale').$type<'1:18' | '1:24' | '1:32' | '1:64'>().notNull(),
  price: integer('price').notNull(),
  imageUrl: text('image_url').notNull(),
  description: text('description').notNull().default(''),
  stock: integer('stock').notNull().default(10),
  category: text('category').notNull().default(''),
  year: integer('year').notNull().default(2023),
  features: text('features').notNull().default('[]'), // JSON serialized array
  rating: real('rating').notNull().default(5.0),
  reviewsCount: integer('reviews_count').notNull().default(0),
  discountPercentage: integer('discount_percentage'),
  galleryImages: text('gallery_images').notNull().default('[]'), // JSON serialized array
  videoUrl: text('video_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Orders table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  userName: text('user_name').notNull(),
  userPhone: text('user_phone').notNull(),
  userAddress: text('user_address').notNull(),
  totalAmount: integer('total_amount').notNull(),
  status: text('status').$type<'pending_payment' | 'paid' | 'preparing' | 'shipping' | 'delivered' | 'cancelled'>().notNull().default('pending_payment'),
  paymentMethod: text('payment_method').$type<'online' | 'bank' | 'momo' | 'cod'>().notNull().default('bank'),
  paymentStatus: text('payment_status').$type<'pending' | 'success' | 'failed'>().notNull().default('pending'),
  deliveryProgress: integer('delivery_progress').notNull().default(0),
  deliveryRouteIndex: integer('delivery_route_index').notNull().default(0),
  carrier: text('carrier').$type<'ghn' | 'jnt' | 'shopee' | 'ghtk' | 'viettel' | 'vnpost'>(),
  trackingCode: text('tracking_code'),
  carrierLabelPrinted: boolean('carrier_label_printed').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Order items table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: text('order_id').references(() => orders.id).notNull(),
  productId: text('product_id').references(() => products.id).notNull(),
  productName: text('product_name').notNull(),
  brand: text('brand').notNull(),
  scale: text('scale').notNull(),
  price: integer('price').notNull(),
  imageUrl: text('image_url').notNull(),
  quantity: integer('quantity').notNull().default(1),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  time: text('time').notNull(),
  orderId: text('order_id').notNull(),
  read: boolean('read').notNull().default(false),
  amount: integer('amount'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bank & Admin Settings table
export const bankSettings = pgTable('bank_settings', {
  id: text('id').primaryKey(),
  bankName: text('bank_name').notNull().default('Ngân hàng Quân Đội'),
  bankCodeShort: text('bank_code_short').notNull().default('MB'),
  accountNumber: text('account_number').notNull().default('999999999999'),
  accountHolder: text('account_holder').notNull().default('NGUYEN VAN A'),
  momoPhone: text('momo_phone').notNull().default('0999999999'),
  adminEmail: text('admin_email').notNull().default('autovibe8825@gmail.com'),
  showcaseProductId: text('showcase_product_id').notNull().default('prod-008'),
  adminUsername: text('admin_username').notNull().default('admin'),
  adminPassword: text('admin_password').notNull().default('221293'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations declarations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.uid],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
