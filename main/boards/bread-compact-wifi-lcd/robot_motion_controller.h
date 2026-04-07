#ifndef __ROBOT_MOTION_CONTROLLER_H__
#define __ROBOT_MOTION_CONTROLLER_H__

#include "mcp_server.h"
#include "servo_controller.h"

#include <freertos/FreeRTOS.h>
#include <freertos/task.h>

#include <string>

class RobotMotionController {
private:
    static constexpr int kCenter = 90;
    // Biên độ di chuyển (đã tăng nhẹ so với bản giảm tải, vẫn thấp hơn bản gốc để an toàn nguồn)
    // Servo tay phải đã bị khóa cứng nên tổng tải giảm, cho phép tăng biên độ chân
    static constexpr int kWalkSwing = 25;
    static constexpr int kTurnSwing = 35;
    static constexpr int kBodyShift = 22;
    static constexpr int kArmAssistSwing = 5;

    ServoController* servo1_;
    ServoController* servo2_;
    ServoController* servo3_;
    ServoController* servo4_;
    ServoController* servo5_;
    ServoController* servo6_;

    void DelayMs(int ms) {
        if (ms > 0) {
            vTaskDelay(pdMS_TO_TICKS(ms));
        }
    }

    void SetLegPose(int s1, int s4, int s5, int s6, int arm2, int arm3, int hold_ms) {
        servo1_->SetAngle(s1);
        servo2_->SetAngle(arm2);
        // Không cho tay phải (GPIO 4 tức servo 3) đánh theo yêu cầu
        servo3_->SetAngle(kCenter);
        servo4_->SetAngle(s4);
        servo5_->SetAngle(s5);
        servo6_->SetAngle(s6);
        DelayMs(hold_ms);
    }

    void Stand() {
        servo1_->SetAngle(kCenter);
        servo2_->SetAngle(kCenter);
        servo3_->SetAngle(kCenter);
        servo4_->SetAngle(kCenter);
        servo5_->SetAngle(kCenter);
        servo6_->SetAngle(kCenter);
    }

    // ===== THUẬT TOÁN ĐI 4 PHA (Otto-style) =====
    // Nguyên lý: Nghiêng người TRƯỚC để dồn trọng lượng lên 1 chân (chân trụ),
    // SAU ĐÓ mới vung chân còn lại (chân tự do). Điều này tạo ra chuyển vị thực tế
    // thay vì chỉ lắc tại chỗ như thuật toán 2 pha đối xứng.

    void StepForward(int speed_ms) {
        int phase_ms = std::max(speed_ms / 4, 50);

        // Thuật toán Oscillate Otto lệch pha 90°:
        // Pha 1: Nghiêng Phải kịch kim (đểm bồng chân Trái). Đùi ở vị trí 0.
        SetLegPose(kCenter, kCenter + kBodyShift, 
                   kCenter, kCenter - kBodyShift, 
                   kCenter, kCenter, phase_ms);

        // Pha 2: Đùi Trái đạt đỉnh phóng tới (+), Đùi Phải đạp lui (-). 
        // Cổ CÂN BẰNG (0) để robot lọt bàn chân xuống ép mặt đất đẩy thân đi THẲNG.
        SetLegPose(kCenter + kWalkSwing, kCenter, 
                   kCenter - kWalkSwing, kCenter, 
                   kCenter + kArmAssistSwing, kCenter - kArmAssistSwing, phase_ms);

        // Pha 3: Nghiêng Trái kịch kim (đệm bồng chân Phải). Đùi trả về vị trí 0.
        SetLegPose(kCenter, kCenter - kBodyShift, 
                   kCenter, kCenter + kBodyShift, 
                   kCenter, kCenter, phase_ms);

        // Pha 4: Đùi Phải đạt đỉnh phóng tới (+), Đùi Trái đạp lui (-). Cổ CÂN BẰNG.
        SetLegPose(kCenter - kWalkSwing, kCenter, 
                   kCenter + kWalkSwing, kCenter, 
                   kCenter - kArmAssistSwing, kCenter + kArmAssistSwing, phase_ms);
    }

