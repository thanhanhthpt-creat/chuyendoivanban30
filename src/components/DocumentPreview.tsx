import React from "react";
import { DocumentItem } from "../types";

interface DocumentPreviewProps {
  item: DocumentItem;
}

// Hàm render chữ inline hỗ trợ in đậm, in nghiêng và LaTeX toán học cơ bản
function renderInlineStyles(text: string) {
  let processed = text
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ")
    .replace(/\\delta/g, "δ")
    .replace(/\\pi/g, "π")
    .replace(/\\sigma/g, "σ")
    .replace(/\\theta/g, "θ")
    .replace(/\\omega/g, "ω")
    .replace(/\\mu/g, "μ")
    .replace(/\\lambda/g, "λ")
    .replace(/\\ge/g, "≥")
    .replace(/\\le/g, "≤")
    .replace(/\\neq/g, "≠")
    .replace(/\\approx/g, "≈")
    .replace(/\\infty/g, "∞")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\pm/g, "±")
    .replace(/\\sum/g, "∑")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\^2/g, "²")
    .replace(/\^3/g, "³")
    .replace(/\^n/g, "ⁿ")
    .replace(/\$([^$]+)\$/g, "$1") // Xóa ký tự đô la LaTeX
    .replace(/\\\((.*?)\\\)/g, "$1")
    .replace(/\\\[(.*?)\\\]/g, "$1");

  const parts = [];
  let index = 0;

  while (index < processed.length) {
    const boldIndex = processed.indexOf("**", index);
    const italicIndex = processed.indexOf("*", index);

    if (boldIndex !== -1 && (italicIndex === -1 || boldIndex < italicIndex)) {
      if (boldIndex > index) {
        parts.push(<span key={index}>{processed.substring(index, boldIndex)}</span>);
      }
      const boldEnd = processed.indexOf("**", boldIndex + 2);
      if (boldEnd !== -1) {
        parts.push(
          <strong key={boldIndex} className="font-bold text-slate-900 dark:text-slate-100">
            {processed.substring(boldIndex + 2, boldEnd)}
          </strong>
        );
        index = boldEnd + 2;
      } else {
        parts.push(<span key={boldIndex}>{processed.substring(boldIndex)}</span>);
        break;
      }
    } else if (italicIndex !== -1 && (boldIndex === -1 || italicIndex < boldIndex)) {
      if (italicIndex > index) {
        parts.push(<span key={index}>{processed.substring(index, italicIndex)}</span>);
      }
      const italicEnd = processed.indexOf("*", italicIndex + 1);
      if (italicEnd !== -1) {
        parts.push(
          <em key={italicIndex} className="italic text-slate-800 dark:text-slate-200">
            {processed.substring(italicIndex + 1, italicEnd)}
          </em>
        );
        index = italicEnd + 1;
      } else {
        parts.push(<span key={italicIndex}>{processed.substring(italicIndex)}</span>);
        break;
      }
    } else {
      parts.push(<span key={index}>{processed.substring(index)}</span>);
      break;
    }
  }

  return parts.length > 0 ? parts : text;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ item }) => {
  const meta = item.metadata;

  // Thuật toán parse Markdown đơn giản cho giao diện Web Preview
  const renderPreviewContent = () => {
    const lines = item.content.split("\n");
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRowsData: string[][] = [];

    const handleFlushTable = (key: number) => {
      if (tableRowsData.length > 0) {
        elements.push(
          <div key={`table-wrapper-${key}`} className="my-4 overflow-x-auto">
            <table className="w-full border-collapse border border-slate-400 text-xs font-serif leading-relaxed">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  {tableRowsData[0].map((cell, cIdx) => (
                    <th key={cIdx} className="border border-slate-400 p-2 text-center font-bold text-slate-900 dark:text-slate-100">
                      {renderInlineStyles(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRowsData.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="border border-slate-400 p-2 text-slate-800 dark:text-slate-200">
                        {renderInlineStyles(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRowsData = [];
        inTable = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Parse Bảng biểu
      if (line.startsWith("|")) {
        inTable = true;
        if (line.includes("---") || line.includes("===")) {
          continue;
        }
        const cells = line
          .split("|")
          .map((c) => c.trim())
          .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        tableRowsData.push(cells);
        continue;
      } else {
        if (inTable) {
          handleFlushTable(i);
        }
      }

      if (line === "") {
        elements.push(<div key={`empty-${i}`} className="h-3" />);
        continue;
      }

      // H1 (QUYẾT ĐỊNH / BÁO CÁO)
      if (line.startsWith("# ")) {
        const headingText = line.substring(2).trim();
        elements.push(
          <h1 key={`h1-${i}`} className="my-4 text-center text-lg font-bold tracking-wide text-slate-950 dark:text-white uppercase font-serif">
            {renderInlineStyles(headingText)}
          </h1>
        );
        continue;
      }

      // H2 (Về việc...)
      if (line.startsWith("## ")) {
        const headingText = line.substring(3).trim();
        const isSubTitle = headingText.toLowerCase().startsWith("về việc") || headingText.toLowerCase().startsWith("tình hình");
        elements.push(
          <h2
            key={`h2-${i}`}
            className={`my-3 text-center ${
              isSubTitle ? "text-sm italic font-medium" : "text-base font-bold"
            } text-slate-900 dark:text-slate-100 font-serif`}
          >
            {renderInlineStyles(headingText)}
          </h2>
        );
        continue;
      }

      // H3 (QUYẾT ĐỊNH:)
      if (line.startsWith("### ")) {
        const headingText = line.substring(4).trim();
        elements.push(
          <h3 key={`h3-${i}`} className="my-3 text-center text-sm font-bold text-slate-950 dark:text-white uppercase font-serif">
            {renderInlineStyles(headingText)}
          </h3>
        );
        continue;
      }

      // Mục La Mã / Đề mục lớn
      const firstWord = line.split(" ")[0];
      const isMajorHeading = /^[I|V|X|L|C|D|M]+\.$/i.test(firstWord) || /^[A-Z]\.$/.test(firstWord);

      if (isMajorHeading) {
        elements.push(
          <h4 key={`heading-${i}`} className="mt-4 mb-2 text-sm font-bold text-slate-950 dark:text-white font-serif">
            {renderInlineStyles(line)}
          </h4>
        );
        continue;
      }

      // Bullet points
      if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("+ ")) {
        const bulletText = line.substring(2).trim();
        elements.push(
          <div key={`bullet-${i}`} className="flex items-start my-1 text-xs text-slate-800 dark:text-slate-200 font-serif pl-4">
            <span className="mr-2 select-none">•</span>
            <p className="flex-1 text-justify leading-relaxed">{renderInlineStyles(bulletText)}</p>
          </div>
        );
        continue;
      }

      // Căn cứ pháp lý
      if (line.toLowerCase().startsWith("căn cứ") || line.toLowerCase().startsWith("*căn cứ")) {
        const cleanBaseText = line.replace(/^\*|\*$/g, "");
        elements.push(
          <p key={`base-${i}`} className="my-1.5 text-xs text-slate-800 dark:text-slate-300 italic text-justify leading-relaxed font-serif indent-8">
            {renderInlineStyles(cleanBaseText)}
          </p>
        );
        continue;
      }

      // Thẩm quyền ban hành
      if (line.toLowerCase().startsWith("chủ tịch") || line.toLowerCase().startsWith("giám đốc") || line.toLowerCase().startsWith("ban giám đốc")) {
        elements.push(
          <p key={`authority-${i}`} className="my-3 text-center text-sm font-bold text-slate-900 dark:text-slate-100 uppercase font-serif">
            {renderInlineStyles(line)}
          </p>
        );
        continue;
      }

      // Đoạn văn chuẩn thụt lề đầu dòng
      elements.push(
        <p key={`p-${i}`} className="my-2 text-xs text-slate-800 dark:text-slate-200 text-justify leading-relaxed font-serif indent-8">
          {renderInlineStyles(line)}
        </p>
      );
    }

    if (inTable) {
      handleFlushTable(lines.length);
    }

    return elements;
  };

  return (
    <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col font-serif relative">
      {/* Thước kẻ mô phỏng A4 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-t-xl" />

      {/* Header Quốc hiệu & Đơn vị ban hành */}
      <div className="grid grid-cols-12 gap-4 border-b border-dashed border-slate-200 dark:border-slate-800 pb-6">
        {/* Đơn vị phát hành */}
        <div className="col-span-5 text-center flex flex-col items-center justify-start">
          <span className="text-[11px] sm:text-xs font-bold text-slate-950 dark:text-white uppercase leading-tight font-serif">
            {meta.issuingAuthority || "TÊN CƠ QUAN CHỦ QUẢN"}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-800 dark:text-slate-300 mt-1 font-serif">
            Số: {meta.documentNumber || "..../QĐ-UBND"}
          </span>
          <div className="w-16 h-[1px] bg-slate-900 dark:bg-slate-100 mt-2" />
        </div>

        {/* Quốc hiệu - Tiêu ngữ */}
        <div className="col-span-7 text-center flex flex-col items-center justify-start">
          <span className="text-[11px] sm:text-xs font-bold text-slate-950 dark:text-white uppercase leading-tight font-serif">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 font-serif">
            Độc lập - Tự do - Hạnh phúc
          </span>
          {/* Đường kẻ ngang đặc trưng của NĐ 30 */}
          <div className="w-28 h-[1px] bg-slate-900 dark:bg-slate-100 mt-1.5" />
          
          <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 italic mt-3 self-end pr-4 font-serif">
            {meta.location || "...,"}, {meta.dateString || "ngày... tháng... năm 2026"}
          </span>
        </div>
      </div>

      {/* Body văn bản */}
      <div className="flex-1 py-6">
        {renderPreviewContent()}
      </div>

      {/* Chữ ký & Nơi nhận */}
      <div className="grid grid-cols-12 gap-4 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800 mt-auto">
        {/* Nơi nhận */}
        <div className="col-span-5 flex flex-col text-[10px] text-slate-800 dark:text-slate-300 leading-normal font-serif">
          <span className="font-bold italic text-slate-950 dark:text-white mb-1 font-serif">Nơi nhận:</span>
          {meta.recipients && meta.recipients.length > 0 ? (
            meta.recipients.map((rec, rIdx) => (
              <span key={rIdx} className="pl-1 font-serif">
                {rec.trim()}
              </span>
            ))
          ) : (
            <>
              <span className="pl-1 font-serif">- Như Điều...;</span>
              <span className="pl-1 font-serif">- Lưu VT, TH.</span>
            </>
          )}
        </div>

        {/* Chức vụ & Tên người ký */}
        <div className="col-span-7 text-center flex flex-col items-center justify-start font-serif">
          <span className="text-[11px] sm:text-xs font-bold text-slate-950 dark:text-white uppercase font-serif">
            {meta.signerPosition || "CHỨC VỤ NGƯỜI KÝ"}
          </span>
          <div className="h-16 flex items-center justify-center italic text-[11px] text-slate-400 dark:text-slate-600 select-none font-serif my-2">
            [Ký số, đóng dấu hợp lệ]
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-950 dark:text-white font-serif mt-1">
            {meta.signerName || "Họ và tên người ký"}
          </span>
        </div>
      </div>
    </div>
  );
};
