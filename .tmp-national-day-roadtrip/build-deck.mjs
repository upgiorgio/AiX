import fs from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUT = "/Users/mac/Documents/New project";
const TMP = `${OUT}/.tmp-national-day-roadtrip`;
const FINAL = `${OUT}/国庆自驾游调研报告_2026_深圳出发.pptx`;
const CSV = `${OUT}/国庆自驾游_价格评价证据表_2026-08-03.csv`;

const C = {
  bg: "#FFF8F2",
  paper: "#FFFFFF",
  ink: "#2B211C",
  muted: "#776D66",
  line: "#E8DCCF",
  orange: "#F47C48",
  amber: "#F3A64A",
  peach: "#FCE3D1",
  sand: "#F5E8DA",
  green: "#557B65",
  sage: "#DDE9DE",
  blue: "#3E6B8C",
  sky: "#DCEAF3",
  red: "#B95243",
  lilac: "#E9E0EE",
};

const FONT = "PingFang SC";

const sources = [
  ["S01", "12306 贵广客专票价说明", "https://www.12306.cn/mormhweb/zxdt/202308/t20230826_39897.html", "动车组执行票价按日期、时段、席别浮动"],
  ["S02", "深圳北—贵阳北公开高铁票价", "https://www.gaotie.com.cn/lieche/shenzhenbei-guiyangbei.html", "公开样本二等座约 ¥515.5/程"],
  ["S03", "携程深圳—贵阳机票页", "https://m.ctrip.com/html5/flight/SZX-KWE-day-1.html", "附近日期可见约 ¥610–1,080/程"],
  ["S04", "携程贵阳—深圳机票页", "https://m.ctrip.com/html5/flight/kwe-szx-day-1.html", "附近日期返程样本约 ¥550–920/程"],
  ["S05", "携程深圳—呼和浩特机票页", "https://m.ctrip.com/html5/flight/szx-het-day-1.html", "公开样本用于国庆前后比价"],
  ["S06", "携程呼和浩特—深圳机票页", "https://m.ctrip.com/html5/flight/het-szx-day-1.html", "公开样本用于返程比价"],
  ["S07", "神州租车贵阳网点", "https://guiyang.zuche.com/", "龙洞堡机场 T1/T2/T3 网点"],
  ["S08", "一嗨贵阳车型页", "https://www.1hai.cn/CityCarRental/index?City=%E8%B4%B5%E9%98%B3", "车型/服务入口，目标日动态价待核"],
  ["S09", "神州租车呼和浩特网点", "https://huhehaote.zuche.com/", "白塔机场服务点"],
  ["S10", "神州租车鄂尔多斯网点", "https://eerduosi.zuche.com/", "鄂尔多斯机场/伊旗服务点"],
  ["S11", "黄果树官方游览信息", "https://movement.gzstv.com/news/detail/HPzWJ9/", "大瀑布、陡坡塘、天星桥及游览信息"],
  ["S12", "万峰林景区官网", "https://www.wanfenglin.cn/wanfenglingaishu.html", "景区开放、预约与官方介绍"],
  ["S13", "贵州省 A 级旅游景区名录", "https://drc.guizhou.gov.cn/xxgk/sqjs/gzfg/gzfg/202405/t20240523_84672683.html", "景区等级及部分门票参考"],
  ["S14", "织金洞世界地质公园官网", "https://www.zjdgeopark.com/cn", "溶洞/世界地质公园官方信息"],
  ["S15", "荔波小七孔官方规划/报道", "https://www.forestry.gov.cn/lyj/1/dfdt/20260612/675979.html", "客流与景区热度风险"],
  ["S16", "西江千户苗寨官方票价", "https://www.xjqhmz.com/news/detail?id=767709855313141762&type=news-notice", "门票与观光车公开价"],
  ["S17", "国务院办公厅 2026 国庆假期", "https://big5.www.gov.cn/gate/big5/www.gov.cn/yaowen/liebiao/202511/content_7047099.htm", "10/1–10/7 假期与调休"],
  ["S18", "2026 国庆高速免费说明", "https://www.beijing.gov.cn/ywdt/gzdt/202511/t20251107_4265508.html", "7座及以下 10/1–10/7 免费"],
  ["S19", "贵州公路国庆拥堵研判（历史参考）", "https://glj.guizhou.gov.cn/xwzx_500473/yw/202509/t20250930_88672139.html", "高峰时段与拥堵规律"],
  ["S20", "响沙湾官方介绍", "https://www.ixsw.cn/xsw/about/about-1.html", "5A 景区、库布其沙漠与景区交通"],
  ["S21", "响沙湾官方交通", "https://www.ixsw.cn/xsw/about/about-138.html", "呼和浩特/包头/东胜方向交通"],
  ["S22", "呼和浩特白塔机场 2026 航季", "https://inews.nmgnews.com.cn/system/2026/03/29/030326703.shtml", "深圳方向航班密度参考"],
  ["S23", "内蒙古国庆交通预测", "https://nm.people.com.cn/n2/2025/0929/c196689-41368554.html", "呼包段、鄂尔多斯、响沙湾风险"],
  ["S24", "中国天气网额济纳气候/胡杨", "https://news.weather.com.cn/2024/10/3922118.shtml", "10月初胡杨观赏窗口参考"],
  ["S25", "携程兴义万峰林捌舍民宿", "https://hotels.ctrip.com/hotels/15154300.html", "4.9/5、261条、停车与景观评价"],
  ["S26", "携程兴义万峰林隐阅山也民宿", "https://hotels.ctrip.com/hotels/100389892.html", "4.9/5、624条、景观/早餐/服务关键词"],
  ["S27", "携程半山酒店·安顺古城店", "https://tw.trip.com/hotels/anshun-hotel-detail-38324007/mid-level-hotel/", "9.5/10、约6,522条、免费停车"],
  ["S28", "携程荔波山语·水岸美宿", "https://sg.trip.com/hotels/libo-hotel-detail-110419924/shanyushuian/", "9.7/10、663条、停车/充电桩"],
  ["S29", "大众点评老凯俚酸汤鱼公开页", "https://m.dianping.com/discovery/695584544", "公开页可见约 ¥87/人，评分/口径可能随门店变化"],
  ["S30", "大众点评老凯俚酸汤鱼相册/门店", "https://www.dianping.com/shop/24873401/photos", "门店、菜品与近期用户图文入口"],
  ["S31", "大众点评金牌罗记肠旺面攻略", "https://m.dianping.com/discovery/703922120", "肠旺面/软哨/血旺体验关键词"],
  ["S32", "携程安顺餐饮列表", "https://you.ctrip.com/restaurantlist/anshun518/s0-p23.html", "黔人百味 4.9/5、150条、人均约 ¥46"],
  ["S33", "携程安顺程汤圆", "https://you.ctrip.com/food/anshun518/16263081.html", "4.8/5、5条、人均约 ¥9"],
  ["S34", "携程呼和浩特老绥元烧麦", "https://you.ctrip.com/food/hohhot156/12513942-dianping.html", "4.5/5、89条、人均约 ¥56"],
  ["S35", "大众点评呼市烧麦羊杂公开页", "https://www.dianping.com/shop/ilskogWYshhxQxWO/photos", "菜单与近期评价入口，数字需 App 复核"],
  ["S36", "携程包头蒙餐/小肥羊列表", "https://you.ctrip.com/restaurantlist/baotou347/s0-p8.html", "牧人嘎查 4.8/5、25条、人均约 ¥84；小肥羊 4.3/5、94条、人均约 ¥96"],
  ["S37", "小红书：贵阳丝娃娃搜索", "https://www.xiaohongshu.com/search_result?keyword=%E8%B4%B5%E9%98%B3%20%E4%B8%9D%E5%A8%83%E5%A8%83", "需用户在 App/登录态复核笔记正文"],
  ["S38", "小红书：安顺小吃搜索", "https://www.xiaohongshu.com/search_result?keyword=%E5%AE%89%E9%A1%BA%20%E8%A3%B9%E5%8D%B7%20%E5%A4%BA%E5%A4%BA%E7%B2%89", "裹卷/夺夺粉/冲冲糕检索入口"],
  ["S39", "小红书：荔波美食搜索", "https://www.xiaohongshu.com/search_result?keyword=%E8%8D%94%E6%B3%A2%20%E5%B0%8F%E4%B8%83%E5%AD%94%20%E7%BE%8E%E9%A3%9F", "小七孔/酸汤牛肉检索入口"],
  ["S40", "小红书：西江酸汤鱼搜索", "https://www.xiaohongshu.com/search_result?keyword=%E8%A5%BF%E6%B1%9F%E5%8D%83%E6%88%B7%E8%8B%97%E5%AF%A8%20%E9%85%B8%E6%B1%A4%E9%B1%BC", "西江餐饮住宿检索入口"],
  ["S41", "小红书：呼和浩特烧麦搜索", "https://www.xiaohongshu.com/search_result?keyword=%E5%91%BC%E5%92%8C%E6%B5%A9%E7%89%B9%20%E7%83%A7%E9%BA%A6", "烧麦/羊杂/宽巷子检索入口"],
  ["S42", "小红书：包头蒙餐搜索", "https://www.xiaohongshu.com/search_result?keyword=%E5%8C%85%E5%A4%B4%20%E8%92%99%E9%A4%90%20%E7%83%A7%E9%BA%A6", "蒙餐/烧麦检索入口"],
  ["S43", "小红书：鄂尔多斯响沙湾咖啡搜索", "https://www.xiaohongshu.com/search_result?keyword=%E9%84%82%E5%B0%94%E5%A4%9A%E6%96%AF%20%E5%93%8D%E6%B2%99%E6%B9%BE%20%E5%92%96%E5%95%A1", "沙漠咖啡/蒙餐检索入口"],
  ["S44", "贵阳公开咖啡地图（含小红书引用）", "https://www.sohu.com/a/901913972_121106687", "贵阳咖啡店与小红书用户引用摘要"],
  ["S45", "呼和浩特东护城河咖啡街报道", "https://static.0471tv.org.cn/rb/pc/con/202411/11/content_74543.html", "大众点评/小红书是当地咖啡检索入口"],
  ["S46", "呼市烧麦测评公开摘要", "https://m.sohu.com/a/915568366_122358233", "多家烧麦体验摘要，非官方评分"],
  ["S47", "一嗨鄂尔多斯车型页", "https://www.1hai.cn/c_eerduosi", "车型与机场租车入口，目标日动态价待核"],
];

