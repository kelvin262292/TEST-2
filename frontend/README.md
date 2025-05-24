# Frontend - Nền tảng Thương mại Điện tử

## Tổng quan Dự án

Thư mục này chứa ứng dụng frontend cho Nền tảng Thương mại Điện tử. Đây là một ứng dụng trang đơn (SPA) được xây dựng bằng React và Vite, sử dụng Tailwind CSS để tạo kiểu. Frontend tương tác với các API backend để cung cấp giao diện người dùng cho khách hàng và quản trị viên.

## Trạng thái Hiện tại (Tiến độ V1)

Frontend đã triển khai một số tính năng V1 quan trọng:
*   **Xác thực Người dùng:** Các trang đăng ký và đăng nhập người dùng, với trạng thái xác thực được quản lý thông qua `AuthContext.jsx`.
*   **Duyệt Sản phẩm:**
    *   `ProductsPage.jsx` để liệt kê tất cả sản phẩm.
    *   `ProductDetailPage.jsx` được liên kết và có sẵn để xem chi tiết sản phẩm.
*   **Giỏ hàng:** `CartPage.jsx` với chức năng xem, thêm, cập nhật số lượng và xóa sản phẩm, được quản lý thông qua `CartContext.jsx`.
*   **Trang tổng quan Người dùng:** Một `DashboardPage.jsx` cơ bản tồn tại, dành cho người dùng xem lịch sử đơn hàng của họ.
*   **Trang Quản trị (Admin Panel):** Một khu vực quản trị riêng (`/admin`) với:
    *   Giao diện quản lý sản phẩm (`AdminProductsPage.jsx`, `AdminAddProductPage.jsx`, `AdminEditProductPage.jsx`).
    *   Giao diện xem và quản lý đơn hàng cơ bản (`AdminOrdersPage.jsx`, `AdminOrderDetailPage.jsx`).
*   **Định tuyến (Routing):** Định tuyến an toàn và dựa trên vai trò sử dụng `react-router-dom`, `ProtectedRoute.jsx`, và `AdminRoute.jsx`.

Nhiều tính năng frontend V1 vẫn đang được phát triển hoặc chờ xử lý, được trình bày chi tiết trong Lộ trình Phát triển.

## Hướng dẫn Cài đặt

Để cài đặt và chạy máy chủ phát triển frontend:

1.  **Điều hướng đến Thư mục Frontend:**
    ```bash
    cd frontend
    ```

2.  **Cài đặt Dependencies:**
    ```bash
    npm install
    ```

3.  **Biến Môi trường:**
    *   Tạo một tệp `.env` trong thư mục `frontend` nếu nó không tồn tại. Bạn có thể sao chép một ví dụ nếu có hoặc tạo thủ công.
    *   Một biến môi trường phổ biến bạn có thể cần là URL cơ sở cho API backend:
        ```env
        VITE_API_BASE_URL=http://localhost:3001/api
        ```
        Thay thế `http://localhost:3001/api` bằng URL thực tế nếu máy chủ backend của bạn chạy ở nơi khác. Vite sử dụng tiền tố `VITE_` cho các biến môi trường được exposé cho mã phía client.

4.  **Khởi động Máy chủ Phát triển:**
    ```bash
    npm run dev
    ```
    Lệnh này sẽ khởi động máy chủ phát triển Vite, thường có sẵn tại `http://localhost:5173` (hoặc một cổng khác nếu 5173 đang bận).

## Cấu trúc Dự án

Thư mục `src/` chứa mã nguồn cốt lõi cho ứng dụng React:

