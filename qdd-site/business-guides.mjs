import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 出海专题数据：政策入口来自官方机构；开户经验来自公开社区，只用于提示核验问题。
// “热度排行”是编辑排序，不是政府、银行或投资建议，也不代表获签、开户或注册成功率。

export const businessRanking = [
  { rank: 1, code: "SG", country: "新加坡", score: 92, tags: ["区域总部", "英语商业环境", "金融与支付"], reason: "公司法和监管入口清楚，适合做东南亚总部；真正难点是本地董事、实质业务和银行 KYC。" },
  { rank: 2, code: "AE", country: "阿联酋", score: 90, tags: ["中东枢纽", "自由区", "跨境贸易"], reason: "自由区与大陆公司路径多，适合中东、非洲和跨境贸易；成本、牌照、办公场地和银行尽调不能只看注册报价。" },
  { rank: 3, code: "US", country: "美国", score: 88, tags: ["融资与市场", "软件公司", "全球收款"], reason: "州级注册灵活、市场和支付工具丰富；州税、联邦申报、实际经营地址和银行/支付 KYC 需要分开处理。" },
  { rank: 4, code: "GB", country: "英国", score: 84, tags: ["欧洲业务", "公司透明", "英语市场"], reason: "Companies House 注册流程直观，适合欧洲业务和服务型公司；税务、注册地址、银行实质经营仍要准备充分。" },
  { rank: 5, code: "AU", country: "澳大利亚", score: 81, tags: ["亚太市场", "教育与服务", "合规清晰"], reason: "ASIC、ABR 和税务入口明确；非居民需要处理本地董事、注册地址、税务身份和银行面审。" },
  { rank: 6, code: "JP", country: "日本", score: 79, tags: ["日本市场", "品牌与贸易", "长期经营"], reason: "市场稳定、品牌和贸易机会明确；日语文件、实际办公室、会计税务和经营管理签证门槛更高。" },
  { rank: 7, code: "CA", country: "加拿大", score: 77, tags: ["北美市场", "跨境服务", "移民联动"], reason: "联邦及省级公司体系成熟；注册地、董事规则、税务居民身份和银行开户要按省/联邦拆开核验。" },
  { rank: 8, code: "MY", country: "马来西亚", score: 75, tags: ["东南亚制造", "电商", "成本相对可控"], reason: "靠近东盟、制造和电商场景较多；外资比例、行业许可、董事和实缴资本要求随行业变化。" },
  { rank: 9, code: "TH", country: "泰国", score: 73, tags: ["旅游消费", "东盟运营", "本地合作"], reason: "旅游、消费和区域运营机会多；外国人经营限制、工作许可、股权结构和本地雇员要求需要专门核验。" },
  { rank: 10, code: "ID", country: "印度尼西亚", score: 71, tags: ["人口市场", "电商", "本地运营"], reason: "市场规模大，但 PMA、行业分类、最低投资与本地许可较复杂；不适合只买一个空壳公司。" },
  { rank: 11, code: "VN", country: "越南", score: 69, tags: ["制造供应链", "东南亚", "电商"], reason: "供应链和消费市场受关注；投资项目、行业准入、劳动和税务登记要按省份与业务细分。" },
  { rank: 12, code: "NZ", country: "新西兰", score: 67, tags: ["小而稳市场", "农业与教育", "英语环境"], reason: "公司注册和税务入口清楚，但市场规模较小；银行会重视真实业务、税务居民和资金来源。" }
];

export const planningFunds = {
  light: "轻资产验证线：建议预留 5–15 万元人民币，覆盖注册/地址/会计、差旅、开户缓冲和至少 3 个月运营；这是编辑规划线，不是政府最低资本。",
  operating: "实体运营线：建议预留 20–80 万元人民币，覆盖许可、办公室、首批人员、会计税务、保险和 6–12 个月现金流；具体以行业和城市报价为准。",
  regulated: "牌照或雇员线：通常要按当地监管、办公场地、雇员和资本要求单独做预算，不能套用统一数字；先让当地律师/会计师出书面清单。"
};

