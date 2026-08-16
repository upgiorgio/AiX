const VERIFIED = "2026-07-29";
const c = (title, answer, bullets, sourceIds, tone = "standard") => ({ title, answer, bullets, sourceIds, tone });

export const remainingCountries = [
  {
    slug: "法国签证-乔大帅", code: "FR", flag: "🇫🇷", country: "法国", topic: "申根短期签证",
    accent: "#d8663b", secondary: "#233a61", pattern: "PARIS / 09",
    policyEffective: "2024-06-11", officialUpdated: "2026-07-29", verified: VERIFIED, nextReview: "2026-08-29",
    fields: {
      passport: "中国普通护照", purpose: "短期旅游", stay: "任意 180 天内最多 90 天",
      cumulative: "与整个申根区停留合并计算", visa: "需要申根短期签证（C 类）",
      arrivalCard: "按法国及申根边境当期要求", fee: "成人签证费通常 €90，服务费另计",
      processing: "法国中国页面称完整简单申请原则上 24–48 个工作小时；不构成承诺",
      districtException: "中国大陆通常经 TLScontact 递交，受理地按居住地与官方规则选择", risk: "中高"
    },
    sources: [
      { id: "france", label: "France-Visas｜中国申请说明", url: "https://www.france-visas.gouv.fr/en/chine", pageDate: "2026-07-29" },
      { id: "short", label: "France-Visas｜短期签证", url: "https://www.france-visas.gouv.fr/en/web/france-visas/visa-de-court-sejour", pageDate: "2026-07-29" },
      { id: "tour", label: "France-Visas｜短期旅游", url: "https://france-visas.gouv.fr/en/sejour-touristique-de-moins-de-3-mois", pageDate: "2026-07-29" },
      { id: "code", label: "EUR-Lex｜欧盟签证规则", url: "https://eur-lex.europa.eu/EN/legal-content/summary/visa-code.html", pageDate: "2026-07-29" }
    ],
    cards: [
      c("中国护照去法国要签证吗？", "需要，短期旅游通常办申根 C 类签证", ["适用短期旅游、探亲等获准访问", "最多按 90/180 规则停留", "签证不保证入境"], ["short", "tour"]),
      c("应该向法国申请吗？", "法国是唯一或主要目的地时向法国申请", ["停留最长的国家通常是主要目的地", "没有主要目的地时看第一入境国", "不要只因预约快就选法国"], ["short", "code"]),
      c("什么时候可以递交？", "最早提前 6 个月，通常不晚于出发前 15 天", ["旺季应尽早预约", "申请日与出发日要留出护照返还时间", "不要先买不可退改行程"], ["france", "code"]),
      c("中国大陆从哪里递交？", "先在 France-Visas 填表，再按指引到 TLScontact", ["只从 France-Visas 跳转预约", "核对居住地对应受理中心", "服务费与签证费分开"], ["france"]),
      c("核心材料看什么？", "目的真实、资金够用、住宿交通可信、会按期离境", ["护照、照片、保险与申请表", "行程、住宿和往返安排相互一致", "流水重点看来源而非临时余额"], ["tour"]),
      c("法国签证多久出结果？", "官方中国页的快速时效只是原则性参考", ["完整简单短签原则上 24–48 个工作小时", "补件、核查或旺季会更久", "不能把参考时效写成固定出签日"], ["france"], "risk"),
      c("拿到签证看哪几项？", "有效期、入境次数、Duration of stay", ["有效期不是可连续停留天数", "多国行程仍按申根累计天数算", "姓名或护照号错误应立即反馈"], ["short"]),
      c("法国官方来源与核验记录", "申请入口只认 France-Visas 与欧盟规则", ["本页核验：2026-07-29", "出发前重查受理中心和边境要求", "警惕仿冒预约与保险网站"], ["france", "short", "tour", "code"])
    ]
  },
  {
    slug: "德国签证-乔大帅", code: "DE", flag: "🇩🇪", country: "德国", topic: "申根短期签证",
    accent: "#d78235", secondary: "#26343f", pattern: "BERLIN / 10",
    policyEffective: "2024-06-11", officialUpdated: "2026-07-29", verified: VERIFIED, nextReview: "2026-08-29",
    fields: {
      passport: "中国普通护照", purpose: "短期旅游", stay: "任意 180 天内最多 90 天",
      cumulative: "与整个申根区停留合并计算", visa: "需要申根短期签证（C 类）",
      arrivalCard: "按德国及申根边境当期要求", fee: "成人签证费通常 €90，VFS 服务费另计",
      processing: "以德国驻华机构及受理中心的实时说明为准",
      districtException: "按常住地对应德国驻华使领馆辖区，经官方指定渠道递交", risk: "中高"
    },
    sources: [
      { id: "germany", label: "德国驻华使领馆｜签证与入境", url: "https://china.diplo.de/cn-zh/service/visa-einreise", pageDate: "2026-07-29" },
      { id: "code", label: "EUR-Lex｜欧盟签证规则", url: "https://eur-lex.europa.eu/EN/legal-content/summary/visa-code.html", pageDate: "2026-07-29" },
      { id: "ees", label: "德国驻华使领馆｜EES 提示", url: "https://china.diplo.de/cn-zh/service/visa-einreise", pageDate: "2026-07-29" }
    ],
    cards: [
      c("中国护照去德国旅游要签证吗？", "需要申根短期签证", ["短期访问适用 C 类签证", "全申根区合计遵守 90/180", "最终入境由边境机关决定"], ["germany", "code"]),
      c("德国是不是正确申请国？", "德国应是唯一或主要目的地", ["比较各国实际停留天数和旅行目的", "无主要目的地才看第一入境国", "行程与酒店要支持这一结论"], ["code"]),
      c("按哪个领区递交？", "按常住地对应使领馆辖区办理", ["先看德国驻华官网最新说明", "通过官网指向的 VFS 渠道预约", "跨领区递交可能被要求解释"], ["germany"]),
      c("材料怎么搭证据链？", "身份—行程—资金—回国约束四组互相印证", ["保险覆盖整个申根行程", "住宿与交通日期相互一致", "解释大额入账和资助关系"], ["germany"]),
      c("申根保险怎么准备？", "覆盖整个申根区和全部旅行日期", ["医疗与紧急遣返保障按官方标准", "姓名和护照信息准确", "不要买无法核验的低价保单"], ["germany", "code"]),
      c("处理时间怎么理解？", "官方时间是一般指引，不是出签承诺", ["旺季、补件或背景核查可能延长", "从正式受理而非开始填表计算", "护照返还还需额外时间"], ["germany"], "risk"),
      c("EES 会影响什么？", "申根口岸逐步以电子出入境记录替代手工章", ["按边境要求采集信息", "签证和 90/180 规则仍要遵守", "出发前查当期启用口岸说明"], ["ees"]),
      c("德国官方来源与核验记录", "总则看德国驻华官网，申根规则看 EUR-Lex", ["本页核验：2026-07-29", "每月复核费用、领区与受理中心", "不引用旅行社所谓通过率"], ["germany", "code"])
    ]
  },
  {
    slug: "意大利签证-乔大帅", code: "IT", flag: "🇮🇹", country: "意大利", topic: "申根短期签证",
    accent: "#cc6941", secondary: "#234b46", pattern: "ROMA / 11",
    policyEffective: "2026-04-01", officialUpdated: "2026-07-29", verified: VERIFIED, nextReview: "2026-08-29",
    fields: {
      passport: "中国普通护照", purpose: "短期旅游", stay: "任意 180 天内最多 90 天",
      cumulative: "与整个申根区停留合并计算", visa: "需要申根短期签证（C 类）",
      arrivalCard: "按意大利及申根边境当期要求", fee: "北京领区 2026-04-01 起成人旅游签证费 732 元；服务费另计",
      processing: "一般规则与个案核查并存，不能承诺固定日期",
      districtException: "按常住地所属意大利驻华使领馆与指定签证中心办理", risk: "中高"
    },
    sources: [
      { id: "italy", label: "意大利外交部｜入境签证", url: "https://www.esteri.it/en/servizi-opportunita/ingressosoggiornoinitalia/visto_ingresso/", pageDate: "2026-07-29" },
      { id: "fees", label: "意大利驻华使馆｜2026 第二季度费率", url: "https://ambpechino.esteri.it/wp-content/uploads/2026/04/ITALY-VISA-FEES-I-QUARTER-TBR-da-1-aprile-2026-colour.pdf", pageDate: "2026-04-01" },
      { id: "code", label: "EUR-Lex｜欧盟签证规则", url: "https://eur-lex.europa.eu/EN/legal-content/summary/visa-code.html", pageDate: "2026-07-29" }
    ],
    cards: [
      c("中国护照去意大利要签证吗？", "需要申根短期签证", ["旅游通常申请 C 类签证", "全申根区累计最多 90/180", "签发不等于保证入境"], ["italy", "code"]),
      c("什么时候该向意大利申请？", "意大利是唯一或主要目的地时", ["主目的地看目的和停留天数", "无主要目的地才看第一入境国", "别做与真实行程不符的假预订单"], ["code"]),
      c("先确认领区", "按常住地对应使领馆与签证中心办理", ["不同领区预约与材料细节可能不同", "只从使领馆官网进入指定中心", "服务费和签证费分开核对"], ["italy"]),
      c("旅游材料重点", "完整行程、住宿交通、保险、资金和回国约束", ["覆盖所有申根日期", "流水解释收入与大额入账", "翻译要求按领区清单执行"], ["italy"]),
      c("2026 年费用怎么看？", "北京领区成人旅游签证费标示 732 元", ["自 2026-04-01 起的季度费率", "汇率换算表可能按季度更新", "签证中心服务费另计"], ["fees"]),
      c("多久能办完？", "只能按官方一般处理规则预留时间", ["补件、核查或旺季会延长", "不要把最短案例当承诺", "拿回护照前避免不可退行程"], ["italy"], "risk"),
      c("签证页三项最关键", "VALID UNTIL、NUMBER OF ENTRIES、DURATION OF STAY", ["有效期不等于可停留天数", "多次入境仍受 90/180 限制", "发现身份信息错误立即联系"], ["italy"]),
      c("意大利官方来源与核验记录", "外交部定总则，驻华机构定领区和人民币费率", ["本页核验：2026-07-29", "费率按季度复核", "出发前重查边境要求"], ["italy", "fees", "code"])
    ]
  },
  {
    slug: "西班牙签证-乔大帅", code: "ES", flag: "🇪🇸", country: "西班牙", topic: "申根短期签证",
    accent: "#d76b32", secondary: "#4b3140", pattern: "MADRID / 12",
    policyEffective: "2024-06-11", officialUpdated: "2026-07-29", verified: VERIFIED, nextReview: "2026-08-29",
    fields: {
      passport: "中国普通护照", purpose: "短期旅游", stay: "任意 180 天内最多 90 天",
      cumulative: "与整个申根区停留合并计算", visa: "需要申根短期签证（C 类）",
      arrivalCard: "按西班牙及申根边境当期要求", fee: "成人 €90；6–11 岁 €45；BLS 服务费另计",
      processing: "法定一般决定期 15 个日历日，个案可延至 45 日",
      districtException: "按常住地所属领区经 BLS 递交", risk: "中高"
    },
    sources: [
      { id: "spain", label: "西班牙驻北京总领馆｜申根签证", url: "https://www.exteriores.gob.es/Consulados/pekin/en/ServiciosConsulares/Paginas/Consular/Visados-Schengen.aspx", pageDate: "2026-07-29" },
      { id: "place", label: "西班牙驻北京总领馆｜递交地点", url: "https://www.exteriores.gob.es/Consulados/pekin/es/ServiciosConsulares/Paginas/index.aspx?scca=Visados&scco=China&scd=225&scs=Lugar+de+presentaci%C3%B3n+de+solicitudes+de+visado", pageDate: "2026-07-29" },
      { id: "code", label: "EUR-Lex｜欧盟签证规则", url: "https://eur-lex.europa.eu/EN/legal-content/summary/visa-code.html", pageDate: "2026-07-29" }
    ],
    cards: [
      c("中国护照去西班牙要签证吗？", "需要申根短期签证", ["短期旅游通常办 C 类", "全申根区合计遵守 90/180", "入境时仍可能核查材料"], ["spain", "code"]),
      c("谁该向西班牙申请？", "西班牙是唯一或主要目的地的人", ["停留最长或核心活动在西班牙", "无主要目的地才看第一入境国", "申请国必须与真实行程一致"], ["spain", "code"]),
      c("护照和保险硬条件", "护照、空白页和 €30,000 保险都要达标", ["护照离开申根后通常至少 3 个月有效", "护照须在过去 10 年内签发并有 2 页空白", "保险最低保障 €30,000"], ["spain"]),
      c("什么时候递交？", "最早提前 6 个月，通常至少提前 15 天", ["旺季预约更应提前", "按常住地领区选择 BLS", "未获签前避免不可退订单"], ["spain", "place"]),
      c("费用是多少？", "成人 €90，6–11 岁 €45", ["签证中心服务费另计", "是否减免看官方适用情形", "拒签通常不退申请费"], ["spain"]),
      c("官方处理时间", "一般 15 个日历日，个案可延至 45 日", ["从正式受理开始计算", "补件或进一步审查会延长", "不是 15 天必出签"], ["spain"], "risk"),
      c("拿到签证怎么检查？", "姓名、有效期、次数、可停留天数", ["90/180 仍需自己累计", "入境章或电子记录不改变签证条件", "错误应立即联系受理机构"], ["spain"]),
      c("西班牙官方来源与核验记录", "总领馆页面给出了费用、时效和材料硬条件", ["本页核验：2026-07-29", "每月复核 BLS 与领区安排", "只用外交部官网指向的入口"], ["spain", "place", "code"])
    ]
  },
  {
    slug: "阿联酋免签-乔大帅", code: "AE", flag: "🇦🇪", country: "阿联酋", topic: "30 天免签",
    accent: "#d66d3d", secondary: "#244447", pattern: "EMIRATES / 13",
    policyEffective: "2016-11-01", officialUpdated: "2026-07-29", verified: VERIFIED, nextReview: "2026-08-29",
    fields: {
      passport: "有效中国普通护照", purpose: "短期旅游及获准访问", stay: "免签停留最多 30 天",
      cumulative: "延期与再次入境须按移民机关当期规则", visa: "符合条件可免签",
      arrivalCard: "按航空公司及阿联酋口岸当期要求", fee: "免签本身无签证申请费",
      processing: "入境现场审核", districtException: "护照通常须至少 6 个月有效；各酋长国移民服务入口可能不同", risk: "中"
    },
    sources: [
      { id: "beijing", label: "阿联酋驻华使馆｜签证", url: "https://www.mofa.gov.ae/en/Missions/Beijing/Services/Visas", pageDate: "2026-07-29" },
      { id: "shanghai", label: "阿联酋驻上海总领馆｜签证", url: "https://www.mofa.gov.ae/en/Missions/Shanghai/Services/Visas", pageDate: "2026-07-29" },
      { id: "passport", label: "阿联酋外交部｜30 天及护照要求", url: "https://www.mofa.gov.ae/en/missions/oslo/services/visas", pageDate: "2026-07-29" }
    ],
    cards: [
      c("中国护照去阿联酋免签吗？", "免签，短期停留最多 30 天", ["适用有效中国普通护照", "旅游等短期访问适用", "实际准入由口岸决定"], ["beijing", "shanghai"]),
      c("护照有效期要多久？", "建议入境时至少还有 6 个月", ["破损护照可能影响登机和入境", "儿童也要持独立有效旅行证件", "出发前让承运人再次核验"], ["passport"]),
      c("30 天从哪天算？", "以边检准许入境和系统记录为准", ["不要自行按航班起飞时间估算", "保存入境记录和电子许可", "离境日也要纳入行程规划"], ["beijing"]),
      c("想延期怎么办？", "必须按当地移民机关当期渠道申请", ["不是自动再送 30 天", "不同酋长国服务入口可能不同", "在获批前仍受原离境期限约束"], ["shanghai"], "risk"),
      c("入境随身材料", "护照、返程/续程、住宿和足够资金", ["免签不等于无条件入境", "访问目的与住宿安排保持一致", "必要时说明下一目的地资格"], ["beijing"]),
      c("免签不能做什么？", "不能把旅游身份当工作或长期居留许可", ["就业需相应签证和许可", "超期会产生罚款及后续风险", "警惕“落地转身份包办”"], ["beijing"], "risk"),
      c("转机也要看路线", "是否入境取行李决定是否接受边检", ["联程与非联程处理不同", "跨机场或重新托运通常要入境", "让航空公司按完整行程核验"], ["passport"]),
      c("阿联酋官方来源与核验记录", "签证结论以阿联酋外交部和移民机关为准", ["本页核验：2026-07-29", "每月复核延期与口岸规则", "不要用商业代办页替代官方结论"], ["beijing", "shanghai", "passport"])
    ]
  },
  {
    slug: "印度尼西亚落地签-乔大帅", code: "ID", flag: "🇮🇩", country: "印度尼西亚", topic: "落地签 / e-VOA",
    accent: "#dc6240", secondary: "#35434a", pattern: "NUSANTARA / 14",
    policyEffective: "2025-10-01", officialUpdated: "2026-07-20", verified: VERIFIED, nextReview: "2026-08-05",
    fields: {
      passport: "有效中国普通护照", purpose: "旅游等 B1 允许的访问", stay: "首次最多 30 天，可按规则延长一次",
      cumulative: "单次入境；延期后总停留通常最多 60 天", visa: "可办 B1 落地签或官方 e-VOA",
      arrivalCard: "需要 All Indonesia，到达前 3 天内可填", fee: "B1 通常 IDR 500,000；以官方支付页为准",
      processing: "e-VOA 以系统处理为准；现场落地签另需排队", districtException: "须从获准口岸入境并遵守签证活动范围", risk: "中高"
    },
    sources: [
      { id: "voa", label: "印尼移民局｜VoA 适用国家", url: "https://kanwilsultra.imigrasi.go.id/wna/daftar-subjek-voa-bvk-calling-visa", pageDate: "2026-07-20" },
      { id: "b1", label: "印尼移民局｜B1 落地签", url: "https://jakartapusat.imigrasi.go.id/index.php/layanan/warga-negara-asing-wna/visa-republik-indonesia/b1-visa-saat-kedatangan-wisata", pageDate: "2026-07-29" },
      { id: "evisa", label: "印尼移民局｜eVisa 官方入口", url: "https://evisa.imigrasi.go.id/", pageDate: "2026-07-29" },
      { id: "arrival", label: "印尼移民局｜All Indonesia", url: "https://www.imigrasi.go.id/siaran_pers/mulai-1-oktober-deklarasi-kedatangan-penumpang-wajib-dilakukan-di-aplikasi-all-indonesia", pageDate: "2025-09-29" }
    ],
    cards: [
      c("中国护照去印尼免签吗？", "普通旅游通常办 B1 落地签或 e-VOA", ["中国在 VoA 适用国家名单内", "不是无条件免签", "出发前可走官方 eVisa 系统"], ["voa", "b1", "evisa"]),
      c("B1 能待多久？", "首次最多 30 天，可按规则延长一次", ["延期不是自动完成", "总停留通常最多 60 天", "以签证和移民系统记录为准"], ["b1"]),
      c("落地办还是网上办？", "e-VOA 可减少现场手续，落地签适合符合条件的临时办理", ["只用 evisa.imigrasi.go.id", "网上获批也不保证入境", "现场落地签可能排队"], ["evisa", "b1"]),
      c("费用怎么核对？", "B1 通常 IDR 500,000，以付款页为准", ["第三方代办会另收服务费", "付款前确认域名与签证类型", "拒绝重复支付可疑链接"], ["b1", "evisa"], "risk"),
      c("All Indonesia 是什么？", "入境前统一填写移民、海关、健康与检疫申报", ["2025-10-01 起全面实施", "可在抵达前 3 天内填写", "官方申报免费"], ["arrival"]),
      c("入境随身材料", "护照、签证/付款证明、返程票、住宿和资金", ["护照有效期按官方与承运人要求准备", "返程或续程安排要可信", "按实际情况申报物品"], ["b1", "arrival"]),
      c("B1 不能做什么？", "不能用于就业或超出许可范围的活动", ["签证类型要匹配真实目的", "逾期停留会产生罚款和后续风险", "不要轻信“落地后洗签证”"], ["b1"], "risk"),
      c("印尼官方来源与核验记录", "签证只认移民局 eVisa，申报只认 All Indonesia", ["本页核验：2026-07-29", "每周扫描入境申报与 VoA 名单", "费用付款前再次核对"], ["voa", "b1", "evisa", "arrival"])
    ]
  },
  {
    slug: "越南电子签-乔大帅", code: "VN", flag: "🇻🇳", country: "越南", topic: "电子签证",
    accent: "#d76835", secondary: "#34464b", pattern: "VIETNAM / 15",
    policyEffective: "2023-08-15", officialUpdated: "2026-07-29", verified: VERIFIED, nextReview: "2026-08-05",
    fields: {
      passport: "有效中国普通护照", purpose: "电子签允许的短期访问", stay: "最长 90 天",
      cumulative: "按获批电子签的起止日期、单次/多次入境执行", visa: "需要，可申请电子签证",
      arrivalCard: "官方建议按需完成 Pre-arrival 信息", fee: "单次 US$25；多次 US$50",
      processing: "以 evisa.gov.vn 申请状态与官方通知为准", districtException: "必须从电子签列明/允许的口岸出入境", risk: "中高"
    },
    sources: [
      { id: "evisa", label: "越南公安部移民局｜eVisa", url: "https://evisa.gov.vn/", pageDate: "2026-07-29" },
      { id: "pre", label: "越南移民局｜Pre-arrival", url: "https://prearrival.immigration.gov.vn/", pageDate: "2026-07-29" }
    ],
    cards: [
      c("中国护照去越南要签证吗？", "需要，可在线申请电子签证", ["最长可签 90 天", "可选单次或多次入境", "实际以获批文件为准"], ["evisa"]),
      c("电子签能待多久？", "看获批的 From—To 日期，最长 90 天", ["不是获批后任意 90 天", "入境次数按 single / multiple 执行", "逾期风险要按自然日规划"], ["evisa"]),
      c("只认哪个申请网站？", "只认 evisa.gov.vn", ["警惕搜索广告与仿冒代办站", "逐字核对护照号和英文姓名", "保存申请码、付款与结果文件"], ["evisa"], "risk"),
      c("费用是多少？", "单次 US$25，多次 US$50", ["以官方支付页面显示为准", "申请未获批通常不退费", "不要向个人账户转账"], ["evisa"]),
      c("申请信息最容易错哪？", "姓名、护照号、日期、入境口岸和照片", ["口岸必须在电子签允许范围内", "旅行日期要落在签证有效窗口", "提交前逐栏复核"], ["evisa"]),
      c("Pre-arrival 要不要填？", "按官方入口和行程要求办理", ["入口为 immigration.gov.vn 域名", "提前填写可减少抵达时重复录入", "不把第三方健康码当官方要求"], ["pre"]),
      c("入境随身带什么？", "护照、电子签、返程/续程、住宿和资金证明", ["建议保存电子版并打印备份", "签证不等于保证入境", "访问目的与申请一致"], ["evisa"]),
      c("越南官方来源与核验记录", "电子签只回到公安部移民局官方域名", ["本页核验：2026-07-29", "每周扫描口岸名单和表单变化", "付款前再次核对域名"], ["evisa", "pre"])
    ]
  },
  {
    slug: "新西兰签证-乔大帅", code: "NZ", flag: "🇳🇿", country: "新西兰", topic: "Visitor Visa",
    accent: "#d56e3d", secondary: "#183d55", pattern: "AOTEAROA / 16",
    policyEffective: "不适用（Visitor Visa 为现行类别）", officialUpdated: "2026-08-13", verified: "2026-08-13", nextReview: "2026-09-13",
    fields: {
      passport: "中国普通护照", purpose: "旅游、探亲访友", stay: "多次签每 12 个月累计最多 6 个月；单次签最多 9 个月/18 个月",
      cumulative: "以获批签证的入境次数和条件为准", visa: "通常需要 Visitor Visa；符合澳洲出发试点者可改用 NZeTA",
      arrivalCard: "需要 New Zealand Traveller Declaration，最早出发前 24 小时提交",
      fee: "Visitor Visa 自 NZD 441 起", processing: "官方当前显示 80% 约 1.5 周，动态变化",
      districtException: "持合资格澳大利亚签证且每次从澳大利亚出发者，可在试点期用 NZeTA", risk: "中高"
    },
    sources: [
      { id: "guide", label: "新西兰移民局｜中国公民申请指南", url: "https://www.immigration.govt.nz/process-to-apply/applying-for-a-visa/providing-evidence-and-documents-to-support-your-visa-application/visitor-visa-application-guide-for-citizens-of-china/", pageDate: "2026-07-29" },
      { id: "visitor", label: "新西兰移民局｜Visitor Visa", url: "https://www.immigration.govt.nz/visas/visitor-visa/", pageDate: "2026-07-29" },
      { id: "trial", label: "新西兰移民局｜澳洲出发 NZeTA 试点", url: "https://www.immigration.govt.nz/about-us/news-centre/easier-travel-from-australia-to-new-zealand-for-chinese-visitors/", pageDate: "2025-11-03" },
      { id: "nzeta", label: "新西兰移民局｜NZeTA", url: "https://www.immigration.govt.nz/visas/new-zealand-electronic-travel-authority-nzeta/", pageDate: "2026-07-29" }
    ],
    cards: [
      c("中国护照去新西兰要签证吗？", "通常要办 Visitor Visa", ["适用旅游和探亲访友", "可在线申请", "获批不等于保证入境"], ["guide", "visitor"]),
      c("能停留多久？", "多次签与单次签规则不同", ["多次签：每 12 个月累计最多 6 个月", "单次签：最多 9 个月/18 个月", "最终以签证条件为准"], ["guide", "visitor"]),
      c("费用和时间", "自 NZD 441 起，80% 约 1.5 周", ["处理时间会动态变化", "材料不足可能延误或拒签", "官方建议获批前别订不可退行程"], ["guide", "visitor"]),
      c("材料核心是什么？", "真实访客、足够资金、会按期离境", ["中文文件需按要求提供英文翻译", "提交原件扫描件和译文", "行程与个人财务能力匹配"], ["guide"]),
      c("特殊 NZeTA 试点", "持合资格澳签并从澳大利亚出发，可免 Visitor Visa", ["试点自 2025-11-03 起，官方现称持续至另行通知", "每次都必须从澳大利亚出发", "停留最多 3 个月并持有效 NZeTA"], ["trial", "nzeta"], "risk"),
      c("NZTD 什么时候填？", "最早可在开始旅行前 24 小时提交", ["数字或纸质申报按官方要求", "如实申报食品、药品与生物安全物品", "保存提交确认"], ["guide"]),
      c("入境时准备什么？", "护照、签证/NZeTA、返程、住宿和资金证明", ["边检会判断是否仍为真实访客", "海关和生物安全检查独立进行", "回答与申请保持一致"], ["guide", "visitor"]),
      c("新西兰官方来源与核验记录", "普通路径与澳洲出发试点必须分开写", ["本页核验：2026-07-29", "试点到期前重点复核", "费用和处理时间每次出发前重查"], ["guide", "visitor", "trial", "nzeta"])
    ]
  },
  {
    slug: "加拿大签证-乔大帅", code: "CA", flag: "🇨🇦", country: "加拿大", topic: "Visitor Visa",
    accent: "#d85f3a", secondary: "#34404b", pattern: "CANADA / 17",
    policyEffective: "不适用（Visitor Visa 为现行类别）", officialUpdated: "2026-08-13", verified: "2026-08-13", nextReview: "2026-09-13",
    fields: {
      passport: "中国普通护照", purpose: "短期旅游、探亲访友", stay: "多数访客每次最多 6 个月，边境官可决定更短或更长",
      cumulative: "签证有效期不等于获准停留期", visa: "需要 Visitor Visa（TRV）",
      arrivalCard: "按加拿大边境和机场当期要求", fee: "签证 CAD 100；如需生物信息，个人 CAD 85",
      processing: "因申请国家和个案而异，生物信息时间另计", districtException: "在线申请后按通知录指纹、递交护照或补件", risk: "高"
    },
    sources: [
      { id: "visa", label: "加拿大 IRCC｜Visitor Visa", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/visitor-visa.html", pageDate: "2026-05-26" },
      { id: "apply", label: "加拿大 IRCC｜如何申请", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/apply-visitor-visa.html", pageDate: "2026-07-29" },
      { id: "arrival", label: "加拿大 IRCC｜抵达加拿大", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/prepare-arrival.html", pageDate: "2026-07-19" },
      { id: "eligibility", label: "加拿大 IRCC｜申请资格", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eligibility.html", pageDate: "2026-07-29" }
    ],
    cards: [
      c("中国护照去加拿大要签证吗？", "需要 Visitor Visa（TRV）", ["贴在护照上的访问签证", "可签单次或多次，由签证官决定", "签证有效不代表保证入境"], ["visa"]),
      c("签证能给多久？", "最长可能到 10 年，但受护照和生物信息有效期限制", ["最终有效期由签证官决定", "有效期是可用于旅行的窗口", "每次停留期限另由边境决定"], ["visa", "apply"]),
      c("每次能待多久？", "多数访客最多 6 个月", ["边境官可批准更短或更长", "有盖章或 visitor record 时按其日期离境", "无特殊日期通常按入境日起 6 个月"], ["arrival"]),
      c("申请路径", "IRCC Portal 在线填表、上传材料、付费", ["按通知完成生物信息", "获批后再按要求递交护照", "只用 canada.ca 指向的入口"], ["apply"]),
      c("费用怎么算？", "个人签证费 CAD 100，生物信息通常 CAD 85", ["家庭费用上限按官方表执行", "体检、翻译、快递等可能另收费", "费用调整以付款页面为准"], ["apply"]),
      c("材料核心", "证明有钱完成旅行、目的真实、会离开加拿大", ["工作、家庭、资产等国内联系", "旅行计划与预算相匹配", "邀请函不替代申请人自身资格"], ["eligibility"]),
      c("处理时间不能承诺", "IRCC 明确按国家、完整度和个案变化", ["录指纹时间不一定计入", "补件和背景核查会延长", "未拿回护照前避免不可退行程"], ["visa"], "risk"),
      c("加拿大官方来源与核验记录", "签证、费用、入境期限全部回到 IRCC", ["本页核验：2026-07-29", "处理时间出发前动态查询", "不把签证到期日写成离境日"], ["visa", "apply", "arrival", "eligibility"])
    ]
  },
  {
    slug: "土耳其免签-乔大帅", code: "TR", flag: "🇹🇷", country: "土耳其", topic: "90/180 免签",
    accent: "#d65e38", secondary: "#3c3b46", pattern: "TÜRKIYE / 18",
    policyEffective: "2026-01-02", officialUpdated: "2026-07-29", verified: VERIFIED, nextReview: "2026-08-05",
    fields: {
      passport: "有效中国普通护照", purpose: "短期旅游及免签允许的访问", stay: "任意 180 天内累计最多 90 天",
      cumulative: "滚动 180 天计算，不因短暂离境清零", visa: "自 2026-01-02 起符合条件可免签",
      arrivalCard: "按土耳其边境及承运人当期要求", fee: "免签本身无签证费",
      processing: "入境现场审核", districtException: "工作、学习等目的仍需相应签证/许可；护照有效期须覆盖停留期后至少 60 天", risk: "中高"
    },
    sources: [
      { id: "regime", label: "土耳其外交部｜外国人签证制度", url: "https://www.mfa.gov.tr/yabancilarin-tabi-oldugu-vize-rejimi.tr.mfa", pageDate: "2026-07-29" },
      { id: "general", label: "土耳其外交部｜签证一般信息", url: "https://www.mfa.gov.tr/general-information-about-turkish-visas.en.mfa", pageDate: "2026-07-29" }
    ],
    cards: [
      c("中国护照去土耳其免签吗？", "免签，2026-01-02 起适用", ["适用中国普通护照", "任意 180 天累计最多 90 天", "旧版“必须电子签”攻略已过时"], ["regime"]),
      c("90/180 怎么算？", "按每一天向前滚动 180 天累计", ["不是离境一次就清零", "多次往返要自己记录天数", "边境系统记录为最终依据"], ["regime", "general"]),
      c("护照有效期要求", "至少覆盖获准停留期结束后 60 天", ["90 天停留通常意味着入境时至少约 150 天有效", "官方另建议护照自抵达日起至少 6 个月", "破损或空白页不足要提前换证"], ["general"]),
      c("入境随身材料", "返程/续程、住宿、资金和真实行程", ["免签不保证入境", "回答与实际旅游目的一致", "必要时证明可进入下一目的地"], ["regime"]),
      c("还能用 eVisa 吗？", "对中国普通护照，现行免签结论优先", ["不要照搬 2025 年以前的电子签教程", "第三方仍收费代办不代表官方要求", "出发前以土耳其外交部国别表复核"], ["regime"], "risk"),
      c("免签不能做什么？", "工作、学习等仍需相应签证或许可", ["旅游身份不能用于就业", "超期停留会影响罚款和后续入境", "长期居留须走正式许可"], ["general"], "risk"),
      c("签证有效期与停留期", "免签下看的是边境准入和 90/180 累计", ["没有一张签证供你“用满有效期”", "边境可基于个案限制准入", "保留入境和离境记录"], ["regime"]),
      c("土耳其官方来源与核验记录", "只看土耳其外交部最新国别制度表", ["政策生效：2026-01-02", "本页核验：2026-07-29", "每周扫描免签是否调整"], ["regime", "general"])
    ]
  },
  {
    slug: "格鲁吉亚免签-乔大帅", code: "GE", flag: "🇬🇪", country: "格鲁吉亚", topic: "30/90/180 免签",
    accent: "#d3683d", secondary: "#3b4249", pattern: "SAKARTVELO / 19",
    policyEffective: "2024-05-28", officialUpdated: "2026-07-29", verified: VERIFIED, nextReview: "2026-08-29",
    fields: {
      passport: "有效中国普通护照", purpose: "短期旅游", stay: "每次最多 30 天",
      cumulative: "任意 180 天累计最多 90 天", visa: "符合协议条件可免签",
      arrivalCard: "按格鲁吉亚边境当期要求", fee: "免签本身无签证费",
      processing: "入境现场审核", districtException: "须经官方开放的国际边境口岸入境；就业、学习等目的另办许可", risk: "中"
    },
    sources: [
      { id: "effective", label: "格鲁吉亚外交部｜互免生效", url: "https://mfa.gov.ge/en/news/425297-28-misidan-saqartvelosa-da-chinetis-sakhalkho-respublikas-shoris-uvizo-mimosvlis-shesakheb-shetankhm", pageDate: "2024-05-28" },
      { id: "agreement", label: "格鲁吉亚外交部｜互免协议", url: "https://www.mfa.gov.ge/en/news/641804-saqartvelosa-da-chinets-mtavrobas-shoris-kheli-moetsera-ordinaluri-pasportebis-mphlobelta-savizo-mot", pageDate: "2024-04-10" },
      { id: "china", label: "格鲁吉亚驻华使馆｜重要信息", url: "https://china.mfa.gov.ge/important-information", pageDate: "2026-07-29" }
    ],
    cards: [
      c("中国护照去格鲁吉亚免签吗？", "免签，协议自 2024-05-28 生效", ["适用中国普通护照", "旅游每次最多 30 天", "实际准入由边境决定"], ["effective", "china"]),
      c("累计停留怎么算？", "任意 180 天内累计最多 90 天", ["单次仍不能超过 30 天", "短暂离境不会自动清零", "多次旅行要自己核算"], ["effective"]),
      c("从哪里入境？", "从官方开放的国际边境口岸入境", ["航空、陆路路线都应先核验口岸状态", "转经第三国还要满足该国过境要求", "承运人规则需单独确认"], ["china"]),
      c("随身材料", "护照、返程/续程、住宿、资金和保险", ["免签不等于无条件入境", "说明清楚访问目的和天数", "必要时证明可进入下一站"], ["china"]),
      c("能不能工作？", "旅游免签不等于就业或学习许可", ["从事受许可活动前先办手续", "不要用频繁出入境代替居留许可", "超期会影响后续旅行"], ["agreement"], "risk"),
      c("30 天和 90 天别混淆", "30 天是单次上限，90 天是 180 天累计上限", ["两项限制同时满足", "不是一次可以停 90 天", "按自然日保守规划"], ["effective"], "risk"),
      c("入境决定谁来做？", "签证互免不削弱边境机关的审查权", ["行程与住宿要真实可核验", "不能证明访问目的可能被进一步询问", "保存返程和资金证明"], ["china"]),
      c("格鲁吉亚官方来源与核验记录", "协议与驻华使馆说明交叉核验", ["政策生效：2024-05-28", "本页核验：2026-07-29", "每月复核口岸与停留规则"], ["effective", "agreement", "china"])
    ]
  },
  {
    slug: "俄罗斯免签-乔大帅", code: "RU", flag: "🇷🇺", country: "俄罗斯", topic: "30 天临时免签",
    accent: "#d3633b", secondary: "#29405c", pattern: "RUSSIA / 20",
    policyEffective: "2025-12-01", officialUpdated: "2026-07-21", verified: "2026-08-13", nextReview: "2026-08-20",
    fields: {
      passport: "有效中国普通护照", purpose: "旅游、探亲访友、商务、科技文化交流、体育及过境等公告列明目的",
      stay: "每次最多 30 天", cumulative: "官方公告仅明确单次不超过 30 天；频繁入境仍由边境机关审核",
      visa: "符合公告目的可免签，现行安排延长至 2027-12-31", arrivalCard: "按俄罗斯边境与移民登记要求",
      fee: "免签本身无签证费", processing: "入境现场审核，不承诺准入",
      districtException: "工作、新闻采访、学习、居留及国际道路运输人员不适用，须预先办理相应签证", risk: "高"
    },
    sources: [
      { id: "start", label: "中国驻哈巴罗夫斯克总领馆｜俄罗斯对中国公民免签政策说明", url: "https://khabarovsk.china-consulate.gov.cn/lsfw/ZYTZ/202512/t20251202_11764651.htm", pageDate: "2025-12-02" },
      { id: "extend", label: "中国驻俄罗斯使馆｜俄方延长对中国公民免签政策", url: "https://ru.china-embassy.gov.cn/lsfw/zytz_142816/202607/t20260721_11989093.htm", pageDate: "2026-07-21" },
      { id: "qa", label: "俄罗斯驻华使馆答问｜免签适用范围与入境要求", url: "https://www.xuancheng.gov.cn/Special/show/19605.html", pageDate: "2025-12-02" }
    ],
    cards: [
      c("中国护照去俄罗斯免签吗？", "符合公告目的可免签，每次最多停留 30 天", ["适用有效中国普通护照", "现行安排延长至 2027-12-31", "边境机关仍作最终入境决定"], ["start", "extend"]),
      c("免签到什么时候？", "俄方已把现行政策延长至 2027-12-31", ["最初安排自 2025-12-01 实施", "临时政策仍可能再次调整", "出发前重新查看使馆公告"], ["start", "extend"], "risk"),
      c("哪些旅行目的适用？", "旅游、探亲访友、商务、交流、体育及过境等公告列明目的", ["入境时应能说明真实目的", "准备行程、住宿与返程证据", "目的不符可能被拒绝入境"], ["start", "qa"]),
      c("哪些情况不能用免签？", "工作、新闻采访、学习、居留等须预先办相应签证", ["国际道路运输人员也不适用", "不要用短期免签替代工作或居留许可", "不确定时先向俄方使领馆核验"], ["start", "qa"], "risk"),
      c("从哪些口岸可以入境？", "可从对外开放的俄罗斯边境检查站办理入境", ["航班与陆路口岸运营状态可能变化", "途经第三国要另查过境规则", "承运人仍会独立审核旅行文件"], ["qa"]),
      c("入境随身材料", "护照、返程或续程、住宿、资金与行程证明", ["免签不等于无条件入境", "材料应与停留天数和旅行目的一致", "建议保存官方公告离线副本"], ["start", "qa"]),
      c("抵达后还要做什么？", "按住宿地要求完成移民登记", ["酒店通常协助办理", "住私人住所要与接待方确认责任和时限", "保存登记凭证至离境"], ["qa"], "risk"),
      c("俄罗斯官方来源与核验记录", "免签起始、适用范围与延期公告已交叉核验", ["政策生效：2025-12-01", "官方更新：2026-07-21", "本站核验：2026-08-13；每周复核"], ["start", "extend", "qa"])
    ]
  },
  {
    slug: "菲律宾免签-乔大帅", code: "PH", flag: "🇵🇭", country: "菲律宾", topic: "14 天限时免签 + eTravel",
    accent: "#d8673c", secondary: "#1d4055", pattern: "MANILA / 21", policyEffective: "2026-01-16", officialUpdated: "2026-01-22", verified: "2026-08-13", nextReview: "2026-08-20",
    fields: { passport: "中国普通护照", purpose: "仅旅游或商务", stay: "最多 14 天，不可延期或转换", cumulative: "限时安排暂为一年，期满前复核", visa: "符合条件可免签；转机、工作、学习等另办签证", arrivalCard: "需要 eTravel，抵达前 72 小时内登记", fee: "免签和 eTravel 本身无签证费；eTravel 免费", processing: "入境由菲律宾边检逐案决定", districtException: "仅 NAIA 马尼拉或 MCIA 宿务入境", risk: "高" },
    sources: [
      { id: "dfa", label: "菲律宾外交部｜14 天免签公告", url: "https://chongqingpcg.dfa.gov.ph/example-pages/news-press-releases/1167-philippines-to-allow-visa-free-entry-for-14-days-for-chinese-nationals", pageDate: "2026-01-16" },
      { id: "embassy", label: "中国驻菲律宾使馆｜免签提醒", url: "https://ph.china-embassy.gov.cn/chn/lsfw/202601/t20260122_11843596.htm", pageDate: "2026-01-22" },
      { id: "evisa", label: "菲律宾 eVisaPH｜中国公民政策", url: "https://evisa.gov.ph/page/policy?l1=Non-Immigrant+Visas", pageDate: "2026-08-13" },
      { id: "etravel", label: "菲律宾 eTravel｜官方 FAQ", url: "https://etravel.gov.ph/en/frequently-asked-questions", pageDate: "2026-08-13" }
    ],
    cards: [
      c("中国护照去菲律宾免签吗？", "符合条件可免签 14 天", ["仅限旅游或商务", "只可从 NAIA 或 MCIA 入境", "安排暂为一年并会复核"], ["dfa", "embassy"]),
      c("14 天能延期或转签吗？", "不能延期，也不能转换为其他签证类别", ["超过 14 天要提前查 eVisa 或传统签证", "不要买超过许可期限的不可退行程", "最终以入境记录为准"], ["dfa", "evisa"], "risk"),
      c("哪些机场可以用？", "仅马尼拉 NAIA 和宿务 MCIA", ["其他机场、海港或陆路口岸不要套用", "转机赴第三国不适用该免签", "联程路线也要逐段核对过境规则"], ["embassy", "evisa"]),
      c("eTravel 什么时候填？", "抵达前 72 小时内在官方系统登记", ["eTravel 是入境申报，不是签证", "官方注册免费", "保存 QR 信息供值机和边检核验"], ["etravel"]),
      c("入境需要准备什么？", "护照、酒店、返程/续程和行程证明", ["护照拟停留期后至少 6 个月有效", "准备必要的资金或商务证明", "材料与旅游/商务目的保持一致"], ["embassy"]),
      c("哪些情况不能用免签？", "工作、学习、转机赴第三国或更长停留不适用", ["提前申请相应签证", "不要把免签当作菲律宾境内转身份通道", "按 eVisaPH 或使领馆要求准备"], ["embassy", "evisa"], "risk"),
      c("会不会有个人成功率？", "免签没有签证成功率，入境由边检决定", ["无“包入境”或内部通道", "黑名单或不良记录仍可能影响准入", "不要相信中介承诺"], ["dfa", "embassy"]),
      c("菲律宾官方来源与核验记录", "免签范围、机场、eTravel 和备用签证路径分开核对", ["政策生效：2026-01-16", "本站核验：2026-08-13", "限时安排应每周扫描官方公告"], ["dfa", "embassy", "evisa", "etravel"])
    ]
  },
  {
    slug: "柬埔寨免签-乔大帅", code: "KH", flag: "🇰🇭", country: "柬埔寨", topic: "14 天限时免签 + e-Arrival",
    accent: "#c9603d", secondary: "#273f50", pattern: "ANGKOR / 22", policyEffective: "2026-06-15", officialUpdated: "2026-06-20", verified: "2026-08-13", nextReview: "2026-09-01",
    fields: { passport: "中国普通护照", purpose: "本轮限时政策按短期旅游口径", stay: "单次不超过 14 天；免签期内可多次入境", cumulative: "无另行累计上限；每次均不超过 14 天", visa: "2026-06-15 至 2026-10-15 限时免签", arrivalCard: "需要 e-Arrival，抵达前 7 天内填写", fee: "免签和 e-Arrival 本身无签证费", processing: "口岸现场审核，不承诺准入", districtException: "中国或第三国出发均可；口岸规则仍需核对", risk: "高" },
    sources: [
      { id: "embassy", label: "中国驻柬埔寨使馆｜限时免签提醒", url: "https://kh.china-embassy.gov.cn/lsfws/lsbh/202606/t20260620_11949230.htm", pageDate: "2026-06-20" },
      { id: "arrival", label: "柬埔寨 e-Arrival｜官方入口", url: "https://www.arrival.gov.kh/", pageDate: "2026-08-13" },
      { id: "evisa", label: "柬埔寨政府｜e-Visa 官方网站", url: "https://www.evisa.gov.kh/", pageDate: "2026-08-13" },
      { id: "gdi", label: "柬埔寨移民总局｜e-Arrival 说明", url: "https://immigration.gov.kh/public/", pageDate: "2026-08-13" }
    ],
    cards: [
      c("中国护照去柬埔寨免签吗？", "可以，但只限 2026-06-15 至 10-15", ["中国普通护照适用", "中国或第三国出发均可", "单次不超过 14 天"], ["embassy"]),
      c("14 天是怎么计算？", "每次入境最多 14 天，免签期内可多次入境", ["每次入境重新核对期限", "政策结束后不能继续套用", "不要自行写成可延期"], ["embassy"], "risk"),
      c("e-Arrival 什么时候填？", "抵达前 7 天内可通过官方入口填写", ["也可抵达口岸现场操作", "保存电子入境卡", "e-Arrival 不是签证，也不收费"], ["embassy", "arrival"]),
      c("免签要准备什么？", "护照、入境卡、住宿、返程和短期行程", ["边检可能补充询问旅行目的", "材料齐全不等于保证入境", "拒绝任何口岸索要小费行为并保留证据"], ["embassy"]),
      c("免签结束后怎么办？", "改查柬埔寨官方 e-Visa 或其他签证", ["evisa.gov.kh 是官方电子签入口", "免签结束后不要沿用旧结论", "签证类别要匹配真实目的"], ["evisa", "gdi"]),
      c("有没有签证成功率？", "免签没有签证成功率，入境由边检决定", ["不写包过或保证入境", "不引用旅行社通过率", "以官方入境决定为准"], ["embassy"]),
      c("最容易踩的仿冒站？", "收费 e-Arrival 或非 gov.kh 电子签站都要警惕", ["e-Arrival 只认 arrival.gov.kh", "电子签只认 evisa.gov.kh", "不要向第三方提交护照或付款"], ["arrival", "evisa"], "risk"),
      c("柬埔寨官方来源与核验记录", "限时免签、入境卡和回退签证路径分开记录", ["政策生效：2026-06-15", "限时结束：2026-10-15", "本站核验：2026-08-13；每周复核"], ["embassy", "arrival", "evisa"])
    ]
  },
  {
    slug: "巴西免签-乔大帅", code: "BR", flag: "🇧🇷", country: "巴西", topic: "30 天限时免签",
    accent: "#c96b38", secondary: "#1e493f", pattern: "BRASIL / 23", policyEffective: "2026-05-11", officialUpdated: "2026-05-11", verified: "2026-08-13", nextReview: "2026-12-15",
    fields: { passport: "有效中国普通护照", purpose: "旅游、商务、过境、艺术或体育活动", stay: "可多次入境；每个 migration year 累计不超过 30 天", cumulative: "migration year 从首次入境日起连续 12 个月计算", visa: "2026-05-11 至 2026-12-31 符合条件可免签", arrivalCard: "按巴西边检、承运人及入境要求", fee: "限时免签本身无签证费", processing: "入境现场审核，不承诺准入", districtException: "工作、学习和其他目的需相应签证", risk: "高" },
    sources: [
      { id: "mre", label: "巴西外交部驻广州总领馆｜签证与免签", url: "https://www.gov.br/mre/pt-br/consulado-cantao/EN/visas/info", pageDate: "2026-05-11" },
      { id: "note", label: "巴西外交部｜中巴换文", url: "https://aplicacao.itamaraty.gov.br/ApiConcordia/Documento/download/34167", pageDate: "2026-05-07" },
      { id: "vfs", label: "巴西签证中心 VFS｜其他目的申请", url: "https://visa.vfsglobal.com/chn/en/bra/apply-visa", pageDate: "2026-08-13" }
    ],
    cards: [
      c("中国护照去巴西免签吗？", "可以，但这是 2026 年限时安排", ["2026-05-11 生效", "有效至 2026-12-31", "仅适用于公告列明短期目的"], ["mre", "note"]),
      c("每次能待几天？", "可多次入境，但每个 migration year 累计不超过 30 天", ["migration year 从首次入境日开始", "不是自然年 1 月到 12 月", "不允许把 30 天反复刷新"], ["mre", "note"], "risk"),
      c("哪些目的适用？", "旅游、商务、过境、艺术或体育活动", ["工作和学习不在免签范围", "商务访问不等于在巴西就业", "目的要能用行程或活动材料解释"], ["mre", "note"]),
      c("入境要带什么？", "护照、返程/续程、住宿或活动证明", ["承运人和边检可能要求补充材料", "按 migration year 记录历史入境", "免签不等于无条件放行"], ["mre"]),
      c("超过 30 天怎么办？", "超过累计上限或其他目的要提前申请相应签证", ["巴西外交部页面指向 VFS 申请流程", "不要先免签入境再从事工作", "签证类别按实际目的选择"], ["mre", "vfs"], "risk"),
      c("巴西免签有成功率吗？", "免签没有签证成功率，入境由边检决定", ["不引用旅行社通过率", "不承诺一定登机或入境", "官方换文只说明政策条件"], ["mre", "note"]),
      c("30 天累计怎么记？", "从第一次入境日起连续 12 个月建立个人记录", ["每次入境和离境日期都保存", "家庭多人也应分别记录", "政策解释变化时回到官方页面核对"], ["mre"]),
      c("巴西官方来源与核验记录", "免签期限、累计口径和回退签证路径分开核验", ["政策生效：2026-05-11", "政策截止：2026-12-31", "本站核验：2026-08-13；12 月前再次复核"], ["mre", "note", "vfs"])
    ]
  },
  {
    slug: "哈萨克斯坦免签-乔大帅", code: "KZ", flag: "🇰🇿", country: "哈萨克斯坦", topic: "30/90/180 免签",
    accent: "#d66d3d", secondary: "#24445b", pattern: "KAZAKHSTAN / 24", policyEffective: "2023-11-10", officialUpdated: "2026-08-14", verified: "2026-08-14", nextReview: "2026-09-14",
    fields: {
      passport: "中国普通护照、旅行证等协定适用证件", purpose: "旅游、私人事务、商务、医疗、国际运输及过境", stay: "单次不超过 30 天",
      cumulative: "每 180 天累计不超过 90 天", visa: "符合协定目的可免签", arrivalCard: "接待方须在抵达后 3 个工作日内完成外国人到达申报", fee: "免签本身无签证费",
      processing: "入境与接待方申报现场核验", districtException: "工作、学习、长期居留及超出协定目的需提前办理相应签证；哈萨克斯坦不办落地签", risk: "中高"
    },
    sources: [
      { id: "agreement", label: "中国外交部｜中哈互免签证协定", url: "https://www.mfa.gov.cn/wjbzwfwpt/kzx/tzgg/202311/t20231103_11172619.html", pageDate: "2023-11-03" },
      { id: "china", label: "中国领事服务网｜哈萨克斯坦入境居留", url: "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/hskst_646454/", pageDate: "2026-08-14" },
      { id: "regime", label: "哈萨克斯坦外交部｜外国人签证制度", url: "https://www.gov.kz/memleket/entities/mfa/activities/34747?lang=en&parentId=3053", pageDate: "2026-07-14" },
      { id: "notify", label: "哈萨克斯坦政府｜外国人到达申报", url: "https://www.gov.kz/situations/497/1149?lang=en", pageDate: "2024-08-05" }
    ],
    cards: [
      c("中国护照去哈萨克斯坦免签吗？", "免签，单次最多 30 天", ["中国普通护照适用", "每 180 天累计最多 90 天", "旅游、商务等协定目的可用"], ["agreement", "china"]),
      c("30 天和 90 天怎么分？", "30 天是单次上限，90 天是滚动 180 天累计上限", ["短暂离境不会自动清零", "多次往返要自己记录", "边境系统记录是最终依据"], ["agreement"], "risk"),
      c("入境后谁要做登记？", "接待方须在抵达后 3 个工作日内申报", ["酒店、房东或其他接待方负责通知", "每次入境和变更住址都要关注", "旅客本人应主动确认申报已完成"], ["notify", "china"]),
      c("要不要自己去移民局？", "一般由接待方通过系统申报，旅客不等于要亲自办登记", ["可使用 vmp.gov.kz 或 eQonaq 等官方渠道", "住私人住所要先和接待方确认", "保存申报或住宿凭证"], ["notify"], "risk"),
      c("入境随身材料", "护照、返程/续程、住宿地址和旅行目的证明", ["边境可能询问资金和下一程", "材料要和免签目的、停留天数一致", "免签不等于保证入境"], ["china", "notify"]),
      c("哪些目的不能用免签？", "工作、学习、长期居留和超出协定目的需相应签证", ["哈萨克斯坦不办理落地签", "不要用频繁出入境代替居留许可", "签证类别要匹配真实目的"], ["china", "regime"], "risk"),
      c("需要申请签证时去哪？", "按哈萨克斯坦驻华使领馆和官方规则提前办理", ["签证需国内审批和返签号时可能更久", "不要把免签入口当成工作签证入口", "只从外交部或使领馆页面进入"], ["china", "regime"]),
      c("哈萨克斯坦官方来源与核验记录", "协定、入境规则和住宿申报分开核验", ["政策生效：2023-11-10", "本站核验：2026-08-14", "下次复核：2026-09-14；变动时提前复核"], ["agreement", "china", "regime", "notify"])
    ]
  },
  {
    slug: "乌兹别克斯坦免签-乔大帅", code: "UZ", flag: "🇺🇿", country: "乌兹别克斯坦", topic: "30/90/180 免签",
    accent: "#d66e3b", secondary: "#244a59", pattern: "UZBEKISTAN / 25", policyEffective: "2025-06-01", officialUpdated: "2026-08-14", verified: "2026-08-14", nextReview: "2026-09-14",
    fields: {
      passport: "中国普通、因公普通及公务护照", purpose: "旅游、私人事务、商务、过境等免签允许目的", stay: "单次不超过 30 天",
      cumulative: "每 180 天累计不超过 90 天", visa: "符合中乌协定可免签", arrivalCard: "住宿地点须在入境后 3 个工作日内完成登记", fee: "免签本身无签证费",
      processing: "入境现场审核；住宿登记由酒店或接待方办理", districtException: "工作、学习、媒体报道或超过 30 天需提前申请相应签证", risk: "中高"
    },
    sources: [
      { id: "agreement", label: "乌兹别克斯坦外交部｜中乌互免签证协定", url: "https://gov.uz/en/mfa/news/view/53659", pageDate: "2025-05-13" },
      { id: "china", label: "中国领事服务网｜乌兹别克斯坦入境居留", url: "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/wzbkst_647880/rjjl_647890/", pageDate: "2026-08-14" },
      { id: "registration", label: "乌兹别克斯坦政府｜外国人登记说明", url: "https://my.gov.uz/en/for-foreigners", pageDate: "2026-07-28" },
      { id: "visa", label: "乌兹别克斯坦政府｜签证与电子签", url: "https://gov.uz/en/mfa/pages/o-zbekiston-respublikasi-vizasi", pageDate: "2026-06-01" }
    ],
    cards: [
      c("中国护照去乌兹别克斯坦免签吗？", "免签，单次最多 30 天", ["中乌互免自 2025-06-01 生效", "每 180 天累计最多 90 天", "旅游、商务、过境等目的仍要符合规则"], ["agreement", "china"]),
      c("超过 30 天能不能续？", "不能把免签直接续成长期停留，需提前申请签证", ["每次停留不能超过 30 天", "工作、学习、媒体活动不在免签范围", "不要先入境再赌能否转身份"], ["agreement", "visa"], "risk"),
      c("住宿登记是必须的吗？", "通常要在入境后 3 个工作日内登记住宿", ["酒店、民宿等住宿机构通常代办", "住私人住所要由接待方或本人按官方系统办理", "变更住址要重新登记"], ["registration", "china"], "risk"),
      c("登记凭证要留着吗？", "要，离境或被查验时可能要求出示", ["保存电子或纸质登记确认", "不要只相信口头说‘酒店已经办了’", "短期过境或不超过规定时长的例外也要出发前确认"], ["registration"]),
      c("入境随身材料", "护照、返程/续程、住宿和旅行目的证明", ["护照建议至少留足 6 个月有效期", "边境可能询问资金与行程", "免签不代表无条件入境"], ["registration", "china"]),
      c("需要申请签证时去哪？", "通过乌兹别克斯坦使领馆或官方 e-Visa 入口办理", ["网上申请表通常需英文填写", "邀请函等材料按签证类别准备", "不要把旅行社收费链接当官方入口"], ["visa", "china"]),
      c("乌兹别克斯坦免签不能做什么？", "工作、学习、媒体报道等须先取得相应许可", ["商务访问不等于在当地就业", "长期居留另走正式路径", "目的不符可能影响入境"], ["agreement", "visa"], "risk"),
      c("乌兹别克斯坦官方来源与核验记录", "免签协定、住宿登记和回退签证路径分开记录", ["政策生效：2025-06-01", "本站核验：2026-08-14", "下次复核：2026-09-14"], ["agreement", "registration", "visa", "china"])
    ]
  },
  {
    slug: "塞尔维亚免签-乔大帅", code: "RS", flag: "🇷🇸", country: "塞尔维亚", topic: "30 天免签",
    accent: "#d6633b", secondary: "#2a3f5e", pattern: "SERBIA / 26", policyEffective: "2017-01-15", officialUpdated: "2026-08-14", verified: "2026-08-14", nextReview: "2026-09-14",
    fields: {
      passport: "有效中国普通护照", purpose: "旅游、商务、探亲及过境等短期访问", stay: "自首次入境起不超过 30 天",
      cumulative: "中塞普通护照互免规则按单次 30 天理解；其他签证便利不要混用", visa: "普通短期访问免签", arrivalCard: "按塞尔维亚边境与住宿登记要求", fee: "免签本身无签证费",
      processing: "入境现场审核", districtException: "工作、学习、长期居留等目的需相应签证/许可；如不适用免签可用官方外国人门户申请", risk: "中"
    },
    sources: [
      { id: "regime", label: "塞尔维亚外交部｜中国签证制度", url: "https://www.mfa.gov.rs/en/citizens/travel-abroad/visas-and-states-travel-advisory/china", pageDate: "2026-08-14" },
      { id: "entry", label: "塞尔维亚外交部｜一般入境要求", url: "https://www.mfa.gov.rs/en/citizens/travel-serbia/general-entry-requirements", pageDate: "2026-08-14" },
      { id: "agreement", label: "塞尔维亚政府｜中塞互免协议生效", url: "https://www.srbija.gov.rs/vest/en/120331/agreement-on-abolition-of-visas-between-serbia-china-in-force.php", pageDate: "2017-01-16" },
      { id: "portal", label: "塞尔维亚外国人门户｜签证申请备用入口", url: "https://welcometoserbia.gov.rs/", pageDate: "2026-08-14" }
    ],
    cards: [
      c("中国护照去塞尔维亚免签吗？", "免签，短期访问最多 30 天", ["适用有效中国普通护照", "中塞普通护照协议已生效", "旅游、商务和过境仍要符合入境要求"], ["regime", "agreement"]),
      c("30 天从什么时候开始？", "从首次入境日期起计算", ["不要把签证便利中的 90/180 口径套到普通护照互免", "离境前自行核对日期", "边境系统记录为最终依据"], ["regime", "agreement"], "risk"),
      c("边境会查什么？", "护照、返程/续程、住宿、资金和旅行目的", ["官方一般要求列出每天约 50 欧元资金证明", "可能要求酒店订单或邀请函", "过境还要证明能进入下一国"], ["entry"]),
      c("健康保险要不要带？", "官方建议携带覆盖至少 20,000 欧元医疗费用的保险", ["建议把保单和行程一起保存", "保险不是免签替代物", "个别公共卫生要求按出发前公告核对"], ["entry"]),
      c("入境被问到怎么办？", "如实说明目的、住宿和返程安排", ["不要用虚假酒店或邀请函", "资料前后一致比堆材料更重要", "边境机关可基于个案拒绝入境"], ["entry"], "risk"),
      c("想工作或待更久怎么办？", "提前走塞尔维亚相应签证或居留路径", ["免签旅游不能转成就业许可", "不适用免签时可查官方外国人门户", "不要依赖中介保证转身份"], ["regime", "portal"], "risk"),
      c("塞尔维亚有电子签申请吗？", "需要签证的情形可从官方外国人门户开始核对", ["普通中国护照短期旅游优先看免签规则", "申请入口和所需材料以门户动态清单为准", "不要把第三方服务商当政府机关"], ["portal", "regime"]),
      c("塞尔维亚官方来源与核验记录", "互免协议、国别制度和一般入境要求交叉核验", ["政策生效：2017-01-15", "本站核验：2026-08-14", "下次复核：2026-09-14"], ["regime", "agreement", "entry", "portal"])
    ]
  },
  {
    slug: "摩洛哥免签-乔大帅", code: "MA", flag: "🇲🇦", country: "摩洛哥", topic: "90 天免签",
    accent: "#d5623d", secondary: "#304a45", pattern: "MOROCCO / 27", policyEffective: "2016-06-01", officialUpdated: "2026-08-14", verified: "2026-08-14", nextReview: "2026-09-14",
    fields: {
      passport: "中国普通护照", purpose: "短期旅游、商务、过境等入境允许目的", stay: "自入境日起不超过 90 天",
      cumulative: "当前官方页面按单次免签期限表述；超过 90 天应提前咨询居留/签证路径", visa: "中国护照免签入境", arrivalCard: "按摩洛哥边检、承运人和海关当期要求", fee: "免签本身无签证费",
      processing: "入境现场审核", districtException: "工作、长期居留等目的不能只用旅游免签；护照有效期应大于 6 个月", risk: "中"
    },
    sources: [
      { id: "entry", label: "中国领事服务网｜摩洛哥入境居留", url: "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/mlg_650861/rjjl_650871/", pageDate: "2026-08-14" },
      { id: "detail", label: "中国领事服务网｜摩洛哥免签细化说明", url: "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/mlg_650861/fwxx/201606/t20160607_940983.shtml", pageDate: "2016-06-07" },
      { id: "consulat", label: "摩洛哥领事事务官方门户", url: "https://www.consulat.ma/", pageDate: "2026-08-14" },
      { id: "customs", label: "摩洛哥海关官方门户", url: "https://www.douane.gov.ma/", pageDate: "2026-08-14" }
    ],
    cards: [
      c("中国护照去摩洛哥免签吗？", "免签，最长停留 90 天", ["中国普通护照适用", "免签自 2016-06-01 实施", "实际准入仍由边境机关决定"], ["entry", "detail"]),
      c("护照要剩多久有效？", "入境时有效期应大于 6 个月", ["破损、空白页不足也可能影响登机", "儿童需要自己的有效旅行证件", "出发前让承运人再次核对"], ["entry", "detail"]),
      c("边检可能要看什么？", "机票、酒店订单、公司邀请函等行程材料可能被查", ["免签不等于只带护照就一定放行", "商务和旅游目的要与材料一致", "建议保存返程/续程和资金证明"], ["entry"]),
      c("90 天是自然年额度吗？", "页面明确按入境日起不超过 90 天表述", ["不要自行写成每年自动重置", "超过 90 天要提前咨询居留或签证", "离境日纳入个人行程规划"], ["entry", "detail"], "risk"),
      c("第三国飞过去可以吗？", "免签判断看中国护照和摩洛哥规则，不以是否从中国出发为前提", ["仍要满足转机国家过境要求", "白本护照也不能跳过边境审查", "保持完整行程证据"], ["detail"]),
      c("能不能工作或长期住？", "不能用旅游免签替代工作许可或居留证", ["长期居留应抵达后及时咨询当地部门", "超期且未办居留可能面临罚款或驱逐", "不要相信‘免签转工签包办’"], ["entry"], "risk"),
      c("入境前有没有网上申请？", "短期免签本身没有签证申请流程", ["可查看摩洛哥领事事务门户的最新要求", "海关物品和货币规则另看官方海关页面", "警惕收费仿冒签证站"], ["consulat", "customs"]),
      c("摩洛哥官方来源与核验记录", "免签结论、边检材料和海关规则分别记录", ["政策生效：2016-06-01", "本站核验：2026-08-14", "下次复核：2026-09-14"], ["entry", "detail", "consulat", "customs"])
    ]
  }
];
