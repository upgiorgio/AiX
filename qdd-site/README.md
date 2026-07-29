# qdd.app｜乔大帅中国护照出境说明书

独立的中国普通护照出境政策核验与办理教程网站。

## 当前内容

- 8 个已上线国家页面
- 20 国、172 节签证、免签与入境教程
- 12 个后续国家导航占位
- 8 套可编辑、可导出 PNG 的卡片工具
- 政策生效日、官方页面日、本站核验日分开显示

## 数据源

站点构建时读取：

```text
../visa-cards/policy-data.json
```

更新政策数据并重新生成卡片后，执行：

```bash
node ../visa-cards/generate-visa-cards.mjs
npm run build
npm run check
```

## Cloudflare Pages

- Pages 项目：`qdd-passport`
- 生产分支：`main`
- 构建目录：`dist`
- 正式域名：`https://qdd.app`
- 别名：`https://www.qdd.app`

直接部署：

```bash
wrangler pages deploy dist --project-name qdd-passport --branch main
```

站点署名统一为：

```text
qdd.app · 乔大帅
```
