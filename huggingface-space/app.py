"""PitchPilot AI ZeroGPU proof of concept. Requires approved gated-model access.
Model loaded at module scope per ZeroGPU guidance; inference is GPU decorated.
"""
import json
import os

import gradio as gr
import spaces
import torch
from huggingface_hub import snapshot_download
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

BASE_MODEL = "meta-llama/Llama-3.1-8B-Instruct"
ADAPTER_REPO = "K1-mberlyyy/PitchPilot-AI"
ADAPTER_REVISION = "5526bce24a2abd7c644694475835357edd3417d5"
BASE_TOKEN = os.environ.get("HF_TOKEN")
ADAPTER_TOKEN = os.environ.get("ADAPTER_TOKEN")

if not BASE_TOKEN:
    raise RuntimeError("Missing HF_TOKEN Space secret (student account must have gated Llama access)")
if not ADAPTER_TOKEN:
    raise RuntimeError("Missing ADAPTER_TOKEN Space secret (personal account must have private adapter access)")

adapter_dir = snapshot_download(repo_id=ADAPTER_REPO, revision=ADAPTER_REVISION, token=ADAPTER_TOKEN)
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, token=BASE_TOKEN)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

quantization = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)
base = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    token=BASE_TOKEN,
    quantization_config=quantization,
    device_map="cuda",
    dtype=torch.float16,
    low_cpu_mem_usage=True,
)

model = PeftModel.from_pretrained(
    base,
    adapter_dir,
    is_trainable=False,
    torch_device="cpu"
)

model.eval()
model.config.use_cache = True

@spaces.GPU(duration=60)
def chat(persona, salesperson_message, history_json):
    """One customer turn; `history_json` is an optional JSON list of role/content pairs."""
    if not persona.strip() or not salesperson_message.strip():
        raise gr.Error("Provide a persona and salesperson message.")
    if len(persona) > 3000 or len(salesperson_message) > 4000:
        raise gr.Error("Input too long.")
    try:
        history = json.loads(history_json) if history_json.strip() else []
    except json.JSONDecodeError:
        raise gr.Error("History must be valid JSON.")
    if not isinstance(history, list) or len(history) > 20:
        raise gr.Error("History must be an array with no more than 20 turns.")
    messages = [{"role": "system", "content": (
        "You are a fictional customer participating in PitchPilot AI sales training. "
        "Stay in character as the customer. Do not coach or score the salesperson. "
        "Respond naturally, ask relevant questions, and raise plausible objections. "
        "Customer persona and situation: " + persona.strip()
    )}]
    for item in history:
        if not isinstance(item, dict) or item.get("role") not in ("user", "assistant"):
            raise gr.Error("History entries require role 'user' or 'assistant'.")
        content = item.get("content", "")
        if not isinstance(content, str) or not content.strip() or len(content) > 4000:
            raise gr.Error("Invalid history content.")
        messages.append({"role": item["role"], "content": content})
    messages.append({"role": "user", "content": salesperson_message.strip()})
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=3000).to(model.device)
    with torch.inference_mode():
        output = model.generate(
            **inputs,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            max_new_tokens=150,
            pad_token_id=tokenizer.eos_token_id,
        )
    completion = output[0][inputs["input_ids"].shape[-1]:]
    return tokenizer.decode(completion, skip_special_tokens=True).strip()

with gr.Blocks(title="PitchPilot AI — Customer Simulator") as demo:
    gr.Markdown("# PitchPilot AI — Fine-tuned Customer Simulator\nExperimental ZeroGPU model demo")
    persona = gr.Textbox(label="Customer persona / scenario", lines=3,
                         value="A small-business owner who is skeptical about an inventory system's price.")
    message = gr.Textbox(label="Salesperson message", lines=2,
                         value="Hello! May I learn about your current inventory challenges?")
    history = gr.Textbox(label="Conversation history (JSON, optional)", lines=2, value="[]")
    output = gr.Textbox(label="Customer response", lines=4)
    gr.Button("Generate customer reply").click(chat, inputs=[persona, message, history], outputs=output, api_name="chat")

demo.queue().launch()