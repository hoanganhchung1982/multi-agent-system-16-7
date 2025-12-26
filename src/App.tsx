// 1. Nhập Component SmasMain mà bạn đã tạo ở bước trước
import SmasMain from './components/SmasMain';
import './index.css'; // Giữ lại để nếu bạn có thêm CSS riêng

function App() {
  return (
    // 2. Gọi Component ra để hiển thị. 
    // Mình bọc trong một thẻ div để đảm bảo nền (background) luôn đẹp.
    <div className="min-h-screen bg-slate-200 py-8">
      <SmasMain />
    </div>
  );
}

export default App;