const commonBanking = {
  personal: "旅游身份不等于银行开户资格。常见 KYC 包括护照、当地合法居留/地址、税务居民信息、手机号、资金来源和开户目的；是否接受非居民由每家银行独立决定。",
  corporate: "公司注册证书、章程、董事/股东与最终受益人资料、注册地址、商业计划、官网/合同/发票、预计流水、资金来源和税务表格通常要一起解释。注册成功不等于企业账户获批。",
  debit: "借记卡通常随活期账户发放，但要先通过 KYC；卡种、最低余额、境外交易和实体卡寄送规则以银行为准。",
  credit: "信用卡通常需要当地信用记录、稳定收入、押金或长期客户关系；新移居者可能只能先用借记卡或担保卡，不要把信用卡当作开户必然结果。",
  redline: "不要伪造地址、收入、合同、税务居民身份或资金来源；被银行关户、冻结或拒绝不等于可以换平台规避尽调。"
};

const official = {
  SG: { company: "https://www.acra.gov.sg/how-to-guides/setting-up-a-local-company", portal: "https://www.bizfile.gov.sg/", regulator: "https://www.mas.gov.sg/regulation/anti-money-laundering/anti-money-laundering-and-countering-the-financing-of-terrorism" },
  AE: { company: "https://www.moec.gov.ae/en/start-a-business", portal: "https://u.ae/en/information-and-services/business", regulator: "https://www.centralbank.ae/en/our-operations/anti-money-laundering-and-combating-the-financing-of-terrorism/" },
  US: { company: "https://www.sba.gov/business-guide/launch-your-business/register-your-business", portal: "https://www.irs.gov/businesses/small-businesses-self-employed/employer-id-numbers", regulator: "https://www.fincen.gov/resources/statutes-regulations/guidance/customer-due-diligence-requirements-financial-institutions" },
  GB: { company: "https://www.gov.uk/limited-company-formation", portal: "https://www.gov.uk/set-up-business", regulator: "https://www.fca.org.uk/firms/financial-crime/anti-money-laundering" },
  AU: { company: "https://asic.gov.au/for-business/registering-a-company/", portal: "https://www.abr.gov.au/business-super-funds-charities/applying-abn", regulator: "https://www.austrac.gov.au/business/how-comply-and-report-guidance-and-resources/customer-identification-and-verification" },
  JP: { company: "https://www.jetro.go.jp/en/invest/setting_up/", portal: "https://www.nta.go.jp/english/", regulator: "https://www.fsa.go.jp/en/laws_regulations/" },
  CA: { company: "https://ised-isde.canada.ca/site/corporations-canada/en", portal: "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/registering-your-business.html", regulator: "https://fintrac-canafe.canada.ca/re-ed/intro-eng" },
  MY: { company: "https://www.ssm.com.my/", portal: "https://www.mida.gov.my/", regulator: "https://www.bnm.gov.my/aml-cft" },
  TH: { company: "https://www.dbd.go.th/", portal: "https://www.boi.go.th/", regulator: "https://www.bot.or.th/en/our-roles/financial-institutions/supervision.html" },
  ID: { company: "https://oss.go.id/", portal: "https://ahu.go.id/", regulator: "https://www.ojk.go.id/en/kanal/perbankan/Pages/Banking.aspx" },
  VN: { company: "https://dangkykinhdoanh.gov.vn/", portal: "https://investvietnam.gov.vn/", regulator: "https://www.sbv.gov.vn/" },
  NZ: { company: "https://companies-register.companiesoffice.govt.nz/", portal: "https://www.ird.govt.nz/", regulator: "https://www.dia.govt.nz/AML-CFT" }
};