    void StepBackward(int speed_ms) {
        int phase_ms = std::max(speed_ms / 4, 50);

        // Đi lùi chỉ là đảo Dấu biên độ Đùi của Forward:
        // Pha 1: Nghiêng Phải
        SetLegPose(kCenter, kCenter + kBodyShift, 
                   kCenter, kCenter - kBodyShift, 
                   kCenter, kCenter, phase_ms);

        // Pha 2: Trái bật ngửa Lùi (-), Phải chèo Tới (+). Cổ về 0.
        SetLegPose(kCenter - kWalkSwing, kCenter, 
                   kCenter + kWalkSwing, kCenter, 
                   kCenter - kArmAssistSwing, kCenter + kArmAssistSwing, phase_ms);

        // Pha 3: Nghiêng Trái
        SetLegPose(kCenter, kCenter - kBodyShift, 
                   kCenter, kCenter + kBodyShift, 
                   kCenter, kCenter, phase_ms);

        // Pha 4: Phải bật ngửa Lùi (-), Trái chèo Tới (+). Cổ về 0.
        SetLegPose(kCenter + kWalkSwing, kCenter, 
                   kCenter - kWalkSwing, kCenter, 
                   kCenter + kArmAssistSwing, kCenter - kArmAssistSwing, phase_ms);
    }

    // ===== THUẬT TOÁN XOAY 4 PHA (Differential Friction) =====
    // Nguyên lý: Xoắn CẢ HAI đùi cùng hướng → chân trụ (nặng) bám đất làm pivot,
    // chân tự do (nhẹ) trượt. Khi đổi chân trụ rồi trả về center, body đã xoay.

    void StepTurnLeft(int speed_ms) {
        int phase_ms = std::max(speed_ms / 4, 50);

        // Pha 1: Nghiêng phải → chân phải làm trụ (pivot), chân trái nhẹ
        SetLegPose(
            kCenter,
            kCenter + kBodyShift,
            kCenter,
            kCenter - kBodyShift,
            kCenter, kCenter,
            phase_ms);

        // Pha 2: Xoắn CẢ HAI đùi sang trái
        // - Chân phải (trụ): ma sát cao → đứng yên, tạo pivot
        // - Chân trái (tự do): ma sát thấp → trượt sang trái
        SetLegPose(
            kCenter - kTurnSwing,       // s1: đùi trái xoắn trái
            kCenter + kBodyShift,
            kCenter - kTurnSwing,       // s5: đùi phải cũng xoắn trái (bị ma sát giữ)
            kCenter - kBodyShift,
            kCenter + kArmAssistSwing,
            kCenter - kArmAssistSwing,
            phase_ms);

        // Pha 3: Nghiêng trái → chân trái làm trụ (đã ở vị trí mới), chân phải nhẹ
        SetLegPose(
            kCenter - kTurnSwing,
            kCenter - kBodyShift,
            kCenter - kTurnSwing,
            kCenter + kBodyShift,
            kCenter + kArmAssistSwing,
            kCenter - kArmAssistSwing,
            phase_ms);

        // Pha 4: Trả CẢ HAI đùi về center
        // - Chân trái (trụ): bám đất → body xoay thêm
        // - Chân phải (tự do): trượt nhẹ theo → catch up
        SetLegPose(
            kCenter,
            kCenter - kBodyShift,
            kCenter,
            kCenter + kBodyShift,
            kCenter - kArmAssistSwing,
            kCenter + kArmAssistSwing,
            phase_ms);
    }

    void StepTurnRight(int speed_ms) {
        int phase_ms = std::max(speed_ms / 4, 50);

        // Pha 1: Nghiêng PHẢI → Chân phải làm trụ (giống yêu cầu người dùng)
        SetLegPose(
            kCenter,
            kCenter + kBodyShift,
            kCenter,
            kCenter - kBodyShift,
            kCenter, kCenter,
            phase_ms);

        // Pha 2: Xoắn CẢ HAI đùi sang phải (+kTurnSwing)
        SetLegPose(
            kCenter + kTurnSwing,       // s1
            kCenter + kBodyShift,
            kCenter + kTurnSwing,       // s5
            kCenter - kBodyShift,
            kCenter, kCenter,
            phase_ms);

        // Pha 3: Nghiêng TRÁI → Đưa trọng tâm sang chân trái
        SetLegPose(
            kCenter + kTurnSwing,
            kCenter - kBodyShift,
            kCenter + kTurnSwing,
            kCenter + kBodyShift,
            kCenter, kCenter,
            phase_ms);

        // Pha 4: Trả CẢ HAI đùi về center
        SetLegPose(
            kCenter,
            kCenter - kBodyShift,
            kCenter,
            kCenter + kBodyShift,
            kCenter, kCenter,
            phase_ms);
    }

