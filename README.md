# test-demo-site

前端只调用 `/api/chat`，DeepSeek 密钥放在服务端环境变量 `DEEPSEEK_APIKEY`，不要写进 `index.html`。

本地或 Vercel 部署时：

1. 复制 `.env.example` 为 `.env`（本地），或在 Vercel 项目 Settings → Environment Variables 中添加 `DEEPSEEK_APIKEY`
2. 填入新的 DeepSeek API Key
3. 如果这个 Key 曾经出现在前端或 Git 历史里，先到 DeepSeek 控制台作废旧 Key，再换新 Key
