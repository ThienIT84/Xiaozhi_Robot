# CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI

## 1.1. Đặt vấn đề

### 1.1.1. Bối cảnh nghiên cứu

Trong những năm gần đây, sự phát triển vượt bậc của trí tuệ nhân tạo (AI) đã mở ra kỷ nguyên mới cho công nghệ robot. Đặc biệt, giai đoạn 2024-2025 chứng kiến một cuộc cách mạng trong lĩnh vực mô hình ngôn ngữ lớn (Large Language Models - LLM) với sự xuất hiện của các mô hình chi phí thấp nhưng hiệu suất cao như DeepSeek-V3, Qwen, và GPT-4o. Theo báo cáo của DeepSeek AI (2024), chi phí sử dụng API của DeepSeek-V3 chỉ bằng 1/20 so với GPT-4 nhưng đạt hiệu suất trên 90% trong các bài kiểm tra chuẩn, giúp việc tích hợp AI vào các thiết bị nhúng trở nên khả thi về mặt kinh tế.

Song song với đó, xu hướng "dân chủ hóa công nghệ robot" đang diễn ra mạnh mẽ thông qua các dự án mã nguồn mở. Dự án Xiaozhi-ESP32 (github.com/78/xiaozhi-esp32) là một minh chứng điển hình, cho phép bất kỳ nhà phát triển nào cũng có thể xây dựng một robot AI tương tác với chi phí phần cứng chỉ khoảng 10-15 USD. Đến tháng 1/2025, dự án đã thu hút hơn 8,000 stars trên GitHub và hỗ trợ hơn 70 loại board phần cứng khác nhau.

Trong bối cảnh Internet of Things (IoT) và Smart Home đang phát triển, nhu cầu về một trợ lý AI có khả năng tương tác tự nhiên bằng giọng nói và điều khiển các thiết bị thông minh ngày càng trở nên cấp thiết. Tuy nhiên, các giải pháp thương mại như Amazon Alexa, Google Home thường có chi phí cao và hạn chế về khả năng tùy biến.

### 1.1.2. Vấn đề nghiên cứu

Mặc dù công nghệ AI và robot đã phát triển mạnh mẽ, việc xây dựng một robot tương tác thông minh vẫn đối mặt với nhiều thách thức:

**Về kiến trúc hệ thống:**
- Xử lý toàn bộ AI trên Cloud gây độ trễ cao (200-500ms) và chi phí băng thông lớn
- Xử lý hoàn toàn trên Edge bị giới hạn bởi tài nguyên phần cứng của vi điều khiển
- Cần một kiến trúc lai tối ưu giữa Edge và Cloud để cân bằng hiệu suất và chi phí


**Về tương tác giọng nói:**
- Nhận diện wake-word cần hoạt động liên tục với tiêu thụ điện năng thấp
- Xử lý âm thanh trong môi trường nhiễu (echo, noise) đòi hỏi thuật toán phức tạp
- Độ trễ từ lúc nói đến khi robot phản hồi cần đạt dưới 1 giây để trải nghiệm tự nhiên

**Về điều khiển thiết bị:**
- Thiếu giao thức chuẩn để robot giao tiếp với các thiết bị IoT đa dạng
- Khó khăn trong việc mở rộng chức năng mà không cần lập trình lại toàn bộ hệ thống
- Cần cơ chế cho phép LLM hiểu và điều khiển thiết bị vật lý một cách tự nhiên

**Về chuyển động robot:**
- Điều khiển nhiều servo motor đồng thời gây tiêu thụ điện lớn, dễ xảy ra brownout
- Cần thuật toán di chuyển ổn định cho robot 2 chân với tài nguyên tính toán hạn chế
- Đồng bộ giữa chuyển động và phản hồi giọng nói để tạo trải nghiệm tự nhiên

### 1.1.3. Tính cấp thiết của đề tài

Đề tài nghiên cứu này có tính cấp thiết cao vì những lý do sau:

**Về mặt công nghệ:** Kiến trúc Edge-Cloud kết hợp với giao thức MCP (Model Context Protocol) là xu hướng mới trong phát triển robot AI, cho phép tận dụng sức mạnh của LLM mà vẫn đảm bảo phản hồi thời gian thực. Việc nghiên cứu và triển khai thành công kiến trúc này trên nền tảng ESP32 sẽ mở ra hướng đi mới cho các ứng dụng robot chi phí thấp.

**Về mặt giáo dục:** Đề tài tích hợp đa lĩnh vực (AI, IoT, Robotics, Embedded Systems), giúp sinh viên có cái nhìn toàn diện về quy trình phát triển sản phẩm công nghệ từ thiết kế đến triển khai thực tế.

