// utils/parseReply.js

export function parseReplyChunks(reply) {
  if (typeof reply !== 'string' || !reply.trim()) return [];

  try {
    const paragraphs = reply.split(/\n{2,}/g);

    const chunks = paragraphs.flatMap(para => {
      const matches = para.match(/(?:[^.!?]+[.!?]+["']?\s*){1,2}/g);
      return matches ? matches.map(m => m.trim()) : [para.trim()];
    });

    return chunks.filter(Boolean);
  } catch (error) {
    console.error("Failed to parse reply:", error);
    return [reply.trim()];
  }
}