*   **`pages/`**: Chứa các thành phần cấp cao nhất đại diện cho các chế độ xem hoặc trang khác nhau có thể truy cập thông qua các tuyến đường (ví dụ: `HomePage.jsx`, `ProductsPage.jsx`, `admin/AdminDashboardPage.jsx`).
*   **`components/`**: Chứa các thành phần UI có thể tái sử dụng được sử dụng trên nhiều trang hoặc trong các thành phần khác. Điều này bao gồm các thành phần chuyên biệt như `AdminRoute.jsx` để truy cập chỉ dành cho quản trị viên và `ProtectedRoute.jsx` để truy cập người dùng đã xác thực.
*   **`layouts/`**: Chứa các thành phần cấu trúc xác định bố cục tổng thể cho các phần khác nhau của ứng dụng (ví dụ: `AdminLayout.jsx` cung cấp cấu trúc thanh bên và nội dung chính cho trang quản trị).
*   **`contexts/`**: Triển khai API Context của React để quản lý trạng thái toàn cục. Các context chính bao gồm `AuthContext.jsx` (cho xác thực và dữ liệu người dùng) và `CartContext.jsx` (cho trạng thái và hoạt động của giỏ hàng).
*   **`services/`**: Các module chịu trách nhiệm thực hiện các lệnh gọi API đến backend. Điều này bao gồm một `api.js` chung (thường là một thiết lập instance Axios) và các tệp dịch vụ cụ thể như `productService.js`, `cartService.js`, và `orderService.js`.
*   **`assets/`**: Lưu trữ các tài sản tĩnh như hình ảnh, SVG và các stylesheet toàn cục.

## Lộ trình Phát triển

Lộ trình này phác thảo các tính năng và cải tiến đã được lên kế hoạch cho frontend, dựa trên README chính của dự án.

### Phiên bản 1 (V1) - Nền tảng Thương mại Điện tử Cốt lõi (Tập trung Thị trường Nội địa)

#### Đã hoàn thành/Hiện tại:
*   Các trang đăng ký (`RegisterPage.jsx`) và đăng nhập (`LoginPage.jsx`) người dùng.
*   Trang danh sách sản phẩm (`ProductsPage.jsx`) và trang chi tiết sản phẩm (`ProductDetailPage.jsx`).
*   Chức năng giỏ hàng cơ bản (`CartPage.jsx`, `CartContext.jsx`).
*   Trang tổng quan người dùng cơ bản (`DashboardPage.jsx`) để xem đơn hàng.
*   Các mục trong trang quản trị để xem/quản lý cơ bản sản phẩm và đơn hàng.
*   Các tuyến đường được bảo vệ cho các mục yêu cầu xác thực người dùng và các mục chỉ dành cho quản trị viên.

#### Chờ xử lý/Cần làm (Công việc frontend cho V1 từ README chính):
*   **Trang chủ Động:** Triển khai một trang chủ động với các yếu tố như banner/slider, sản phẩm nổi bật và liên kết danh mục (có thể lấy cảm hứng từ các mockup `GIAO DIENJ 3D` hoặc các thông lệ thương mại điện tử chung).
*   **Danh sách Sản phẩm Nâng cao:**
    *   Triển khai khả năng lọc (ví dụ: theo danh mục, khoảng giá, thương hiệu).
    *   Thêm tùy chọn sắp xếp (ví dụ: theo giá, mức độ phổ biến, mới nhất).
*   **Tìm kiếm Sản phẩm:** Tích hợp thanh tìm kiếm sản phẩm chức năng và hiển thị kết quả.
*   **Quản lý Hồ sơ Người dùng:** Tạo một trang cho người dùng quản lý thông tin cá nhân (tên, mật khẩu) và địa chỉ giao hàng (sổ địa chỉ).
*   **Lịch sử Đơn hàng Chi tiết:** Nâng cao trang tổng quan người dùng để hiển thị lịch sử đơn hàng chi tiết với theo dõi trạng thái cho mỗi đơn hàng.
*   **Quy trình Thanh toán Đầy đủ Chức năng:**
    *   Phát triển `CheckoutPage.jsx` với các biểu mẫu thông tin giao hàng.
    *   Triển khai giao diện người dùng để chọn phương thức vận chuyển (nếu có).
    *   Cung cấp giao diện người dùng để chọn phương thức thanh toán (COD và hiển thị chi tiết Chuyển khoản Ngân hàng theo mục tiêu V1).
    *   Tóm tắt đơn hàng rõ ràng trước khi xác nhận cuối cùng.
