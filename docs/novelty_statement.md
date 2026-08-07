# Novelty Statement & Research Questions (Draft — for review before freezing)

Positioning against the eight gaps in `related_work.md`, sharpened by the five read-first papers.

## What the five read-first papers establish

| Paper | Closes | Still open (our gap) |
|---|---|---|
| Survey (2407.08356) | Field map; names direct-event-processing, end-to-end robotic systems, and comparable latency evaluation as open problems | Everything below; confirms no prior system combines detection+classification in one reactive loop |
| EventShiftFlow (2605.28312) | Integer-only (0 DSP/BRAM) streaming flow estimator, 99.5% directional accuracy, 0.142 W | Offline dataset only; no live camera, no end-to-end latency, no latency distribution, no closed-loop, 1-D aperture problem, manual Δt/θe tuning |
| HOMI (2508.12637) | Full event→inference platform on IMX636 + Zynq US+, 1 ms inference (1000 fps) | No power measured, no control loop, no advisory output, no latency distribution under sustained load |
| SEE eye tracking (2404.14279) | Proves sub-ms inference (0.70 ms, 2.29 mJ) via sparse-CNN co-design | Dataset-driven only; latency is per-inference partition, not event→decision; no timestamp methodology; no control |
| AERO-VIS (2605.07885) | First closed-loop UAV control on event-only SLAM (Orin NX) | SLAM/state-estimation focus at frame-rate; no power, no latency distribution, no sub-ms reactive layer |

## Sharpened thesis position

The thesis is the **reactive layer** that all five leave open:

> A complete camera→SoPC→autopilot **advisory** reactive-avoidance pipeline on a low-cost (~$400) event sensor + Kria-class SoPC, delivering a **deterministic sub-millisecond sensor-to-decision latency**, with **measured p99≈max worst-case evidence**, a **latency-aware CBF braking filter** whose safety bound is computed from that measured latency, and a **latency→closed-loop-stability analysis** quantifying what sub-ms determinism buys over 10–100 ms alternatives.

This is deliberately positioned as complementary to AERO-VIS (state estimation layer) and EventShiftFlow (single kernel), not competing with either.

## Draft research questions

- **RQ1 (Determinism):** Can a low-cost SoPC (GENX320 + Kria K26) sustain a sub-2 ms end-to-end sensor-to-decision latency for reactive avoidance, with p99 ≈ max under sustained event load and cycle-accurate timestamps?
- **RQ2 (Control value):** How does the measured latency distribution map to achievable closed-loop bandwidth / phase margin, and what stability margin does sub-ms determinism provide over 10–100 ms (Jetson/Hailo-class) alternatives at matched accuracy?
- **RQ3 (Safety):** Can a latency-aware CBF braking filter deliver a formal braking guarantee when its worst-case latency bound is derived from measured (not assumed) pipeline timing?
- **RQ4 (Fair benchmark):** At matched accuracy, how do latency distribution, power (W and J/decision), and integration effort compare across FPGA (Kria), Jetson, and Hailo — and where does the FPGA lose?

## Working claims (each mapped to a future evidence gate)

| Claim | Evidence gate |
|---|---|
| Sub-2 ms end-to-end, p99 ≈ max | Gate B (latency methodology, step 9) |
| FPGA matches software baseline accuracy within spec | Gate B |
| Latency→stability relationship quantified | Gate C (SITL latency sweep) |
| CBF braking bound holds with measured latency | Gate C |
| Fair 3-way benchmark, losses reported honestly | Gate D |
| Reactive avoidance flight demo | Gate D (indoor VLOS, after bench+HIL) |

*Status: draft. Freeze RQ1–RQ4 after user review; edit this file only via review commits.*
