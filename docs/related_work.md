# Related Work — Event-Vision SoPC for Reactive UAV Control

Curated papers grouped by project pillar. **Read first:** the survey, EventShiftFlow, HOMI, then the sub-ms eye-tracking paper.

## 1. Survey (backbone)

| Paper | Link | Why it matters |
|---|---|---|
| Event-based vision on FPGAs — a survey (Kryjak, DSD'24) | https://arxiv.org/abs/2407.08356 | Definitive map of FPGA+event work: filtering, optical flow, AI acceleration, robotics. Start here. |

## 2. FPGA event pipelines — direct precursors

| Paper | Link | Why it matters |
|---|---|---|
| EventShiftFlow: Hardware-efficient FPGA-based Flow Estimation (ICRA'26 WS) | https://arxiv.org/abs/2605.28312 | **Closest to the thesis**: streaming velocity estimator, 1-bit occupancy grid, integer-only logic (no DSP), targets reactive obstacle avoidance on SWaP-constrained platforms. |
| HOMI: Ultra-Fast EdgeAI platform for Event Cameras | https://arxiv.org/abs/2508.12637 | **Same hardware**: IMX636 event sensor + Zynq UltraScale+ MPSoC, histogram/time-surface pre-processing, 1000 fps low-latency mode. |
| Co-designing a Sub-millisecond Latency Event-based Eye Tracking System (CVPR'24 WS) | https://arxiv.org/abs/2404.14279 | **Proves sub-ms is achievable**: 0.7 ms end-to-end, 2.29 mJ/inference via sparse-CNN co-design. Key citation for the sub-ms claim. |
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
3. **Worst-case latency evidence** — most report average latency; almost none publish p99≈max under sustained load with cycle-accurate timestamps.
4. **Latency-aware CBF** — CBF exists in robotics; event-vision UAV work does not bind braking guarantees to a measured worst-case latency.
5. **Fair 3-way comparison** — FPGA vs Jetson vs Hailo at matched accuracy; jitter + power head-to-head.
6. **Real reactive flight** — closed-loop avoidance flight on a real aircraft with event-only perception.
7. **Low-cost sensor ($400 GENX320)** — prior work uses expensive dev kits; cost-down + reproducibility untapped.
8. **Systems-paper framing** — work is siloed into perception or control; the unifying latency-to-outcome claim is open.

**Read-first order:** survey (2407.08356) → EventShiftFlow (2605.28312) → HOMI (2508.12637) → eye-tracking (2404.14279) → AERO-VIS (2605.07885).
