import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import * as dbHelpers from "./src/db/helpers.ts";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import nodemailer from "nodemailer";

async function sendOrderConfirmationEmail(order: any, recipientEmail: string) {
  try {
    const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const fromName = process.env.SMTP_FROM_NAME || 'MiniAuto Store';
    const fromEmail = process.env.SMTP_FROM_EMAIL || user || 'contact@miniauto.store';

    if (!user || !pass) {
      console.log(`[SMTP SIMULATOR] Chưa cấu hình SMTP_USER hoặc SMTP_PASS. Gửi email ảo xác nhận đến ${recipientEmail} cho đơn hàng ${order.id}.`);
      return { simulated: true };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const itemsHtml = order.items && Array.isArray(order.items)
      ? order.items.map((item: any) => `
          <tr style="border-bottom: 1px solid #e4e4e7;">
            <td style="padding: 10px; color: #18181b;">
              <strong>${item.productName}</strong><br/>
              <span style="font-size: 11px; color: #71717a;">Hãng: ${item.brand || 'N/A'} | Tỷ lệ: ${item.scale || 'N/A'}</span>
            </td>
            <td style="padding: 10px; text-align: center; color: #18181b;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #ef4444;">${(item.price || 0).toLocaleString('vi-VN')} đ</td>
          </tr>
        `).join('')
      : '';

    const emailBodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e4e4e7; border-radius: 16px; background-color: #ffffff; color: #18181b; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="text-align: center; border-bottom: 3px solid #ef4444; padding-bottom: 20px; margin-bottom: 20px;">
          <span style="font-size: 40px;">🏎️</span>
          <h1 style="color: #ef4444; margin: 10px 0 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">XÁC NHẬN ĐƠN HÀNG THÀNH CÔNG</h1>
          <p style="margin: 5px 0 0; font-size: 12px; color: #71717a; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Cảm ơn bạn đã lựa chọn MiniAuto.store</p>
        </div>
        
        <div style="font-size: 14px; line-height: 1.6; color: #27272a;">
          <p>Xin chào <strong>${order.userName || 'Quý khách'}</strong>,</p>
          <p>Chúng tôi xin trân trọng thông báo đơn hàng của bạn đã được tiếp nhận và xử lý thành công trên hệ thống <strong>MiniAuto.store</strong>. Dưới đây là chi tiết hóa đơn mua sắm của bạn:</p>
          
          <div style="background-color: #f4f4f5; padding: 18px; border-radius: 12px; margin: 20px 0; border: 1px solid #e4e4e7;">
            <h3 style="margin-top: 0; color: #18181b; font-size: 14px; border-bottom: 1px dashed #d4d4d8; padding-bottom: 8px; font-weight: 800; text-transform: uppercase;">📋 THÔNG TIN ĐƠN HÀNG: #${order.id}</h3>
            <table style="width: 100%; font-size: 13px; line-height: 1.8; border-collapse: collapse;">
              <tr>
                <td style="color: #71717a; width: 140px; padding: 4px 0;">Khách hàng:</td>
                <td style="font-weight: bold; color: #18181b; padding: 4px 0;">${order.userName}</td>
              </tr>
              <tr>
                <td style="color: #71717a; padding: 4px 0;">Số điện thoại:</td>
                <td style="font-weight: bold; color: #ef4444; padding: 4px 0;">${order.userPhone}</td>
              </tr>
              <tr>
                <td style="color: #71717a; padding: 4px 0;">Địa chỉ nhận hàng:</td>
                <td style="color: #18181b; padding: 4px 0;">${order.userAddress}</td>
              </tr>
              <tr>
                <td style="color: #71717a; padding: 4px 0;">Phương thức thanh toán:</td>
                <td style="padding: 4px 0;"><strong style="background-color: #10b981; color: #ffffff; padding: 2px 6px; border-radius: 6px; font-size: 11px; text-transform: uppercase;">${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'BANK'}</strong></td>
              </tr>
              ${order.carrier ? `
              <tr>
                <td style="color: #71717a; padding: 4px 0;">Đối tác vận chuyển:</td>
                <td style="color: #18181b; font-weight: bold; padding: 4px 0;">${order.carrier.toUpperCase()} ${order.trackingCode ? `(<span style="color: #0284c7; font-family: monospace;">${order.trackingCode}</span>)` : ''}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="margin: 25px 0;">
            <h4 style="margin: 0 0 12px; color: #18181b; font-size: 14px; font-weight: bold; border-left: 4px solid #ef4444; padding-left: 10px; text-transform: uppercase;">🛒 CHI TIẾT SẢN PHẨM:</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="background-color: #f4f4f5; text-align: left; border-bottom: 2px solid #e4e4e7; color: #18181b;">
                  <th style="padding: 10px; font-weight: bold;">Mẫu ô tô</th>
                  <th style="padding: 10px; font-weight: bold; text-align: center; width: 60px;">SL</th>
                  <th style="padding: 10px; font-weight: bold; text-align: right; width: 120px;">Đơn giá</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr style="border-top: 2px solid #e4e4e7; font-weight: bold; background-color: #fafafa;">
                  <td colspan="2" style="padding: 12px; text-align: right; font-size: 13px; color: #18181b;">TỔNG CỘNG THANH TOÁN:</td>
                  <td style="padding: 12px; text-align: right; font-size: 16px; color: #ef4444; font-weight: 900;">${(order.totalAmount || 0).toLocaleString('vi-VN')} đ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="border-top: 1px solid #e4e4e7; padding-top: 20px; margin-top: 30px; text-align: center; font-size: 12px; color: #71717a; line-height: 1.5;">
            <p>Mọi thắc mắc về đơn hàng, quý khách vui lòng liên hệ hotline hoặc phản hồi trực tiếp qua email này.</p>
            <p style="margin-top: 5px; font-weight: bold; color: #ef4444;">Đội ngũ hỗ trợ khách hàng MiniAuto.store trân trọng!</p>
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipientEmail,
      subject: `🏎️ [MiniAuto.store] Xác nhận đơn hàng thành công #${order.id}`,
      html: emailBodyHtml,
    });

    console.log(`[SMTP SUCCESS] Đã gửi email xác nhận thành công tới ${recipientEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[SMTP ERROR] Gửi email xác nhận thất bại:", error);
    throw error;
  }
}

async function sendOrderNotificationToAdmin(order: any, adminEmail: string) {
  try {
    const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const fromName = process.env.SMTP_FROM_NAME || 'MiniAuto Store';
    const fromEmail = process.env.SMTP_FROM_EMAIL || user || 'contact@miniauto.store';

    if (!user || !pass) {
      console.log(`[SMTP SIMULATOR] Chưa cấu hình SMTP_USER hoặc SMTP_PASS. Gửi email ảo thông báo đơn hàng mới đến Admin ${adminEmail} cho đơn hàng ${order.id}.`);
      return { simulated: true };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const itemsHtml = order.items && Array.isArray(order.items)
      ? order.items.map((item: any) => `
          <tr style="border-bottom: 1px solid #e4e4e7;">
            <td style="padding: 10px; color: #18181b;">
              <strong>${item.productName}</strong><br/>
              <span style="font-size: 11px; color: #71717a;">Hãng: ${item.brand || 'N/A'} | Tỷ lệ: ${item.scale || 'N/A'}</span>
            </td>
            <td style="padding: 10px; text-align: center; color: #18181b;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #ef4444;">${(item.price || 0).toLocaleString('vi-VN')} đ</td>
          </tr>
        `).join('')
      : '';

    const emailBodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #3f3f46; border-radius: 16px; background-color: #ffffff; color: #18181b; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="text-align: center; border-bottom: 3px solid #ef4444; padding-bottom: 20px; margin-bottom: 20px;">
          <span style="font-size: 40px;">🚨</span>
          <h1 style="color: #ef4444; margin: 10px 0 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">BÁO CÁO ĐƠN HÀNG MỚI (ADMIN)</h1>
          <p style="margin: 5px 0 0; font-size: 12px; color: #71717a; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">MÁY CHỦ BÁO ĐƠN TỰ ĐỘNG - TIỆM XE MÔ HÌNH</p>
        </div>
        
        <div style="font-size: 14px; line-height: 1.6; color: #27272a;">
          <p>Chào sếp,</p>
          <p>Cửa hàng vừa nhận được một đơn hàng mới từ người mua. Dưới đây là đầy đủ thông tin chi tiết đơn đặt hàng để sếp xử lý giao vận:</p>
          
          <div style="background-color: #f4f4f5; padding: 18px; border-radius: 12px; margin: 20px 0; border: 1px solid #e4e4e7;">
            <h3 style="margin-top: 0; color: #18181b; font-size: 14px; border-bottom: 1px dashed #d4d4d8; padding-bottom: 8px; font-weight: 800; text-transform: uppercase;">📋 THÔNG TIN VẬN ĐƠN: #${order.id}</h3>
            <table style="width: 100%; font-size: 13px; line-height: 1.8; border-collapse: collapse;">
              <tr>
                <td style="color: #71717a; width: 140px; padding: 4px 0;">Tên khách đặt:</td>
                <td style="font-weight: bold; color: #18181b; padding: 4px 0;">${order.userName}</td>
              </tr>
              <tr>
                <td style="color: #71717a; padding: 4px 0;">Số điện thoại:</td>
                <td style="font-weight: bold; color: #ef4444; padding: 4px 0;">${order.userPhone}</td>
              </tr>
              <tr>
                <td style="color: #71717a; padding: 4px 0;">Địa chỉ giao hàng:</td>
                <td style="color: #18181b; padding: 4px 0; font-weight: bold;">${order.userAddress}</td>
              </tr>
              <tr>
                <td style="color: #71717a; padding: 4px 0;">Email người nhận:</td>
                <td style="color: #18181b; padding: 4px 0;">${order.userEmail || 'Không cung cấp'}</td>
              </tr>
              <tr>
                <td style="color: #71717a; padding: 4px 0;">Phương thức thanh toán:</td>
                <td style="padding: 4px 0;"><strong style="background-color: #10b981; color: #ffffff; padding: 2px 6px; border-radius: 6px; font-size: 11px; text-transform: uppercase;">${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'BANK'}</strong></td>
              </tr>
              ${order.carrier ? `
              <tr>
                <td style="color: #71717a; padding: 4px 0;">Đối tác vận chuyển:</td>
                <td style="color: #18181b; font-weight: bold; padding: 4px 0;">${order.carrier.toUpperCase()} ${order.trackingCode ? `(<span style="color: #0284c7; font-family: monospace;">${order.trackingCode}</span>)` : ''}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="margin: 25px 0;">
            <h4 style="margin: 0 0 12px; color: #18181b; font-size: 14px; font-weight: bold; border-left: 4px solid #ef4444; padding-left: 10px; text-transform: uppercase;">🛒 CHI TIẾT SẢN PHẨM KHÁCH ĐẶT:</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="background-color: #f4f4f5; text-align: left; border-bottom: 2px solid #e4e4e7; color: #18181b;">
                  <th style="padding: 10px; font-weight: bold;">Mẫu ô tô</th>
                  <th style="padding: 10px; font-weight: bold; text-align: center; width: 60px;">SL</th>
                  <th style="padding: 10px; font-weight: bold; text-align: right; width: 120px;">Đơn giá</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr style="border-top: 2px solid #e4e4e7; font-weight: bold; background-color: #fafafa;">
                  <td colspan="2" style="padding: 12px; text-align: right; font-size: 13px; color: #18181b;">TỔNG CỘNG HÓA ĐƠN:</td>
                  <td style="padding: 12px; text-align: right; font-size: 16px; color: #ef4444; font-weight: 900;">${(order.totalAmount || 0).toLocaleString('vi-VN')} đ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="border-top: 1px solid #e4e4e7; padding-top: 20px; margin-top: 30px; text-align: center; font-size: 12px; color: #71717a; line-height: 1.5;">
            <p>Hệ thống tự động thông báo đơn hàng mới. Vui lòng đăng nhập vào phân hệ quản trị để xử lý đơn hàng.</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: adminEmail,
      subject: `🚨 [ĐƠN HÀNG MỚI] Khách hàng ${order.userName} vừa chốt đơn #${order.id}`,
      html: emailBodyHtml
    });

    console.log(`[SMTP SUCCESS] Đã gửi thư báo đơn hàng mới thành công đến Admin: ${adminEmail}`);
  } catch (err) {
    console.error(`[SMTP ERROR] Thất bại khi gửi email báo đơn hàng mới tới Admin: ${adminEmail}`, err);
  }
}

