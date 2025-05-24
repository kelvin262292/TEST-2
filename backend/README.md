# Backend - Nền tảng Thương mại Điện tử

## Tổng quan Dự án

Thư mục này chứa các dịch vụ backend cho Nền tảng Thương mại Điện tử. Đây là một ứng dụng Node.js được xây dựng bằng framework Express.js và sử dụng cơ sở dữ liệu PostgreSQL. Backend cung cấp các RESTful API để hỗ trợ tất cả các chức năng của web client (giao diện người dùng) và admin panel (trang quản trị).

## Trạng thái Hiện tại (Tiến độ V1)

Backend đã triển khai thành công một phần đáng kể các yêu cầu cốt lõi của V1:
*   **Xác thực Người dùng:** Các API mạnh mẽ cho việc đăng ký người dùng, đăng nhập (sử dụng JWT) và phân quyền dựa trên vai trò (người dùng/quản trị viên) đã sẵn sàng.
*   **Quản lý Sản phẩm:** Các API CRUD (Tạo, Đọc, Cập nhật, Xóa) đầy đủ cho sản phẩm đã có và được bảo vệ cho người dùng quản trị. Các API công khai để liệt kê và xem sản phẩm cũng đã được triển khai.
*   **Quản lý Giỏ hàng:** Các API để quản lý giỏ hàng của người dùng (thêm, xem, cập nhật sản phẩm, xóa giỏ hàng) đang hoạt động.
*   **Xử lý Đơn hàng:** Các API cơ bản để tạo đơn hàng (từ giỏ hàng), xem các đơn hàng cụ thể của người dùng và truy xuất đơn hàng cấp quản trị cũng như cập nhật trạng thái đơn hàng đã được triển khai.
*   **Tài liệu API:** Swagger UI được tích hợp để cung cấp tài liệu API tương tác.

Một số tính năng backend của V1 vẫn đang chờ xử lý, được trình bày chi tiết trong Lộ trình Phát triển.

## Hướng dẫn Cài đặt

Để khởi chạy máy chủ backend, hãy làm theo các bước sau:

1.  **Điều hướng đến Thư mục Backend:**
    ```bash
    cd backend
    ```

2.  **Cài đặt Dependencies:**
    ```bash
    npm install
    ```

