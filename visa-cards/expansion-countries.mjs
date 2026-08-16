// 第一批扩展目的地：先把官方入口、申请顺序和材料框架放进统一数据层。
// 这里不把第三方攻略或“通过率”写成政策结论；各国具体停留期限、费用和资格，
// 以对应官方页面在提交当天显示的内容为准。研究组会在每周复核时补齐政策生效日期。
const VERIFIED = "2026-08-14";

const card = (title, answer, bullets, tone = "standard") => ({
  title, answer, bullets,
  sourceIds: ["main", "guide"],
  tone
});

const commonCards = spec => {
  const route = spec.routeLabel;
  return [
    card(`中国护照去${spec.country}，先判断哪条路径？`, `${route}：先看官方入口，再确认护照、目的和停留期限`, ["只按中国普通护照和短期访问场景核对", "工作、学习、长期居留另有路径", "签证或电子许可不等于保证入境"]),
    card(`${spec.country}的官方申请入口在哪里？`, "只从本页列出的政府或移民部门网站开始", ["先看官方资格判断，再开始填表或预约", "记下申请编号和提交日期", "警惕把代办、广告页伪装成官方入口"]),
    card(`申请${spec.country}要准备哪些资料？`, "护照、照片或个人信息、行程住宿和资金材料是常见基础", ["最终清单以官方系统生成的版本为准", "按‘需要’、‘按情况’和‘建议随身’分开整理", "所有日期、姓名和旅行目的要前后一致"]),
    card(`${spec.country}的费用和办理时间怎么看？`, "费用、排期和处理时间以官方页面当天显示为准", ["参考时效不是出签承诺", "补件、旺季和背景核查都可能延长", "付款前核对域名、币种和退款规则"], "risk"),
    card(`电子签、入境许可和贴纸签怎么区分？`, "看官方页面写的是 eVisa、eTA、入境许可还是领馆贴纸签", ["电子许可通常要在登机前取得批准", "贴纸签还要按领区预约和递交材料", "不要把旅游许可当作工作许可"]),
    card(`到${spec.country}入境时可能查什么？`, "护照、返程或续程、住宿、资金和旅行目的可能被核对", ["材料应能互相印证", "边境官员拥有最终入境决定权", "保存批准信、付款凭证和住宿信息的离线副本"]),
    card(`哪些事情不能用这条短期路径做？`, "不能用短期旅游路径替代就业、留学或长期居留许可", ["需要工作或经营时先查当地许可", "不要超期停留或用虚假材料", "特殊行业、未成年人和第三国转机另行核对"], "risk"),
    card(`${spec.country}的官方来源和核验日期`, "申请前再打开官方页面，确认页面内容和域名没有变化", ["本站核验：2026-08-14", "下次计划复核：2026-08-21", "本站只整理公开规则，不代办、不承诺结果"])
  ];
};

const doc = (name, detail, required = true) => ({ name, detail, required });
const guide = spec => ({
  routeType: spec.routeType,
  routeLabel: spec.routeLabel,
  applicationLabel: spec.applicationLabel,
  applicationUrl: spec.applicationUrl,
  officialGuideLabel: spec.guideLabel,
  officialGuideUrl: spec.guideUrl,
  documentsLabel: spec.documentsLabel || `${spec.country}官方材料说明`,
  documentsUrl: spec.documentsUrl || spec.guideUrl,
  processingUrl: spec.processingUrl || spec.guideUrl,
  feeUrl: spec.feeUrl || spec.guideUrl,
  requiredDocuments: [
    doc("有效中国普通护照", "按官方页面要求留足有效期和空白页"),
    doc("个人信息与证件照片", "按在线系统或使领馆当期格式准备"),
    doc("行程、住宿和返程安排", "日期与访问目的保持一致"),
    doc("资金或资助证明", "按个人情况准备银行、收入或资助材料"),
    doc("入境许可或签证批准凭证", "如系统要求，出发前下载并保存离线副本"),
    doc("翻译、邀请或行业许可", "只在官方清单或个人情况要求时准备", false)
  ],
  applicationSteps: [
    `进入${spec.country}官方门户，先判断中国普通护照适用的访问类别`,
    "按官方清单准备资料，填写表格并核对姓名、护照号和日期",
    "按系统提示付款、预约或提交电子申请，保存回执和申请编号",
    "收到批准、签证或补件通知后，按通知完成下一步",
    "出发前再次打开官方页面，确认入境、停留和承运人要求"
  ],
  successRate: {
    status: "not_published",
    label: "官方未提供可直接套用的中国普通护照个人成功率",
    url: spec.guideUrl,
    note: "不要把旅行社、论坛或个案经验换算成个人成功率；实际决定取决于申请材料、访问目的和边境审查。"
  },
  riskTips: [
    "申请前先确认自己使用的是普通护照，外交、公务或旅行证规则可能不同",
    "费用、时效、领区和材料清单会变，提交前以官方页面为准",
    "不要把免签、电子许可或旅游签证当作工作、留学或长期居留许可"
  ],
  lastVerified: VERIFIED
});

