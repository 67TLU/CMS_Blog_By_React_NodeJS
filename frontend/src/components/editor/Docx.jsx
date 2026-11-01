import React, { useState } from "react";
import mammoth from "mammoth"; // 1. Import thư viện mammoth
import { RichEditor } from "./RichEditor"; // Component Editor của bạn
import { FileDown } from "lucide-react"; // Icon nút bấm

export default function PostForm({content, setContent}) {
  const [isImporting, setIsImporting] = useState(false);

  // 2. Hàm xử lý đọc file Word (.docx)
  const handleImportDocx = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra nếu không phải file docx thì từ chối
    if (file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      alert("Vui lòng chỉ chọn file Word định dạng .docx");
      return;
    }

    setIsImporting(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        
        // Tiến hành chuyển đổi dữ liệu từ file Word sang chuỗi HTML sạch
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        
        const htmlOutput = result.value; // Đây chính là chuỗi HTML sạch đã được bóc tách
        
        // 3. Đổ thẳng chuỗi HTML vừa lấy được vào Editor
        setContent(htmlOutput); 
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Lỗi khi bóc tách file Word:", error);
      alert("Có lỗi xảy ra khi đọc file tài liệu này.");
    } finally {
      setIsImporting(false);
      // Reset input file để có thể chọn lại chính file đó nếu cần
      event.target.value = "";
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Nội dung chi tiết bài viết</h2>
          <p className="text-xs text-zinc-500">Biên tập viên có thể viết trực tiếp hoặc tải file bài viết từ Word lên</p>
        </div>

        {/* NÚT TẢI FILE WORD DESIGN THEO PHONG CÁCH TAILWIND */}
        <label className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md shadow-sm cursor-pointer transition">
          <FileDown className="w-4 h-4" />
          {isImporting ? "Đang xử lý..." : "Nhập bài từ file Word (.docx)"}
          <input 
            type="file" 
            accept=".docx" 
            onChange={handleImportDocx} 
            className="hidden" 
            disabled={isImporting}
          />
        </label>
      </div>

      {/* COMPONENT RICH TEXT EDITOR KẾT NỐI VỚI CONTENT STATE */}
      <RichEditor value={content} onChange={setContent} />
    </div>
  );
}
