# Pharmacy Management & Monitoring Platform — Transformation Plan

Transform the existing **IoT Vehicle Security System** into a **Pharmacy Management & Monitoring Platform** while preserving the core architecture, UI structure, and IoT integration logic.

## Architecture Mapping (Vehicle → Pharmacy)

| Original Concept | Pharmacy Equivalent                         |
| ---------------- | ------------------------------------------- |
| Vehicle          | Medicine                                    |
| Challan (fine)   | Order / prescription fill                   |
| Police Dashboard | Admin Dashboard                             |
| Civilian Portal  | Staff Portal (lookup/orders)                |
| Device (lock)    | IoT Sensor Node (temp + current)            |
| ARM / DISARM     | Enable / Disable monitoring                 |
| Stolen Alert     | Temperature breach alert                    |
| Tamper Alert     | Power anomaly alert                         |
| GPS Location     | Sensor placement / zone                     |
| Officer          | Admin user                                  |
| Live Map         | Temperature & Power Dashboard (live graphs) |

## User Review Required

> [!IMPORTANT]
> The transformation preserves the **exact same folder structure, navigation layout (sidebar + content), landing page (two-card entry), login flow, and Socket.io real-time pattern**. Every component is re-themed, not restructured.

> [!WARNING]
> **Leaflet map** is replaced with **live charts** (using [Recharts](https://recharts.org/)) for temperature/power history. This requires adding `recharts` as a dependency.

> [!IMPORTANT]
> **ESP32 firmware**: MPU6050 + GPS libraries are replaced with DHT22 (temperature/humidity) + ACS712 (current sensor). The same HTTP polling & POST pattern is preserved. If you don't have these sensors yet, mock data mode is included.

---

## Proposed Changes

### Backend — Models

#### [MODIFY] [Device.js](file:///home/atharva/antigravity/iot-vehicle%20(1)/server/models/Device.js)
Rename to concept of "Sensor Node". Add fields:
- `temperature` (Number) — latest reading
- `humidity` (Number) — latest reading  
- `currentAmps` (Number) — latest power draw
- `temperatureHistory` (Array of `{value, timestamp}`, capped at 100)
- `currentHistory` (Array of `{value, timestamp}`, capped at 100)
- `zone` (String) — e.g. "Cold Storage A", "Fridge B"
- `tempThresholdMin` / `tempThresholdMax` (Number, defaults 2°C / 8°C)
- `lastSensorData` (Date)
- Remove `assignedVehicle`, `isTampered`, GPS fields
- Keep `status` enum but change to `['ACTIVE', 'INACTIVE', 'ALERT']`
- Keep `pendingCommand` for ESP32 polling

#### [MODIFY] [Vehicle.js](file:///home/atharva/antigravity/iot-vehicle%20(1)/server/models/Vehicle.js) → **Medicine.js**
Rename file. New schema:
- `medicineId` (String, unique) — e.g. "MED001"
- `name` (String, required)
- `genericName` (String)
- `category` (String) — e.g. "Antibiotic", "Analgesic", "Vaccine"
- `manufacturer` (String)
- `batchNumber` (String)
- `expiryDate` (Date, required)
- `quantity` (Number, required)
- `unitPrice` (Number)
- `storageRequirement` (String) — "Cold Storage", "Room Temperature", etc.
- `reorderLevel` (Number, default 10)
- `location` (String) — shelf/zone
- `status` (String) — "In Stock", "Low Stock", "Expired", "Out of Stock"

#### [MODIFY] [Challan.js](file:///home/atharva/antigravity/iot-vehicle%20(1)/server/models/Challan.js) → **Order.js**
Rename. New schema:
- `orderId` (String, unique)
- `items` (Array of `{medicineId, name, quantity, unitPrice}`)
- `totalAmount` (Number)
- `customerName` (String)
- `customerPhone` (String)
- `status` (String) — "PENDING", "COMPLETED", "CANCELLED"
- `prescriptionRef` (String, optional)
- `createdBy` (String) — staff ID
- `createdAt` / `completedAt` (Date)

#### [MODIFY] [Officer.js](file:///home/atharva/antigravity/iot-vehicle%20(1)/server/models/Officer.js) → **User.js**
Rename. Schema:
- `userId` (String, unique)
- `password` (String)
- `name` (String)
- `phone` (String)
- `role` (String, enum: `['ADMIN', 'STAFF']`, default 'STAFF')

#### [NEW] [Alert.js](file:///home/atharva/antigravity/iot-vehicle%20(1)/server/models/Alert.js)
New model for temperature/power alerts:
- `alertId` (String, unique)
- `deviceId` (String)
- `type` (String) — "TEMPERATURE", "POWER", "DEVICE_OFFLINE"
- `value` (Number) — the reading that triggered it
- `threshold` (String) — description of breach
- `acknowledged` (Boolean, default false)
- `acknowledgedBy` (String)
- `createdAt` (Date)

---

### Backend — Routes & Server

#### [MODIFY] [api.js](file:///home/atharva/antigravity/iot-vehicle%20(1)/server/routes/api.js)
Complete rewrite mapped from existing routes:

**Preserved patterns:**
- Seed endpoint (GET/POST `/api/seed`) — seeds medicines, devices, sample orders, admin user
- CRUD for Medicines (replacing Vehicles)
- CRUD for Orders (replacing Challans)
- Device endpoints (command polling, sensor data POST)
- Auth endpoint (login)
- Dashboard-data endpoint (aggregated view)

**New pharmacy endpoints:**
| Endpoint                        | Method           | Purpose                                 |
| ------------------------------- | ---------------- | --------------------------------------- |
| `/api/medicines`                | GET, POST        | List / create medicines                 |
| `/api/medicines/:id`            | GET, PUT, DELETE | Single medicine CRUD                    |
| `/api/medicines/expiring`       | GET              | Medicines expiring within 30 days       |
| `/api/medicines/low-stock`      | GET              | Medicines below reorder level           |
| `/api/orders`                   | GET, POST        | List / create orders                    |
| `/api/orders/:id`               | GET, PUT         | Get / update order                      |
| `/api/orders/stats`             | GET              | Order statistics                        |
| `/api/devices/available`        | GET              | Available sensor nodes                  |
| `/api/device/command/:deviceId` | GET              | ESP32 polls for commands (kept as-is)   |
| `/api/device/sensor-data`       | POST             | **ESP32 sends temp + current readings** |
| `/api/device/activate`          | POST             | Activate monitoring on a device         |
| `/api/device/deactivate`        | POST             | Deactivate monitoring                   |
| `/api/alerts`                   | GET              | List all alerts                         |
| `/api/alerts/:id/acknowledge`   | POST             | Acknowledge an alert                    |
| `/api/dashboard-data`           | GET              | Aggregated dashboard data               |
| `/api/auth/login`               | POST             | Login (kept as-is)                      |

**Socket.io events preserved:**
- `join_device` / `join_dashboard` — same room logic
- `sensor_update` (replaces `map_update`) — real-time temp/current push
- `temperature_alert` (replaces `theft_alert`) — threshold breach
- `power_alert` (replaces `tamper_alert`) — abnormal current
- `refresh_data` — kept as-is

#### [MODIFY] [server.js](file:///home/atharva/antigravity/iot-vehicle%20(1)/server/server.js)
- Change DB name to `pharmacy_management_db`
- Socket.io logic structure preserved identically
- Add periodic device health check (mark devices as INACTIVE if no data for 60s)

#### [MODIFY] [seed.js](file:///home/atharva/antigravity/iot-vehicle%20(1)/server/seed.js)
Update to call new seed endpoint

---

### Frontend — Context

#### [MODIFY] [VehicleContext.jsx](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/context/VehicleContext.jsx) → **PharmacyContext.jsx**
Rename. Same structure:
- `medicines` state (replaces `vehicles`)
- `sensorDevices` state (new — live sensor data)
- `alerts` state (new — active alerts)
- `currentUser` / `login` / `logout` — kept identical
- Socket.io setup — same pattern, new event names
- CRUD functions for medicines, orders
- `activateDevice` / `deactivateDevice` (replaces arm/disarm)
- `fetchDashboardData` — same pattern, new data shape

---

### Frontend — Components (preserving UI skeleton)

#### [MODIFY] [App.jsx](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/App.jsx)
- Landing page: Two cards remain. "Vehicle Owner" → **"Staff Portal"** (blue card). "Police Dept." → **"Admin Dashboard"** (dark card).
- Icons: `User` → `ClipboardList`. `Shield` → `ShieldCheck`.
- Footer: "Smart Traffic Enforcement System v2.0" → "PharmaSense IoT Platform v1.0"
- Provider renamed to `PharmacyProvider`

#### Admin Side (replaces Police)

#### [MODIFY] [PoliceDashboard.jsx](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/components/PoliceDashboard.jsx) → **AdminDashboard.jsx**
Same login gate pattern.

#### [MODIFY] [PoliceLogin.jsx](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/components/police/PoliceLogin.jsx) → **AdminLogin.jsx**
Same form, re-themed: "Officer Login" → "Admin Login", "Traffic Enforcement System" → "Pharmacy Management System".

#### [MODIFY] [PoliceLayout.jsx](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/components/police/PoliceLayout.jsx) → **AdminLayout.jsx**
Same sidebar structure. Nav items change:
| Original         | New                                     |
| ---------------- | --------------------------------------- |
| Fleet Overview   | Dashboard                               |
| Live Map         | **Live Monitoring** (temp/power charts) |
| Arm Device       | **Manage Devices**                      |
| Vehicle Database | **Medicine Inventory**                  |
| Challans         | **Orders & Billing**                    |

New nav item added: **Alerts** (bell icon with unread count badge)

#### [MODIFY] [DashboardHome.jsx](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/components/police/DashboardHome.jsx) → **DashboardHome.jsx**
Same layout (list + detail panel). Changes:
- Stats bar: Armed/Stolen/Available → Active Sensors / Alerts / Medicines in Stock / Low Stock / Expiring Soon
- List shows sensor devices with current temp/current readings
- Detail panel shows device info, live readings, mini chart
- Alert banner for temperature breaches (replaces stolen alert)

#### [MODIFY] [LiveMap.jsx](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/components/police/LiveMap.jsx) → **LiveMonitoring.jsx**
Replace Leaflet map with **Recharts** dashboard:
- Real-time temperature line chart per device
- Real-time current/power bar chart
- Zone cards showing status
- Threshold lines on charts
- Same real-time update via socket

#### [MODIFY] [LockActivation.jsx](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/components/police/LockActivation.jsx) → **DeviceManager.jsx**
Same step-wizard UI. Steps: Select Device → Assign Zone → Confirm & Activate.

#### [MODIFY] [VehicleDatabase.jsx](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/components/police/VehicleDatabase.jsx) → **MedicineInventory.jsx**
Same table/card-based CRUD UI. Fields changed to medicine attributes. Add expiry highlighting, stock level indicators.

#### [MODIFY] [ChallanManager.jsx](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/components/police/ChallanManager.jsx) → **OrderManager.jsx**
Same list + stats layout. Manage orders: create order (select medicines, quantities), view history, mark completed.

#### [NEW] [AlertsPanel.jsx](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/components/admin/AlertsPanel.jsx)
New component for viewing and acknowledging alerts. Timeline-style layout.

#### Staff Side (replaces Civilian)

#### [MODIFY] [CivilianApp.jsx](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/components/civilian/CivilianApp.jsx) → **StaffApp.jsx**
Same card-based layout. Steps: Lookup Medicine → View Details/Stock → Create Order.

#### [MODIFY] [VehicleLookup.jsx](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/components/civilian/VehicleLookup.jsx) → **MedicineLookup.jsx**
Same search input pattern. Search medicines by name or ID.

#### [MODIFY] [ChallanCard.jsx](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/components/civilian/ChallanCard.jsx) → **MedicineCard.jsx**
Display medicine details, stock level, expiry.

#### [MODIFY] [PaymentPanel.jsx](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/components/civilian/PaymentPanel.jsx) → **OrderPanel.jsx**
Create order form with quantity selection.

#### [MODIFY] [PaymentSuccess.jsx](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/components/civilian/PaymentSuccess.jsx) → **OrderSuccess.jsx**
Order confirmation view.

---

### Frontend — Styles & Config

#### [MODIFY] [index.css](file:///home/atharva/antigravity/iot-vehicle%20(1)/src/index.css)
- Update theme colors: keep slate/blue base, add pharmacy accent (teal/emerald for health theme)
- Add `--color-pharma-teal: #0d9488` and `--color-pharma-emerald: #059669`

#### [MODIFY] [index.html](file:///home/atharva/antigravity/iot-vehicle%20(1)/index.html)
- Title: "PharmaSense — Pharmacy Management Platform"
- Add meta description for SEO

---

### ESP32 Firmware

#### [MODIFY] [esp32_firmware.ino](file:///home/atharva/antigravity/iot-vehicle%20(1)/esp32-device/esp32_firmware.ino)
Complete rewrite preserving the **exact same communication patterns**:

**Hardware changes:**
- Remove: MPU6050, GPS, Buzzer
- Add: DHT22 (temperature/humidity on GPIO4), ACS712 (current on GPIO34)

**Same patterns preserved:**
- WiFi connect with timeout
- HTTP POST helper (`httpPost()`)
- Command polling (`pollCommand()`) — every 5s, same acknowledge pattern
- Serial test menu (adapted for new sensors)
- Sensor fault tolerance (DHT/ACS failure doesn't halt)

**New behavior:**
- Read temperature + humidity from DHT22 every 5s
- Read current from ACS712 analog every 5s
- POST to `/api/device/sensor-data` with `{deviceId, temperature, humidity, currentAmps}`
- Local threshold check: if temp outside 2-8°C range, include `alert: true` in POST
- LED indicator: Green = normal, Red = alert (replaces buzzer)

---

### New Dependency

#### [MODIFY] [package.json](file:///home/atharva/antigravity/iot-vehicle%20(1)/package.json)
- Add `recharts` (for live charts replacing Leaflet map)
- Remove `leaflet`, `react-leaflet` (no longer needed)
- Update `name` to `"pharmasense"`

---

## File Rename Summary

| Original                                     | New                                          |
| -------------------------------------------- | -------------------------------------------- |
| `src/context/VehicleContext.jsx`             | `src/context/PharmacyContext.jsx`            |
| `src/components/PoliceDashboard.jsx`         | `src/components/AdminDashboard.jsx`          |
| `src/components/police/`                     | `src/components/admin/`                      |
| `src/components/police/PoliceLogin.jsx`      | `src/components/admin/AdminLogin.jsx`        |
| `src/components/police/PoliceLayout.jsx`     | `src/components/admin/AdminLayout.jsx`       |
| `src/components/police/DashboardHome.jsx`    | `src/components/admin/DashboardHome.jsx`     |
| `src/components/police/LiveMap.jsx`          | `src/components/admin/LiveMonitoring.jsx`    |
| `src/components/police/LockActivation.jsx`   | `src/components/admin/DeviceManager.jsx`     |
| `src/components/police/VehicleDatabase.jsx`  | `src/components/admin/MedicineInventory.jsx` |
| `src/components/police/ChallanManager.jsx`   | `src/components/admin/OrderManager.jsx`      |
| `src/components/civilian/`                   | `src/components/staff/`                      |
| `src/components/civilian/CivilianApp.jsx`    | `src/components/staff/StaffApp.jsx`          |
| `src/components/civilian/VehicleLookup.jsx`  | `src/components/staff/MedicineLookup.jsx`    |
| `src/components/civilian/ChallanCard.jsx`    | `src/components/staff/MedicineCard.jsx`      |
| `src/components/civilian/PaymentPanel.jsx`   | `src/components/staff/OrderPanel.jsx`        |
| `src/components/civilian/PaymentSuccess.jsx` | `src/components/staff/OrderSuccess.jsx`      |
| `server/models/Vehicle.js`                   | `server/models/Medicine.js`                  |
| `server/models/Challan.js`                   | `server/models/Order.js`                     |
| `server/models/Officer.js`                   | `server/models/User.js`                      |

---

## Open Questions

> [!IMPORTANT]
> **Recharts vs Chart.js**: I plan to use **Recharts** for live monitoring charts (better React integration). Are you okay with this, or do you prefer Chart.js?

> [!IMPORTANT]
> **ESP32 sensor hardware**: The firmware will be written for **DHT22** (temperature) and **ACS712** (current). If you're using different sensors, let me know and I'll adjust.

> [!WARNING]
> **Database**: The MongoDB database name changes from `vehicle_safety_db` to `pharmacy_management_db`. Existing data will not be migrated — you'll need to run the seed endpoint. Is this acceptable?

> [!NOTE]
> **Leaflet removal**: Since we're replacing the live GPS map with temperature/power monitoring charts, the `leaflet` and `react-leaflet` dependencies will be removed. The Live Map tab becomes **Live Monitoring** with real-time Recharts graphs. Confirmed?

---

## Verification Plan

### Automated Tests
1. Start MongoDB → run `npm run server` → hit `GET /api/seed` to populate data
2. Run `npm run dev` → verify landing page renders with pharmacy branding
3. Login as Admin (ADMIN / 123) → verify all 6 sidebar tabs render
4. Test CRUD operations on Medicine Inventory
5. Test order creation flow from Staff Portal
6. Verify Socket.io real-time updates by POSTing mock sensor data via curl:
   ```bash
   curl -X POST http://localhost:5000/api/device/sensor-data \
     -H "Content-Type: application/json" \
     -d '{"deviceId":"SENSOR_001","temperature":9.5,"humidity":65,"currentAmps":2.3}'
   ```
7. Verify alert generation when temperature exceeds threshold
8. Build production bundle: `npm run build` — confirm no errors

### Manual Verification
- Visual inspection of all pages for design consistency
- Browser recording of key user flows
- ESP32 firmware compilation check (Arduino IDE)