const specs = [
  { code: "NL", country: "荷兰", flag: "🇳🇱", slug: "荷兰签证-乔大帅", topic: "申根短期签证", routeType: "visa", routeLabel: "申请申根签证", applicationLabel: "查看荷兰申根签证申请", applicationUrl: "https://www.netherlandsworldwide.nl/visa-the-netherlands/schengen-visa/apply-china", guideLabel: "NetherlandsWorldwide｜中国申请说明", guideUrl: "https://www.netherlandsworldwide.nl/visa-the-netherlands/schengen-visa/apply-china", documentsUrl: "https://www.netherlandsworldwide.nl/visa-the-netherlands/schengen-visa", processingUrl: "https://www.netherlandsworldwide.nl/visa-the-netherlands/schengen-visa/apply-china", feeUrl: "https://www.netherlandsworldwide.nl/visa-the-netherlands/schengen-visa/apply-china" },
  { code: "CH", country: "瑞士", flag: "🇨🇭", slug: "瑞士签证-乔大帅", topic: "申根短期签证", routeType: "visa", routeLabel: "申请申根签证", applicationLabel: "查看瑞士申根签证申请", applicationUrl: "https://www.eda.admin.ch/countries/china/en/home/visa/entry-ch.html", guideLabel: "瑞士驻华使馆｜签证与入境", guideUrl: "https://www.eda.admin.ch/countries/china/en/home/visa/entry-ch.html", documentsUrl: "https://www.eda.admin.ch/content/countries/china/en/home/visa/einreise-ch/bis-90-tage/dokumente-schengen.html", processingUrl: "https://www.eda.admin.ch/countries/china/en/home/visa/entry-ch.html", feeUrl: "https://www.eda.admin.ch/countries/china/en/home/visa/entry-ch.html" },
  { code: "GR", country: "希腊", flag: "🇬🇷", slug: "希腊签证-乔大帅", topic: "申根短期签证", routeType: "visa", routeLabel: "申请申根签证", applicationLabel: "查看希腊签证要求", applicationUrl: "https://www.mfa.gr/en/services/visas-for-foreigners-traveling-to-greece/", guideLabel: "希腊外交部｜签证服务", guideUrl: "https://www.mfa.gr/en/services/visas-for-foreigners-traveling-to-greece/", documentsUrl: "https://www.mfa.gr/en/services/visas-for-foreigners-traveling-to-greece/countries-requiring-or-not-requiring-a-visa/", processingUrl: "https://www.mfa.gr/en/services/visas-for-foreigners-traveling-to-greece/", feeUrl: "https://www.mfa.gr/en/services/visas-for-foreigners-traveling-to-greece/" },
  { code: "PT", country: "葡萄牙", flag: "🇵🇹", slug: "葡萄牙签证-乔大帅", topic: "申根短期签证", routeType: "visa", routeLabel: "申请申根签证", applicationLabel: "查看葡萄牙签证门户", applicationUrl: "https://vistos.mne.gov.pt/en/", guideLabel: "葡萄牙外交部｜签证门户", guideUrl: "https://vistos.mne.gov.pt/en/", documentsUrl: "https://vistos.mne.gov.pt/en/national-visas/general-information/type-of-visa", processingUrl: "https://vistos.mne.gov.pt/en/short-stay-visas-schengen", feeUrl: "https://vistos.mne.gov.pt/en/short-stay-visas-schengen" },
  { code: "MX", country: "墨西哥", flag: "🇲🇽", slug: "墨西哥签证-乔大帅", topic: "访客签证与入境核验", routeType: "visa", routeLabel: "申请访客签证或核对豁免", applicationLabel: "查看墨西哥外交部签证要求", applicationUrl: "https://www.gob.mx/sre/acciones-y-programas/visas-for-foreigners", guideLabel: "墨西哥外交部｜外国人签证", guideUrl: "https://www.gob.mx/sre/acciones-y-programas/visas-for-foreigners", documentsUrl: "https://www.gob.mx/sre/acciones-y-programas/visas-for-foreigners", processingUrl: "https://www.gob.mx/sre/acciones-y-programas/visas-for-foreigners", feeUrl: "https://www.gob.mx/sre/acciones-y-programas/visas-for-foreigners" },
  { code: "SA", country: "沙特阿拉伯", flag: "🇸🇦", slug: "沙特阿拉伯签证-乔大帅", topic: "旅游电子签与入境许可", routeType: "evisa", routeLabel: "电子签 / 入境许可", applicationLabel: "进入沙特官方电子签门户", applicationUrl: "https://visa.visitsaudi.com/", guideLabel: "Visit Saudi｜官方电子签", guideUrl: "https://visa.visitsaudi.com/", documentsUrl: "https://visa.visitsaudi.com/Home/TermsConditions", processingUrl: "https://visa.visitsaudi.com/", feeUrl: "https://visa.visitsaudi.com/" },
  { code: "EG", country: "埃及", flag: "🇪🇬", slug: "埃及签证-乔大帅", topic: "电子签与入境签证", routeType: "evisa", routeLabel: "电子签 / 入境核验", applicationLabel: "进入埃及官方电子签门户", applicationUrl: "https://visa2egypt.gov.eg/", guideLabel: "Egypt e-Visa Portal｜官方入口", guideUrl: "https://visa2egypt.gov.eg/", documentsUrl: "https://visa2egypt.gov.eg/eVisa/ar/Home", processingUrl: "https://visa2egypt.gov.eg/", feeUrl: "https://visa2egypt.gov.eg/" },
  { code: "ZA", country: "南非", flag: "🇿🇦", slug: "南非签证-乔大帅", topic: "访客签证与电子申请", routeType: "evisa", routeLabel: "电子申请 / 访客签证", applicationLabel: "查看南非官方电子签入口", applicationUrl: "https://ehome.dha.gov.za/epermit/", guideLabel: "South Africa Home Affairs｜电子申请", guideUrl: "https://ehome.dha.gov.za/epermit/", documentsUrl: "https://www.dha.gov.za/index.php/types-of-visas", processingUrl: "https://www.dha.gov.za/index.php/types-of-visas", feeUrl: "https://www.dha.gov.za/index.php/types-of-visas" },
  { code: "KE", country: "肯尼亚", flag: "🇰🇪", slug: "肯尼亚电子许可-乔大帅", topic: "电子旅行授权 eTA", routeType: "evisa", routeLabel: "电子旅行授权", applicationLabel: "进入肯尼亚官方 eTA 入口", applicationUrl: "https://etakenya.go.ke/", guideLabel: "Kenya eTA｜政府官方入口", guideUrl: "https://etakenya.go.ke/apply/start/help", documentsUrl: "https://etakenya.go.ke/general-information", processingUrl: "https://etakenya.go.ke/general-information", feeUrl: "https://etakenya.go.ke/general-information" },
  { code: "TZ", country: "坦桑尼亚", flag: "🇹🇿", slug: "坦桑尼亚签证-乔大帅", topic: "电子签与落地签", routeType: "evisa", routeLabel: "电子签 / 落地签核验", applicationLabel: "进入坦桑尼亚官方电子签入口", applicationUrl: "https://visa.immigration.go.tz/", guideLabel: "Tanzania eVisa｜移民局官方入口", guideUrl: "https://visa.immigration.go.tz/guidelines", documentsUrl: "https://visa.immigration.go.tz/guidelines", processingUrl: "https://visa.immigration.go.tz/", feeUrl: "https://visa.immigration.go.tz/" },
  { code: "AZ", country: "阿塞拜疆", flag: "🇦🇿", slug: "阿塞拜疆电子签-乔大帅", topic: "电子签证", routeType: "evisa", routeLabel: "电子签证", applicationLabel: "进入阿塞拜疆官方电子签入口", applicationUrl: "https://evisa.gov.az/en/", guideLabel: "ASAN Visa｜官方电子签", guideUrl: "https://evisa.gov.az/en/", documentsUrl: "https://evisa.gov.az/en/information", processingUrl: "https://evisa.gov.az/en/", feeUrl: "https://evisa.gov.az/en/" },
  { code: "AM", country: "亚美尼亚", flag: "🇦🇲", slug: "亚美尼亚签证-乔大帅", topic: "电子签与签证申请", routeType: "evisa", routeLabel: "电子签 / 签证核验", applicationLabel: "进入亚美尼亚官方电子签入口", applicationUrl: "https://evisa.mfa.am/", guideLabel: "Armenia MFA｜电子签门户", guideUrl: "https://evisa.mfa.am/", documentsUrl: "https://evisa.mfa.am/", processingUrl: "https://evisa.mfa.am/", feeUrl: "https://evisa.mfa.am/" },
  { code: "MN", country: "蒙古国", flag: "🇲🇳", slug: "蒙古国签证-乔大帅", topic: "电子签与签证申请", routeType: "evisa", routeLabel: "电子签 / 领馆签证", applicationLabel: "查看蒙古官方签证入口", applicationUrl: "https://evisa.mn/", guideLabel: "蒙古电子签官方门户", guideUrl: "https://evisa.mn/", documentsUrl: "https://immigration.gov.mn/", processingUrl: "https://evisa.mn/", feeUrl: "https://evisa.mn/" },
  { code: "QA", country: "卡塔尔", flag: "🇶🇦", slug: "卡塔尔签证-乔大帅", topic: "入境许可与电子签", routeType: "evisa", routeLabel: "入境许可 / 电子签核验", applicationLabel: "查看卡塔尔官方签证说明", applicationUrl: "https://visitqatar.com/intl-en/practical-info/visas", guideLabel: "Visit Qatar｜官方签证说明", guideUrl: "https://visitqatar.com/intl-en/practical-info/visas", documentsUrl: "https://visitqatar.com/intl-en/practical-info/visas", processingUrl: "https://visitqatar.com/intl-en/practical-info/visas", feeUrl: "https://visitqatar.com/intl-en/practical-info/visas" },
  { code: "OM", country: "阿曼", flag: "🇴🇲", slug: "阿曼电子签-乔大帅", topic: "电子签证", routeType: "evisa", routeLabel: "电子签证", applicationLabel: "进入阿曼皇家警察电子签入口", applicationUrl: "https://evisa.rop.gov.om/", guideLabel: "Royal Oman Police｜电子签", guideUrl: "https://evisa.rop.gov.om/", documentsUrl: "https://evisa.rop.gov.om/", processingUrl: "https://evisa.rop.gov.om/", feeUrl: "https://evisa.rop.gov.om/" },
  { code: "PK", country: "巴基斯坦", flag: "🇵🇰", slug: "巴基斯坦签证-乔大帅", topic: "在线签证申请", routeType: "visa", routeLabel: "在线签证申请", applicationLabel: "进入巴基斯坦官方签证门户", applicationUrl: "https://visa.nadra.gov.pk/", guideLabel: "Pakistan Online Visa System｜官方入口", guideUrl: "https://visa.nadra.gov.pk/", documentsUrl: "https://visa.nadra.gov.pk/", processingUrl: "https://visa.nadra.gov.pk/", feeUrl: "https://visa.nadra.gov.pk/" },
  { code: "NP", country: "尼泊尔", flag: "🇳🇵", slug: "尼泊尔入境许可-乔大帅", topic: "电子申请与落地签", routeType: "evisa", routeLabel: "电子申请 / 落地签核验", applicationLabel: "查看尼泊尔移民局官方入口", applicationUrl: "https://nepaliport.immigration.gov.np/", guideLabel: "Nepal Immigration｜入境与签证", guideUrl: "https://www.immigration.gov.np/", documentsUrl: "https://nepaliport.immigration.gov.np/", processingUrl: "https://www.immigration.gov.np/", feeUrl: "https://www.immigration.gov.np/" },
  { code: "BD", country: "孟加拉国", flag: "🇧🇩", slug: "孟加拉国签证-乔大帅", topic: "签证与入境申请", routeType: "visa", routeLabel: "签证申请", applicationLabel: "查看孟加拉国官方签证门户", applicationUrl: "https://visa.gov.bd/", guideLabel: "Bangladesh Visa Portal｜官方入口", guideUrl: "https://visa.gov.bd/", documentsUrl: "https://visa.gov.bd/", processingUrl: "https://visa.gov.bd/", feeUrl: "https://visa.gov.bd/" },
  { code: "LK", country: "斯里兰卡", flag: "🇱🇰", slug: "斯里兰卡电子许可-乔大帅", topic: "ETA 电子旅行许可", routeType: "evisa", routeLabel: "ETA 电子旅行许可", applicationLabel: "进入斯里兰卡官方 ETA 入口", applicationUrl: "https://eta.gov.lk/", guideLabel: "Sri Lanka ETA｜官方入口", guideUrl: "https://eta.gov.lk/", documentsUrl: "https://eta.gov.lk/slvisa/visainfo/center.jsp", processingUrl: "https://eta.gov.lk/", feeUrl: "https://eta.gov.lk/" },
  { code: "JO", country: "约旦", flag: "🇯🇴", slug: "约旦签证-乔大帅", topic: "签证与入境许可", routeType: "visa", routeLabel: "签证 / 入境许可核验", applicationLabel: "查看约旦内政部电子服务", applicationUrl: "https://eservices.moi.gov.jo/", guideLabel: "Jordan Ministry of Interior｜电子服务", guideUrl: "https://moi.gov.jo/", documentsUrl: "https://eservices.moi.gov.jo/", processingUrl: "https://moi.gov.jo/", feeUrl: "https://eservices.moi.gov.jo/" },
  { code: "MV", country: "马尔代夫", flag: "🇲🇻", slug: "马尔代夫入境-乔大帅", topic: "抵达签发旅游许可", routeType: "visa_free", routeLabel: "抵达签发旅游许可", applicationLabel: "查看马尔代夫入境要求", applicationUrl: "https://www.immigration.gov.mv/", guideLabel: "Maldives Immigration｜官方入境要求", guideUrl: "https://www.immigration.gov.mv/", documentsUrl: "https://www.immigration.gov.mv/", processingUrl: "https://www.immigration.gov.mv/", feeUrl: "https://www.immigration.gov.mv/", island: true },
  { code: "MU", country: "毛里求斯", flag: "🇲🇺", slug: "毛里求斯入境-乔大帅", topic: "入境许可与签证核验", routeType: "evisa", routeLabel: "入境许可 / 签证核验", applicationLabel: "查看毛里求斯护照与移民局要求", applicationUrl: "https://passport.govmu.org/", guideLabel: "Mauritius Passport and Immigration｜官方入口", guideUrl: "https://passport.govmu.org/", documentsUrl: "https://passport.govmu.org/", processingUrl: "https://passport.govmu.org/", feeUrl: "https://passport.govmu.org/", island: true },
  { code: "SC", country: "塞舌尔", flag: "🇸🇨", slug: "塞舌尔入境许可-乔大帅", topic: "旅行授权与入境许可", routeType: "evisa", routeLabel: "旅行授权 / 入境许可", applicationLabel: "进入塞舌尔官方旅行授权入口", applicationUrl: "https://seychelles.govtas.com/", guideLabel: "Seychelles Immigration｜官方旅行授权", guideUrl: "https://www.ics.gov.sc/", documentsUrl: "https://www.ics.gov.sc/", processingUrl: "https://seychelles.govtas.com/", feeUrl: "https://seychelles.govtas.com/", island: true },
  { code: "FJ", country: "斐济", flag: "🇫🇯", slug: "斐济入境-乔大帅", topic: "免签与访客入境许可", routeType: "visa_free", routeLabel: "免签 / 访客许可", applicationLabel: "查看斐济移民局官方要求", applicationUrl: "https://www.immigration.gov.fj/", guideLabel: "Fiji Immigration｜官方入境要求", guideUrl: "https://www.immigration.gov.fj/", documentsUrl: "https://www.immigration.gov.fj/", processingUrl: "https://www.immigration.gov.fj/", feeUrl: "https://www.immigration.gov.fj/", island: true },
  { code: "WS", country: "萨摩亚", flag: "🇼🇸", slug: "萨摩亚入境-乔大帅", topic: "访客入境许可", routeType: "evisa", routeLabel: "访客入境许可核验", applicationLabel: "查看萨摩亚官方入境要求", applicationUrl: "https://www.samoagovt.ws/", guideLabel: "Samoa Government｜官方入口", guideUrl: "https://www.samoagovt.ws/", documentsUrl: "https://www.samoagovt.ws/", processingUrl: "https://www.samoagovt.ws/", feeUrl: "https://www.samoagovt.ws/", island: true },
  { code: "TO", country: "汤加", flag: "🇹🇴", slug: "汤加入境-乔大帅", topic: "访客签证与入境许可", routeType: "evisa", routeLabel: "访客签证 / 入境许可", applicationLabel: "查看汤加官方入境要求", applicationUrl: "https://www.revenue.gov.to/immigration-and-general-services", guideLabel: "汤加税收与海关部门｜移民服务", guideUrl: "https://www.revenue.gov.to/immigration-and-general-services", documentsUrl: "https://www.gov.to/wp-content/uploads/2025/01/Visitors-VISA.pdf", processingUrl: "https://www.revenue.gov.to/immigration-and-general-services", feeUrl: "https://www.revenue.gov.to/immigration-and-general-services", island: true },
  { code: "VU", country: "瓦努阿图", flag: "🇻🇺", slug: "瓦努阿图入境-乔大帅", topic: "免签与访客入境许可", routeType: "visa_free", routeLabel: "免签 / 访客许可", applicationLabel: "查看瓦努阿图移民局官方要求", applicationUrl: "https://immigration.gov.vu/", guideLabel: "Vanuatu Immigration｜官方入口", guideUrl: "https://immigration.gov.vu/", documentsUrl: "https://immigration.gov.vu/", processingUrl: "https://immigration.gov.vu/", feeUrl: "https://immigration.gov.vu/", island: true },
  { code: "SB", country: "所罗门群岛", flag: "🇸🇧", slug: "所罗门群岛入境-乔大帅", topic: "访客签证与入境许可", routeType: "evisa", routeLabel: "访客签证 / 入境许可", applicationLabel: "查看所罗门群岛移民局官方要求", applicationUrl: "https://immigration.gov.sb/", guideLabel: "Solomon Islands Immigration｜官方入口", guideUrl: "https://immigration.gov.sb/", documentsUrl: "https://immigration.gov.sb/", processingUrl: "https://immigration.gov.sb/", feeUrl: "https://immigration.gov.sb/", island: true },
  { code: "PW", country: "帕劳", flag: "🇵🇼", slug: "帕劳入境-乔大帅", topic: "访客入境许可", routeType: "evisa", routeLabel: "访客入境许可核验", applicationLabel: "查看帕劳政府官方入境要求", applicationUrl: "https://www.palaugov.pw/", guideLabel: "Palau Government｜官方入口", guideUrl: "https://www.palaugov.pw/", documentsUrl: "https://www.palaugov.pw/", processingUrl: "https://www.palaugov.pw/", feeUrl: "https://www.palaugov.pw/", island: true },
  { code: "BS", country: "巴哈马", flag: "🇧🇸", slug: "巴哈马入境-乔大帅", topic: "访客签证与入境许可", routeType: "evisa", routeLabel: "访客签证 / 入境许可", applicationLabel: "查看巴哈马移民局官方要求", applicationUrl: "https://www.immigration.gov.bs/", guideLabel: "Bahamas Immigration｜官方入口", guideUrl: "https://www.immigration.gov.bs/", documentsUrl: "https://www.immigration.gov.bs/", processingUrl: "https://www.immigration.gov.bs/", feeUrl: "https://www.immigration.gov.bs/", island: true }
];

