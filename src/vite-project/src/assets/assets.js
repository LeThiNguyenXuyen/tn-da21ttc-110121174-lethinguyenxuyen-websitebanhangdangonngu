import logo from './logo.jpg';
import search from './search.png';
import giohang from './giohang.png';
import image2 from './image2.png';
import image3 from './image3.jpg';
import image4 from './image4.jpg';
import image5 from './image5.jpg';
import image6 from './image6.jpg';
import image7 from './image 7.png';
import image1 from './image1-dior.jpg';
import image8 from './image8.jpg';
import image9 from './image9.jpg';
import image10 from './image10.jpg';
import image11 from './image11.jpg';
import image12 from './image12.jpg';
import image13 from './image13.jpg';
import image14 from './image14.jpg';
import image15 from './image15.jpg';
import image16 from './image16.jpg';
import image17 from './image17.jpg';
import image18 from './image18.jpg';
import image19 from './image 19.jpg';
import image20 from './image 20.jpg';
import image21 from './image 21.jpg';
import image22 from './image 22.jpg';
import add from './add.png';
import FB from './FB.png';
import cross from './cross.png';
import profile_icon from './profile_icon.png';
import bag_icon from './bag_icon.png';
import logout_icon from './logout_icon.png';
import vn_flag from './vn.png';
import en_flag from './en.png';
import fb_icon from './fb.jpg';
import ig_icon from './ig.jpg';
import stripeIcon from './stripe.png';
import payosIcon from './payos.png';
import codIcon from './cod.jpg';

export const assets = {
  logo,
  search,
  giohang,
  add,
  FB,
  cross,
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8,
  image9,
  image10,
  image11,
  image12,
  image13,
  image14,
  image15,
  image16,
  image17,
  image18,
  image19,
  image20,
  image21,
  image22,
  profile_icon,
  logout_icon,
  bag_icon,
  vn_flag,
  en_flag,
  fb_icon,
  ig_icon,
  stripe: stripeIcon,
  payos: payosIcon,
  cod: codIcon,
};

export const paymentIcons = {
  stripe: stripeIcon,
  payos: payosIcon,
  cod: codIcon
};


