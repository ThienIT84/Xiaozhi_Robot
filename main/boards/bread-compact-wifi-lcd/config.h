#ifndef _BOARD_CONFIG_H_
#define _BOARD_CONFIG_H_

#include <driver/gpio.h>

#define AUDIO_INPUT_SAMPLE_RATE  16000
#define AUDIO_OUTPUT_SAMPLE_RATE 24000

// Nếu sử dụng Duplex I2S, hãy comment dòng này lại
#define AUDIO_I2S_METHOD_SIMPLEX

#ifdef AUDIO_I2S_METHOD_SIMPLEX


// --- CẤU HÌNH MIC (Để dự phòng an toàn, đã né chân 6-14 của PSRAM) ---
#define AUDIO_I2S_MIC_GPIO_WS   GPIO_NUM_39
#define AUDIO_I2S_MIC_GPIO_SCK  GPIO_NUM_40
#define AUDIO_I2S_MIC_GPIO_DIN  GPIO_NUM_38 

// --- CẤU HÌNH LOA MAX98357A (Chuẩn theo 5 dây thực tế) ---
#define AUDIO_I2S_SPK_GPIO_DOUT GPIO_NUM_16
#define AUDIO_I2S_SPK_GPIO_BCLK GPIO_NUM_46
#define AUDIO_I2S_SPK_GPIO_LRCK GPIO_NUM_45

#else

#define AUDIO_I2S_GPIO_WS   GPIO_ NUM_4
#define AUDIO_I2S_GPIO_BCLK GPIO_NUM_5
#define AUDIO_I2S_GPIO_DIN  GPIO_NUM_8
#define AUDIO_I2S_GPIO_DOUT GPIO_NUM_16

#endif


// --- CẤU HÌNH NÚT BẤM (Mặc định) ---
#define BUILTIN_LED_GPIO        GPIO_NUM_48
#define BOOT_BUTTON_GPIO        GPIO_NUM_0
#define TOUCH_BUTTON_GPIO       GPIO_NUM_NC
#define VOLUME_UP_BUTTON_GPIO   GPIO_NUM_NC
#define VOLUME_DOWN_BUTTON_GPIO GPIO_NUM_NC


// --- CẤU HÌNH MÀN HÌNH LCD 1.54 INCH (Chuẩn theo 8 dây thực tế) ---
#define DISPLAY_BACKLIGHT_PIN           GPIO_NUM_NC  // Đã nối cứng 3.3V
#define DISPLAY_BACKLIGHT_OUTPUT_INVERT false
#define DISPLAY_MOSI_PIN      GPIO_NUM_2     // Chân SDA
#define DISPLAY_CLK_PIN       GPIO_NUM_1     // Chân SCL
#define DISPLAY_DC_PIN        GPIO_NUM_41    // Chân DC
#define DISPLAY_RST_PIN       GPIO_NUM_42    // Chân RES
#define DISPLAY_CS_PIN        GPIO_NUM_21    // Chân CS


// --- LCD: ST7789 SPI 240x240 (hardcoded cho robot, 8 dây) ---
#define LCD_TYPE_ST7789_SERIAL
#define DISPLAY_WIDTH           240
#define DISPLAY_HEIGHT          240
#define DISPLAY_MIRROR_X        false
#define DISPLAY_MIRROR_Y        false
#define DISPLAY_SWAP_XY         false
#define DISPLAY_INVERT_COLOR    true
#define DISPLAY_RGB_ORDER       LCD_RGB_ELEMENT_ORDER_RGB
#define DISPLAY_OFFSET_X        0
#define DISPLAY_OFFSET_Y        0
#define DISPLAY_SPI_MODE        0

// Servo motor control (6 servos on GPIO 3, 8, 4, 5, 7, 9)
#define SERVO1_GPIO GPIO_NUM_3
#define SERVO2_GPIO GPIO_NUM_8
#define SERVO3_GPIO GPIO_NUM_4
#define SERVO4_GPIO GPIO_NUM_5
#define SERVO5_GPIO GPIO_NUM_7
#define SERVO6_GPIO GPIO_NUM_9

// Per-servo calibration
// TRIM: -30..30 (suggested), positive means increase logical angle.
// INVERT_DIRECTION: true if servo rotates opposite to expected direction.
#define SERVO1_TRIM_DEG 0                                         // gipo 3 đùi trái
#define SERVO2_TRIM_DEG 0                                         // gipo 8 tay trái
#define SERVO3_TRIM_DEG -40                                         // gipo 4 tay phải
#define SERVO4_TRIM_DEG -15                                       // gipo 5 cổ chân trái
#define SERVO5_TRIM_DEG 0                                         // gipo 7 đùi phải
#define SERVO6_TRIM_DEG 18                                        // gipo 9 cổ chân phải

#define SERVO1_INVERT_DIRECTION false
#define SERVO2_INVERT_DIRECTION false
#define SERVO3_INVERT_DIRECTION true
#define SERVO4_INVERT_DIRECTION true
#define SERVO5_INVERT_DIRECTION false
#define SERVO6_INVERT_DIRECTION true
#endif // _BOARD_CONFIG_H_