**Về mặt ứng dụng:** Robot có khả năng tương tác tự nhiên và điều khiển thiết bị thông minh có tiềm năng ứng dụng rộng rãi trong gia đình, văn phòng, và giáo dục, đặc biệt phù hợp với xu hướng Smart Home đang phát triển mạnh tại Việt Nam.

**Về mặt kinh tế:** Với chi phí phần cứng chỉ khoảng 300,000 - 500,000 VNĐ, đề tài chứng minh rằng công nghệ robot AI không còn là đặc quyền của các tập đoàn lớn mà có thể tiếp cận được với cộng đồng maker và sinh viên.

## 1.2. Mục tiêu nghiên cứu

### 1.2.1. Mục tiêu tổng quát

Nghiên cứu, thiết kế và xây dựng robot tương tác thông minh Xiaozhi dựa trên vi điều khiển ESP32-S3, có khả năng giao tiếp bằng giọng nói tiếng Việt, thực hiện các chuyển động cơ bản (đi, quay, vẫy tay), và điều khiển các thiết bị trong hệ thống Smart Home thông qua giao thức MCP.


### 1.2.2. Mục tiêu cụ thể

**Về nghiên cứu lý thuyết:**
- Phân tích kiến trúc lai Edge-Cloud cho robot AI, xác định ranh giới xử lý tối ưu giữa thiết bị nhúng và cloud server
- Nghiên cứu giao thức MCP (Model Context Protocol) và cách thức tích hợp với LLM để điều khiển thiết bị vật lý
- So sánh các mô hình LLM phù hợp cho ứng dụng robot (GPT-4o, DeepSeek-V3, Qwen) về mặt độ trễ, chi phí và chất lượng phản hồi

**Về thiết kế hệ thống:**
- Thiết kế kiến trúc tổng thể cho robot Xiaozhi với các module: Audio Processing, Motion Control, Smart Home Integration, và MCP Server
- Xây dựng sơ đồ kết nối phần cứng cho board bread-compact-wifi-lcd với 6 servo motor, màn hình LCD ST7789, và hệ thống âm thanh I2S
- Thiết kế luồng xử lý dữ liệu từ wake-word detection đến phản hồi giọng nói và thực thi hành động

**Về chế tạo và lắp ráp:**
- Lựa chọn và tích hợp các linh kiện phù hợp: ESP32-S3 N16R8, microphone I2S, loa MAX98357A, 6 servo SG90, màn hình LCD 240x240
- Thiết kế khung cơ khí cho robot 2 chân với khả năng di chuyển ổn định
- Tối ưu hóa nguồn điện để đảm bảo hoạt động ổn định khi điều khiển nhiều servo đồng thời

**Về lập trình và tích hợp:**
- Phát triển firmware trên nền tảng ESP-IDF 5.4 với cấu trúc module rõ ràng (audio, display, servo, mcp, protocols)
- Tích hợp Espressif Audio Front-End (AFE) và WakeNet để nhận diện wake-word "Hey Bo" offline
- Triển khai giao thức WebSocket để kết nối với Xiaozhi Cloud Server (xiaozhi.me)
- Lập trình MCP tools để điều khiển relay (bật/tắt đèn) và đọc dữ liệu điện năng từ PZEM-004T qua MQTT
- Phát triển thuật toán di chuyển 4 pha (Otto-style) cho robot 2 chân với khả năng đi tiến, lùi, quay trái/phải, và vẫy tay

**Về đánh giá và thử nghiệm:**
- Đo lường độ trễ phản hồi từ wake-word đến khi robot bắt đầu nói (mục tiêu < 1.5 giây)
- Kiểm tra độ chính xác nhận diện wake-word trong môi trường nhiễu
- Đánh giá khả năng điều khiển thiết bị Smart Home thông qua lệnh giọng nói
- Thử nghiệm độ ổn định của các chuyển động robot trên các bề mặt khác nhau

## 1.3. Đối tượng và phạm vi nghiên cứu

### 1.3.1. Đối tượng nghiên cứu

Đề tài tập trung nghiên cứu các đối tượng sau:

**Phần cứng:**
- Vi điều khiển ESP32-S3 N16R8 (Dual-core Xtensa LX7, 16MB Flash, 8MB PSRAM)
- Hệ thống âm thanh: Microphone I2S, loa MAX98357A, codec âm thanh OPUS
- Màn hình LCD ST7789 240x240 pixels với giao tiếp SPI
- 6 động cơ servo SG90 (180°) cho hệ thống chuyển động
- Module truyền thông: WiFi 802.11 b/g/n tích hợp trên ESP32-S3