const evidence = [
  ["交通", "深圳北→贵阳北高铁", "¥480.5–515.5/人/程", "公开样本；目标日需 12306 复核", "S01;S02"],
  ["交通", "深圳→贵阳机票", "约 ¥610–1,080/人/程", "附近日期样本；9/29、10/5/6 是动态价", "S03;S04"],
  ["交通", "深圳→呼和浩特机票", "目标模型 ¥2,100–3,250/人往返", "国庆模型区间，不是已锁订单", "S05;S06"],
  ["租车", "贵阳/兴义紧凑 SUV", "约 ¥250–500/天", "公开市场参考；订单含保险/服务费需逐项核", "S07;S08"],
  ["租车", "呼和浩特/鄂尔多斯紧凑 SUV", "约 ¥250–500/天", "公开市场参考；异地还车另计", "S09;S10;S47"],
  ["景区", "黄果树", "旺季门票/小交通按官方公告", "核心三景区，一天更稳", "S11;S13"],
  ["景区", "万峰林", "官方门票/观光车按官网", "预约、8:00–18:00 参考", "S12;S13"],
  ["景区", "响沙湾", "公开门票约 ¥120 起", "沙漠交通/项目通常另计", "S20;S21"],
  ["酒店", "安顺半山酒店", "9.5/10，约6,522条", "免费停车；国庆房价需下单核", "S27"],
  ["酒店", "万峰林捌舍民宿", "4.9/5，261条", "景观、服务、停车关键词好", "S25"],
  ["餐饮", "老凯俚酸汤鱼", "约 ¥79–87/人（公开口径有差异）", "酸汤/民族风；鱼价与锅底要现场确认", "S29;S30"],
  ["餐饮", "金牌罗记肠旺面", "价格/评分待 App 复核", "软哨、血旺、脆哨体验入口", "S31"],
  ["餐饮", "安顺黔人百味", "4.9/5、150条、人均约 ¥46", "黄果树新城，距票务中心近", "S32"],
  ["餐饮", "呼市老绥元烧麦", "4.5/5、89条、人均约 ¥56", "羊肉烧麦/羊杂；适合早餐", "S34;S41"],
  ["餐饮", "包头牧人嘎查蒙餐", "4.8/5、25条、人均约 ¥84", "手扒肉、奶茶、烤羊排", "S36;S42"],
  ["咖啡", "贵阳咖啡地图", "店铺与人均需到店前复核", "公开文章引用小红书用户内容", "S44;S37"],
  ["咖啡", "呼市东护城河咖啡街", "评分/人均需 App 复核", "大众点评/小红书检索入口", "S45;S41"],
  ["社媒", "小红书真实评价", "不硬写星级", "当前环境无法稳定读取原文，报告给出可点击搜索入口", "S37;S38;S39;S40;S41;S42;S43"],
];

