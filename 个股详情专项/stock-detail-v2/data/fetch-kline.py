"""
Longbridge OpenAPI · 拉取 K 线数据 → JSON 文件

凭证从环境变量读取(不写在脚本里、不进 git):
  export LONGPORT_APP_KEY="..."
  export LONGPORT_APP_SECRET="..."
  export LONGPORT_ACCESS_TOKEN="..."

跑:
  pip install longport
  python data/fetch-kline.py

输出:
  data/aapl-day-1y.json      (日 K × 252)
  data/aapl-day-5y.json      (日 K × 1260, 用于 5Y tab)
  data/aapl-week-5y.json     (周 K × 260, 用于 5Y tab 重采样备选)
  data/aapl-min5-5d.json     (5分钟 K × 5天, 用于 5D tab)
"""
from longport.openapi import Config, QuoteContext, Period, AdjustType
import json, os, sys
from datetime import datetime
from decimal import Decimal


def to_dict(c):
    """把 Candlestick 对象转成可序列化的字典"""
    return {
        "time": c.timestamp.isoformat(),
        "open":   float(c.open),
        "high":   float(c.high),
        "low":    float(c.low),
        "close":  float(c.close),
        "volume": int(c.volume),
        "turnover": float(c.turnover),
    }


def fetch_save(ctx, symbol, period, count, name):
    print(f"→ 拉取 {symbol} {name} × {count}")
    candles = ctx.candlesticks(symbol, period, count, AdjustType.ForwardAdjust)
    data = [to_dict(c) for c in candles]
    out = os.path.join(os.path.dirname(__file__), f"aapl-{name}.json")
    with open(out, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  ✓ {len(data)} 根 → {out}")


def main():
    # 检查环境变量
    missing = [k for k in ["LONGPORT_APP_KEY", "LONGPORT_APP_SECRET", "LONGPORT_ACCESS_TOKEN"] if not os.environ.get(k)]
    if missing:
        print(f"✗ 缺少环境变量: {missing}")
        print("  请先 export 后再运行")
        sys.exit(1)

    config = Config(
        app_key=os.environ["LONGPORT_APP_KEY"],
        app_secret=os.environ["LONGPORT_APP_SECRET"],
        access_token=os.environ["LONGPORT_ACCESS_TOKEN"],
    )
    ctx = QuoteContext(config)
    symbol = "AAPL.US"

    # 拉取不同周期(从大到小,如失败可注释跳过)
    fetch_save(ctx, symbol, Period.Day,  252,  "day-1y")
    fetch_save(ctx, symbol, Period.Day,  1000, "day-5y")     # 接口上限 1000
    fetch_save(ctx, symbol, Period.Week, 260,  "week-5y")
    # 5min × 5 天 ≈ 390 根 (US 一天 78 根 × 5 = 390)
    fetch_save(ctx, symbol, Period.Min_5, 390, "min5-5d")
    # 1min × 1 天 = 240-390 根
    fetch_save(ctx, symbol, Period.Min_1, 390, "min1-1d")

    print("\n✅ 全部完成。跟我说一声,我接入到 IntradayChart。")


if __name__ == "__main__":
    main()