const guideNotes = {
  SG: { localRule: "至少 1 名符合要求的本地常住董事；公司秘书和本地注册地址也要按 ACRA 规则安排。", capital: "ACRA 注册层没有适用于所有公司的一刀切高额最低资本；行业许可、银行和雇佣准证另算。", scale: "没有统一最低员工数；想申请工作准证或证明实质经营时，业务、薪资和本地活动会被审查。", visa: "短期商务访问不等于工作许可；需要在新加坡实际任职、经营或雇佣员工时，按 MOM 准证路径核验。", issues: ["远程开户常被要求解释真实业务、客户、合同和预计流水", "本地董事/注册地址是注册条件，不等于银行一定接受", "信用卡通常要本地收入或信用关系"] },
  AE: { localRule: "大陆公司、自由区和酋长国经济部门路径不同；牌照、办公场地、受益人和签证名额需按活动核验。", capital: "不要用‘零资本开公司’概括所有自由区；金融、贸易、加密、教育等活动可能有额外资本和许可。", scale: "员工数通常不是普通注册统一门槛，但签证配额、办公室和行业许可会影响实际成本。", visa: "商务访问、投资者/合伙人居留和雇员签证是不同路径；旅游免签不能直接工作。", issues: ["公司注册成功不等于阿联酋银行开户", "银行会要求业务实质、办公室、合同和资金来源", "自由区套餐价格不等于全年合规成本"] },
  US: { localRule: "按州注册 LLC 或 Corporation，通常需要注册代理和州注册地址；税务登记与公司注册是两套流程。", capital: "州级注册通常没有统一高额最低资本；真实运营资金、州税、会计、保险和支付合规要单独预算。", scale: "通常没有统一最低员工数；雇人、销售税、行业许可和移民身份各有要求。", visa: "商务访问只能参加允许的商务活动，不能在美国受雇工作；创业/工作要另查对应身份。", issues: ["没有 SSN/ITIN、美国地址或信用历史时，银行和支付账户可能要求额外证明", "EIN、公司章程和银行账户不是同一件事", "地址、税务居民和受益人信息不能用‘包装材料’替代"] },
  GB: { localRule: "Companies House 可注册 private limited company；需注册办公地址、董事和有重大控制权的人信息。", capital: "通常没有统一高额最低资本，常见 £1 股本只是注册层字段，不是运营预算或签证资金。", scale: "注册层没有统一最低员工数；实际雇员、PAYE、VAT 和行业许可另算。", visa: "访客签证不能在英国实际工作；创新创始人、技术工人等路径要分开核验。", issues: ["注册地址可用不等于银行会接受为经营地址", "Companies House 登记和税务申报必须持续维护", "企业账户常要求解释英国客户、合同和资金来源"] },
  AU: { localRule: "ASIC 注册公司，ABN/税务与公司结构分开处理；proprietary company 通常要至少一名符合居住要求的董事。", capital: "注册层没有适用于所有公司的一刀切最低资本；牌照、员工、办公室和移民路径另算。", scale: "普通公司注册不设统一最低员工数；雇佣、行业许可或签证可能增加门槛。", visa: "商务访问不等于在澳洲为公司工作；长期经营或雇佣按移民和工作许可路径核验。", issues: ["ABN、ACN、税号和银行账户经常被新手混为一个东西", "非居民董事、注册地址和税务居民身份会触发额外 KYC", "信用卡通常要本地收入/信用记录或担保"] },
  JP: { localRule: "可经 JETRO 了解株式会社/合同会社及代表者、注册地址、税务通知等流程；实际行业需日本语文件和会计支持。", capital: "普通公司注册不要直接套用经营管理签证资金门槛；公司资本、办公场地和签证资金是三个概念。", scale: "经营管理签证常见审查重点是独立办公场所、真实业务和规模；具体条件以入管当期规则为准。", visa: "商务访问、经营管理、技术/人文等身份不可混用；要在日本经营通常需相应在留资格。", issues: ["银行很重视日本地址、印章/法人资料、实际业务和日语沟通", "公司成立后税务、年金和记账义务不能忽略", "信用卡多依赖本地住址、收入和信用记录"] },
  CA: { localRule: "联邦或省级注册二选一；董事居住规则、注册地址和年报要求取决于注册层级与省份。", capital: "普通公司注册没有适用于所有行业的统一最低资本；实际运营和移民资金另算。", scale: "注册层通常没有统一最低员工数；雇佣、税务、牌照和移民项目各有门槛。", visa: "访客身份不能在加拿大实际工作；企业家、工签和省提名路径必须单独核验。", issues: ["联邦注册和省注册的规则经常被混用", "银行会分别核验公司控制人、税务居民、加拿大地址和业务实质", "信用卡通常需要本地信用历史或押金"] },
  MY: { localRule: "通过 SSM 注册公司；外资比例、董事居住、实缴资本和行业许可随业务分类变化。", capital: "不能用一个‘外资最低资本’覆盖所有行业；制造、服务、批发、牌照行业需逐项核验。", scale: "公司注册没有统一最低员工数，但外籍雇员、工作准证和本地运营会增加要求。", visa: "商务访问、股东/董事身份和工作准证不同；旅游免签不能替代工作许可。", issues: ["注册代理报价常不含秘书、年报、税务和银行维护", "银行会要求解释客户、合同、预计流水及实际办公地址", "个人信用卡与公司账户是两套 KYC"] },
  TH: { localRule: "DBD 公司注册、外资经营许可/BOI、税务和工作许可需分开处理；行业限制较多。", capital: "不要把常见外资资本数字写成所有行业通用门槛；业务活动和许可类型决定要求。", scale: "部分外资经营和工作许可会涉及资本、员工或本地运营条件，需按活动核验。", visa: "商务访问、投资者、工作和长期居留不是一个签证；免签旅游不能经营或就业。", issues: ["泰国公司注册和外国人工作许可经常被错误地当作一件事", "名义股东、代持和‘包工作证’存在重大合规风险", "银行可能要求本人到场、泰国地址和真实经营证据"] },
  ID: { localRule: "通过 OSS/AHU 处理公司和许可；PMA、行业 KBLI、投资和本地许可要按项目核验。", capital: "外资 PMA 的投资/实缴规则随法规和行业变化，不能用旧攻略的单一数字替代最新 BKPM/OSS 规则。", scale: "投资、办公室、雇员和许可条件按 KBLI 与项目类型核验。", visa: "商务访问、投资者居留、工作许可和旅游免签是不同路径；旅游身份不能实际工作。", issues: ["PMA 注册成功不等于银行、税务和 OSS 许可全部完成", "银行会要求 UBO、合同、客户和资金来源", "印尼地址、税务登记和本地合规维护成本常被低估"] },
  VN: { localRule: "投资项目、企业登记、税号和行业许可按项目与省份办理；先确定行业代码和投资形式。", capital: "多数行业没有统一对所有项目适用的最低资本，实际项目资本和办公室/人员要求需由主管部门确认。", scale: "制造、教育、金融、电商等行业可能有项目、场地、人员和许可要求。", visa: "商务签、投资者签、工作许可和旅游电子签不能互换；实际工作要有相应许可。", issues: ["投资登记证、企业登记证、税号和银行开户经常被混为一套文件", "银行会审查本地合同、办公室、客户和资金路径", "不要用旧版电子签攻略替代投资/工作签证规则"] },
  NZ: { localRule: "Companies Office 注册公司，税务和 GST 由 Inland Revenue 另行处理；非居民董事与地址条件要核验。", capital: "普通公司注册没有统一最低资本；办公室、会计、雇员和移民路径另行预算。", scale: "注册层无统一最低员工数；投资/雇佣签证和受监管行业会增加条件。", visa: "访客签证不能在新西兰实际工作；经营或就业要核验相应签证。", issues: ["公司注册、IRD、GST 和银行账户不是同一流程", "小市场不代表银行不做 KYC", "信用卡通常依赖本地地址、收入和信用历史"] }
};

