# 🏥 PharmaSense — IoT Pharmacy Management Platform

A full-stack pharmacy management and monitoring system with real-time IoT integration. Built with **React**, **Express**, **MongoDB**, **Socket.io**, and **ESP32** hardware.

---

## ✨ Features

### 📦 Medicine Inventory Management
- Full CRUD operations for medicines (add, edit, delete)
- Track stock levels, batch numbers, expiry dates
- Auto-computed stock status: **In Stock**, **Low Stock**, **Expiring Soon**, **Expired**, **Out of Stock**
- Category filtering and search by name/ID/generic name
- Reorder level alerts and inventory value tracking

### 🌡️ Real-Time IoT Monitoring
- **ESP32 + DHT22** temperature/humidity sensor for cold storage compliance
- **ESP32 + ACS712** current sensor for fridge/equipment power monitoring
- Live temperature line charts and power consumption bar charts (Recharts)
- Threshold-based alerts — auto-generated when temp or current exceeds safe range
- Device health checks — stale device detection every 60 seconds

### 🛒 Orders & Billing
- Create orders with multiple medicine line items
- Automatic stock deduction on order creation
- Stock restoration on order cancellation
- Order history with status management (Pending → Completed / Cancelled)
- Revenue tracking and order statistics

### 🔔 Alert System
- Temperature breach alerts (below min or above max threshold)
- Power anomaly alerts (current exceeds max)
- Device offline warnings
- Acknowledge/dismiss alerts with user tracking
- Unread alert badge in sidebar navigation

### 👥 Two-Portal Design
- **Staff Portal** — Quick medicine lookup, stock check, and order creation
- **Admin Panel** — Full dashboard with inventory, monitoring, devices, orders, and alerts

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, TailwindCSS v4, Recharts, Lucide Icons |
| **Backend** | Node.js, Express, Socket.io |
| **Database** | MongoDB (Mongoose ODM) |
| **IoT Hardware** | ESP32, DHT22 (temp/humidity), ACS712 (current sensor) |
| **Real-Time** | Socket.io (WebSocket) for live dashboard updates |

---

## 📁 Project Structure

```
├── esp32-device/
│   └── esp32_firmware.ino        # ESP32 firmware (DHT22 + ACS712)
├── server/
│   ├── models/
│   │   ├── Alert.js              # Temperature/power alert model
│   │   ├── Device.js             # Fridge/equipment sensor node model
│   │   ├── Medicine.js           # Medicine inventory model
│   │   ├── Order.js              # Order/billing model
│   │   └── User.js               # Admin/staff user model
│   ├── routes/
│   │   └── api.js                # All REST API endpoints
│   ├── seed.js                   # Quick seed script
│   └── server.js                 # Express + Socket.io server
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminLayout.jsx   # Sidebar navigation layout
│   │   │   ├── AdminLogin.jsx    # Admin login form
│   │   │   ├── AlertsPanel.jsx   # Alert management panel
│   │   │   ├── DashboardHome.jsx # Main dashboard with stats + device list
│   │   │   ├── DeviceManager.jsx # Fridge activation wizard
│   │   │   ├── LiveMonitoring.jsx# Real-time temp/power charts
│   │   │   ├── MedicineInventory.jsx # Medicine CRUD interface
│   │   │   └── OrderManager.jsx  # Order management + creation
│   │   ├── staff/
│   │   │   ├── MedicineCard.jsx  # Medicine detail card
│   │   │   ├── MedicineLookup.jsx# Medicine search form
│   │   │   ├── OrderPanel.jsx    # Quick order form
│   │   │   ├── OrderSuccess.jsx  # Order confirmation view
│   │   │   └── StaffApp.jsx      # Staff portal entry
│   │   └── AdminDashboard.jsx    # Admin login gate
│   ├── context/
│   │   └── PharmacyContext.jsx   # Global state + Socket.io + API
│   ├── App.jsx                   # Landing page + portal routing
│   ├── index.css                 # Global styles + theme
│   └── main.jsx                  # React entry point
├── index.html                    # HTML entry
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org/)
- **MongoDB** — [Install Guide](https://www.mongodb.com/docs/manual/installation/)
- **Arduino IDE** (for ESP32 firmware) — [Download](https://www.arduino.cc/en/software)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd iot-vehicle\ \(1\)
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start MongoDB

```bash
# Linux / macOS
sudo systemctl start mongod

# Or if using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Start the Backend Server

```bash
npm run server
```

The server will start on `http://localhost:5000` and connect to MongoDB database `pharmacy_management_db`.

### 5. Seed the Database

Open a new terminal:

```bash
# Option 1: Use the seed script
npm run seed

# Option 2: Hit the seed endpoint directly
curl http://localhost:5000/api/seed
```

This creates:
- **8 sample medicines** (antibiotics, vaccines, analgesics, etc.)
- **4 fridge/equipment monitors** (FRIDGE_001 to FRIDGE_004)
- **4 sample orders** (2 completed, 2 pending)
- **1 admin user** (ID: `ADMIN`, Password: `123`)
- **1 sample alert**

### 6. Start the Frontend Dev Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`.

---

## 🔐 Login Credentials

| Portal | User ID | Password | Access |
|--------|---------|----------|--------|
| Admin Panel | `ADMIN` | `123` | Full dashboard, inventory, monitoring, orders, alerts |

The **Staff Portal** does not require login — it's a public-facing medicine lookup and quick order interface.

