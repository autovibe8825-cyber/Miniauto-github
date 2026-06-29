import { db, schema } from './index.ts';
import { eq, desc } from 'drizzle-orm';
import { INITIAL_PRODUCTS } from '../data/initialProducts.ts';
import { Product, Order, User, SalesStat, AdminNotification, BankSettings } from '../types.ts';

// -------------------------------------------------------------
// SEEDING HELPERS
// -------------------------------------------------------------
export async function seedInitialData() {
  try {
    // 1. Check & Seed Products
    const existingProducts = await db.select().from(schema.products).limit(1);
    if (existingProducts.length === 0) {
      console.log('Seeding initial products to PostgreSQL database...');
      for (const p of INITIAL_PRODUCTS) {
        await db.insert(schema.products).values({
          id: p.id,
          name: p.name,
          brand: p.brand,
          scale: p.scale,
          price: p.price,
          imageUrl: p.imageUrl,
          description: p.description || '',
          stock: p.stock ?? 10,
          category: p.category || '',
          year: p.year ?? 2023,
          features: JSON.stringify(p.features || []),
          rating: p.rating ?? 5.0,
          reviewsCount: p.reviewsCount ?? 0,
          discountPercentage: p.discountPercentage ?? null,
          galleryImages: JSON.stringify(p.galleryImages || []),
          videoUrl: p.videoUrl || null,
        });
      }
      console.log('Successfully seeded products!');
    }

    // 2. Check & Seed Bank Settings
    const existingSettings = await db.select().from(schema.bankSettings).limit(1);
    if (existingSettings.length === 0) {
      console.log('Seeding default bank settings...');
      await db.insert(schema.bankSettings).values({
        id: 'default',
        bankName: 'Ngân hàng Quân Đội',
        bankCodeShort: 'MB',
        accountNumber: '999999999999',
        accountHolder: 'NGUYEN VAN A',
        momoPhone: '0999999999',
        adminEmail: 'autovibe8825@gmail.com',
        showcaseProductId: 'prod-008',
        adminUsername: 'admin',
        adminPassword: '123',
      });
      console.log('Successfully seeded bank settings!');
    }

    // 3. Check & Seed Default Guest User
    const existingGuestUser = await db.select().from(schema.users).where(eq(schema.users.uid, 'user-001')).limit(1);
    if (existingGuestUser.length === 0) {
      console.log('Seeding default guest user...');
      await db.insert(schema.users).values({
        uid: 'user-001',
        email: 'miniauto.store@gmail.com',
        fullName: 'Nhà Sưu Tầm Đẳng Cấp',
        phone: '0912345678',
        address: '72 Nguyễn Trãi, Thanh Xuân, Hà Nội',
        role: 'customer',
        loyaltyPoints: 350,
        lifetimePoints: 350,
        redeemedGifts: '[]',
        vouchers: '[]',
        viewHistory: '[]',
      });
      console.log('Successfully seeded default guest user!');
    }
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
}

// -------------------------------------------------------------
// USER HELPERS
// -------------------------------------------------------------
export async function getOrCreateUser(uid: string, email: string, fullName: string = '', phone: string = '', address: string = '') {
  try {
    const existing = await db.select().from(schema.users).where(eq(schema.users.uid, uid)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }

    // Determine role (first user or specific emails can be admin)
    const countResult = await db.select().from(schema.users).limit(1);
    const role = (countResult.length === 0 || email === 'autovibe8825@gmail.com') ? 'admin' : 'customer';

    const inserted = await db.insert(schema.users).values({
      uid,
      email,
      fullName: fullName || email.split('@')[0],
      phone,
      address,
      role,
      loyaltyPoints: 0,
      lifetimePoints: 0,
      redeemedGifts: '[]',
      vouchers: '[]',
      viewHistory: '[]',
    }).returning();

    return inserted[0];
  } catch (error) {
    console.error('getOrCreateUser failed:', error);
    throw new Error('Đăng ký hoặc tìm nạp tài khoản thất bại.', { cause: error });
  }
}

export async function getUserProfile(uid: string) {
  try {
    const result = await db.select().from(schema.users).where(eq(schema.users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('getUserProfile failed:', error);
    throw new Error('Tìm nạp thông tin người dùng thất bại.', { cause: error });
  }
}

export async function updateUserProfile(uid: string, data: Partial<User>) {
  try {
    const updatePayload: any = {};
    if (data.fullName !== undefined) updatePayload.fullName = data.fullName;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.address !== undefined) updatePayload.address = data.address;
    if (data.loyaltyPoints !== undefined) updatePayload.loyaltyPoints = data.loyaltyPoints;
    if (data.lifetimePoints !== undefined) updatePayload.lifetimePoints = data.lifetimePoints;
    if (data.redeemedGifts !== undefined) updatePayload.redeemedGifts = JSON.stringify(data.redeemedGifts);
    if (data.vouchers !== undefined) updatePayload.vouchers = JSON.stringify(data.vouchers);
    if (data.viewHistory !== undefined) updatePayload.viewHistory = JSON.stringify(data.viewHistory);
    if (data.role !== undefined) updatePayload.role = data.role;

    const result = await db.update(schema.users)
      .set(updatePayload)
      .where(eq(schema.users.uid, uid))
      .returning();
    return result[0];
  } catch (error) {
    console.error('updateUserProfile failed:', error);
    throw new Error('Cập nhật thông tin người dùng thất bại.', { cause: error });
  }
}

export async function getAllCustomers() {
  try {
    return await db.select().from(schema.users);
  } catch (error) {
    console.error('getAllCustomers failed:', error);
    throw new Error('Tìm nạp danh sách khách hàng thất bại.', { cause: error });
  }
}

// -------------------------------------------------------------
// PRODUCT HELPERS
// -------------------------------------------------------------
export async function getProducts() {
  try {
    const prods = await db.select().from(schema.products);
    return prods.map(p => ({
      ...p,
      features: JSON.parse(p.features),
      galleryImages: JSON.parse(p.galleryImages),
    })) as Product[];
  } catch (error) {
    console.error('getProducts failed:', error);
    throw new Error('Lỗi tải danh sách sản phẩm.', { cause: error });
  }
}

export async function createProduct(p: Product) {
  try {
    const inserted = await db.insert(schema.products).values({
      id: p.id,
      name: p.name,
      brand: p.brand,
      scale: p.scale,
      price: p.price,
      imageUrl: p.imageUrl,
      description: p.description || '',
      stock: p.stock ?? 10,
      category: p.category || '',
      year: p.year ?? 2023,
      features: JSON.stringify(p.features || []),
      rating: Number(p.rating) || 5.0,
      reviewsCount: p.reviewsCount ?? 0,
      discountPercentage: p.discountPercentage ?? null,
      galleryImages: JSON.stringify(p.galleryImages || []),
      videoUrl: p.videoUrl || null,
    }).returning();
    return inserted[0];
  } catch (error) {
    console.error('createProduct failed:', error);
    throw new Error('Thêm sản phẩm mới thất bại.', { cause: error });
  }
}

export async function updateProduct(id: string, p: Partial<Product>) {
  try {
    const updatePayload: any = {};
    if (p.name !== undefined) updatePayload.name = p.name;
    if (p.brand !== undefined) updatePayload.brand = p.brand;
    if (p.scale !== undefined) updatePayload.scale = p.scale;
    if (p.price !== undefined) updatePayload.price = p.price;
    if (p.imageUrl !== undefined) updatePayload.imageUrl = p.imageUrl;
    if (p.description !== undefined) updatePayload.description = p.description;
    if (p.stock !== undefined) updatePayload.stock = p.stock;
    if (p.category !== undefined) updatePayload.category = p.category;
    if (p.year !== undefined) updatePayload.year = p.year;
    if (p.features !== undefined) updatePayload.features = JSON.stringify(p.features);
    if (p.rating !== undefined) updatePayload.rating = p.rating;
    if (p.reviewsCount !== undefined) updatePayload.reviewsCount = p.reviewsCount;
    if (p.discountPercentage !== undefined) updatePayload.discountPercentage = p.discountPercentage;
    if (p.galleryImages !== undefined) updatePayload.galleryImages = JSON.stringify(p.galleryImages);
    if (p.videoUrl !== undefined) updatePayload.videoUrl = p.videoUrl;

    const result = await db.update(schema.products)
      .set(updatePayload)
      .where(eq(schema.products.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error('updateProduct failed:', error);
    throw new Error('Cập nhật sản phẩm thất bại.', { cause: error });
  }
}

export async function deleteProduct(id: string) {
  try {
    await db.delete(schema.products).where(eq(schema.products.id, id));
    return true;
  } catch (error) {
    console.error('deleteProduct failed:', error);
    throw new Error('Xóa sản phẩm thất bại.', { cause: error });
  }
}

// -------------------------------------------------------------
// ORDER HELPERS
// -------------------------------------------------------------
export async function getOrders(userId?: string) {
  try {
    let query = db.select().from(schema.orders);
    
    // Admin or specific user check
    const rows = userId 
      ? await db.select().from(schema.orders).where(eq(schema.orders.userId, userId))
      : await db.select().from(schema.orders);

    const fullOrders: Order[] = [];
    for (const r of rows) {
      const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, r.id));
      fullOrders.push({
        id: r.id,
        userId: r.userId,
        userName: r.userName,
        userPhone: r.userPhone,
        userAddress: r.userAddress,
        totalAmount: r.totalAmount,
        status: r.status,
        paymentMethod: r.paymentMethod,
        paymentStatus: r.paymentStatus,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        deliveryProgress: r.deliveryProgress,
        deliveryRouteIndex: r.deliveryRouteIndex,
        carrier: r.carrier || undefined,
        trackingCode: r.trackingCode || undefined,
        carrierLabelPrinted: r.carrierLabelPrinted,
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          brand: item.brand,
          scale: item.scale,
          price: item.price,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
        })),
      });
    }
    return fullOrders;
  } catch (error) {
    console.error('getOrders failed:', error);
    throw new Error('Tải danh sách đơn hàng thất bại.', { cause: error });
  }
}

