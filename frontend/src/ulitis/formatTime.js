/**
 * So sánh 2 chuỗi ISO và trả về thời gian tương đối bằng tiếng Việt
 * @param {string} targetIso - Chuỗi ISO của mốc thời gian cần hiển thị (ví dụ: thời gian bài viết)
 * @param {string} [baseIso] - Chuỗi ISO mốc so sánh (mặc định là thời gian hiện tại)
 * @returns {string} Ví dụ: "1 giờ trước", "vài giây trước", "sau 2 ngày"
 */
export default function formatRelativeTime(targetIso, baseIso = new Date().toISOString()) {
  const target = new Date(targetIso);
  const base = new Date(baseIso);

  // Thoi gian khong hop le (khong phai ISO) -> hien thi nguyen van, tranh crash render
  if (Number.isNaN(target.getTime())) {
    return typeof targetIso === "string" ? targetIso : "";
  }
  
  // Tính khoảng lệch (mili-giây)
  const elapsed = target - base;
  const absElapsed = Math.abs(elapsed);

  // Định nghĩa các cấu hình đơn vị thời gian (quy đổi ra mili-giây)
  const units = [
    { name: 'year', value: 31536000000 },
    { name: 'month', value: 2628000000 },
    { name: 'day', value: 86400000 },
    { name: 'hour', value: 3600000 },
    { name: 'minute', value: 60000 },
    { name: 'second', value: 1000 }
  ];

  // Xử lý nhanh trường hợp khoảng cách quá ngắn (< 10 giây) để hiển thị tự nhiên hơn
  if (absElapsed < 10000) {
    return elapsed >= 0 ? 'vài giây nữa' : 'vài giây trước';
  }

  // Khởi tạo bộ dịch thời gian tương đối của trình duyệt/Node.js (ngôn ngữ tiếng Việt)
  const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'always' });

  // Duyệt qua các đơn vị từ lớn đến nhỏ để tìm đơn vị phù hợp nhất
  for (const unit of units) {
    if (absElapsed >= unit.value || unit.name === 'second') {
      const count = Math.round(elapsed / unit.value);
      return rtf.format(count, unit.name);
    }
  }
}

/**
 * Định dạng số lượt xem ngắn gọn cho UI.
 * Số nguyên theo API (docs/API.md) → hiển thị "12.5k", "1.2tr"...
 * @param {number} views
 * @returns {string} Ví dụ: "1.2k", "15.1k", "12500"
 */
export function formatViews(views) {
  const n = Number(views) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}tr`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}