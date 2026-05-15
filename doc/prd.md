# LLM Bench -- 产品路线图 PRD

> 版本: v1.1 | 更新日期: 2026-05-15
>
> 本文档基于 [竞品调研](./lmbook.md) 结论，对标 `llm-api-speedtester`、`llm-speed-benchmark` 等同类工具，
> 梳理当前实现与差距，定义产品迭代路线。

---

## 一、产品现状概览

### 已实现功能

| 模块 | 功能点 | 状态 |
|------|--------|------|
| 核心指标 | TTFT / TPS / ITL / E2E / 成功率，P50/P95/P99 统计聚合 | 已完成 |
| 测试配置 | OpenAI Compatible 协议，自定义 Endpoint/Model/API Key | 已完成 |
| 测试配置 | 内置 Prompt 预设（短/中/长），maxTokens，重复轮次 | 已完成 |
| 并发压测 | 多并发级别（1/2/4/8），Request/Token Throughput | 已完成 |
| 实时反馈 | 测评进度 Modal，当前端点/轮次/实时 TTFT 和 TPS | 已完成 |
| 可视化 | 雷达图（五维综合评分） | 已完成 |
| 可视化 | TTFT 柱状图（含误差线）、TPS 柱状图 | 已完成 |
| 可视化 | ITL 分位数对比（P50/P95/P99 分组柱状图） | 已完成 |
| 可视化 | 并发退化曲线（TPS/TTFT vs 并发数折线图） | 已完成 |
| 数据表格 | 端点级摘要原始数据表 | 已完成 |
| 导入导出 | JSON 导出/导入，含 Python Runner 兼容 | 已完成 |
| 历史管理 | IndexedDB 本地存储，查看/删除/导入/导出 | 已完成 |
| CLI 补充 | Python Runner（httpx 异步流式），输出 Web 兼容 JSON | 已完成 |

### 竞品调研识别的差距

| 差距点 | 竞品参考 | 当前状态 |
|--------|---------|---------|
| 表格动态颜色高亮（性能色彩编码） | llm-api-speedtester | 未实现 |
| CSV 数据导出 | 多数竞品 | 仅 JSON |
| Markdown 性能报告自动生成（含中位数、IQR） | llm-speed-benchmark | 未实现 |
| 流式输出细节指标（avg tokens/chunk, avg chunk interval） | 竞品标配 | 未采集 |
| 历史 Session 对比（跨时间/跨模型叠加对比） | 竞品普遍缺失，差异化机会 | 未实现 |
| 延迟分位数阶梯图 | README 提及但未实现 | 未实现 |
| 散点图（Prompt 长度 vs 延迟） | 补充建议 | 未实现 |
| 热力图（并发 x 上下文 -> 延迟/成功率） | 补充建议 | 未实现 |
| 结果分享（URL 或图片） | 多数竞品 Roadmap | 未实现 |
| 跨模型精准 Token 计数 | 竞品普遍痛点 | 未实现 |

---

## 二、迭代路线图

### Phase 1 -- 数据展示增强（P0，当前迭代）

> 目标: 补齐竞品已有的基础数据展示能力，提升用户体验的直观性和专业度。
>
> 改动量: ~300 行新增/修改代码

#### F1.1 Raw Data 表格动态颜色高亮

- **描述**: 对端点摘要表的 TTFT / TPS / Success 等列，根据数值好坏自动着色。
  - 绿色 -> 最优区间，红色 -> 最差区间，渐变过渡
  - 参照同 Session 内各端点数据做相对排名着色
- **文件影响**: `result-dashboard.tsx`
- **改动量**: ~50 行

#### F1.2 CSV 导出

- **描述**: 在 JSON Export 旁增加 "Export CSV" 按钮。
  - 导出字段: Endpoint, TTFT (P50/P95/P99), TPS (P50), ITL (P50/P95/P99), E2E (P50), Success Rate
  - 并发数据单独 Sheet 或追加行
- **文件影响**: `result-dashboard.tsx`, `store.ts`（新增 `exportCSV` 函数）
- **改动量**: ~60 行

#### F1.3 Markdown 性能报告自动生成

- **描述**: 一键生成包含中位数和 IQR 的 Markdown 表格报告。
  - 生成标准化 Markdown 文本，可直接复制粘贴到文档/PR
  - 包含: 测试时间、配置摘要、各端点指标表、总结
- **文件影响**: `lib/report.ts`（新文件）, `result-dashboard.tsx`
- **改动量**: ~80 行

#### F1.4 流式输出细节指标

- **描述**: 在 `runner.ts` 中增量采集 SSE chunk 维度数据:
  - `chunkCount` -- 总 chunk 数
  - `avgTokensPerChunk` -- 平均每个 chunk 包含的 token 数
  - `avgChunkInterval` -- 平均 chunk 间隔时间 (ms)
  - 在 `result-dashboard.tsx` 的 Raw Data 表中新增展示列