export async function createOrder(o: Order) {
  try {
    // 0. Ensure user exists in the users table to satisfy foreign key constraint
    const userExists = await db.select().from(schema.users).where(eq(schema.users.uid, o.userId)).limit(1);
    if (userExists.length === 0) {
      console.log(`Auto-seeding profile for user ID ${o.userId} on-the-fly to satisfy FK constraints.`);
      await db.insert(schema.users).values({
        uid: o.userId,
        email: `${o.userId}@miniauto.store`,
        fullName: o.userName || 'Nhà Sưu Tầm Đẳng Cấp',
        phone: o.userPhone || '0912345678',
        address: o.userAddress || '72 Nguyễn Trãi, Thanh Xuân, Hà Nội',
        role: 'customer',
        loyaltyPoints: 0,
        lifetimePoints: 0,
        redeemedGifts: '[]',
        vouchers: '[]',
        viewHistory: '[]',
      });
    }

    // 1. Insert order record
    const r = await db.insert(schema.orders).values({
      id: o.id,
      userId: o.userId,
      userName: o.userName,
      userPhone: o.userPhone,
      userAddress: o.userAddress,
      totalAmount: o.totalAmount,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      deliveryProgress: o.deliveryProgress || 0,
      deliveryRouteIndex: o.deliveryRouteIndex || 0,
      carrier: o.carrier || null,
      trackingCode: o.trackingCode || null,
      carrierLabelPrinted: o.carrierLabelPrinted || false,
    }).returning();

    // 2. Insert items
    for (const item of o.items) {
      await db.insert(schema.orderItems).values({
        orderId: o.id,
        productId: item.productId,
        productName: item.productName,
        brand: item.brand,
        scale: item.scale,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
      });

      // 3. Deduct product stock
      const prodList = await db.select().from(schema.products).where(eq(schema.products.id, item.productId)).limit(1);
      if (prodList.length > 0) {
        const currentStock = prodList[0].stock;
        const newStock = Math.max(0, currentStock - item.quantity);
        await db.update(schema.products).set({ stock: newStock }).where(eq(schema.products.id, item.productId));
      }
    }

    return r[0];
  } catch (error) {
    console.error('createOrder failed:', error);
    throw new Error('Khởi tạo đơn hàng mới thất bại.', { cause: error });
  }
}

