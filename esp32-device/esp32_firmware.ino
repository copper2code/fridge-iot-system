/*
 * ============================================================
 *  PharmaSense IoT — ESP32 Firmware  v1.0
 *  Hardware: ESP32 + DHT22 (temp/humidity) + ACS712 (current)
 * ============================================================
 *
 *  PURPOSE
 *  -------
 *  Monitor pharmacy cold storage and equipment:
 *  - Temperature & humidity (DHT22) for medicine storage compliance
 *  - Current consumption (ACS712) for equipment/fridge monitoring
 *
 *  COMMUNICATION
 *  -------------
 *  Same HTTP polling pattern as original firmware:
 *  - POST /api/device/sensor-data  → sends temp, humidity, current
 *  - GET  /api/device/command/:id  → polls for ACTIVATE/DEACTIVATE
 *
 *  SENSOR FAULT TOLERANCE
 *  ----------------------
 *  DHT22 or ACS712 failure does NOT halt the device.
 *  Each sensor reports its own health state independently.
 *
 *  TEST MENU COMMANDS (Serial Monitor, 115200 baud)
 *  --------------------------------------------------
 *  1  → Test WiFi connection (print IP)
 *  2  → Test ACTIVATE (locally force-activate)
 *  3  → Test DEACTIVATE (locally force-deactivate)
 *  4  → Read DHT22 sensor now
 *  5  → Read ACS712 current now
 *  6  → Send sensor data to server now
 *  7  → Send custom test message
 *  8  → Poll command endpoint now
 *  0  → Print device status summary
 *  h  → Show this help menu
 *
 *  WIRING
 *  ------
 *  DHT22  → ESP32: DATA=GPIO4, VCC=3.3V, GND=GND (10kΩ pull-up)
 *  ACS712 → ESP32: OUT=GPIO34 (ADC), VCC=5V, GND=GND
 *  LED    → ESP32: Green=GPIO2, Red=GPIO15
 *
 *  LIBRARIES NEEDED (Arduino Library Manager)
 *  ------------------------------------------
 *  - WiFi          (built-in ESP32)
 *  - HTTPClient    (built-in ESP32)
 *  - ArduinoJson   by bblanchon  (6.x)
 *  - DHT sensor library by Adafruit
 *  - Adafruit Unified Sensor
 * ============================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "DHT.h"

// ── CONFIGURATION ────────────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_IP     = "192.168.31.88";
const int   SERVER_PORT   = 5000;
const char* DEVICE_ID     = "FRIDGE_001";

// DHT22 Configuration
#define DHT_PIN    4
#define DHT_TYPE   DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// ACS712 Configuration (5A module)
const int ACS712_PIN        = 34;   // ADC pin
const float ACS712_VREF     = 3.3;  // ESP32 ADC reference voltage
const int   ACS712_ADC_MAX  = 4095; // 12-bit ADC
const float ACS712_ZERO_V   = 2.5;  // Zero-current voltage (for 5A module)
const float ACS712_SENS     = 0.185; // Sensitivity: 185mV/A for 5A module

// LED Pins
const int LED_GREEN = 2;
const int LED_RED   = 15;

// Threshold defaults (will be updated from server)
float TEMP_THRESHOLD_MIN = 2.0;
float TEMP_THRESHOLD_MAX = 8.0;
float CURRENT_THRESHOLD  = 10.0;

// Polling intervals (milliseconds)
const unsigned long COMMAND_POLL_MS = 5000;
const unsigned long SENSOR_SEND_MS = 5000;
// ─────────────────────────────────────────────────────────────

// ── STATE ─────────────────────────────────────────────────────
bool isActive        = false;
bool dhtAvailable    = false;

unsigned long lastCommandCheck = 0;
unsigned long lastSensorSend   = 0;

float lastTemp     = NAN;
float lastHumidity = NAN;
float lastCurrent  = 0.0;

// For serial test menu
bool awaitingCustomMsg = false;
String customMsgBuffer = "";

// ── HELPERS ───────────────────────────────────────────────────
String buildUrl(const char* path) {
    return String("http://") + SERVER_IP + ":" + SERVER_PORT + path;
}

void setActive(bool active) {
    isActive = active;
    digitalWrite(LED_GREEN, active ? HIGH : LOW);
    digitalWrite(LED_RED, LOW);
    Serial.println(active ? "[STATE] >>> ACTIVATED <<<" : "[STATE] >>> DEACTIVATED <<<");
}

void setAlertLED(bool alert) {
    digitalWrite(LED_RED, alert ? HIGH : LOW);
    if (alert) digitalWrite(LED_GREEN, LOW);
}

// Generic POST helper
int httpPost(const char* path, const String& body) {
    if (!WiFi.isConnected()) {
        Serial.println("[HTTP] Not connected to WiFi!");
        return -1;
    }
    HTTPClient http;
    http.begin(buildUrl(path));
    http.addHeader("Content-Type", "application/json");
    int code = http.POST(body);
    String resp = http.getString();
    Serial.printf("[HTTP] POST %s → %d | %s\n", path, code, resp.c_str());
    http.end();
    return code;
}

// ── READ SENSORS ─────────────────────────────────────────────

float readTemperature() {
    if (!dhtAvailable) return NAN;
    float t = dht.readTemperature();
    if (isnan(t)) {
        Serial.println("[DHT] Read failed.");
        return NAN;
    }
    return t;
}

float readHumidity() {
    if (!dhtAvailable) return NAN;
    float h = dht.readHumidity();
    if (isnan(h)) return NAN;
    return h;
}

float readCurrent() {
    // Average 100 samples for stable reading
    long total = 0;
    for (int i = 0; i < 100; i++) {
        total += analogRead(ACS712_PIN);
        delayMicroseconds(100);
    }
    float avgADC = total / 100.0;
    float voltage = (avgADC / ACS712_ADC_MAX) * ACS712_VREF;
    float current = abs(voltage - ACS712_ZERO_V) / ACS712_SENS;

    // Noise floor: readings below 0.1A are likely noise
    if (current < 0.1) current = 0.0;
    return current;
}

// ── COMMAND POLLING ──────────────────────────────────────────
void pollCommand() {
    if (!WiFi.isConnected()) {
        Serial.println("[CMD] WiFi not connected, skipping poll.");
        return;
    }
    HTTPClient http;
    String url = buildUrl("/api/device/command/") + DEVICE_ID;
    http.begin(url);
    int code = http.GET();

    if (code == 200) {
        String payload = http.getString();
        StaticJsonDocument<512> doc;
        DeserializationError err = deserializeJson(doc, payload);

        if (err) {
            Serial.printf("[CMD] JSON parse error: %s\n", err.c_str());
        } else if (!doc.containsKey("command") || doc["command"].isNull()) {
            Serial.println("[CMD] No pending command.");
        } else {
            String cmd = doc["command"].as<String>();
            Serial.print("[CMD] Received: "); Serial.println(cmd);

            if (cmd == "ACTIVATE")   setActive(true);
            if (cmd == "DEACTIVATE") setActive(false);

            // Update thresholds if provided
            if (doc.containsKey("tempThresholdMin")) TEMP_THRESHOLD_MIN = doc["tempThresholdMin"];
            if (doc.containsKey("tempThresholdMax")) TEMP_THRESHOLD_MAX = doc["tempThresholdMax"];
            if (doc.containsKey("currentThresholdMax")) CURRENT_THRESHOLD = doc["currentThresholdMax"];
        }
    } else {
        Serial.printf("[CMD] Poll failed, HTTP: %d\n", code);
    }
    http.end();
}

// ── SENSOR DATA REPORTING ────────────────────────────────────
void sendSensorData() {
    lastTemp     = readTemperature();
    lastHumidity = readHumidity();
    lastCurrent  = readCurrent();

    StaticJsonDocument<256> doc;
    doc["deviceId"]    = DEVICE_ID;
    if (!isnan(lastTemp))     doc["temperature"] = lastTemp;
    if (!isnan(lastHumidity)) doc["humidity"]    = lastHumidity;
    doc["currentAmps"] = lastCurrent;

    String body; serializeJson(doc, body);
    int code = httpPost("/api/device/sensor-data", body);

    // Local threshold check → LED indicator
    bool tempAlert = false;
    if (!isnan(lastTemp)) {
        tempAlert = (lastTemp < TEMP_THRESHOLD_MIN || lastTemp > TEMP_THRESHOLD_MAX);
    }
    bool currentAlert = (lastCurrent > CURRENT_THRESHOLD);
    setAlertLED(tempAlert || currentAlert);

    // Print locally
    Serial.printf("[SENSOR] Temp: %.1f°C | Humidity: %.1f%% | Current: %.2fA | Alert: %s\n",
        isnan(lastTemp) ? 0.0 : lastTemp,
        isnan(lastHumidity) ? 0.0 : lastHumidity,
        lastCurrent,
        (tempAlert || currentAlert) ? "YES" : "NO");
}

// ── TEST MESSAGE ──────────────────────────────────────────────
void sendTestMessage(const String& message) {
    StaticJsonDocument<256> doc;
    doc["deviceId"] = DEVICE_ID;
    doc["message"]  = message;
    doc["isTest"]   = true;
    String body; serializeJson(doc, body);
    httpPost("/api/device/sensor-data", body);
}

// ── PRINT STATUS ──────────────────────────────────────────────
void printStatus() {
    Serial.println("\n========= DEVICE STATUS =========");
    Serial.printf("  WiFi:        %s (%s)\n",
        WiFi.isConnected() ? "CONNECTED" : "DISCONNECTED",
        WiFi.isConnected() ? WiFi.localIP().toString().c_str() : "—");
    Serial.printf("  DHT22:       %s\n", dhtAvailable ? "OK" : "NOT FOUND");
    Serial.printf("  Active:      %s\n", isActive ? "YES" : "NO");
    Serial.printf("  Temperature: %.1f°C (range: %.1f-%.1f°C)\n",
        isnan(lastTemp) ? 0.0 : lastTemp, TEMP_THRESHOLD_MIN, TEMP_THRESHOLD_MAX);
    Serial.printf("  Humidity:    %.1f%%\n", isnan(lastHumidity) ? 0.0 : lastHumidity);
    Serial.printf("  Current:     %.2fA (max: %.1fA)\n", lastCurrent, CURRENT_THRESHOLD);
    Serial.printf("  Device ID:   %s\n", DEVICE_ID);
    Serial.printf("  Server:      http://%s:%d\n", SERVER_IP, SERVER_PORT);
    Serial.println("=================================\n");
}

// ── TEST MENU ─────────────────────────────────────────────────
void printMenu() {
    Serial.println("\n====== TEST MENU (Serial Monitor) ======");
    Serial.println("  1  Test WiFi connection");
    Serial.println("  2  Force ACTIVATE (local)");
    Serial.println("  3  Force DEACTIVATE (local)");
    Serial.println("  4  Read DHT22 now");
    Serial.println("  5  Read ACS712 current now");
    Serial.println("  6  Send sensor data to server");
    Serial.println("  7  Send custom test message");
    Serial.println("  8  Poll command endpoint now");
    Serial.println("  0  Print device status");
    Serial.println("  h  Show this menu");
    Serial.println("=========================================\n");
}

void handleSerialMenu(char c) {
    if (awaitingCustomMsg) {
        if (c == '\n' || c == '\r') {
            if (customMsgBuffer.length() > 0) {
                Serial.printf("[TEST] Sending: \"%s\"\n", customMsgBuffer.c_str());
                sendTestMessage(customMsgBuffer);
                customMsgBuffer = "";
            }
            awaitingCustomMsg = false;
        } else {
            customMsgBuffer += c;
        }
        return;
    }

    switch (c) {
        case '1':
            Serial.println("[TEST] WiFi status:");
            if (WiFi.isConnected()) {
                Serial.println("  Connected! IP: " + WiFi.localIP().toString());
            } else {
                Serial.println("  NOT connected. Attempting reconnect...");
                WiFi.reconnect();
            }
            break;

        case '2':
            Serial.println("[TEST] Force ACTIVATE");
            setActive(true);
            break;

        case '3':
            Serial.println("[TEST] Force DEACTIVATE");
            setActive(false);
            break;

        case '4': {
            Serial.println("[TEST] Reading DHT22...");
            float t = readTemperature();
            float h = readHumidity();
            Serial.printf("[TEST] Temp: %.1f°C | Humidity: %.1f%%\n",
                isnan(t) ? 0.0 : t, isnan(h) ? 0.0 : h);
            if (!isnan(t)) {
                bool alert = (t < TEMP_THRESHOLD_MIN || t > TEMP_THRESHOLD_MAX);
                Serial.printf("[TEST] Threshold: %.1f-%.1f°C — %s\n",
                    TEMP_THRESHOLD_MIN, TEMP_THRESHOLD_MAX,
                    alert ? ">> ALERT! Outside range" : ">> Normal");
            }
            break;
        }

        case '5': {
            Serial.println("[TEST] Reading ACS712 current...");
            float cur = readCurrent();
            Serial.printf("[TEST] Current: %.2fA (threshold: %.1fA) — %s\n",
                cur, CURRENT_THRESHOLD,
                cur > CURRENT_THRESHOLD ? ">> ALERT!" : ">> Normal");
            break;
        }

        case '6':
            Serial.println("[TEST] Sending sensor data now...");
            sendSensorData();
            break;

        case '7':
            Serial.println("[TEST] Type your custom message and press Enter:");
            awaitingCustomMsg = true;
            customMsgBuffer   = "";
            break;

        case '8':
            Serial.println("[TEST] Polling command endpoint...");
            pollCommand();
            break;

        case '0':
            printStatus();
            break;

        case 'h': case 'H': case '?':
            printMenu();
            break;

        default:
            break;
    }
}

// ── SETUP ─────────────────────────────────────────────────────
void setup() {
    Serial.begin(115200);
    delay(500);
    Serial.println("\n\n=== PharmaSense IoT v1.0 ===");

    pinMode(LED_GREEN, OUTPUT);
    pinMode(LED_RED, OUTPUT);
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, LOW);

    // ── WiFi ──
    Serial.printf("Connecting to WiFi '%s'", WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    unsigned long wifiStart = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - wifiStart < 15000) {
        delay(500); Serial.print(".");
    }
    if (WiFi.isConnected()) {
        Serial.println("\n[WIFI] Connected: " + WiFi.localIP().toString());
    } else {
        Serial.println("\n[WIFI] FAILED to connect. Continuing — check credentials.");
    }

    // ── DHT22 — NON-BLOCKING ──
    dht.begin();
    delay(2000); // DHT22 needs 2s to stabilize
    float testTemp = dht.readTemperature();
    if (isnan(testTemp)) {
        Serial.println("[DHT] DHT22 NOT FOUND or read failed. Check wiring (DATA=GPIO4).");
        Serial.println("[DHT] Temperature monitoring DISABLED. Other functions continue.");
        dhtAvailable = false;
    } else {
        dhtAvailable = true;
        Serial.printf("[DHT] DHT22 ready. Initial reading: %.1f°C\n", testTemp);
    }

    // ── ACS712 — always available (analog read) ──
    pinMode(ACS712_PIN, INPUT);
    Serial.println("[ACS] ACS712 pin configured (GPIO34).");

    printMenu();
    Serial.println("Ready. Type 'h' in Serial Monitor for test options.\n");
}

// ── LOOP ──────────────────────────────────────────────────────
void loop() {
    unsigned long now = millis();

    // ── Serial test menu input ──
    while (Serial.available()) {
        char c = Serial.read();
        handleSerialMenu(c);
    }

    // ── Poll server for commands (every 5s) ──
    if (now - lastCommandCheck >= COMMAND_POLL_MS) {
        lastCommandCheck = now;
        pollCommand();
    }

    // ── Send sensor data (every 5s, only when active) ──
    if (isActive && now - lastSensorSend >= SENSOR_SEND_MS) {
        lastSensorSend = now;
        sendSensorData();
    }

    delay(100);
}
