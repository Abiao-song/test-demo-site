export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "只允许POST请求" });
  }

  const { userPrompt } = req.body;
  const key = process.env.DEEPSEEK_APIKEY;

  if (!key) {
    return res.status(500).json({ error: "环境变量DEEPSEEK_APIKEY没有配置" });
  }

  try {
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

    // 先拿到原始文本，不直接json解析！
    const rawText = await resp.text();
    console.log("deepseek原始返回：", rawText);

    if (!resp.ok) {
      return res.status(resp.status).json({
        error: "DeepSeek接口报错",
        raw: rawText
      });
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      return res.status(500).json({
        error: "上游返回不是JSON",
        raw: rawText
      });
    }

    const answer = data.choices?.[0]?.message?.content || "无返回结果";
    return res.status(200).json({ result: answer });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "服务异常", msg: String(err) });
  }
}