export async function updateOrder(id: string, o: Partial<Order>) {
  try {
    const updatePayload: any = {};
    if (o.status !== undefined) updatePayload.status = o.status;
    if (o.paymentStatus !== undefined) updatePayload.paymentStatus = o.paymentStatus;
    if (o.deliveryProgress !== undefined) updatePayload.deliveryProgress = o.deliveryProgress;
    if (o.deliveryRouteIndex !== undefined) updatePayload.deliveryRouteIndex = o.deliveryRouteIndex;
    if (o.carrier !== undefined) updatePayload.carrier = o.carrier;
    if (o.trackingCode !== undefined) updatePayload.trackingCode = o.trackingCode;
    if (o.carrierLabelPrinted !== undefined) updatePayload.carrierLabelPrinted = o.carrierLabelPrinted;
    updatePayload.updatedAt = new Date();

    const result = await db.update(schema.orders)
      .set(updatePayload)
      .where(eq(schema.orders.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error('updateOrder failed:', error);
    throw new Error('Cập nhật trạng thái đơn hàng thất bại.', { cause: error });
  }
}

// -------------------------------------------------------------
// BANK SETTINGS HELPERS
// -------------------------------------------------------------
export async function getBankSettings() {
  try {
    const result = await db.select().from(schema.bankSettings).where(eq(schema.bankSettings.id, 'default')).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('getBankSettings failed:', error);
    throw new Error('Tải thông số ngân hàng thất bại.', { cause: error });
  }
}

export async function updateBankSettings(b: Partial<BankSettings>) {
  try {
    const updatePayload: any = {};
    if (b.bankName !== undefined) updatePayload.bankName = b.bankName;
    if (b.bankCodeShort !== undefined) updatePayload.bankCodeShort = b.bankCodeShort;
    if (b.accountNumber !== undefined) updatePayload.accountNumber = b.accountNumber;
    if (b.accountHolder !== undefined) updatePayload.accountHolder = b.accountHolder;
    if (b.momoPhone !== undefined) updatePayload.momoPhone = b.momoPhone;
    if (b.adminEmail !== undefined) updatePayload.adminEmail = b.adminEmail;
    if (b.showcaseProductId !== undefined) updatePayload.showcaseProductId = b.showcaseProductId;
    if (b.adminUsername !== undefined) updatePayload.adminUsername = b.adminUsername;
    if (b.adminPassword !== undefined) updatePayload.adminPassword = b.adminPassword;
    updatePayload.updatedAt = new Date();

    const result = await db.update(schema.bankSettings)
      .set(updatePayload)
      .where(eq(schema.bankSettings.id, 'default'))
      .returning();
    return result[0];
  } catch (error) {
    console.error('updateBankSettings failed:', error);
    throw new Error('Cập nhật cấu hình cửa hàng thất bại.', { cause: error });
  }
}

// -------------------------------------------------------------
// NOTIFICATIONS HELPERS
// -------------------------------------------------------------
export async function getNotifications() {
  try {
    return await db.select().from(schema.notifications).orderBy(desc(schema.notifications.createdAt));
  } catch (error) {
    console.error('getNotifications failed:', error);
    throw new Error('Tải thông báo thất bại.', { cause: error });
  }
}

export async function createNotification(n: AdminNotification) {
  try {
    const inserted = await db.insert(schema.notifications).values({
      id: n.id,
      title: n.title,
      message: n.message,
      time: n.time || new Date().toLocaleTimeString('vi-VN'),
      orderId: n.orderId,
      read: n.read ?? false,
      amount: n.amount ?? null,
    }).returning();
    return inserted[0];
  } catch (error) {
    console.error('createNotification failed:', error);
    throw new Error('Thêm thông báo mới thất bại.', { cause: error });
  }
}

export async function updateNotificationRead(id: string, read: boolean) {
  try {
    const result = await db.update(schema.notifications)
      .set({ read })
      .where(eq(schema.notifications.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error('updateNotificationRead failed:', error);
    throw new Error('Đánh dấu đọc thông báo thất bại.', { cause: error });
  }
}

export async function markAllNotificationsRead() {
  try {
    await db.update(schema.notifications).set({ read: true });
    return true;
  } catch (error) {
    console.error('markAllNotificationsRead failed:', error);
    throw new Error('Đánh dấu đọc tất cả thông báo thất bại.', { cause: error });
  }
}