export const Product_list = [
  {
    _id: "1",
    brand:"Dolce & Gabbana",
    name: "Nước hoa Giorgio Armani Acqua Di Gio Profondo EDP",
    image: image2,
    price: 2990000,
    sizes: ["100ml"],
    description: "Hương biển tươi mát, sang trọng và nam tính đặc trưng của Giorgio Armani.",
    category: "Nam",
  },
  {
    _id: "2",
    name: "Nước hoa Dior Sauvage Parfum",
    brand: "DIOR",
    image: image1,
    price: 3450000,
    importPrice: 3300000,
    sizes: ["60ml","100ml", "120ml"],
    description: "Mùi hương mạnh mẽ, gợi cảm và hoang dã, phù hợp cho buổi tối.",
    category: "Nam",
  },
  {
    _id: "3",
    name: "Nước hoa Chanel Bleu De Chanel EDP",
    brand:"Gucci",
    image: image3,
    price: 3850000,
    importPrice: 3700000,
    sizes: ["50ml", "100ml"],
    description: "Biểu tượng mùi hương lịch lãm, hiện đại và đầy nam tính.",
    category: "Nam",
  },
  {
    _id: "4",
    name: "Nước hoa Gucci Bloom Eau De Parfum",
    brand:"Chanel",
    image: image4,
    price: 3100000,
    sizes: ["50ml", "100ml","150ml"],
    description: "Hương hoa trắng nhẹ nhàng, nữ tính và thanh lịch.",
    category: "Nữ",
  },
  {
    _id: "5",
    name: "Nước hoa Versace Eros Flame EDP",
    brand:"Versace",
    image: image5,
    price: 2950000,
    sizes: ["50ml", "100ml"],
    description: "Ngọt ngào, quyến rũ và tràn đầy năng lượng cho nam giới.",
    category: "Nam",
  },
  {
    _id: "6",
    name: "Nước hoa YSL Y Le Parfum",
    brand:"Versace",
    image: image6,
    price: 3650000,
    sizes: ["50ml", "100ml"],
    description: "Sự kết hợp của cam bergamot, gỗ tuyết tùng và oải hương tạo nên sự thu hút khó cưỡng.",
    category: "Unisex",
  },

 {
  _id: "8",
  name: "Nước hoa Nautica Voyage",
  brand:"Nautica",
  image: image8,
  price: 1250000,
  sizes: ["50ml", "100ml"],
  description: "Hương thơm tươi mát, trẻ trung với cảm hứng từ biển cả. Phù hợp cho nam giới năng động, sử dụng hàng ngày.",
  category: "Nam",
},
{
  _id: "9",
  name: "Nước hoa Afnan Supremacy Silver",
  brand:"Afnan",
  image: image9,
  price: 1850000,
  sizes: ["50ml", "100ml"],
  description: "Mùi hương nam tính, sang trọng và quyến rũ với sự pha trộn của hương gỗ và gia vị. Thích hợp cho các buổi tiệc hoặc môi trường chuyên nghiệp.",
  category: "Nam",
},

 {
    _id: "10",
    name: "Nước hoa Armaf Club De Nuit Woman",
    brand:"Armaf",
    image: image10,
    price: 950000,
    sizes: ["50ml", "100ml"],
    description: "Mùi hương ngọt ngào, quyến rũ và sang trọng, thích hợp cho những dịp đặc biệt.",
    category: "Nữ"
  },
  {
    _id: "11",
    name: "Nước hoa Davidoff Cool Water Woman",
    brand:"Davidoff",
    image: image11,
    price: 1150000,
    sizes: ["50ml", "100ml"],
    description: "Hương biển thanh mát, dịu nhẹ và tinh tế, mang lại cảm giác sảng khoái suốt cả ngày.",
    category: "Nữ"
  },
  {
    _id: "12",
    name: "Nước hoa Chloe Nomade EDP",
    brand:"Chloé",
    image: image12,
    price: 2550000,
    sizes: ["50ml", "75ml"],
    description: "Sự kết hợp giữa hương hoa và gỗ, tạo nên vẻ đẹp phóng khoáng và nữ tính.",
    category: "Nữ"
  },
  {
    _id: "13",
    name: "Nước hoa Gucci Bloom Ambrosia Di Fiori",
    brand:"Gucci",
    image: image13,
    price: 2750000,
    sizes: ["50ml", "100ml"],
    description: "Một bản hòa tấu của những loài hoa quý, mang lại vẻ đẹp kiêu sa và nổi bật.",
    category: "Nữ"
  },
  {
    _id: "14",
    name: "Nước hoa Gucci Flora Gorgeous Gardenia",
    brand:"Gucci",
    image: image14,
    price: 2450000,
    sizes: ["50ml", "100ml"],
    description: "Hương hoa ngọt ngào và tươi sáng, dành cho người phụ nữ dịu dàng và yêu đời.",
    category: "Nữ"
  },
  {
    _id: "15",
    name: "Nước hoa Lancome Miracle EDP",
    brand:"Lancôme",
    image: image15,
    price: 2350000,
    sizes: ["50ml", "100ml"],
    description: "Hương thơm nhẹ nhàng, tinh tế và thanh lịch, lý tưởng cho mọi hoàn cảnh.",
    category: "Nữ"
  },
  {
    _id: "16",
    name: "Nước hoa Chanel Chance Eau Fraiche",
    brand:"Chanel",
    image: image16,
    price: 2950000,
    sizes: ["50ml", "100ml"],
    description: "Sự tươi mới đầy sảng khoái và năng động, rất phù hợp với phong cách trẻ trung.",
    category: "Nữ"
  },

  {
    _id: "17",
    name: "YSL La Nuit De L’Homme",
    brand:"Yves Saint Laurent",
    image: image17,
    price: 2700000,
    sizes: ["60ml", "100ml"],
    description: "Hương thơm nam tính, sâu lắng và quyến rũ đặc trưng từ Yves Saint Laurent.",
    category: "Nam",
  },
  {
    _id: "18",
    name: "Le Labo Another 13",
    brand:"Le Labo",
    image: image18,
    price: 6200000,
    sizes: ["50ml", "100ml"],
    description: "Mùi hương độc đáo, hiện đại và trung tính. Phù hợp cho nam yêu thích phong cách riêng biệt.",
    category: "Nam",
  },

  {
    _id: "19",
    name: "Nước hoa Parfums de Marly Delina",
    brand:"Parfums De Marly",
    image: image19,
    price: 4250000,
    sizes: ["50ml", "75ml"],
    description: "Hương thơm sang trọng, nữ tính với sự kết hợp hoa cỏ và trái cây.",
    category: "Nữ",
  },
  {
    _id: "20",
    name: "Tom Ford Lost Cherry",
    brand:"Tom Ford",
    image: image20,
    price: 4750000,
    sizes: ["50ml", "100ml"],
    description: "Mùi hương ngọt ngào, quyến rũ từ quả cherry và hạnh nhân.",
    category: "Unisex",
  },
  {
    _id: "21",
    name: "Tom Ford Tobacco Vanille",
    brand:"Tom Ford",
    image: image21,
    price: 5200000, // giá sau khi giảm
  oldPrice: 5900000, // giá gốc
  discount: 12,      // phần trăm giảm
    sizes: ["50ml", "100ml"],
    description: "Sự kết hợp độc đáo giữa thuốc lá và vanilla, đậm đà và nam tính.",
    category: "Nam",
  },
  {
    _id: "22",
    name: "Armaf Club De Nuit Intense Man",
    brand:"Armaf",
    image: image22,
    price: 1350000,
    sizes: ["105ml"],
    description: "Hương thơm nam tính, mạnh mẽ, là bản dupe hoàn hảo của Creed Aventus.",
    category: "Nam",
  },
]

