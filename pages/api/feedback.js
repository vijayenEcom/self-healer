// pages/api/feedback.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "Method Not Allowed" });
  }

  const { rating, message, reply, comment, timestamp } = req.body;

  const webhookURL = "https://script.google.com/macros/s/AKfycbxjIryXxDp-xpqnsn2MiTUpRq-4QzXR9DsMZ7d4_ebxmDloGLAdIHTx8W8riyuCeZnRVg/exec";

  try {
    const response = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, message, reply, comment, timestamp }),
    });

    const result = await response.text(); // GAS often returns plain text

    res.status(200).json({ status: "logged to Google Sheets", result });
  } catch (error) {
    console.error("Google Sheets Logging Error:", error);
    res.status(500).json({ status: "failed", error: error.message });
  }
}