**Phần mềm:**
- Firmware Xiaozhi-ESP32 v2.2.2 (mã nguồn mở, MIT License)
- ESP-IDF 5.4 (Espressif IoT Development Framework)
- Espressif Audio Front-End (AFE) SR v2.0 - xử lý âm thanh thời gian thực
- WakeNet 9 - mô hình nhận diện wake-word offline
- Giao thức WebSocket cho truyền thông real-time
- Giao thức MQTT cho điều khiển Smart Home

**Dịch vụ Cloud:**
- Xiaozhi Cloud Server (xiaozhi.me) - cung cấp STT, LLM, TTS
- GPT-4o (OpenAI) - mô hình ngôn ngữ lớn cho xử lý hội thoại
- MQTT Broker (192.168.1.8:1883) - trung gian truyền thông IoT

**Giao thức và chuẩn:**
- MCP (Model Context Protocol) - giao thức điều khiển thiết bị dựa trên JSON-RPC 2.0
- OPUS Audio Codec - nén âm thanh với frame duration 60ms
- I2S (Inter-IC Sound) - giao tiếp âm thanh số
- PWM (Pulse Width Modulation) - điều khiển servo motor

**Hệ thống Smart Home (tích hợp):**
- Relay điều khiển đèn thông minh (ESP32-C3 + MQTT)
- Module đo điện năng PZEM-004T (giao tiếp qua MQTT)

### 1.3.2. Phạm vi nghiên cứu

**Về phần cứng:**
- Tập trung vào board bread-compact-wifi-lcd với cấu hình cố định
- Robot hoạt động ở chế độ tĩnh (không di chuyển tự do, chỉ chuyển động tại chỗ)
- Chưa tích hợp camera (dự kiến phát triển ở giai đoạn sau)
- Nguồn cấp: 5V/3A qua USB-C hoặc pin lithium 3.7V

**Về phần mềm:**
- Sử dụng firmware Xiaozhi-ESP32 có sẵn làm nền tảng, tùy chỉnh cho board cụ thể
- Phát triển thêm module điều khiển servo và tích hợp Smart Home
- Không phát triển server riêng, sử dụng Xiaozhi Cloud Server chính thức

**Về tính năng:**
- Tương tác hội thoại đa lượt bằng tiếng Việt
- Nhận diện wake-word "Hey Bo" offline
- Điều khiển thiết bị Smart Home: bật/tắt đèn, đọc thông số điện năng
- Chuyển động cơ bản: đi tiến, lùi, quay trái/phải, vẫy tay, đứng yên
- Hiển thị trạng thái và emoji trên màn hình LCD

**Về môi trường thử nghiệm:**
- Môi trường trong nhà, nhiệt độ 25-35°C
- Khoảng cách tương tác: 1-3 mét
- Mạng WiFi ổn định với băng thông tối thiểu 2 Mbps

**Giới hạn:**
- Không nghiên cứu phát triển mô hình LLM mới
- Không xây dựng hệ thống nhận dạng khuôn mặt/vật thể
- Không triển khai navigation tự động (SLAM)
- Không tối ưu hóa tiêu thụ năng lượng cho hoạt động pin lâu dài


## 1.4. Phương pháp nghiên cứu

Đề tài sử dụng kết hợp nhiều phương pháp nghiên cứu để đạt được mục tiêu đề ra:

**1. Phương pháp nghiên cứu tài liệu:**
- Tổng hợp và phân tích các tài liệu khoa học về robot AI, kiến trúc Edge-Cloud, và giao thức MCP
- Nghiên cứu documentation của ESP-IDF, Espressif AFE, và dự án Xiaozhi-ESP32
- Tham khảo các bài báo về thuật toán di chuyển robot 2 chân (bipedal locomotion)
- Phân tích source code của dự án mã nguồn mở để hiểu kiến trúc và cách triển khai

**2. Phương pháp phân tích và thiết kế hệ thống:**
- Phân tích yêu cầu chức năng và phi chức năng của robot
- Thiết kế kiến trúc hệ thống theo mô hình phân tầng (Hardware - Firmware - Cloud)
- Sử dụng sơ đồ khối (Block Diagram) để mô tả luồng dữ liệu
- Áp dụng nguyên lý thiết kế module hóa để dễ bảo trì và mở rộng

**3. Phương pháp thực nghiệm:**
- Lắp ráp và kiểm tra từng module phần cứng độc lập trước khi tích hợp
- Phát triển firmware theo phương pháp Agile với các sprint ngắn
- Thử nghiệm và đo lường hiệu suất của từng thành phần (audio latency, servo response time)
- Ghi nhận và phân tích các lỗi xảy ra trong quá trình vận hành

