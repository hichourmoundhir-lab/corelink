# Sub-Millisecond Event-Vision SoPC Pipeline for Reactive UAV Control

**Master's Thesis Proposal — Computer Engineering (Reconfigurable Computing & Embedded Systems)**

---

## The Problem

Vision-guided drones can't react fast. Frame cameras blur in high-contrast or fast scenes, and GPU/NPU perception pipelines add 10–100 ms of latency with jitter. In feedback control, that delay shrinks the stability margin and caps performance. Perception latency is the bottleneck — a control problem, not a throughput one.

## The Proposal

Build a system-on-chip pipeline that reads an **event camera** (asynchronous, microsecond-timestamped, blur-free, HDR) and processes the stream **entirely in FPGA hardware** — sub-millisecond, deterministic sensor-to-decision latency. Then **prove this unlocks control that frame-based pipelines can't reach**.

## Novelty

Prior work treats FPGA vision as a throughput engine. This thesis flips it: **latency-determinism is the independent variable; closed-loop control outcome is the dependent variable.** Nothing in the literature quantifies this link end-to-end on a real event-vision SoPC.

## Approach

Streaming pipeline in hardware on the camera clock; only a low-rate advisory crosses into software. HLS kernels with RTL streaming interfaces. A control-barrier-function (CBF) filter guarantees braking distance from measured worst-case latency.

| Stage | Implementation | Latency budget |
|---|---|---|
| Event pre-processing | RTL streaming | < 50 µs |
| Time-surface accumulation | HLS kernel | < 100 µs |
| Optical-flow estimation | HLS streaming | < 300 µs |
| Occupancy / obstacle map | HLS kernel | < 200 µs |
| CBF filter + advisory encode | ARM + RTL assist | < 50 µs |

**Platform:** Zynq UltraScale+ / Kria SOM, Prophesee GENX320 event camera (~$400) on programmable logic.

## Control Engineering Role

Delay adds phase lag proportional to crossover frequency. Cutting perception latency from tens of ms to sub-ms raises the bandwidth a loop can sustain before its stability margin is violated. The thesis quantifies this (latency distribution → achievable bandwidth) and validates it with a reactive-braking loop under a CBF safety filter. Bounded but rigorous.

## Validation

1. **Bench** — latency distribution (mean, p95/p99, max) + power: FPGA vs Jetson GPU vs Hailo NPU, matched accuracy/input.
2. **HIL** — replay recorded event streams with PX4/SITL; sweep artificial latency to show the stability relationship.
3. **Flight** — one indoor VLOS avoidance demo, after bench and HIL gates pass.

## Outcomes

A streaming SoPC pipeline with measured bounded sub-ms latency; a publishable latency-to-stability result; a fair GPU/NPU comparison. **No custom PCB, advisory-only outputs.** Targets an FPGA/embedded-systems venue.
