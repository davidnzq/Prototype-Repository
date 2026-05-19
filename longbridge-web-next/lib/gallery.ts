// Registry of layout variants shown under /layouts/<slug>.
// Four "in focus" variants are being iterated on; earlier explorations live in
// "archived" — still browsable for reference but not being deepened.

export interface LayoutVariant {
  slug: string;
  name: string;
  nameZh: string;
  oneLiner: string;
  who: string;
  chatRole: "equal" | "primary" | "secondary" | "only";
  focus: boolean;
}

export const LAYOUT_VARIANTS: LayoutVariant[] = [
  // ─── In focus (iterating) ────────────────────────────────────────────
  {
    slug: "chat-first",
    name: "Chat-First",
    nameZh: "对话为主 + GUI peek",
    oneLiner: "Chat 撑满,Widget 嵌入在 AI 消息里 · AI 主动召唤 GUI",
    who: "最贴合 wiki『LUI 是入口』 · 首屏最 AI-native",
    chatRole: "primary",
    focus: true,
  },
  {
    slug: "editorial",
    name: "Editorial",
    nameZh: "编辑体 Masthead + Chat drawer",
    oneLiner: "像一份投资日报:Serif 大标题 · 3 列排版 · Chat 作右侧抽屉",
    who: "阅读感最强 · 截屏传播好看 · Chat 退居辅助",
    chatRole: "secondary",
    focus: true,
  },
  {
    slug: "chat-only",
    name: "Chat-Only",
    nameZh: "纯对话流 + Session markers",
    oneLiner: "放弃 GUI 页面,Nav = 预设 prompt,左侧 Session 侧栏浏览历史对话",
    who: "最纯粹 AI-native · 信息都是 inline widget",
    chatRole: "only",
    focus: true,
  },
  {
    slug: "tri-pane",
    name: "Tri-Pane v2",
    nameZh: "GUI 工作台 + 右侧 AI 常驻",
    oneLiner: "Nav · GUI 工作台(中)· Chat 常驻(右) —— GUI 为主、AI 陪跑",
    who: "类 Linear / Cursor · 工作流导向 · 双栏同时可见",
    chatRole: "equal",
    focus: true,
  },

  // ─── Earlier exploration (archived, kept for reference) ─────────────
  {
    slug: "gui-first",
    name: "GUI-First",
    nameZh: "传统仪表盘 + 浮动 AI",
    oneLiner: "像普通券商 App,AI 作为右下角浮动气泡",
    who: "习惯富途 / 老虎的用户",
    chatRole: "secondary",
    focus: false,
  },
  {
    slug: "cockpit",
    name: "Cockpit",
    nameZh: "驾驶舱 / 仪表盘平铺",
    oneLiner: "多 Widget 平铺 + 顶部 ticker tape + 嵌入式 chat",
    who: "高信息密度 · Pro 用户",
    chatRole: "equal",
    focus: false,
  },
  {
    slug: "horizontal-split",
    name: "Horizontal Split",
    nameZh: "上下分屏(终端感)",
    oneLiner: "上 65% GUI · 下 35% Chat 终端,一屏看全",
    who: "Bloomberg / 终端感",
    chatRole: "equal",
    focus: false,
  },
  {
    slug: "command-palette",
    name: "Command Palette",
    nameZh: "命令面板召唤",
    oneLiner: "GUI 为主 + ⌘K 召唤对话弹窗",
    who: "Linear / Raycast 键盘党",
    chatRole: "secondary",
    focus: false,
  },
];

export function getVariant(slug: string): LayoutVariant | undefined {
  return LAYOUT_VARIANTS.find((v) => v.slug === slug);
}

export function neighboringVariants(slug: string): {
  prev?: LayoutVariant;
  next?: LayoutVariant;
  index: number;
} {
  const i = LAYOUT_VARIANTS.findIndex((v) => v.slug === slug);
  return {
    prev: i > 0 ? LAYOUT_VARIANTS[i - 1] : undefined,
    next: i < LAYOUT_VARIANTS.length - 1 ? LAYOUT_VARIANTS[i + 1] : undefined,
    index: i,
  };
}

export const FOCUS_VARIANTS = LAYOUT_VARIANTS.filter((v) => v.focus);
export const ARCHIVED_VARIANTS = LAYOUT_VARIANTS.filter((v) => !v.focus);
