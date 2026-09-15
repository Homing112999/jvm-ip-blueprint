# JVM IP 拍攝藍圖

客戶揀行業、答 7 條問題，AI 即時生成一份「JVM 幫你打造品牌 IP」嘅短片方案：

- IP 人設名、口號、定位同目標客痛點
- 內容支柱同比例
- JVM 製作安排（JVM 負責乜、客戶只需要做乜、每月拍攝日）
- JVM 編劇示範分鏡腳本
- 引流留客 6 步路徑同 lead magnet
- 第一個月發佈排程同 KPI
- 同 JVM 合作嘅流程，同預約諮詢按鈕

AI 用 Claude（`claude-opus-5`），喺伺服器端呼叫，API Key 唔會俾瀏覽器睇到。
如果 AI 未設定或者暫時用唔到，網站會自動用內置行業範本出方案，唔會卡住。

## 檔案

| 檔案 | 用途 |
|---|---|
| `index.html` | 整個前端（頁面、問題、行業範本） |
| `api/generate.js` | Vercel 伺服器函數，呼叫 Claude API |
| `vercel.json` | 函數最長執行時間設定 |
| `dev-server.js` | 本機測試用 |

## 部署上 Vercel（一次過設定）

1. 去 [console.anthropic.com](https://console.anthropic.com) 開一個 API Key，並喺 **Billing → Limits** 設定每月使用上限（網站係公開嘅，建議設上限）。
2. 去 [vercel.com](https://vercel.com) 用 GitHub 登入，撳 **Add New → Project**，揀呢個 repo，直接 **Deploy**（唔使改任何 build 設定）。
3. 入 Project → **Settings → Environment Variables**，加：
   - `ANTHROPIC_API_KEY` = 你嘅 API Key
4. 去 **Deployments**，喺最新嗰個撳 **Redeploy**，等環境變數生效。

之後每次 push 上 GitHub，Vercel 都會自動更新網站。

## 改公司資料

打開 `index.html`，搵 `const JVM = {`：

```js
const JVM = {
  name: "JVM",
  whatsapp: "85291234567",   // 填咗先會顯示「WhatsApp 預約諮詢」掣
  email: "hello@jvm.hk",     // 填咗先會顯示「電郵 JVM」掣
  process: [ ... ]           // 合作流程 6 步，可以自己改字
};
```

## 本機測試

```bash
npm install
```

```bash
ANTHROPIC_API_KEY=你的key npm run dev
```

然後開 http://localhost:3000 。唔設定 API Key 都開到，會用範本模式。
