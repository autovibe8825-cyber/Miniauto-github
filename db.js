import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Tải cấu hình biến môi trường từ tệp .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_API_KEY || '';

console.log(`[SUPABASE DIAGNOSTIC] Khởi tạo kết nối tới Supabase URL: ${supabaseUrl || '(Chưa cấu hình)'}`);

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Cảnh báo: SUPABASE_URL hoặc SUPABASE_API_KEY chưa được khai báo trong biến môi trường (.env).');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Kiểm tra kết nối tới bảng 'products' (bảng thực tế trong hệ thống) hoặc 'your_table'
const testTable = 'products';

supabase
  .from(testTable)
  .select('*')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error(`❌ Lỗi kết nối Supabase (Bảng: ${testTable}):`, error.message || error);
      console.log('💡 Hướng dẫn: Hãy đảm bảo RLS (Row Level Security) được cấu hình cho phép đọc hoặc cung cấp Service Role Key chính xác.');
    } else {
      console.log(`✅ Kết nối Supabase thành công! Dữ liệu mẫu từ bảng "${testTable}":`, data);
    }
  })
  .catch(err => {
    console.error('❌ Gặp sự cố kết nối ngoại lệ:', err);
  });

export default supabase;
