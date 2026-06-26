export interface DocumentItem {
  id: string;
  type: string; // 'quyết định' | 'công văn' | 'tờ trình' | 'báo cáo' | 'khác'
  title: string;
  content: string;
  metadata: {
    issuingAuthority?: string;
    documentNumber?: string;
    location?: string;
    dateString?: string;
    titleAbstract?: string;
    signerName?: string;
    signerPosition?: string;
    recipients?: string[];
  };
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  action: string;
  data: any;
  timestamp: string;
}

export interface AppSettings {
  theme: "light" | "dark";
  language: "vi" | "en";
  preferences: {
    fontName: string;
    fontSize: number;
    lineSpacing: number;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    autoCheckSpell: boolean;
  };
}

export interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  content: string;
  metadata: DocumentItem["metadata"];
}

export interface AppData {
  items: DocumentItem[];
  history: HistoryItem[];
  settings: AppSettings;
  customTemplates: CustomTemplate[];
}
