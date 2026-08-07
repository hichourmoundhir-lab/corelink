# Thesis Roadmap — Sub-Millisecond Event-Vision SoPC Pipeline for Reactive UAV Control

Ordered phases with evidence gates. A gate is passed only when its evidence exists, not when a calendar date is reached.

## Phase A — Foundation (weeks 1–4)

1. **Literature review** — read survey (arXiv:2407.08356) then EventShiftFlow then HOMI then the sub-ms eye-tracking paper; keep the gap analysis current in `docs/related_work.md`.
2. **Sharpen novelty statement** — position the thesis against the eight gaps in prior work (latency→stability, full advisory loop, worst-case latency evidence, latency-aware CBF, fair 3-way benchmark, real reactive flight, low-cost $400 sensor, systems-paper framing). Freeze the research questions.
3. **System specification** — functional spec, per-stage latency budgets (thesis §4.3), acceptance criteria for determinism (what p99 ≈ max means and how it is measured).
4. **Hardware & toolchain bring-up** — acquire GENX320 + Kria K26; install Vitis/Vivado; verify camera→PL interface early. **Biggest schedule risk — de-risk first.**
5. **Data plan** — record event streams (indoor + field), define labelling scheme for obstacles and landing pads; secure datasets.

**Gate A:** recorded labelled event streams + camera→PL interface verified + spec frozen.

## Phase B — Baseline & Core Build (weeks 5–14)

6. **Software baseline** — Python reference pipeline on Jetson: event accumulation + optical flow + avoidance logic; establishes accuracy, latency, and power baseline.
7. **FPGA pipeline v1 (HLS)** — pre-processing → time-surface → optical flow → occupancy kernels; validate in co-simulation against the software baseline.
8. **RTL streaming integration** — connect kernels as a streaming fabric on the camera clock; bring up on the real sensor.
9. **Latency methodology** — cycle-accurate timestamping, sustained-load p95/p99/max measurement.

**Gate B:** measured p99 ≈ worst-case bound evidence; FPGA accuracy matches baseline within spec.

## Phase C — Control & Integration (weeks 15–20)

10. **Control loop + CBF** — latency-aware CBF braking filter; advisory encode.
11. **MAVLink/PX4 integration** — companion interface, rate-limited advisory messages, event log.
12. **HIL validation** — replay recorded streams with PX4/SITL; sweep artificial latency to demonstrate the latency→stability relationship.

**Gate C:** end-to-end replay and SITL demonstration; stability relationship quantified.

## Phase D — Validation & Extension (weeks 21–28)

13. **Fair benchmark** — FPGA vs Jetson vs Hailo at matched accuracy/input: latency distribution, power (W, J/decision), integration effort; report where the FPGA loses.
14. **Precision-landing extension** — event-based pad detection + servoing (secondary).
15. **Indoor VLOS flight demo** — reactive avoidance; only after all bench and HIL gates pass.

**Gate D:** fair comparison report + flight demo with measured outcome.

## Phase E — Communicate (weeks 29–32)

16. **Write thesis** — every claim mapped to measured evidence.
17. **Paper** — FPGA/embedded-systems venue; extend to UAV journal after field data.
18. **Defense** — demo + results.

**Gate E:** defense-ready draft.

## Critical-path rules

- Hardware bring-up (step 4) and latency methodology (step 9) are the two critical-path items — start step 4 early, and do not build the control loop until step 9 shows determinism.
- Every gate is an evidence gate: p99≈max measured, baseline-vs-FPGA match, SITL demo, flight only after bench.
- Do not start any product variant (SKUs A/C) or custom PCB — the thesis is the flagship only.