// 扩展国家先提供“官方入口索引版”经营卡；具体行业资本、居留和银行接受度仍需按项目复核。
const expansionOfficial = {
  NL: { company: "https://business.gov.nl/", portal: "https://business.gov.nl/starting-your-business/", regulator: "https://www.dnb.nl/en/" },
  CH: { company: "https://www.kmu.admin.ch/kmu/en/home/practical-knowledge/setting-up-sme/starting-business.html", portal: "https://www.kmu.admin.ch/", regulator: "https://www.finma.ch/en/" },
  GR: { company: "https://www.enterprisegreece.gov.gr/en/", portal: "https://www.gov.gr/en/sdg/starting-a-business", regulator: "https://www.bankofgreece.gr/en" },
  PT: { company: "https://eportugal.gov.pt/en/empresas", portal: "https://justica.gov.pt/Servicos/Empresa-na-Hora", regulator: "https://www.bportugal.pt/en" },
  MX: { company: "https://www.gob.mx/se/acciones-y-programas/tu-empresa", portal: "https://www.gob.mx/se", regulator: "https://www.gob.mx/cnbv" },
  SA: { company: "https://mc.gov.sa/en", portal: "https://investsaudi.sa/", regulator: "https://www.sama.gov.sa/en-US/Pages/default.aspx" },
  EG: { company: "https://www.gafi.gov.eg/English/StartaBusiness/Pages/default.aspx", portal: "https://www.gafi.gov.eg/", regulator: "https://www.cbe.org.eg/en" },
  ZA: { company: "https://www.cipc.co.za/", portal: "https://www.gov.za/services/companies", regulator: "https://www.resbank.co.za/en/home" },
  KE: { company: "https://brs.go.ke/", portal: "https://www.investmentauthority.go.ke/", regulator: "https://www.centralbank.go.ke/" },
  TZ: { company: "https://www.brela.go.tz/", portal: "https://www.tic.go.tz/", regulator: "https://www.bot.go.tz/" },
  AZ: { company: "https://www.e-taxes.gov.az/", portal: "https://www.invest.gov.az/", regulator: "https://www.cbar.az/" },
  AM: { company: "https://www.e-register.am/", portal: "https://www.investmentcouncil.am/", regulator: "https://www.cba.am/en" },
  MN: { company: "https://e-business.mn/", portal: "https://investmongolia.gov.mn/", regulator: "https://www.mongolbank.mn/en" },
  QA: { company: "https://www.moci.gov.qa/en/", portal: "https://invest.qa/", regulator: "https://www.qcb.gov.qa/en" },
  OM: { company: "https://www.tejarah.gov.om/", portal: "https://investoman.om/", regulator: "https://cbo.gov.om/" },
  PK: { company: "https://www.secp.gov.pk/", portal: "https://invest.gov.pk/", regulator: "https://www.sbp.org.pk/" },
  NP: { company: "https://ocr.gov.np/", portal: "https://doind.gov.np/", regulator: "https://www.nrb.org.np/" },
  BD: { company: "https://roc.gov.bd/", portal: "https://bida.gov.bd/", regulator: "https://www.bb.org.bd/" },
  LK: { company: "https://www.drc.gov.lk/", portal: "https://investsrilanka.com/", regulator: "https://www.cbsl.gov.lk/en" },
  JO: { company: "https://www.moin.gov.jo/", portal: "https://www.jic.gov.jo/", regulator: "https://www.cbj.gov.jo/" },
  MV: { company: "https://www.mira.gov.mv/", portal: "https://investmaldives.gov.mv/", regulator: "https://www.mma.gov.mv/" },
  MU: { company: "https://companies.govmu.org/", portal: "https://www.edbmauritius.org/", regulator: "https://www.bom.mu/" },
  SC: { company: "https://www.registry.gov.sc/", portal: "https://investinseychelles.com/", regulator: "https://www.cbs.sc/" },
  FJ: { company: "https://www.frcs.org.fj/", portal: "https://www.investment.com.fj/", regulator: "https://www.rbf.gov.fj/" },
  WS: { company: "https://www.mcil.gov.ws/", portal: "https://www.samoagovt.ws/", regulator: "https://www.cbs.gov.ws/" },
  TO: { company: "https://www.revenue.gov.to/", portal: "https://www.investtonga.gov.to/", regulator: "https://www.nationalreserve.to/" },
  VU: { company: "https://www.vfsc.vu/", portal: "https://vipa.gov.vu/", regulator: "https://www.rbv.gov.vu/" },
  SB: { company: "https://www.commerce.gov.sb/", portal: "https://investsolomons.gov.sb/", regulator: "https://www.cbsi.com.sb/" },
  PW: { company: "https://www.palaugov.pw/", portal: "https://www.palaugov.pw/", regulator: "https://www.palaugov.pw/" },
  BS: { company: "https://www.bahamas.gov.bs/", portal: "https://www.bahamas.gov.bs/", regulator: "https://www.centralbankbahamas.com/" }
};

