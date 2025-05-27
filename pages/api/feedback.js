export default function handler(req, res) {
  const { rating, message, reply, comment, timestamp } = req.body;

  console.log("💬 Feedback:", {
    rating,
    message,
    reply,
    comment,
    timestamp,
  });

  res.status(200).json({ status: 'received' });
}
