#include <driver/ledc.h>
#include <esp_event.h>
#include <esp_lcd_panel_vendor.h>
#include <esp_log.h>
#include <esp_netif.h>
#include <mqtt_client.h>
#include <string>
#include <cstring>
#include <cstdlib>
#include <cstdio>
#include <algorithm>
#include <wifi_manager.h>
#include "application.h"
#include "button.h"
#include "codecs/no_audio_codec.h"
#include "config.h"
#include "display/lcd_display.h"
#include "led/single_led.h"
#include "mcp_server.h"
#include "robot_motion_controller.h"
#include "servo_controller.h"
#include "system_reset.h"
#include "wifi_board.h"

#include <driver/spi_common.h>
#include <esp_lcd_panel_io.h>
#include <esp_lcd_panel_ops.h>
#include <cJSON.h>

#define B_TAG "CompactBoard"

static esp_mqtt_client_handle_t s_custom_mqtt_client = nullptr;
static float s_pzem_voltage = 0;
static float s_pzem_current = 0;
static float s_pzem_power = 0;
static bool s_mqtt_started = false;

static void custom_mqtt_event_handler(void* handler_args, esp_event_base_t base, int32_t event_id,
                                      void* event_data) {
    esp_mqtt_event_handle_t event = static_cast<esp_mqtt_event_handle_t>(event_data);
    switch ((esp_mqtt_event_id_t)event_id) {
        case MQTT_EVENT_CONNECTED:
            ESP_LOGI(B_TAG, "Custom MQTT Connected to laptop broker (192.168.1.6)!");
            esp_mqtt_client_subscribe(s_custom_mqtt_client, "esp32c3/pzem/data", 0);
            esp_mqtt_client_publish(s_custom_mqtt_client, "esp32c3/robot/status", "online", 0, 1, 0);
            break;
        case MQTT_EVENT_DISCONNECTED:
            ESP_LOGW(B_TAG, "Custom MQTT Disconnected from laptop");
            break;
        case MQTT_EVENT_ERROR:
            ESP_LOGE(B_TAG, "Custom MQTT Error: %d", event->error_handle->error_type);
            break;
        case MQTT_EVENT_DATA: {
            if (event->topic_len == strlen("esp32c3/pzem/data") && 
                strncmp(event->topic, "esp32c3/pzem/data", event->topic_len) == 0) {
                char* data_buf = (char*)malloc(event->data_len + 1);
                if (data_buf) {
                    memcpy(data_buf, event->data, event->data_len);
                    data_buf[event->data_len] = '\0';
                    cJSON *json = cJSON_Parse(data_buf);
                    if (json) {
                        cJSON *v = cJSON_GetObjectItem(json, "voltage");
                        cJSON *i = cJSON_GetObjectItem(json, "current");
                        cJSON *p = cJSON_GetObjectItem(json, "power");
                        if (v) s_pzem_voltage = (float)v->valuedouble;
                        if (i) s_pzem_current = (float)i->valuedouble / 1000.0f;
                        if (p) s_pzem_power = (float)p->valuedouble / 1000.0f;
                        cJSON_Delete(json);
                    }
                    free(data_buf);
                }
            }
            break;
        }
        default:
            break;
    }
}

static void custom_ip_event_handler(void* arg, esp_event_base_t event_base, int32_t event_id,
                                    void* event_data) {
    if (event_id == IP_EVENT_STA_GOT_IP) {
        if (s_custom_mqtt_client != nullptr && !s_mqtt_started) {
            ESP_LOGI(B_TAG, "Network is up! Starting Custom MQTT...");
            esp_mqtt_client_start(s_custom_mqtt_client);
            s_mqtt_started = true;
        }
    }
}

class CompactWifiBoardLCD : public WifiBoard {
private:
    Button boot_button_;
    LcdDisplay* display_;
    
    // Servo controllers
    ServoController* servo1_;
    ServoController* servo2_;
    ServoController* servo3_;
    ServoController* servo4_;
    ServoController* servo5_;
    ServoController* servo6_;
    
    // Motion controller
    RobotMotionController* motion_controller_;

