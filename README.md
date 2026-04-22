# 原型港口 / Prototype Repository

Longbridge Web 原型迭代工作区。

## 结构

- `Longbridge AI 首页/` — 原始单文件原型
  - `HANDOFF.md` — 产品交接文档(架构、场景、路线图)
  - `lb-homepage-v17.html` — 单文件原型(HTML + CSS + JS 全部内联,1260 行)
- `longbridge-web-demo/` — 拆分后的多文件版本(行为与原型一致)
  - `index.html` — 外壳
  - `css/` — base / home / detail / dynamic
  - `js/` — data / home / detail / sidebar / dynamic / main

## 本地预览

```bash
cd longbridge-web-demo
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 技术约束(来自 HANDOFF.md)

- Vanilla JS + CSS 变量,无框架
- 单页应用,5 列布局:图标导航 / 主视图 / 详情 / AI 工作台 / 聊天
- 3 个演示场景:活跃日 / 平静日 / 下跌日
- 5 个动态视图:risk / compare / tradeplan / research / attribution
