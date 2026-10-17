export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "只支持POST" });
  }

  try {
    // ✅ 手动读取原始body，彻底避开req.body兼容坑
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBodyStr = Buffer.concat(chunks).toString("utf8");
    const { userPrompt } = JSON.parse(rawBodyStr);

    const key = process.env.DEEPSEEK_APIKEY;
    if (!key) return res.status(500).json({ error: "密钥未配置" });
    if (!userPrompt) return res.status(400).json({ error: "请输入你的需求" });

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
    console.log("DeepSeek返回原始内容：", rawText);

    if (!resp.ok) {
      return res.status(resp.status).json({ error: "DeepSeek接口报错", raw: rawText });
    }
    const data = JSON.parse(rawText);
    const answer = data.choices?.[0]?.message?.content || "无结果";
    return res.status(200).json({ result: answer });

  } catch (err) {
    console.error("服务异常：", err);
    return res.status(500).json({ error: String(err) });
  }
}