// 这张表来自专家组逐国入口矩阵。它故意保留“待核验”字样，避免把公司登记、工作许可
// 和银行产品拼成一条不存在的捷径。构建时读取研究稿，研究稿更新后页面会同步显示最新的
// 逐国边界；只有通过事实审核的字段，才应从研究状态升级为正式结论。
const matrixCountryCode = {
  "新加坡":"SG", "阿联酋":"AE", "马来西亚":"MY", "泰国":"TH", "印度尼西亚":"ID", "越南":"VN", "日本":"JP", "韩国":"KR", "美国":"US", "英国":"GB", "澳大利亚":"AU", "新西兰":"NZ", "加拿大":"CA", "法国":"FR", "德国":"DE", "意大利":"IT", "西班牙":"ES", "土耳其":"TR", "格鲁吉亚":"GE", "俄罗斯":"RU", "菲律宾":"PH", "柬埔寨":"KH", "巴西":"BR", "哈萨克斯坦":"KZ", "乌兹别克斯坦":"UZ", "塞尔维亚":"RS", "摩洛哥":"MA", "荷兰":"NL", "瑞士":"CH", "希腊":"GR", "葡萄牙":"PT", "沙特阿拉伯":"SA", "墨西哥":"MX", "南非":"ZA", "埃及":"EG", "肯尼亚":"KE", "坦桑尼亚":"TZ", "阿塞拜疆":"AZ", "亚美尼亚":"AM", "蒙古":"MN", "蒙古国":"MN", "卡塔尔":"QA", "阿曼":"OM", "巴基斯坦":"PK", "尼泊尔":"NP", "孟加拉国":"BD", "斯里兰卡":"LK", "约旦":"JO", "马尔代夫":"MV", "毛里求斯":"MU", "塞舌尔":"SC", "斐济":"FJ", "萨摩亚":"WS", "汤加":"TO", "瓦努阿图":"VU", "所罗门群岛":"SB", "帕劳":"PW", "巴哈马":"BS", "印度":"IN", "老挝":"LA", "智利":"CL", "秘鲁":"PE", "哥伦比亚":"CO", "爱尔兰":"IE", "波兰":"PL", "捷克":"CZ", "冰岛":"IS", "马耳他":"MT", "塞浦路斯":"CY", "牙买加":"JM"
};

