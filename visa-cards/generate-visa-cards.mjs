import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { remainingCountries } from "./remaining-countries.mjs";
import { enrichCountries } from "./application-guides.mjs";
import { expansionCountries, expansionGuides } from "./expansion-countries.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const VERIFIED = "2026-07-28";

const c = (title, answer, bullets, sourceIds, tone = "standard") => ({
  title, answer, bullets, sourceIds, tone
});

const countries = enrichCountries([
  {
    slug: "美国签证-乔大帅",
    code: "US",
    flag: "🇺🇸",
    country: "美国",
    topic: "B1/B2 访客签证",
    accent: "#d95f2a",
    secondary: "#18334f",
    pattern: "LIBERTY / 01",
    policyEffective: "2025-09-30",
    officialUpdated: "2026-05-01",
    verified: VERIFIED,
    nextReview: "2026-08-04",
    fields: {
      passport: "中国普通护照",
      purpose: "短期旅游、探亲或符合规定的商务访问",
      stay: "由入境口岸 CBP 决定",
      cumulative: "无统一累计天数；不得借访客身份长期居留",
      visa: "需要，通常申请 B2 或 B1/B2",
      arrivalCard: "按承运人与入境口岸要求",
      fee: "签证申请费 US$185；EVUS 新登记 US$30",
      processing: "面谈排期因地点、季节和类别而变",
      districtException: "非移民签证面谈原则上在国籍国或居住国预约",
      risk: "高"
    },
    sources: [
      { id: "visitor", label: "美国国务院｜Visitor Visa", url: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html", pageDate: "2026-05-01" },
      { id: "ds160", label: "美国国务院｜DS-160", url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/forms/ds-160-online-nonimmigrant-visa-application.html", pageDate: "2026-05-01" },
      { id: "evus", label: "EVUS 官方网站", url: "https://www.evus.gov/", pageDate: "2025-09-30" },
      { id: "wait", label: "美国国务院｜面谈等待时间", url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/wait-times.html", pageDate: "2026-07-28" }
    ],
    cards: [
      c("中国护照去美国，要办什么签证？", "短期旅游通常办 B2 或 B1/B2", ["B2：旅游、探亲、医疗等访问", "B1/B2：同时覆盖合规商务与旅游访问", "签证不保证入境，最终由口岸决定"], ["visitor"]),
      c("B1、B2、B1/B2 怎么选？", "看真实目的，不按“更容易过”来选", ["纯旅游通常对应 B2", "兼有合规商务活动可选 B1/B2", "不能用访客签证在美就业或长期学习"], ["visitor"]),
      c("申请前先判断什么？", "核心是临时访问目的与按期离境约束", ["行程目的要具体、真实、可解释", "准备资金来源和国内约束证明", "不要先买不可退改行程赌出签"], ["visitor"]),
      c("DS-160 怎么填不容易出错？", "按护照与真实经历逐项填写", ["保存 Application ID，及时备份", "工作、教育、旅行史保持时间线一致", "提交后打印确认页，面谈要带"], ["ds160"]),
      c("账户、缴费与预约顺序", "DS-160 → 缴费 → 预约 → 准备面谈", ["签证申请费为 US$185，通常不退", "预约平台只用使领馆指向的官方入口", "每位申请人都要有独立 DS-160"], ["visitor", "ds160"]),
      c("面谈城市和排期怎么看？", "按国籍国或居住国预约，并查实时等待时间", ["不同城市排期可能不同", "等待时间只是估算，不是承诺", "2026 加急试点不等于全国通用"], ["wait"]),
      c("面谈必带什么？", "护照、DS-160 确认页、缴费凭证、合规照片", ["护照通常需覆盖预计停留期后至少 6 个月", "辅助材料围绕目的、资金和回国约束", "材料多不等于更有说服力"], ["visitor"]),
      c("面谈常问什么？", "为什么去、去多久、谁付钱、为什么会回来", ["答案与 DS-160 保持一致", "短句回答，缺什么就如实说明", "不背模板，不编邀请人或收入"], ["visitor"]),
      c("行政审查、通过、拒签怎么办？", "三种状态都以官方通知为准", ["行政审查可能要求补材料或等待", "通过后仍等护照返还再定不可退行程", "拒签不等于永久禁止，可在情况变化后重申"], ["visitor"], "risk"),
      c("拿到护照先检查什么？", "姓名、护照号、签证类别、有效期、Entries", ["发现错误及时联系签发使领馆", "有效期不等于每次可停留天数", "旧护照有有效签证时先查官方携带规则"], ["visitor"]),
      c("10 年 B 类签证还差一步", "出发前完成有效 EVUS 登记", ["每两年或换新护照/新签证时重新登记", "自 2025-09-30 起新登记收费 US$30", "只认 evus.gov，警惕高价代填站"], ["visitor", "evus"], "risk"),
      c("美国官方来源与核验记录", "四个入口足够覆盖申请、排期与 EVUS", ["政策生效、页面更新、人工核验日期分开记录", "每周扫描费用、预约和 EVUS 变化", "任何“包过率”都不是官方信息"], ["visitor", "ds160", "evus", "wait"])
    ]
  },
  {
    slug: "英国签证-乔大帅",
    code: "GB",
    flag: "🇬🇧",
    country: "英国",
    topic: "Standard Visitor",
    accent: "#d76b36",
    secondary: "#243a57",
    pattern: "BORDER / 02",
    policyEffective: "2026-04-08",
    officialUpdated: "2026-07-01",
    verified: VERIFIED,
    nextReview: "2026-08-28",
    fields: {
      passport: "中国普通护照",
      purpose: "旅游、探亲及其他获准的短期访问活动",
      stay: "通常每次最多 6 个月",
      cumulative: "长期签证不等于可在英国长期居住",
      visa: "需要 Standard Visitor visa",
      arrivalCard: "按英国边境与承运人要求",
      fee: "6 个月短期访问签证 £135",
      processing: "完成身份核验和递交材料后通常约 3 周",
      districtException: "签证中心服务与可选付费项目以预约页面为准",
      risk: "中高"
    },
    sources: [
      { id: "overview", label: "GOV.UK｜Standard Visitor", url: "https://www.gov.uk/standard-visitor", pageDate: "2026-07-01" },
      { id: "apply", label: "GOV.UK｜申请流程", url: "https://www.gov.uk/standard-visitor/apply-standard-visitor-visa", pageDate: "2026-07-01" },
      { id: "docs", label: "GOV.UK｜支持文件", url: "https://www.gov.uk/government/publications/visitor-visa-guide-to-supporting-documents", pageDate: "2026-07-01" },
      { id: "fees", label: "GOV.UK｜2026 费用表", url: "https://www.gov.uk/government/publications/visa-regulations-revised-table/home-office-immigration-and-nationality-fees-8-april-2026", pageDate: "2026-03-18" }
    ],
    cards: [
      c("去英国旅游办什么？", "中国普通护照通常申请 Standard Visitor visa", ["适用于旅游、探亲及部分获准活动", "通常每次停留最多 6 个月", "签证获批仍需通过边境检查"], ["overview"]),
      c("开始申请前先做三件事", "核对目的、资格与是否需要签证", ["列出具体行程与预计费用", "确认资金来源和回国安排", "最早通常可提前 3 个月申请"], ["overview", "apply"]),
      c("在线申请怎么走？", "填表 → 付费 → 预约签证中心 → 递交材料", ["每位同行者单独申请", "信息必须与护照和证明材料一致", "保存申请编号与付款记录"], ["apply"]),
      c("资金材料看什么？", "重点是来源合理、余额与行程匹配", ["银行流水要能解释收入与大额进账", "资助人需说明关系和承担范围", "不是余额越高越好，而是证据链一致"], ["docs"]),
      c("中文材料要翻译吗？", "非英文或威尔士文材料通常需完整翻译", ["译文应准确对应原件", "包含译者确认、日期、姓名与联系方式", "不要只翻关键句或自行删减"], ["docs"]),
      c("录指纹和递交材料", "按预约到签证申请中心完成身份核验", ["带护照及预约要求的文件", "扫描、快递等增值服务不等于加快审理", "以预约中心当日规则为准"], ["apply"]),
      c("2026 申请费是多少？", "短期 6 个月 Standard Visitor 为 £135", ["2026-04-08 起执行新费率", "拒签或获批更短有效期通常不退款", "增值服务另计且并非必须"], ["fees", "apply"]),
      c("多久能出结果？", "官方通常写约 3 周，不是固定出签日", ["从完成身份核验和递交文件后计算", "补件或复杂审查可能更久", "未拿到护照前避免不可退改支出"], ["apply"]),
      c("长期访问签证的误区", "2/5/10 年有效，不等于可长期住英国", ["每次停留仍受许可限制，通常最多 6 个月", "频繁、连续长住可能被质疑访问目的", "签证有效期与准许停留期分开看"], ["overview"]),
      c("英国官方来源与核验记录", "只跟 GOV.UK 的规则、费用与材料指南", ["费用生效日：2026-04-08", "官方页面日与本页核验日分别显示", "每月复核，费用调整期加密扫描"], ["overview", "apply", "docs", "fees"])
    ]
  },
  {
    slug: "澳大利亚签证-乔大帅",
    code: "AU",
    flag: "🇦🇺",
    country: "澳大利亚",
    topic: "Visitor visa 600",
    accent: "#d97837",
    secondary: "#173e52",
    pattern: "SOUTH / 03",
    policyEffective: "2026-07-01",
    officialUpdated: "2026-07-01",
    verified: VERIFIED,
    nextReview: "2026-08-28",
    fields: {
      passport: "中国普通护照",
      purpose: "旅游、邮轮、探亲访友",
      stay: "批准信可能给 3、6 或 12 个月；通常为 3 个月",
      cumulative: "以签证批准信的有效期、入境次数和条件为准",
      visa: "通常申请 Visitor visa subclass 600 Tourist stream",
      arrivalCard: "按澳大利亚边境当期要求",
      fee: "境外 Tourist stream 自 AUD250 起",
      processing: "使用官方 Processing Times Guide 动态查询",
      districtException: "可能被要求体检或采集生物信息",
      risk: "中高"
    },
    sources: [
      { id: "600", label: "Home Affairs｜Visitor 600", url: "https://immi.homeaffairs.gov.au/Visa-subsite/Pages/visit/600-visitor-landing.aspx", pageDate: "2026-07-01" },
      { id: "tourist", label: "Home Affairs｜Tourist stream", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600/tourist-stream-overseas", pageDate: "2026-07-01" },
      { id: "immi", label: "ImmiAccount", url: "https://online.immi.gov.au/lusc/login", pageDate: "2026-07-28" },
      { id: "times", label: "Home Affairs｜Processing times", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-processing-times/global-visa-processing-times", pageDate: "2026-07-28" }
    ],
    cards: [
      c("中国护照去澳洲办什么？", "旅游通常申请 600 类 Tourist stream", ["适用于旅游、邮轮、探亲访友", "人在澳洲境外申请与等待决定", "不能工作，可短期学习不超过 3 个月"], ["600", "tourist"]),
      c("600 签证能待多久？", "以批准信为准，可能是 3、6 或 12 个月", ["官方说明通常批准 3 个月停留", "可能单次或多次入境", "签证有效期不等于每次停留期"], ["600", "tourist"]),
      c("什么叫“真实访客”？", "目的临时、资金足够、愿意按期离境", ["行程与个人情况相匹配", "说明工作、家庭或学业等回国约束", "不要制造虚假邀请或流水"], ["600", "tourist"]),
      c("ImmiAccount 申请顺序", "建账户 → 填表 → 上传材料 → 付款 → 跟进通知", ["只用 immi.homeaffairs.gov.au 官方域名", "保存 TRN 与提交回执", "家庭成员通常各自提交申请"], ["immi", "tourist"]),
      c("材料怎么组织？", "按身份、资金、行程、约束四组上传", ["护照与旅行历史清晰扫描", "流水标出工资和大额进账来源", "文件名写清内容、日期和申请人"], ["tourist"]),
      c("体检和生物信息", "不是人人固定要求，以账户通知为准", ["收到要求后按指定机构与期限完成", "不要自行提前做不匹配的检查", "未完成要求可能影响决定"], ["tourist"]),
      c("费用与处理时间", "境外 Tourist stream 自 AUD250 起，时间动态变化", ["费用以付款页的 Visa Pricing Estimator 为准", "处理时间工具是近期案例指南，不是承诺", "材料不完整可能导致延误"], ["tourist", "times"]),
      c("批准信到手看什么？", "看有效期、入境次数、每次停留和附加条件", ["记录 must not arrive after 日期", "检查 8101 不得工作等条件", "电子签通常不贴签，随身存批准信"], ["tourist"]),
      c("入境时准备什么？", "护照、批准信、返程安排、住宿与资金证明", ["签证获批不等于保证入境", "回答与申请信息保持一致", "如实申报食品、药品和受管制物品"], ["tourist"]),
      c("澳洲官方来源与核验记录", "申请、费用、时效都回到 Home Affairs", ["停留期以个人批准信为最终依据", "处理时间每次出发前重查", "每月复核政策与费用"], ["600", "tourist", "immi", "times"])
    ]
  },
  {
    slug: "韩国签证-乔大帅",
    code: "KR",
    flag: "🇰🇷",
    country: "韩国",
    topic: "C-3-9 一般观光",
    accent: "#dc653d",
    secondary: "#283b67",
    pattern: "SEOUL / 04",
    policyEffective: "2026-06-01",
    officialUpdated: "2026-07-14",
    verified: VERIFIED,
    nextReview: "2026-08-04",
    fields: {
      passport: "中国普通护照",
      purpose: "一般观光",
      stay: "以签证页或签发确认书为准",
      cumulative: "按签证有效期、入境次数和停留资格执行",
      visa: "一般观光通常为 C-3-9",
      arrivalCard: "按韩国入境部门当期要求",
      fee: "按签证类别、领区及签证中心通知",
      processing: "领区差异明显；广州一般观光标示 10 个工作日内，上海自 2026-07-13 起最长约 20 个工作日",
      districtException: "必须按常住地所属使领馆/签证中心核验",
      risk: "高"
    },
    sources: [
      { id: "embassy", label: "韩国驻华使馆｜签证材料", url: "https://overseas.mofa.go.kr/cn-zh/brd/m_1201/view.do?page=1&seq=695439", pageDate: "2026-07-14" },
      { id: "visa", label: "Korea Visa Portal", url: "https://www.visa.go.kr/", pageDate: "2026-07-28" },
      { id: "shanghai", label: "韩国驻上海总领馆｜C-3-9 审理时间调整公告", url: "https://overseas.mofa.go.kr/cn-shanghai-zh/brd/m_492/view.do?seq=760835", pageDate: "2026-07-06" },
      { id: "guangzhou", label: "韩国驻广州总领馆｜VISA", url: "https://overseas.mofa.go.kr/cn-guangzhou-zh/wpge/m_91/contents.do", pageDate: "2026-06-01" }
    ],
    cards: [
      c("去韩国自由行办什么？", "一般观光通常对应 C-3-9", ["适用短期旅游，不等于工作或留学许可", "具体有效期和停留期看签发结果", "特殊免签或团签须另查当期条件"], ["embassy"]),
      c("第一步不是准备流水", "先确认常住地所属领区", ["不同使领馆受理对象可能不同", "材料、预约、费用、时效均可能有差异", "不要拿其他领区清单直接照抄"], ["embassy", "shanghai"], "risk"),
      c("电子申请表怎么填？", "以 Visa Portal 和领区通知为准", ["姓名拼音、护照号逐字核对", "旅行目的与行程一致", "打印、签字要求按受理机构执行"], ["visa"]),
      c("从哪里递交？", "多数普通申请转由所属签证申请中心受理", ["先看使领馆最新公告", "外交、公务或紧急人道情况可能另有渠道", "只用官方指向的中心入口"], ["embassy"]),
      c("基础材料怎么分组？", "身份、申请表、行程、资金与在职/在学证明", ["领区清单优先于通用攻略", "提交复印件时核对是否需原件", "被要求补件会延长审理"], ["embassy"]),
      c("领区差异有多大？", "可能直接影响受理资格与审理时间", ["上海自 2026-07-13 起 C-3-9 最长约 20 个工作日", "广州一般观光标示 10 个工作日内", "每次提交前重开本领区公告"], ["shanghai", "guangzhou"], "risk"),
      c("团签、济州或过境免签", "都是有条件例外，不能等同全国自由行免签", ["核对出发地、目的地、路线和团队资格", "任一条件不符就按普通签证准备", "不要购买所谓“口岸包过”服务"], ["embassy"]),
      c("进度和签发结果怎么查？", "在 Korea Visa Portal 查询", ["按系统要求输入护照与英文姓名", "签发确认书信息要逐项核对", "状态更新不等于已拿到全部旅行文件"], ["visa"]),
      c("入境申报与随身材料", "按出发时的韩国官方入境规则办理", ["随身带返程票、住宿、行程与资金证明", "签证不保证入境", "回答与申请用途一致"], ["visa"]),
      c("韩国官方来源与核验记录", "总则看使馆，落地必须看所属领区", ["每周扫描北京、上海及申请人领区公告", "审理时间只能写“官方标示”，不能承诺", "页面日期与人工核验日期分开"], ["embassy", "shanghai", "guangzhou", "visa"])
    ]
  },
  {
    slug: "日本签证-乔大帅",
    code: "JP",
    flag: "🇯🇵",
    country: "日本",
    topic: "个人旅游签 / eVISA",
    accent: "#df633e",
    secondary: "#26374a",
    pattern: "NIPPON / 05",
    policyEffective: "2026-05-15",
    officialUpdated: "2026-07-01",
    verified: VERIFIED,
    nextReview: "2026-08-04",
    fields: {
      passport: "中国普通护照，且居住在中国境内",
      purpose: "短期观光旅游",
      stay: "eVISA 通常签发 15 日或 30 日停留期",
      cumulative: "以具体签证有效期、入境次数和签发通知为准",
      visa: "需要；旅游签须经所属领区指定旅行社办理",
      arrivalCard: "按 Visit Japan Web / 日本入境当期要求",
      fee: "使领馆签证费与旅行社服务费分开，以当期通知为准",
      processing: "由指定旅行社与所属使领馆通知，不承诺固定日期",
      districtException: "按常住地所属使领馆及指定旅行社办理",
      risk: "高"
    },
    sources: [
      { id: "evisa", label: "日本外务省｜JAPAN eVISA", url: "https://www.mofa.go.jp/j_info/visit/visa/visaonline.html", pageDate: "2026-05-15" },
      { id: "china", label: "日本驻华使馆｜赴日旅游签证", url: "https://www.cn.emb-japan.go.jp/consular/visa_dantai.htm", pageDate: "2026-07-01" },
      { id: "agency", label: "日本驻华使馆｜指定旅行社", url: "https://www.cn.emb-japan.go.jp/itpr_zh/visa_dantai_daili.html", pageDate: "2025-05-09" },
      { id: "vjw", label: "Visit Japan Web", url: "https://www.vjw.digital.go.jp/", pageDate: "2026-07-28" }
    ],
    cards: [
      c("中国护照去日本免签吗？", "不免签，短期观光要先办旅游签", ["适用：中国境内居住的中国普通护照", "旅游签通常通过所属领区指定旅行社办理", "不能直接拿攻略去使领馆个人递交"], ["china", "agency"]),
      c("2026 日本 eVISA 新变化", "中国境内申请人可经指定代理办理电子旅游签", ["政策自 2026-05-15 起适用", "只适用于短期观光等规定范围", "不是申请人绕过旅行社自行直申"], ["evisa", "china"]),
      c("电子签能待多久？", "中国境内申请人通常签发 15 日或 30 日", ["实际以 Visa issuance notice 为准", "停留期不等于签证可使用窗口", "是否单次/多次看具体签发结果"], ["evisa"]),
      c("单次、多次怎么选？", "按真实出行频率与领区条件申请", ["多次签不代表每次可无限停留", "不同类型材料和资格可能不同", "旅行社“推荐”不能代替官方条件"], ["china"]),
      c("先找哪家代理机构？", "只找所属使领馆公布的指定旅行社", ["先确认常住地领区", "核对机构名称与官方名单", "使领馆费用与代办服务费分开问清"], ["agency"], "risk"),
      c("材料怎么准备？", "以所属领区与指定旅行社最新清单为准", ["护照、申请表、照片与身份材料", "行程、住宿、资金和在职/在学证明按要求提交", "信息要与真实旅行计划一致"], ["china", "agency"]),
      c("电子签在机场怎么出示？", "必须联网打开 Visa issuance notice", ["截图不接受", "PDF 不接受", "打印件不能代替在线展示"], ["evisa"], "risk"),
      c("出发前还要做什么？", "核对签证、护照、航班住宿与入境申报", ["建议在 Visit Japan Web 准备入境信息", "确认手机可联网并能登录 eVISA", "随身带返程和住宿等证明"], ["evisa", "vjw"]),
      c("拿到签证先核对什么？", "姓名、护照号、有效期、停留期与入境次数", ["错字要及时通过代办机构处理", "签证签发不保证入境", "不要把“15/30 日”写成统一有效期"], ["evisa", "china"]),
      c("日本官方来源与核验记录", "外务省定规则，驻华使领馆定中国申请路径", ["政策生效：2026-05-15", "驻华旅游签页面：2026-07-01", "每周扫描 eVISA、代理名单和领区通知"], ["evisa", "china", "agency", "vjw"])
    ]
  },
  {
    slug: "泰国免签-乔大帅",
    code: "TH",
    flag: "🇹🇭",
    country: "泰国",
    topic: "中泰互免 + TDAC",
    accent: "#e06d31",
    secondary: "#293558",
    pattern: "SIAM / 06",
    policyEffective: "2024-03-01",
    officialUpdated: "2026-05-19",
    verified: VERIFIED,
    nextReview: "2026-08-04",
    fields: {
      passport: "有效中国普通护照",
      purpose: "短期旅游及协议允许的访问",
      stay: "每次不超过 30 天",
      cumulative: "任意 180 天累计不超过 90 天",
      visa: "符合条件可免签",
      arrivalCard: "需要 TDAC，抵达前 3 天内提交",
      fee: "免签本身无签证费；TDAC 官方提交免费",
      processing: "入境现场审核，无“包入境”",
      districtException: "居留、就业、学习、媒体等活动须事先获批",
      risk: "高"
    },
    sources: [
      { id: "agreement", label: "泰国外交部｜中泰互免协议", url: "https://www.mfa.go.th/en/content/thcn280124", pageDate: "2024-01-28" },
      { id: "revision", label: "泰国领事司｜2026 免签调整", url: "https://consular.mfa.go.th/th/content/20-5-69-0000", pageDate: "2026-05-19" },
      { id: "tdac", label: "泰国移民局｜TDAC 中文指南", url: "https://tdac.immigration.go.th/manual/cn/index.html", pageDate: "2026-07-28" },
      { id: "tdacform", label: "TDAC 官方入口", url: "https://tdac.immigration.go.th/", pageDate: "2026-07-28" }
    ],
    cards: [
      c("中国护照去泰国免签吗？", "可以，但不是无限停留", ["适用有效中国普通护照", "每次停留不超过 30 天", "任意 180 天累计不超过 90 天"], ["agreement"]),
      c("为什么不是 60 天？", "中国按中泰双边协议执行 30/90/180", ["2026 调整的是一般免签框架", "中国仍列在双边协议 30 天组", "别把旧版“60 天免签”写进新攻略"], ["agreement", "revision"], "risk"),
      c("30/90/180 怎么算？", "单次 ≤30 天，同时滚动 180 天内合计 ≤90 天", ["不是离境一次就自动清零", "多次短住要自己核算累计天数", "最终以泰国移民部门认定为准"], ["agreement"]),
      c("TDAC 什么时候填？", "所有非泰国旅客抵达前 3 天内提交", ["陆路、空路、海路入境都适用", "填写护照、行程、住宿等信息", "资料变化时用官方入口更新"], ["tdac"]),
      c("TDAC 只认哪个网站？", "只认 tdac.immigration.go.th", ["官方提交不收代填费", "警惕搜索广告和仿冒收费站", "不要向非官方页面上传护照资料"], ["tdac", "tdacform"], "risk"),
      c("入境随身带什么？", "护照、返程/续程、住宿、资金与 TDAC 确认", ["免签不等于无条件入境", "行程和回答保持一致", "边检可要求进一步说明访问目的"], ["agreement", "tdac"]),
      c("免签不能做什么？", "不能借旅游免签居留、工作、学习或做媒体活动", ["这些活动需要事先取得相应批准", "所谓“落地后再洗身份”风险很高", "逾期停留会产生处罚与后续影响"], ["agreement"], "risk"),
      c("泰国官方来源与核验记录", "互免看外交部，入境卡看移民局", ["协议生效：2024-03-01", "2026 调整公告：2026-05-19", "每周扫描免签框架与 TDAC 系统"], ["agreement", "revision", "tdac", "tdacform"])
    ]
  },
  {
    slug: "马来西亚免签-乔大帅",
    code: "MY",
    flag: "🇲🇾",
    country: "马来西亚",
    topic: "30 天互免 + MDAC",
    accent: "#dd7438",
    secondary: "#1d4150",
    pattern: "STRAIT / 07",
    policyEffective: "2025-07-17",
    officialUpdated: "2025-12-01",
    verified: VERIFIED,
    nextReview: "2026-08-28",
    fields: {
      passport: "有效期至少 6 个月的中国普通护照",
      purpose: "旅游、商务或探亲等社会访问",
      stay: "每次不超过 30 天",
      cumulative: "任意 180 天累计不超过 90 天",
      visa: "符合条件可免签",
      arrivalCard: "需要 MDAC，行程须在提交日起 3 天内",
      fee: "免签与 MDAC 官方提交不收签证费",
      processing: "入境现场审核",
      districtException: "工作、学习或其他非社会访问目的需相应许可",
      risk: "中高"
    },
    sources: [
      { id: "faq", label: "马来西亚移民局｜中马互免 FAQ", url: "https://malaysiavisa.imi.gov.my/faq/", pageDate: "2025-12-01" },
      { id: "mdac", label: "马来西亚移民局｜MDAC", url: "https://imigresen-online.imi.gov.my/mdac/register", pageDate: "2026-07-28" },
      { id: "notice", label: "马来西亚移民局｜MDAC 公告", url: "https://www.imi.gov.my/index.php/en/pengumuman/malaysia-digital-arrival-card-mdac/", pageDate: "2026-07-28" }
    ],
    cards: [
      c("中国护照去马来西亚免签吗？", "可以，社会访问每次最多 30 天", ["适用普通或公务普通护照", "护照入境时至少还有 6 个月有效期", "旅游、商务、探亲等目的受协议覆盖"], ["faq"]),
      c("30/90/180 规则", "每次 ≤30 天，任意 180 天累计 ≤90 天", ["不是出境一次就清零", "频繁往返要自行累计", "实际准许停留以入境许可为准"], ["faq"]),
      c("MDAC 什么时候填？", "抵达日期须在提交日起 3 天内", ["填写护照、交通、住宿与联系方式", "出发日期变化时重新核对信息", "保存提交确认以便查验"], ["mdac"]),
      c("MDAC 官方入口", "只认 imigresen-online.imi.gov.my", ["从移民局官网进入最稳妥", "警惕收费代填与仿冒页面", "不要把护照资料交给陌生网站"], ["mdac", "notice"], "risk"),
      c("入境检查准备什么？", "护照、返程/续程、住宿、资金和 MDAC", ["免签不保证入境", "访问目的要与材料一致", "必要时证明可进入下一目的地"], ["faq", "mdac"]),
      c("免签能工作或留学吗？", "不能，工作和学习要办相应许可", ["社会访问不是就业许可", "不要接受“先入境再补证”的安排", "逾期或目的不符会影响后续入境"], ["faq"], "risk"),
      c("多次签与免签不是一回事", "协议免签不覆盖主动申请 MEV 的情形", ["每次免签仍受 30/90/180 限制", "需要其他身份或更长期限时另查签证", "不要混用 eVISA 旧规则"], ["faq"]),
      c("马来西亚官方来源与核验记录", "互免 FAQ 与 MDAC 都以移民局为准", ["协议生效：2025-07-17", "FAQ 页面更新：2025-12-01", "每月复核互免与入境卡入口"], ["faq", "mdac", "notice"])
    ]
  },
  {
    slug: "新加坡免签-乔大帅",
    code: "SG",
    flag: "🇸🇬",
    country: "新加坡",
    topic: "30 天互免 + SG Arrival Card",
    accent: "#df633d",
    secondary: "#1d3a49",
    pattern: "LION / 08",
    policyEffective: "2024-02-09",
    officialUpdated: "2026-06-01",
    verified: VERIFIED,
    nextReview: "2026-08-28",
    fields: {
      passport: "有效期至少 6 个月的中国普通护照",
      purpose: "短期旅游及符合规定的访问",
      stay: "免签最多 30 天；实际以入境签发的 e-Pass 为准",
      cumulative: "没有“出境即自动再给 30 天”的保证",
      visa: "符合条件可免签",
      arrivalCard: "需要 SG Arrival Card，抵达前 3 天内提交",
      fee: "SG Arrival Card 官方提交免费",
      processing: "入境现场决定是否准许及停留期限",
      districtException: "延期仅可在现有 STVP 剩余 14 天或更少时在线申请",
      risk: "中高"
    },
    sources: [
      { id: "waiver", label: "ICA｜中新 30 天互免", url: "https://www.ica.gov.sg/news-and-publications/newsroom/media-release/mutual-30-day-visa-exemption-arrangement-between-singapore-and-the-people-s-republic-of-china", pageDate: "2024-01-25" },
      { id: "entry", label: "ICA｜Entering Singapore", url: "https://www.ica.gov.sg/enter-transit-depart/entering-singapore", pageDate: "2026-06-01" },
      { id: "sgac", label: "ICA｜SG Arrival Card", url: "https://www.ica.gov.sg/enter-transit-depart/entering-singapore/sg-arrival-card", pageDate: "2026-07-28" },
      { id: "extend", label: "ICA｜延期 STVP", url: "https://www.ica.gov.sg/enter-transit-depart/extend-stay", pageDate: "2026-03-01" }
    ],
    cards: [
      c("中国护照去新加坡免签吗？", "可以，协议上限为 30 天", ["适用中国普通护照", "互免自 2024-02-09 生效", "最终停留期限看入境签发的 e-Pass"], ["waiver", "entry"]),
      c("免签 30 天不是保证 30 天", "是否准入、给几天都由 ICA 口岸决定", ["准备返程/续程、住宿与足够资金", "入境许可与签证有效期是两回事", "收到 e-Pass 后核对最后可停留日"], ["entry"], "risk"),
      c("SG Arrival Card 什么时候填？", "抵达前 3 天内提交，包含抵达当天", ["提交旅行资料和健康申报", "所有外籍旅客通常都需办理，除官方列明例外", "使用真实有效邮箱接收 e-Pass"], ["entry", "sgac"]),
      c("SG Arrival Card 收费吗？", "官方服务免费，而且它不是签证", ["只用 ICA 官网或 MyICA 应用", "警惕搜索广告中的收费仿冒站", "不要在非官方页面上传护照"], ["sgac"], "risk"),
      c("入境随身材料", "护照、返程/续程、住宿、资金和 SGAC 确认", ["护照通常至少 6 个月有效", "需要时证明可进入下一目的地", "访问目的与回答保持一致"], ["entry"]),
      c("能工作或做生意吗？", "短期访问准证下不得从事未经许可的工作", ["包括有偿或无偿就业", "获准的商务访问活动不等于就业", "需要工作准证时应提前办理"], ["extend"], "risk"),
      c("想延期怎么办？", "STVP 剩余 14 天或更少时才可在线申请", ["延期不是自动批准", "ICA 会综合个案情况决定", "在结果出来前仍须遵守现有离境日期"], ["extend"]),
      c("新加坡官方来源与核验记录", "互免、入境卡、e-Pass 和延期都只看 ICA", ["协议生效：2024-02-09", "Entering Singapore 页面：2026-06-01", "每月复核入境要求与防钓鱼提醒"], ["waiver", "entry", "sgac", "extend"])
    ]
  },
  ...remainingCountries,
  ...expansionCountries
], expansionGuides);

const template = (data) => `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${data.country}${data.topic}｜qdd.app · 乔大帅 中国护照出境说明书</title>
<meta name="description" content="${data.country}${data.topic}可编辑政策卡片，由 qdd.app · 乔大帅整理。">
<style>
:root{--ink:#122234;--paper:#f2ead8;--cream:#fffaf0;--orange:${data.accent};--navy:${data.secondary};--danger:#b52d2a;--muted:#68717b;--ui:#111d2c}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#d8d4cc;color:var(--ink)}
body{font-family:"Songti SC","STSong","Noto Serif CJK SC",serif;background:radial-gradient(circle at 14% 0,#f0e8d8 0,transparent 28rem),#d7d3cb}
button,select,input{font:inherit}.app{display:grid;grid-template-columns:320px minmax(0,1fr);min-height:100vh}
.panel{position:sticky;top:0;height:100vh;overflow:auto;background:var(--ui);color:#f8f1e4;padding:24px 20px;border-right:1px solid #314054}
.brand{font-family:"Kaiti SC","STKaiti",serif;font-size:22px;line-height:1.25;margin:0}.en{font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#e69c70;margin:7px 0 26px}
.label{font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;color:#9eacba;margin:18px 0 7px;text-transform:uppercase}
.control,.btn{width:100%;border:1px solid #415067;border-radius:3px;background:#172538;color:#fff;padding:10px 12px}.btn{cursor:pointer;margin:5px 0;text-align:left;transition:.18s}.btn:hover{background:#253750;border-color:#e69c70}.btn.primary{background:var(--orange);border-color:var(--orange);font-weight:700}.btn.danger{color:#ffc9c4}
.status{font:12px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;color:#aeb9c5;min-height:42px;margin-top:12px}.card-list{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.card-jump{border:1px solid #40506a;background:#172538;color:#fff;padding:8px 0;cursor:pointer}.card-jump.active{background:var(--orange);border-color:var(--orange)}
.workspace{min-width:0;padding:34px}.workspace-head{max-width:1100px;margin:0 auto 20px;display:flex;justify-content:space-between;align-items:end;gap:20px}.workspace-head h1{font:700 30px/1.1 "Kaiti SC","STKaiti",serif;margin:0}.workspace-head p{margin:5px 0 0;color:#5c6570}.counter{font:12px ui-monospace,SFMono-Regular,Menlo,monospace;color:#5d6570}
.stage{max-width:1100px;margin:auto;display:grid;place-items:center;min-height:calc(100vh - 145px);padding:20px;border:1px dashed #aaa294;background:#c9c5bd}
.passport-card{--cw:540px;--ch:720px;width:var(--cw);height:var(--ch);position:relative;overflow:hidden;background:var(--cream);box-shadow:0 24px 70px #41382d45;border:1px solid #c8bda9;display:flex;flex-direction:column}
.passport-card::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 49.7%,#b9ad9838 50%,transparent 50.3%),repeating-linear-gradient(0deg,transparent 0 38px,#1b39520c 39px 40px);pointer-events:none}
.passport-card::after{content:"${data.pattern}";position:absolute;right:-22px;top:116px;transform:rotate(90deg);font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.42em;color:#12314a35}
.card-head{height:116px;padding:24px 31px 17px;background:var(--navy);color:#fff;position:relative;display:grid;grid-template-columns:1fr auto;gap:15px}
.card-head::after{content:"";position:absolute;left:31px;right:31px;bottom:12px;border-bottom:1px dashed #f3e9d56b}.series{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#f1bc93}.country{font:700 31px/1.1 "Kaiti SC","STKaiti",serif;margin-top:7px}.flag{font-size:37px;filter:saturate(.88)}
.card-main{position:relative;z-index:1;flex:1;padding:35px 38px 20px;display:flex;flex-direction:column}.question{margin:0 0 19px;font:700 26px/1.3 "Kaiti SC","STKaiti",serif;outline:none}.answer{font:700 39px/1.13 "Songti SC","STSong",serif;color:var(--orange);letter-spacing:-.045em;margin:0 0 26px;outline:none;max-width:94%}
.rule{width:53px;border-top:5px solid var(--orange);margin:0 0 22px}.bullets{display:grid;gap:12px}.bullet{display:grid;grid-template-columns:17px 1fr;gap:8px;font-size:18px;line-height:1.55;outline:none}.bullet::before{content:"◆";color:var(--orange);font-size:9px;margin-top:8px}.risk .answer{color:var(--danger)}.risk .rule{border-color:var(--danger)}.risk .bullet::before{color:var(--danger)}
.verify{margin-top:auto;border-top:1px solid #bcb09c;padding-top:13px;display:grid;grid-template-columns:1fr auto;gap:15px;font:10px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:#5e646a}.verify b{color:var(--ink)}
.card-foot{position:relative;z-index:1;min-height:72px;background:#e8ddca;padding:12px 30px 10px;border-top:1px solid #cabda7;font-size:10px;line-height:1.48;color:#58606a}.foot-top{display:flex;justify-content:space-between;gap:15px}.page{font:700 16px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--orange)}.disclaimer{margin-top:4px}
.application-box{margin-top:20px;padding:13px;background:#efe7d7;border:1px solid #c9bda9;font-size:12px;line-height:1.6}.application-box h2{margin:0 0 7px;font:700 18px "Kaiti SC","STKaiti",serif}.application-box a{display:block;color:#184b71;text-decoration:underline;text-underline-offset:3px;margin:5px 0}.application-box ul{margin:8px 0 0;padding-left:18px;color:#59626b}.application-box small{display:block;margin-top:8px;color:#7b6a59;font-size:10px}
.sources{max-width:1100px;margin:18px auto 0;background:#f4eee3;border:1px solid #c4b9a8;padding:14px 18px}.sources summary{cursor:pointer;font-weight:700}.sources a{color:#184b71;word-break:break-all}.sources li{margin:8px 0;font-size:13px}
.passport-card[data-layout="x"]{--cw:800px;--ch:450px}.passport-card[data-layout="x"] .card-head{height:88px;padding:16px 26px}.passport-card[data-layout="x"] .country{font-size:25px}.passport-card[data-layout="x"] .card-main{padding:20px 30px 10px}.passport-card[data-layout="x"] .question{font-size:20px;margin-bottom:10px}.passport-card[data-layout="x"] .answer{font-size:31px;margin-bottom:13px}.passport-card[data-layout="x"] .rule{margin-bottom:11px;border-width:3px}.passport-card[data-layout="x"] .bullets{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 24px}.passport-card[data-layout="x"] .bullet{font-size:14px;line-height:1.4}.passport-card[data-layout="x"] .verify{padding-top:7px}.passport-card[data-layout="x"] .card-foot{min-height:54px;padding:7px 25px;font-size:8px}
.passport-card[data-layout="square"]{--cw:600px;--ch:600px}.passport-card[data-layout="square"] .answer{font-size:37px}.passport-card[data-layout="square"] .card-main{padding-top:28px}.passport-card[data-layout="square"] .bullet{font-size:16px}
.passport-card[data-layout="wechat"]{--cw:900px;--ch:383px}.passport-card[data-layout="wechat"] .card-head{height:76px;padding:12px 28px}.passport-card[data-layout="wechat"] .country{font-size:23px}.passport-card[data-layout="wechat"] .flag{font-size:27px}.passport-card[data-layout="wechat"] .card-main{padding:15px 30px 8px}.passport-card[data-layout="wechat"] .question{font-size:17px;margin-bottom:7px}.passport-card[data-layout="wechat"] .answer{font-size:29px;margin-bottom:9px}.passport-card[data-layout="wechat"] .rule{display:none}.passport-card[data-layout="wechat"] .bullets{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.passport-card[data-layout="wechat"] .bullet{font-size:12px;line-height:1.35}.passport-card[data-layout="wechat"] .verify{padding-top:5px}.passport-card[data-layout="wechat"] .card-foot{min-height:46px;padding:6px 27px;font-size:8px}.passport-card[data-layout="wechat"] .disclaimer{display:none}
@media(max-width:900px){.app{display:block}.panel{position:relative;height:auto}.workspace{padding:18px 8px}.stage{overflow:auto;justify-content:start}.workspace-head{padding:0 8px}.passport-card{transform-origin:top left}.sources{margin:14px 8px}}
@media print{.panel,.workspace-head,.sources{display:none}.app,.workspace,.stage{display:block;padding:0;background:#fff}.passport-card{box-shadow:none}}
/* Passport Desk editor refresh: keep the card tool consistent with qdd.app. */
:root{--ui:#10283f;--ui-2:#1c3b58;--paper:#f5f6f2;--line:#d9ded9;--soft:#edf1ed;--sans:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"SF Pro Display","PingFang SC","Microsoft YaHei",sans-serif}
html,body{background:var(--paper);color:var(--ink);font-family:var(--sans)}
body{background:radial-gradient(circle at 75% 0,rgba(239,131,84,.12),transparent 30rem),var(--paper)}
.app{grid-template-columns:300px minmax(0,1fr);gap:0}
.panel{padding:26px 21px;background:linear-gradient(165deg,var(--ui),#0d2135);border-right:0;box-shadow:12px 0 32px rgba(18,34,56,.08)}
.brand{font-family:var(--sans);font-size:19px;letter-spacing:-.03em}.en{color:#e9a47f}.label{margin-top:20px;color:#a8bac7}.control,.btn{border-radius:10px;padding:11px 12px;border-color:rgba(255,255,255,.16);background:rgba(255,255,255,.08)}
.btn{margin:5px 0;transition:transform .18s ease,background .18s ease,border-color .18s ease}.btn:hover{background:rgba(255,255,255,.15);border-color:var(--orange);transform:translateY(-1px)}.btn.primary{background:var(--orange);color:var(--ui)}
.card-list{gap:5px}.card-jump{border-radius:7px;padding:8px 0;border-color:rgba(255,255,255,.16);background:rgba(255,255,255,.08)}
.application-box{border-radius:13px;background:rgba(255,255,255,.96);border:0;color:var(--ink);box-shadow:0 12px 26px rgba(0,0,0,.12)}.application-box h2{font-family:var(--sans);font-size:16px}.application-box a{color:var(--ui-2);font-weight:700}.application-box small{color:#7b6a59}
.workspace{padding:32px;min-width:0}.workspace-head{max-width:1120px}.workspace-head h1{font-family:var(--sans);font-size:28px;letter-spacing:-.04em}.workspace-head p{color:#6b7b86}.counter{color:#71818b}
.stage{max-width:1120px;border:1px solid var(--line);border-radius:22px;background:#e9eeea;box-shadow:inset 0 0 0 1px rgba(255,255,255,.48);padding:34px;min-height:calc(100vh - 145px)}
.passport-card{border-radius:18px;box-shadow:0 22px 58px rgba(18,34,56,.17);border:1px solid rgba(18,34,56,.16)}
.card-head{border-radius:17px 17px 0 0}.card-main{font-family:var(--sans)}.question{font-family:var(--sans);font-size:24px}.answer{font-family:var(--sans);font-size:37px;letter-spacing:-.055em}.bullet{font-size:17px}.card-foot{border-radius:0 0 17px 17px}
.sources{border:1px solid var(--line);border-radius:13px;background:#fff;box-shadow:0 8px 24px rgba(18,34,56,.06)}.sources a{color:var(--ui-2)}
@media(max-width:900px){.workspace{padding:20px 12px}.stage{padding:20px;border-radius:16px}.workspace-head{display:block}.counter{margin-top:8px}.passport-card{border-radius:14px}}
</style>
</head>
<body>
<script id="visaData" type="application/json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
<div class="app">
  <aside class="panel">
    <h1 class="brand">qdd.app｜乔大帅出境说明书</h1>
    <p class="en">中国护照出境说明 · 人工核对版</p>
    <div class="label">平台尺寸</div>
    <select id="preset" class="control">
      <option value="xhs">小红书 / 公众号 1080×1440</option>
      <option value="x">X 横版 1200×675</option>
      <option value="square">方图 1080×1080</option>
      <option value="wechat">公众号头图 900×383</option>
    </select>
    <div class="label">卡片导航</div><div class="card-list" id="cardList"></div>
    ${data.application ? `<section class="application-box"><h2>${data.application.routeLabel}</h2><a href="${data.application.applicationUrl}" target="_blank" rel="noopener">${data.application.applicationLabel} ↗</a>${data.application.documentsUrl ? `<a href="${data.application.documentsUrl}" target="_blank" rel="noopener">官方材料清单 ↗</a>` : ""}<ul>${data.application.requiredDocuments.slice(0, 5).map(item => `<li>${item.required === false ? "按需" : "必看"}：${item.name}</li>`).join("")}</ul><small>成功率：${data.application.successRate.label}</small></section>` : ""}
    <div class="label">导出</div>
    <button class="btn primary" id="downloadOne">下载此卡 PNG</button>
    <button class="btn" id="downloadAll">下载全部 PNG</button>
    <button class="btn" id="saveHtml">保存修改后的 HTML</button>
    <button class="btn" id="exportJson">导出 JSON</button>
    <button class="btn" id="importJson">导入 JSON</button>
    <input id="jsonFile" type="file" accept="application/json" hidden>
    <button class="btn danger" id="resetData">恢复官方核验版本</button>
    <div class="status" id="status">点击卡片文字即可修改；输入会自动保存在本浏览器。</div>
  </aside>
  <main class="workspace">
    <header class="workspace-head"><div><h1>${data.flag} ${data.country} · ${data.topic}</h1><p>旅行证件编辑部 / 可编辑政策卡册</p></div><div class="counter" id="counter"></div></header>
    <section class="stage"><article class="passport-card" id="card" data-layout="xhs"></article></section>
    <details class="sources"><summary>本套官方来源与日期</summary><ol id="sourceList"></ol></details>
  </main>
</div>
<script>
(() => {
const embedded=JSON.parse(document.getElementById("visaData").textContent);
const official=structuredClone(embedded);
const key="qiaodashu-visa-"+embedded.code+"-v1";
const sizes={xhs:[1080,1440],x:[1200,675],square:[1080,1080],wechat:[900,383]};
const previewSizes={xhs:[540,720],x:[800,450],square:[600,600],wechat:[900,383]};
let data=(()=>{try{return JSON.parse(localStorage.getItem(key))||structuredClone(embedded)}catch{return structuredClone(embedded)}})();
let current=0;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function persist(msg="已自动保存"){localStorage.setItem(key,JSON.stringify(data));$("#status").textContent=msg}
function sourceLabel(ids){return ids.map(id=>data.sources.find(s=>s.id===id)?.label).filter(Boolean).join(" · ")}
function fitCardText(card){
 const main=card.querySelector(".card-main"),answer=card.querySelector(".answer"),question=card.querySelector(".question"),bullets=[...card.querySelectorAll(".bullet")];
 let guard=0;
 while(main.scrollHeight>main.clientHeight&&guard++<14){
   const a=parseFloat(getComputedStyle(answer).fontSize),q=parseFloat(getComputedStyle(question).fontSize);
   answer.style.fontSize=Math.max(22,a-2)+"px";
   question.style.fontSize=Math.max(16,q-1)+"px";
   bullets.forEach(b=>{const n=parseFloat(getComputedStyle(b).fontSize);b.style.fontSize=Math.max(11,n-1)+"px"});
 }
}
function render(){
 const item=data.cards[current], card=$("#card"), layout=$("#preset").value;
 card.dataset.layout=layout; card.className="passport-card "+(item.tone==="risk"?"risk":"");
 card.innerHTML='<header class="card-head"><div><div class="series">中国护照出境说明 · '+esc(data.code)+'</div><div class="country">'+esc(data.flag)+" "+esc(data.country)+'</div></div><div class="flag">'+esc(data.flag)+'</div></header>'+
 '<main class="card-main"><h2 class="question" contenteditable="true" data-field="title">'+esc(item.title)+'</h2><div class="answer" contenteditable="true" data-field="answer">'+esc(item.answer)+'</div><div class="rule"></div><div class="bullets">'+item.bullets.map((b,i)=>'<div class="bullet" contenteditable="true" data-bullet="'+i+'">'+esc(b)+'</div>').join("")+'</div>'+
 '<div class="verify"><div><b>核验状态：已核验</b><br>政策生效 '+esc(data.policyEffective)+' · 官方页 '+esc(data.officialUpdated)+' · 本页核验 '+esc(data.verified)+'</div><div>'+esc(data.pattern)+'</div></div></main>'+
 '<footer class="card-foot"><div class="foot-top"><div>适用：中国大陆居民 · 中国普通护照 · 短期旅游<br>qdd.app · @乔大帅 整理 · '+esc(sourceLabel(item.sourceIds))+'</div><div class="page">'+String(current+1).padStart(2,"0")+' / '+String(data.cards.length).padStart(2,"0")+'</div></div><div class="disclaimer">以官方最终审核及入境决定为准 · 下次复核 '+esc(data.nextReview)+'</div></footer>';
 $("#counter").textContent="第 "+String(current+1).padStart(2,"0")+" 张 / 共 "+String(data.cards.length).padStart(2,"0")+" 张";
 $$(".card-jump").forEach((b,i)=>b.classList.toggle("active",i===current));
 card.querySelectorAll("[contenteditable]").forEach(el=>el.addEventListener("input",()=>{
   if(el.dataset.field)data.cards[current][el.dataset.field]=el.textContent.trim();
   else data.cards[current].bullets[Number(el.dataset.bullet)]=el.textContent.trim();
   persist();fitCardText(card);
 }));
 fitCardText(card);
 fitStage();
}
function renderNav(){ $("#cardList").innerHTML=data.cards.map((_,i)=>'<button class="card-jump" data-i="'+i+'">'+String(i+1).padStart(2,"0")+'</button>').join(""); $$(".card-jump").forEach(b=>b.onclick=()=>{current=Number(b.dataset.i);render()})}
function renderSources(){ $("#sourceList").innerHTML=data.sources.map(s=>'<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.label)+'</a> · 官方页日期 '+esc(s.pageDate)+'</li>').join("")}
function fitStage(){if(innerWidth>900){$("#card").style.transform="" ;return}const w=$(".stage").clientWidth-20,base=$("#card").offsetWidth;$("#card").style.transform="scale("+Math.min(1,w/base)+")"}
async function png(index=current,auto=true){
 const old=current;current=index;render();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 const node=$("#card"),preset=$("#preset").value,[w,h]=sizes[preset],[baseW,baseH]=previewSizes[preset],css=[...document.querySelectorAll("style")].map(s=>s.textContent).join("\\n");
 const clone=node.cloneNode(true);clone.style.width=baseW+"px";clone.style.height=baseH+"px";clone.style.setProperty("--cw",baseW+"px");clone.style.setProperty("--ch",baseH+"px");clone.style.transform="none";
 const xml=new XMLSerializer().serializeToString(clone);
 const scale=w/baseW;
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="width:'+baseW+'px;height:'+baseH+'px;transform:scale('+scale+');transform-origin:0 0"><style>'+css+'</style>'+xml+'</div></foreignObject></svg>';
 const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml;charset=utf-8"})),img=new Image();
 await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url});
 const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;canvas.getContext("2d").drawImage(img,0,0,w,h);URL.revokeObjectURL(url);
 const blob=await new Promise(res=>canvas.toBlob(res,"image/png",1));
 if(auto){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=data.country+"-"+String(index+1).padStart(2,"0")+"-"+$("#preset").value+".png";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
 current=old;render();return blob;
}
$("#preset").onchange=render;
$("#downloadOne").onclick=async()=>{try{$("#status").textContent="正在渲染高清 PNG…";await png();$("#status").textContent="此卡 PNG 已下载"}catch(e){$("#status").textContent="导出失败："+e.message}};
$("#downloadAll").onclick=async()=>{for(let i=0;i<data.cards.length;i++){ $("#status").textContent="正在下载 "+(i+1)+" / "+data.cards.length;await png(i);await new Promise(r=>setTimeout(r,220)) }$("#status").textContent="整套 PNG 已触发下载；若浏览器拦截，请允许多个下载。"};
function download(name,blob){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
$("#exportJson").onclick=()=>download(data.slug+".json",new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
$("#importJson").onclick=()=>$("#jsonFile").click();
$("#jsonFile").onchange=async e=>{try{const next=JSON.parse(await e.target.files[0].text());if(!Array.isArray(next.cards))throw Error("缺少 cards 数组");data=next;current=0;persist("JSON 已导入并保存");renderNav();renderSources();render()}catch(err){$("#status").textContent="导入失败："+err.message}};
$("#resetData").onclick=()=>{if(!confirm("恢复官方核验版本？本浏览器中的文字修改会被覆盖。"))return;data=structuredClone(official);current=0;persist("已恢复官方核验版本");renderNav();renderSources();render()};
$("#saveHtml").onclick=()=>{document.getElementById("visaData").textContent=JSON.stringify(data).replace(/</g,"\\\\u003c");const html="<!doctype html>\\n"+document.documentElement.outerHTML;download(data.slug+".html",new Blob([html],{type:"text/html;charset=utf-8"}));$("#status").textContent="已下载包含当前文字的新 HTML"};
addEventListener("resize",fitStage);renderNav();renderSources();render();
})();
</script>
</body></html>`;

for (const country of countries) {
  fs.writeFileSync(path.join(here, `${country.slug}.html`), template(country));
}

fs.writeFileSync(path.join(here, "policy-data.json"), JSON.stringify({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  verifiedAt: VERIFIED,
  countries
}, null, 2));

console.log(`Generated ${countries.length} HTML files / ${countries.reduce((n, x) => n + x.cards.length, 0)} cards`);
