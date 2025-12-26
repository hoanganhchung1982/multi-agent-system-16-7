import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Khởi tạo AI với Key của bạn (Lấy từ Environment Variables trên Vercel)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { image, prompt, role, instruction } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. PROMPT SIÊU ĐẲNG CẤP: Ép AI trả về đúng cấu trúc để App bóc tách được
    const finalPrompt = `
      Bạn là chuyên gia: ${role}.
      Nhiệm vụ: ${instruction}
      Yêu cầu thêm từ người dùng: ${prompt}

      QUY ĐỊNH TRẢ VỀ (BẮT BUỘC):
      1. Nội dung giải phải trình bày đẹp, dùng LaTeX cho công thức (ví dụ: $$x^2 + y^2 = z^2$$).
      2. Sau khi giải xong, phải có một dòng phân cách rõ ràng.
      3. Cuối cùng, trả về 1 câu thuyết minh mấu chốt theo định dạng: 
         THUYET_MINH_START: [Nội dung câu thuyết minh mấu chốt nhất để học sinh ghi nhớ] :THUYET_MINH_END
    `;

    // 3. Chuyển đổi dữ liệu ảnh (Base64) để AI đọc được
    const imageData = {
      inlineData: {
        data: image.split(',')[1],
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([finalPrompt, imageData]);
    const response = await result.response;
    const fullText = response.text();

    // 4. BÓC TÁCH DỮ LIỆU (Siêu Sạch)
    // Tìm câu thuyết minh nằm giữa 2 tag đã định nghĩa
    const tmStart = fullText.indexOf("THUYET_MINH_START:") + 18;
    const tmEnd = fullText.indexOf(":THUYET_MINH_END");
    
    const thuyetMinh = tmStart > 17 && tmEnd > -1 
      ? fullText.substring(tmStart, tmEnd).trim() 
      : "Hãy tập trung vào phương pháp giải bài toán này nhé!";

    const cleanText = fullText.split("THUYET_MINH_START:")[0].trim();

    // Trả về cho Client
    res.status(200).json({
      text: cleanText,
      thuyetMinh: thuyetMinh
    });

  } catch (error) {
    console.error("Đang tìm kiếm máy chủ ...", error);
    res.status(500).json({ error: "Đang tải dữ liệu ..." });
  }
}