- **文件影响**: `types.ts`, `runner.ts`, `metrics.ts`, `result-dashboard.tsx`
- **改动量**: ~80 行

#### F1.5 延迟分位数阶梯图

- **描述**: 新增 chart 组件，以阶梯式展示 P50 / P75 / P90 / P95 / P99 各级分位的延迟值。
  - X 轴: 分位数 (50/75/90/95/99)
  - Y 轴: 延迟 (ms)
  - 多端点叠加折线/阶梯线对比
- **文件影响**: `chart-percentile.tsx`（新文件）, `result-dashboard.tsx`
- **改动量**: ~70 行

---

### Phase 2 -- 数据对比与协作（P1，下一迭代）

> 目标: 超越竞品，提供历史追踪和对比能力，形成核心差异化壁垒。
>
> 改动量: ~400 行新增/修改代码

#### F2.1 历史 Session 对比

- **描述**: 在 History Tab 中支持勾选 2-4 个 Session 进行侧对比。
  - 共享 X 轴，叠加同类指标（TTFT / TPS / Success Rate）
  - 识别同一端点跨时间的性能变化趋势
- **文件影响**: `history-list.tsx`, `result-dashboard.tsx`（扩展为可接收多 Session）
- **改动量**: ~200 行

#### F2.2 性能趋势折线图

- **描述**: 选定某端点后，自动从历史 Session 中提取其 TTFT/TPS 随时间变化的折线趋势。
  - X 轴: 测试时间
  - Y 轴: 指标值
  - 适合监控某模型服务的性能劣化
- **文件影响**: `chart-trend.tsx`（新文件）, 集成到对比视图
- **改动量**: ~120 行

#### F2.3 结果快照分享

- **描述**: 将当前结果序列化为压缩后的 URL Fragment（#data=...），无需后端即可分享。
  - 接收方打开 URL 自动加载并渲染结果
  - 附带压缩（pako/lz-string）控制 URL 长度
- **文件影响**: `lib/share.ts`（新文件）, `page.tsx`
- **改动量**: ~80 行

---

### Phase 3 -- 高级分析能力（P2，远期规划）

> 目标: 面向进阶用户和团队，提供深度分析工具。

#### F3.1 Prompt 长度 vs 延迟散点图

- 需要扩展测试配置支持多个不同长度 Prompt 的批量测试
- 散点图展示相关性，帮助识别模型的上下文处理瓶颈

#### F3.2 并发压测热力图

- X 轴: 并发数，Y 轴: 上下文长度
- 颜色: 延迟/成功率
- 需要扩展并发矩阵配置

#### F3.3 跨模型精准 Token 计数

- 接入 tiktoken / tokenizers WASM 版本
- 支持按模型选择对应的 Tokenizer
- 提供比 API 返回 `usage` 更精准的 Token 统计

#### F3.4 逐请求明细表

- 展开每个端点的逐次请求详情
- 支持排序、筛选异常请求
- 可视化单次请求的 token 时间线

---

## 三、优先级矩阵

```
            高用户价值
                |
     F2.1      |  F1.1  F1.2
     F2.2      |  F1.3  F1.4
               |  F1.5
  ─────────────+──────────────
               |
     F3.1      |  F2.3
     F3.2      |
     F3.3      |
               |
            低用户价值
   高实现成本 <──────> 低实现成本
```

---

## 四、技术约束与决策

1. **纯静态部署不变**: 所有新功能均在客户端实现，不引入服务端 API
2. **零新依赖原则**: CSV/Markdown 生成用纯 TS 实现，不引入新 npm 包
3. **向后兼容**: 新增的 `streamingDetails` 字段对旧 Session 数据可选，不破坏历史导入
4. **IndexedDB schema 不升级**: 新字段嵌套在现有 `BenchmarkSession` 结构内
5. **P75 分位数**: metrics.ts 中新增 P75 计算，仅用于阶梯图，不影响现有 P50/P95/P99 体系

---

## 五、验收标准

### Phase 1 验收清单

- [ ] Raw Data 表格: TTFT/TPS/Success 列有动态颜色，最优绿色、最差红色
- [ ] Export 区域: 新增 CSV 和 Markdown 按钮，各自输出格式正确
- [ ] Markdown 报告: 包含测试配置摘要、各端点指标表（含 IQR）、自动总结
- [ ] 流式细节: runner.ts 采集 chunk 维度数据，表格中展示 Avg Tokens/Chunk 和 Avg Chunk Interval
- [ ] 阶梯图: 新增 Percentile Step Chart，展示 P50-P99 延迟分布，多端点叠加
- [ ] 所有新功能不影响现有测评流程和历史数据兼容性
- [ ] 构建通过，Lint 无新增错误