function parseMatrixRows() {
  try {
    const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "knowledge-base/research/工作许可-公司注册-银行开户逐国入口矩阵-2026-08-14.md");
    const text = fs.readFileSync(file, "utf8");
    const rows = {};
    let active = false;
    for (const line of text.split(/\r?\n/)) {
      if (line.includes("中国人能否直接发起公司") && line.includes("工作许可/EP")) { active = true; continue; }
      if (active && !line.trim().startsWith("|")) { active = false; continue; }
      if (!active || !line.trim().startsWith("|") || line.includes("---")) continue;
      const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(cell => cell.trim());
      if (cells.length < 6 || !matrixCountryCode[cells[0]]) continue;
      const links = [...cells[5].matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g)].map(match => match[1]);
      rows[matrixCountryCode[cells[0]]] = {
        company: cells[1],
        local: cells[2],
        work: cells[3],
        bank: cells[4],
        sources: links,
        sourceLabel: cells[5]
      };
    }
    return rows;
  } catch {
    return {};
  }
}

const countryMatrix = parseMatrixRows();

// “建议银行”只作为首轮核验名单，不代表非居民一定能开户，也不代表银行之间有统一政策。
// 没有完成逐家官方核验的国家，宁可不列银行名称，直接引导读者从监管机构的持牌名单开始。
const bankingOptions = {
  SG: "DBS、OCBC、UOB（先确认非居民、公司实质和本人到场要求）",
  AE: "Emirates NBD、ADCB、FAB（先确认自由区/大陆公司牌照与居留条件）",
  US: "Chase、Bank of America、Wells Fargo（按州地址、EIN、SSN/ITIN 和业务实质逐家核验）",
  GB: "HSBC UK、Barclays、Lloyds（先核对英国地址、税务居民与企业经营证明）",
  AU: "Commonwealth Bank、ANZ、Westpac、NAB（非居民董事和到场要求需逐家确认）",
  JP: "MUFG、SMBC、Mizuho（通常更看日本地址、在留资格、法人资料和日语沟通）",
  CA: "RBC、TD、BMO（联邦/省注册、加拿大地址与信用历史分别核验）",
  MY: "Maybank、CIMB、Public Bank（先确认外资公司、董事和工作准证条件）",
  TH: "Bangkok Bank、Kasikornbank、Krungthai（常见到场、签证/工作许可和地址要求需核实）",
  ID: "Bank Mandiri、BCA、BNI（PMA/OSS、KITAS、地址与业务实质逐家确认）",
  VN: "Vietcombank、BIDV、Techcombank（外资企业账户和个人非居民产品分开询问）",
  NZ: "ANZ、ASB、BNZ、Westpac NZ（先确认非居民董事、地址和税号条件）"
};

