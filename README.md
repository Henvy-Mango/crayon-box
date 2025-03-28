<div align="center">

![logo](./images/logo.png)

<h1><b>CrayonBox（蜡笔小箱）</b></h1>

</div>

**CrayonBox（蜡笔小箱）**——可以实时查看 虚拟币、股票 的交易数据，助你实现更好的投资。

## 功能

- 底部状态栏显示虚拟币、股票的实时交易数据
- 支持自选虚拟币、股票，自定义显示顺序
- 开市自动刷新，非交易时间关闭轮询
- 支持配置反代 API，解决国内虚拟币交易数据无法获取的问题
- 通过 GUI 配置自选虚拟币、股票
- 涨跌幅消息通知

## 安装

有两种安装方式：

1. 从 [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=naomi233.crayon-box) 安装。
2. 在 vscode 里搜索 `naomi233.crayon-box`。

## 配置项

### 全局配置

| 名称                  |   类型    | 默认值 | 描述         |
| :-------------------- | :-------: | :----: | :----------- |
| `crayon-box.enabled`  | `boolean` | `true` | 插件是否启用 |
| `crayon-box.interval` | `number`  | `5000` | 数据刷新间隔 |

### binance 配置

通过 `crayon-box.binance` 设置虚拟币数据的配置，交易数据来自币安（binance）

| 名称         |    类型    |              默认值               | 描述                                                                              |
| :----------- | :--------: | :-------------------------------: | :-------------------------------------------------------------------------------- |
| `symbols`    | `string[]` |           `["BTCUSDT"]`           | 自选代码集合                                                                      |
| `order`      |  `number`  |                `0`                | 底部状态栏位置排序，数字越小越靠右边                                              |
| `apiUrl`     |  `string`  | `https://data-api.binance.vision` | binance 接口 API 地址，支持配置反代 API                                           |
| `windowSize` |  `string`  |               `1d`                | 获取数据的滑动窗口大小，可用值：'1m', '15m', '30m', '1h', '4h', '6h', '12h', '1d' |

### stock 配置

通过 `crayon-box.stock` 设置股票数据的配置，交易数据来自新浪财经

| 名称      |    类型    |     默认值     | 描述                                 |
| :-------- | :--------: | :------------: | :----------------------------------- |
| `symbols` | `string[]` | `["sh000001"]` | 自选代码集合                         |
| `order`   |  `number`  |      `0`       | 底部状态栏位置排序，数字越小越靠右边 |

### remind 配置

通过 `crayon-box.remind` 设置涨跌幅消息通知，通知间隔五分钟

| 名称      |   类型   | 默认值 | 描述                                                     |
| :-------- | :------: | :----: | :------------------------------------------------------- |
| `symbol`  | `string` |        | 自选代码                                                 |
| `price`   | `number` |        | 大于0时，上涨超过指定值通知；小于0时，下跌超过指定值通知 |
| `percent` | `number` |        | 大于0时，涨幅超过指定值通知；小于0时，跌幅超过指定值通知 |

### 配置示例

```json
{
  "crayon-box.binance": {
    "symbols": ["BTCUSDT", "ETHUSDT"],
    "order": 0,
    "apiUrl": "https://data-api.binance.vision",
    "windowSize": "1d"
  },
  "crayon-box.stock": {
    "symbols": ["sh000001"],
    "order": 1
  },
  "crayon-box.remind": [
    {
      "symbol": "BTCUSDT",
      "price": -80000,
      "percent": -5.0
    },
    {
      "symbol": "sh000001",
      "price": 3000,
      "percent": 0
    }
  ]
}
```

## 快捷命令

- `crayon-box.toggleStatusBar`：显示/隐藏底部状态栏
- `crayon-box.addBinanceToStatusBar`: 添加自选虚拟币
- `crayon-box.addStockToStatusBar`: 添加自选股票
- `crayon-box.addRemind`: 添加涨跌幅消息通知

## 更新日志

可以从 [CHANGELOG](./CHANGELOG.md) 查看所有的变更内容

## Todo

- [x] 通过 GUI 配置自选虚拟币、股票
- [x] 涨跌幅消息通知

## 致谢

- [leek-fund](https://github.com/LeekHub/leek-fund)
