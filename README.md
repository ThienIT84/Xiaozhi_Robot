# Dự án Robot Xiaozhi - ESP32 Custom Edition

Dự án này là một phiên bản tùy chỉnh của framework Robot Xiaozhi, được tối ưu hóa cho phần cứng cụ thể và tích hợp thêm các tính năng giám sát năng lượng thông qua giao thức MQTT.

## 🛠 Cấu hình Phần cứng (Hardware Specifications)

Phiên bản này sử dụng board cấu hình `compact-wifi-board-lcd` với các thông số kỹ thuật chi tiết như sau:

### 1. Màn hình hiển thị (Display)
*   **Loại:** LCD 1.54 inch ST7789 SPI.
*   **Độ phân giải:** 240x240.
*   **Sơ đồ chân (Pinout):**
    *   MOSI (SDA): GPIO 2
    *   SCLK (SCL): GPIO 1
    *   DC: GPIO 41
    *   RST: GPIO 42
    *   CS: GPIO 21

### 2. Hệ thống Servo (6-DOF Motion)
Robot được trang bị 6 Servo điều chỉnh các khớp chân và tay:
*   **Servo 1 & 5:** Hip Left/Right (GPIO 3, 7)
*   **Servo 4 & 6:** Ankle Left/Right (GPIO 5, 9)
*   **Servo 2 & 3:** Arm Left/Right (GPIO 8, 4)
*   *Lưu ý:* Hệ thống đã được hiệu chỉnh giá trị `TRIM` và `INVERT_DIRECTION` riêng biệt cho từng khớp để đảm bảo chuyển động chính xác.

### 3. Hệ thống Âm thanh (Audio)
*   **DAC/Speaker:** MAX98357A (I2S Simplex).
*   **Pins:** DOUT (16), BCLK (46), LRCK (45).

---

## 🚀 Tính năng tùy chỉnh nổi bật (Custom Features)

### 1. Giám sát năng lượng PZEM-004T
Robot tích hợp khả năng nhận dữ liệu đo lường điện năng (Điện áp, Dòng điện, Công suất) từ một module PZEM-004T bên ngoài thông qua MQTT Broker.
*   **Topic:** `esp32c3/pzem/data`
*   **Dữ liệu:** Cập nhật thời gian thực vào trạng thái hệ thống.

### 2. Tích hợp Nhà thông minh (Smart Home Integration)
Sử dụng `McpServer` để mở rộng các công cụ điều khiển bằng giọng nói:
*   **Công cụ `set_lamp`:** Cho phép Robot điều khiển bật/tắt đèn thông qua lệnh MQTT đến topic `esp32c3/lamp/set`.
*   **Công cụ `get_power_status`:** Robot có thể báo cáo thông số điện năng tiêu thụ khi được hỏi.

### 3. Hệ thống Event Handler thông minh
Mã nguồn đã được viết lại phần xử lý sự kiện mạng:
*   Tự động kết nối MQTT khi có IP (`IP_EVENT_STA_GOT_IP`).
*   Cơ chế `s_mqtt_started` giúp quản lý trạng thái kết nối ổn định, tránh lặp lại tiến trình.

---

## 📂 Hướng dẫn cài đặt (Installation)

1.  **Cài đặt môi trường:** Yêu cầu ESP-IDF v5.x.
2.  **Cấu hình dự án:**
    ```bash
    idf.py set-target esp32s3
    idf.py menuconfig
    ```
    *(Đảm bảo đã chọn đúng cấu hình board `compact-wifi-board-lcd` trong menuconfig)*
3.  **Build và Nạp:**
    ```bash
    idf.py build
    idf.py flash monitor
    ```

---

## 📜 Giấy phép và Ghi công (License & Credits)
*   **Mã nguồn gốc:** [Xiaozhi-ESP32](https://github.com/78/xiaozhi-esp32)
*   **Phiên bản tùy chỉnh:** Thực hiện phục vụ mục đích học tập và nghiên cứu.
*   **Giấy phép:** Tuân thủ giấy phép mã nguồn mở của dự án gốc.