---

## 📡 API Endpoints

### Medicines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medicines` | List all medicines |
| GET | `/api/medicines/:medicineId` | Get single medicine |
| GET | `/api/medicines/search/:query` | Search medicines |
| GET | `/api/medicines/expiring` | Medicines expiring soon |
| GET | `/api/medicines/low-stock` | Low stock medicines |
| GET | `/api/medicines/stats` | Inventory statistics |
| POST | `/api/medicines` | Add new medicine |
| PUT | `/api/medicines/:medicineId` | Update medicine |
| DELETE | `/api/medicines/:medicineId` | Delete medicine |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/:orderId` | Get single order |
| GET | `/api/orders/stats` | Order statistics |
| POST | `/api/orders` | Create order (auto-deducts stock) |
| PUT | `/api/orders/:orderId` | Update order status |

### Devices (Fridges)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/devices` | All devices |
| GET | `/api/devices/available` | Inactive devices |
| POST | `/api/device/activate` | Activate monitoring |
| POST | `/api/device/deactivate` | Deactivate monitoring |
| GET | `/api/device/command/:deviceId` | ESP32 command polling |
| POST | `/api/device/sensor-data` | ESP32 sends readings |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | List alerts |
| GET | `/api/alerts/stats` | Alert statistics |
| POST | `/api/alerts/:alertId/acknowledge` | Acknowledge alert |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/seed` | Seed database |
| POST | `/api/auth/login` | Admin login |
| GET | `/api/dashboard-data` | Aggregated dashboard data |

---

## 🔌 ESP32 Firmware Setup

### Required Hardware

| Component | Connection |
|-----------|-----------|
| **ESP32** | Main controller |
| **DHT22** | DATA → GPIO4, VCC → 3.3V, GND → GND (10kΩ pull-up on DATA) |
| **ACS712 (5A)** | OUT → GPIO34, VCC → 5V, GND → GND |
| **Green LED** | GPIO2 (active indicator) |
| **Red LED** | GPIO15 (alert indicator) |

### Required Arduino Libraries

Install via Arduino Library Manager:
- `ArduinoJson` by bblanchon (v6.x)
- `DHT sensor library` by Adafruit
- `Adafruit Unified Sensor`

### Configuration

Edit these values in `esp32-device/esp32_firmware.ino`:

```cpp
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_IP     = "192.168.31.88";   // Your server IP
const int   SERVER_PORT   = 5000;
const char* DEVICE_ID     = "FRIDGE_001";       // Match a seeded device ID
```

### Upload & Run

1. Open `esp32_firmware.ino` in Arduino IDE
2. Select board: **ESP32 Dev Module**
3. Set port to your ESP32's serial port
4. Upload the firmware
5. Open Serial Monitor at **115200 baud**
6. Use the test menu (type `h` for help):
   - `1` — Test WiFi
   - `4` — Read DHT22
   - `5` — Read ACS712
   - `6` — Send data to server
   - `0` — Print status

### Communication Flow

```
ESP32 → POST /api/device/sensor-data → Server → Socket.io → Dashboard
ESP32 → GET  /api/device/command/:id → Server (polls every 5s)
```

### Testing Without Hardware

You can simulate sensor data using curl:

```bash
# Normal reading
curl -X POST http://localhost:5000/api/device/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"FRIDGE_001","temperature":4.5,"humidity":62,"currentAmps":3.2}'

# Temperature alert trigger (above 8°C threshold)
curl -X POST http://localhost:5000/api/device/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"FRIDGE_001","temperature":12.3,"humidity":70,"currentAmps":3.5}'
```

---

## 🖥️ Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_dashboard` | Client → Server | Join dashboard room for updates |
| `join_device` | Client → Server | Join device-specific room |
| `sensor_update` | Server → Client | Real-time sensor data push |
| `temperature_alert` | Server → Client | Temperature threshold breach |
| `power_alert` | Server → Client | Power consumption anomaly |
| `device_stale` | Server → Client | Device hasn't reported in 60s |
| `device_activated` | Server → Client | Device was activated |
| `device_deactivated` | Server → Client | Device was deactivated |
| `refresh_data` | Server → Client | Trigger dashboard data refresh |

---

## 📜 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev Server | `npm run dev` | Start Vite frontend (port 5173) |
| Backend | `npm run server` | Start Express + Socket.io (port 5000) |
| Seed DB | `npm run seed` | Populate database with sample data |
| Build | `npm run build` | Production build |
| Preview | `npm run preview` | Preview production build |

---

## 📊 Dashboard Tabs

| Tab | Description |
|-----|-------------|
| **Dashboard** | Overview with stats cards, device list, live readings, threshold alerts |
| **Live Monitoring** | Real-time temperature line charts and power bar charts (Recharts) |
| **Manage Fridges** | Step wizard to activate/deactivate fridge monitors with zone & threshold config |
| **Medicine Inventory** | Full CRUD table with search, category filter, stock indicators |
| **Orders & Billing** | Order creation with medicine selection, status management, revenue stats |
| **Alerts** | Timeline of temperature/power alerts with acknowledge functionality |

---

## 🛡️ Environment Variables

Create a `.env` file in the project root (optional):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pharmacy_management_db
```

---

## 📝 License

This project is for educational and demonstration purposes.

---

**PharmaSense IoT Platform v1.0** — Pharmacy Management & Monitoring System