function addText(slide, text, position, style = {}, name = undefined) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name,
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    fontFamily: FONT,
    fontSize: 16,
    color: C.ink,
    ...style,
  };
  return shape;
}

function addBox(slide, position, fill, line = C.line, radius = "rounded-xl", name = undefined) {
  return slide.shapes.add({
    geometry: radius === "none" ? "rect" : "roundRect",
    name,
    position,
    fill,
    line: { style: "solid", fill: line, width: 1 },
    ...(radius === "none" ? {} : { borderRadius: radius }),
  });
}

function addRule(slide, x, y, w, color = C.orange, width = 3) {
  return slide.shapes.add({
    geometry: "rect",
    position: { left: x, top: y, width: w, height: width },
    fill: color,
    line: { style: "solid", fill: color, width: 0 },
  });
}

function addPageChrome(slide, number, section = "国庆自驾研究 · 2026-08-03") {
  addText(slide, section, { left: 72, top: 26, width: 540, height: 22 }, { fontSize: 12, color: C.muted, bold: true });
  addText(slide, String(number).padStart(2, "0"), { left: 1170, top: 24, width: 38, height: 24 }, { fontSize: 14, color: C.orange, bold: true, alignment: "right" });
  addRule(slide, 72, 58, 1136, C.line, 1);
}

function addTitle(slide, title, subtitle = "") {
  addText(slide, title, { left: 72, top: 78, width: 1040, height: 58 }, { fontSize: 34, bold: true, color: C.ink }, "slide-title");
  if (subtitle) addText(slide, subtitle, { left: 74, top: 138, width: 1050, height: 34 }, { fontSize: 17, color: C.muted });
}

function setNotes(slide, note, ids = []) {
  const lines = [note, "", "[Sources]"];
  for (const id of ids) {
    const row = sources.find((s) => s[0] === id);
    if (row) lines.push(`${row[0]} ${row[1]} — ${row[2]}`);
  }
  slide.speakerNotes.textFrame.setText(lines.join("\n"));
  slide.speakerNotes.setVisible(true);
}

function styleTable(table, headerFill = C.ink, bodyFont = 15) {
  table.styleOptions = { headerRow: true, bandedRows: true };
  table.borders.assign({ style: "solid", fill: C.line, width: 1 });
  for (let c = 0; c < table.columns.length; c += 1) {
    const cell = table.getCell(0, c);
    cell.fill = headerFill;
    cell.text.style = { fontFamily: FONT, fontSize: 14, bold: true, color: C.paper };
  }
  for (let r = 1; r < table.rows.length; r += 1) {
    for (let c = 0; c < table.columns.length; c += 1) {
      const cell = table.getCell(r, c);
      cell.text.style = { fontFamily: FONT, fontSize: bodyFont, color: C.ink };
    }
  }
}

function addRoute(slide, points, y, color, labels) {
  const nodes = [];
  const step = 1060 / (points.length - 1);
  points.forEach((point, i) => {
    const x = 110 + step * i;
    const node = slide.shapes.add({
      geometry: "ellipse",
      name: `route-node-${i + 1}`,
      position: { left: x - 14, top: y - 14, width: 28, height: 28 },
      fill: color,
      line: { style: "solid", fill: C.paper, width: 3 },
    });
    nodes.push(node);
    addText(slide, point, { left: x - 62, top: y + 22, width: 124, height: 30 }, { fontSize: 15, bold: true, color: C.ink, alignment: "center" });
    if (labels?.[i]) addText(slide, labels[i], { left: x - 70, top: y + 52, width: 140, height: 42 }, { fontSize: 13, color: C.muted, alignment: "center" });
  });
  for (let i = 0; i < nodes.length - 1; i += 1) {
    slide.shapes.connect(nodes[i], nodes[i + 1], {
      kind: "straight",
      fromSide: "right",
      toSide: "left",
      line: { style: "solid", fill: color, width: 4 },
      head: { type: "arrow", width: "sm", length: "sm" },
    });
  }
}

async function writeText(path, text) {
  await fs.writeFile(path, text, "utf8");
}

async function writeBlob(path, blob) {
  await fs.writeFile(path, new Uint8Array(await blob.arrayBuffer()));
}

