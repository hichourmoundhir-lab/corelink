# Market & Product Blueprint — Event-Vision SoPC Companion Module for Reactive Drone Control

**MVP definition, competitive positioning, and go-to-market for the drone market**

- **Product:** CoreLink companion board
- **Category:** Sense-and-avoid / guidance add-on
- **Differentiators:** Sub-ms latency, HDR, low SWaP
- **Status:** Draft v0.1 — 7 Aug 2026

## 1. Executive Summary

CoreLink is a low-power companion module that gives existing drones **sub-millisecond reactive perception** by processing an event camera in streaming FPGA fabric. It plugs into the open PX4/ArduPilot ecosystem as a MAVLink/ROS 2 device and emits advisory outputs (brake, avoid, slow-down, capture) — it never directly commands flight controls.

The MVP sells a **determinism and latency advantage**, not a benchmark-win. Against Jetson and Hailo-class NPUs running the same task, CoreLink wins on end-to-end latency determinism, HDR robustness (no motion blur), and watts/J-per-decision; it may lose on raw TOPS/W for a fixed CNN, and the evaluation will say so honestly.

> **Positioning**
>
> The buyer is not the drone OEM who wants a generic accelerator. The buyer is an inspection/delivery service provider whose mission fails on blurred, missed, or slow-reacting perception. CoreLink makes the aircraft a better closed-loop observer at a fraction of a GPU's power budget.

## 2. Market Context

### 2.1 Target verticals

- **Power-line / utility inspection** — high-contrast scenes (sun, shadows, cable glare) are exactly where frame cameras fail and event cameras excel; reactive braking prevents contact with conductors and structures.
- **Indoor & near-field inspection** (tunnels, tanks, confined space) — low light, high dynamic range, tight maneuvering.
- **Delivery / logistics** — precision landing on marked pads, obstacle braking in cluttered yards.
- **First-response and agriculture** — follow and avoid in unstructured terrain (secondary, later).

### 2.2 Why now

- Commercial event sensors are now cheap and shipping (e.g., the $400 Prophesee GENX320 module); the sensing bottleneck moved from sensor cost to processing.
- NPU/GPU latency jitter is a known, unfixable-in-software problem for closed-loop control; the market has not yet seen a *companion* product that owns the latency argument end-to-end.
- Open flight stacks (PX4/ArduPilot) make a drop-in companion module commercially viable without OEM certification work.

## 3. MVP Definition

| Dimension | MVP scope |
|---|---|
| Sensor | Single event camera: Prophesee GENX320 module (OpenMV) at ~$400, 320×320, >140 dB HDR, sub-ms event latency, with standard interface to PL. Higher-resolution options (iniVation DVXplorer-class, $1,500–$4,000) deferred. |
| Processing | Streaming FPGA pipeline: event pre-processing, time-surface accumulation, optical flow, occupancy/obstacle map. |
| Outputs | MAVLink/ROS 2 advisory messages: brake, avoid, slow-down, capture. Rate-limited and logged. |
| Safety | Advisory-only. No direct flight-control actuation. CBF safety filter enforces a minimum braking distance guarantee. |
| Out of scope v1 | Autonomous BVLOS, safety certification, direct actuation, multi-sensor SLAM, LiDAR fusion, video encoding, generic CNN benchmarking. |
| Secondary extension | Event-based precision landing on a marked pad (visual servoing). |

### 3.1 What it is *not*

- Not a generic FPGA accelerator board sold to OEMs.
- Not a competing autopilot.
- Not an NPU-killer — it does not promise to win TOPS/W for a fixed detector.
- Not a defect-diagnosis product; candidate flags remain reviewable by an operator.

### 3.2 Sensor choice rationale

The event camera is the load-bearing decision of the MVP: it is the only sensor class that delivers sub-millisecond latency, high dynamic range without motion blur, and texture for visual servoing in one package. A cheap ($400) production sensor — the Prophesee GENX320 — now exists, which removes the cost objection. Alternatives were evaluated and rejected for the MVP:

