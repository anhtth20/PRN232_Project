export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0đ';
  
  // Format with dot as thousand separator and đ suffix
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};
