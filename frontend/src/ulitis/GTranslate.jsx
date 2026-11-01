import { useEffect, useState } from 'react';
import { Languages, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

// Danh sách ngôn ngữ — phải khớp với `languages` trong gtranslateSettings
const LANGUAGES = [
  { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt' },
  { code: 'en', flag: '🇺🇸', name: 'English' },
  { code: 'zh-CN', flag: '🇨🇳', name: '中文 (Trung Quốc)' },
];

const CustomGTranslate = () => {
  // Ngôn ngữ đang chọn — dùng để đánh dấu ✓ trong dropdown
  const [currentLang, setCurrentLang] = useState('vi');

  useEffect(() => {
    // Cấu hình ẩn nút mặc định, chỉ lấy hàm kích hoạt dịch
    window.gtranslateSettings = {
      default_language: "vi",
      languages: ["vi", "en", "zh-CN"],
      wrapper_selector: ".gtranslate_hidden_wrapper",
    };

    const existingScript = document.querySelector('script[src*="gtranslate.net"]');
    if (!existingScript) {
      const script = document.createElement('script');
      // Dùng bản float.js để có hàm xử lý gọi dịch linh hoạt
      script.src = "https://cdn.gtranslate.net/widgets/latest/float.js";
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // Hàm xử lý khi người dùng chọn ngôn ngữ trong dropdown
  const handleTranslate = (langCode, retries = 10) => {
    // Kiểm tra xem hàm của GTranslate đã được tải xong chưa
    if (typeof window.doGTranslate === 'function') {
      // Cú pháp của GTranslate: 'ngôn ngữ gốc|ngôn ngữ đích'
      window.doGTranslate(`vi|${langCode}`);
      setCurrentLang(langCode);
    } else if (retries > 0) {
      // Script defer + mạng chậm — thử lại sau 300ms
      setTimeout(() => handleTranslate(langCode, retries - 1), 300);
    } else {
      console.error("GTranslate script chưa tải xong!");
    }
  };

  return (
    <div className="inline-flex items-center">
      {/* Dropdown chọn ngôn ngữ — shadcn DropdownMenu (Base UI) */}
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Đổi ngôn ngữ"
          title="Đổi ngôn ngữ"
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Languages className="size-5" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {/* Base UI: GroupLabel BẮT BUỘC nằm trong Menu.Group */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>Chọn ngôn ngữ</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleTranslate(lang.code)}
                className="cursor-pointer gap-2.5"
              >
                <span className="text-base leading-none">{lang.flag}</span>
                <span>{lang.name}</span>
                {currentLang === lang.code && (
                  <Check className="ml-auto size-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Thẻ div ẩn bắt buộc phải có để GTranslate mồi code cấu hình */}
      <div className="gtranslate_hidden_wrapper hidden"></div>
    </div>
  );
};

export default CustomGTranslate;