*   **Trang Xác nhận Đơn hàng:** Thiết kế và triển khai `OrderConfirmationPage.jsx` thân thiện với người dùng, tóm tắt đơn hàng đã đặt.
*   **Các Trang Thông tin:** Tạo các thành phần/trang cho "Giới thiệu," "Chính sách Đổi trả," "Chính sách Bảo mật," và "Liên hệ." Nội dung ban đầu có thể là tĩnh hoặc được lấy nếu quản trị viên quản lý.
*   **Trang tổng quan Quản trị:** Điền dữ liệu thực tế (cơ bản) vào `AdminDashboardPage.jsx` được lấy từ backend.
*   **Giao diện Quản trị để quản lý danh mục:** Phát triển giao diện người dùng cho quản trị viên thêm, xem, chỉnh sửa và xóa danh mục sản phẩm.
*   **(Nếu có) Giao diện người dùng để áp dụng mã giảm giá:** Thêm các yếu tố giao diện người dùng trong giỏ hàng hoặc thanh toán để áp dụng mã giảm giá, nếu được backend hỗ trợ cho V1.
*   **Giao diện người dùng cho đánh giá và xếp hạng sản phẩm:** Triển khai giao diện người dùng để hiển thị đánh giá sản phẩm và cho phép người dùng gửi xếp hạng và nhận xét trên các trang chi tiết sản phẩm.
*   **Đảm bảo khả năng đáp ứng đầy đủ (Ưu tiên thiết bị di động):** Xác minh và nâng cao khả năng đáp ứng trên tất cả các trang và thành phần.

### Phiên bản 2 (V2) - Cải tiến và Cân nhắc Ban đầu cho Thị trường "Ngoài Nước"
(Tham khảo README chính cho các tác vụ frontend)
*   **Hỗ trợ đa ngôn ngữ trong giao diện người dùng:** Tích hợp thư viện i18n (ví dụ: `react-i18next`) và cung cấp các yếu tố giao diện người dùng để chọn ngôn ngữ.
*   **Các yếu tố giao diện người dùng để chọn/hiển thị tiền tệ:** Đảm bảo giá được hiển thị bằng đơn vị tiền tệ ưa thích của người dùng hoặc phù hợp với khu vực.
*   **Frontend cho tích hợp cổng thanh toán quốc tế mới:** Phát triển các thành phần cho bất kỳ cổng thanh toán mới nào nếu chúng yêu cầu các yếu tố giao diện người dùng cụ thể.
*   **Giao diện người dùng cho hệ thống đánh giá và xếp hạng của khách hàng:** Nâng cao giao diện hiển thị và gửi đánh giá.
*   **Giao diện Trang quản trị Nâng cao:**
    *   Giao diện người dùng cho các tính năng quản lý khách hàng.
    *   Giao diện người dùng để quản lý nội dung (banner, trang động) nếu được quản trị viên chỉnh sửa.
    *   Giao diện người dùng cho phân tích chi tiết hơn.
*   **Giao diện người dùng cho tích hợp thương mại xã hội:** Triển khai các tùy chọn đăng nhập xã hội (Google/Facebook) và các nút chia sẻ xã hội.
*   **Trang danh sách yêu thích và chức năng thêm vào danh sách yêu thích:** Tạo giao diện người dùng để người dùng quản lý danh sách yêu thích và thêm sản phẩm vào đó.

### Phiên bản 3 (V3) - Tính năng Nâng cao và Khả năng Mở rộng
(Tham khảo README chính cho các tác vụ frontend)
*   **Giao diện người dùng cho phân tích và báo cáo nâng cao:** Phát triển các thành phần giao diện người dùng phức tạp để hiển thị dữ liệu nâng cao cho quản trị viên.
*   **Giao diện người dùng cho đề xuất sản phẩm được cá nhân hóa:** Tạo các yếu tố frontend để hiển thị nội dung được cá nhân hóa.
*   **Giao diện người dùng để theo dõi logistics/vận chuyển nâng cao:** Nâng cao giao diện người dùng để theo dõi lô hàng chi tiết nếu backend hỗ trợ.
*   **(Nếu có) Giao diện người dùng cho các tính năng dựa trên AI:** Tích hợp giao diện người dùng cho các tính năng như chatbot dịch vụ khách hàng.
*   **(Nếu có) Giao diện người dùng cho các tính năng thị trường:** Phát triển giao diện người dùng cho trang tổng quan của nhà cung cấp, biểu mẫu gửi sản phẩm, v.v., nếu nền tảng phát triển thành một thị trường.

## Cách Đóng góp
Thông tin chi tiết về việc đóng góp, tiêu chuẩn mã hóa và quy trình pull request sẽ được thêm vào đây.

---
*README này là một tài liệu sống và sẽ được cập nhật khi dự án tiến triển.*
