import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Lamborghini Sian FKP 37',
    brand: 'Lamborghini',
    scale: '1:18',
    price: 1850000,
    discountPercentage: 15,
    imageUrl: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=600&auto=format&fit=crop&q=80',
    description: 'Mô hình đúc nguyên khối hợp kim kẽm siêu cao cấp từ hãng Bburago. Chi tiết động cơ V12 phía sau chân thực đến kinh ngạc, nội thất bọc da nhân tạo tinh xảo, bánh trước có thể bẻ lái theo vô lăng.',
    stock: 8,
    category: 'supercar',
    year: 2020,
    features: [
      'Khung vỏ đúc bằng kim loại Alum-Zinc cực kỳ đầm tay',
      'Mở được 2 cửa cánh chim đặc trưng, nắp capo trước và nắp máy sau',
      'Hệ thống giảm xóc cơ học hoạt động mượt mà ở cả 4 bánh',
      'Lốp cao su tự nhiên có vân gai chi tiết hoàn hảo'
    ],
    rating: 4.9,
    reviewsCount: 42
  },
  {
    id: 'prod-002',
    name: 'Porsche 911 GT3 RS (992)',
    brand: 'Porsche',
    scale: '1:18',
    price: 2450000,
    discountPercentage: 10,
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600&auto=format&fit=crop&q=80',
    description: 'Cực phẩm mô hình từ nhà sản xuất Minichamps danh tiếng. Phiên bản màu xanh lá Acid Green nổi bật với cánh gió kép khí động học khổng lồ, kính chắn gió chống tia UV giả lập, đĩa phanh ceramic đục lỗ siêu chi tiết.',
    stock: 5,
    category: 'supercar',
    year: 2023,
    features: [
      'Góc bẻ lái bánh trước đồng bộ vô lăng cực nhạy',
      'Toàn bộ sàn xe được lót thảm nỉ giả lập cao cấp',
      'Cánh gió sau Carbon Fiber có thể điều chỉnh độ nghiêng thủ công',
      'Màu sơn tĩnh điện 4 lớp chống phai màu theo thời gian'
    ],
    rating: 4.8,
    reviewsCount: 29
  },
  {
    id: 'prod-003',
    name: 'Mercedes-Benz G63 AMG Brabus 800',
    brand: 'Mercedes',
    scale: '1:24',
    price: 890000,
    discountPercentage: 20,
    imageUrl: 'https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?w=600&auto=format&fit=crop&q=80',
    description: 'Bản độ quái thú Brabus 800 của dòng SUV huyền thoại Mercedes G63. Sản phẩm tích hợp pin phát âm thanh đề nổ gầm rú và đèn pha LED siêu sáng khi ấn nhẹ đuôi xe hoặc mở cửa cabinet.',
    stock: 12,
    category: 'suv',
    year: 2021,
    features: [
      'Hệ thống âm thanh đề nổ mô phỏng động cơ V8 Twin-Turbo chân thực',
      'Mở được toàn bộ 4 cửa bên, nắp capo trước và cửa cốp lốp dự phòng sau',
      'Đèn pha LED trước và cụm đèn hậu phát sáng rực rỡ',
      'Bánh xe kéo cót có gia tốc chạy tự động'
    ],
    rating: 4.7,
    reviewsCount: 56
  },
  {
    id: 'prod-004',
    name: 'Toyota AE86 Trueno Initial D Spirit',
    brand: 'Toyota',
    scale: '1:24',
    price: 680000,
    discountPercentage: 15,
    imageUrl: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop&q=80',
    description: 'Cái tên bất hủ trong giới drift xe Nhật Bản và bộ truyện Initial D huyền thoại. Mô hình tái hiện chính xác chiếc xe giao đậu hũ của Takumi Fujiwara với khay nước đậu hũ mini đi kèm.',
    stock: 15,
    category: 'jdm',
    year: 1986,
    features: [
      'Đèn pha thiết kế ẩn (Pop-up Headlights) có cần gạt đóng mở linh hoạt',
      'Logo đậu hũ Fujiwara Tofu Shop được in decal sắc nét trên cửa hông',
      'Đi kèm mô hình khay đậu hũ mini đặt trong cốp sau xe',
      'Mặt động cơ 4A-GE được sơn màu mạ krome mô phỏng chi tiết'
    ],
    rating: 4.9,
    reviewsCount: 95
  },
  {
    id: 'prod-005',
    name: 'Ford Mustang Shelby GT500 1967',
    brand: 'Ford',
    scale: '1:18',
    price: 1500000,
    discountPercentage: 25,
    imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&auto=format&fit=crop&q=80',
    description: 'Chiếc Muscle Car biểu tượng của nước Mỹ mang tên Eleanor lộng lẫy sơn màu xám nòng súng sọc đen. Khung gầm đúc hoàn toàn từ kim loại nguyên khối chịu lực nặng và tinh tế tối đa.',
    stock: 4,
    category: 'classic',
    year: 1967,
    features: [
      'Gầm xe được phân tách hệ thống ống xả kép đúc xi bạc sang trọng',
      'Vô lăng 3 chấu bọc gỗ giả cao cấp xoay chuyển được bánh trước',
      'Nội thất ghế ngồi giả lập chất liệu da màu đen nhám cổ điển',
      'Khoang máy cơ bắp khối V8 Shelby cực hầm hố'
    ],
    rating: 4.9,
    reviewsCount: 18
  },
  {
    id: 'prod-006',
    name: 'Ferrari SF90 Stradale',
    brand: 'Ferrari',
    scale: '1:24',
    price: 750000,
    discountPercentage: 12,
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
    description: 'Kiệt tác siêu xe Hybrid thương mại đỉnh nhất của hãng "Ngựa Chồm" nước Ý. Tỉ lệ sơn tinh xảo từ hãng sơn cao cấp mượt mà không tỳ vết, đường gió khí động học sườn xe khoét sâu tuyệt mỹ.',
    stock: 2,
    category: 'supercar',
    year: 2021,
    features: [
      'Khuôn đúc phom chuẩn từ bản vẽ CAD gốc của Ferrari S.p.A',
      'Ngoại thất màu đỏ Rosso Corsa bóng loáng đặc trưng',
      'Mở được khoang lái hai bên và khoang hành lý phía trước',
      'Kèm theo hộp mica trưng bày giả da sang chảnh chống bụi tuyệt đối'
    ],
    rating: 4.6,
    reviewsCount: 14
  },
  {
    id: 'prod-007',
    name: 'Nissan Skyline GT-R R34 V-Spec II',
    brand: 'Nissan',
    scale: '1:32',
    price: 420000,
    discountPercentage: 5,
    imageUrl: 'https://images.unsplash.com/photo-1612462288029-28cd47a2845a?w=600&auto=format&fit=crop&q=80',
    description: 'Huyền thoại Godzilla của giới xe độ đường phố JDM Nhật Bản phiên bản nổi bật sơn màu xanh dương Bayside Blue vô tiền khoáng hậu. Dòng xe đóng vai chính trong loạt phim Fast & Furious.',
    stock: 20,
    category: 'jdm',
    year: 2002,
    features: [
      'Tích hợp pin cúc áo, mở cửa kích hoạt đèn pha cực chất',
      'Cánh gió rùa thể thao chất liệu ABS bền bỉ chống giòn vỡ',
      'Đuôi xe có tháp loa độ nổi giả lập tinh quái',
      'Hệ thống bánh cót hoạt động nhạy bén bền theo năm tháng'
    ],
    rating: 4.9,
    reviewsCount: 112
  },
  {
    id: 'prod-008',
    name: 'Rolls-Royce Cullinan Mansory Edition',
    brand: 'Rolls-Royce',
    scale: '1:18',
    price: 3600000,
    discountPercentage: 10,
    imageUrl: 'https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=605&auto=format&fit=crop&q=80',
    description: 'Dành cho hoàng gia, vua của các dòng SUV xa xỉ vượt thời gian trong bản độ Mansory đẳng cấp. Hệ thống treo hơi lò xo độc lập, biểu tượng nữ thần Spirit of Ecstasy có khả năng thò thụt giả lập thụ động sáng giá.',
    stock: 3,
    category: 'suv',
    year: 2022,
    features: [
      'Mở cửa tự động kích hoạt ánh sao ngập tràn (Starlight Headliner) trần xe dải LED lung linh',
      'Mở được 4 cửa kiểu Coach Door (cửa mở ngược độc quyền quý tộc)',
      'Bàn ăn gỗ dã ngoại và ghế ngồi ngắm cảnh kéo ra được dưới sàn cốp',
      'Chi tiết lốp xe vân cao cấp không bao giờ bám bẩn'
    ],
    rating: 5.0,
    reviewsCount: 9
  },
  {
    id: 'prod-009',
    name: 'Aston Martin DB5 (James Bond 007)',
    brand: 'Aston Martin',
    scale: '1:24',
    price: 920000,
    discountPercentage: 15,
    imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&auto=format&fit=crop&q=80',
    description: 'Tái hiện mẫu xe điệp viên hào hoa cổ kính bậc nhất thế giới trong tập phim Goldfinger. Kèm cụm trang bị mồi bẫy mô hình ngụy trang cực thú vị.',
    stock: 10, // Restocked to show products
    category: 'classic',
    year: 1964,
    features: [
      'Tấm biển số xoay được 3 mặt khác nhau theo phong cách 007',
      'Mái xe có mảnh ghép tháo rời giả lập ghế phóng thoát hiểm khẩn cấp',
      'Cặp súng máy giả lập nhô ra từ hốc đèn xi-nhan trước',
      'Nước sơn bạc tuyền bọc kim sáng bóng quyến rũ'
    ],
    rating: 4.8,
    reviewsCount: 31
  },
  {
    id: 'prod-010',
    name: 'Subaru Impreza WRX STI Rally WRC',
    brand: 'Subaru',
    scale: '1:32',
    price: 380000,
    discountPercentage: 10,
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80',
    description: 'Chuyên cơ mặt đất đường đua địa hình Rally Championship danh giá. Được sơn vẽ dán đầy đủ các nhãn tài trợ giải đua huyền thoại 555 bặm trợn cá tính.',
    stock: 25,
    category: 'jdm',
    year: 2006,
    features: [
      'Vành la-zăng đúc sơn nhũ vàng đồng thể thao cực ngầu',
      'Hốc hút gió capo thiết kế rỗng chuẩn khí động học',
      'Bánh xe đầm bọc cao su chịu ma sát lớn chuyên dụng',
      'Hỗ trợ cự ly đẩy kéo cót mạnh mẽ'
    ],
    rating: 4.7,
    reviewsCount: 38
  },
  // 10 NEW DETAILED MODEL CAR PRODUCTS Added
  {
    id: 'prod-011',
    name: 'Ferrari Daytona SP3 Carbon Red',
    brand: 'Ferrari',
    scale: '1:18',
    price: 2150000,
    discountPercentage: 15,
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80',
    description: 'Mô hình đúc tinh xảo mô phỏng mẫu xe kỷ niệm tuyệt đẹp Daytona SP3 của Ferrari. Thiết kế hốc gió cản sau xếp tầng đặc sắc, lợp trần mui trần Targa tháo rời linh hoạt rực rỡ.',
    stock: 7,
    category: 'supercar',
    year: 2022,
    features: [
      'Bộ lazang mô phong năm chấu kép đính kèm heo phanh Ferrari đỏ',
      'Gầm sau bố trí tấm tản gió gầm siêu rỗng khí động học',
      'Sơn nung kim loại cao cấp màu đỏ mứt Cherry quyến rũ',
      'Mở được cửa bướm (Butterfly doors), nắp khoang hành lý, nắp khoang máy phía sau'
    ],
    rating: 5.0,
    reviewsCount: 16
  },
  {
    id: 'prod-012',
    name: 'Koenigsegg Jesko Attack Hypercar',
    brand: 'Koenigsegg',
    scale: '1:18',
    price: 3450000,
    discountPercentage: 10,
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&auto=format&fit=crop&q=80',
    description: 'Siêu phẩm Megacar phá kỷ lục tốc độ thế giới. Độ hoàn thiện siêu thực từ chất liệu composite sợi carbon cao cấp, cánh gió lực ép cực khủng, cửa mở xoay lật 90 độ lẫy lừng.',
    stock: 4,
    category: 'supercar',
    year: 2023,
    features: [
      'Cơ chế mở cửa xoay lật góc vuông Dihedral Synchro-Helix đặc biệt',
      'Động cơ V8 Twin-turbo mạ kền lộ thiên cực sắc sảo',
      'Hệ thống lái bánh sau thụ động chuyển động thực tế',
      'Hộp trưng bày bằng da lộn cao cấp có ghi biển tên đánh dấu số hiệu sản xuất'
    ],
    rating: 4.9,
    reviewsCount: 22
  },
  {
    id: 'prod-013',
    name: 'Bugatti Chiron Pur Sport Jet Black',
    brand: 'Bugatti',
    scale: '1:18',
    price: 2950000,
    discountPercentage: 18,
    imageUrl: 'https://images.unsplash.com/photo-1600706432502-75a0e2b42907?w=600&auto=format&fit=crop&q=80',
    description: 'Mô phỏng bản thiên hướng cảm giác lái Pur Sport của Bugatti Chiron. Toàn thân bọc màu đen mờ carbon huyền bí, lưới tản nhiệt hình móng ngựa in số 16 biểu trưng động cơ W16 huyền thoại.',
    stock: 6,
    category: 'supercar',
    year: 2021,
    features: [
      'Bộ lốp Bugatti Sport Cup 2 R Michelin in logo nhãn dán sắc sảo',
      'Đuôi pô titan xả đôi chế tác kim loại khói cổ pô cực ngầu',
      'Cánh gió cố định khổng lồ rộng 1.9m phủ bóng vân carbon',
      'Khoang lái lót sàn nhung tơ mịn tay, vô lăng bọc chất liệu sần'
    ],
    rating: 4.9,
    reviewsCount: 30
  },
  {
    id: 'prod-014',
    name: 'Land Rover Defender 110 Trophy',
    brand: 'Land Rover',
    scale: '1:24',
    price: 850000,
    discountPercentage: 15,
    imageUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600&auto=format&fit=crop&q=80',
    description: 'Chuyên gia địa hình việt dã đỉnh cao từ nước Anh. Bản độ Trophy tích hợp thang leo, giá nóc chở đồ dã ngoại thể thao bụi bặm, cản trước độ tời kéo cáp thép giả lập.',
    stock: 14,
    category: 'suv',
    year: 2022,
    features: [
      'Đi kèm xẻng cứu hộ, lốp dự phòng rời, bình xăng dự phóng và hộp đựng đồ dã ngoại gắn sườn',
      'Các cánh cửa có khớp đóng chắc chắn, đầm tay như xe nguyên bản',
      'Hệ thống giảm xóc hành trình dài, vượt các địa hình mấp mô nhỏ cực phê',
      'Khung thép gầm bảo vệ hộp số sơn nhũ bạc bền bỉ'
    ],
    rating: 4.8,
    reviewsCount: 25
  },
  {
    id: 'prod-015',
    name: 'Mazda RX-7 FD3S Spirit R Legend',
    brand: 'Mazda',
    scale: '1:24',
    price: 720000,
    discountPercentage: 12,
    imageUrl: 'https://images.unsplash.com/photo-1617469767053-d3b503a0b16c?w=600&auto=format&fit=crop&q=80',
    description: 'Mẫu xe động cơ xoay Rotary bất tử trong văn hoá JDM Nhật Bản thế kỷ 20. Bản nâng cấp cuối cùng Spirit R với màu sơn xám kim loại bóng mượt và mâm mạ vàng phong cách.',
    stock: 11,
    category: 'jdm',
    year: 2002,
    features: [
      'Hốc máy động cơ xoay Wankel 13B-REW danh tiếng lắp ráp tinh vi',
      'Đèn pha Pop-Up đóng mở êm ái bằng trượt lẫy gầm',
      'Hệ thống ghế thể thao RECARO đỏ sẫm đặc trưng nguyên bản',
      'Bộ ống xả đơn họng lớn mạ sáng loáng chuẩn phong cách Drift'
    ],
    rating: 5.0,
    reviewsCount: 67
  },
  {
    id: 'prod-016',
    name: 'Chevrolet Camaro ZL1 1LE Muscle',
    brand: 'Chevrolet',
    scale: '1:24',
    price: 780000,
    discountPercentage: 20,
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
    description: 'Quái thú cơ bắp Mỹ hầm hố nhất phân khúc với gói tính năng đường đua 1LE. Cánh gió sau bản lớn, líp chia gió trước sợi carbon và nắp động cơ sơn sần đen cực ngầu.',
    stock: 9,
    category: 'classic',
    year: 2019,
    features: [
      'Toàn bộ nắp ca-pô màu đen mờ tương phản thân xe cam nóng bỏng',
      'Kéo cót có gia tốc chạy vững chãi trên mặt phẳng',
      'Tích hợp còi âm thanh bóp lái khi ấn vô lăng',
      'Gương chiếu hậu chất liệu cao su dẻo tránh gãy rụng khi va chạm'
    ],
    rating: 4.8,
    reviewsCount: 19
  },
  {
    id: 'prod-017',
    name: 'Nissan GT-R R35 Nismo Beast',
    brand: 'Nissan',
    scale: '1:32',
    price: 430005,
    discountPercentage: 10,
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80',
    description: 'Vua quái vật đương đại của đất nước mặt trời mọc bản độ Nismo đỉnh chót. Chỉ viền đỏ quanh thân tạo nên nét hiếu chiến đặc sắc, nắp pô titan thể thao độc quyền.',
    stock: 18,
    category: 'jdm',
    year: 2020,
    features: [
      'Mở được 2 cửa trước và nắp máy, đèn pha thấu kính phát sáng',
      'Mâm Nismo đen nhám viền đỏ chỉ thể thao hầm hố',
      'Cơ chế pull-back trớn tự chạy mạnh mẽ mượt mà',
      'Sơn chống trầy chất lượng cực bền bỉ'
    ],
    rating: 4.9,
    reviewsCount: 88
  },
  {
    id: 'prod-018',
    name: 'BMW M4 CSL (G82) Carbon Edition',
    brand: 'BMW',
    scale: '1:32',
    price: 450000,
    discountPercentage: 15,
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=80',
    description: 'Phiên bản giới hạn trọng lượng nhẹ nhất dòng M4 Coupe. Nổi bật với mặt ca-lăng hình quả thận lớn viền chỉ đỏ, dải định vị ban ngày màu vàng độc tôn phong cách xe đua.',
    stock: 13,
    category: 'supercar',
    year: 2023,
    features: [
      'Thân vỏ đúc khuôn đầm tay, phủ bóng sơn mờ xám Frozen Grey sành điệu',
      'Internal bọc ghế đua thể thao rỗng lưng sau cá tính',
      'Đuôi vịt nắp cốp sau vuốt cao đúc liền khối nguyên mẫu',
      'Đèn pha vàng laser pha đêm sáng bừng'
    ],
    rating: 4.7,
    reviewsCount: 32
  },
  {
    id: 'prod-019',
    name: 'Jeep Wrangler Rubicon Open-Top',
    brand: 'Jeep',
    scale: '1:24',
    price: 820000,
    discountPercentage: 10,
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80',
    description: 'Biểu tượng phong trần vượt mọi nẻo đường của Mỹ. Mô hình mui trần mở hoàn toàn khoe trọn vẹn khung lồng bảo vệ gia cố thép chống lật cực hầm hố, sàn xe lót nhám chống trơn.',
    stock: 16,
    category: 'suv',
    year: 2020,
    features: [
      'Tặng kèm mô hình bình cứu hoả rời và lốp dự phòng gắn sau mở cốp',
      'Hệ thống giảm xóc độc lập hành trình gầm cực cao vượt dốc giả lập',
      'Kính chắn gió trước có khớp nối gập phẳng xuống nắp capo',
      'Cơ cấu kéo trớn chạy ổn định không lo lật xe'
    ],
    rating: 4.9,
    reviewsCount: 44
  },
  {
    id: 'prod-020',
    name: 'Toyota Century GRMN Emperor',
    brand: 'Toyota',
    scale: '1:18',
    price: 3800000,
    discountPercentage: 5,
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=605&auto=format&fit=crop&q=80',
    description: 'Mẫu xe siêu sang độc quyền hoàng gia Nhật Bản nâng cấp thể thao GRMN bởi Toyota Gazoo Racing. Thiết kế vuông vức uy nghiêm, logo phượng hoàng vàng đúc chế tác thủ công bằng tay siêu quý hiếm.',
    stock: 3,
    category: 'classic',
    year: 2019,
    features: [
      'Logo Chim phượng hoàng (Houou) điêu khắc cực nhỏ gắn lưới tản nhiệt cản trước',
      'Bốn cửa thiết kế kính không xương sang trọng kiểu Limousine quý tộc',
      'Rèm ren che nắng cửa sổ sau sơn decal dệt lụa siêu chân thực',
      'Nội thất lót dạ nỉ tuyết trắng sang trọng thanh lịch không tỳ vết'
    ],
    rating: 5.0,
    reviewsCount: 11
  }
];
