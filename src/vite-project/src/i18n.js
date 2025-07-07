// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  vi: {
    translation: {
      // Navigation
      home: "Trang chủ",
      products: "Sản phẩm",
      news: "Tin tức",
      signIn: "Đăng nhập",
      logout: "Đăng xuất",
      cart: "Giỏ hàng",
      wishlist: "Yêu thích",
      ordersLabel: "Đơn hàng",

      search: "Tìm kiếm",
      nav: {
        contact: "Liên hệ"
      },

      //
      payment: {
        stripe: "Stripe",
        payos: "PayOS",
        cod: "COD",
      },

      // Product Categories
      menPerfume: "Nước hoa nam",
      womenPerfume: "Nước hoa nữ",
      promotions: "Khuyến mãi",
      allBrands: "Tất cả thương hiệu",
      clearFilters: "Xóa bộ lọc",
      showingProducts: "Hiển thị {{count}} sản phẩm",
      filtered: "(đã lọc)",

      //oder
      orders: {
        title: "Đơn hàng của tôi",
        subtitle: "Xem lại tất cả đơn hàng bạn đã đặt",
        filter: {
          all: "Tất cả",
          paid: "Đã thanh toán",
          processing: "Chờ xử lý",
          pending: "Chờ xử lý",      // Dùng "Đang xử lý" cho cả pending
          shipped: "Đang vận chuyển",
          delivered: "Đã giao hàng",
          cancelled: "Đã bị hủy"
        },
        noOrders: "Không có đơn hàng nào phù hợp",
        noOrdersHelp: "Hãy chọn trạng thái khác hoặc quay lại mua sắm nhé!",
        shopNow: "Mua sắm ngay"
      },

      // Oderdetail
      orderDetail: {
        loginRequired: "Vui lòng đăng nhập",
        loading: "Đang tải chi tiết đơn hàng...",
        notFound: "Không tìm thấy đơn hàng",
        backToList: "Quay lại danh sách đơn hàng",
        title: "Chi tiết đơn hàng #{{id}}",
        cancelOrder: "Hủy đơn hàng",
        cannotCancel: "ℹ️ Đơn hàng đã được gửi đi, không thể hủy",
        cancelSuccess: "Đơn hàng đã được hủy thành công",
        cancelSuccessWithRefund:
          "Đơn hàng đã được hủy thành công! Tiền sẽ được hoàn lại trong {{time}}.",
        cancelError: "Không thể hủy đơn hàng",
        infoTitle: "Thông tin đơn hàng",
        orderId: "Mã đơn hàng",
        orderDate: "Ngày đặt",
        status: "Trạng thái",
        paymentMethod: "Phương thức thanh toán",
        shippingTitle: "Địa chỉ giao hàng",
        itemsTitle: "Sản phẩm đã đặt",
        reviewBtn: "Đánh giá",
        reviewNote: "💡 Bạn có thể đánh giá sau khi nhận được hàng",
        reviewSuccess: "Đánh giá đã được gửi thành công",
        reviewError: "Không thể gửi đánh giá",
        summaryTitle: "Tổng kết đơn hàng",
        subtotal: "Tạm tính",
        shippingFee: "Phí vận chuyển",
        total: "Tổng cộng",
        refundTitle: "💰 Thông tin hoàn tiền",
        refundAmount: "Số tiền hoàn",
        refundStatus: "Trạng thái",
        refundTime: "Thời gian dự kiến",
        refundedAt: "Ngày hoàn tiền",
        cancelConfirmTitle: "Xác nhận hủy đơn hàng",
        cancelConfirmText: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
        yesCancel: "Có, hủy đơn hàng",
        no: "Không",
        reviewModalTitle: "Đánh giá sản phẩm: {{name}}",
        reviewLabel: "Đánh giá",
        reviewPlaceholder:
          "Chia sẻ trải nghiệm của bạn về sản phẩm...",
        tracking: {
          pending: "Chờ xử lý",
          processing: "Đơn hàng đã đặt",
          shipped: "Đang giao hàng",
          delivered: "Đã giao hàng",
        }
      },
      //contact
      contact: {
        title: "Liên hệ với chúng tôi",
        subtitle: "Chúng tôi luôn sẵn sàng hỗ trợ bạn qua các kênh liên lạc dưới đây!",
        methods: {
          zalo: {
            name: "Zalo",
            info: "0399796850",
            note: "Liên hệ qua Zalo"
          },
          email: {
            name: "Email",
            info: "lethinguyenxuyen2003@gmail.com",
            note: "Phản hồi trong 24h"
          },
          address: {
            name: "Địa chỉ",
            info: "Huyện Càng Long, Tỉnh Trà Vinh",
            note: "Mở cửa 9:00 - 21:00"
          }
        },
        social: {
          title: "Liên hệ qua mạng xã hội",
          subtitle: "Chọn kênh liên lạc phù hợp để được hỗ trợ nhanh chóng",
          facebook: {
            name: "Facebook",
            desc: "Nhắn tin trực tiếp qua Fanpage",
            btn: "Liên hệ Facebook",
            url: "https://www.facebook.com/nguyen.xuyen.369765"
          },
          instagram: {
            name: "Instagram",
            desc: "Theo dõi và nhắn tin qua Instagram",
            btn: "Liên hệ Instagram",
            url: "https://www.instagram.com/?hl=en"
          },
          zalo: {
            name: "Zalo",
            desc: "Chat trực tiếp qua Zalo",
            btn: "Liên hệ Zalo",
            url: "https://zalo.me/0399796850"
          }
        },
        faq: {
          title: "Câu hỏi thường gặp",
          items: {
            shipping: {
              q: "🚚 Chính sách giao hàng",
              a: "Miễn phí giao hàng cho đơn từ 500k. Giao hàng trong 1-3 ngày làm việc."
            },
            returns: {
              q: "🔄 Chính sách đổi trả",
              a: "Đổi trả trong 7 ngày nếu sản phẩm lỗi hoặc không đúng mô tả."
            },
            payment: {
              q: "💳 Phương thức thanh toán",
              a: "Hỗ trợ thanh toán qua Visa, Mastercard, MoMo, ZaloPay và COD."
            },
            promo: {
              q: "🎁 Chương trình khuyến mãi",
              a: "Cập nhật khuyến mãi mới nhất trên website và fanpage Facebook."
            }
          }
        }
      },


      // trong phần resources.vi.translation
      wishlistPage: {
        header: {
          title: "Danh sách yêu thích",
          subtitle: "Các sản phẩm bạn đã lưu để mua sau"
        },
        empty: {
          title: "Danh sách yêu thích trống",
          description: "Bạn chưa có sản phẩm yêu thích nào. Hãy khám phá và thêm những sản phẩm bạn thích!",
          shopNowBtn: "Khám phá sản phẩm"
        },
        stats: "{{count}} sản phẩm trong danh sách yêu thích",
        item: {
          addedDate: "Đã thêm: {{date}}",
          addToCartBtn: "🛒 Thêm vào giỏ",
          viewDetailBtn: "👁️ Xem chi tiết",
          removeTitle: "Xóa khỏi danh sách yêu thích"
        },
        actions: {
          addAllToCart: "🛒 Thêm tất cả vào giỏ hàng",
          addedAllToast: "Đã thêm {{count}} sản phẩm vào giỏ hàng"
        },
        loading: "Đang tải danh sách yêu thích...",
        item: {
          selectSize: "Chọn size",
          inStock: "Còn {{count}} sản phẩm",
          outOfStock: "Hết hàng",
          addedDate: "Đã thêm: {{date}}",
          addToCartBtn: "🛒 Thêm vào giỏ",
          viewDetailBtn: "👁️ Xem chi tiết",
          removeTitle: "Xóa khỏi danh sách yêu thích"
        }
      },



      // Product Details
      addToCart: "Thêm vào giỏ",
      buyNow: "Mua ngay",
      price: "Giá",
      originalPrice: "Giá gốc",
      discount: "Giảm giá",
      inStock: "Còn hàng",
      outOfStock: "Hết hàng",
      description: "Mô tả",
      reviews: "Đánh giá",
      capacity: "Dung tích",
      brand: "Thương hiệu",
      concentration: "Nồng độ",
      longevity: "Độ lưu mùi",
      sillage: "Độ tỏa hương",
      gender: "Giới tính",
      productInfo: "Thông tin sản phẩm",
      updating: "Đang cập nhật",
      moderate: "Vừa phải",
      hotlineConsult: "HOTLINE TƯ VẤN",
      businessHours: "(9:00 – 22:00)",
      // My oder


      // Cart
      cartEmpty: "Giỏ hàng trống",
      quantity: "Số lượng",
      total: "Tổng cộng",
      checkout: "Thanh toán",
      removeItem: "Xóa sản phẩm",
      cartOf: "Giỏ hàng của:",
      noItemsInCart: "Bạn chưa có sản phẩm nào trong giỏ hàng",
      //
      infoTitle: "Thông tin đơn hàng",
      shippingTitle: "Địa chỉ giao hàng",
      tracking: {
        pending: "Chờ xử lý",
        processing: "Đơn hàng đã đặt",
        shipped: "Đang giao hàng",
        delivered: "Đã giao hàng",
      },
      // Checkout
      shippingInfo: "Thông tin giao hàng",
      fullName: "Họ và tên",
      phone: "Số điện thoại",
      address: "Địa chỉ",
      city: "Thành phố",
      paymentMethod: "Phương thức thanh toán",
      placeOrder: "Đặt hàng",
      firstName: "Tên",
      lastName: "Họ",
      email: "Email",
      street: "Đường",
      state: "Tỉnh/Thành phố",
      zipcode: "Mã bưu điện",
      country: "Quốc gia",
      orderSummary: "Tổng đơn hàng",
      subtotal: "Tạm tính",
      shippingFee: "Phí vận chuyển",
      payWithStripe: "THANH TOÁN QUA STRIPE",
      "checkout.chooseAddress": "Chọn địa chỉ giao hàng:",
      "checkout.addNewAddress": "Thêm địa chỉ mới",
      "checkout.useThisAddress": "Chọn địa chỉ này",
      "payment.stripe": "Thanh toán qua Stripe",
      "payment.payos": "Thanh toán qua PayOS",
      "payment.cod": "Thanh toán khi nhận hàng (COD)",
      "checkout.placeOrder": "Đặt hàng",

      // Orders
      orderHistory: "Lịch sử đơn hàng",
      orderStatus: "Trạng thái",
      orderDate: "Ngày đặt",
      orderTotal: "Tổng tiền",
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      shipped: "Đã gửi",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
      paid: "Đã thanh toán",

      // Login/Register
      login: "Đăng nhập",
      register: "Đăng ký",
      signUp: "Sign Up",
      createAccount: "Create account",
      yourName: "Tên của bạn",
      password: "Mật khẩu",
      backToHome: "Quay về trang chủ",
      loginWithGoogle: "Đăng nhập với Google",
      agreeTerms: "Bằng cách tiếp tục bạn đồng ý với điều khoản sử dụng & chính sách bảo mật",
      noAccount: "Chưa có tài khoản?",
      haveAccount: "Đã có tài khoản?",
      registerSuccess: "Đăng ký thành công",
      brandSlogan: "Trải nghiệm hương thơm đẳng cấp, sang trọng và cá tính.",
      hello: "Xin chào!",

      // Common
      save: "Lưu",
      cancel: "Hủy",
      edit: "Sửa",
      delete: "Xóa",
      confirm: "Xác nhận",
      loading: "Đang tải...",
      error: "Lỗi",
      success: "Thành công",
      or: "HOẶC",
      loadingProduct: "Đang tải thông tin sản phẩm...",
      productNotFound: "Không tìm thấy sản phẩm với ID:",

      // Messages
      addedToCart: "Đã thêm vào giỏ hàng",
      addedToWishlist: "Đã thêm vào danh sách yêu thích",
      removedFromWishlist: "Đã xóa khỏi danh sách yêu thích",
      orderPlaced: "Đặt hàng thành công",
      loginRequired: "Vui lòng đăng nhập",
      hasPromotion: "Có khuyến mãi",
      promotion: "KM",

      // Footer
      aboutUs: "Về chúng tôi",
      customerService: "Chăm sóc khách hàng",
      followUs: "Theo dõi chúng tôi",
      allRightsReserved: "Bản quyền thuộc về",
      companyDescription: "Cửa hàng nước hoa cao cấp hàng đầu Việt Nam với hơn 200 thương hiệu nổi tiếng thế giới. Chúng tôi cam kết mang đến những sản phẩm chính hãng, chất lượng tốt nhất.",
      customerSupport: "Hỗ trợ khách hàng",
      hotline: "Hotline: 1900 1234",
      supportEmail: "Email: lethinguyenxuyen2003@gmail.com",
      workingHours: "8:00 - 22:00 (T2-CN)",
      returnPolicy: "Chính sách đổi trả",
      shippingPolicy: "Chính sách vận chuyển",
      quickLinks: "Liên kết nhanh",
      perfumeForMen: "Nước hoa nam",
      perfumeForWomen: "Nước hoa nữ",
      newArrivals: "Hàng mới về",
      bestSellers: "Bán chạy nhất",
      saleOffs: "Giảm giá",
      paymentMethods: "Phương thức thanh toán",
      copyright: "Tất cả quyền được bảo lưu.",
      termsOfUse: "Điều khoản sử dụng",
      privacyPolicy: "Chính sách bảo mật",
      sitemap: "Sitemap",

      // Wishlist
      wishlistEmpty: "Danh sách yêu thích trống",
      noWishlistItems: "Bạn chưa có sản phẩm nào trong danh sách yêu thích",
      addToWishlist: "Thêm vào yêu thích",
      removeFromWishlist: "Xóa khỏi yêu thích",

      // My Orders
      myOrders: "Đơn hàng của tôi",
      noOrders: "Bạn chưa có đơn hàng nào",
      orderDetails: "Chi tiết đơn hàng",
      viewOrder: "Xem đơn hàng",
      orderNumber: "Số đơn hàng",
      orderItems: "Sản phẩm",
      trackOrder: "Theo dõi đơn hàng",

      // Product Categories
      male: "Nam",
      female: "Nữ",
      unisex: "Unisex",

      // Search
      searchResults: "Kết quả tìm kiếm",
      noResults: "Không tìm thấy kết quả",
      searchPlaceholder: "Tìm kiếm sản phẩm...",

      // Filters
      filterBy: "Lọc theo",
      sortBy: "Sắp xếp theo",
      priceRange: "Khoảng giá",
      resetFilters: "Đặt lại bộ lọc",

      // Additional common phrases
      viewDetails: "Xem chi tiết",
      backToProducts: "Quay lại sản phẩm",
      continueShopping: "Tiếp tục mua sắm",
      proceedToCheckout: "Tiến hành thanh toán",
      updateQuantity: "Cập nhật số lượng",
      removeFromCart: "Xóa khỏi giỏ hàng",
      selectSize: "Chọn kích thước",
      outOfStock: "Hết hàng",
      inStock: "Còn hàng",
      freeShipping: "Miễn phí vận chuyển",
      fastDelivery: "Giao hàng nhanh",

      "wishlistButton": "Yêu thích",



      // Product Names
      "Nước hoa Giorgio Armani Acqua Di Gio Profondo EDP": "Nước hoa Giorgio Armani Acqua Di Gio Profondo EDP",
      "Nước hoa Dior Sauvage Parfum": "Nước hoa Dior Sauvage Parfum",
      "Nước hoa Chanel Bleu De Chanel EDP": "Nước hoa Chanel Bleu De Chanel EDP",
      "Nước hoa Gucci Bloom Eau De Parfum": "Nước hoa Gucci Bloom Eau De Parfum",
      "Nước hoa Versace Eros Flame EDP": "Nước hoa Versace Eros Flame EDP",
      "Nước hoa YSL Y Le Parfum": "Nước hoa YSL Y Le Parfum",
      "Nước hoa Nautica Voyage": "Nước hoa Nautica Voyage",
      "Nước hoa Afnan Supremacy Silver": "Nước hoa Afnan Supremacy Silver",
      "Nước hoa Armaf Club De Nuit Woman": "Nước hoa Armaf Club De Nuit Woman",
      "Nước hoa Davidoff Cool Water Woman": "Nước hoa Davidoff Cool Water Woman",
      "Nước hoa Chloe Nomade EDP": "Nước hoa Chloe Nomade EDP",
      "Nước hoa Gucci Bloom Ambrosia Di Fiori": "Nước hoa Gucci Bloom Ambrosia Di Fiori",
      "Nước hoa Gucci Flora Gorgeous Gardenia": "Nước hoa Gucci Flora Gorgeous Gardenia",
      "Nước hoa Lancome Miracle EDP": "Nước hoa Lancome Miracle EDP",
      "Nước hoa Chanel Chance Eau Fraiche": "Nước hoa Chanel Chance Eau Fraiche",
      "YSL La Nuit De L'Homme": "YSL La Nuit De L'Homme",
      "Le Labo Another 13": "Le Labo Another 13",
      "Nước hoa Parfums de Marly Delina": "Nước hoa Parfums de Marly Delina",
      "Tom Ford Lost Cherry": "Tom Ford Lost Cherry",
      "Tom Ford Tobacco Vanille": "Tom Ford Tobacco Vanille",
      "Armaf Club De Nuit Intense Man": "Armaf Club De Nuit Intense Man",

      // Trong resources.vi.translation
      "Sự tươi mới đầy sảng khoái và năng động, rất phù hợp với phong cách trẻ trung":
        "Sự tươi mới đầy sảng khoái và năng động, rất phù hợp với phong cách trẻ trung",

      // Product Descriptions
      "Hương thơm nhẹ nhàng, tinh tế và thanh lịch, lý tưởng cho mọi hoàn cảnh":
        "Hương thơm nhẹ nhàng, tinh tế và thanh lịch, lý tưởng cho mọi hoàn cảnh",
      //
      productDescriptions: {
        yslSignature: "Hương thơm nam tính, sâu lắng và quyến rũ đặc trưng từ Yves Saint Laurent"
      },

      // Categories
      "Nước hoa nam": "Nước hoa nam",
      "Nước hoa nữ": "Nước hoa nữ",
      "Nam": "Nam",
      "Nữ": "Nữ",
      "Unisex": "Unisex",



      // --- ReviewSection translations ---
      "review.loading": "Đang tải đánh giá...",
      "review.title": "Đánh giá sản phẩm",
      "review.none": "Chưa có đánh giá nào",
      "review.first": "Hãy là người đầu tiên đánh giá sản phẩm này sau khi mua hàng!",
      "review.count": "đánh giá",
      "review.customers": "Nhận xét từ khách hàng",
      "review.customer": "Khách hàng",
      "review.reply": "Phản hồi từ quản trị viên",
      "review.verified": "Đã mua hàng",
      "review.showMore": "Xem thêm {{count}} đánh giá",
      "review.showLess": "Thu gọn",

      "wishlist.loginRequired": "Vui lòng đăng nhập để sử dụng danh sách yêu thích",
      "wishlist.add": "Yêu thích",
      "wishlist.added": "Đã yêu thích",
      "wishlist.remove": "Xóa khỏi yêu thích",
      "wishlist.addSuccess": "Đã thêm vào danh sách yêu thích",
      "wishlist.removeSuccess": "Đã xóa khỏi danh sách yêu thích",
      "wishlist.error": "Có lỗi xảy ra",

      "cart.stockLeft": "Còn lại: {{count}}",
      promotionList: {
        header: "🎉 Khuyến Mãi Đang Diễn Ra",
        subheader: "Khám phá những ưu đãi hấp dẫn dành riêng cho bạn",
        loading: "Đang tải khuyến mãi...",
        errorTitle: "Có lỗi xảy ra",
        error: "Không thể tải danh sách khuyến mãi",
        retry: "Thử lại",
        emptyTitle: "Hiện tại chưa có khuyến mãi nào",
        emptyDesc: "Hãy quay lại sau để không bỏ lỡ những ưu đãi hấp dẫn!",
        backToHome: "Về trang chủ",
        expiringSoon: "⏰ Sắp hết hạn",
        type: {
          percentage: "Giảm theo phần trăm",
          fixed: "Giảm số tiền cố định",
          "buy-x-get-y": "Mua X tặng Y",
          "order-discount": "Giảm giá đơn hàng",
          special: "Khuyến mãi đặc biệt"
        },
        discount: {
          percentage: "Giảm {{value}}%",
          fixed: "Giảm {{value}}đ",
          buyxgety: "Mua 1 tặng 1",
          order: "Giảm {{value}}đ cho đơn hàng",
          special: "Ưu đãi đặc biệt"
        },
        minOrder: "Đơn tối thiểu:",
        from: "Từ:",
        to: "Đến:",
        applicable: "Sản phẩm áp dụng:",
        more: "+{{count}} sản phẩm khác",
        shopNow: "Mua ngay"
      },
      shopNow: "Mua ngay",

      "forgotPassword": "Quên mật khẩu?"

    },
  },
  en: {

    translation: {
      // Navigation
      home: "Home",
      products: "Products",
      news: "News",
      signIn: "Sign In",
      logout: "Logout",
      cart: "Cart",
      wishlist: "Wishlist",

      contact: "Contact",
      search: "Search",
      "forgotPassword": "Forgot password?",
      //
      orders: {
        title: "My Orders",
        subtitle: "Review all the orders you’ve placed",
        filter: {
          all: "All",
          paid: "Paid",
          processing: "Processing",
          pending: "Processing",
          shipped: "Shipped",
          delivered: "Delivered",
          cancelled: "Cancelled",
        },
        noOrders: "No matching orders",
        noOrdersHelp: "Try another filter or go shopping!",
        shopNow: "Shop Now",
        orderNumber: "Order",
        orderDate: "Date",
        left: "Left",
        payment: "Payment via",
        // ... các key khác nếu dùng
      },
      payment: {
        stripe: "Pay with Stripe",
        payos: "Pay with PayOS",
        cod: "Cash on Delivery (COD)"
      },
      wishlist: "Wishlist",

      wishlistPage: {
        header: {
          title: "Wishlist",
          subtitle: "Items you’ve saved for later"
        },
        empty: {
          title: "Your wishlist is empty",
          description: "You have no wishlist items yet. Discover and add products you love!",
          shopNowBtn: "Shop products"
        },
        stats: "{{count}} items in your wishlist",
        item: {
          addedDate: "Added: {{date}}",
          addToCartBtn: "🛒 Add to cart",
          viewDetailBtn: "👁️ View details",
          removeTitle: "Remove from wishlist"
        },
        actions: {
          addAllToCart: "🛒 Add all to cart",
          addedAllToast: "Added {{count}} items to your cart"
        },
        loading: "Loading wishlist...",
        item: {
          selectSize: "Select size",
          inStock: "{{count}} items left",
          outOfStock: "Out of stock",
          addedDate: "Added: {{date}}",
          addToCartBtn: "🛒 Add to cart",
          viewDetailBtn: "👁️ View details",
          removeTitle: "Remove from wishlist"
        }
      },

      nav: {
        contact: "Contact"
      },
      // contact
      contact: {
        title: "Contact Us",
        subtitle: "We’re here to help you—reach us any time through:",
        methods: {
          zalo: {
            name: "Zalo",
            info: "0399796850",
            note: "Contact via Zalo"
          },
          email: {
            name: "Email",
            info: "lethinguyenxuyen2003@gmail.com",
            note: "Response within 24h"
          },
          address: {
            name: "Address",
            info: "Cang Long District, Tra Vinh Province",
            note: "Open 9:00 – 21:00"
          }
        },
        social: {
          title: "Social Channels",
          subtitle: "Pick one to get fast support:",
          facebook: {
            name: "Facebook",
            desc: "Message our Fanpage",
            btn: "Contact Facebook",
            url: "https://www.facebook.com/nguyen.xuyen.369765"
          },
          instagram: {
            name: "Instagram",
            desc: "Follow & message us on Instagram",
            btn: "Contact Instagram",
            url: "https://www.instagram.com/?hl=en"
          },
          zalo: {
            name: "Zalo",
            desc: "Chat on Zalo",
            btn: "Contact Zalo",
            url: "https://zalo.me/0399796850"
          }
        },
        faq: {
          title: "FAQ",
          items: {
            shipping: {
              q: "🚚 Shipping Policy",
              a: "Free shipping for orders over 500k. Delivered within 1–3 business days."
            },
            returns: {
              q: "🔄 Return Policy",
              a: "Returns within 7 days for defective or misdescribed items."
            },
            payment: {
              q: "💳 Payment Methods",
              a: "Visa, Mastercard, MoMo, ZaloPay and COD supported."
            },
            promo: {
              q: "🎁 Promotions",
              a: "Latest deals on our website and Facebook page."
            }
          }
        }
      },
      // trong resources.en.translation
      productDescriptions: {
        yslSignature: "A masculine, deep and seductive signature scent from Yves Saint Laurent"
      },



      // oderdetail
      // Tại resources.en.translation:
      orderDetail: {
        loginRequired: "Please login",
        loading: "Loading order details...",
        notFound: "Order not found",
        backToList: "Back to orders",
        title: "Order Details #{{id}}",
        cancelOrder: "Cancel Order",
        cannotCancel: "ℹ️ This order has already shipped and cannot be cancelled",
        cancelSuccess: "Your order has been cancelled",
        cancelSuccessWithRefund: "Your order has been cancelled! Refund will arrive in {{time}}.",
        cancelError: "Unable to cancel order",
        infoTitle: "Order Information",
        orderId: "Order ID",
        orderDate: "Order Date",
        status: "Status",
        paymentMethod: "Payment Method",
        shippingTitle: "Shipping Address",
        itemsTitle: "Ordered Items",
        reviewBtn: "Write Review",
        reviewNote: "💡 You can review after delivery",
        reviewSuccess: "Review submitted successfully",
        reviewError: "Unable to submit review",
        submitReview: "Submit Review",
        summaryTitle: "Order Summary",
        subtotal: "Subtotal",
        shippingFee: "Shipping Fee",
        total: "Total",
        refundTitle: "💰 Refund Information",
        refundAmount: "Refund Amount",
        refundStatus: "Status",
        refundTime: "Estimated Time",
        refundedAt: "Refunded At",
        cancelConfirmTitle: "Confirm Cancellation",
        cancelConfirmText: "Are you sure you want to cancel this order?",
        yesCancel: "Yes, cancel order",
        no: "No",
        reviewModalTitle: "Review: {{name}}",
        reviewLabel: "Rating",
        reviewPlaceholder: "Share your experience with this product...",
        tracking: {
          pending: "Pending",
          processing: "Order Placed",
          shipped: "Shipped",
          delivered: "Delivered"
        }
      },

      // Product Categories
      menPerfume: "Men's Perfume",
      womenPerfume: "Women's Perfume",
      promotions: "Promotions",
      allBrands: "All Brands",
      clearFilters: "Clear Filters",
      showingProducts: "Showing {{count}} products",
      filtered: "(filtered)",

      // Product Details
      addToCart: "Add to Cart",
      buyNow: "Buy Now",
      price: "Price",
      originalPrice: "Original Price",
      discount: "Discount",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      description: "Description",
      reviews: "Reviews",
      capacity: "Capacity",
      brand: "Brand",
      concentration: "Concentration",
      longevity: "Longevity",
      sillage: "Sillage",
      gender: "Gender",
      productInfo: "Product Information",
      updating: "Updating",
      moderate: "Moderate",
      hotlineConsult: "CONSULTATION HOTLINE",
      businessHours: "(9:00 – 22:00)",

      // Cart
      cartEmpty: "Cart is empty",
      quantity: "Quantity",
      total: "Total",
      checkout: "Checkout",
      removeItem: "Remove Item",
      cartOf: "Cart of:",
      noItemsInCart: "You have no items in your cart",

      // Checkout
      shippingInfo: "Shipping Information",
      fullName: "Full Name",
      phone: "Phone Number",
      address: "Address",
      city: "City",
      paymentMethod: "Payment Method",
      placeOrder: "Place Order",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      street: "Street",
      state: "State",
      zipcode: "Zip Code",
      country: "Country",
      orderSummary: "Order Summary",
      subtotal: "Subtotal",
      shippingFee: "Shipping Fee",
      payWithStripe: "PAY WITH STRIPE",
      "checkout.chooseAddress": "📍 Select shipping address:",
      "checkout.addNewAddress": "Add new address",
      "checkout.useThisAddress": "Use this address",
      "payment.stripe": "Pay with Stripe",
      "payment.payos": "Pay with PayOS",
      "payment.cod": "Cash on Delivery (COD)",
      "checkout.placeOrder": "Place Order",

      // Orders
      orderHistory: "Order History",
      orderStatus: "Status",
      orderDate: "Order Date",
      orderTotal: "Total Amount",
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      paid: "Paid",

      // Login/Register
      login: "Login",
      register: "Register",
      signUp: "Sign Up",
      createAccount: "Create account",
      yourName: "Your name",
      password: "Password",
      backToHome: "Back to Home",
      loginWithGoogle: "Login with Google",
      agreeTerms: "By continuing you agree to our terms of use & privacy policy",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      registerSuccess: "Registration successful",
      brandSlogan: "Experience premium, luxurious and personalized fragrances.",
      hello: "Hello!",

      // Common
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      confirm: "Confirm",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      or: "OR",
      loadingProduct: "Loading product information...",
      productNotFound: "Product not found with ID:",

      // Messages
      addedToCart: "Added to cart",
      addedToWishlist: "Added to wishlist",
      removedFromWishlist: "Removed from wishlist",
      orderPlaced: "Order placed successfully",
      loginRequired: "Please login",
      hasPromotion: "With Promotion",
      promotion: "PROMO",

      // Footer
      aboutUs: "About Us",
      customerService: "Customer Service",
      followUs: "Follow Us",
      allRightsReserved: "All rights reserved",
      companyDescription: "Vietnam's leading premium perfume store with over 200 world-famous brands. We are committed to bringing you authentic products of the highest quality.",
      customerSupport: "Customer Support",
      hotline: "Hotline: 1900 1234",
      supportEmail: "Email: lethinguyenxuyen2003@gmail.com",
      workingHours: "8:00 - 22:00 (Mon-Sun)",
      returnPolicy: "Return Policy",
      shippingPolicy: "Shipping Policy",
      quickLinks: "Quick Links",
      perfumeForMen: "Men's Perfume",
      perfumeForWomen: "Women's Perfume",
      newArrivals: "New Arrivals",
      bestSellers: "Best Sellers",
      saleOffs: "Sale",
      paymentMethods: "Payment Methods",
      copyright: "All rights reserved.",
      termsOfUse: "Terms of Use",
      privacyPolicy: "Privacy Policy",
      sitemap: "Sitemap",

      // Wishlist
      wishlistEmpty: "Wishlist is empty",
      noWishlistItems: "You have no items in your wishlist",
      addToWishlist: "Add to Wishlist",
      removeFromWishlist: "Remove from Wishlist",

      // My Orders
      myOrders: "My Orders",
      noOrders: "You have no orders yet",
      orderDetails: "Order Details",
      viewOrder: "View Order",
      orderNumber: "Order Number",
      orderItems: "Items",
      trackOrder: "Track Order",

      // Product Categories
      male: "Male",
      female: "Female",
      unisex: "Unisex",

      // Search
      searchResults: "Search Results",
      noResults: "No results found",
      searchPlaceholder: "Search products...",

      // Filters
      filterBy: "Filter by",
      sortBy: "Sort by",
      priceRange: "Price Range",
      resetFilters: "Reset Filters",

      // Additional common phrases
      viewDetails: "View Details",
      backToProducts: "Back to Products",
      continueShopping: "Continue Shopping",
      proceedToCheckout: "Proceed to Checkout",
      updateQuantity: "Update Quantity",
      removeFromCart: "Remove from Cart",
      selectSize: "Select Size",
      outOfStock: "Out of Stock",
      inStock: "In Stock",
      freeShipping: "Free Shipping",
      fastDelivery: "Fast Delivery",

      "wishlistButton": "Favorite",

      // Product Names (English translations)
      "Nước hoa Giorgio Armani Acqua Di Gio Profondo EDP": "Giorgio Armani Acqua Di Gio Profondo EDP",
      "Nước hoa Dior Sauvage Parfum": "Dior Sauvage Parfum",
      "Nước hoa Chanel Bleu De Chanel EDP": "Chanel Bleu De Chanel EDP",
      "Nước hoa Gucci Bloom Eau De Parfum": "Gucci Bloom Eau De Parfum",
      "Nước hoa Versace Eros Flame EDP": "Versace Eros Flame EDP",
      "Nước hoa YSL Y Le Parfum": "YSL Y Le Parfum",
      "Nước hoa Nautica Voyage": "Nautica Voyage",
      "Nước hoa Afnan Supremacy Silver": "Afnan Supremacy Silver",
      "Nước hoa Armaf Club De Nuit Woman": "Armaf Club De Nuit Woman",
      "Nước hoa Davidoff Cool Water Woman": "Davidoff Cool Water Woman",
      "Nước hoa Chloe Nomade EDP": "Chloe Nomade EDP",
      "Nước hoa Gucci Bloom Ambrosia Di Fiori": "Gucci Bloom Ambrosia Di Fiori",
      "Nước hoa Gucci Flora Gorgeous Gardenia": "Gucci Flora Gorgeous Gardenia",
      "Nước hoa Lancome Miracle EDP": "Lancome Miracle EDP",
      "Nước hoa Chanel Chance Eau Fraiche": "Chanel Chance Eau Fraiche",
      "YSL La Nuit De L'Homme": "YSL La Nuit De L'Homme",
      "Le Labo Another 13": "Le Labo Another 13",
      "Nước hoa Parfums de Marly Delina": "Parfums de Marly Delina",
      "Tom Ford Lost Cherry": "Tom Ford Lost Cherry",
      "Tom Ford Tobacco Vanille": "Tom Ford Tobacco Vanille",
      "Armaf Club De Nuit Intense Man": "Armaf Club De Nuit Intense Man",

      // Product Descriptions (English translations)
      "Hương biển tươi mát, sang trọng và nam tính đặc trưng của Giorgio Armani.": "Fresh ocean scent, luxurious and masculine signature of Giorgio Armani.",
      "Mùi hương mạnh mẽ, gợi cảm và hoang dã, phù hợp cho buổi tối.": "Strong, sensual and wild fragrance, perfect for evening wear.",
      "Biểu tượng mùi hương lịch lãm, hiện đại và đầy nam tính.": "Iconic fragrance that's elegant, modern and masculine.",
      "Hương hoa trắng nhẹ nhàng, nữ tính và thanh lịch.": "Gentle white floral scent, feminine and elegant.",
      "Ngọt ngào, quyến rũ và tràn đầy năng lượng cho nam giới.": "Sweet, seductive and energetic fragrance for men.",
      "Sự kết hợp của cam bergamot, gỗ tuyết tùng và oải hương tạo nên sự thu hút khó cưỡng.": "The combination of bergamot, cedar wood and lavender creates an irresistible attraction.",
      "Hương thơm nhẹ nhàng, tinh tế và thanh lịch, lý tưởng cho mọi hoàn cảnh":
        "A gentle, refined, and elegant fragrance ideal for any occasion",
      // --- Các mô tả nước hoa ---
      "Hương biển tươi mát, sang trọng và nam tính đặc trưng của Giorgio Armani": "Fresh oceanic fragrance that is luxurious and masculine—signature of Giorgio Armani.",
      "Mùi hương mạnh mẽ, gợi cảm và hoang dã, phù hợp cho buổi tối.": "A powerful, sensual and wild scent, perfect for evening wear.",
      "Biểu tượng mùi hương lịch lãm, hiện đại và đầy nam tính": "An iconic fragrance that is elegant, modern and masculine.",
      "Hương hoa trắng nhẹ nhàng, nữ tính và thanh lịch": "A gentle, feminine and elegant white floral scent.",
      "Ngọt ngào, quyến rũ và tràn đầy năng lượng cho nam giới": "Sweet, seductive and full of energy for men.",
      "Sự kết hợp của cam bergamot, gỗ tuyết tùng và oải hương tạo nên sự thu hút khó cưỡng.": "A blend of bergamot, cedarwood and lavender that creates an irresistible attraction.",
      "Hương thơm tươi mát, trẻ trung với cảm hứng từ biển cả. Phù hợp cho nam giới năng động, sử dụng hàng ngày": "A fresh, youthful fragrance inspired by the sea—ideal for the active man and everyday wear.",
      "Mùi hương nam tính, sang trọng và quyến rũ với sự pha trộn của hương gỗ và gia vị. Thích hợp cho các buổi tiệc hoặc môi trường chuyên nghiệp.": "A masculine, luxurious and alluring scent with a blend of woods and spices—perfect for parties or a professional setting.",
      "Mùi hương ngọt ngào, quyến rũ và sang trọng, thích hợp cho những dịp đặc biệt": "A sweet, seductive and sophisticated fragrance—suitable for special occasions.",
      "Hương biển thanh mát, dịu nhẹ và tinh tế, mang lại cảm giác sảng khoái suốt cả ngày": "A crisp, gentle and refined marine scent that provides refreshing comfort all day long.",
      "Sự kết hợp giữa hương hoa và gỗ, tạo nên vẻ đẹp phóng khoáng và nữ tính.": "A fusion of floral and woody notes—creating a free-spirited and feminine aura.",
      "Trong trường hợp lặp lại cùng mô tả trên cho hai sản phẩm, bạn có thể dùng chung key này": "A fusion of floral and woody notes—creating a free-spirited and feminine aura.",
      "Một bản hòa tấu của những loài hoa quý, mang lại vẻ đẹp kiêu sa và nổi bật.": "A symphony of precious blooms, delivering a magnificent and standout beauty.",
      "Hương hoa ngọt ngào và tươi sáng, dành cho người phụ nữ dịu dàng và yêu đời": "A sweet and vibrant floral scent—for the gentle and joyful woman.",
      // Trong resources.en.translation 
      "Sự tươi mới đầy sảng khoái và năng động, rất phù hợp với phong cách trẻ trung":
        "A refreshing and energetic sensation, perfectly suited for a youthful and dynamic style",

      // --- Các chuỗi giao diện Đánh giá & Yêu thích ---
      "Đánh giá sản phẩm": "Product Reviews",
      "Chưa có đánh giá nào": "No reviews yet",
      "Hãy là người đầu tiên đánh giá sản phẩm này sau khi mua hàng!": "Be the first to review this product after your purchase!",
      "Yêu thích": "Favorite",


      // Categories (English translations)
      "Nước hoa nam": "Men's Perfume",
      "Nước hoa nữ": "Women's Perfume",
      "Nam": "Men",
      "Nữ": "Women",
      "Unisex": "Unisex",

      // --- ReviewSection translations ---
      "review.loading": "Loading reviews...",
      "review.title": "Product Reviews",
      "review.none": "No reviews yet",
      "review.first": "Be the first to review this product after your purchase!",
      "review.count": "reviews",
      "review.customers": "Customer Reviews",
      "review.customer": "Customer",
      "review.reply": "Admin reply",
      "review.verified": "Verified Purchase",
      "review.showMore": "View {{count}} more review",
      "review.showLess": "Show less",

      "wishlist.loginRequired": "Please login to use the wishlist",
      "wishlist.add": "Add to Wishlist",
      "wishlist.added": "In Wishlist",
      "wishlist.remove": "Remove from Wishlist",
      "wishlist.addSuccess": "Added to wishlist",
      "wishlist.removeSuccess": "Removed from wishlist",
      "wishlist.error": "An error occurred",

      "cart.stockLeft": "Left: {{count}}",

      promotionList: {
        header: "🎉 Ongoing Promotions",
        subheader: "Discover exciting offers made just for you",
        loading: "Loading promotions...",
        errorTitle: "An error occurred",
        error: "Unable to load promotions",
        retry: "Retry",
        emptyTitle: "No promotions available",
        emptyDesc: "Please check back later so you don’t miss out on great deals!",
        backToHome: "Back to Home",
        expiringSoon: "⏰ Expiring soon",
        type: {
          percentage: "Percentage discount",
          fixed: "Fixed amount discount",
          "buy-x-get-y": "Buy X get Y",
          "order-discount": "Order discount",
          special: "Special promotion"
        },
        discount: {
          percentage: "Discount {{value}}%",
          fixed: "Discount {{value}}đ",
          buyxgety: "Buy 1 get 1",
          order: "Discount {{value}}đ for order",
          special: "Special offer"
        },
        minOrder: "Min order:",
        from: "From:",
        to: "To:",
        applicable: "Applicable products:",
        more: "+{{count}} more products",
        shopNow: "Shop now"
      }

    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vi', // ngôn ngữ mặc định
    fallbackLng: 'en',


    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
