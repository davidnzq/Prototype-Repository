import { redirect } from "next/navigation";

// News 已并入 Markets · 重定向保留旧链接兼容性。
export default function NewsRedirect() {
  redirect("/markets?tab=news");
}
