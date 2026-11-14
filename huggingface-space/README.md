title: PitchPilot Inference
emoji: 🎯
colorFrom: blue
colorTo: indigo
sdk: gradio
app_file: app.py
python_version: 3.10.13
pinned: false
PitchPilot AI — Fine-tuned Llama inference (experimental ZeroGPU)
This Space uses Meta Llama 3.1 8B Instruct with the PitchPilot QLoRA adapter for a customer simulator. It is an experimental demonstration deployment, not a production service or a validated sales-performance evaluation API.

Setup
In Space Settings → Hardware select ZeroGPU (do not select a paid dedicated GPU).
In Settings → Variables and secrets, create two Secrets: HF_TOKEN (student account, approved for the gated Meta Llama base model) and ADAPTER_TOKEN (personal account, fine-grained read access to the private PitchPilot adapter). Never store these in Variables or commit them.
Review the build and startup logs. ZeroGPU may not support some bitsandbytes/PEFT configurations; success is not guaranteed.
Test the Gradio application manually before connecting an external backend. The Space exposes a Gradio endpoint named chat after it starts.
Keep your Express/Gemini chat integration as a separately labelled fallback; this adapter does not implement reliable performance scoring.
Model provenance
Base: meta-llama/Llama-3.1-8B-Instruct (gated)
Adapter: K1-mberlyyy/PitchPilot-AI (revision pinned in app.py)
Never commit a token or private training data to the Space.