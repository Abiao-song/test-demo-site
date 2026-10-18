export const config = {
  runtime: "edge"
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return Response.json({ error: "仅支持 POST 请求" }, { status: 405 });
  }
  try {
    const body = await req.json();
    const apiKey = process.env.DEEPSEEK_APIKEY;
    if (!apiKey) {
      return Response.json({ error: "缺少环境变量 DEEPSEEK_APIKEY" }, { status: 500 });
    }

    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: body.messages
      })
    });

    const result = await res.json();
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
