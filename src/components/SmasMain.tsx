import React, { useState } from 'react';
import { Scissors, Mic, Send, BookOpen, Zap, Lightbulb, Volume2, Loader2, CheckCircle2 } from 'lucide-react';
import { compressImage } from '../lib/imageProcessor';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; 

export default function SmasMain() {
  const [activeTab, setActiveTab] = useState<'quick' | 'pro' | 'extra'>('quick');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userInput, setUserInput] = useState(""); 
  const [imageData, setImageData] = useState<string | null>(null);

  const [results, setResults] = useState({
    quick: { text: "Đang chờ dữ liệu giải nhanh...", thuyetMinh: "" },
    pro: { text: "Đang chờ phân tích từ Giáo sư...", thuyetMinh: "" },
    extra: { text: "Đang chờ kiến thức mở rộng...", thuyetMinh: "" }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setImageData(compressed as string);
      } catch (error) {
        alert("Lỗi xử lý ảnh, vui lòng thử lại!");
      }
    }
  };

  const handleSolve = async () => {
    if (!imageData) return alert("Vui lòng chọn ảnh đề bài trước!");
    setIsProcessing(true);

 const agents = [
  { 
    id: 'quick', 
    role: 'Chuyên gia Giải Nhanh (S-Quick)', 
    instruction: `Bạn là một chuyên gia giải đề thi trắc nghiệm siêu tốc. 
    NHIỆM VỤ:
    - Đi thẳng vào đáp án và phương pháp tối ưu nhất (ví dụ: mẹo loại trừ, bấm máy Casio, công thức tính nhanh).
    - Trình bày cực kỳ ngắn gọn, không rườm rà.
    - Sử dụng $$ cho mọi công thức toán học.
    ĐỊNH DẠNG CUỐI BÀI: 
    THUYET_MINH_START: Câu mấu chốt để giải nhanh dạng bài này là gì? :THUYET_MINH_END` 
  },
  { 
    id: 'pro', 
    role: 'Giáo sư Sư Phạm (S-Pro)', 
    instruction: `Bạn là một Giáo sư sư phạm tận tâm. 
    NHIỆM VỤ:
    - Giải bài toán theo từng bước khoa học (B1, B2, B3...).
    - Giải thích rõ "Tại sao lại làm như vậy" để học sinh hiểu bản chất kiến thức.
    - Sử dụng $$ cho mọi công thức toán học.
    ĐỊNH DẠNG CUỐI BÀI: 
    THUYET_MINH_START: Điểm quan trọng nhất em cần ghi nhớ để không bị lừa ở bài này là gì? :THUYET_MINH_END` 
  },
  { 
    id: 'extra', 
    role: 'Chuyên gia Mở Rộng (S-Extra)', 
    instruction: `Bạn là một chuyên gia tư duy và sáng tạo. 
    NHIỆM VỤ:
    - Đưa ra 1-2 ví dụ tương tự hoặc nâng cao hơn từ bài toán gốc.
    - Nhắc lại các định lý hoặc kiến thức liên quan cần thuộc lòng.
    - Sử dụng $$ cho mọi công thức toán học.
    ĐỊNH DẠNG CUỐI BÀI: 
    THUYET_MINH_START: Em có biết kiến thức này còn được ứng dụng thực tế trong lĩnh vực nào không? :THUYET_MINH_END` 
  }
];
 
 

    try {
      const requests = agents.map(agent => 
        fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imageData,
            prompt: userInput,
            role: agent.role,
            instruction: agent.instruction
          })
        }).then(res => {
          if (!res.ok) throw new Error("Đang cập nhật dữ liệu");
          return res.json();
        })
      );

      const responses = await Promise.allSettled(requests);

      setResults({
        quick: responses[0].status === 'fulfilled' ? (responses[0] as any).value : { text: "Chuyên gia đang giải bài...", thuyetMinh: "" },
        pro: responses[1].status === 'fulfilled' ? (responses[1] as any).value : { text: "Giáo sư đang giải bài ...", thuyetMinh: "" },
        extra: responses[2].status === 'fulfilled' ? (responses[2] as any).value : { text: "Dữ liệu đang cập nhật...", thuyetMinh: "" }
      });

    } catch (error) {
      alert("Hệ thống đang tải, xin hãy chờ...");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleThuyetMinh = () => {
    const textToRead = results[activeTab].thuyetMinh;
    if (!textToRead) return alert("Đang tải dữ liệu thuyết minh!");
    window.speechSynthesis.cancel(); // Dừng các âm thanh đang đọc dở
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'vi-VN';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col shadow-2xl border-x border-gray-100 font-sans">
      
      <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black italic tracking-tighter">SM-AS <span className="text-yellow-400">PRO</span></h1>
            <p className="text-[9px] opacity-80 font-bold uppercase tracking-[0.2em]">3S + 1S Technology</p>
          </div>
          {imageData && <CheckCircle2 className="text-green-400 animate-bounce" size={20} />}
        </div>
      </div>

      <div className="p-4 space-y-4 bg-slate-50/50 flex-grow">
        <div className="relative border-2 border-dashed border-blue-200 rounded-2xl p-5 bg-white hover:border-blue-500 transition-all group shadow-sm">
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
          <div className="flex flex-col items-center gap-2">
            <Scissors className="text-blue-600" size={24} />
            <span className="text-xs font-black text-blue-700 uppercase">
              {imageData ? "Đã nhận ảnh" : "Chụp & Nén ảnh đề bài"}
            </span>
          </div>
        </div>

        <div className="relative">
          <input 
            type="text" 
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Yêu cầu thêm..."
            className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-5 pr-12 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          />
          <Mic className="absolute right-3 top-3.5 text-red-500" size={18} />
        </div>

        <button 
          onClick={handleSolve}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:bg-slate-300 transition-all active:scale-95 uppercase text-sm"
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : <Send size={18} />}
          {isProcessing ? "Đang giải song song..." : "Bắt đầu giải ngay"}
        </button>

        <div className="flex p-1 bg-slate-200/50 rounded-xl gap-1">
          <TabBtn id="quick" label="Giải Nhanh" active={activeTab} set={setActiveTab} icon={<Zap size={14}/>} />
          <TabBtn id="pro" label="Giáo Sư" active={activeTab} set={setActiveTab} icon={<BookOpen size={14}/>} />
          <TabBtn id="extra" label="Mở Rộng" active={activeTab} set={setActiveTab} icon={<Lightbulb size={14}/>} />
        </div>

        {/* --- KHU VỰC HIỂN THỊ SIÊU ĐẲNG CẤP (LaTeX) --- */}
        <div className="bg-white rounded-2xl p-5 shadow-inner border border-slate-100 min-h-[300px]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-50">
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest">Lời giải chính xác</span>
            <button 
              onClick={handleThuyetMinh}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-[11px] font-black shadow-lg"
            >
              <Volume2 size={14} /> Thuyết minh
            </button>
          </div>

          <div className="text-slate-700 leading-relaxed text-base font-medium">
            {/* SỬ DỤNG REACT-MARKDOWN ĐỂ RENDER LATEX */}
            <ReactMarkdown 
              remarkPlugins={[remarkMath]} 
              rehypePlugins={[rehypeKatex]}
              className="markdown-content"
            >
              {results[activeTab].text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ id, label, active, set, icon }: any) {
  const isActive = active === id;
  return (
    <button 
      onClick={() => set(id)}
      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-black text-[10px] uppercase transition-all ${
        isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
      }`}
    >
      {icon} {label}
    </button>
  );
}