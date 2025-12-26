// src/lib/api-handler.ts

export const solveWith3Agents = async (imageData: string, userInput: string) => {
  // Định nghĩa 3 vai trò chuyên gia (Siêu Đẳng Cấp)
  const agents = [
    { 
      id: 'quick', 
      role: 'Chuyên gia Giải Nhanh', 
      instruction: 'Giải ngắn gọn, đi thẳng vào đáp án và mẹo tính nhanh.' 
    },
    { 
      id: 'pro', 
      role: 'Giáo sư Sư Phạm', 
      instruction: 'Giảng giải chi tiết từng bước, phân tích bản chất bài toán.' 
    },
    { 
      id: 'extra', 
      role: 'Chuyên gia Mở Rộng', 
      instruction: 'Đưa ra các bài tập tương tự và lưu ý các bẫy thường gặp.' 
    }
  ];

  try {
    // SIÊU NHANH: Kích hoạt đồng thời 3 luồng (Parallel)
    // Dùng Promise.allSettled để nếu 1 ông lỗi thì 2 ông còn lại vẫn chạy
    const results = await Promise.allSettled(
      agents.map(agent =>
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
          if (!res.ok) throw new Error("Các chuyên gia đang trao đổi ...");
          return res.json();
        })
      )
    );

    // Xử lý dữ liệu trả về để khớp với State kết quả
    return {
      quick: results[0].status === 'fulfilled' ? results[0].value.text : "Chuyên gia đang giải bài....",
      pro: results[1].status === 'fulfilled' ? results[1].value.text : "Giáo sư đang tìm lời giải...",
      extra: results[2].status === 'fulfilled' ? results[2].value.text : "Đang tải dữ liệu....."
    };

  } catch (error) {
    console.error("Đang tải dữ liệu ....", error);
    throw error;
  }
};