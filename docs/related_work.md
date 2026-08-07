# Related Work — Event-Vision SoPC for Reactive UAV Control

Curated papers grouped by project pillar. **Read first:** the survey, EventShiftFlow, HOMI, then the sub-ms eye-tracking paper.

## 1. Survey (backbone)

| Paper | Link | Why it matters |
|---|---|---|
| Event-based vision on FPGAs — a survey (Kryjak, DSD'24) | https://arxiv.org/abs/2407.08356 | Definitive map of FPGA+event work: filtering, optical flow, AI acceleration, robotics. Start here. |

**Survey facts (from full text, arXiv:2407.08356v1):**
- Scope: **60 papers, 2012–H1 2024**, pre-prints excluded. Search via Google Scholar + Scopus ("FPGA/VLSI" + "event camera"/"DVS") + Gallego list + UZH resources + backward citation chasing.
- Categories: filtration (III-A), optical flow (III-B), stereovision (III-C), detection/recognition/tracking (III-D), AI/SNN+CNN (III-E), other apps (III-F).
- **III-F (8 papers)**: robotic arm/head control (Spike-VITE, Spartan-6); motor/rotation frequency measurement (Spartan-6, drone-propeller test); **FlyDVS** low-power wireless node (132×104, 874 event-frames/s @ 17.62 mW, 35.5 mW whole system); event-camera simulator on Virtex US+; saliency/selective attention (Kintex-7); **event-frame generation for 1280×720 on Zynq/Zynq US+ MPSoC** (binary frames, time surfaces, rolling-window).
- **Discussion trends**: (1) DVS→FPGA hookup is *not* straightforward, many use non-replicable custom solutions; (2) smart-DVS FPGAs unavailable, none used; (3) low/very-low resolution dominates, few use 1280×720 HD; (4) event *frames* still outnumber direct event processing; (5) "lack of comparable evaluation, preferably on commonly used datasets"; (6) **no prior work does AI detection + classification simultaneously**; (7) open-source HDL release is very rare.
- **Knowledge gaps the survey itself names**: sensor fusion (event+frame+radar/LiDAR, only 1 paper); modern AI on FPGA (GNNs, transformers, further SNNs); **direct event processing (spatio-temporal point cloud) rather than frames**; **end-to-end robotic systems (cars, drones)**; latest SoC FPGAs (Versal/ACAP AI resources).
- **Reporting gap (ammunition for our latency methodology)**: the survey's own convention is MEPS "or latency (if provided)" — latency is frequently absent; some papers report fps converted from per-event latency rather than true end-to-end latency (e.g. 13.7 µs→1140 fps), and only some report true latency (0.15–7.12 ms). This supports our Gap #3.

## 2. FPGA event pipelines — direct precursors

| Paper | Link | Why it matters |
|---|---|---|
| EventShiftFlow: Hardware-efficient FPGA-based Flow Estimation (ICRA'26 WS) | https://arxiv.org/abs/2605.28312 | **Closest to the thesis**: streaming velocity estimator, 1-bit occupancy grid, integer-only logic (no DSP), targets reactive obstacle avoidance on SWaP-constrained platforms. |
| HOMI: Ultra-Fast EdgeAI platform for Event Cameras | https://arxiv.org/abs/2508.12637 | **Same hardware**: IMX636 event sensor + Zynq UltraScale+ MPSoC, histogram/time-surface pre-processing, 1000 fps low-latency mode. |
| Co-designing a Sub-millisecond Latency Event-based Eye Tracking System (CVPR'24 WS) | https://arxiv.org/abs/2404.14279 | **Proves sub-ms is achievable**: 0.7 ms end-to-end, 2.29 mJ/inference via sparse-CNN co-design. Key citation for the sub-ms claim. |

### EventShiftFlow (2605.28312) — key facts
- Platform: **Xilinx Artix-7 xc7a100t**, 100 MHz, Vivado 2025.2; sensor **DAVIS240C** via UART-encoded event words.
- Algorithm: events binned into fixed-Δt bins → thresholded **1-bit occupancy grid** (shift-register bank) → per-active-pixel hypothesis scoring by popcounting 1-bit coincidences along diagonal traces → pipelined comparator tree. **No DSP, no BRAM, no FP, no dividers, no frame reconstruction.** Final velocity v=j*/Δt computed off-chip on host.
- Latency: per-pixel 21 cycles = **210 ns**; worst-case 5040 cycles = **50.4 µs**; prototype scoring **24 µs**. Power **0.142 W** on-chip. Resources LUT 13,326 (21%), FF 5,517 (4%), 0 BRAM/DSP; datapath <2 kB storage/axis.
- Accuracy: **99.5% directional accuracy** on RPG `shapes_rotation`; robust at 10–40% occupancy; correct magnitude ±1 px/Δt for 5/7 objects.
- Limits (useful to beat): 1-D aperture problem, velocity resolution = 1/Δt, manual Δt/θe tuning, degrades with multiple independently moving objects, offline-dataset-only (no live camera, no flight), no full two-axis result, no end-to-end latency.
- Positioned as a "first-stage motion detector" to trigger more expensive processing. **No explicit latency-distribution or closed-loop claim.**

### HOMI (2508.12637) — key facts
- Platform: Prophesee **IMX636 1280×720 EVT3.0** via MIPI CSI-2 → Zynq UltraScale+ MPSoC PL, 10×5 cm board; 3 clock domains; pre-processing + inference all in PL, PS for config/DMA/USB.
- Pre-processing: EVT3.0 decode, binary/histogram/**SLTS/SETS shift-based time surfaces** (shift-ALU instead of LUT-memory decay), on-the-fly 1280×720→128×128 downsampling, ping-pong BRAMs.
- Results: **HOMI-Net16 = 1 ms → 1000 fps**; HOMI-Net70 = 3.593 ms → 278 fps; 94.0% DVS Gesture; LUT ~31–33%, BRAM ~29–31%, DSP 14 (0.71%).
- Targets: collision avoidance, high-speed drone tracking, HRI. Future: LSTM/temporal models, sub-ms via parallel instances, post-processing blocks. No power measured; no closed-loop control.

### Sub-ms eye tracking "SEE" (2404.14279) — key facts
- Platform: **ZCU102 (Zynq UltraScale+ MPSoC)**, Vitis HLS 2020.2; sparse-CNN (SCNN, ESDA-style dynamic sparse dataflow, Int8) on PL + GRU/FC (float32, NEON) on A53 CPU, via PYNQ.
- Results: end-to-end **0.70 ms** (SCNN 0.59 + GRU/FC 0.11 ms); series 0.60–0.94 ms; **2.29 mJ/inference @ 3.86 W**; AIS2024 p5 81.37%, p10 99.53%, MED 3.71 px; 11.5–13.9× vs Jetson Xavier NX (dense), up to 72.6× vs MinkowskiEngine GPU.
- Caveats that keep our contribution open: **dataset-driven, no live sensor-to-output timestamp methodology** (latency is per-inference partition, not end-to-end event→decision); no inter-batch pipelining; GRU not on FPGA. Sub-ms proven on inference, not on the full reactive loop.
| Self-Supervised Event Representations on SoC FPGAs (SPIE'25) | https://arxiv.org/abs/2505.07556 | Sub-microsecond latency, 1–2 W on SoC FPGA; supports power+latency claims. |
| ESDA: Composable Dynamic Sparse Dataflow Architecture (FPGA'24) | https://arxiv.org/abs/2401.05626 | Modular FPGA accelerator framework for event DNNs; architecture reference. |
| EFGCN: Event-based FPGA-accelerated Graph Convolutional Network (JSA) | https://arxiv.org/abs/2406.07318 | 13.3 M events/s, no off-chip memory; throughput reference. |
| Optimising Graph Representation for GCNs for Event-based Vision (DASIP'24) | https://arxiv.org/abs/2401.04988 | Hardware graph-generation module from event streams. |
| Increasing the scalability of graph convolution for FPGA-implemented event-based vision (FPT'24) | https://arxiv.org/abs/2411.04269 | Resource-scalability techniques for event GCNNs on FPGA. |
| Hardware-aware GNN pruning for embedded event-based vision (SPA'25) | https://arxiv.org/abs/2607.06739 | Resource/latency trade-offs via pruning + quantization. |
| Eventor: An Efficient Event-Based Monocular Multi-View Stereo Accelerator on FPGA | https://arxiv.org/abs/2203.15439 | Sparse-event dataflow reference. |
| Within-Camera Multilayer Perceptron DVS Denoising (CVPRW'23) | https://arxiv.org/abs/2304.07543 | Event denoising / pre-processing stage (FPGA + ASIC, 4 nJ/event). |
| An Event-driven Saliency-based Selective Attention Model on FPGA | https://arxiv.org/abs/2211.14060 | Event attention architecture reference. |

## 3. UAV + event control

| Paper | Link | Why it matters |
|---|---|---|
| AERO-VIS: Asynchronous Event-based Real-time Onboard Visual-Inertial SLAM (2026) | https://arxiv.org/abs/2605.07885 | First closed-loop UAV control using event-only onboard SLAM; precedent for event-vision control. Note: SLAM-based, not sub-ms, not reactive avoidance — differentiate against it. |

**AERO-VIS (2605.07885) — key facts:**
- Platform: **NVIDIA Jetson Orin NX**; two Prophesee EVK4 (stereo, 7.4 cm baseline); IMU Bosch BMI160; custom UAV flown **closed-loop via linear MPC** using event-only state estimates.
- Approach: asynchronous rework of OKVIS2; event keypoint detector **SuperLitE** (inference **2.5 ms**, ~90% faster than SuperEvent); MCTS constant-event-count time surfaces; descriptor quantization to 8-bit.
- Results: closed-loop UAV RMS ATE 10.83 cm vs 2.14 cm (frame-based, normal light); in HDR/backlit condition **25.53 cm vs FAILED** (frame system crashed into wall); aggressive shake 7.78 cm vs 78.08 cm (**90% error reduction**); 2 km urban loop at 1–2% drift.
- **Differentiation for the thesis**: AERO-VIS targets *accurate state estimation* (SLAM, loop closure) on GPU-class compute, runs at effectively frame-rate control (backend drops below 5 Hz), and reports no power figures, no latency distribution, and no reactive/reflex avoidance. Our claim (sub-ms reactive advisory loop on SoPC with p99≈max) is orthogonal and complementary — can be cited as the missing reactive layer.
| Event-driven Vision and Control for UAVs on a Neuromorphic Chip (ICRA'21) | https://arxiv.org/abs/2108.03694 | Event-SNN controlling a drone on-chip; the latency-into-control-loop argument on neuromorphic hardware (main competing paradigm). |
| ColibriUAV: Ultra-Fast, Energy-Efficient Neuromorphic Edge Processing UAV-Platform (2023) | https://arxiv.org/abs/2305.18371 | RISC-V SoC UAV platform with DVS interface; ms-range latency, <50 mW; benchmarks SWaP claims. |
| ColibriES: Milliwatts RISC-V Embedded System for Low-Latency Closed-loop Control (2023) | https://arxiv.org/abs/2302.07957 | Event-SNN platform for closed-loop control; energy/latency reference. |
| Leveraging Event Streams with Deep RL for End-to-End UAV Tracking | https://arxiv.org/abs/2410.14685 | Event-to-control DRL for UAV tracking; control-loop reference. |

## 4. Precision-landing extension

| Paper | Link | Why it matters |
|---|---|---|
| Event-Based Adaptive Koopman Framework for Optic Flow-Guided Landing on Moving Platforms | https://arxiv.org/abs/2501.16868 | Directly the landing extension: optic-flow-guided landing, event-triggered control, convergence analysis. |

## Gap analysis (what is still missing — the thesis contribution)

1. **Latency→stability quantification** — no prior work maps measured latency *distribution* to achievable closed-loop bandwidth / phase margin.
2. **Full advisory loop** — no camera→FPGA→MAVLink/PX4 advisory system end-to-end.
3. **Worst-case latency evidence** — most report average latency; almost none publish p99≈max under sustained load with cycle-accurate timestamps. **The survey itself confirms this**: its own convention is MEPS "or latency (if provided)", and several papers convert per-event latency into fps instead of measuring end-to-end latency.
4. **Latency-aware CBF** — CBF exists in robotics; event-vision UAV work does not bind braking guarantees to a measured worst-case latency.
5. **Fair 3-way comparison** — FPGA vs Jetson vs Hailo at matched accuracy; jitter + power head-to-head.
6. **Real reactive flight** — closed-loop avoidance flight on a real aircraft with event-only perception. (AERO-VIS proves closed-loop *SLAM-based* control on GPU-class hardware — not sub-ms reactive avoidance.)
7. **Low-cost sensor ($400 GENX320)** — prior work uses expensive dev kits (EVK4, IMX636 boards) or DAVIS240C; cost-down + reproducibility untapped.
8. **Systems-paper framing** — work is siloed into perception or control; the unifying latency-to-outcome claim is open.

## Corroboration from the survey's own discussion

The survey independently names three of our gap areas as open problems: **direct event processing** (we process events directly in a streaming pipeline), **end-to-end robotic systems (drones)** (full advisory loop), and notes the **lack of comparable latency evaluation** (our p99≈max methodology). It also confirms no prior work combines detection and classification on FPGA in one system — leaving the reactive-loop system design open.

**Read-first order:** survey (2407.08356) → EventShiftFlow (2605.28312) → HOMI (2508.12637) → eye-tracking (2404.14279) → AERO-VIS (2605.07885). All five are now distilled above.
