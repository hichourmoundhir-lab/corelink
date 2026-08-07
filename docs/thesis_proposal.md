# Sub-millisecond Event-Vision SoPC Pipeline for Reactive Drone Control

**Thesis Proposal & Technical Specification — with Precision-Landing Extension**

**CoreLink** project
Master of Science, Computer Engineering
Draft v0.1 — 7 August 2026

## Abstract

Frame-based vision pipelines on GPU/NPU platforms introduce 30–100 ms of end-to-end latency with significant jitter, limiting the closed-loop stability of vision-guided drones. We propose a system-on-programmable-chip (SoPC) pipeline that processes event-camera streams in streaming hardware, delivering deterministic sub-millisecond sensor-to-decision latency. The thesis establishes a quantitative relationship between perception latency and closed-loop control stability, then demonstrates the benefit on reactive obstacle avoidance (primary contribution) and event-based precision landing (secondary). The pipeline is validated on recorded field data, hardware-in-the-loop simulation, and a controlled indoor flight, and compared fairly against Jetson and Hailo-class NPU baselines on matched model accuracy and input rate.

**Keywords:** event camera, FPGA, SoPC, optical flow, reactive control, drones, latency-bounded control, Vitis HLS, PX4

## 1. Motivation

Vision-guided micro aerial vehicles must sense, decide, and react within tight timing budgets. Two constraints dominate. First, frame-based cameras impose an integration window and fixed frame rate; motion blur and rolling-shutter artifacts corrupt the very information a reactive controller needs. Second, the general-purpose accelerator stacks used for perception (GPU, NPU) insert buffering, batching, and driver-queue latency that is both large and variable, reported at 30–100 ms. In feedback control, latency and jitter directly shrink the stability margin, capping achievable gain and disturbance rejection.

Event cameras offer a fundamentally different sensing model: asynchronous per-pixel brightness-change events with microsecond timestamps, high dynamic range, and no motion blur. Their natural data structure is a stream, not a frame — a match for streaming hardware. An FPGA can process that stream with bounded, composable pipeline latency that is largely independent of load, whereas GPU/NPU latency scales with batch and queue occupancy.

We therefore center the thesis on the question of whether a co-designed SoPC event-vision pipeline can improve closed-loop control outcomes through latency reduction and determinism, not merely through peak throughput.

## 2. Research Questions

1. **Latency bounds**: What end-to-end latency distribution and worst-case bound can a streaming SoPC event-vision pipeline achieve from camera ingress to advisory output, under sustained load?
2. **Control benefit**: How does perception latency and its variance affect closed-loop stability and disturbance rejection in reactive avoidance, and what gain/response improvements are unlocked at sub-ms latency?
3. **Fair comparison**: How does the SoPC pipeline compare against Jetson and Hailo-class NPU baselines on matched model accuracy and input rate — in latency, power, and integration effort?
4. **Operational yield**: Does the system measurably improve reactive avoidance outcomes and usable landing precision on recorded and simulated mission sets?

## 3. Proposed Contribution

| Contribution | Evidence required |
|---|---|
| Co-designed streaming pipeline | Event-camera ingest, event accumulation, optical-flow, and occupancy/obstacle-map kernels mapped as a streaming FPGA pipeline on a Zynq UltraScale+/Kria platform, mixed HLS + RTL. |
| Latency-to-stability result | Measured latency distribution and worst-case bound under sustained load; an analytic and experimental demonstration of the stability-margin relationship in reactive control. |
| Reactive avoidance control loop | Closed-loop avoidance/braking driven by FPGA optical flow, with a simple control-barrier-function (CBF) safety filter guaranteeing a minimum braking distance. |
| Precision-landing extension | Event-based landing-pad detection and servoing as a secondary, clearly-scoped extension demonstrating the same latency advantage. |
| Fair accelerator comparison | FPGA vs Jetson vs Hailo-class NPU on matched accuracy and input rate; report latency variance, power (W and J per decision), and integration limits, including where the FPGA loses. |
| Reproducible validation | Recorded field/indoor event data, hardware-in-the-loop PX4/SITL experiments, and one controlled VLOS indoor flight demonstration. |

## 4. Technical Architecture (v1)

### 4.1 Hardware platform

Production-oriented Zynq UltraScale+ / Kria-class system-on-module (SOM) for the development path, with an event-camera sensor attached to the PL (programmable logic) fabric. The ARM/Linux companion application handles mission-level aggregation and the PX4/MAVLink interface. A custom PCB is deferred until the pilot/bench validation is complete.

### 4.2 Data path

*Event camera → FPGA event pre-processing → event accumulation → optical flow → occupancy / obstacle map → CBF safety filter → ARM aggregation → MAVLink/ROS 2 advisory*

Streaming path is implemented in hardware and runs on the camera clock. Only the aggregated, low-rate advisory stream crosses into software, keeping raw event traffic off the timing-critical path. All stages carry cycle-accurate timestamps to support worst-case-latency accounting.

### 4.3 System-on-chip decomposition

| Stage | Implementation | Latency budget (target) |
|---|---|---|
| Event pre-processing (noise, hot-pixel filter, timestamp sync) | RTL streaming | < 50 µs |
| Event accumulation / time-surface generation | HLS kernel | < 100 µs |
| Optical flow estimation | HLS kernel, streaming | < 300 µs |
| Occupancy / obstacle map update | HLS kernel | < 200 µs |
| CBF safety filter + advisory encode | ARM + RTL assist | < 50 µs |

### 4.4 Safety boundary

Advisory messages are rate-limited and logged. In the MVP the autopilot or human operator decides whether to alter speed, position, or capture sequence; the system never directly commands flight controls. This keeps regulatory and liability burden out of the thesis scope.

### 4.5 Required hardware