| Alternative | Cost | Why not the MVP sensor |
|---|---|---|
| ToF / depth camera (RealSense/OAK) | $150–400 | Frame-rate latency (10–30 ms) and poor outdoor HDR; no sub-ms determinism. |
| Solid-state LiDAR (TF-Luna/LD06) | $100–200 | Range only, no texture; useless for landing-pad servoing; weather-limited. |
| Mid-range LiDAR (Livox-class) | $1,500+ | Costlier than the whole CoreLink system; still no HDR-vision. |
| mmWave radar | $100–400 | Good range/velocity, but no angular/texture resolution for visual servoing. |
| Ultrasonic | $5–50 | Too slow and short-range for reactive loops. |

None match the event camera on the latency + HDR + visual-texture combination that the thesis's latency-to-stability claim requires. A low-cost LiDAR or radar may be added later as a *complementary safety channel*, not a substitute.

### 3.3 MVP cost model (per unit)

| Component | CoreLink MVP | Hailo-based system (reference) |
|---|---|---|
| Camera | GENX320 event module: $400 | Frame cam: $30–150 |
| Accelerator / fabric | Kria K26 SOM: $300–400 | Hailo-8 M.2: $119 |
| Host CPU/board | None needed (ARM on-SoPC) | RPi 5 (~$90) or Jetson (~$280) |
| Carrier / adapter / PSU / misc | $150–250 | $30–100 |
| **Total BOM** | **~$850–1,050** | **~$270–470** (RPi) / ~$520–650 (Jetson) |
| Engineering to reach a working closed loop | Ships as the loop (drop-in MAVLink advisory) | Significant: glue, latency tuning, autopilot bridge |

**Honest read:** Hailo wins on raw parts cost and CNN throughput. CoreLink wins on what makes the loop work — latency determinism, HDR, a provable safety margin, and drop-in integration. The buyer economics that decide the sale are re-flight cost, analyst time, and contact/crash risk, which the $200 part-price difference does not capture.

## 4. Competitive Positioning

The reference comparison is a mission-grade companion computer (Jetson-class) and a low-power NPU (Hailo-class) executing the same perception task at matched accuracy and input rate. The honest win/loss table:

| Dimension | CoreLink (SoPC) | Jetson-class GPU | Hailo-class NPU |
|---|---|---|---|
| End-to-end latency | Sub-ms, deterministic (p99 ≈ max) | 30–100 ms, jittery | 5–30 ms, batch-dependent |
| Latency under load | Constant (streaming) | Degrades with queue occupancy | Degrades with batch/fragmentation |
| HDR / motion-blur | Event-native (no blur) | Blur + rolling shutter | Frame-camera dependent |
| Power | Low (SoPC-class) | High | Very low |
| TOPS/W for fixed CNN | Loses to dedicated NPUs | Loses | Wins |
| Interface flexibility | Custom I/O, evolving sensor/model without silicon respin | Software-defined | Fixed graph, vendor tooling |
| Integration effort | HLS/RTL expertise required | Mature SDK | Vendor toolchain |

The strategic claim: **deterministic latency and HDR robustness change what closed-loop control can do.** A GPU/NPU cannot win that argument by software tuning. This is the durable wedge; TOPS/W is conceded honestly.

## 5. Business Model & Go-to-Market

### 5.1 Entry market

Start with industrial drone **service providers and smaller custom-platform integrators** that already serve utilities and delivery. They fly open PX4/ArduPilot systems, control mission workflow, and feel re-flight/analyst cost directly. Do *not* begin by selling a generic board to OEMs or targeting vertically-integrated drone manufacturers.

### 5.2 Offer ladder

| Offer | Customer | Commercial purpose |
|---|---|---|
| Pilot kit | Inspection service provider / integrator | Dev board or enclosed companion module, integration support, event logs, review export. Paid pilot or co-funded validation. |
| Retrofit product | Selected open-platform inspection fleets | Ruggedized companion module with supported camera and autopilot interfaces. Hardware margin + per-aircraft software/analytics licence. |
| OEM / NRE programme | Companion-computer or airframe suppliers | Custom I/O, form factor, bitstream after the core is field-proven. The scale path, not the first revenue path. |

### 5.3 First commercial proof

The first commercial proof is **not a board shipment**. It is a buyer who can show on their own inspection workflow: fewer unusable captures, fewer repeat passes, faster analyst triage, or longer mission endurance. That evidence strengthens both the paper and subsequent design-in sales.

### 5.4 Product line: three variants from one pipeline

