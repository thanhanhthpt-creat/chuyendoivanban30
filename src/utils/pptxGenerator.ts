import pptxgen from "pptxgenjs";
import { DocumentItem } from "../types";

export const generatePptx = async (item: DocumentItem): Promise<Blob> => {
  const pres = new pptxgen();
  pres.author = item.metadata?.signerName || "AI Assistant";
  pres.company = item.metadata?.issuingAuthority || "Company";
  pres.subject = item.metadata?.titleAbstract || "Presentation";
  pres.title = item.title;

  // Slide Tiêu đề
  const slide = pres.addSlide();
  slide.addText(item.metadata?.issuingAuthority || "CƠ QUAN CHỦ QUẢN", {
    x: 1, y: 1, w: "80%", h: 1, fontSize: 18, color: "363636", align: "center", bold: true
  });
  slide.addText(item.title, {
    x: 0.5, y: 2.5, w: "90%", h: 1.5, fontSize: 32, color: "003366", align: "center", bold: true
  });
  slide.addText(`Người biên soạn: ${item.metadata?.signerName || "AI"}`, {
    x: 1, y: 4.5, w: "80%", h: 1, fontSize: 16, color: "666666", align: "center"
  });

  // Tách Markdown thành các phần (sections)
  // Quy ước: ## hoặc ### để tách Slide
  const sections = item.content.split(/\n### |\n## /).filter(s => s.trim().length > 0);
  
  for (const section of sections) {
    const lines = section.split("\n").filter(l => l.trim().length > 0);
    let title = lines[0].replace(/#/g, "").trim();
    if (title === "") title = "Nội dung";
    
    // Bỏ dòng tiêu đề, các dòng còn lại làm content
    const contentLines = lines.slice(1).map(l => l.replace(/^[*\-]\s+/, "").trim()).filter(l => l !== "");
    
    // Mỗi slide chứa tối đa 6 gạch đầu dòng
    const MAX_LINES = 6;
    if (contentLines.length === 0) {
      // Nếu section không có dòng con nào
      const contentSlide = pres.addSlide();
      contentSlide.addText(title, {
        x: 0.5, y: 0.3, w: "90%", h: 0.8, fontSize: 24, color: "003366", bold: true, border: { type: "bottom", pt: 2, color: "003366" }
      });
    } else {
      for (let i = 0; i < contentLines.length; i += MAX_LINES) {
        const chunk = contentLines.slice(i, i + MAX_LINES);
        const contentSlide = pres.addSlide();
        
        contentSlide.addText(title + (i > 0 ? " (tiếp theo)" : ""), {
          x: 0.5, y: 0.3, w: "90%", h: 0.8, fontSize: 24, color: "003366", bold: true, border: { type: "bottom", pt: 2, color: "003366" }
        });
        
        const bullets = chunk.map(line => ({ text: line, options: { bullet: true, color: "333333", fontSize: 18 } }));
        contentSlide.addText(bullets, {
          x: 0.5, y: 1.5, w: "90%", h: 3.5, align: "left", valign: "top"
        });
      }
    }
  }

  // Slide kết thúc
  const endSlide = pres.addSlide();
  endSlide.addText("XIN TRÂN TRỌNG CẢM ƠN!", {
    x: 0.5, y: 2.5, w: "90%", h: 1.5, fontSize: 36, color: "003366", align: "center", bold: true
  });

  return await pres.write({ outputType: "blob" }) as Blob;
};
