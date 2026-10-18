export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "只支持POST" });
  }

  try {
    const chunks = [];
    let total = 0;
    const MAX_BODY = 32 * 1024;
    for await (const chunk of req) {
      total += chunk.length;
      if (total > MAX_BODY) {
        return res.status(413).json({ error: "请求内容过长" });
      }
      chunks.push(chunk);
    }

    let parsed;
    try {
      parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return res.status(400).json({ error: "请求格式不正确" });
    }

    const userPrompt = typeof parsed.userPrompt === "string" ? parsed.userPrompt.trim() : "";
    const key = process.env.DEEPSEEK_APIKEY;
    if (!key) return res.status(500).json({ error: "服务暂不可用" });
    if (!userPrompt) return res.status(400).json({ error: "请输入你的需求" });
    if (userPrompt.length > 8000) return res.status(400).json({ error: "输入过长" });

    const resp = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是提示词专家，根据用户需求，输出专业、可直接复制使用的提示词，简洁高效。"
          },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    const rawText = await resp.text();
    if (!resp.ok) {
      console.error("DeepSeek接口报错", resp.status);
      return res.status(502).json({ error: "生成失败，请稍后重试" });
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(502).json({ error: "生成失败，请稍后重试" });
    }

    const answer = data.choices?.[0]?.message?.content || "无结果";
    return res.status(200).json({ result: answer });
  } catch (err) {
    console.error("服务异常");
    return res.status(500).json({ error: "服务异常，请稍后重试" });
  }
}
