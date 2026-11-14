
import "dotenv/config";
import { Client } from "@gradio/client";

async function test() {
  try {
    const app = await Client.connect(
      process.env.HF_SPACE_ID,
      {
        token: process.env.HF_SPACE_TOKEN,
      }
    );

    console.log("Connected to Hugging Face Space");

    const result = await app.predict("/chat", {
      persona:
        "A small business owner concerned about pricing",
      salesperson_message:
        "Hello! What challenges are you facing?",
      history_json: "[]",
    });

    console.log("LLAMA CUSTOMER RESPONSE:");
    console.log(result.data?.[0]);

  } catch (error) {
    console.error(
      "Hugging Face connection failed:",
      error.message
    );
  }
}

test();