async function main() {
  await fs.mkdir(TMP, { recursive: true });
  const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });

  // 1 Cover
  {
    const s = p.slides.add();
    s.background.fill = C.bg;
    addBox(s, { left: 0, top: 0, width: 1280, height: 720 }, C.bg, C.bg, "none", "cover-bg");
    addRule(s, 72, 102, 112, C.orange, 6);
    addText(s, "国庆自驾游\n路线研究报告", { left: 72, top: 132, width: 610, height: 182 }, { fontSize: 48, bold: true, color: C.ink }, "cover-title");
    addText(s, "深圳出发 · 贵州 vs 内蒙古\n2026.09.29 → 2026.10.05 / 06 · 两人 · 落地租车", { left: 76, top: 344, width: 560, height: 82 }, { fontSize: 21, color: C.muted, bold: true });
    addText(s, "研究结论先行：能 10 月 6 日回深，贵州更匹配；只能 10 月 5 日回，则需要接受更高强度的贵州方案或选择呼和浩特往返稳妥版。", { left: 76, top: 484, width: 540, height: 92 }, { fontSize: 18, color: C.ink });
    addBox(s, { left: 760, top: 94, width: 420, height: 500 }, C.peach, C.peach, "rounded-2xl", "cover-route-surface");
    addText(s, "两条研究主线", { left: 802, top: 132, width: 320, height: 32 }, { fontSize: 18, bold: true, color: C.orange });
    addRoute(s, ["深圳", "贵阳", "黄果树", "兴义", "织金", "深圳"], 254, C.orange, ["出发", "入口", "瀑布", "峰林", "溶洞", "回程"]);
    addRoute(s, ["深圳", "呼和浩特", "草原", "响沙湾", "鄂尔多斯", "深圳"], 452, C.blue, ["出发", "入口", "高原秋色", "沙漠", "康巴什", "回程"]);
    addText(s, "价格 = 公开样本 / 建模区间 / 待下单核价，三种状态严格区分。\n评价 = 平台数字 + 体验关键词 + 可复核入口，不把不可读原文写成已核验。", { left: 802, top: 616, width: 335, height: 64 }, { fontSize: 14, color: C.muted });
    setNotes(s, "封面。交付以可编辑 PPTX 为主；所有数据和推荐均在后续页标注来源与不确定性。", ["S17", "S18"]);
  }

  // 2 Recommendation
  {
    const s = p.slides.add(); s.background.fill = C.bg; addPageChrome(s, 2); addTitle(s, "先给结论：贵州是更稳的主方案，内蒙古是偏好驱动的备选", "评价维度：深圳出发效率、路线紧凑度、季节适配、预算可控、落地租车与国庆风险");
    addBox(s, { left: 72, top: 198, width: 420, height: 360 }, C.orange, C.orange, "rounded-2xl", "rec-guizhou");
    addText(s, "A · 贵州西南舒适环线", { left: 104, top: 228, width: 340, height: 35 }, { fontSize: 25, bold: true, color: C.paper });
    addText(s, "7晚 / 9.29–10.06\n贵阳 → 黄果树 → 兴义 → 贞丰 → 六盘水 → 织金 → 贵阳", { left: 104, top: 286, width: 330, height: 92 }, { fontSize: 19, color: C.paper, bold: true });
    addText(s, "适合：想玩得舒服、减少换酒店、看瀑布 + 峰林 + 溶洞。\n预算：两人约 ¥1.50–2.69万（舒适档模型，含机动金）。", { left: 104, top: 410, width: 330, height: 100 }, { fontSize: 16, color: C.paper });
    addBox(s, { left: 530, top: 198, width: 320, height: 360 }, C.blue, C.blue, "rounded-2xl", "rec-inner");
    addText(s, "B · 内蒙古呼包鄂稳妥线", { left: 558, top: 228, width: 260, height: 35 }, { fontSize: 24, bold: true, color: C.paper });
    addText(s, "6晚 / 9.29–10.05\n呼和浩特 → 草原 → 响沙湾 → 鄂尔多斯 → 呼和浩特", { left: 558, top: 286, width: 260, height: 92 }, { fontSize: 18, color: C.paper, bold: true });
    addText(s, "适合：明确想看草原、沙漠、辽阔公路感。\n预算：两人约 ¥1.75–3.21万（舒适档模型，含机动金）。", { left: 558, top: 410, width: 260, height: 100 }, { fontSize: 16, color: C.paper });
    addBox(s, { left: 888, top: 198, width: 320, height: 360 }, C.paper, C.line, "rounded-2xl", "rec-rule");
    addText(s, "怎么选", { left: 920, top: 228, width: 180, height: 34 }, { fontSize: 24, bold: true, color: C.ink });
    addText(s, "10/06 回深\n→ 贵州舒适版\n\n10/05 回深\n→ 贵州高强度版\n   或内蒙古稳妥版\n\n预算 < ¥1.5万\n→ 贵州优先", { left: 920, top: 286, width: 220, height: 200 }, { fontSize: 19, color: C.ink, bold: true });
    addText(s, "额济纳不建议与草原、响沙湾、鄂尔多斯全部叠加；若胡杨是第一优先级，应另做专项。", { left: 920, top: 510, width: 240, height: 54 }, { fontSize: 14, color: C.red, bold: true });
    setNotes(s, "本页为综合判断，分数与预算来自研究组的统一模型；模型不是订单报价。", ["S17", "S18", "S22", "S24"]);
  }

  // 3 Decision matrix
  {
    const s = p.slides.add(); s.background.fill = C.bg; addPageChrome(s, 3); addTitle(s, "决策矩阵：贵州在 6–7 天窗口里更适合深圳出发", "所有评分为研究组的相对决策评分，满分 5 分；权重和分值均可在 PPT 中直接修改");
    const chart = s.charts.add("bar", {
      position: { left: 72, top: 205, width: 470, height: 360 },
      categories: ["贵州", "内蒙古"],
      series: [{ name: "加权总分", values: [4.25, 3.57], fill: C.orange }],
      barOptions: { direction: "bar", grouping: "clustered", gapWidth: 55 },
      hasLegend: false,
      xAxis: { min: 0, max: 5, majorUnit: 1, textStyle: { fontSize: 13, fill: C.muted }, majorGridlines: { style: "solid", fill: C.line, width: 1 } },
      yAxis: { textStyle: { fontSize: 18, fill: C.ink, bold: true }, line: { style: "solid", fill: C.line, width: 1 } },
      dataLabels: { showValue: true, position: "outEnd", textStyle: { fontSize: 16, fill: C.ink, bold: true } },
    });
    const matrix = s.tables.add({
      rows: 8, columns: 4, left: 590, top: 198, width: 618, height: 372,
      values: [
        ["维度", "权重", "贵州", "内蒙古"],
        ["深圳出发效率", "20%", "5.0", "3.5"],
        ["路线紧凑度", "20%", "4.5", "3.2"],
        ["10月初适配", "15%", "4.0", "3.0"],
        ["景观独特性", "15%", "4.0", "4.5"],
        ["预算可控性", "15%", "4.2", "3.3"],
        ["落地租车适配", "10%", "3.8", "4.5"],
        ["国庆排队/拥堵风险", "5%", "2.8", "3.1"],
      ],
    });
    styleTable(matrix, C.ink, 14);
    matrix.getCell(1, 2).fill = C.peach; matrix.getCell(2, 2).fill = C.peach; matrix.getCell(6, 3).fill = C.sky;
    addText(s, "结论不是“哪个省更好”，而是“哪个省更适合这段假期长度与出发地”。", { left: 72, top: 596, width: 1090, height: 34 }, { fontSize: 18, color: C.orange, bold: true });
    setNotes(s, "评分由研究组按用户约束统一评估，建议若改变权重后重新看结论。", ["S17", "S22", "S23", "S24"]);
  }

  // 4 Timeline / traffic
  {
    const s = p.slides.add(); s.background.fill = C.bg; addPageChrome(s, 4); addTitle(s, "时间线：9/29 出发正好避开假期最早一波，但 10/1–7 仍要按峰值规划", "把“出发日 / 高速免费 / 返程风险 / 订票节点”放在一条线上");
    addRule(s, 104, 290, 1055, C.line, 6);
    const days = [
      ["9/15", "高铁票最早开售参考", "提前锁票"],
      ["9/29", "出发 · 交通仍收费", "取车 / 住贵阳或呼市"],
      ["9/30", "节前晚高峰", "避免傍晚跨城"],
      ["10/1", "假期首日 · 高速免费", "景区早入"],
      ["10/2–4", "核心游玩窗口", "10–12 / 16–18 易拥堵"],
      ["10/5", "可选返深", "必须压缩行程"],
      ["10/6", "更优返程日", "贵州舒适版"],
    ];
    days.forEach((d, i) => {
      const x = 96 + i * 164;
      const color = i === 1 || i === 2 ? C.amber : (i === 3 ? C.green : C.orange);
      s.shapes.add({ geometry: "ellipse", position: { left: x, top: 276, width: 30, height: 30 }, fill: color, line: { style: "solid", fill: C.paper, width: 3 } });
      addText(s, d[0], { left: x - 22, top: 224, width: 74, height: 28 }, { fontSize: 16, bold: true, color: C.ink, alignment: "center" });
      addText(s, d[1], { left: x - 56, top: 326, width: 140, height: 40 }, { fontSize: 15, bold: true, color: C.ink, alignment: "center" });
      addText(s, d[2], { left: x - 58, top: 375, width: 144, height: 44 }, { fontSize: 13, color: C.muted, alignment: "center" });
    });
    addBox(s, { left: 72, top: 500, width: 520, height: 100 }, C.sage, C.sage, "rounded-xl", "traffic-green");
    addText(s, "可执行策略", { left: 98, top: 522, width: 130, height: 26 }, { fontSize: 17, bold: true, color: C.green });
    addText(s, "景区 7:00–8:00 到；长途转场尽量放 9/29、10/3、10/4；每日驾驶预留 30%–50% 弹性。", { left: 98, top: 552, width: 450, height: 36 }, { fontSize: 15, color: C.ink });
    addBox(s, { left: 628, top: 500, width: 580, height: 100 }, C.peach, C.peach, "rounded-xl", "traffic-red");
    addText(s, "最容易踩坑", { left: 654, top: 522, width: 130, height: 26 }, { fontSize: 17, bold: true, color: C.red });
    addText(s, "把“高速免费”误读成“9/29 出发也免费”；把周中房价乘进国庆；把沙漠门票起价当成完整体验价。", { left: 654, top: 552, width: 500, height: 36 }, { fontSize: 15, color: C.ink });
    setNotes(s, "假期和高速免费按官方公开信息；拥堵时段是历史研判参考，2026年9月底需重新查实时路况。", ["S17", "S18", "S19", "S23"]);
  }

  // 5 Guizhou comfort
  {
    const s = p.slides.add(); s.background.fill = C.bg; addPageChrome(s, 5); addTitle(s, "方案 A｜贵州西南舒适环线：10/6 回深", "不追求全省打卡；把瀑布、峰林、溶洞串成一条完成度高的环线");
    addRoute(s, ["贵阳", "黄果树", "兴义", "贞丰", "六盘水", "织金", "贵阳"], 204, C.orange, ["取还车", "瀑布", "峰林峡谷", "双乳峰/休整", "补给", "溶洞", "返深"]);
    const rows = [
      ["9/29", "贵阳", "取车/休息", "0–30", "贵阳"],
      ["9/30", "贵阳→黄果树", "大瀑布/陡坡塘", "128", "黄果树"],
      ["10/1", "黄果树→兴义", "晴隆/北盘江可选", "205", "兴义"],
      ["10/2", "兴义", "万峰林/马岭河", "市内", "兴义"],
      ["10/3", "兴义→贞丰", "双乳峰/北盘江", "122", "贞丰"],
      ["10/4", "贞丰→六盘水", "转场/补给", "293", "六盘水"],
      ["10/5", "六盘水→织金", "织金洞", "155", "织金"],
      ["10/6", "织金→贵阳", "还车/返深", "110–120", "返深"],
    ];
    const table = s.tables.add({ rows: rows.length + 1, columns: 5, left: 72, top: 300, width: 1136, height: 308, values: [["日期", "段落", "当天重点", "驾驶参考", "住宿/状态"], ...rows] });
    styleTable(table, C.orange, 11);
    setNotes(s, "路线与驾驶距离为公开路线参考及研究组综合；最终导航以高德/百度出发当天实时路况为准。", ["S11", "S12", "S14", "S19"]);
  }

  // 6 Guizhou high intensity
  {
    const s = p.slides.add(); s.background.fill = C.bg; addPageChrome(s, 6); addTitle(s, "方案 B｜贵州高强度版：10/5 回深", "一次看黄果树、万峰林、小七孔、西江；10/3–10/4 是压力测试");
    addRoute(s, ["贵阳", "黄果树", "兴义", "荔波", "西江", "贵阳"], 204, C.amber, ["取车", "瀑布", "峰林", "小七孔", "苗寨", "还车返深"]);
    const rows = [
      ["9/29", "贵阳", "落地取车、休息", "0–30 km"],
      ["9/30", "黄果树", "大瀑布主线", "约128 km"],
      ["10/1", "兴义", "黄果树→兴义，下午轻活动", "约205 km"],
      ["10/2", "兴义", "万峰林 + 马岭河峡谷", "市内短途"],
      ["10/3", "荔波", "兴义→荔波，纯转场", "约472 km / 7–8.5h"],
      ["10/4", "西江", "早入小七孔 → 西江夜景", "约270–330 km"],
      ["10/5", "返深", "西江短游→贵阳→还车", "约210–216 km"],
    ];
    const table = s.tables.add({ rows: rows.length + 1, columns: 4, left: 72, top: 300, width: 1136, height: 282, values: [["日期", "住宿", "重点", "驾驶参考"], ...rows] });
    styleTable(table, C.amber, 11);
    setNotes(s, "小七孔客流与西江接驳风险是高强度版的主要不确定性；西江景区内自驾受限，住西门外更稳。", ["S15", "S16", "S19"]);
  }

  // 7 Inner Mongolia stable
  {
    const s = p.slides.add(); s.background.fill = C.bg; addPageChrome(s, 7); addTitle(s, "方案 C｜内蒙古呼包鄂稳妥线：往返呼和浩特", "第一次去内蒙古；不做跨省异地还车，把草原、沙漠和城市休整放进可回撤路线");
    addRoute(s, ["呼和浩特", "辉腾锡勒", "响沙湾", "鄂尔多斯", "呼和浩特"], 204, C.blue, ["取车", "草原", "沙漠", "康巴什/博物馆", "还车返深"]);
    const rows = [
      ["9/29", "呼和浩特", "取车/大召老城", "市内"],
      ["9/30", "草原", "辉腾锡勒/黄花沟", "135"],
      ["10/1", "响沙湾", "草原→沙漠，早出发", "220–270"],
      ["10/2", "响沙湾", "全天沙漠；不驶入非铺装区", "低"],
      ["10/3", "鄂尔多斯", "康巴什/博物馆", "50–80"],
      ["10/4", "呼和浩特", "东胜→呼市，留缓冲", "230–275"],
      ["10/5/6", "返深", "白塔还车；优先直飞", "低"],
    ];
    const table = s.tables.add({ rows: rows.length + 1, columns: 4, left: 72, top: 300, width: 1136, height: 282, values: [["日期", "住宿", "重点", "驾驶参考"], ...rows] });
    styleTable(table, C.blue, 11);
    setNotes(s, "呼和浩特往返是内蒙古的稳妥版本；响沙湾景区内部使用景区交通，租赁车不建议驶入沙漠非铺装区。", ["S20", "S21", "S22", "S23"]);
  }

  // 8 Inner Mongolia advanced
  {
    const s = p.slides.add(); s.background.fill = C.bg; addPageChrome(s, 8); addTitle(s, "方案 D｜内蒙古草原 + 沙漠 + 阿拉善", "呼和浩特进、银川出；异地还车未锁定前不成立");
    addRoute(s, ["呼和浩特", "草原", "响沙湾", "鄂尔多斯", "阿拉善", "银川"], 204, C.green, ["取车", "秋草", "沙漠", "城市休整", "腾格里", "还车返深"]);
    const rows = [
      ["9/29", "呼和浩特", "机场取车，市区休息", "低"],
      ["9/30", "草原", "辉腾锡勒/黄花沟", "中"],
      ["10/1", "响沙湾", "草原→响沙湾", "约270 km"],
      ["10/2", "响沙湾", "完整玩沙漠", "低"],
      ["10/3", "鄂尔多斯", "康巴什 / 博物馆", "低"],
      ["10/4", "阿拉善左旗", "鄂尔多斯→阿拉善，最长的一天", "约350–380 km"],
      ["10/5/6", "银川返程", "阿拉善→银川机场，异地还车", "约120 km"],
    ];
    const table = s.tables.add({ rows: rows.length + 1, columns: 4, left: 72, top: 300, width: 1136, height: 282, values: [["日期", "住宿", "重点", "驾驶参考"], ...rows] });
    styleTable(table, C.green, 11);
    setNotes(s, "阿拉善方案把异地还车、长距离驾驶和返程航班三种不确定性叠加；额济纳应单独做胡杨专项。", ["S20", "S21", "S23", "S24"]);
  }

  // 9 transport & rental quotes
  {
    const s = p.slides.add(); s.background.fill = C.bg; addPageChrome(s, 9); addTitle(s, "交通与租车报价：先锁“确定性”，再追求最低价", "当前查询日 2026-08-03；目标日期动态报价尚未全部开放或未能取得完整结算页");
    const rows = [
      ["贵州", "高铁", "深圳北—贵阳北", "¥480.5–515.5/人/程", "公开样本；关注预售", "S01;S02"],
      ["贵州", "飞机", "深圳—贵阳", "¥1,200–3,000/人往返模型", "附近日 ¥610–1,080/程；待核", "S03;S04"],
      ["贵州", "租车", "龙洞堡 SUV 6/7天", "¥1,500–3,500 模型", "保障、油、停车另计", "S07;S08"],
      ["内蒙古", "飞机", "深圳—呼和浩特", "¥2,100–3,250/人往返模型", "直飞优先；返程选择多", "S05;S06;S22"],
      ["内蒙古", "租车", "白塔 SUV 6/7天", "¥1,500–2,800 模型", "呼包鄂线不异地还车", "S09"],
      ["内蒙古", "飞机+租车", "呼和浩特进 / 银川出", "至少加异地还车费", "未拿到订单前不纳入预算", "S09;S20;S21"],
    ];
    const table = s.tables.add({ rows: rows.length + 1, columns: 6, left: 72, top: 198, width: 1136, height: 292, values: [["区域", "方式", "组合", "价格参考", "决策备注", "来源"], ...rows] });
    styleTable(table, C.ink, 11);
    addText(s, "预算公式：往返票价×2 + 租车日租×天数 + 保障/油费/停车等；模型区间在出发前 30–45 天重核。", { left: 72, top: 166, width: 1136, height: 22 }, { fontSize: 12, color: C.orange });
    setNotes(s, "报价区分公开样本与模型区间；模型的构建不等同于实时订单，建议在 9 月上旬/中旬按目标日期重新核价。", ["S01", "S02", "S03", "S04", "S05", "S06", "S07", "S08", "S09", "S10"]);
  }

  // 10 budget chart
  {
    const s = p.slides.add(); s.background.fill = C.bg; addPageChrome(s, 10); addTitle(s, "两人总预算：贵州更容易把舒适档控制在 ¥2 万上下", "含 10%–15% 国庆机动金；不含购物与不可预见的大额项目");
    s.charts.add("bar", {
      position: { left: 72, top: 200, width: 680, height: 380 },
      categories: ["贵州经济", "贵州舒适", "贵州品质", "内蒙古经济", "内蒙古舒适", "内蒙古品质"],
      series: [{ name: "预算下限（万元）", values: [0.99, 1.50, 2.45, 1.14, 1.75, 2.89], fill: C.orange }, { name: "预算上限（万元）", values: [1.79, 2.69, 4.52, 2.04, 3.21, 5.23], fill: C.blue }],
      barOptions: { direction: "column", grouping: "clustered", gapWidth: 45 },
      hasLegend: true,
      legend: { position: "bottom", textStyle: { fontSize: 14, fill: C.muted } },
      xAxis: { textStyle: { fontSize: 12, fill: C.ink }, line: { style: "solid", fill: C.line, width: 1 } },
      yAxis: { min: 0, max: 6, majorUnit: 1, numberFormatCode: "0.0", textStyle: { fontSize: 13, fill: C.muted }, majorGridlines: { style: "solid", fill: C.line, width: 1 } },
      dataLabels: { showValue: true, position: "outEnd", textStyle: { fontSize: 11, fill: C.ink } },
    });
    const rows = [
      ["档位", "贵州 6晚", "内蒙古 6晚", "适合"],
      ["经济", "¥0.99–1.79万", "¥1.14–2.04万", "省预算 / 普通住宿"],
      ["舒适", "¥1.50–2.69万", "¥1.75–3.21万", "两人首选"],
      ["品质", "¥2.45–4.52万", "¥2.89–5.23万", "景区房 / 高弹性"],
    ];
    const table = s.tables.add({ rows: 4, columns: 4, left: 800, top: 220, width: 408, height: 190, values: rows });
    styleTable(table, C.ink, 12);
    addText(s, "预算敏感项：国庆住宿、低价舱位、异地还车、沙漠二次消费、保险/停车/超公里。", { left: 800, top: 610, width: 408, height: 30 }, { fontSize: 12, color: C.muted });
    addText(s, "预算页按 6 晚统一口径；10/6 贵州舒适环线为 7 晚，需另加 1 晚住宿、餐饮和停车。", { left: 72, top: 614, width: 720, height: 26 }, { fontSize: 14, color: C.muted });
    setNotes(s, "预算区间来自研究组模型，采用公开交通样本、酒店与租车参考，叠加 10%–15% 国庆机动金；不是任何平台的结算单。", ["S03", "S04", "S05", "S06", "S07", "S08", "S09", "S20", "S24"]);
  }

  // 11 food/hotel Guizhou
  {
    const s = p.slides.add(); s.background.fill = C.bg; addPageChrome(s, 11); addTitle(s, "贵州吃住咖啡：把“评价数字”和“真实体验入口”分开看", "大众点评/携程用于结构化评分与人均；小红书用于场景关键词和新鲜体验，原文需登录后复核");
    const rows = [
      ["城市", "住宿建议", "餐饮 / 苍蝇小馆", "咖啡", "证据"],
      ["贵阳", "观山湖/机场周边", "老凯俚酸汤鱼 ¥79–87；罗记肠旺面", "咖啡地图；优先商场停车店", "S29;S31;S44"],
      ["安顺/黄果树", "半山 9.5/10、6,522条、停车", "黔人百味 4.9/5、¥46；程汤圆 ¥9", "独立证据弱；用酒店/商圈替代", "S27;S32;S33;S38"],
      ["兴义", "捌舍 4.9/5、261条、景观/停车", "酸笋牛肉 / 酸汤鱼；看近期菜单", "民宿/万峰林周边", "S25;S26;S30;S39"],
      ["荔波/西江", "小七孔东门 / 西江外", "酸汤牛肉、酸汤鱼；景区慎价", "酒店/营地优先", "S28;S40"],
    ];
    const table = s.tables.add({ rows: rows.length, columns: 5, left: 72, top: 206, width: 1136, height: 270, values: rows });
    styleTable(table, C.orange, 11);
    addText(s, "下单前：大众点评看近 30–90 天图文差评；小红书筛近期/非广告/有菜单或停车实拍；国庆前 3–7 天电话确认营业。", { left: 72, top: 174, width: 1136, height: 20 }, { fontSize: 12, color: C.orange });
    setNotes(s, "贵州的餐饮住宿证据相对完整，但小红书原文受登录态和动态页面限制；报告只保留检索入口和公开摘要，不把未读原文写成已核验评价。", ["S25", "S26", "S27", "S28", "S29", "S30", "S31", "S32", "S33", "S37", "S38", "S39", "S40", "S44"]);
  }

  // 12 food/hotel Inner Mongolia
  {
    const s = p.slides.add(); s.background.fill = C.bg; addPageChrome(s, 12); addTitle(s, "内蒙古吃住咖啡：优先城市基地，苍蝇小馆与独立咖啡证据更弱", "呼和浩特/包头/东胜住得稳，草原和沙漠做日游；景区内住宿需提前锁定");
    const rows = [
      ["城市", "住宿建议", "餐饮 / 苍蝇小馆", "咖啡", "证据"],
      ["呼和浩特", "汉庭火车站 9.6/10、222条", "老绥元烧麦 4.5/5、¥56；宽巷子羊杂", "东护城河/暖咖啡约 4.0/5", "S34;S35;S45;S46"],
      ["包头", "包头宾馆 9.0/10、1,011条、停车充电", "牧人嘎查 4.8/5、¥84；小肥羊 ¥96", "星巴克 ¥33；树下 ¥23", "S36;S42"],
      ["鄂尔多斯/东胜", "紫金国际 8.9–9.2/10", "本地炖菜 / 农家宴", "独立咖啡证据弱", "S20;S23;S43"],
      ["草原/响沙湾", "蒙古包/度假酒店波动大", "景区餐饮仅作补给", "沙漠咖啡是体验项", "S20;S21;S43"],
    ];
    const table = s.tables.add({ rows: rows.length, columns: 5, left: 72, top: 206, width: 1136, height: 270, values: rows });
    styleTable(table, C.blue, 11);
    addText(s, "现实判断：内蒙古的真实感更多来自路线与本地蒙餐；时间和预算优先留给沙漠项目、保暖装备与长途驾驶缓冲。", { left: 72, top: 174, width: 1136, height: 20 }, { fontSize: 12, color: C.blue });
    setNotes(s, "内蒙古餐饮和咖啡的公开数字较少，适合用城市基地和平台搜索做保底；小红书检索入口需在 App/登录态复核。", ["S20", "S21", "S34", "S35", "S36", "S41", "S42", "S43", "S45", "S46"]);
  }

  // 13 Evidence table
  {
    const s = p.slides.add(); s.background.fill = C.bg; addPageChrome(s, 13); addTitle(s, "证据表：每个数字都有来源状态，用户可在 PPT/CSV 中继续改和补", "A = 公开页可见数字；B = 体验/位置可见但数字不完整；M = 模型区间；X = 小红书检索入口，需手工复核");
    const rows = [
      ["类型", "项目", "价格/评分", "状态", "来源"],
      ["交通", "深—贵高铁", "¥480.5–515.5/程", "A / 公开样本", "S01;S02"],
      ["交通", "深—贵飞机", "¥610–1,080/程附近样本", "A / 非目标日", "S03;S04"],
      ["租车", "贵阳/兴义 SUV", "¥250–500/天", "M / 待下单核", "S07;S08"],
      ["交通", "深—呼飞机", "¥2,100–3,250往返模型", "M / 待下单核", "S05;S06;S22"],
      ["酒店", "万峰林捌舍", "4.9/5，261条", "A / 住客评价", "S25"],
      ["酒店", "安顺半山", "9.5/10，约6,522条", "A / 住客评价", "S27"],
      ["餐饮", "老凯俚酸汤鱼", "约¥79–87/人", "A / 公开口径有差异", "S29;S30"],
      ["餐饮", "老绥元烧麦", "4.5/5，89条，约¥56", "A / 公开页", "S34"],
      ["社媒", "小红书推荐", "不写硬评分", "X / 登录后复核", "S37–S43"],
    ];
    const table = s.tables.add({ rows: rows.length, columns: 5, left: 72, top: 198, width: 1136, height: 372, values: rows });
    styleTable(table, C.ink, 14);
    for (let r = 1; r < rows.length; r += 1) {
      const status = rows[r][3];
      if (status.startsWith("M")) table.getCell(r, 3).fill = C.peach;
      if (status.startsWith("X")) table.getCell(r, 3).fill = C.sky;
    }
    addText(s, "完整 URL 在 speaker notes 与同目录 CSV；动态价格建议 9 月上旬、出发前 7 天复核。", { left: 72, top: 684, width: 1120, height: 20 }, { fontSize: 12, color: C.muted });
    setNotes(s, "本页为证据表摘要；完整 URL 见 speaker notes 与同目录 CSV。", sources.map((x) => x[0]));
  }

  // 14 booking workflow
  {
    const s = p.slides.add(); s.background.fill = C.bg; addPageChrome(s, 14); addTitle(s, "落地流程：先锁不可逆资源，再按实时路况微调路线", "把“计划 / 报价 / 订单 / 到店确认”四种状态分开");
    const labels = [
      ["现在", "选路线", "确定 10/5 还是 10/6\n确定贵州 / 内蒙古"],
      ["出发前 45–30 天", "锁交通", "比机票 / 高铁\n优先可退或可改"],
      ["出发前 30–20 天", "锁租车", "车型、保险、超公里\n异地还车资格"],
      ["出发前 20–10 天", "锁酒店", "景区房少就改住城市基地\n保留取消窗口"],
      ["出发前 7 天", "复核", "天气、路况、营业\n小红书近期笔记"],
      ["出发当天", "执行", "早入景区\n动态避堵 / 备用餐馆"],
    ];
    const nodes = [];
    labels.forEach((item, i) => {
      const x = 76 + i * 190;
      const box = addBox(s, { left: x, top: 250, width: 160, height: 190 }, i === 5 ? C.orange : C.paper, i === 5 ? C.orange : C.line, "rounded-xl", `flow-${i + 1}`);
      nodes.push(box);
      addText(s, item[0], { left: x + 16, top: 274, width: 128, height: 24 }, { fontSize: 15, bold: true, color: i === 5 ? C.paper : C.orange, alignment: "center" });
      addText(s, item[1], { left: x + 14, top: 312, width: 132, height: 34 }, { fontSize: 20, bold: true, color: i === 5 ? C.paper : C.ink, alignment: "center" });
      addText(s, item[2], { left: x + 14, top: 364, width: 132, height: 56 }, { fontSize: 14, color: i === 5 ? C.paper : C.muted, alignment: "center" });
    });
    for (let i = 0; i < nodes.length - 1; i += 1) {
      s.shapes.connect(nodes[i], nodes[i + 1], { kind: "straight", fromSide: "right", toSide: "left", line: { style: "solid", fill: C.orange, width: 3 }, head: { type: "arrow", width: "sm", length: "sm" } });
    }
    addBox(s, { left: 72, top: 514, width: 1136, height: 108 }, C.sand, C.sand, "rounded-xl");
    addText(s, "必要的人工复核", { left: 98, top: 540, width: 190, height: 26 }, { fontSize: 18, bold: true, color: C.ink });
    addText(s, "小红书原文、国庆营业、景区分时预约、酒店停车/接驳、租车保险与异地还车费，都不要仅凭搜索摘要下结论。", { left: 300, top: 534, width: 850, height: 48 }, { fontSize: 16, color: C.ink });
    setNotes(s, "流程图为可编辑形状；建议把最终订单号、酒店确认电话、租车合同条款补进 PPT 备注。", ["S01", "S07", "S08", "S17", "S18", "S20", "S37", "S41"]);
  }

  // 15 final decision
  {
    const s = p.slides.add(); s.background.fill = C.ink; addPageChrome(s, 15, "国庆自驾研究 · 下一步");
    addText(s, "下一步只需要做一个选择", { left: 72, top: 108, width: 720, height: 54 }, { fontSize: 38, bold: true, color: C.paper });
    addRule(s, 72, 184, 122, C.orange, 6);
    addText(s, "你能不能把返程放到 10 月 6 日？", { left: 72, top: 230, width: 720, height: 72 }, { fontSize: 30, bold: true, color: C.orange });
    addBox(s, { left: 72, top: 356, width: 500, height: 160 }, C.orange, C.orange, "rounded-2xl");
    addText(s, "能 → 贵州舒适环线\n现在就按 7 晚去锁贵阳 / 兴义 / 织金住宿", { left: 106, top: 400, width: 430, height: 76 }, { fontSize: 22, bold: true, color: C.paper });
    addBox(s, { left: 620, top: 356, width: 588, height: 160 }, C.blue, C.blue, "rounded-2xl");
    addText(s, "不能 → 贵州高强度版 / 呼和浩特稳妥线\n优先锁交通，再决定住景区还是住城市基地", { left: 654, top: 400, width: 520, height: 76 }, { fontSize: 21, bold: true, color: C.paper });
    addText(s, "报告文件：PPTX 可编辑版 + CSV 证据表\n查询基准日：2026-08-03 · 动态价格请在下单前复核", { left: 72, top: 600, width: 820, height: 56 }, { fontSize: 16, color: C.sand });
    setNotes(s, "收尾：请根据返程日做路线分叉。报告没有把动态报价和小红书原文不可读部分伪装成已确认事实。", ["S17", "S18", "S37", "S41"]);
  }

  const pptx = await PresentationFile.exportPptx(p);
  await pptx.save(FINAL);
  const montage = await p.export({ format: "webp", montage: true, scale: 1 });
  await writeBlob(`${TMP}/deck-montage.webp`, montage);
  for (const [idx, slide] of p.slides.items.entries()) {
    const png = await p.export({ slide, format: "png", scale: 1 });
    await writeBlob(`${TMP}/slide-${String(idx + 1).padStart(2, "0")}.png`, png);
    const layout = await slide.export({ format: "layout" });
    await writeText(`${TMP}/slide-${String(idx + 1).padStart(2, "0")}.layout.json`, await layout.text());
  }
  const header = "类型,项目,价格或评分,备注,来源\n";
  const csvEscape = (v) => `"${String(v).replaceAll('"', '""')}"`;
  await writeText(CSV, header + evidence.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n\n来源编号,来源名称,URL,来源说明\n" + sources.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n");
  await writeText(`${TMP}/source-notes.txt`, sources.map((r) => `${r[0]}\t${r[1]}\t${r[2]}\t${r[3]}`).join("\n"));
  console.log(JSON.stringify({ final: FINAL, csv: CSV, slides: p.slides.items.length, montage: `${TMP}/deck-montage.webp` }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