3.  **Cấu hình Biến Môi trường:**
    *   Tạo một tệp `.env` bằng cách sao chép tệp ví dụ:
        ```bash
        cp .env.example .env
        ```
    *   Mở tệp `.env` và cập nhật nó với thông tin xác thực cơ sở dữ liệu PostgreSQL thực tế của bạn (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`), một `JWT_SECRET` an toàn để tạo token và `PORT` mong muốn cho máy chủ.

4.  **Cài đặt Cơ sở dữ liệu:**
    *   Đảm bảo bạn có một máy chủ PostgreSQL đang chạy và có thể truy cập bằng thông tin xác thực bạn đã cung cấp trong tệp `.env`.
    *   Lược đồ cơ sở dữ liệu (định nghĩa bảng) nằm ở `src/database/schema.sql`. Bạn sẽ cần thực thi tập lệnh SQL này trên cơ sở dữ liệu PostgreSQL của mình để tạo các bảng và hàm cần thiết. Đây hiện là một bước thủ công. Các cải tiến trong tương lai có thể bao gồm một hệ thống migration.

5.  **Khởi động Máy chủ Backend:**
    ```bash
    npm start
    ```
    Lệnh này chạy `node src/app.js`. Máy chủ thường sẽ khởi động trên `PORT` được định nghĩa trong tệp `.env` của bạn (mặc định là 3001).

## Tài liệu API

Tài liệu API tương tác sử dụng Swagger UI có sẵn khi máy chủ backend đang chạy. Bạn có thể truy cập nó tại điểm cuối `/api-docs` (ví dụ: `http://localhost:3001/api-docs`).
Cấu hình Swagger (`src/config/swagger.config.js`) bao gồm các lược đồ chi tiết cho các yêu cầu và phản hồi.

## Lược đồ Cơ sở dữ liệu

Backend sử dụng cơ sở dữ liệu PostgreSQL. Lược đồ được định nghĩa trong `src/database/schema.sql`.

**Các Bảng Chính:**

*   **`users`**: Lưu trữ thông tin người dùng, bao gồm thông tin đăng nhập (mật khẩu đã băm) và vai trò (ví dụ: 'user', 'admin').
*   **`categories`**: Lưu trữ các danh mục sản phẩm để giúp tổ chức sản phẩm.
*   **`products`**: Chứa thông tin chi tiết về sản phẩm, như tên, mô tả, giá, số lượng tồn kho và liên kết danh mục.
*   **`carts`**: Đại diện cho giỏ hàng của người dùng, liên kết với người dùng. Mỗi người dùng có một giỏ hàng duy nhất.
*   **`cart_items`**: Lưu trữ các mặt hàng trong giỏ hàng của người dùng, bao gồm ID sản phẩm, số lượng và giá tại thời điểm thêm vào.
*   **`orders`**: Chứa thông tin về đơn đặt hàng của khách hàng, như ID người dùng, tổng số tiền, địa chỉ giao hàng, chi tiết thanh toán và trạng thái đơn hàng.
*   **`order_items`**: Chi tiết các sản phẩm cụ thể, số lượng và giá cho mỗi mặt hàng trong một đơn hàng.

**Tự động hóa Timestamp:**

*   Một hàm PL/pgSQL, `trigger_set_timestamp()`, được sử dụng.
*   Các trigger được áp dụng cho tất cả các bảng chính để tự động cập nhật cột `updated_at` thành timestamp hiện tại mỗi khi một hàng được sửa đổi.

## Lộ trình Phát triển

Lộ trình này phác thảo các tính năng và cải tiến đã được lên kế hoạch, phần lớn dựa trên README chính của dự án.

### Phiên bản 1 (V1) - Nền tảng Thương mại Điện tử Cốt lõi (Tập trung Thị trường Nội địa)

#### Đã hoàn thành/Hiện tại:
*   Hệ thống xác thực người dùng (đăng ký, đăng nhập, JWT, vai trò).
*   API quản lý sản phẩm (CRUD cho quản trị viên, quyền đọc công khai).
*   API quản lý giỏ hàng cơ bản (thêm, xem, cập nhật, xóa sản phẩm).
*   API tạo và truy xuất đơn hàng cơ bản (quyền truy cập của người dùng cụ thể và quản trị viên).
*   API quản trị để quản lý chi tiết sản phẩm và trạng thái đơn hàng.
*   Theo dõi hàng tồn kho cơ bản (trường số lượng tồn kho trên sản phẩm).

#### Chờ xử lý/Cần làm (Công việc backend cho V1):
*   **Quản lý Hồ sơ Người dùng:**
    *   API cho người dùng quản lý thông tin cá nhân của họ (ví dụ: cập nhật tên, mật khẩu).
    *   API để quản lý địa chỉ người dùng (chức năng sổ địa chỉ).
*   **Cải tiến Đơn hàng:**
    *   API cho lịch sử đơn hàng chi tiết hơn và theo dõi trạng thái chi tiết hiển thị cho người dùng.
*   **Trang tổng quan Quản trị & Tính năng:**
    *   API cung cấp số liệu thống kê cho trang tổng quan quản trị (ví dụ: doanh số, người dùng mới, sản phẩm phổ biến).
    *   API cho quản trị viên quản lý danh mục sản phẩm (CRUD cho danh mục).
*   **Phương thức Thanh toán:**
    *   Tinh chỉnh logic xử lý đơn hàng COD.
    *   API hỗ trợ và quản lý thông tin cho các phương thức thanh toán V1 khác (ví dụ: chi tiết chuyển khoản ngân hàng, có thể có API quản trị để cấu hình).
    *   Cơ chế cho quản trị viên xác nhận thanh toán thủ công.
*   **Thông báo:**
    *   Triển khai hệ thống thông báo qua email cho các sự kiện như xác nhận đơn hàng và cập nhật trạng thái.
*   **Quản lý Nội dung:**
    *   (Nếu nội dung tĩnh như "Giới thiệu", "Chính sách" được quản lý bởi quản trị viên) Các điểm cuối API để truy xuất/cập nhật nội dung của các trang thông tin.
*   **Hàng tồn kho & Giảm giá:**
    *   Tinh chỉnh logic cập nhật hàng tồn kho trong quá trình đặt hàng để tránh bán quá số lượng.
    *   (Nếu có cho V1) API để tạo và xác thực mã giảm giá cơ bản.
*   **Cải tiến Vận hành:**
    *   Nâng cao và chuẩn hóa xử lý lỗi trên tất cả các điểm cuối API.
    *   Cải thiện ghi log để gỡ lỗi và giám sát.

### Phiên bản 2 (V2) - Cải tiến và Cân nhắc Ban đầu cho Thị trường "Ngoài Nước"

*   **Quốc tế hóa:**
    *   API hỗ trợ thông tin sản phẩm đa ngôn ngữ (tên, mô tả).
    *   API xử lý hiển thị và xử lý đa tiền tệ (chuyển đổi giá, tùy chọn tiền tệ của người dùng).
*   **Mở rộng Thanh toán:**
    *   Tích hợp với các cổng thanh toán quốc tế (ví dụ: Stripe, PayPal).
*   **Trải nghiệm Người dùng & Tính năng:**
    *   API hỗ trợ lọc sản phẩm nâng cao (ví dụ: theo thuộc tính, xếp hạng) và cải thiện khả năng tìm kiếm.
    *   API cho hệ thống đánh giá và xếp hạng của khách hàng.
    *   API hỗ trợ chức năng danh sách yêu thích (wishlist).
*   **Cải tiến Trang quản trị:**
    *   API quản lý khách hàng cơ bản (xem danh sách khách hàng, có thể có giao tiếp).
    *   API phân tích và báo cáo chi tiết hơn cho quản trị viên.
    *   API quản lý nội dung trang chủ (banner, sản phẩm nổi bật) nếu chưa thực hiện trong V1.
*   **Thương mại Xã hội (Social Commerce):**
    *   Hỗ trợ backend/API nếu bất kỳ tính năng thương mại xã hội nào yêu cầu logic phía máy chủ (ví dụ: nguồn cấp dữ liệu sản phẩm).

### Phiên bản 3 (V3) - Tính năng Nâng cao và Khả năng Mở rộng

*   **Phân tích & Cá nhân hóa Nâng cao:**
    *   API cho phân tích và báo cáo toàn diện.
    *   Backend cho một công cụ cá nhân hóa (ví dụ: đề xuất sản phẩm dựa trên hành vi người dùng).
*   **Khả năng Mở rộng & Hiệu suất:**
    *   Điều tra và triển khai các cải tiến về khả năng mở rộng (ví dụ: tối ưu hóa cơ sở dữ liệu, chiến lược bộ nhớ đệm, tiềm năng cho microservices cho các chức năng cụ thể).
*   **Logistics & Tích hợp:**
    *   API để tích hợp sâu hơn với các nhà cung cấp dịch vụ logistics và vận chuyển tiên tiến.
*   **Tính năng dựa trên AI:**
    *   Hỗ trợ backend cho các tính năng dựa trên AI (ví dụ: tìm kiếm dựa trên AI, chatbot dịch vụ khách hàng).
*   **Chức năng Thị trường (Marketplace):**
    *   (Nếu có kế hoạch) API hỗ trợ nhiều nhà cung cấp, sản phẩm theo nhà cung cấp và cấu trúc hoa hồng.

## Cách Đóng góp

Thông tin chi tiết về việc đóng góp vào phát triển backend, bao gồm các tiêu chuẩn mã hóa, quản lý nhánh và quy trình pull request, sẽ được thêm vào đây. Chúng tôi khuyến khích các đóng góp phù hợp với lộ trình phát triển và nâng cao sự ổn định cũng như bộ tính năng của nền tảng.

---
*README này là một tài liệu sống và sẽ được cập nhật khi dự án tiến triển.*