| Item | Specification / part | Purpose |
|---|---|---|
| SoPC platform | AMD Kria K26 SOM (Zynq UltraScale+ class) + carrier board | Streaming FPGA fabric, ARM/Linux companion application, development path |
| Event camera | Prophesee GENX320 module (OpenMV), 320×320, >140 dB HDR, sub-ms event latency (~$400) | Primary sensing; PL interface for streaming ingest |
| Frame-camera fallback | Low-cost global-shutter camera (e.g., OV9281/IMX219-class) | Software baseline and comparison path |
| Baseline accelerator (GPU) | NVIDIA Jetson-class (Orin Nano) + carrier | Fair latency/power/accuracy comparison |
| Baseline accelerator (NPU) | Hailo-8/8L M.2 + host (RPi 5) | Fair NPU comparison |
| Flight stack | PX4-compatible drone airframe with MAVLink companion-interface support | HIL/SITL and indoor VLOS flight validation |
| Ground equipment | Power measurement (in-line power monitor), oscilloscope/logic analyzer for timing capture, USB-UART | Latency/power evidence |
| Development tooling | Vitis HLS / Vitis (AMD), Vivado; VS Code / SDK; recorded-data replay harness | HLS+RTL build and validation |

Note: development uses the production-oriented Kria-class SOM; a custom PCB is explicitly deferred until pilot/bench validation completes.

## 5. Control Engineering Core

### 5.1 Latency-to-stability relationship

A time delay *T*_d in the feedback loop reduces phase margin. For a loop gain *G*(*j*ω), the added phase lag is approximately

Δφ = ω_c · T_d

where ω_c is the crossover frequency. Reducing end-to-end perception latency from tens of milliseconds to sub-millisecond values raises the crossover frequency the loop can sustain before the phase-margin floor is violated, enabling higher closed-loop bandwidth and better disturbance rejection. Jitter contributes an effective additional delay term; we quantify both mean and p95/p99 latency and translate the distribution into achievable bandwidth.

### 5.2 Reactive avoidance with CBF safety filter

A control-barrier-function filter modulates commanded velocity to guarantee a minimum braking distance given measured obstacle proximity and a worst-case latency bound:

h(x) = d_obstacle − (v²/(2·a_max) + v·T_wc) ≥ 0

where T_wc is the worst-case end-to-end latency. The FPGA pipeline's bounded latency makes T_wc small and tight, allowing closer approach before braking is triggered — a directly measurable operational benefit.

### 5.3 Precision-landing extension

Event-based landing-pad detection (known fiducial/pattern) with visual servoing closes the loop at event rate rather than frame rate, targeting landing-pad acquisition and steady descent onto a marked pad. This is a clearly-scoped secondary contribution.

## 6. Evaluation Plan

### 6.1 Bench validation

- Measure end-to-end latency distribution (mean, p95, p99, observed max) at sustained event rates on FPGA, Jetson, and Hailo-class NPU on matched accuracy/input rate.
- Measure power (W) and energy per decision (J per advisory) across platforms.
- Document integration effort: interface definitions, model update path, custom I/O changes.

### 6.2 Hardware-in-the-loop

Replay recorded event streams into the pipeline with PX4/SITL; sweep a controlled artificial latency offset to demonstrate the stability/response relationship; measure avoidance reaction time and CBF margin preservation.

### 6.3 Flight demonstration

One controlled indoor VLOS flight demonstrating reactive avoidance against a moving/static obstacle and, if the cage permits, pad landing. Field validation only after bench and HIL gates pass.

## 7. Publication Targets

A defensible paper is not "FPGA is faster than a GPU." It is a systems paper about deterministic, adaptive, latency-bounded perception for reactive drone control, with an application-level outcome. First venue: an FPGA/embedded-systems conference or workshop (e.g., FPT/FPL-class, or an embedded vision workshop). Extended version: an embedded or UAV journal after field validation.

## 8. Key Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Dataset access | Secure event-camera recordings (indoor and field) and labelling before hardware work; reuse public event datasets for pipeline bring-up. |
| Event-camera availability | Validate with a low-cost commercial event sensor (e.g., Prophesee/DVS-class); ensure SPI/MIPI-to-PL interface feasibility on the target SOM early. |
| Flight space limited | Bench + HIL is the evidence backbone; flight is one headline indoor VLOS demo, not the full validation. |
| Hardware bring-up slips | Mixed HLS+RTL to keep critical streaming stages early; recorded-data replay keeps software/HIL work unblocked. |
| NPU head-to-head loss | The claim is latency-determinism + integration flexibility + SWaP, not TOPS/W victory; evaluation must state where it loses. |
| Safety/regulation | Advisory-only outputs, no direct actuation, bench-first validation, indoor VLOS only. |

## 9. Timeline

Draft 32-week plan (subject to confirmation with supervisor; detailed roadmap to follow in a dedicated document):

| Phase | Weeks | Deliverable & gate |
|---|---|---|
| 0. Discovery & data | 1–4 | Event datasets secured, pipeline spec frozen, target platform confirmed. Gate: recorded event streams + labelled obstacles. |
| 1. Software baseline | 5–8 | Jetson/Python reference pipeline for optical flow + avoidance. Gate: accuracy and latency baseline established. |
| 2. FPGA core | 9–18 | Streaming ingest, optical flow, occupancy on the SOM. Gate: real-time operation, bounded-latency evidence. |
| 3. Integration MVP | 19–24 | MAVLink/ROS 2 advisory, CBF filter, event log. Gate: replay and SITL end-to-end. |
| 4. Comparison & extension | 25–28 | Jetson/NPU comparison, precision-landing extension. Gate: fair comparison report. |
| 5. Flight & write-up | 29–32 | Indoor VLOS demo, thesis write-up. Gate: defense-ready draft. |