**4. Phương pháp so sánh và đánh giá:**
- So sánh hiệu suất của các thuật toán di chuyển khác nhau (2-phase vs 4-phase)
- Đánh giá chất lượng âm thanh với các cấu hình AFE khác nhau
- So sánh độ trễ giữa các giao thức truyền thông (WebSocket vs MQTT+UDP)
- Đo lường tiêu thụ điện năng trong các chế độ hoạt động khác nhau

**5. Phương pháp tối ưu hóa:**
- Điều chỉnh tham số servo (trim, invert) để cân bằng chuyển động
- Tối ưu biên độ di chuyển để tránh brownout do quá tải nguồn
- Tinh chỉnh cấu hình AFE để giảm nhiễu và echo
- Cân bằng giữa chất lượng âm thanh và băng thông mạng

**6. Công cụ hỗ trợ:**
- Visual Studio Code với ESP-IDF Extension - môi trường phát triển
- Git/GitHub - quản lý phiên bản source code
- Logic Analyzer - phân tích tín hiệu I2S, SPI
- Multimeter - đo điện áp, dòng điện tiêu thụ
- MQTT Explorer - debug giao thức MQTT
- Wireshark - phân tích giao thức WebSocket

## 1.5. Ý nghĩa của đề tài

### 1.5.1. Ý nghĩa khoa học

**Về mặt kiến trúc hệ thống:**
- Đề tài đóng góp một case study cụ thể về triển khai kiến trúc Edge-Cloud cho robot AI trên nền tảng vi điều khiển tài nguyên hạn chế (ESP32-S3)
- Chứng minh tính khả thi của việc kết hợp xử lý offline (wake-word, audio preprocessing) và online (LLM, TTS) để đạt được trải nghiệm tương tác tự nhiên với độ trễ thấp

**Về giao thức MCP:**
- Nghiên cứu ứng dụng thực tế của Model Context Protocol trong việc kết nối LLM với thiết bị vật lý
- Đề xuất cách thiết kế MCP tools để LLM có thể hiểu và điều khiển robot một cách tự nhiên thông qua ngôn ngữ


**Về thuật toán robot:**
- Triển khai và đánh giá thuật toán di chuyển 4 pha (Otto-style) cho robot 2 chân trên nền tảng ESP32
- Nghiên cứu phương pháp tối ưu hóa tiêu thụ điện năng khi điều khiển nhiều servo motor đồng thời
- Đề xuất giải pháp khóa servo (servo locking) để giảm tải nguồn trong các tình huống đặc biệt

**Về tích hợp công nghệ:**
- Kết hợp thành công nhiều công nghệ tiên tiến (LLM, Edge AI, IoT, Robotics) trong một hệ thống hoàn chỉnh
- Cung cấp kinh nghiệm thực tế về xử lý âm thanh real-time trên embedded system với Espressif AFE

### 1.5.2. Ý nghĩa thực tiễn

**Về giáo dục:**
- Đề tài là tài liệu tham khảo hữu ích cho sinh viên ngành Công nghệ Robot, IoT, và Embedded Systems
- Cung cấp quy trình hoàn chỉnh từ thiết kế đến triển khai một sản phẩm robot thực tế
- Minh họa cách áp dụng kiến thức đa lĩnh vực (điện tử, lập trình, AI, cơ khí) vào một dự án tích hợp

**Về ứng dụng:**
- Robot có thể ứng dụng làm trợ lý gia đình thông minh, đặc biệt phù hợp cho người cao tuổi và trẻ em
- Có thể mở rộng thành sản phẩm giáo dục STEM để dạy lập trình và robot cho học sinh
- Nền tảng để phát triển các ứng dụng chuyên biệt: robot lễ tân, hướng dẫn viên, giám sát an ninh

**Về kinh tế:**
- Chi phí phần cứng thấp (300,000 - 500,000 VNĐ) giúp công nghệ robot AI tiếp cận được với đại chúng
- Sử dụng mã nguồn mở giúp giảm chi phí phát triển và tăng tốc độ triển khai
- Mô hình kinh doanh tiềm năng: bán kit DIY, cung cấp dịch vụ tùy chỉnh cho doanh nghiệp

**Về cộng đồng:**
- Đóng góp vào cộng đồng Xiaozhi-ESP32 thông qua việc phát triển board mới và chia sẻ kinh nghiệm
- Tạo tài liệu tiếng Việt chi tiết giúp cộng đồng maker Việt Nam dễ dàng tiếp cận công nghệ
- Khuyến khích tinh thần tự học và sáng tạo trong lĩnh vực công nghệ

