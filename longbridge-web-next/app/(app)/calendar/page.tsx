import { redirect } from "next/navigation";

// Calendar 已并入 Markets · 重定向保留旧链接兼容性。
export default function CalendarRedirect() {
  redirect("/markets?tab=calendar");
}
