"use strict";
module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).json({ error: "Method not allowed." }); }
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  return res.status(200).json({ available: Boolean(process.env.GEMINI_API_KEY), model: /^gemini-[A-Za-z0-9.-]{1,80}$/.test(model) ? model : "gemini-3.8-flash" });
};