export const expansionCountries = specs.map((spec, index) => ({
  slug: spec.slug,
  code: spec.code,
  flag: spec.flag,
  country: spec.country,
  topic: spec.topic,
  accent: ["#d95f2a", "#d66d3d", "#c9623a", "#e17938"][index % 4],
  secondary: ["#18334f", "#233a61", "#234b46", "#304a45"][index % 4],
  pattern: `${spec.code} / ${String(index + 28).padStart(2, "0")}`,
  policyEffective: "待逐条核验",
  officialUpdated: VERIFIED,
  verified: VERIFIED,
  nextReview: "2026-08-21",
  island: Boolean(spec.island),
  fields: {
    passport: "中国普通护照",
    purpose: "短期旅游或官方允许的访问目的",
    stay: "以官方页面和入境许可显示为准",
    cumulative: "不要自行推算累计期限，按官方规则记录每次出入境",
    visa: spec.routeLabel,
    arrivalCard: "以承运人、边检和目的地官方页面当期要求为准",
    fee: "费用以官方系统提交页面显示为准",
    processing: "官方系统或使领馆公布的参考时间，不构成出签承诺",
    districtException: "中国大陆申请人按目的地官方入口与居住地/领区要求核对",
    risk: "中高"
  },
  sources: [
    { id: "main", label: spec.guideLabel, url: spec.guideUrl, pageDate: VERIFIED },
    { id: "guide", label: `${spec.country}官方申请或入境指南`, url: spec.documentsUrl, pageDate: VERIFIED },
    { id: "entry", label: `${spec.country}官方入境页面`, url: spec.processingUrl, pageDate: VERIFIED }
  ],
  cards: commonCards(spec)
}));

export const expansionGuides = Object.fromEntries(specs.map(spec => [spec.code, guide(spec)]));