interface RoomState {
  roomId: string;
  activeTab: string;
  selectedCategory: string;
  selectedScale: string;
  searchQuery: string;
  openProductId: string | null;
  // Simulator states
  engineStatus: "off" | "starting" | "running";
  compareObject: "iphone" | "bankcard" | "sodacan";
  isFlashing: boolean;
  // Shopping states
  cart: any[];
  wishlist: string[];
  // Metadata for conflict resolution
  lastUpdateBy: string;
  timestamp: number;
}

const rooms = new Map<string, RoomState>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Redirect root URL to /cuahang/ for routing consistency only in production
  if (process.env.NODE_ENV === "production") {
    app.get("/", (req, res) => {
      res.redirect("/cuahang/");
    });
  }

  // Ensure uploads directory exists and is served statically
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));
  app.use("/cuahang/uploads", express.static(uploadsDir));

  // REAL-TIME NOTIFICATIONS VIA SERVER-SENT EVENTS (SSE)
  interface SseClient {
    id: string;
    res: any;
  }
  let sseClients: SseClient[] = [];

  const broadcastEvent = (type: string, data: any) => {
    const payload = JSON.stringify({ type, data });
    sseClients.forEach(client => {
      try {
        client.res.write(`data: ${payload}\n\n`);
      } catch (err) {
        console.error(`[SSE Broadcast Error] Failed to write to client ${client.id}:`, err);
      }
    });
  };

  // Endpoint for Live Events
  app.get("/api/db/live-events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders(); // Tell client to expect events

    const clientId = Date.now().toString() + "-" + Math.random().toString(36).substring(2, 6);
    const newClient = { id: clientId, res };
    sseClients.push(newClient);

    console.log(`[SSE CLIENT CONNECTED] Client ID: ${clientId}. Total connected clients: ${sseClients.length}`);

    // Send a keep-alive/welcome signal
    res.write(`data: ${JSON.stringify({ type: "connected", clientId })}\n\n`);

    req.on("close", () => {
      sseClients = sseClients.filter(c => c.id !== clientId);
      console.log(`[SSE CLIENT DISCONNECTED] Client ID: ${clientId}. Total connected clients: ${sseClients.length}`);
    });
  });

  // Seed PostgreSQL database with initial data
  await dbHelpers.seedInitialData();

  // ==========================================
  // REAL-TIME INTEGRATION: SHIPPING & PAYMENTS
  // ==========================================
  const paymentRegistry = new Map<string, {
    status: 'pending' | 'success' | 'failed';
    method: string;
    amount: number;
    transId?: string;
    updatedAt: number;
  }>();

  // Automatic garbage collection / memory optimization for backend registry
  setInterval(() => {
    const now = Date.now();
    let roomsPrunedCount = 0;
    // Remove synchronize rooms older than 2 hours of inactivity
    for (const [roomId, room] of rooms.entries()) {
      if (now - room.timestamp > 2 * 60 * 60 * 1000) {
        rooms.delete(roomId);
        roomsPrunedCount++;
      }
    }
    // Remove payment sessions older than 24 hours
    let paymentsPrunedCount = 0;
    for (const [orderId, payment] of paymentRegistry.entries()) {
      if (now - payment.updatedAt > 24 * 60 * 60 * 1000) {
        paymentRegistry.delete(orderId);
        paymentsPrunedCount++;
      }
    }
    if (roomsPrunedCount > 0 || paymentsPrunedCount > 0) {
      console.log(`[BACKEND OPTIMIZATION] Automatic cache pruning: Cleared ${roomsPrunedCount} inactive rooms and ${paymentsPrunedCount} stale transaction records.`);
    }
  }, 10 * 60 * 1000); // Trigger cleanup cycle every 10 minutes

  // Shopee Express tracking mock API - real service response representation
  app.get("/api/shopee/track/:trackingCode", (req, res) => {
    const { trackingCode } = req.params;
    const deliveryMiles = [
      { time: "08:15 - Hôm nay", label: "Đã giao hàng thành công ✔", desc: "Bưu tá Shopee Express đã giao gói hàng an toàn cho khách hàng và hoàn tất ký nhận." },
      { time: "06:30 - Hôm nay", label: "Bưu tá đang giao gói mô hình", desc: "Shipper bốc xếp hàng lên cabin xe. Shipper Nguyễn Văn Huân (089.928.8258 - SPX VN) đang đi phát." },
      { time: "22:15 - Hôm qua", label: "Gói hàng đến bưu cục bưu điện Thanh Xuân Hub", desc: "Đơn hàng đã nhập kho trung chuyển phân phối khu vực nội thành Thanh Xuân - Hà Nội." },
      { time: "14:40 - Hôm qua", label: "Rời bưu cục phân loại chính Củ Chi SOC", desc: "Xe container chở rơ-moóc đã đóng thùng chứa hàng bưu phẩm và rời kho tổng phía Nam." },
      { time: "09:20 - Hôm qua", label: "Khai báo & Phân loại hoàn tất tại SOC", desc: "Gói hàng mô hình đã quét quang học phân loại hành trình tự động trên băng tải chính Củ Chi SOC." },
      { time: "18:05 - 2 ngày trước", label: "Bưu tá lấy hàng tại MiniAuto Store thành công", desc: "Bưu tá nội thành đã lấy hàng, ký nhận niêm phong thùng gỗ bọc bọt khí màng co xốp hơi mút dầy." },
      { time: "11:30 - 2 ngày trước", label: "Bắc cầu luồng luân chuyển & In nhãn vận đơn", desc: "Hệ thống quản lý MiniAuto Store đã đóng gói và truyền tải thông tin lên API Shopee Express Logistics." }
    ];
    
    res.json({
      success: true,
      trackingCode,
      carrier: "shopee",
      status: "shipping",
      progress: 85,
      deliveryDate: "Dự kiến giao trong hôm nay",
      milestones: deliveryMiles
    });
  });

  // Giao Hàng Nhanh (GHN) tracking mock API - real service response representation
  app.get("/api/ghn/track/:trackingCode", (req, res) => {
    const { trackingCode } = req.params;
    const deliveryMiles = [
      { time: "09:45 - Hôm nay", label: "Giao hàng thành công ✔", desc: "Nhân viên giao hàng GHN đã phát gói hàng nguyên vẹn và ký nhận thành công." },
      { time: "07:15 - Hôm nay", label: "Đang tiến hành đi giao", desc: "Shipper GHN Phạm Văn Kiên (093.442.2212) đang vận chuyển đơn hàng đến địa chỉ người nhận." },
      { time: "21:30 - Hôm qua", label: "Nhập kho trung chuyển Hà Nội Hub", desc: "Hàng đã cập bến bưu cục phân phối trung tâm khu vực miền Bắc để chia chọn tuyến phát." },
      { time: "15:10 - Hôm qua", label: "Xuất kho trung chuyển Hồ Chí Minh 24-Hanoi Hub", desc: "Đơn hàng đã được xếp lên container liên tỉnh bứt tốc đường bộ cao tốc." },
      { time: "08:50 - Hôm qua", label: "Nhập bưu cục phân loại GHN Tân Bình", desc: "Hàng đã được cân đo kích thước tự động và đóng bao niêm phong dán nhãn GHN." },
      { time: "17:30 - 2 ngày trước", label: "Lấy hàng thành công từ đối tác", desc: "Bưu tá GHN đã đến lấy hàng trực tiếp tại MiniAuto Store, bọc chống sốc dầy dặn." },
      { time: "10:15 - 2 ngày trước", label: "Tiếp nhận thông tin vận đơn", desc: "Thông tin đơn hàng đã được khởi tạo thành công trên hệ thống API Giao Hàng Nhanh." }
    ];

    res.json({
      success: true,
      trackingCode,
      carrier: "ghn",
      status: "shipping",
      progress: 85,
      deliveryDate: "Dự kiến giao trong hôm nay",
      milestones: deliveryMiles
    });
  });

  // J&T Express tracking mock API - real service response representation
  app.get("/api/jnt/track/:trackingCode", (req, res) => {
    const { trackingCode } = req.params;
    const deliveryMiles = [
      { time: "10:30 - Hôm nay", label: "Phát hàng thành công ✔", desc: "Đã giao hàng thành công cho người nhận. Người ký nhận: Khách hàng thân thiết." },
      { time: "08:00 - Hôm nay", label: "Shipper J&T Express đang đi giao", desc: "Bưu tá J&T Lê Minh Triết (035.772.9322) đang mang hàng đi phát tận nhà." },
      { time: "23:00 - Hôm qua", label: "Đến bưu cục phát J&T Hà Nội", desc: "Đơn hàng đã về tới bưu cục phát quận Thanh Xuân để phân chia khu vực ngõ phố." },
      { time: "16:45 - Hôm qua", label: "Rời trung tâm khai thác J&T Sóng Thần", desc: "Hoàn tất bốc xếp đóng thùng tải hàng vận chuyển liên tỉnh đi bưu cục trung chuyển phía Bắc." },
      { time: "10:10 - Hôm qua", label: "Nhập kho khai thác J&T Sóng Thần", desc: "Sản phẩm được phân loại tự động bằng camera quét mã vạch tốc độ cao của J&T." },
      { time: "18:20 - 2 ngày trước", label: "Nhân viên J&T lấy hàng thành công", desc: "Nhân viên giao nhận J&T Express đã tiếp nhận xe mô hình từ kho MiniAuto Store." },
      { time: "11:00 - 2 ngày trước", label: "Yêu cầu lấy hàng được ghi nhận", desc: "Hệ thống MiniAuto Store đã đồng bộ dữ liệu hóa đơn vận chuyển qua cổng J&T API Express." }
    ];

    res.json({
      success: true,
      trackingCode,
      carrier: "jnt",
      status: "shipping",
      progress: 85,
      deliveryDate: "Dự kiến giao trong hôm nay",
      milestones: deliveryMiles
    });
  });

  // Initiate a checkout payment transaction record
  app.post("/api/payment/initiate", (req, res) => {
    const { orderId, amount, method } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, error: "Thiếu Order ID" });
    }
    paymentRegistry.set(orderId, {
      status: 'pending',
      method: method || 'bank',
      amount: Number(amount) || 0,
      updatedAt: Date.now()
    });
    console.log(`[KHỞI TẠO] Giao dịch cổng ${method.toUpperCase()} cho hóa đơn ${orderId} trị giá ${amount}đ`);
    res.json({ success: true, orderId });
  });

  // Query custom order status
  app.get("/api/payment/status/:orderId", (req, res) => {
    const { orderId } = req.params;
    const record = paymentRegistry.get(orderId);
    if (record) {
      res.json({ success: true, status: record.status, record });
    } else {
      res.json({ success: true, status: 'pending' });
    }
  });

  // Direct Bank Webhook - simulating real-time VietQR providers (like SePay, Casso, etc.)
  app.post("/api/payment/bank-webhook", (req, res) => {
    const { gateway, transactionDate, amount, content, reference } = req.body;
    console.log("[BANK WEBHOOK] Nhận dữ liệu webhook MB BANK:", req.body);
    
    let matchedOrderId: string | null = null;
    const cleanContent = (content || "").toUpperCase().replace(/\s+/g, "");

    // 1. Iterate over registry to match order ID or parsed text patterns
    for (const [orderId, v] of paymentRegistry.entries()) {
      const cleanOrderId = orderId.toUpperCase().replace("-", "");
      if (cleanContent.includes(cleanOrderId) || cleanContent.includes(orderId.toUpperCase())) {
        matchedOrderId = orderId;
        break;
      }
    }

    // 2. Fallback: match by phone-based content or amount matching
    if (!matchedOrderId && cleanContent.startsWith("MA")) {
      const matchNum = cleanContent.match(/MA0?(\d+)/);
      if (matchNum) {
        const potentialPhone = matchNum[1];
        for (const [orderId, v] of paymentRegistry.entries()) {
          if (orderId.includes(potentialPhone)) {
            matchedOrderId = orderId;
            break;
          }
        }
      }
    }

    // 3. Fallback: scan for custom regex order format
    if (!matchedOrderId) {
      const match = cleanContent.match(/OD\d+/);
      if (match) {
        const cleanedOid = match[0].replace("OD", "OD-");
        if (paymentRegistry.has(cleanedOid)) {
          matchedOrderId = cleanedOid;
        }
      }
    }

    // 4. Fallback 4: Match first pending bank order with identical amount
    if (!matchedOrderId && amount) {
      for (const [orderId, v] of paymentRegistry.entries()) {
        if (v.status === 'pending' && v.method === 'bank' && Math.abs(v.amount - Number(amount)) < 10) {
          matchedOrderId = orderId;
          break;
        }
      }
    }

    if (matchedOrderId) {
      const record = paymentRegistry.get(matchedOrderId)!;
      record.status = 'success';
      record.transId = "FT26" + Math.floor(100000 + Math.random() * 900000);
      paymentRegistry.set(matchedOrderId, record);
      console.log(`[ĐÃ DUYỆT TỰ ĐỘNG] MB Bank thanh toán thành công hóa đơn ${matchedOrderId} trị giá ${record.amount}đ`);
      return res.json({ 
        success: true, 
        message: "Xác nhận chuyển khoản ngân hàng thành công qua MB Bank!",
        orderId: matchedOrderId,
        amount: record.amount
      });
    }

    res.status(200).json({ 
      success: false, 
      error: "Không tìm thấy phiên giao dịch tương thích khớp trùng mã đơn hàng. Giao dịch đưa vào hàng chờ rà soát thủ công." 
    });
  });

  // Momo IPN Webhook callback (Standard secure Merchant notification protocol)
  app.post("/api/payment/momo-ipn", (req, res) => {
    const { orderId, amount, transId, resultCode } = req.body;
    console.log("[MOMO IPN] Nhận callback giao dịch từ Ví Momo:", req.body);

    if (paymentRegistry.has(orderId)) {
      const record = paymentRegistry.get(orderId)!;
      if (Number(resultCode) === 0) {
        record.status = 'success';
        record.transId = transId || ("MM26" + Math.floor(100000 + Math.random() * 900000));
        paymentRegistry.set(orderId, record);
        console.log(`[ĐÃ DUYỆT TỰ ĐỘNG] MoMo IPN thanh toán thành công hóa đơn ${orderId} là ${record.amount}đ`);
        return res.json({ success: true, message: "MoMo xác nhận giao dịch thành công!" });
      } else {
        record.status = 'failed';
        paymentRegistry.set(orderId, record);
        return res.json({ success: true, message: "MoMo báo cáo hủy thanh toán hoặc giao dịch thất bại" });
      }
    }

    res.status(200).json({ success: false, error: "Không tìm thấy hóa đơn giao dịch MoMo tương thích." });
  });

  // ==========================================
  // DATABASE INTEGRATION: POSTGRESQL API
  // ==========================================

  // PRODUCTS
  app.get("/api/db/products", async (req, res) => {
    try {
      const products = await dbHelpers.getProducts();
      res.json({ success: true, products });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/smtp/test", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: "Vui lòng nhập email nhận thử nghiệm" });
      }

      const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
      const port = parseInt(process.env.SMTP_PORT || '465', 10);
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      const fromName = process.env.SMTP_FROM_NAME || 'MiniAuto Store';
      const fromEmail = process.env.SMTP_FROM_EMAIL || user || 'contact@miniauto.store';

      if (!user || !pass) {
        return res.status(400).json({ 
          success: false, 
          error: "Chưa cấu hình tài khoản SMTP_USER hoặc mật khẩu SMTP_PASS trong biến môi trường (.env)." 
        });
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: "🏎️ [MiniAuto.store] Kiểm Tra Kết Nối SMTP Thành Công!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e4e4e7; border-radius: 16px; background-color: #ffffff; color: #18181b; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 20px;">
              <span style="font-size: 40px;">🟢</span>
              <h1 style="color: #10b981; margin: 10px 0 0; font-size: 22px; font-weight: 800;">KẾT NỐI SMTP THÀNH CÔNG</h1>
              <p style="margin: 5px 0 0; font-size: 12px; color: #71717a; font-weight: bold; text-transform: uppercase;">Máy chủ gửi thư tự động đã sẵn sàng</p>
            </div>
            <div style="font-size: 14px; line-height: 1.6; color: #27272a;">
              <p>Xin chào,</p>
              <p>Bạn nhận được email này vì bạn vừa bấm nút <strong>Gửi Thử Email</strong> từ bảng quản lý Admin của <strong>MiniAuto.store</strong>.</p>
              
              <div style="background-color: #f4f4f5; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid #e4e4e7; font-family: monospace; font-size: 13px; line-height: 1.5;">
                <strong style="color: #18181b;">🔧 THÔNG SỐ CẤU HÌNH SMTP:</strong><br/>
                - SMTP Host: <span style="color: #2563eb;">${host}</span><br/>
                - SMTP Port: <span style="color: #2563eb;">${port}</span><br/>
                - SMTP User: <span style="color: #2563eb;">${user}</span><br/>
                - TLS/SSL: <span style="color: #10b981; font-weight: bold;">Đang kích hoạt (SSL/TLS)</span>
              </div>
              
              <p>Từ bây giờ, mỗi khi khách hàng hoàn tất đặt đơn hàng thành công, hệ thống sẽ tự động dùng máy chủ này gửi mẫu hóa đơn HTML trực tiếp đến email của khách hàng.</p>
            </div>
          </div>
        `
      });

      res.json({ success: true, messageId: info.messageId });
    } catch (error: any) {
      console.error("[SMTP TEST ERROR]", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/db/products", async (req, res) => {
    try {
      const product = await dbHelpers.createProduct(req.body);
      res.json({ success: true, product });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put("/api/db/products/:id", async (req, res) => {
    try {
      const product = await dbHelpers.updateProduct(req.params.id, req.body);
      res.json({ success: true, product });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.delete("/api/db/products/:id", async (req, res) => {
    try {
      await dbHelpers.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/upload", (req, res) => {
    try {
      const { image, filename } = req.body;
      if (!image) {
        return res.status(400).json({ success: false, error: "Không tìm thấy dữ liệu ảnh" });
      }

      // Check if image is base64
      let matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      let extension = "png";

      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
          extension = "jpg";
        } else if (mimeType.includes("gif")) {
          extension = "gif";
        } else if (mimeType.includes("webp")) {
          extension = "webp";
        }
        buffer = Buffer.from(matches[2], "base64");
      } else {
        // Fallback: if it doesn't have data URI prefix, try parsing as raw base64
        try {
          buffer = Buffer.from(image, "base64");
        } catch (err) {
          return res.status(400).json({ success: false, error: "Định dạng ảnh Base64 không hợp lệ" });
        }
      }

      // Generate a clean and safe filename
      const safeFilename = (filename || "upload")
        .replace(/[^a-zA-Z0-9.\-_]/g, "_")
        .replace(/\.[^/.]+$/, ""); // strip extension
      
      const uniqueFilename = `${safeFilename}_${Date.now()}.${extension}`;
      const filePath = path.join(process.cwd(), "uploads", uniqueFilename);

      fs.writeFileSync(filePath, buffer);

      // Return the public relative URL
      const relativeUrl = `/uploads/${uniqueFilename}`;
      res.json({ success: true, url: relativeUrl });
    } catch (error: any) {
      console.error("Lỗi khi tải ảnh lên:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ORDERS
  app.get("/api/db/orders", async (req, res) => {
    try {
      const userId = req.query.userId as string || undefined;
      const orders = await dbHelpers.getOrders(userId);
      res.json({ success: true, orders });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/db/orders", async (req, res) => {
    try {
      const order = await dbHelpers.createOrder(req.body);

      // Determine recipient email address
      let recipientEmail = req.body.userEmail || req.body.email;
      if (!recipientEmail && order.userId) {
        try {
          const userProfile = await dbHelpers.getUserProfile(order.userId);
          if (userProfile && userProfile.email) {
            recipientEmail = userProfile.email;
          }
        } catch (dbErr) {
          console.error("Lỗi khi lấy thông tin email thành viên để gửi xác nhận đơn:", dbErr);
        }
      }

      if (recipientEmail) {
        console.log(`[SMTP TRIGGER] Khởi chạy luồng gửi email xác nhận đến ${recipientEmail} cho hóa đơn #${order.id}`);
        // Send email in background asynchronously so it doesn't block client response
        sendOrderConfirmationEmail(req.body, recipientEmail).catch((mailErr) => {
          console.error(`[SMTP ERROR] Thất bại khi gửi email xác nhận tới ${recipientEmail}:`, mailErr);
        });
      } else {
        console.warn(`[SMTP WARNING] Không thể xác định địa chỉ email của khách hàng cho đơn hàng #${order.id}. Bỏ qua bước gửi email.`);
      }

      // Also send a notification email to the admin with the buyer's name, phone, address and product info!
      try {
        let adminEmail = 'autovibe8825@gmail.com';
        const settings = await dbHelpers.getBankSettings();
        if (settings && settings.adminEmail) {
          adminEmail = settings.adminEmail;
        }
        console.log(`[SMTP TRIGGER] Khởi chạy luồng gửi email thông báo đơn hàng mới đến Admin ${adminEmail}`);
        sendOrderNotificationToAdmin(req.body, adminEmail).catch((mailErr) => {
          console.error(`[SMTP ERROR] Thất bại khi gửi email báo đơn hàng mới tới Admin:`, mailErr);
        });
      } catch (adminMailErr) {
        console.error("Lỗi khi gửi email thông báo đơn hàng mới tới Admin:", adminMailErr);
      }

      // Broadcast order:created to all SSE clients in real-time
      broadcastEvent("order:created", order);

      res.json({ success: true, order });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put("/api/db/orders/:id", async (req, res) => {
    try {
      const order = await dbHelpers.updateOrder(req.params.id, req.body);
      
      // Broadcast order:updated to all SSE clients in real-time
      broadcastEvent("order:updated", order);

      res.json({ success: true, order });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // BANK SETTINGS
  app.get("/api/db/bank-settings", async (req, res) => {
    try {
      const settings = await dbHelpers.getBankSettings();
      res.json({ success: true, settings });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put("/api/db/bank-settings", async (req, res) => {
    try {
      const settings = await dbHelpers.updateBankSettings(req.body);
      res.json({ success: true, settings });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // NOTIFICATIONS
  app.get("/api/db/notifications", async (req, res) => {
    try {
      const notifications = await dbHelpers.getNotifications();
      res.json({ success: true, notifications });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/db/notifications", async (req, res) => {
    try {
      const notification = await dbHelpers.createNotification(req.body);

      // Broadcast notification:created to all SSE clients in real-time
      broadcastEvent("notification:created", notification);

      res.json({ success: true, notification });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put("/api/db/notifications/read-all", async (req, res) => {
    try {
      await dbHelpers.markAllNotificationsRead();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put("/api/db/notifications/:id/read", async (req, res) => {
    try {
      const notification = await dbHelpers.updateNotificationRead(req.params.id, req.body.read);
      res.json({ success: true, notification });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // USERS
  app.post("/api/db/users", async (req, res) => {
    try {
      const { uid, email, fullName, phone, address } = req.body;
      const user = await dbHelpers.getOrCreateUser(uid, email, fullName, phone, address);
      res.json({ success: true, user });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/db/users/:uid", async (req, res) => {
    try {
      const user = await dbHelpers.getUserProfile(req.params.uid);
      if (!user) {
        return res.status(404).json({ success: false, error: "Không tìm thấy người dùng" });
      }
      res.json({ success: true, user });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put("/api/db/users/:uid", async (req, res) => {
    try {
      const user = await dbHelpers.updateUserProfile(req.params.uid, req.body);
      res.json({ success: true, user });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/db/customers", async (req, res) => {
    try {
      const customers = await dbHelpers.getAllCustomers();
      res.json({ success: true, customers });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/sync/join", (req, res) => {
    const { roomId, deviceId } = req.body;
    let targetCode = roomId?.toUpperCase().trim();
    
    if (!targetCode || targetCode === "") {
      // Generate a clean 6-digit sync code
      targetCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    if (!rooms.has(targetCode)) {
      rooms.set(targetCode, {
        roomId: targetCode,
        activeTab: "shop",
        selectedCategory: "all",
        selectedScale: "all",
        searchQuery: "",
        openProductId: null,
        engineStatus: "off",
        compareObject: "iphone",
        isFlashing: false,
        cart: [],
        wishlist: [],
        lastUpdateBy: deviceId || "initial",
        timestamp: Date.now()
      });
    }

    res.json({ success: true, room: rooms.get(targetCode) });
  });

  // API to retrieve state
  app.get("/api/sync/state/:roomId", (req, res) => {
    const { roomId } = req.params;
    const key = roomId.toUpperCase().trim();
    if (rooms.has(key)) {
      res.json({ success: true, room: rooms.get(key) });
    } else {
      res.status(404).json({ success: false, error: "Không tìm thấy phòng đồng bộ này" });
    }
  });

  // API to update room state
  app.post("/api/sync/update/:roomId", (req, res) => {
    const { roomId } = req.params;
    const { state, deviceId } = req.body;
    const key = roomId.toUpperCase().trim();

    if (rooms.has(key)) {
      const current = rooms.get(key)!;
      
      // Update room state
      const updated: RoomState = {
        ...current,
        ...state,
        roomId: key,
        lastUpdateBy: deviceId || current.lastUpdateBy,
        timestamp: Date.now()
      };
      
      rooms.set(key, updated);
      res.json({ success: true, room: updated });
    } else {
      res.status(404).json({ success: false, error: "Không tìm thấy phòng đồng bộ này" });
    }
  });

  // Reset/Clear room state
  app.post("/api/sync/reset/:roomId", (req, res) => {
    const { roomId } = req.params;
    const key = roomId.toUpperCase().trim();
    if (rooms.has(key)) {
      rooms.delete(key);
    }
    res.json({ success: true });
  });

  // Vite server middleware integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Serve static files with and without the /cuahang prefix to support subpath proxy routing
    app.use('/cuahang', express.static(distPath));
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