    void InitializeSpi() {
        spi_bus_config_t buscfg = {};
        buscfg.mosi_io_num = DISPLAY_MOSI_PIN;
        buscfg.miso_io_num = -1;
        buscfg.sclk_io_num = DISPLAY_CLK_PIN;
        buscfg.quadwp_io_num = -1;
        buscfg.quadhd_io_num = -1;
        buscfg.max_transfer_sz = DISPLAY_WIDTH * DISPLAY_HEIGHT * sizeof(uint16_t);
        ESP_ERROR_CHECK(spi_bus_initialize(SPI2_HOST, &buscfg, SPI_DMA_CH_AUTO));
    }

    void InitializeLcd() {
        esp_lcd_panel_io_handle_t io_handle = NULL;
        esp_lcd_panel_io_spi_config_t io_config = {};
        io_config.dc_gpio_num = DISPLAY_DC_PIN;
        io_config.cs_gpio_num = DISPLAY_CS_PIN;
        io_config.pclk_hz = 40 * 1000 * 1000;
        io_config.lcd_cmd_bits = 8;
        io_config.lcd_param_bits = 8;
        io_config.spi_mode = 0;
        io_config.trans_queue_depth = 10;
        ESP_ERROR_CHECK(esp_lcd_new_panel_io_spi((esp_lcd_spi_bus_handle_t)SPI2_HOST, &io_config, &io_handle));

        esp_lcd_panel_handle_t panel_handle = NULL;
        esp_lcd_panel_dev_config_t panel_config = {};
        panel_config.reset_gpio_num = DISPLAY_RST_PIN;
        panel_config.rgb_ele_order = LCD_RGB_ELEMENT_ORDER_RGB;
        panel_config.bits_per_pixel = 16;
        ESP_ERROR_CHECK(esp_lcd_new_panel_st7789(io_handle, &panel_config, &panel_handle));
        
        esp_lcd_panel_reset(panel_handle);
        esp_lcd_panel_init(panel_handle);
        esp_lcd_panel_invert_color(panel_handle, true);
        esp_lcd_panel_swap_xy(panel_handle, DISPLAY_SWAP_XY);
        esp_lcd_panel_mirror(panel_handle, DISPLAY_MIRROR_X, DISPLAY_MIRROR_Y);
        esp_lcd_panel_disp_on_off(panel_handle, true);

        display_ = new SpiLcdDisplay(io_handle, panel_handle, DISPLAY_WIDTH, DISPLAY_HEIGHT, DISPLAY_OFFSET_X, DISPLAY_OFFSET_Y, DISPLAY_MIRROR_X, DISPLAY_MIRROR_Y, DISPLAY_SWAP_XY);
    }

    void InitializeButtons() {
        boot_button_.OnClick([this]() {
            Application::GetInstance().ToggleChatState();
        });
    }

    void InitializeServos() {
        ESP_LOGI(B_TAG, "Initializing Servos and Motion Controller...");
        servo1_ = new ServoController(SERVO1_GPIO, "leg_left_hip", SERVO1_TRIM_DEG, SERVO1_INVERT_DIRECTION);
        servo2_ = new ServoController(SERVO2_GPIO, "arm_left", SERVO2_TRIM_DEG, SERVO2_INVERT_DIRECTION);
        servo3_ = new ServoController(SERVO3_GPIO, "arm_right", SERVO3_TRIM_DEG, SERVO3_INVERT_DIRECTION);
        servo4_ = new ServoController(SERVO4_GPIO, "leg_left_ankle", SERVO4_TRIM_DEG, SERVO4_INVERT_DIRECTION);
        servo5_ = new ServoController(SERVO5_GPIO, "leg_right_hip", SERVO5_TRIM_DEG, SERVO5_INVERT_DIRECTION);
        servo6_ = new ServoController(SERVO6_GPIO, "leg_right_ankle", SERVO6_TRIM_DEG, SERVO6_INVERT_DIRECTION);

        motion_controller_ = new RobotMotionController(servo1_, servo2_, servo3_, servo4_, servo5_, servo6_);
    }

