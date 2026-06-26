import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Download,
  Settings,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Clock,
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  AlertTriangle,
  Upload,
  Database,
  ArrowRight,
  Eye,
  Menu,
  X,
  FileCheck,
} from "lucide-react";
import confetti from "canvas-confetti";
import { DocumentItem, HistoryItem, AppSettings, CustomTemplate, AppData } from "./types";
import { BUILTIN_TEMPLATES } from "./data/templates";
import { generateDocx } from "./utils/docxGenerator";
import { generatePptx } from "./utils/pptxGenerator";
import { DocumentPreview } from "./components/DocumentPreview";

// Dữ liệu ban đầu mặc định để demo ngay lập tức cho người dùng
const INITIAL_DEMO_ITEMS: DocumentItem[] = [
  {
    id: "demo-item-1",
    type: "quyết định",
    title: "Quyết định ban hành Quy chế chuyển đổi số",
    content: BUILTIN_TEMPLATES[0].content,
    metadata: BUILTIN_TEMPLATES[0].metadata,
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: "history-1",
    action: "Tạo mới tài liệu từ mẫu quyết định",
    data: { title: "Quyết định ban hành Quy chế chuyển đổi số" },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  }
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  language: "vi",
  preferences: {
    fontName: "Times New Roman",
    fontSize: 13,
    lineSpacing: 1.25,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 30,
    marginRight: 15,
    autoCheckSpell: true,
  }
};

