#ifndef __SERVO_CONTROLLER_H__
#define __SERVO_CONTROLLER_H__

#include "mcp_server.h"

#include <driver/ledc.h>
#include <driver/gpio.h>
#include <string>
#include <algorithm>

// All servos share LEDC_TIMER_1 (backlight uses TIMER_0)
// Channels are auto-assigned starting from LEDC_CHANNEL_1 (CHANNEL_0 is backlight)
// ESP32-S3 supports up to 8 low-speed channels (0-7), so max 7 servos alongside backlight
#define SERVO_LEDC_TIMER    LEDC_TIMER_1
#define SERVO_MIN_PULSE_US  500    // 0 degrees
#define SERVO_MAX_PULSE_US  2500   // 180 degrees
#define SERVO_PERIOD_US     20000  // 50Hz -> 20ms

class ServoController {
private:
    int angle_ = -1;
    int trim_deg_ = 0;
    bool invert_direction_ = false;
    bool locked_ = false;
    gpio_num_t gpio_num_;
    ledc_channel_t channel_;

    // Auto-assign LEDC channels starting from CHANNEL_1
    static ledc_channel_t NextChannel() {
        static int next = 1; // start at 1, channel 0 is used by backlight
        return (ledc_channel_t)(next++);
    }

    // Initialize shared timer only once across all servo instances
    static void InitTimerOnce() {
        static bool initialized = false;
        if (!initialized) {
            ledc_timer_config_t timer_conf = {};
            timer_conf.speed_mode      = LEDC_LOW_SPEED_MODE;
            timer_conf.duty_resolution = LEDC_TIMER_13_BIT;
            timer_conf.timer_num       = SERVO_LEDC_TIMER;
            timer_conf.freq_hz         = 50;
            timer_conf.clk_cfg         = LEDC_AUTO_CLK;
            ESP_ERROR_CHECK(ledc_timer_config(&timer_conf));
            initialized = true;
        }
    }

    void WriteAngle(int angle) {
        int target_angle = std::min(std::max(angle, 0), 180);
        if (target_angle == angle_) return;
        
        angle_ = target_angle;
        int mapped_angle = angle_;
        if (invert_direction_) {
            mapped_angle = 180 - mapped_angle;
        }
        mapped_angle += trim_deg_;
        mapped_angle = std::min(std::max(mapped_angle, 0), 180);

        uint32_t pulse_us = SERVO_MIN_PULSE_US +
            (SERVO_MAX_PULSE_US - SERVO_MIN_PULSE_US) * mapped_angle / 180;
        // 13-bit resolution: max duty = 8191, period = 20000us
        uint32_t duty = pulse_us * 8191 / SERVO_PERIOD_US;
        ledc_set_duty(LEDC_LOW_SPEED_MODE, channel_, duty);
        ledc_update_duty(LEDC_LOW_SPEED_MODE, channel_);
    }

public:
    int GetAngle() const {
        return angle_;
    }

    void SetAngle(int angle) {
        if (locked_) return;  // Khi bị khóa, bỏ qua mọi lệnh thay đổi góc
        WriteAngle(angle);
    }

    // Khóa cứng servo tại góc chỉ định, mọi lệnh SetAngle sau đó đều bị bỏ qua
    void Lock(int angle) {
        locked_ = false;  // Tạm mở khóa để ghi góc
        WriteAngle(angle);
        locked_ = true;
    }

    void Unlock() {
        locked_ = false;
    }

    bool IsLocked() const {
        return locked_;
    }

    // name: unique identifier used in MCP tool names, e.g. "head", "arm_left", "arm_right"
    ServoController(gpio_num_t gpio_num, const std::string& name, int trim_deg = 0, bool invert_direction = false)
        : trim_deg_(trim_deg), invert_direction_(invert_direction), gpio_num_(gpio_num), channel_(NextChannel()) {

        InitTimerOnce();

        ledc_channel_config_t ch_conf = {};
        ch_conf.gpio_num   = gpio_num_;
        ch_conf.speed_mode = LEDC_LOW_SPEED_MODE;
        ch_conf.channel    = channel_;
        ch_conf.intr_type  = LEDC_INTR_DISABLE;
        ch_conf.timer_sel  = SERVO_LEDC_TIMER;
        ch_conf.duty       = 0;
        ch_conf.hpoint     = 0;
        ESP_ERROR_CHECK(ledc_channel_config(&ch_conf));

        WriteAngle(90); // Move to center position on startup

        auto& mcp_server = McpServer::GetInstance();
        std::string prefix = "self.servo." + name + ".";

        mcp_server.AddTool(prefix + "get_angle",
            "Get the current angle of servo '" + name + "' (0-180 degrees)",
            PropertyList(),
            [this](const PropertyList& properties) -> ReturnValue {
                return angle_;
            });

        mcp_server.AddTool(prefix + "set_angle",
            "Set servo '" + name + "' to an angle. 0=fully left, 90=center, 180=fully right",
            PropertyList({
                Property("angle", kPropertyTypeInteger, 90, 0, 180)
            }),
            [this](const PropertyList& properties) -> ReturnValue {
                if (locked_) return false;  // Servo đang bị khóa, từ chối lệnh
                WriteAngle(properties["angle"].value<int>());
                return true;
            });
    }
};

#endif // __SERVO_CONTROLLER_H__
