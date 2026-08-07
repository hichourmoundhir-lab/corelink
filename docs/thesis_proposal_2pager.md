# Sub-Millisecond Event-Vision SoPC Pipeline for Reactive UAV Control

*A Master's Thesis Proposal in Computer Engineering — Reconfigurable Computing & Embedded Systems*

---

## Abstract

Frame-based vision on GPU/NPU platforms delivers perception in tens of milliseconds with high variance — a bottleneck for drones that must sense and react quickly. This thesis proposes a system-on-chip (SoPC) pipeline that processes event-camera streams in streaming hardware, reaching sub-millisecond, deterministic sensor-to-decision latency. The work shows, analytically and experimentally, how this latency reduction raises the closed-loop bandwidth a drone can sustain, and evaluates the design against GPU and NPU baselines on latency, power, and integration effort.

## Motivation

Two constraints limit vision-guided drones. Frame cameras impose exposure windows and rolling-shutter artifacts, corrupting exactly the data a reactive controller needs in high-contrast or fast scenes. GPU/NPU pipelines add 10–100 ms of buffering, batching, and queue latency. In feedback control, that delay and jitter shrink the stability margin and cap achievable gain. Perception latency is therefore a control problem, not just a throughput one. Event cameras — asynchronous, microsecond-timestamped, blur-free, high-dynamic-range — produce a stream that maps naturally onto streaming FPGA hardware with bounded, load-independent latency.

## Research Questions

1. What latency distribution and worst-case bound can a streaming SoPC event-vision pipeline achieve under sustained load?
2. How does perception latency and its variance affect closed-loop stability and disturbance rejection?
3. How does the pipeline compare with GPU and NPU baselines at matched accuracy and input rate?

## Novelty

Prior work treats FPGA vision as a throughput engine or compares fixed-CNN inference across hardware. This thesis instead treats **latency-determinism as the independent variable and closed-loop control outcome as the dependent variable**. Novelty: (i) a full streaming event-to-advisory pipeline co-designed in HLS and RTL on a production SoPC; (ii) a quantitative latency-to-stability result linking measured latency to achievable control bandwidth; (iii) an honest comparison that reports where the FPGA loses as well as where determinism wins. The claim is not "FPGA is faster" — it is that deterministic perception enables control frame-based pipelines cannot reach.

## Technical Approach

Streaming path runs entirely in hardware on the camera clock; only a low-rate advisory crosses into software. Critical stages are Vitis HLS kernels with RTL interfaces — timing-critical path in hardware, development velocity in HLS. A control-barrier-function (CBF) filter bounds braking distance from measured worst-case latency. All stages carry cycle-accurate timestamps.

| Stage | Implementation | Latency budget |
|---|---|---|
| Event pre-processing | RTL streaming | < 50 µs |
| Time-surface accumulation | HLS kernel | < 100 µs |
| Optical-flow estimation | HLS streaming | < 300 µs |
| Occupancy / obstacle map | HLS kernel | < 200 µs |
| CBF filter + advisory encode | ARM + RTL assist | < 50 µs |

Platform: Zynq UltraScale+ / Kria-class SOM, Prophesee GENX320 event camera (~$400) attached to programmable logic.

## Control Engineering Dimension

Control engineering is a first-class partner discipline. Delay in the loop adds phase lag proportional to crossover frequency; cutting perception latency from tens of milliseconds to sub-millisecond raises the bandwidth a loop can sustain before its stability margin is violated. The thesis quantifies this: measures the latency distribution, translates it into achievable bandwidth and disturbance rejection, and validates it experimentally with a reactive-braking loop guarded by a CBF safety filter — a bounded but rigorous systems formulation.

## Validation

- **Bench**: latency distribution (mean, p95/p99, max) and power on FPGA vs Jetson-class GPU vs Hailo-class NPU.
- **Hardware-in-the-loop**: replay recorded event streams with PX4/SITL; sweep artificial latency to show the stability relationship.
- **Flight**: one controlled indoor VLOS avoidance demonstration, after bench and HIL gates pass.

## Scope and Outcomes

Advisory-only outputs; no direct flight control. A secondary, clearly-scoped extension demonstrates event-based precision landing. No custom PCB — production SOM only. Outcomes: a streaming SoPC pipeline with measured bounded sub-millisecond latency; a publishable latency-to-stability result; a fair GPU/NPU comparison. Targets an FPGA/embedded-systems venue.
