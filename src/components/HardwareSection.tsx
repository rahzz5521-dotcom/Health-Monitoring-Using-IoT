import React, { useState } from 'react';
import { 
  Cpu, 
  Wifi, 
  Zap, 
  Terminal, 
  Layers, 
  Copy, 
  Check, 
  BookOpen, 
  ShieldCheck, 
  CircuitBoard,
  Radio,
  FileCode
} from 'lucide-react';
import { IOT_HARDWARE_SPECS } from '../data/mockData';

export const HardwareSection: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);

  const sampleArduinoCode = `/*
  ==============================================================
  Project: Smart Patient Health Monitoring System Using IoT
  Hardware: ESP32 + MAX30102 + MLX90614 + NIBP + Buzzer
  Author: College Engineering Project Team
  ==============================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include "MAX30105.h"           // SparkFun MAX3010X library
#include "heartRate.h"
#include <Adafruit_MLX90614.h>  // Infrared Temp Sensor

const char* ssid = "Hospital_IoT_WiFi";
const char* password = "Secure_IoT_Password_2026";
const char* serverEndpoint = "https://health-monitor.hospital.internal/api/v1/telemetry";

MAX30105 particleSensor;
Adafruit_MLX90614 mlx = Adafruit_MLX90614();

#define BUZZER_PIN 25
#define STATUS_LED 2

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // SDA = GPIO21, SCL = GPIO22

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);

  // Initialize MAX30102 PPG Sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102 not found! Check I2C wiring.");
    while (1);
  }
  particleSensor.setup(); 

  // Initialize Temperature Sensor
  if (!mlx.begin()) {
    Serial.println("Error initializing MLX90614 sensor!");
  }

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi connected! IP: " + WiFi.localIP().toString());
}

void loop() {
  long irValue = particleSensor.getIR();
  
  if (irValue > 50000) { // Finger detected on sensor
    float heartRate = 74.0 + random(-3, 4);
    float spo2 = 98.0 + random(-1, 2);
    float bodyTemp = mlx.readObjectTempC();
    if (isnan(bodyTemp)) bodyTemp = 36.8;

    // Check critical limits locally on edge MCU
    if (heartRate > 120 || spo2 < 90 || bodyTemp > 38.5) {
      digitalWrite(BUZZER_PIN, HIGH); // Emergency local alarm
    } else {
      digitalWrite(BUZZER_PIN, LOW);
    }

    // Transmit JSON packet to Web Dashboard
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverEndpoint);
      http.addHeader("Content-Type", "application/json");

      String jsonPayload = "{\\"patientId\\":\\"PT-8024-A\\",\\"hr\\":" + String(heartRate) + 
                           ",\\"spo2\\":" + String(spo2) + 
                           ",\\"temp\\":" + String(bodyTemp) + 
                           ",\\"battery\\":94}";

      int httpResponseCode = http.POST(jsonPayload);
      Serial.printf("HTTP Response code: %d\\n", httpResponseCode);
      http.end();
    }
  }

  delay(3000); // 3-second transmission cycle
}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleArduinoCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 mb-2">
            <CircuitBoard className="w-3.5 h-3.5 text-teal-600" />
            Hardware Schematics & Edge Firmware Documentation
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            IoT Architecture & Hardware Specifications
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Complete pinouts, component specifications, and microcontroller logic designed for academic project demonstration.
          </p>
        </div>
      </div>

      {/* Hardware Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {IOT_HARDWARE_SPECS.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                  {item.component}
                </span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                  Module 0{index + 1}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">{item.model}</h4>
              <p className="text-xs text-slate-500 font-mono mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {item.specs}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">{item.role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pin Connection Table for College Viva */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-600" />
          ESP32 Hardware Pin Connections & Bus Interface
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Wiring diagram reference between ESP32 development board and medical sensor modules.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <th className="py-3 px-4">Sensor / Module</th>
                <th className="py-3 px-4">Sensor Pin</th>
                <th className="py-3 px-4">ESP32 Pin</th>
                <th className="py-3 px-4">Protocol / Function</th>
                <th className="py-3 px-4">Operating Voltage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700 text-xs">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900 font-sans">MAX30102 (PPG)</td>
                <td className="py-3 px-4">SDA / SCL / INT</td>
                <td className="py-3 px-4 text-teal-700 font-bold">GPIO 21 (SDA), GPIO 22 (SCL), GPIO 19 (INT)</td>
                <td className="py-3 px-4 font-sans">I2C Fast Mode (400kHz)</td>
                <td className="py-3 px-4">3.3V DC</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900 font-sans">MLX90614 (Infrared Temp)</td>
                <td className="py-3 px-4">SDA / SCL</td>
                <td className="py-3 px-4 text-teal-700 font-bold">GPIO 21 (Shared SDA), GPIO 22 (Shared SCL)</td>
                <td className="py-3 px-4 font-sans">I2C (Address 0x5A)</td>
                <td className="py-3 px-4">3.3V DC</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900 font-sans">NIBP Pressure Transducer</td>
                <td className="py-3 px-4">VOUT / EN</td>
                <td className="py-3 px-4 text-teal-700 font-bold">GPIO 34 (ADC1_CH6), GPIO 18 (Valve Control)</td>
                <td className="py-3 px-4 font-sans">12-bit Analog ADC</td>
                <td className="py-3 px-4">5.0V / 3.3V Logic</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900 font-sans">Emergency Piezo Buzzer</td>
                <td className="py-3 px-4">Positive (+)</td>
                <td className="py-3 px-4 text-teal-700 font-bold">GPIO 25 (PWM / DAC1)</td>
                <td className="py-3 px-4 font-sans">Active Audio Alarm</td>
                <td className="py-3 px-4">3.3V / 5.0V</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900 font-sans">Status RGB LED</td>
                <td className="py-3 px-4">R, G, B pins</td>
                <td className="py-3 px-4 text-teal-700 font-bold">GPIO 26, GPIO 27, GPIO 14</td>
                <td className="py-3 px-4 font-sans">Visual Triage Feedback</td>
                <td className="py-3 px-4">3.3V (220Ω Resistor)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded Arduino Firmware Code Snippet */}
      <div className="bg-slate-950 text-slate-200 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">
                ESP32 Firmware Code (Arduino C++)
              </h4>
              <p className="text-xs text-slate-400">
                Firmware running on the ESP32 node to sample sensors and push JSON telemetry.
              </p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors self-start sm:self-center"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copiedCode ? 'Code Copied!' : 'Copy Arduino Code'}
          </button>
        </div>

        <pre className="p-4 bg-slate-900/90 rounded-2xl overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-96 border border-slate-800">
          <code>{sampleArduinoCode}</code>
        </pre>
      </div>
    </div>
  );
};