export default function App() {
  // --- States ---
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  
  // Tài liệu hiện tại đang chỉnh sửa
  const [activeItem, setActiveItem] = useState<DocumentItem>({
    id: "active",
    type: "quyết định",
    title: "Văn bản chưa đặt tên",
    content: BUILTIN_TEMPLATES[0].content,
    metadata: { ...BUILTIN_TEMPLATES[0].metadata },
    createdAt: new Date().toISOString(),
  });

  // UI state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("template-quyet-dinh");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");
  const [userApiKey, setUserApiKey] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [serverConfig, setServerConfig] = useState<{ hasServerKey: boolean; models: string[] }>({
    hasServerKey: false,
    models: ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview", "gemini-2.5-flash"],
  });
  
  // Toasts / Alerts
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "history" | "help">("preview");
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  
  // Custom Template Form
  const [newTemplateName, setNewTemplateName] = useState<string>("");
  const [newTemplateDesc, setNewTemplateDesc] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Load Initial Data ---
  useEffect(() => {
    // Tải cấu hình server xem có API Key sẵn không
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        setServerConfig(data);
      })
      .catch((err) => console.log("Không tải được cấu hình server (đang chạy offline/client-only):", err));

    // Khôi phục từ LocalStorage
    const storedData = localStorage.getItem("docx_converter_data");
    const storedApiKey = localStorage.getItem("gemini_api_key");
    const storedCustomTemplates = localStorage.getItem("docx_custom_templates");

    if (storedApiKey) {
      setUserApiKey(storedApiKey);
    }

    if (storedCustomTemplates) {
      setCustomTemplates(JSON.parse(storedCustomTemplates));
    }

    if (storedData) {
      try {
        const parsed: AppData = JSON.parse(storedData);
        setItems(parsed.items || INITIAL_DEMO_ITEMS);
        setHistory(parsed.history || INITIAL_HISTORY);
        setSettings(parsed.settings || DEFAULT_SETTINGS);
        if (parsed.items && parsed.items.length > 0) {
          // Lấy item đầu tiên làm active
          setActiveItem(parsed.items[0]);
        }
      } catch (e) {
        console.error("Lỗi khôi phục dữ liệu, thiết lập lại mặc định:", e);
        resetToDefault();
      }
    } else {
      // Setup demo lần đầu tiên
      setItems(INITIAL_DEMO_ITEMS);
      setHistory(INITIAL_HISTORY);
      setSettings(DEFAULT_SETTINGS);
      setActiveItem(INITIAL_DEMO_ITEMS[0]);
      saveToStorage(INITIAL_DEMO_ITEMS, INITIAL_HISTORY, DEFAULT_SETTINGS);
    }
  }, []);

  // --- Helper Functions ---
  const saveToStorage = (newItems: DocumentItem[], newHistory: HistoryItem[], newSettings: AppSettings) => {
    const data: AppData = {
      items: newItems,
      history: newHistory,
      settings: newSettings,
      customTemplates: customTemplates
    };
    localStorage.setItem("docx_converter_data", JSON.stringify(data));
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const resetToDefault = () => {
    setItems(INITIAL_DEMO_ITEMS);
    setHistory(INITIAL_HISTORY);
    setSettings(DEFAULT_SETTINGS);
    setActiveItem(INITIAL_DEMO_ITEMS[0]);
    saveToStorage(INITIAL_DEMO_ITEMS, INITIAL_HISTORY, DEFAULT_SETTINGS);
    showToast("Đã khôi phục dữ liệu mô phỏng mặc định!", "success");
  };

  // Lưu API Key cá nhân của người dùng
  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    localStorage.setItem("gemini_api_key", key);
    showToast("Đã lưu API Key thành công!", "success");
  };

  // Chọn template từ danh sách
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const found = [...BUILTIN_TEMPLATES, ...customTemplates].find((t) => t.id === templateId);
    if (found) {
      setActiveItem({
        ...activeItem,
        type: found.type,
        content: found.content,
        metadata: { ...found.metadata },
        title: `Bản nháp - ${found.name}`,
      });
      showToast(`Đã áp dụng mẫu: ${found.name}`, "info");
    }
  };

  // Cập nhật trường metadata cho tài liệu đang hoạt động
  const handleUpdateMeta = (field: string, value: any) => {
    setActiveItem((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  };

  // Cập nhật Nơi nhận từ dạng text phân tách bằng dấu chấm phẩy sang mảng
  const handleUpdateRecipientsText = (text: string) => {
    const arr = text.split(";").map((x) => x.trim()).filter((x) => x !== "");
    handleUpdateMeta("recipients", arr);
  };

  // Ghi nhận hành động vào lịch sử
  const addHistoryItem = (action: string, data: any) => {
    const newItem: HistoryItem = {
      id: `hist-${Date.now()}`,
      action,
      data,
      timestamp: new Date().toISOString(),
    };
    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    saveToStorage(items, updatedHistory, settings);
  };

  // Thêm mẫu tự chế của người dùng
  const handleSaveAsCustomTemplate = () => {
    if (!newTemplateName) {
      showToast("Vui lòng điền tên mẫu cần lưu!", "error");
      return;
    }
    const newTpl: CustomTemplate = {
      id: `custom-tpl-${Date.now()}`,
      name: newTemplateName,
      description: newTemplateDesc || "Mẫu tự chỉnh sửa của bạn",
      type: activeItem.type,
      content: activeItem.content,
      metadata: { ...activeItem.metadata },
    };
    const updated = [newTpl, ...customTemplates];
    setCustomTemplates(updated);
    localStorage.setItem("docx_custom_templates", JSON.stringify(updated));
    setNewTemplateName("");
    setNewTemplateDesc("");
    setSelectedTemplateId(newTpl.id);
    showToast(`Đã lưu mẫu "${newTpl.name}" thành công!`, "success");
    addHistoryItem(`Lưu mẫu văn bản tự chỉnh sửa`, { name: newTpl.name });
  };

  // Xóa mẫu tùy chỉnh
  const handleDeleteCustomTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(updated);
    localStorage.setItem("docx_custom_templates", JSON.stringify(updated));
    showToast("Đã xóa mẫu tùy chỉnh thành công!", "info");
  };

  // --- Call Gemini AI with Fallback ---
  const callGemini = async (promptText: string): Promise<string | null> => {
    setIsProcessingAI(true);
    setAiError(null);

    const keyToUse = userApiKey;
    if (!keyToUse) {
      setIsProcessingAI(false);
      setAiError("Chưa cấu hình API Key.");
      setShowSettingsModal(true);
      showToast("Vui lòng nhập API Key để sử dụng!", "error");
      return null;
    }

    const fallbackModels = ["gemini-3-pro-preview", "gemini-3-flash-preview", "gemini-2.5-flash"];
    let modelsToTry = [selectedModel];
    fallbackModels.forEach(m => {
      if (!modelsToTry.includes(m)) modelsToTry.push(m);
    });

    let lastErrorMsg = "";

    for (const model of modelsToTry) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToUse}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { temperature: 0.2 }
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Lỗi ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("API không trả về nội dung hợp lệ.");
        
        setIsProcessingAI(false);
        return text;
      } catch (err: any) {
        console.warn(`Model ${model} thất bại:`, err.message);
        lastErrorMsg = err.message;
      }
    }

    // Nếu tất cả models đều thất bại
    const finalError = `429 RESOURCE_EXHAUSTED hoặc lỗi API: ${lastErrorMsg}`;
    setAiError(finalError);
    setIsProcessingAI(false);
    showToast("Đã dừng do lỗi. Tất cả các model đều thất bại.", "error");
    return null;
  };

  // Chức năng 1: Sắp xếp cấu trúc văn bản hành chính theo chuẩn Nghị định 30
  const handleAIStructure = async () => {
    const prompt = `Bạn là trợ lý hành chính chuyên nghiệp của cơ quan Nhà nước Việt Nam. Hãy chuyển đổi văn bản thô hoặc văn bản từ chatbot AI dưới đây thành một dự thảo văn bản hành chính Việt Nam chuẩn mực theo Nghị định 30/2020/NĐ-CP.
Hãy bố trí cấu trúc gồm: Tiêu đề lớn (QUYẾT ĐỊNH / BÁO CÁO / CÔNG VĂN / TỜ TRÌNH), các căn cứ pháp lý viết nghiêng lùi đầu dòng, các điều khoản/mục tiêu trình bày rõ ràng, bổ sung bảng biểu nếu có so sánh dữ liệu hoặc số liệu, và các đoạn văn thụt dòng chuẩn.
Lưu ý: Chỉ trả về nội dung văn bản dưới dạng Markdown sạch. KHÔNG bao gồm Quốc hiệu, Tiêu ngữ, Số hiệu văn bản, Địa danh, Ngày tháng hay Chữ ký ở cuối trang vì hệ thống sẽ tự động vẽ các phần đó ở hai đầu trang theo quy tắc của Nghị định 30.
Văn bản chatbot cần chuyển đổi định dạng:
${activeItem.content}`;

    showToast("Đang gửi yêu cầu xử lý định dạng cho AI...", "info");
    const result = await callGemini(prompt);
    if (result) {
      setActiveItem((prev) => ({
        ...prev,
        content: result,
      }));
      showToast("Đã định dạng cấu trúc Nghị định 30 thành công!", "success");
      addHistoryItem("AI tự động định dạng chuẩn hóa cấu trúc", { title: activeItem.title });
    }
  };

  // Chức năng 2: Sửa lỗi chính tả & Nâng tầm từ vựng hành chính
  const handleAISpellCheck = async () => {
    const prompt = `Bạn là chuyên gia kiểm tra chính tả và thẩm định ngôn ngữ công vụ hành chính nhà nước. Hãy phân tích kỹ văn bản hành chính dưới đây, tự động phát hiện và chỉnh sửa tất cả các lỗi chính tả, dấu câu, viết hoa viết thường sai quy chuẩn. Đồng thời, cải tiến từ ngữ thô, thói quen diễn đạt kiểu chat thành các câu từ trang trọng, khách quan, chính xác, trang nghiêm đúng văn phong luật pháp hành chính Việt Nam.
Lưu ý: Chỉ trả về toàn bộ văn bản sau khi đã sửa lỗi dưới dạng Markdown. Giữ nguyên định dạng tiêu đề, các căn cứ, gạch đầu dòng và bảng biểu. KHÔNG ghi thêm bất kỳ lời bình hay giải thích nào khác.
Văn bản hành chính cần tối ưu ngôn từ:
${activeItem.content}`;

    showToast("AI đang kiểm tra lỗi chính tả và chuẩn hóa từ vựng...", "info");
    const result = await callGemini(prompt);
    if (result) {
      setActiveItem((prev) => ({
        ...prev,
        content: result,
      }));
      showToast("Đã rà soát chính tả & văn phong hành chính xong!", "success");
      addHistoryItem("AI kiểm tra chính tả và biên tập ngôn từ", { title: activeItem.title });
    }
  };

  // --- Export Document ---
  const handleExportDocx = async () => {
    try {
      showToast("Đang biên dịch tệp .docx chuẩn...", "info");
      const blob = await generateDocx(activeItem);
      
      // Tạo đường link download trong browser
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Tạo tên file đẹp
      const cleanTitle = activeItem.title.replace(/[^a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, "").replace(/\s+/g, "_");
      a.download = `${cleanTitle || "Van_Ban_Hanh_Chinh_ND30"}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Bắn confetti chúc mừng thành công rực rỡ
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#6366F1", "#8B5CF6", "#10B981", "#F59E0B"],
      });

      showToast("Xuất tệp Word (.docx) chuẩn Nghị định 30 thành công!", "success");
      addHistoryItem("Xuất bản thành công văn bản Word .docx", { title: activeItem.title });
    } catch (error: any) {
      console.error(error);
      showToast("Gặp lỗi khi tạo tệp .docx: " + error.message, "error");
    }
  };

  const handleExportPptx = async () => {
    try {
      showToast("Đang biên dịch tệp bài giảng .pptx...", "info");
      const blob = await generatePptx(activeItem);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanTitle = activeItem.title.replace(/[^a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, "").replace(/\s+/g, "_");
      a.download = `${cleanTitle || "Bai_Giang_Dien_Tu"}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#F97316", "#FB923C", "#EA580C"],
      });

      showToast("Xuất bài giảng PowerPoint thành công!", "success");
      addHistoryItem("Xuất bản thành công bài giảng .pptx", { title: activeItem.title });
    } catch (error: any) {
      console.error(error);
      showToast("Gặp lỗi khi tạo tệp .pptx: " + error.message, "error");
    }
  };

  // --- Backup / Restore State ---
  const handleExportStateJson = () => {
    const data: AppData = {
      items,
      history,
      settings,
      customTemplates
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `docx_converter_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Sao lưu dữ liệu sang tệp JSON thành công!", "success");
  };

  const handleImportStateJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.items && parsed.settings) {
          setItems(parsed.items);
          setHistory(parsed.history || []);
          setSettings(parsed.settings);
          if (parsed.customTemplates) {
            setCustomTemplates(parsed.customTemplates);
          }
          if (parsed.items.length > 0) {
            setActiveItem(parsed.items[0]);
          }
          saveToStorage(parsed.items, parsed.history || [], parsed.settings);
          showToast("Khôi phục toàn bộ trạng thái dữ liệu thành công!", "success");
          addHistoryItem("Khôi phục hệ thống từ tệp dự phòng JSON", {});
        } else {
          showToast("Định dạng tệp JSON lưu trữ không hợp lệ!", "error");
        }
      } catch (err) {
        showToast("Có lỗi khi đọc tệp JSON!", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans transition-colors duration-300">
      
      {/* Header Panel */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] p-2.5 rounded-xl shadow-md text-white">
              <FileCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                Chuyển Đổi Văn Bản Chatbot Sang Word (.docx)
                <span className="bg-[#6366F1]/10 text-[#6366F1] text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase border border-[#6366F1]/20">
                  Nghị định 30
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Tự động chuẩn hóa lề, phông chữ, bảng biểu và công thức toán học LaTeX hành chính
              </p>
            </div>
          </div>

          {/* Quick Config Actions */}
          <div className="flex items-center flex-wrap gap-2 sm:self-center">
            
            {/* Status Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-150 text-[11px] font-medium">
              <span className={`w-2.5 h-2.5 rounded-full ${serverConfig.hasServerKey || userApiKey ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
              <span className="text-slate-600">
                {serverConfig.hasServerKey 
                  ? "AI Sẵn Sàng (Khóa Nhà Phát Triển)" 
                  : userApiKey 
                    ? "AI Sẵn Sàng (Khóa Cá Nhân)" 
                    : "Thiếu API Key cho AI"}
              </span>
            </div>

            {/* Model Selector */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-slate-600 mr-1 hidden sm:inline">Mô hình:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs rounded-lg px-2 py-1.5 font-medium outline-none focus:ring-2 focus:ring-[#6366F1] transition"
              >
                {serverConfig.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* API Key Configure button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              title="Cài đặt khóa API và tham số nâng cao"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Cấu hình</span>
            </button>

            {/* Fast Help Button */}
            <button
              onClick={() => setActiveTab(activeTab === "help" ? "preview" : "help")}
              className={`p-1.5 rounded-lg transition ${activeTab === "help" ? "bg-[#6366F1] text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
              title="Hướng dẫn sử dụng nhanh"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Toast Alert System */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 animate-slide-in-right">
          {toast.type === "success" && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
          {toast.type === "error" && <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
          {toast.type === "info" && <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />}
          <span className="text-xs font-medium">{toast.message}</span>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: Input Form & Editing Controls */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Template & Metadata Picker Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#6366F1]" />
                Mẫu văn bản chính quy
              </h2>
              <span className="text-[10px] text-slate-400 font-medium">Chọn để nạp mẫu nhanh</span>
            </div>

            {/* Dropdown Selector */}
            <div className="grid grid-cols-1 gap-2">
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs rounded-lg p-2.5 font-semibold text-slate-700 focus:ring-2 focus:ring-[#6366F1] transition outline-none"
              >
                <optgroup label="Mẫu chuẩn Nghị định 30">
                  {BUILTIN_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </optgroup>
                {customTemplates.length > 0 && (
                  <optgroup label="Mẫu tự lưu của bạn">
                    {customTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        ⭐ {t.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            
            {/* Metadata Fields Accordion/Form */}
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Thuộc tính tiêu đề chính (Metadata)</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Cơ quan ban hành:</label>
                  <input
                    type="text"
                    value={activeItem.metadata.issuingAuthority || ""}
                    onChange={(e) => handleUpdateMeta("issuingAuthority", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#6366F1] transition outline-none"
                    placeholder="SỞ THÔNG TIN VÀ TRUYỀN THÔNG"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Số / Ký hiệu:</label>
                  <input
                    type="text"
                    value={activeItem.metadata.documentNumber || ""}
                    onChange={(e) => handleUpdateMeta("documentNumber", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#6366F1] transition outline-none"
                    placeholder="125/QĐ-UBND"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Địa danh ban hành:</label>
                  <input
                    type="text"
                    value={activeItem.metadata.location || ""}
                    onChange={(e) => handleUpdateMeta("location", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#6366F1] transition outline-none"
                    placeholder="Đà Lạt"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Ngày ban hành:</label>
                  <input
                    type="text"
                    value={activeItem.metadata.dateString || ""}
                    onChange={(e) => handleUpdateMeta("dateString", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#6366F1] transition outline-none"
                    placeholder="Ngày 26 tháng 06 năm 2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Chức danh người ký:</label>
                  <input
                    type="text"
                    value={activeItem.metadata.signerPosition || ""}
                    onChange={(e) => handleUpdateMeta("signerPosition", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#6366F1] transition outline-none"
                    placeholder="CHỦ TỊCH"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Họ tên người ký:</label>
                  <input
                    type="text"
                    value={activeItem.metadata.signerName || ""}
                    onChange={(e) => handleUpdateMeta("signerName", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#6366F1] transition outline-none"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Nơi nhận (Phân tách bằng dấu chấm phẩy ;):</label>
                <input
                  type="text"
                  value={activeItem.metadata.recipients ? activeItem.metadata.recipients.join("; ") : ""}
                  onChange={(e) => handleUpdateRecipientsText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#6366F1] transition outline-none"
                  placeholder="Như Điều 3; Văn phòng UBND tỉnh; VT, TH."
                />
              </div>
            </div>

          </div>

          {/* Core Text Editor Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col flex-1 gap-3 min-h-[350px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] block" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Nội dung văn bản (Markdown)</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">
                {activeItem.content.length} ký tự | {activeItem.content.split(/\s+/).filter(Boolean).length} từ
              </span>
            </div>

            {/* Document Title bar */}
            <div>
              <input
                type="text"
                value={activeItem.title}
                onChange={(e) => setActiveItem((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg p-2 text-xs font-bold focus:ring-2 focus:ring-[#6366F1] transition outline-none"
                placeholder="Tên tài liệu lưu trữ..."
              />
            </div>

            {/* Text Area */}
            <div className="flex-1 relative">
              <textarea
                value={activeItem.content}
                onChange={(e) => setActiveItem((prev) => ({ ...prev, content: e.target.value }))}
                className="w-full h-full min-h-[220px] bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono leading-relaxed outline-none focus:ring-2 focus:ring-[#6366F1] focus:bg-white transition resize-none"
                placeholder="Dán nội dung từ chatbot AI hoặc gõ nội dung tại đây..."
              />
              {isProcessingAI && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center rounded-xl animate-fade-in">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-[#6366F1]/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#6366F1] animate-spin" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 mt-3 animate-pulse">Trợ lý AI đang xử lý...</span>
                  <span className="text-[10px] text-slate-400 mt-1">Vui lòng đợi trong giây lát</span>
                </div>
              )}
            </div>

            {aiError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold p-3 rounded-xl mt-2 animate-pulse flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {aiError}
              </div>
            )}

            {/* Action Tools & AI Controls */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              
              {/* AI Style re-format button */}
              <button
                type="button"
                onClick={handleAIStructure}
                disabled={isProcessingAI || !activeItem.content}
                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5053df] hover:to-[#7948e7] disabled:opacity-50 text-white font-bold text-xs p-2.5 rounded-xl transition shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Định dạng Nghị định 30
              </button>

              {/* AI Spellcheck & Review button */}
              <button
                type="button"
                onClick={handleAISpellCheck}
                disabled={isProcessingAI || !activeItem.content}
                className="flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs p-2.5 rounded-xl transition shadow-sm cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
                Sửa lỗi & Từ vựng AI
              </button>

            </div>

            {/* Save Template section */}
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Lưu thành Mẫu tùy chỉnh (Template)</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#6366F1] outline-none"
                  placeholder="Tên mẫu mới (VD: Quyết định Khen thưởng)"
                />
                <button
                  onClick={handleSaveAsCustomTemplate}
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Lưu
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Document Preview & History */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Preview Navigation Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Bản xem trước A4 (Preview)
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "history"
                    ? "bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Lịch sử & Dự phòng ({history.length})
              </button>

            </div>

            {/* Quick download buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleExportDocx}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <Download className="w-4 h-4 animate-bounce" />
                TẢI WORD (.DOCX) CHUẨN
              </button>
              
              <button
                onClick={handleExportPptx}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                TẢI SLIDE (.PPTX)
              </button>
            </div>
          </div>

          {/* Interactive Screen container */}
          <div className="flex-1 overflow-y-auto max-h-[85vh] rounded-xl border border-slate-200 bg-slate-100 p-4 shadow-inner">
            
            {activeTab === "preview" && (
              <div className="animate-fade-in">
                <DocumentPreview item={activeItem} />
              </div>
            )}

            {activeTab === "history" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 animate-fade-in flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Nhật ký xử lý hệ thống</h3>
                    <p className="text-xs text-slate-400">Các hành động xuất bản và sửa đổi tài liệu trước đó</p>
                  </div>
                  
                  {/* Backup / Restore system buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportStateJson}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 transition"
                      title="Xuất toàn bộ lịch sử, cấu hình và tài liệu ra file JSON dự phòng"
                    >
                      <Database className="w-3.5 h-3.5" />
                      Sao lưu JSON
                    </button>
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 transition"
                      title="Khôi phục toàn bộ hệ thống từ file JSON đã sao lưu"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Khôi phục
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImportStateJson}
                      accept=".json"
                      className="hidden"
                    />
                  </div>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
                    <Clock className="w-8 h-8 text-slate-300" />
                    <span className="text-xs text-slate-400 font-medium">Chưa ghi nhận hoạt động lịch sử nào.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                    {history.map((h) => (
                      <div
                        key={h.id}
                        className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl hover:border-slate-300 transition flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex-1">
                          <span className="font-bold text-slate-800 block mb-0.5">{h.action}</span>
                          <span className="text-[10px] text-slate-400 font-medium block">
                            {new Date(h.timestamp).toLocaleString("vi-VN")}
                          </span>
                          {h.data && h.data.title && (
                            <span className="inline-block mt-1.5 bg-slate-200/50 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">
                              {h.data.title}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Restore action button */}
                          {h.data && h.data.title && (
                            <button
                              onClick={() => {
                                const found = items.find((i) => i.title === h.data.title);
                                if (found) {
                                  setActiveItem({ ...found });
                                  showToast(`Đã khôi phục bản nháp "${found.title}"`, "success");
                                } else {
                                  // Dự phòng nếu ko tìm thấy trong list
                                  showToast(`Bản nháp gốc không còn tồn tại trong kho lưu trữ.`, "error");
                                }
                              }}
                              className="bg-[#6366F1]/10 hover:bg-[#6366F1]/20 text-[#6366F1] font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition"
                            >
                              Khôi phục nháp
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Reset app state */}
                <div className="border-t border-slate-100 pt-4 flex justify-end">
                  <button
                    onClick={resetToDefault}
                    className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg px-3 py-2 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa sạch dữ liệu & Đặt lại
                  </button>
                </div>
              </div>
            )}

            {activeTab === "help" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 animate-fade-in flex flex-col gap-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  📘 Hướng dẫn quy chuẩn trình bày văn bản hành chính theo Nghị định 30/2020/NĐ-CP
                </h3>
                
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-50 border-l-4 border-[#6366F1] p-3.5 rounded-r-xl">
                    <h4 className="font-bold text-slate-800 mb-1">1. Định dạng trang lề bắt buộc (Khổ A4)</h4>
                    <p className="text-slate-600 leading-relaxed">
                      Lề trên và dưới: <strong>20 - 25 mm</strong> (Tài liệu xuất tự động cài 20 mm).<br />
                      Lề trái: <strong>30 - 35 mm</strong> (Tài liệu xuất tự động cài 30 mm).<br />
                      Lề phải: <strong>15 - 20 mm</strong> (Tài liệu xuất tự động cài 15 mm).
                    </p>
                  </div>

                  <div className="bg-slate-50 border-l-4 border-emerald-500 p-3.5 rounded-r-xl">
                    <h4 className="font-bold text-slate-800 mb-1">2. Tiêu chuẩn Phông chữ & Cỡ chữ</h4>
                    <p className="text-slate-600 leading-relaxed">
                      Sử dụng phông chữ Việt hóa chuẩn <strong>Times New Roman</strong>. Cỡ chữ nội dung từ <strong>13 - 14 pt</strong>.<br />
                      Dãn dòng (line spacing) từ <strong>1.15 đến 1.5 lines</strong>. Khoảng cách đoạn (Paragraph spacing) hợp lý.
                    </p>
                  </div>

                  <div className="bg-slate-50 border-l-4 border-amber-500 p-3.5 rounded-r-xl">
                    <h4 className="font-bold text-slate-800 mb-1">3. Cách soạn thảo văn bản với Trợ lý AI</h4>
                    <p className="text-slate-600 leading-relaxed">
                      Bước 1: Chọn một mẫu cơ bản (Quyết định, Công văn, Tờ trình) ở bộ chọn phía trên.<br />
                      Bước 2: Thay đổi các trường metadata ở bảng cấu hình trái.<br />
                      Bước 3: Gõ nội dung thô hoặc dán văn bản chatbot vào khung soạn thảo.<br />
                      Bước 4: Click <strong>"Định dạng Nghị định 30"</strong> để AI tự động cấu trúc tiêu đề mục pháp lý, hoặc click <strong>"Sửa lỗi & Từ vựng AI"</strong> để rà soát lỗi chính tả hành chính tối ưu.<br />
                      Bước 5: Click <strong>"Tải Word (.docx)"</strong> để nhận tệp Word hoàn chỉnh.
                    </p>
                  </div>

                  <div className="bg-slate-50 border-l-4 border-[#8B5CF6] p-3.5 rounded-r-xl">
                    <h4 className="font-bold text-slate-800 mb-1">4. Hỗ trợ biểu đồ LaTeX Toán học</h4>
                    <p className="text-slate-600 leading-relaxed">
                      Hệ thống tự động biên dịch các mã toán học dạng <code>\alpha</code>, <code>\beta</code>, các lũy thừa <code>^2</code>, <code>\times</code> thành các ký tự toán học Unicode sắc nét khi ghi vào tệp Word, đảm bảo công thức không bị vỡ lỗi phông chữ.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer credits and information */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-4 text-center mt-auto">
        <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
          Giải pháp công nghệ chuyển đổi hành chính số thông minh • Thiết kế đáp ứng 100% Nghị định 30/2020/NĐ-CP • Bản quyền © 2026
        </p>
      </footer>

      {/* --- SETTINGS / CONFIGURATION MODAL --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 flex flex-col gap-4 relative animate-scale-up">
            
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Settings className="w-4.5 h-4.5 text-[#6366F1]" />
                Cấu hình hệ thống & API Key
              </h3>
              <p className="text-xs text-slate-400 mt-1">Cấu hình các tham số truyền nhận của mô hình Gemini AI</p>
            </div>

            <div className="flex flex-col gap-4.5 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
              
              {/* API Key Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Gemini API Key của bạn:</label>
                  <span className="text-[10px] text-slate-400 font-medium">(Lưu trong LocalStorage cực kỳ an toàn)</span>
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pr-10 outline-none focus:ring-2 focus:ring-[#6366F1]"
                    placeholder="Nhập API Key (AI Studio tự động tiêm nếu trống)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute top-2.5 right-3 text-slate-400 hover:text-slate-600"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => handleSaveApiKey(userApiKey)}
                    className="bg-[#6366F1] hover:bg-[#5053df] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition shadow-sm"
                  >
                    Lưu Key
                  </button>
                  {userApiKey && (
                    <button
                      onClick={() => {
                        setUserApiKey("");
                        localStorage.removeItem("gemini_api_key");
                        showToast("Đã xóa API Key cá nhân thành công!", "info");
                      }}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 px-3 py-1.5 rounded-lg text-[10px] font-bold transition"
                    >
                      Xóa Key
                    </button>
                  )}
                </div>
              </div>

              {/* Guide link to get Key */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50 flex flex-col gap-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">💡 Mẹo nhỏ cho người dùng:</span>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Môi trường Google AI Studio có thể đã cấu hình sẵn Khóa Nhà phát triển miễn phí cho bạn. Chỉ nhập Khóa riêng nếu bạn muốn sử dụng hạn ngạch và tùy chọn tài khoản Google Cloud của riêng mình.
                </p>
              </div>

              {/* Backup Settings options */}
              <div className="flex flex-col gap-2">
                <span className="font-bold text-slate-700">Tùy chỉnh định dạng tệp lề xuất bản (mm):</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Trên:</label>
                    <input
                      type="number"
                      value={settings.preferences.marginTop}
                      onChange={(e) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, marginTop: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-center outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Dưới:</label>
                    <input
                      type="number"
                      value={settings.preferences.marginBottom}
                      onChange={(e) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, marginBottom: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-center outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Trái:</label>
                    <input
                      type="number"
                      value={settings.preferences.marginLeft}
                      onChange={(e) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, marginLeft: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-center outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Phải:</label>
                    <input
                      type="number"
                      value={settings.preferences.marginRight}
                      onChange={(e) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, marginRight: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-center outline-none"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4 mt-1">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="bg-slate-950 hover:bg-slate-850 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Đóng & Áp dụng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
