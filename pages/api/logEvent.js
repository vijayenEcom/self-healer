 export default async function handler(req, res) {
  const { event, details } = req.body;

  console.log(`[Analytics] Event: ${event}`, details);

  // Later you can send this to a DB or service like PostHog
  res.status(200).json({ success: true });
}
