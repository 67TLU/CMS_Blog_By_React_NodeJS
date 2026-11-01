import React, { useRef, useCallback, useId } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, Link, Image,
  Video, Code, Quote, Subscript,
  Superscript, Undo, Redo,
  Indent, Outdent, ListChecks,
  Minus, RemoveFormatting,
} from "lucide-react";
import "react-quill-new/dist/quill.snow.css";

/* ═══════════════════════════════════════════════════
   Đăng ký Font / Size một lần ở module-level
═══════════════════════════════════════════════════ */
const FontAttributor = Quill.import("formats/font");
FontAttributor.whitelist = ["serif", "monospace", "arial", "georgia", "tahoma", "verdana", "courier"];
Quill.register(FontAttributor, true);

const SizeAttributor = Quill.import("formats/size");
SizeAttributor.whitelist = ["small", "large", "huge"];
Quill.register(SizeAttributor, true);

/* ═══════════════════════════════════════════════════
   CSS cho custom font-family
   Quill gắn class "ql-font-<name>" lên <span> –
   PHẢI có CSS này thì chữ mới thực sự thay đổi.
═══════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  /* ── font-family classes ── */
  .ql-font-serif       { font-family: Georgia,"Times New Roman",serif !important; }
  .ql-font-monospace   { font-family: "Courier New",Courier,monospace !important; }
  .ql-font-arial       { font-family: Arial,Helvetica,sans-serif !important; }
  .ql-font-georgia     { font-family: Georgia,serif !important; }
  .ql-font-tahoma      { font-family: Tahoma,Geneva,sans-serif !important; }
  .ql-font-verdana     { font-family: Verdana,Geneva,sans-serif !important; }
  .ql-font-courier     { font-family: "Courier New",Courier,monospace !important; }

  /* ── size ── */
  .ql-size-small { font-size: 0.8em !important; }
  .ql-size-large { font-size: 1.4em !important; }
  .ql-size-huge  { font-size: 2em !important; }

  /* ── Quill snow border reset ── */
  .rte-wrap .ql-toolbar.ql-snow,
  .rte-wrap .ql-container.ql-snow { border: none !important; }

  /* ── Editor area ── */
  .rte-wrap .ql-editor {
    font-size: 15px; line-height: 1.75;
    padding: 16px 20px; color: inherit;
  }
  .dark .rte-wrap .ql-editor { color: #f4f4f5; }
  .rte-wrap .ql-editor.ql-blank::before { color:#a1a1aa; font-style:normal; }

  /* ── Toolbar button hover/active ── */
  .rte-wrap .rte-toolbar button:hover  { background:rgba(0,0,0,.07)!important; border-radius:4px; }
  .dark .rte-wrap .rte-toolbar button:hover { background:rgba(255,255,255,.1)!important; }
  .rte-wrap .rte-toolbar button.ql-active { background:rgba(59,130,246,.18)!important; color:#3b82f6!important; }

  /* ── Quill color-picker popup ── */
  .ql-snow .ql-color-picker .ql-picker-options { width:200px; padding:5px; }
  .ql-snow .ql-color-picker .ql-picker-item   { width:20px; height:20px; border-radius:3px; margin:1px; }

  /* ── Blockquote / Code ── */
  .rte-wrap .ql-editor blockquote {
    border-left:4px solid #3b82f6; padding-left:14px;
    color:#71717a; margin:10px 0; font-style:italic;
  }
  .rte-wrap .ql-editor pre.ql-syntax {
    background:#18181b; color:#e4e4e7;
    border-radius:8px; padding:14px 18px; font-size:13px; overflow-x:auto;
  }
  .rte-wrap .ql-editor code {
    background:#f4f4f5; padding:1px 6px; border-radius:4px; font-size:13px;
  }
  .dark .rte-wrap .ql-editor code { background:#27272a; }

  /* ── Tooltip ── */
  .ql-snow .ql-tooltip { z-index:9999; }
`;

/* ── Bảng màu ── */
const COLORS = [
  "#000000","#434343","#666666","#999999","#b7b7b7","#cccccc","#d9d9d9","#ffffff",
  "#ff0000","#ff4500","#ff7f00","#ffd700","#00b050","#00bfff","#0070c0","#7030a0",
  "#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d9e1f2","#ead1dc","#c9daf8","#b6d7a8",
  "#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a4c2f4","#b4a7d6","#ff6d00","#00897b",
];

/* ── Formats ── */
const FORMATS = [
  "font","size","header",
  "bold","italic","underline","strike","script",
  "color","background",
  "list","indent","align",
  "link","image","video",
  "blockquote","code-block",
];

/* ── Style atoms ── */
const BTN = {
  display:"inline-flex", alignItems:"center", justifyContent:"center",
  padding:"4px 5px", borderRadius:4, border:"none",
  background:"transparent", cursor:"pointer", color:"inherit", lineHeight:1,
};
const SEL_STYLE = {
  border:"1px solid #d4d4d8", borderRadius:4, padding:"3px 5px",
  fontSize:12, background:"transparent", cursor:"pointer", color:"inherit",
};
function Sep() {
  return <span style={{ width:1, alignSelf:"stretch", background:"#e4e4e7", margin:"2px 6px", display:"inline-block" }} />;
}

/* ═══════════════════════════════════════════════════
   RICH EDITOR
═══════════════════════════════════════════════════ */
export function RichEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung chi tiết tại đây...",
  minHeight = 340,
}) {
  const quillRef    = useRef(null);
  const lastRange   = useRef(null);   // ← lưu selection cuối trước khi mất focus
  const uid         = useId().replace(/:/g, "_");
  const toolbarId   = `rte-tb-${uid}`;

  const getEditor = () => quillRef.current?.getEditor?.();

  /* ─────────────────────────────────────────────────────
     Mỗi khi selection thay đổi, lưu lại nếu khác null.
     Đây là "bộ nhớ" selection để toolbar selects dùng.
  ───────────────────────────────────────────────────── */
  const onSelectionChange = useCallback((range) => {
    if (range !== null) lastRange.current = range;
  }, []);

  /* ─────────────────────────────────────────────────────
     applyFormat: focus editor → restore selection → format
     Dùng cho các <select> trong toolbar.
  ───────────────────────────────────────────────────── */
  const applyFormat = useCallback((formatName, formatValue) => {
    const ed = getEditor();
    if (!ed) return;
    // Lấy selection đã lưu (hoặc selection hiện tại nếu còn)
    const range = lastRange.current ?? ed.getSelection();
    if (!range) return;
    // Trả focus về editor rồi restore selection
    ed.focus();
    ed.setSelection(range.index, range.length);
    // Apply format
    ed.format(formatName, formatValue || false);
  }, []);

  /* ── Handlers cho toolbar select ── */
  const onFontChange   = useCallback((e) => applyFormat("font",   e.target.value), [applyFormat]);
  const onSizeChange   = useCallback((e) => applyFormat("size",   e.target.value), [applyFormat]);
  const onHeaderChange = useCallback((e) => applyFormat("header", e.target.value ? Number(e.target.value) : false), [applyFormat]);

  /* ── Undo / Redo ── */
  const handleUndo = useCallback((e) => { e.preventDefault(); getEditor()?.history?.undo(); }, []);
  const handleRedo = useCallback((e) => { e.preventDefault(); getEditor()?.history?.redo(); }, []);

  /* ── Remove format ── */
  const handleClear = useCallback((e) => {
    e.preventDefault();
    const ed = getEditor(); if (!ed) return;
    const range = lastRange.current ?? ed.getSelection();
    if (range) { ed.focus(); ed.setSelection(range.index, range.length); ed.removeFormat(range.index, range.length); }
  }, []);

  /* ── HR ── */
  const handleHR = useCallback((e) => {
    e.preventDefault();
    const ed = getEditor(); if (!ed) return;
    const range = ed.getSelection(true);
    if (!range) return;
    ed.insertText(range.index, "\n", "user");
    ed.insertEmbed(range.index + 1, "hr", true, "user");
    ed.setSelection(range.index + 2, 0, "user");
  }, []);

  const modules = {
    toolbar: { container: `#${toolbarId}` },
    history: { delay: 400, maxStack: 200, userOnly: true },
  };

  const sz = { width: 14, height: 14 };

  return (
    <>
      <style>{GLOBAL_CSS + `
        .rte-wrap .ql-editor { min-height: ${minHeight}px; }
        .dark .rte-wrap select { border-color:#3f3f46!important; color:#e4e4e7!important; }
      `}</style>

      <div className="rte-wrap w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">

        {/* ════════ TOOLBAR ════════ */}
        <div
          id={toolbarId}
          className="rte-toolbar ql-toolbar ql-snow"
          style={{
            display:"flex", flexWrap:"wrap", alignItems:"center", gap:2,
            padding:"7px 10px", background:"#f8f8fa",
            borderBottom:"1px solid #e4e4e7",
          }}
        >
          {/* Undo / Redo */}
          <button onMouseDown={handleUndo} title="Hoàn tác (Ctrl+Z)" style={BTN}><Undo {...sz}/></button>
          <button onMouseDown={handleRedo} title="Làm lại (Ctrl+Y)"  style={BTN}><Redo {...sz}/></button>
          <Sep/>

          {/* ── Font family ──
              onChange: lưu selection → focus → format
              KHÔNG dùng className="ql-font" vì Quill cũng gắn handler
              nhưng không restore selection đúng cách khi mất focus. */}
          <select
            title="Phông chữ"
            style={{...SEL_STYLE, maxWidth:115}}
            defaultValue=""
            onChange={onFontChange}
          >
            <option value="">Mặc định</option>
            <option value="arial">Arial</option>
            <option value="georgia">Georgia</option>
            <option value="tahoma">Tahoma</option>
            <option value="verdana">Verdana</option>
            <option value="courier">Courier</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
          </select>

          {/* ── Font size ── */}
          <select
            title="Cỡ chữ"
            style={{...SEL_STYLE, maxWidth:95}}
            defaultValue=""
            onChange={onSizeChange}
          >
            <option value="small">Nhỏ</option>
            <option value="">Thường</option>
            <option value="large">Lớn</option>
            <option value="huge">Rất lớn</option>
          </select>

          {/* ── Heading ── */}
          <select
            title="Tiêu đề"
            style={{...SEL_STYLE, maxWidth:110}}
            defaultValue=""
            onChange={onHeaderChange}
          >
            <option value="">Thường</option>
            <option value="1">Tiêu đề 1</option>
            <option value="2">Tiêu đề 2</option>
            <option value="3">Tiêu đề 3</option>
            <option value="4">Tiêu đề 4</option>
            <option value="5">Tiêu đề 5</option>
            <option value="6">Tiêu đề 6</option>
          </select>
          <Sep/>

          {/* ── Text format (buttons – mousedown giữ focus, OK) ── */}
          <button className="ql-bold"      title="In đậm (Ctrl+B)"     style={BTN}><Bold {...sz}/></button>
          <button className="ql-italic"    title="In nghiêng (Ctrl+I)" style={BTN}><Italic {...sz}/></button>
          <button className="ql-underline" title="Gạch chân (Ctrl+U)"  style={BTN}><Underline {...sz}/></button>
          <button className="ql-strike"    title="Gạch ngang"          style={BTN}><Strikethrough {...sz}/></button>
          <Sep/>

          {/* ── Color (Quill native picker – hoạt động bình thường) ── */}
          <select className="ql-color" title="Màu chữ">
            {COLORS.map(c => <option key={c} value={c}/>)}
            <option value="">Mặc định</option>
          </select>
          <select className="ql-background" title="Màu nền">
            {COLORS.map(c => <option key={c} value={c}/>)}
            <option value="">Không</option>
          </select>
          <Sep/>

          {/* Script */}
          <button className="ql-script" value="super" title="Chỉ số trên" style={BTN}><Superscript {...sz}/></button>
          <button className="ql-script" value="sub"   title="Chỉ số dưới" style={BTN}><Subscript {...sz}/></button>
          <Sep/>

          {/* Lists */}
          <button className="ql-list" value="ordered" title="Danh sách số"   style={BTN}><ListOrdered {...sz}/></button>
          <button className="ql-list" value="bullet"  title="Danh sách chấm" style={BTN}><List {...sz}/></button>
          <button className="ql-list" value="check"   title="Checklist"      style={BTN}><ListChecks {...sz}/></button>
          <Sep/>

          {/* Indent */}
          <button className="ql-indent" value="-1" title="Giảm thụt dòng" style={BTN}><Outdent {...sz}/></button>
          <button className="ql-indent" value="+1" title="Tăng thụt dòng" style={BTN}><Indent {...sz}/></button>
          <Sep/>

          {/* Align */}
          <button className="ql-align" value=""        title="Căn trái"  style={BTN}><AlignLeft {...sz}/></button>
          <button className="ql-align" value="center"  title="Căn giữa"  style={BTN}><AlignCenter {...sz}/></button>
          <button className="ql-align" value="right"   title="Căn phải"  style={BTN}><AlignRight {...sz}/></button>
          <button className="ql-align" value="justify" title="Căn đều"   style={BTN}><AlignJustify {...sz}/></button>
          <Sep/>

          {/* Media & blocks */}
          <button className="ql-link"       title="Chèn link"     style={BTN}><Link {...sz}/></button>
          <button className="ql-image"      title="Chèn ảnh"      style={BTN}><Image {...sz}/></button>
          <button className="ql-video"      title="Chèn video"    style={BTN}><Video {...sz}/></button>
          <button className="ql-blockquote" title="Trích dẫn"     style={BTN}><Quote {...sz}/></button>
          <button className="ql-code-block" title="Khối code"     style={BTN}><Code {...sz}/></button>
          <Sep/>

          {/* HR */}
          <button onMouseDown={handleHR} title="Đường kẻ ngang" style={BTN}><Minus {...sz}/></button>

          {/* Clear format */}
          <button onMouseDown={handleClear} title="Xóa định dạng vùng chọn" style={{...BTN, color:"#ef4444"}}>
            <RemoveFormatting {...sz}/>
          </button>
        </div>

        {/* ════════ EDITOR ════════ */}
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          onChangeSelection={onSelectionChange}
          modules={modules}
          formats={FORMATS}
          placeholder={placeholder}
        />
      </div>
    </>
  );
}
