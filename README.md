# CoreLink

Sub-millisecond event-vision SoPC pipeline for reactive drone control, with a precision-landing extension.

## Project

Master's thesis at the intersection of computer engineering, control engineering, and drones:

- **Primary**: reactive obstacle avoidance / braking driven by an event-camera optical-flow pipeline on a Zynq UltraScale+ / Kria-class SoPC, with deterministic sub-ms sensor-to-decision latency.
- **Extension**: event-based precision landing on a pad.
- **Publishable**: systems paper targeting an FPGA/embedded-systems workshop; extended UAV journal version after field validation.
- **Marketable**: low-power companion board (event camera + FPGA + PX4/MAVLink) differentiated on HDR robustness, deterministic latency, and SWaP.

## Repository Layout

```
docs/                  Thesis proposal/spec and market/product blueprint (print-ready HTML)
src/hls/               Vitis HLS kernels (event accumulation, optical flow, occupancy map)
src/rtl/               RTL streaming fabric, AXI interfaces, timing-critical paths
src/software/          ARM/Linux companion app, PX4/MAVLink bridge, HIL harness
scripts/               Build, benchmark, and validation tooling
data/field_data/       Recorded event/frame captures for offline evaluation
data/benchmarks/       Jetson / Hailo-class NPU comparison results
```

## Documents

- `docs/thesis_proposal.html` — Thesis proposal & technical specification
- `docs/market_blueprint.html` — Market & product blueprint (MVP, competition, GTM)

## Status

Fresh start. Wiped the prior FPGA drone inspection-co-processor framing; consolidating the event-vision control thesis here.