**Về Smart Home:**
- Cung cấp giải pháp điều khiển thiết bị thông minh bằng giọng nói với chi phí thấp
- Dễ dàng tích hợp với các hệ thống IoT hiện có thông qua giao thức MQTT
- Có khả năng mở rộng để giám sát và tối ưu hóa tiêu thụ năng lượng trong gia đình

## 1.6. Bố cục đồ án

Ngoài phần mở đầu và kết luận, nội dung đồ án được trình bày trong 5 chương:

**Chương 1: Tổng quan đề tài**

Trình bày bối cảnh nghiên cứu, vấn đề cần giải quyết, mục tiêu, đối tượng và phạm vi nghiên cứu, phương pháp nghiên cứu, cũng như ý nghĩa khoa học và thực tiễn của đề tài.

**Chương 2: Cơ sở lý thuyết**

Giới thiệu các kiến thức nền tảng cần thiết bao gồm: tổng quan về robot AI và IoT, kiến trúc Edge-Cloud, vi điều khiển ESP32-S3, hệ thống xử lý âm thanh (AFE, WakeNet), giao thức MCP, mô hình ngôn ngữ lớn, hệ thống chuyển động servo, giao thức MQTT, và tổng quan về dự án Xiaozhi-ESP32.


**Chương 3: Phân tích và thiết kế hệ thống**

Trình bày chi tiết về yêu cầu hệ thống, kiến trúc tổng thể, thiết kế phần cứng (sơ đồ khối, lựa chọn linh kiện, sơ đồ kết nối), và thiết kế phần mềm (kiến trúc firmware, luồng xử lý dữ liệu, giao thức truyền thông).

**Chương 4: Triển khai và thực nghiệm**

Mô tả quy trình triển khai, lắp ráp phần cứng, lập trình firmware, tích hợp hệ thống, kết quả thực nghiệm, và các vấn đề gặp phải cùng giải pháp xử lý.

**Chương 5: Kết luận và hướng phát triển**

Tổng kết các kết quả đạt được, đánh giá những hạn chế của đề tài, và đề xuất các hướng phát triển trong tương lai.

---

## DANH MỤC TỪ VIẾT TẮT (Đề xuất bổ sung)

| Từ viết tắt | Tiếng Anh | Tiếng Việt |
|-------------|-----------|------------|
| AI | Artificial Intelligence | Trí tuệ nhân tạo |
| LLM | Large Language Model | Mô hình ngôn ngữ lớn |
| IoT | Internet of Things | Internet vạn vật |
| MCP | Model Context Protocol | Giao thức ngữ cảnh mô hình |
| AFE | Audio Front-End | Bộ tiền xử lý âm thanh |
| STT | Speech-to-Text | Chuyển giọng nói thành văn bản |
| TTS | Text-to-Speech | Chuyển văn bản thành giọng nói |
| ESP-IDF | Espressif IoT Development Framework | Khung phát triển IoT của Espressif |
| MQTT | Message Queuing Telemetry Transport | Giao thức truyền tải từ xa dựa trên hàng đợi tin nhắn |
| I2S | Inter-IC Sound | Giao tiếp âm thanh giữa các IC |
| SPI | Serial Peripheral Interface | Giao tiếp ngoại vi nối tiếp |
| PWM | Pulse Width Modulation | Điều chế độ rộng xung |
| GPIO | General Purpose Input/Output | Đầu vào/ra đa năng |
| LCD | Liquid Crystal Display | Màn hình tinh thể lỏng |
| LED | Light Emitting Diode | Điốt phát quang |
| USB | Universal Serial Bus | Bus nối tiếp đa năng |
| API | Application Programming Interface | Giao diện lập trình ứng dụng |
| JSON | JavaScript Object Notation | Ký hiệu đối tượng JavaScript |
| RPC | Remote Procedure Call | Gọi thủ tục từ xa |
| VAD | Voice Activity Detection | Phát hiện hoạt động giọng nói |
| AEC | Acoustic Echo Cancellation | Khử tiếng vang âm thanh |
| PSRAM | Pseudo Static Random Access Memory | Bộ nhớ truy cập ngẫu nhiên giả tĩnh |

---

**Ghi chú:** Chương 1 này được viết dựa trên phân tích chi tiết source code của board bread-compact-wifi-lcd và kiến trúc hệ thống Xiaozhi-ESP32 v2.2.2. Các thông tin kỹ thuật đã được kiểm chứng với code thực tế để đảm bảo tính chính xác.