function enrichGuide(code, guide) {
  const matrix = countryMatrix[code];
  const bankOption = bankingOptions[code] || "暂不列具体银行名称：先打开金融监管机构或银行官网，确认是否接受你的合法身份、地址、税务居民和业务类型。";
  if (!matrix) {
    const fallback = {
      company: "中国公民能否直接发起公司：待逐条核验；不能用其他国家的公司法或代理商宣传替代本国官方条款。",
      local: "本地董事、注册地址、税号、营业执照和行业许可：待逐项核验。",
      work: "工作许可/EP 的官方名称、雇主或投资条件：待逐项核验。旅游、免签或商务访问不自动产生工作权。",
      bank: "个人账户、企业账户、借记卡和信用卡的非居民条件：待逐家银行核验；先准备身份、地址、税务居民和资金来源。",
      sources: [guide.company?.portal, guide.visa?.source, guide.banking?.source].filter(Boolean)
    };
    return { ...guide, matrix: fallback, bankingOption: bankOption, eligibility: fallback.company, license: fallback.local, workPermit: { route: fallback.work, official: fallback.sources[1] || "" } };
  }
  return {
    ...guide,
    matrix,
    bankingOption: bankOption,
    workPermit: {
      route: matrix.work,
      official: matrix.sources[1] || guide.visa.source || ""
    },
    license: matrix.local,
    eligibility: matrix.company
  };
}

export const communityIssueBank = [
  { title: "注册成功 ≠ 银行开户成功", detail: "公开讨论中最常见的误解。银行看的是实际业务、客户/合同、地址、税务居民、UBO 和资金来源，不只看一张注册证书。", source: "https://news.ycombinator.com/item?id=45056177" },
  { title: "远程开户被要求视频面审或到场", detail: "新公司、非居民或跨境业务经常被要求补充商业计划、网站、发票、合同、预计流水和本人面审。不要把‘远程可申请’写成‘远程必开’。", source: "https://www.reddit.com/r/LOOK_CHINA/comments/1u6psv3/" },
  { title: "地址证明是高频卡点", detail: "银行会区分注册办公地址、实际居住地址和税务地址；虚拟地址、转租地址或不一致文件可能触发补件。", source: "https://www.reddit.com/r/China_irl/comments/1duwhnp" },
  { title: "没有本地信用记录，信用卡不一定能办", detail: "新到当地的人通常先获得借记卡或担保卡；信用卡额度、年费和审批依赖银行自己的 KYC 与信用模型。", source: "https://www.reddit.com/r/China_irl/comments/1tpycrx/" },
  { title: "不要伪造海外地址、收入或合同", detail: "论坛里出现过‘包装材料’建议，但这会直接触发账户关闭、资金冻结、税务和刑事风险；本站不提供规避监管的做法。", source: "https://www.reddit.com/r/dashuju/comments/1tpyd44/" },
  { title: "公司账户、个人账户、券商账户是三套关系", detail: "公司注册地、个人税务居民地、银行账户所在地和券商服务地可能不同，跨境转账和申报义务不能靠‘换一张卡’消失。", source: "https://www.reddit.com/r/China_irl/comments/1tpycrx/" }
];