    void DoJump(int speed_ms) {
        // Jump motion disabled due to excessive power consumption during brownout.
        // All servos moving to extreme angles (65-120°) simultaneously causes voltage collapse.
        Stand();
    }

    void HandWave(int count, int speed_ms) {
        int phase_ms = std::max(speed_ms / 2, 120); // Tăng tốc độ vẫy một chút cho sinh động
        
        // Theo bạn nói: 180 độ là giơ thẳng lên trời, 0 độ là rớt xuống
        for (int i = 0; i < count; ++i) {
            // Giơ thẳng lên trời
            servo2_->SetAngle(180);
            DelayMs(phase_ms);
            
            // Hạ xuống góc 120 độ (lắc biên độ 60 độ)
            servo2_->SetAngle(120);
            DelayMs(phase_ms);
        }
        
        Stand();
    }

public:
    RobotMotionController(ServoController* servo1,
                          ServoController* servo2,
                          ServoController* servo3,
                          ServoController* servo4,
                          ServoController* servo5,
                          ServoController* servo6)
        : servo1_(servo1),
          servo2_(servo2),
          servo3_(servo3),
          servo4_(servo4),
          servo5_(servo5),
          servo6_(servo6) {
        auto& mcp_server = McpServer::GetInstance();

        mcp_server.AddTool("self.robot.basic_control",
            "Control robot movement. action: forward, backward, turn_left, turn_right, stop, jump, wave.\n"
            "Execute immediately without asking follow-up questions. "
            "Motion runs AFTER your response, so say 'OK' or describe the action briefly. "
            "Do NOT ask what the user wants to do next.",
            PropertyList({
                Property("action", kPropertyTypeString),
                Property("steps", kPropertyTypeInteger, 1, 1, 20),
                Property("speed", kPropertyTypeInteger, 360, 140, 1000)
            }),
            [this](const PropertyList& properties) -> ReturnValue {
                const std::string action = properties["action"].value<std::string>();
                const int steps = properties["steps"].value<int>();
                const int speed = properties["speed"].value<int>();

                if (action == "stop") {
                    Stand();
                    return true;
                }
                if (action == "jump") {
                    DoJump(speed);
                    return true;
                }

                if (action == "wave") {
                    HandWave(5, speed); // Ép cứng 5 cái cho video demo đẹp
                } else {
                    for (int i = 0; i < steps; ++i) {
                        if (action == "forward") {
                            StepForward(speed);
                        } else if (action == "backward") {
                            StepBackward(speed);
                        } else if (action == "turn_left") {
                            StepTurnLeft(speed);
                        } else if (action == "turn_right") {
                            StepTurnRight(speed);
                        } else {
                            return false;
                        }
                    }
                }
                // Trả servo về vị trí trung tâm sau khi di chuyển xong,
                // tránh servo giữ tải gây kêu rít và tốn điện
                Stand();
                return true;
            });

        mcp_server.AddTool("self.robot.jump",
            "Robot jump action.\\n"
            "IMPORTANT: The motion is executed AFTER your voice response. "
            "Say 'Let me jump' instead of 'I have jumped'.",
            PropertyList({
                Property("count", kPropertyTypeInteger, 1, 1, 6),
                Property("speed", kPropertyTypeInteger, 280, 120, 800)
            }),
            [this](const PropertyList& properties) -> ReturnValue {
                const int count = properties["count"].value<int>();
                const int speed = properties["speed"].value<int>();
                for (int i = 0; i < count; ++i) {
                    DoJump(speed);
                }
                return true;
            });

        Stand();
    }
};

#endif // __ROBOT_MOTION_CONTROLLER_H__