The MVP is designed as one modular, configurable pipeline (sensor → pre-processing → optical flow → occupancy → CBF filter → MAVLink out), where each capability claim maps to a specific stage. HDR comes from the event sensor, sub-ms latency from the streaming fabric, and integration/SWaP from the companion-module design. Because every HLS kernel also has a software reference implementation, variants are re-targeted builds of the same codebase — not new products.

| SKU | Keeps | Drops | Architecture | Extraction effort from MVP | Target market |
|---|---|---|---|---|---|
| **A — Value** | HDR + SWaP/integration | sub-ms → runs at 10–30 ms | Event camera + ARM software pipeline (no streaming fabric) | **Low.** Same kernels compiled for ARM; configurable build path already designed in. | Inspection / delivery where 30 ms is sufficient |
| **B — Flagship (MVP)** | All three: sub-ms + HDR + SWaP | none | Full streaming FPGA pipeline, exactly as spec'd | Baseline — this is the MVP itself. | Premium inspection, BVLOS |
| **C — Latency core** | sub-ms only | HDR/SWaP (uses customer's existing frame camera) | FPGA latency fabric + any sensor the customer brings | **Medium.** Fabric is reusable; needs sensor-interface adaptation and a frame-camera ingest path. | High-speed autonomy / defense |

**Extraction guidance:** A is a build-flag change, not a project. C is a sensor-swap plus interface work on an existing fabric. Do not engineer any variant ahead of a customer ask.

### 5.5 Go-to-market: pitch the full MVP, sell the configured product

The commercial strategy for the first customers is **sell the flagship capability, then configure to the buyer's real need**:

- **Pitch the full product (B)** — sub-ms determinism + HDR + SWaP — as the complete capability. It is the credibility proof and the thesis artifact.
- **Let the first customers decide the variant** — when a buyer says "we don't need sub-ms," "we have our own camera," or "we need it lighter/cheaper at 30 ms," drop the corresponding stage of the same build. No redesign.
- **First-customer conversations de-risk the product line** — they reveal which claims are actually paid for before any variant-specific engineering is invested.
- **No upfront variant inventory** — build B, pitch it everywhere, and let real demand trigger A or C.

This mirrors a classic hardware halo strategy: the showcase product establishes the position and the technical proof; the configured variants capture revenue at the price the market will actually pay.

## 6. MVP Value Metrics

| Metric | Minimum thesis target | Commercial interpretation |
|---|---|---|
| Latency behavior | Measure mean, p95/p99, observed max at sustained input rate; p99 ≈ worst-case bound | A predictable advisory stream matters more than peak FPS |
| Reaction time | Reduced avoidance reaction time vs frame baseline in HIL | Faster braking/avoidance at same flight envelope |
| Energy | Report W and J per accepted observation across all three platforms | Supports SWaP and endurance discussions honestly |
| Usable-data yield | Measurable reduction in rejected/missing target imagery on a held-out mission set | Directly maps to reduced analyst and re-flight cost |
| Integration effort | Document interfaces, model update path, custom I/O changes | Tests the FPGA reconfigurability argument against real engineering effort |

## 7. Risks and Controls

| Risk | Control |
|---|---|
| No pilot partner found | Require a pilot partner to quantify a baseline re-flight/analyst-time/capture-rejection cost before the hardware phase; if cost is not material, pivot the same co-processor to wind-turbine or confined-space inspection. |
| Event camera supply / interface | Early validate SPI/MIPI-to-PL path on the target SOM; keep a frame-camera fallback for the software baseline. |
| HLS/RTL bring-up slips | Mixed HLS+RTL; recorded-data replay keeps software/HIL work unblocked; bench-first gates. |
| NPU head-to-head loss | Concede TOPS/W; own latency-determinism + HDR + integration flexibility. Evaluation states where it loses. |
| Regulatory / liability | Advisory-only outputs, no actuation, indoor VLOS only in MVP. |

## 8. Decision Summary

Build the CoreLink MVP: an event-vision SoPC companion module for reactive drone control, targeted first at power-line and confined-space inspection service providers on open flight stacks. The thesis and product share one claim — **sub-millisecond, deterministic perception unlocks control that frame-based GPU/NPU pipelines cannot reach** — which is both publishable and commercially defensible without winning a raw inference benchmark.

Selected evidence to verify before pilot: AMD Kria K26 SOM product brief; commercial event-sensor datasheet (Prophesee/Samsung-class) and PL interface; PX4/MAVLink companion-computer integration docs; relevant event-vision + UAV literature for the related-work section.
