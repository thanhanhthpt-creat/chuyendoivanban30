import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
} from "docx";
import { DocumentItem } from "../types";

// Hàm xử lý text inline thành các TextRun hỗ trợ in đậm, in nghiêng, gạch chân
export function parseInlineText(text: string, options: { font?: string; size?: number; color?: string; italics?: boolean; bold?: boolean } = {}): TextRun[] {
  const font = options.font || "Times New Roman";
  // Kích thước trong docx tính bằng half-points (1pt = 2 half-points)
  const size = options.size ? options.size * 2 : 26; // Mặc định 13pt
  const color = options.color || "000000";

  // Regex để tìm các khối **bold**, *italic*, _italic_ hoặc `code/latex`
  const parts: TextRun[] = [];
  let currentText = text;

  // Thay thế các ký tự toán học LaTeX cơ bản sang ký tự Unicode đẹp
  currentText = currentText
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
    .replace(/\$([^$]+)\$/g, "$1") // Loại bỏ ký hiệu $ của LaTeX
    .replace(/\\\((.*?)\\\)/g, "$1")
    .replace(/\\\[(.*?)\\\]/g, "$1");

  // Thuật toán parse đơn giản cho các thẻ Markdown inline: **bold** và *italic*
  let index = 0;
  while (index < currentText.length) {
    const boldIndex = currentText.indexOf("**", index);
    const italicIndex = currentText.indexOf("*", index);

    // Xác định thẻ nào xuất hiện trước
    if (boldIndex !== -1 && (italicIndex === -1 || boldIndex < italicIndex)) {
      // Có phần text thường trước in đậm
      if (boldIndex > index) {
        parts.push(new TextRun({
          text: currentText.substring(index, boldIndex),
          font,
          size,
          color,
          italics: options.italics,
          bold: options.bold,
        }));
      }
      // Tìm vị trí đóng in đậm
      const boldEnd = currentText.indexOf("**", boldIndex + 2);
      if (boldEnd !== -1) {
        parts.push(new TextRun({
          text: currentText.substring(boldIndex + 2, boldEnd),
          font,
          size,
          color,
          bold: true,
          italics: options.italics,
        }));
        index = boldEnd + 2;
      } else {
        // Không tìm thấy thẻ đóng, coi như text thường
        parts.push(new TextRun({
          text: currentText.substring(boldIndex),
          font,
          size,
          color,
          italics: options.italics,
          bold: options.bold,
        }));
        break;
      }
    } else if (italicIndex !== -1 && (boldIndex === -1 || italicIndex < boldIndex)) {
      // Có phần text thường trước in nghiêng
      if (italicIndex > index) {
        parts.push(new TextRun({
          text: currentText.substring(index, italicIndex),
          font,
          size,
          color,
          italics: options.italics,
          bold: options.bold,
        }));
      }
      // Tìm vị trí đóng in nghiêng
      const italicEnd = currentText.indexOf("*", italicIndex + 1);
      if (italicEnd !== -1) {
        parts.push(new TextRun({
          text: currentText.substring(italicIndex + 1, italicEnd),
          font,
          size,
          color,
          italics: true,
          bold: options.bold,
        }));
        index = italicEnd + 1;
      } else {
        parts.push(new TextRun({
          text: currentText.substring(italicIndex),
          font,
          size,
          color,
          italics: options.italics,
          bold: options.bold,
        }));
        break;
      }
    } else {
      // Không còn định dạng nào, lấy hết phần còn lại
      parts.push(new TextRun({
        text: currentText.substring(index),
        font,
        size,
        color,
        italics: options.italics,
        bold: options.bold,
      }));
      break;
    }
  }

  // Nếu không parse được gì, trả về text nguyên bản
  if (parts.length === 0) {
    parts.push(new TextRun({
      text: text,
      font,
      size,
      color,
      italics: options.italics,
      bold: options.bold,
    }));
  }

  return parts;
}

