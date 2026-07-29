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
    policyEffective: "2018-01-16", officialUpdated: "2026-07-29", verified: VERIFIED, nextReview: "2026-08-29",
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
    policyEffective: "2025-11-03", officialUpdated: "2026-07-29", verified: VERIFIED, nextReview: "2026-08-29",
    fields: {
      passport: "中国普通护照", purpose: "旅游、探亲访友", stay: "多次签每 12 个月累计最多 6 个月；单次签最多 9 个月/18 个月",
      cumulative: "以获批签证的入境次数和条件为准", visa: "通常需要 Visitor Visa；符合澳洲出发试点者可改用 NZeTA",
      arrivalCard: "需要 New Zealand Traveller Declaration，最早出发前 24 小时提交",
      fee: "Visitor Visa 自 NZD 441 起", processing: "官方当前显示 80% 约 1.5–2 周，动态变化",
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
      c("费用和时间", "自 NZD 441 起，80% 约 1.5–2 周", ["处理时间会动态变化", "材料不足可能延误或拒签", "官方建议获批前别订不可退行程"], ["guide", "visitor"]),
      c("材料核心是什么？", "真实访客、足够资金、会按期离境", ["中文文件需按要求提供英文翻译", "提交原件扫描件和译文", "行程与个人财务能力匹配"], ["guide"]),
      c("特殊 NZeTA 试点", "持合资格澳签并从澳大利亚出发，可免 Visitor Visa", ["试点自 2025-11-03 起运行 12 个月", "每次都必须从澳大利亚出发", "停留最多 3 个月并持有效 NZeTA"], ["trial", "nzeta"], "risk"),
      c("NZTD 什么时候填？", "最早可在开始旅行前 24 小时提交", ["数字或纸质申报按官方要求", "如实申报食品、药品与生物安全物品", "保存提交确认"], ["guide"]),
      c("入境时准备什么？", "护照、签证/NZeTA、返程、住宿和资金证明", ["边检会判断是否仍为真实访客", "海关和生物安全检查独立进行", "回答与申请保持一致"], ["guide", "visitor"]),
      c("新西兰官方来源与核验记录", "普通路径与澳洲出发试点必须分开写", ["本页核验：2026-07-29", "试点到期前重点复核", "费用和处理时间每次出发前重查"], ["guide", "visitor", "trial", "nzeta"])
    ]
  },
  {
    slug: "加拿大签证-乔大帅", code: "CA", flag: "🇨🇦", country: "加拿大", topic: "Visitor Visa",
    accent: "#d85f3a", secondary: "#34404b", pattern: "CANADA / 17",
    policyEffective: "2026-05-26", officialUpdated: "2026-07-19", verified: VERIFIED, nextReview: "2026-08-29",
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
    slug: "俄罗斯电子签-乔大帅", code: "RU", flag: "🇷🇺", country: "俄罗斯", topic: "统一电子签证",
    accent: "#d3633b", secondary: "#29405c", pattern: "RUSSIA / 20",
    policyEffective: "2025-08-23", officialUpdated: "2026-07-29", verified: VERIFIED, nextReview: "2026-08-05",
    fields: {
      passport: "符合名单要求的中国普通护照", purpose: "旅游、私人访问、商务及电子签允许活动",
      stay: "单次最多 30 天", cumulative: "签发后 120 天内使用，离境不得晚于第 120 天",
      visa: "需要，可申请统一电子签证", arrivalCard: "按俄罗斯边境与移民登记要求",
      fee: "以俄罗斯外交部电子签系统支付页为准", processing: "官方称 4 个日历日，不含提交当天",
      districtException: "只能从政府批准的电子签口岸出入境；住宿方通常办理移民登记", risk: "高"
    },
    sources: [
      { id: "portal", label: "俄罗斯外交部｜统一电子签", url: "https://electronic-visa.kdmid.ru/index_en.html", pageDate: "2026-07-29" },
      { id: "faq", label: "俄罗斯外交部｜电子签 FAQ", url: "https://electronic-visa.kdmid.ru/faq_en.html", pageDate: "2026-07-29" }
    ],
    cards: [
      c("中国护照去俄罗斯怎么签？", "短期旅游可申请统一电子签证", ["不需要邀请函或旅游确认函", "在线填表、付费、收取签发通知", "适用目的以官方清单为准"], ["portal", "faq"]),
      c("2025 年后有效期怎么变？", "签发后 120 天内使用，单次最多停留 30 天", ["新规则自 2025-08-23 起适用", "离境不得晚于签发后第 120 天", "有效期不等于能住 120 天"], ["faq"], "risk"),
      c("多久处理？", "官方称 4 个日历日，不含提交当天", ["周末和法定假日计入官方处理表述", "退回修改后会重新计算", "不要压着出发日申请"], ["portal", "faq"]),
      c("只认哪个网站？", "只认 electronic-visa.kdmid.ru", ["警惕代办仿冒站", "逐字核对护照号和姓名", "保存通知并下载到手机"], ["portal"], "risk"),
      c("哪些口岸能走？", "只能从政府批准的电子签口岸出入境", ["入境和离境口岸都必须在名单内", "不能从未授权口岸离境", "订票前先查最新口岸清单"], ["faq"]),
      c("入境随身材料", "护照、电子签通知、返程、住宿和保险等", ["承运人和边境都会核验通知", "电子版之外建议准备打印备份", "签证不保证入境"], ["portal"]),
      c("移民登记怎么做？", "一般需在抵达住宿地后 7 个工作日内办理", ["住酒店通常由酒店自动办理", "住私人住所要确认申报责任", "保存登记凭证至离境"], ["faq"], "risk"),
      c("俄罗斯官方来源与核验记录", "有效期、停留期、口岸和登记均以外交部系统为准", ["政策生效：2025-08-23", "本页核验：2026-07-29", "每周扫描口岸与电子签规则"], ["portal", "faq"])
    ]
  }
];