    void InitializeMqtt() {
        ESP_LOGI(B_TAG, "Initializing Custom MQTT configuration...");
        esp_mqtt_client_config_t mqtt_cfg = {};
        mqtt_cfg.broker.address.uri = "mqtt://192.168.1.6:1883";
        mqtt_cfg.credentials.username = "xiaozhi_user";
        mqtt_cfg.credentials.authentication.password = "xiaozhi_pass";

        s_custom_mqtt_client = esp_mqtt_client_init(&mqtt_cfg);
        if (s_custom_mqtt_client != nullptr) {
            esp_mqtt_client_register_event(s_custom_mqtt_client, MQTT_EVENT_ANY,
                                           custom_mqtt_event_handler, nullptr);
        } else {
            ESP_LOGE(B_TAG, "Failed to create MQTT client for 192.168.1.6");
        }

        auto& mcp_server = McpServer::GetInstance();
        mcp_server.AddTool(
            "self.smart_home.set_lamp", "Turn on or off the smart lamp.",
            PropertyList({Property("state", kPropertyTypeString,
                                   "The state to set the lamp to, can be 'on' or 'off'")}),
            [](const PropertyList& properties) -> ReturnValue {
                auto state = properties["state"].value<std::string>();
                if (s_custom_mqtt_client) {
                    std::string msg = state;
                    std::transform(msg.begin(), msg.end(), msg.begin(), [](unsigned char c){ return std::tolower(c); });
                    esp_mqtt_client_publish(s_custom_mqtt_client, "esp32c3/lamp/set", msg.c_str(), 0, 1, 0);
                    ESP_LOGI(B_TAG, "Sent MQTT command: %s to esp32c3/lamp/set", msg.c_str());
                    return ReturnValue("Success: Sent command " + msg);
                }
                return ReturnValue("Error: MQTT client for laptop not connected");
            });

        mcp_server.AddTool(
            "self.get_power_status", "Get real-time power measurement including voltage (V), current (A), and power (W).",
            PropertyList(),
            [](const PropertyList& properties) -> ReturnValue {
                char buffer[256];
                snprintf(buffer, sizeof(buffer), "{\"voltage\":%.2f,\"current\":%.3f,\"power\":%.3f}", 
                        s_pzem_voltage, s_pzem_current, s_pzem_power);
                return ReturnValue(std::string(buffer));
            });
    }

public:
    CompactWifiBoardLCD() : boot_button_(BOOT_BUTTON_GPIO) {
        InitializeSpi();
        InitializeLcd();
        InitializeButtons();
        InitializeServos();
        InitializeMqtt();
    }

    virtual void StartNetwork() override {
        // First let the base class setup WiFi manager and event loop
        WifiBoard::StartNetwork();
        
        // Now it's safe to register for IP events because event loop is created
        ESP_LOGI(B_TAG, "Registering IP event handler for Custom MQTT...");
        esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, custom_ip_event_handler, nullptr);
        
        // Also check if already connected (for rapid re-init)
        if (WifiManager::GetInstance().IsConnected() && !s_mqtt_started && s_custom_mqtt_client != nullptr) {
            ESP_LOGI(B_TAG, "Already connected! Starting Custom MQTT...");
            esp_mqtt_client_start(s_custom_mqtt_client);
            s_mqtt_started = true;
        }
    }

    virtual Led* GetLed() override {
        static SingleLed led(BUILTIN_LED_GPIO);
        return &led;
    }

    virtual AudioCodec* GetAudioCodec() override {
        static NoAudioCodecSimplex codec(AUDIO_INPUT_SAMPLE_RATE, AUDIO_OUTPUT_SAMPLE_RATE,
            AUDIO_I2S_SPK_GPIO_BCLK, AUDIO_I2S_SPK_GPIO_LRCK, AUDIO_I2S_SPK_GPIO_DOUT,
            AUDIO_I2S_MIC_GPIO_SCK, AUDIO_I2S_MIC_GPIO_WS, AUDIO_I2S_MIC_GPIO_DIN);
        return &codec;
    }

    virtual Display* GetDisplay() override {
        return display_;
    }

    virtual std::string GetBoardType() override {
        return "compact-wifi-board-lcd";
    }

    virtual void SetPowerSaveLevel(PowerSaveLevel level) override {
        // Implement power save level
    }

    virtual std::string GetBoardJson() override {
        return "{\"type\":\"compact-wifi-board-lcd\"}";
    }

    virtual std::string GetDeviceStatusJson() override {
        char buffer[256];
        snprintf(buffer, sizeof(buffer), "{\"voltage\":%.2f,\"current\":%.3f,\"power\":%.3f}", 
                s_pzem_voltage, s_pzem_current, s_pzem_power);
        return std::string(buffer);
    }
};

DECLARE_BOARD(CompactWifiBoardLCD);
