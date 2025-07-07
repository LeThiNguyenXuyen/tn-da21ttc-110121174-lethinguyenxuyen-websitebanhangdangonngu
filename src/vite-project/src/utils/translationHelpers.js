// utils/translationHelpers.js
import { useTranslation } from 'react-i18next';

// Auto-translation rules for product names
const autoTranslateProductName = (name) => {
  if (!name) return name;

  let translated = name;

  // Remove "Nước hoa" prefix and translate brand names
  translated = translated.replace(/^Nước hoa\s+/, '');

  // Keep brand names as is (they're usually in English already)
  // Just clean up the format

  return translated;
};

// Auto-translation rules for descriptions
const autoTranslateDescription = (description) => {
  if (!description) return "No description";

  const translations = {
    'Hương biển tươi mát, sang trọng và nam tính đặc trưng của Giorgio Armani.': 'Fresh ocean scent, luxurious and masculine signature of Giorgio Armani.',
    'Mùi hương mạnh mẽ, gợi cảm và hoang dã, phù hợp cho buổi tối.': 'Strong, sensual and wild fragrance, perfect for evening wear.',
    'Biểu tượng mùi hương lịch lãm, hiện đại và đầy nam tính.': 'Iconic fragrance that\'s elegant, modern and masculine.',
    'Hương hoa trắng nhẹ nhàng, nữ tính và thanh lịch.': 'Gentle white floral scent, feminine and elegant.',
    'Ngọt ngào, quyến rũ và tràn đầy năng lượng cho nam giới.': 'Sweet, seductive and energetic fragrance for men.',
    'Sự kết hợp của cam bergamot, gỗ tuyết tùng và oải hương tạo nên sự thu hút khó cưỡng.': 'The combination of bergamot, cedar wood and lavender creates an irresistible attraction.'
  };

  // Check for exact match first
  if (translations[description]) {
    return translations[description];
  }

  // Auto-translate common words
  let translated = description;
  translated = translated.replace(/hương/gi, 'fragrance');
  translated = translated.replace(/mùi hương/gi, 'scent');
  translated = translated.replace(/nam tính/gi, 'masculine');
  translated = translated.replace(/nữ tính/gi, 'feminine');
  translated = translated.replace(/sang trọng/gi, 'luxurious');
  translated = translated.replace(/tươi mát/gi, 'fresh');
  translated = translated.replace(/quyến rũ/gi, 'seductive');
  translated = translated.replace(/thanh lịch/gi, 'elegant');

  return translated;
};

// Hook để load translations từ database - DISABLED
export const useDbTranslations = () => {
  // Translation API removed - return empty translations
  return { dbTranslations: {}, loading: false };
};

// Helper function để dịch tên sản phẩm
export const useProductTranslation = () => {
  const { t, i18n } = useTranslation();
  const { dbTranslations } = useDbTranslations();

  const translateProductName = (name) => {
    if (i18n.language === 'vi') {
      return name; // Trả về tên gốc nếu là tiếng Việt
    }

    // Kiểm tra database translation trước
    if (dbTranslations[name]) {
      return dbTranslations[name];
    }

    // Kiểm tra i18n translation
    const manualTranslation = t(name);
    if (manualTranslation !== name) {
      return manualTranslation;
    }

    // Cuối cùng sử dụng auto-translation
    return autoTranslateProductName(name);
  };

  const translateProductDescription = (description) => {
    if (!description) {
      return i18n.language === 'vi' ? "Chưa có mô tả" : "No description";
    }

    if (i18n.language === 'vi') {
      return description; // Trả về mô tả gốc nếu là tiếng Việt
    }

    // Kiểm tra database translation trước
    if (dbTranslations[description]) {
      return dbTranslations[description];
    }

    // Kiểm tra i18n translation
    const manualTranslation = t(description);
    if (manualTranslation !== description) {
      return manualTranslation;
    }

    // Cuối cùng sử dụng auto-translation
    return autoTranslateDescription(description);
  };

  const translateCategory = (category) => {
    if (i18n.language === 'vi') {
      return category; // Trả về category gốc nếu là tiếng Việt
    }
    // Nếu là tiếng Anh, tìm bản dịch
    return t(category) !== category ? t(category) : category;
  };

  return {
    translateProductName,
    translateProductDescription,
    translateCategory
  };
};