// Trình tạo tài liệu chính
export async function generateDocx(item: DocumentItem): Promise<Blob> {
  const meta = item.metadata;
  
  // 1. Tạo phần Header Quốc hiệu & Đơn vị ban hành (Bảng 2 cột không viền)
  const headerTable = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
    },
    rows: [
      new TableRow({
        children: [
          // Cột 1: Cơ quan ban hành, Số hiệu văn bản
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: (meta.issuingAuthority || "TÊN CƠ QUAN CHỦ QUẢN").toUpperCase(),
                    font: "Times New Roman",
                    size: 24, // 12pt
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 120 },
                children: [
                  new TextRun({
                    text: `Số: ${meta.documentNumber || "..../QĐ-UBND"}`,
                    font: "Times New Roman",
                    size: 24, // 12pt
                  }),
                ],
              }),
              // Đường phân cách ngắn ở cột 1
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 120 },
                children: [
                  new TextRun({
                    text: "────────",
                    font: "Times New Roman",
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
          // Cột 2: Quốc hiệu, Tiêu ngữ, Địa danh & ngày tháng
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 40 },
                children: [
                  new TextRun({
                    text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
                    font: "Times New Roman",
                    size: 24, // 12pt
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: "Độc lập - Tự do - Hạnh phúc",
                    font: "Times New Roman",
                    size: 26, // 13pt
                    bold: true,
                  }),
                ],
              }),
              // Đường kẻ ngang dưới Tiêu ngữ
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 120 },
                children: [
                  new TextRun({
                    text: "────────────────",
                    font: "Times New Roman",
                    size: 24,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 60, after: 120 },
                children: [
                  new TextRun({
                    text: `${meta.location || "...,"}, ${meta.dateString || "ngày... tháng... năm 2026"}`,
                    font: "Times New Roman",
                    size: 26, // 13pt
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // 2. Chuyển đổi nội dung văn bản (Markdown Body Parser)
  const bodyParagraphs: (Paragraph | Table)[] = [];

  // Thêm khoảng trắng giữa header và tiêu đề
  bodyParagraphs.push(new Paragraph({ spacing: { before: 240, after: 120 } }));

  // Parse các dòng của Markdown nội dung chính
  const lines = item.content.split("\n");
  let inTable = false;
  let tableHeaderParsed = false;
  let tableRowsData: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Phát hiện Bảng biểu Markdown
    if (line.startsWith("|")) {
      inTable = true;
      // Skip dòng phân tách kiểu |:---|:---:|
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
      // Nếu đang trong bảng mà gặp dòng không phải bảng -> Render bảng
      if (inTable && tableRowsData.length > 0) {
        const wordTable = createDocxTable(tableRowsData);
        bodyParagraphs.push(wordTable);
        bodyParagraphs.push(new Paragraph({ spacing: { before: 120, after: 120 } }));
        // Reset bảng
        inTable = false;
        tableHeaderParsed = false;
        tableRowsData = [];
      }
    }

    if (line === "") {
      // Dòng trống -> Cách dòng
      bodyParagraphs.push(new Paragraph({ spacing: { before: 60, after: 60 } }));
      continue;
    }

    // Tiêu đề lớn nhất H1 (# QUYẾT ĐỊNH hoặc # BÁO CÁO)
    if (line.startsWith("# ")) {
      const headingText = line.substring(2).trim();
      bodyParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 120 },
          children: parseInlineText(headingText, { size: 15, bold: true }),
        })
      );
      continue;
    }

    // Tiêu đề vừa H2 (## Về việc...)
    if (line.startsWith("## ")) {
      const headingText = line.substring(3).trim();
      const isSubTitle = headingText.toLowerCase().startsWith("về việc") || headingText.toLowerCase().startsWith("tình hình");
      bodyParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 180 },
          children: parseInlineText(headingText, {
            size: isSubTitle ? 13 : 14,
            bold: !isSubTitle,
            italics: isSubTitle,
          }),
        })
      );
      continue;
    }

    // Tiêu đề nhỏ H3 (### QUYẾT ĐỊNH:)
    if (line.startsWith("### ")) {
      const headingText = line.substring(4).trim();
      bodyParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 180, after: 120 },
          children: parseInlineText(headingText, { size: 13, bold: true }),
        })
      );
      continue;
    }

    // Đánh số La Mã hoặc đề mục lớn (I., II., III. hoặc A., B., C.)
    const firstWord = line.split(" ")[0];
    const isMajorHeading = /^[I|V|X|L|C|D|M]+\.$/i.test(firstWord) || /^[A-Z]\.$/.test(firstWord);
    
    if (isMajorHeading) {
      bodyParagraphs.push(
        new Paragraph({
          spacing: { before: 180, after: 120 },
          indent: { firstLine: 0 },
          children: parseInlineText(line, { size: 13, bold: true }),
        })
      );
      continue;
    }

    // Phát hiện Danh sách dạng Bullet (- hoặc * hoặc +)
    if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("+ ")) {
      const bulletText = line.substring(2).trim();
      bodyParagraphs.push(
        new Paragraph({
          spacing: { before: 60, after: 60 },
          indent: { left: 360, hanging: 180 }, // Căn lề thụt đầu dòng bullet (sử dụng hanging thay vì firstLine âm)
          children: [
            new TextRun({ text: "•  ", font: "Times New Roman", size: 26 }),
            ...parseInlineText(bulletText, { size: 13 }),
          ],
        })
      );
      continue;
    }

    // Phát hiện Căn cứ pháp lý (Thường viết chữ nghiêng, lùi đầu dòng, kết thúc dấu chấm phẩy)
    if (line.toLowerCase().startsWith("căn cứ") || line.toLowerCase().startsWith("*căn cứ")) {
      const cleanBaseText = line.replace(/^\*|\*$/g, ""); // Xóa các dấu sao thừa
      bodyParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 80, after: 80 },
          indent: { firstLine: 360 }, // Thụt dòng 1.27cm
          children: parseInlineText(cleanBaseText, { size: 13, italics: true }),
        })
      );
      continue;
    }

    // Phát hiện người ban hành hay chữ ký ở đầu/giữa văn bản
    if (line.toLowerCase().startsWith("chủ tịch") || line.toLowerCase().startsWith("giám đốc") || line.toLowerCase().startsWith("ban giám đốc")) {
      const isUppercaseOnly = line === line.toUpperCase();
      bodyParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
          children: parseInlineText(line, { size: 13, bold: true }),
        })
      );
      continue;
    }

    // Đoạn văn thông thường
    bodyParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED, // Căn đều 2 bên theo chuẩn hành chính
        spacing: { before: 80, after: 80 },
        indent: { firstLine: 360 }, // Thụt lề dòng đầu 1.27cm (khoảng 360 twips)
        children: parseInlineText(line, { size: 13 }),
      })
    );
  }

  // Đảm bảo vẽ xong bảng cuối cùng nếu người dùng kết thúc bằng một bảng biểu
  if (inTable && tableRowsData.length > 0) {
    const wordTable = createDocxTable(tableRowsData);
    bodyParagraphs.push(wordTable);
    bodyParagraphs.push(new Paragraph({ spacing: { before: 120, after: 120 } }));
  }

  // 3. Tạo phần Chữ ký & Nơi nhận ở cuối trang (Bảng 2 cột không viền)
  const recipientsList = meta.recipients || ["- Như trên;", "- Lưu VT."];
  const recipientRuns: Paragraph[] = [
    new Paragraph({
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({
          text: "Nơi nhận:",
          font: "Times New Roman",
          size: 22, // 11pt theo NĐ30
          bold: true,
          italics: true,
        }),
      ],
    }),
  ];

  recipientsList.forEach((r) => {
    recipientRuns.push(
      new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({
            text: r.trim(),
            font: "Times New Roman",
            size: 22, // 11pt
          }),
        ],
      })
    );
  });

  const footerTable = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
    },
    rows: [
      new TableRow({
        children: [
          // Cột trái: Nơi nhận
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: recipientRuns,
          }),
          // Cột phải: Chữ ký người có thẩm quyền
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 40 },
                children: [
                  new TextRun({
                    text: (meta.signerPosition || "CHỨC VỤ NGƯỜI KÝ").toUpperCase(),
                    font: "Times New Roman",
                    size: 26, // 13pt
                    bold: true,
                  }),
                ],
              }),
              // Tạo khoảng trống ký tên
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 360, after: 360 },
                children: [new TextRun({ text: "", font: "Times New Roman" })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 0 },
                children: [
                  new TextRun({
                    text: meta.signerName || "Họ và tên người ký",
                    font: "Times New Roman",
                    size: 26, // 13pt
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // 4. Lắp ghép thành cấu trúc Văn bản hoàn chỉnh (Khổ A4, đúng căn lề Nghị định 30)
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134,    // 20mm (20 / 25.4 * 1440 = 1134 twips)
              bottom: 1134, // 20mm
              left: 1701,   // 30mm (30 / 25.4 * 1440 = 1701 twips)
              right: 850,   // 15mm (15 / 25.4 * 1440 = 850 twips)
            },
          },
        },
        children: [
          headerTable,
          ...bodyParagraphs,
          new Paragraph({ spacing: { before: 240, after: 120 } }), // Cách lề một chút trước footer
          footerTable,
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

// Hàm hỗ trợ tạo bảng trong Word
function createDocxTable(rowsData: string[][]): Table {
  const tableRows: TableRow[] = [];

  rowsData.forEach((rowData, rIdx) => {
    const cells: TableCell[] = [];
    const isHeader = rIdx === 0;

    rowData.forEach((cellText) => {
      cells.push(
        new TableCell({
          width: {
            size: 100 / rowData.length,
            type: WidthType.PERCENTAGE,
          },
          // Thêm viền đen mảnh cho bảng theo chuẩn quy định hành chính
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
          },
          shading: isHeader
            ? { fill: "F1F5F9" } // Đổ màu nền nhạt cho tiêu đề bảng
            : undefined,
          children: [
            new Paragraph({
              alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
              spacing: { before: 80, after: 80 },
              children: parseInlineText(cellText, {
                size: 12,
                bold: isHeader,
              }),
            }),
          ],
        })
      );
    });

    tableRows.push(
      new TableRow({
        children: cells,
      })
    );
  });

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: tableRows,
  });
}