export function getBusinessGuide(code, country = "该国") {
  const note = guideNotes[code];
  const source = official[code];
  const expansion = expansionOfficial[code];
  const matrix = countryMatrix[code];
  if (!note && matrix) {
    const companyUrl = matrix.sources[0] || source?.company || expansion?.company || "";
    const workUrl = matrix.sources[1] || expansion?.portal || "";
    const bankUrl = matrix.sources[2] || source?.regulator || expansion?.regulator || "";
    return enrichGuide(code, {
      status: "research",
      statusLabel: "逐国入口矩阵版，行业与银行条件待逐项核验",
      basis: "已把中国公民能否发起公司、本地条件、工作许可边界和银行材料拆开；具体行业、居留和发卡资格仍由主管机关或银行逐案决定。",
      company: { setup: `先从 ${country} 的企业登记或投资入口确认公司类型、外资准入和行业许可。`, portal: companyUrl, localRule: matrix.local, capital: "未找到适用于所有公司的统一最低资本；不要把注册资本当成签证资金或运营现金流。", scale: "公司登记通常不等于统一员工数；员工、办公室、行业许可和居留条件要另行核验。", funds: planningFunds.operating, sources: [companyUrl, matrix.sources[0]].filter(Boolean) },
      visa: { entry: "旅游、免签或商务访问只覆盖官方允许的短期活动，不自动产生当地工作权。", work: matrix.work, source: workUrl },
      banking: { ...commonBanking, source: bankUrl },
      issues: [matrix.company, matrix.local, matrix.bank, "公司注册、工作许可、个人账户、企业账户和信用卡是不同流程，不能互相推导。"],
      lastVerified: "2026-08-14"
    });
  }
  if (!note && expansion) {
    return enrichGuide(code, {
      status: "research",
      statusLabel: "官方入口索引版，行业条件待逐项核验",
      basis: "已列出公司登记、投资/经营和金融监管官方入口；具体行业资本、居留、银行和信用卡条件仍需按项目复核。",
      company: { setup: `先通过 ${country} 的企业或投资官方入口确认实体类型、行业限制、注册地址和税务登记。`, portal: expansion.company, localRule: "行业许可、外资准入、董事/股东、注册地址和受益人要求需按业务逐项确认。", capital: "未找到适用于所有公司的统一最低资本；不要把注册资本当成签证或运营资金。", scale: "普通注册通常不等于有统一员工数；雇员、办公室、许可和居留条件另行核验。", funds: planningFunds.operating, sources: [expansion.company, expansion.portal] },
      visa: { entry: "旅游或商务访问只覆盖官方允许的短期活动，不自动产生当地工作权。", work: "要在当地经营、任职或雇佣员工，须另查经营许可、工作许可或投资者身份。", source: expansion.portal },
      banking: { ...commonBanking, source: expansion.regulator },
      issues: ["公司注册证书不等于银行开户成功", "银行可能要求实际地址、UBO、客户/合同和资金来源", "信用卡通常还要本地收入、信用记录或押金"],
      lastVerified: "2026-08-14"
    });
  }
  if (!note || !source) {
    return enrichGuide(code, {
      status: "queue",
      statusLabel: "该国出海经营资料待逐条核验",
      basis: "签证页已完成短期出境核验；公司注册、企业银行和个人银行卡规则尚未完成同等深度的官方复核。",
      company: { setup: "请先确定公司类型、行业、注册地和是否需要本地经营许可。", portal: "", localRule: "不能用其他国家的公司规则套用。", capital: "未核验，不显示统一最低资本。", scale: "未核验，不显示统一员工数。", funds: planningFunds.operating, sources: [] },
      visa: { entry: "短期旅游/商务签证不等于可以在当地经营或受雇。", work: "需要另查工作、投资或经营管理类许可。", source: "" },
      banking: { ...commonBanking, source: "" },
      issues: ["该国的公司与银行专题正在排队核验；先使用本页的官方签证入口，不要据旧攻略开户。"],
      lastVerified: "2026-08-14"
    });
  }
  return enrichGuide(code, {
    status: "guide",
    statusLabel: "出海经营与开户基础版",
    basis: "官方注册/税务/反洗钱入口 + 公开社区高频问题；银行是否接受开户仍由机构逐案决定。",
    company: { setup: `通过 ${country} 的官方注册或投资入口先确认实体类型、行业许可和税务登记。`, portal: source.company, localRule: note.localRule, capital: note.capital, scale: note.scale, funds: planningFunds.operating, sources: [source.company, source.portal] },
    visa: { entry: "商务访问只覆盖允许的会议、考察或谈判活动，不自动产生工作权。", work: note.visa, source: source.portal },
    banking: { ...commonBanking, source: source.regulator },
    issues: note.issues,
    lastVerified: "2026-08-14"
  });
}
