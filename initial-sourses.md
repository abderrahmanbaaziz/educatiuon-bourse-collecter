# Initial Seed Source Database for an Algerian Scholarship Discovery Crawler

## Research scope and eligibility labels

I treated **“Algerian student” as an Algerian national / resident in Algeria applying abroad**, not merely any Arabic-speaking or North-African applicant. I also separated **source discovery** from **eligibility verification**: a crawler may still monitor a high-value international funding portal even when every individual award on that portal needs its own nationality check.

The eligibility labels below mean: **DZ-specific** = explicitly targets Algerians or applicants in Algeria; **DZ-verified** = the official source explicitly includes Algeria, all nationalities, all non-EEA nationals, or another category that unquestionably includes Algeria; **International/verify** = international applicants are accepted but the precise scholarship/call must be checked; **Not eligible** = Algeria is explicitly outside the current eligible-country list. This distinction matters because several popular scholarship lists online incorrectly present ARES, VLIR-UOS, or other geographically restricted schemes as universally available. ARES’s 2027–2028 country list does **not** include Algeria, and VLIR-UOS’s current eligible-country list also excludes Algeria. citeturn426645search5turn426645search6

I prioritized official ministries, embassies, funding agencies, universities, EU portals and Algerian university foreign-relations offices. This first researched dataset gives you **a large set of verified crawlable endpoints rather than padding the list with guessed URLs**. It is suitable as the first production seed set, and SerpAPI can then expand it automatically.

## Highest-priority evergreen seeds

These are the first sources I would put into the crawler. They combine strong Algerian relevance, authoritative information, recurring calls, and high probability of yielding new opportunities.

| Priority | Source / landing page | Country / scope | Opportunity level | Funding | Algerian status | Crawl method | Typical monitoring | Evidence |
|---|---|---|---|---|---|---|---|---|
| P0 | [MESRS – Bourses](https://www.mesrs.dz/fr/cooperation-interuniversitaire1/bourses/) | Algeria / worldwide | Bachelor–PhD, research, training | Full + partial | **DZ-specific** | HTML + linked PDF | Daily/weekly | Algeria’s Ministry publishes foreign-government and partner scholarship offers here. citeturn611450search0 |
| P0 | [MESRS – Coopération interuniversitaire](https://www.mesrs.dz/fr/cooperation-interuniversitaire1/) | Algeria / worldwide | Mobility, scholarships, research | Mixed | **DZ-specific** | HTML + sitemap | Weekly | MESRS explicitly links foreign-study programmes, scholarships, Erasmus+ and bilateral cooperation. citeturn340204search0 |
| P0 | [MESRS – International cooperation Arabic](https://www.mesrs.dz/cooperation-internationale-ar2/) | Algeria / worldwide | All | Mixed | **DZ-specific** | HTML | Weekly | Includes foreign scholarship offers plus Algeria–EU/Erasmus cooperation. citeturn611450search5 |
| P0 | [National Erasmus+ Office / EU Algeria reference](https://erasmus-plus.ec.europa.eu/about-erasmus/contacts/national-erasmus-offices) | EU–Algeria | Bachelor/Master/PhD/staff mobility | Mostly funded mobility | **DZ-verified** | HTML | Weekly/monthly | The Commission lists an Algeria National Erasmus+ Office. citeturn611450search7 |
| P0 | [Erasmus+ eligible countries](https://erasmus-plus.ec.europa.eu/fr/programme-guide/part-a/eligible-countries) | EU | Mobility/exchange | Funded | **DZ-verified** | HTML | Annual + change detect | Algeria is explicitly listed in South-Mediterranean Region 3. citeturn611450search6 |
| P0 | [Erasmus Mundus Joint Masters](https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters) | Europe/global | Master | Often full | **DZ-verified** | HTML + outgoing programme links | Oct–Jan heavily | EU states students worldwide may apply and full scholarships are available to top-ranked students. citeturn807976search0 |
| P0 | [Erasmus Mundus programme discovery](https://education.ec.europa.eu/study-in-europe/programmes-and-fields/programmes-by-theme) | Europe/global | Master | Often full | **DZ-verified** | HTML/search | Monthly; Oct–Jan daily | Erasmus Mundus is explicitly open worldwide. citeturn807976search1 |
| P0 | [Campus France Algérie – scholarship programmes](https://www.algerie.campusfrance.org/programmes-de-bourses-de-l-institut-francais-d-algerie) | France | Master, PhD, research | Full/partial | **DZ-specific** | HTML + news links | Weekly | Includes France Excellence IFA Master, IFA Doctorat, Eiffel and research stays for Algerians/residents in Algeria. citeturn611450search4 |
| P0 | [Campus France Algérie](https://www.algerie.campusfrance.org/) | France | Bachelor–PhD | Mixed | **DZ-specific** | HTML + search | Weekly | Primary France-study channel for residents of Algeria; scholarship calls are published in its news ecosystem. citeturn611450search3turn611450search4 |
| P0 | [DAAD Scholarship Database](https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/) | Germany | Master, PhD, research | Mostly funded | **DZ-verified / programme-specific** | Search/HTML | Monthly | The database accepts Algeria as origin and exposes DAAD and selected third-party funding. citeturn771087search1 |
| P0 | [DAAD scholarships overview](https://www.daad.de/en/studying-in-germany/scholarships/daad-scholarships/) | Germany | Graduate/PhD/postdoc | Mostly full/strong partial | **DZ-verified by individual programmes** | HTML | Monthly | DAAD explicitly funds international graduates, doctoral candidates and researchers. citeturn771087search2 |
| P0 | [DAAD EPOS](https://www.daad.de/en/information-services-for-higher-education-institutions/further-information-on-daad-programmes/epos/) | Germany | Master/postgraduate | Full/strong funding | **DZ-eligible subject to country list/call** | HTML + PDF/course list | Annual | EPOS targets applicants from developing and newly industrialised countries. citeturn771087search0turn771087search1 |
| P0 | [Türkiye Scholarships / YTB](https://ytb.gov.tr/en/departments/international-students/) | Türkiye | Bachelor, Master, PhD, research | **Full** | **DZ-verified** | HTML + application portal | Jan–Feb | Official eligibility states “citizens of all countries”; package includes tuition, stipend, housing, insurance, language course and airfare. citeturn853364search0 |
| P0 | [Japan Embassy in Algeria – MEXT](https://www.dz.emb-japan.go.jp/itpr_ja/11_000001_00417.html) | Japan | Undergraduate, graduate/research | Full | **DZ-specific** | HTML + PDF | Apr–May | Embassy runs Algeria’s MEXT process; the 2027 cycle is closed and the next notice is expected in April 2027. citeturn853364search1 |
| P0 | [Study in Japan – MEXT](https://www.studyinjapan.go.jp/en/smap-stopj-applications-undergraduate.html) | Japan | Undergraduate + linked categories | Full | **DZ-verified via embassy track** | HTML/PDF | Annual | MEXT instructs applicants to use the Japanese embassy/consulate in their country of nationality. citeturn853364search2 |
| P0 | [Study in Korea – GKS notices](https://studyinkorea.go.kr/ko/plan/gksNoticeRead.do?bbsId=BBSMSTR_000000000461&nttId=4522) | South Korea | Bachelor, Master, PhD | Full | **DZ-verified by annual allocation** | HTML + ZIP/PDF | Sep/Feb typically | Official 2027 GKS-U notice is live; country quotas are call-specific. citeturn853364search3 |
| P0 | [Korean Embassy in Algeria](https://fr.mofa.go.kr/dz-fr/brd/m_20392/view.do?seq=150) | South Korea | Master, PhD; GKS | Full | **DZ-specific** | HTML + attachments | Annual | The 2026 graduate call explicitly allocated places to Algerian students. citeturn853364search4 |
| P0 | [Stipendium Hungaricum – Algeria](https://stipendiumhungaricum.hu/partners/www.ched.gov.ph/?partner=algeria) | Hungary | Master, PhD, partial study | Full/strong funding | **DZ-specific** | HTML | Nov–Jan | Algeria is an official Sending Partner; current page lists Master/PhD opportunities and fields. citeturn853364search5 |
| P0 | [Stipendium Hungaricum – Apply](https://stipendiumhungaricum.hu/apply/) | Hungary | Bachelor–PhD depending partner | Full | **DZ-verified subject to bilateral options** | HTML + portal/PDF | Nov–Jan | Application is annual and requires Sending Partner nomination where applicable. citeturn853364search6 |
| P0 | [Study in Romania – Scholarships](https://studyinromania.gov.ro/scholarships) | Romania | Bachelor, Master, PhD | State-funded | **DZ-verified** | HTML + application link | Jan–Mar typically | Romanian MFA scholarships are open to foreign citizens of non-EU countries, subject to listed exclusions that do not exclude Algeria. citeturn771087search3 |
| P0 | [MAECI scholarships for foreign students](https://www.esteri.it/en/servizi-opportunita/opportunita/borse-di-studio/per-cittadini-stranieri/borsestudio_stranieri/) | Italy | Master, PhD, research, arts/language | Funded | **DZ-verified only when Algeria appears in annual country list** | HTML + Study in Italy | Annual | MAECI publishes the annual foreign-student scholarship call and eligible-country list. citeturn771087search5 |
| P0 | [MAECI special projects](https://www.esteri.it/en/servizi-opportunita/opportunita/borse-di-studio/per-cittadini-stranieri/progetti-speciali/) | Italy | Programme-dependent | Funded | **DZ-specific in some schemes** | HTML | Annual | 2026–27 ITALYOU explicitly included Algeria. citeturn771087search6 |
| P0 | [Swiss Government Excellence Scholarships](https://www.sbfi.admin.ch/en/swiss-government-excellence-scholarships) | Switzerland | Research, PhD; some art Master | Full/strong funding | **DZ-verified** | HTML + country PDF | Aug–Nov | Switzerland offers country-specific research awards to applicants from 180+ countries. citeturn771087search4 |
| P0 | [Chevening Algeria](https://www.chevening.org/scholarship/algeria/) | UK | Master | Full | **DZ-specific** | HTML | Aug–Oct usually | Algeria has a dedicated Chevening route; 2027–28 is currently closed. citeturn426645search1 |
| P0 | [Government of Ireland International Education Scholarships](https://hea.ie/policy/internationalisation/goi-ies/) | Ireland | Master, postgraduate diploma, PhD | Fee waiver + €10k stipend | **DZ-verified** | HTML/PDF | Annual | Applicants must originate outside EU/EEA/Switzerland/UK, which includes Algeria. citeturn426645search3 |
| P0 | [Malaysia MTCP Scholarship](https://mtcp.kln.gov.my/scholarship) | Malaysia | Master | Full/strong funding | **DZ-verified** | HTML + PDF | Annual | Algeria appears explicitly in the official eligible-country list. citeturn521272search3turn521272search9 |
| P0 | [Indonesia KNB Scholarship](https://knb.kemdiktisaintek.go.id/) | Indonesia | Bachelor, Master, PhD | Full/strong funding | **DZ-verified** | JS/HTML + PDF | Feb–Mar in 2026 | Indonesia’s official Algiers embassy announced KNB specifically to Algerian applicants. citeturn521272search4turn521272search5 |
| P0 | [Indonesia Embassy Algiers – study recommendation letters](https://kemlu.go.id/id/algiers/pelayanan-perwakilan/pendidikan--beasiswa/request-for-recommendation-letter-for-study-purposes) | Indonesia | Multiple govt programmes | Mixed/full | **DZ-specific** | HTML | Monthly | Embassy explicitly mentions Algerian applicants to KNB, TIAS, Darmasiswa, BSBI and university scholarships. citeturn521272search6 |
| P0 | [IsDB Scholarship Programmes](https://www.isdb.org/scholarships/scholarship-programs) | IsDB countries | Undergraduate–PhD/research depending scheme | Funded | **DZ-verified for relevant member-country schemes** | HTML/PDF | Annual | Algeria is an IsDB member country. citeturn521272search7turn521272search8 |
| P0 | [Fulbright Foreign Student – Algeria](https://foreign.fulbrightonline.org/apply?country=algeria) | USA | Master, doctorate/research | Full/strong funding | **DZ-specific** | HTML | Annual | The official Fulbright portal has an Algeria route administered through the U.S. Embassy/partner channels. citeturn807976search7 |

These 30 should be the **first production seeds**. They contain enough recurring opportunities to train your keyword model and enough explicit Algeria signals to establish reliable positive examples.

## Expanded evergreen source registry

The following should be added after the P0 set. “International/verify” means the crawler should discover opportunities but the eligibility checker must validate nationality, residence, programme and funding separately.

| Source | Country | Category / degree | Algerian status | Funding | Crawl | Priority |
|---|---|---|---|---|---|---|
| [JICA Algeria – ABE Initiative](https://www.jica.go.jp/english/overseas/algeria/activities/activity03.html) | Japan | Master + internship | **DZ-specific** | Funded | HTML/PDF | P0 |
| [Saudi Ministry – scholarships for non-Saudis](https://www.moe.gov.sa/en/services/unified-services-guide/nonsaudiinternalscholarship) | Saudi Arabia | University study | **International/verify** | Full/partial | HTML → portal | P1 |
| [Study in Saudi](https://studyinsaudi.sa/en/Faq) | Saudi Arabia | Bachelor–PhD | **International/verify** | University-specific | JS/search | P0 |
| [KAUST – fees & funding](https://admissions.kaust.edu.sa/fees-funding) | Saudi Arabia | MS/PhD | **DZ-verified as international applicant** | **Full fellowship** | HTML | P0 |
| [Qatar University scholarships](https://www.qu.edu.qa/en-us/students/admission/scholarships/Pages/types.aspx) | Qatar | Undergraduate | **DZ-verified as international applicant** | Strong/full depending award | HTML | P0 |
| [HBKU Graduate Scholarships](https://www.hbku.edu.qa/en/scholarship) | Qatar | Master/PhD | **International/verify** | Tuition waiver + possible stipend | HTML | P1 |
| [MBZUAI Graduate Admissions/Funding](https://mbzuai.ac.ae/admissions/graduate-masters-admissions/) | UAE | MSc/PhD AI | **DZ-verified as international applicant** | Full for specified MSc/PhD routes | HTML | P0 |
| [Khalifa University postgraduate scholarships](https://www.ku.ac.ae/scholarships-postgraduate) | UAE | Master/PhD | **DZ-verified as international applicant** | Full/partial | HTML | P1 |
| [UAE University undergraduate scholarships](https://www.uaeu.ac.ae/en/admission/undergraduate-scholarships.shtml) | UAE | Bachelor | **DZ-verified as international applicant** | Scholarship dependent | HTML | P1 |
| [Brunei Government Scholarship for Foreign Students](https://www.mfa.gov.bn/pages/ONLINE-BDGS.aspx) | Brunei | Diploma, Bachelor, Master | **International/verify each intake** | Strong/full | HTML | P0 |
| [Brunei MOE Scholarship Management](https://www.moe.gov.bn/department-of-scholarship-management/) | Brunei | Multiple | **International/verify** | Mixed | HTML/PDF | P1 |
| [NL Scholarship](https://www.studyinnl.org/finances/nl-scholarship) | Netherlands | Bachelor/Master | **DZ-verified** | Partial (€5,000 current scheme) | HTML + university links | P1 |
| [Nuffic NL Scholarship](https://www.nuffic.nl/en/nl-scholarship) | Netherlands | Bachelor/Master | **DZ-verified** | Partial | HTML | P2 |
| [Study in Austria – funding](https://studyinaustria.at/en/plan-your-studies/scholarships-funding) | Austria | All/research | **International/verify** | Mixed | HTML | P1 |
| [grants.at](https://grants.at/en/) | Austria | Bachelor–postdoc/research | **DZ-verified for searchable schemes** | Mixed | Search/HTML | P0 |
| [Slovakia National Scholarship Programme](https://www.scholarships.sk/en/main/programme-terms-and-conditions/foreign-applicants%C2%A0) | Slovakia | Student mobility, PhD, research | **Needs call-level verification** | Mobility funding | HTML | P1 |
| [Oxford Graduate Scholarships](https://www.ox.ac.uk/admissions/graduate/fees-and-funding/funding/scholarships) | UK | Master/DPhil | **International/verify** | Full + partial | HTML/search | P0 |
| [Oxford Clarendon](https://www.ox.ac.uk/admissions/graduate/fees-and-funding/funding/clarendon/applicants) | UK | Master/DPhil | **DZ-verified: worldwide** | Full | HTML | P0 |
| [Oxford A–Z Scholarships](https://www.ox.ac.uk/admissions/graduate/fees-and-funding/fees-funding-and-scholarship-search/scholarships-a-z-listing) | UK | Graduate | **International/verify** | Mixed | Search/HTML | P0 |
| [Cambridge Postgraduate Funding](https://www.postgraduate.study.cam.ac.uk/funding) | UK | Master/PhD | **International/verify** | Full + partial | HTML/search | P0 |
| [Cambridge postgraduate funding search](https://www.student-funding.cam.ac.uk/) | UK | Master/PhD | **International/verify** | Mixed | Search/JS | P0 |
| [ETH Zurich ESOP](https://ethz.ch/students/en/studies/financial/scholarships/excellencescholarship.html/) | Switzerland | Master | **DZ-verified: no nationality exclusion stated** | Full | HTML | P0 |
| [EPFL Excellence Fellowships](https://www.epfl.ch/education/master/master-excellence-fellowships/how-to-apply/) | Switzerland | Master | **DZ-verified: any Master applicant** | Strong partial | HTML | P0 |
| [Marie Skłodowska-Curie Doctoral Networks](https://marie-sklodowska-curie-actions.ec.europa.eu/actions/doctoral-networks) | Europe/global | Funded PhD positions | **International/verify vacancy mobility rules** | Salaried/funded | HTML → EURAXESS | P0 |
| [EURAXESS jobs](https://euraxess.ec.europa.eu/jobs) | Europe/global | PhD, postdoc, research | **International/verify** | Salaried/funded | Search/API-like HTML | P0 |
| [University of Amsterdam AUAS scholarships](https://www.amsterdamuas.com/study/international-admissions/financial-matters/scholarships) | Netherlands | Bachelor/Master | **DZ-verified as non-EEA** | Partial | HTML | P1 |
| [Erasmus University Rotterdam IHS NL Scholarship](https://www.ihs.nl/en/education/scholarships/nl-scholarship) | Netherlands | Master | **DZ-verified as non-EEA** | Partial | HTML | P1 |
| [University of Sidi Bel Abbès – Bourses](https://www.univ-sba.dz/fr/bourses-detudes/) | Algeria | All | **DZ-specific** | Mixed | HTML | P0 |
| [Université Badji Mokhtar Annaba – bourses de coopération](https://www.univ-annaba.dz/cooperation/offres-de-bourses-de-cooperation/) | Algeria | All/research | **DZ-specific** | Mixed | HTML/pagination | P0 |
| [Université Oran 2 – international scholarships](https://vrre.univ-oran2.dz/programme-offres-de-bourses-internationale-2026/) | Algeria | Master/PhD/mobility | **DZ-specific** | Mixed | HTML | P0 |
| [Université Sétif 1 – Bourses & programmes](https://fr.univ-setif.dz/plus-bourses-programmes) | Algeria | Master/PhD/research | **DZ-specific** | Mixed | HTML | P0 |
| [Université Khenchela – Bourses](https://www.univ-khenchela.dz/fr/category/bourses-detudes/) | Algeria | Master/PhD/research | **DZ-specific** | Mixed | WordPress category + RSS likely | P0 |
| [Université Blida 1 – Scholarships Abroad](https://www.univ-blida.dz/en/category/%D8%A7%D9%84%D9%85%D9%86%D8%AD-%D8%A7%D9%84%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D8%A8%D8%A7%D9%84%D8%AE%D8%A7%D8%B1%D8%AC/) | Algeria | All | **DZ-specific** | Mixed | WordPress/pagination | P0 |
| [Université Batna 2 – Scholarships](https://univ-batna2.dz/language/en/category/scholarships/) | Algeria | All | **DZ-specific** | Mixed | WordPress category | P0 |
| [Batna 2 RELEX – foreign training](https://relex.univ-batna2.dz/formation-letranger) | Algeria | Study/training abroad | **DZ-specific** | Mixed | HTML | P1 |
| [Université Béjaïa – international announcements](https://www.univ-bejaia.dz/univ-actualites/) | Algeria | Mobility/scholarship | **DZ-specific** | Mixed | HTML/pagination | P1 |
| [Université Alger 3 – Bourses](https://www.univ-alger3.dz/fr/?cat=1) | Algeria | Scholarships/news | **DZ-specific** | Mixed | WordPress category | P1 |
| [Université Tlemcen – Actualités](https://univ-tlemcen.dz/fr/actualites) | Algeria | Scholarships/mobility | **DZ-specific** | Mixed | Pagination/search | P0 |
| [Tlemcen RELEX](https://vrex.univ-tlemcen.dz/) | Algeria | External relations/Erasmus | **DZ-specific** | Mixed | HTML | P1 |
| [USTO – Erasmus scholarship category](https://www.univ-usto.dz/category/bourse-erasmus/) | Algeria | Erasmus + foreign calls | **DZ-specific** | Mixed | WordPress category | P0 |
| [USTO chemistry – scholarships & cooperation](https://www.univ-usto.dz/faculte/fac-chimie/fr/bourses-detude/) | Algeria | Scholarship/mobility | **DZ-specific** | Mixed | HTML | P2 |
| [Université M’Sila](https://www.univ-msila.dz/site/) | Algeria | Foreign relations announcements | **DZ-specific** | Mixed | WordPress/search | P1 |
| [Université Biskra – scholarship category](https://digitaq.univ-biskra.dz/category/programmes-internationaux-erasmus/bourse-2-programmes-internationaux-erasmus/) | Algeria | Scholarships/Erasmus | **DZ-specific** | Mixed | WordPress | P1 |
| [Université Ouargla RELEX](https://relex.univ-ouargla.dz/) | Algeria | Scholarships, agreements, mobility | **DZ-specific** | Mixed | HTML | P1 |
| [Université Ouargla – scholarship archive](https://ww.univ-ouargla.dz/index.php/fr/bourses.html) | Algeria | Scholarship archive | **DZ-specific** | Mixed | HTML/pagination | P2 |

The Middle-East university sources are especially useful because several of them offer funding directly through admission rather than through a national scholarship competition. KAUST states that admitted graduate students receive its fellowship; MBZUAI’s current MSc/PhD funding page lists tuition, stipend, airfare, insurance and visa support; Khalifa University explicitly includes international graduate students; HBKU lists separate international Master/PhD stipend categories. citeturn467453search0turn467453search5turn467453search6turn467453search7

Likewise, Oxford Clarendon is worldwide and covers full fees plus living support; Oxford’s scholarship database currently contains a Mohammed bin Rashid Al Maktoum scholarship whose eligible nationalities explicitly include Algeria. Cambridge’s central funding portal aggregates international graduate funding, while ETH ESOP and EPFL Excellence are strong European university-level crawler seeds. citeturn624881search0turn624881search2turn624881search3turn624881search6turn624881search7

## Time-sensitive 2026–2027 and 2027–2028 calls worth monitoring separately

These are **call URLs**, not evergreen master seeds. Store them in a `calls` or `source_pages` table and link them to the corresponding evergreen source. Do not assume “open” merely because the page exists.

| Call / page | Status on 23 Nov 2026 | Algerian relevance | Why retain |
|---|---|---|---|
| [Campus France Eiffel 2027](https://www.algerie.campusfrance.org/lancement-de-l-appel-a-candidatures-france-excellence-eiffel-2027) | **Open**, Campus France says until 6 Jan 2027 | DZ-specific channel | Master/Doctorate; useful current positive example for extraction. citeturn611450search3 |
| [MEXT 2027 – Japan Embassy Algeria](https://www.dz.emb-japan.go.jp/itpr_ja/11_000001_00417.html) | **Closed** | DZ-specific | Excellent example of correctly detecting a closed scholarship. citeturn853364search1 |
| [GKS-U 2027](https://studyinkorea.go.kr/ko/plan/gksNoticeRead.do?bbsId=BBSMSTR_000000000461&nttId=4522) | Official 2027 notice published | Verify Algeria quota in attachment/current embassy notice | Contains PDF/ZIP university information. citeturn853364search3 |
| [Chevening Algeria 2027–28](https://www.chevening.org/scholarship/algeria/) | **Closed** | DZ-specific | Evergreen source remains P0 despite closed cycle. citeturn426645search1 |
| [Swiss Government Excellence 2027–28](https://www.sbfi.admin.ch/en/swiss-government-excellence-scholarships) | Annual page current | DZ-specific country entry | Algeria’s 2027–28 deadline was 13 Nov 2026 for Research Fellowship/PhD. citeturn771087search4turn771087search8 |
| [ETH ESOP 2027](https://ethz.ch/students/en/studies/financial/scholarships/excellencescholarship.html/) | **Open 1–30 Nov 2026** | International | Fully funded Master funding. citeturn624881search6 |
| [NL Scholarship 2027–28](https://www.studyinnl.org/finances/nl-scholarship) | Official page says current application cycle open; institution dates differ | Algeria qualifies as non-EEA | Good multi-university discovery hub. citeturn695378search0 |
| [Brunei 2027–28 announcement](https://www.moe.gov.bn/blog/2026/10/17/surat-pemberitahuan-ministry-of-education-for-his-majesty-the-sultan-and-yang-di-pertuan-negara-brunei-darussalam-governments-scholarship-scheme-general-for-the-academic-session-2027-2028/) | Applications expected Jan 2027 | Verify foreign-student scheme | Strong future-call trigger. citeturn521272search0 |
| [Chinese Government Scholarship – Khenchela 2027–28](https://www.univ-khenchela.dz/fr/category/bourses-detudes/) | Posted Nov 2026 | **Explicitly 30 Algerian PhD candidates** | Extremely high-value Algeria-only call example. citeturn340204search7 |
| [Chinese Government Scholarship – Batna 2](https://univ-batna2.dz/language/en/chinese-government-scholarship-application/) | Posted Nov 2026 | **Explicit Algeria PhD route** | Good duplicate-detection test against other Algerian university relays. citeturn128544search27turn128544search19 |
| [Chinese Scholarship – M’Sila 2027–28](https://www.univ-msila.dz/site/chinese-scholarship-program-for-the-2027-2028-academic-year/) | Posted 3 Nov 2026 | DZ-specific | Same underlying national call, ideal deduplication case. citeturn274815search22 |
| [DAAD 2027 – Tlemcen relay](https://univ-tlemcen.dz/fr/actualites/4556/ouverture-des-candidatures-au-programme-de-bourses-allemandes-daad-ann-e-2027) | Published 2026 | DZ-specific relay | Good link-to-primary-source training example. citeturn128544search0 |
| [MEIG 2027–28 – M’Sila](https://www.univ-msila.dz/site/meig-masters-scholarship-in-switzerland-for-the-2027-2028-academic-year/) | Current Nov 2026 post | DZ-specific relay | Useful niche opportunity; crawler should discover original MEIG site. citeturn274815search11 |
| [Erasmus+ Perpignan – Béjaïa](https://www.univ-bejaia.dz/univ-actualites/3510-appel-a-candidature-au-programme-de-bourse-de-mobilite-erasmus-perpignanen-france) | Deadline passed 8 Nov 2026 | Students enrolled at Béjaïa | Tests institutional-affiliation eligibility. citeturn340204search4 |
| [ABE Initiative 2027 – USTO](https://www.univ-usto.dz/offre-bourses-japon26/) | 2026 call relay | Algerian candidates via institutional route | Valuable JICA/MESRS cross-source linkage. citeturn274815search5turn807976search9 |
| [USTO India 2026–27](https://www.univ-usto.dz/bourse-etude-inde2026/) | 2026–27 call | Algeria institutional relay | Seed for discovering ICCR/ITEC/Indian government pathways. citeturn274815search0 |
| [USTO Romania 2026–27](https://www.univ-usto.dz/bourse-roumaine-2026-2027/) | Past/current academic-year call | Algeria relay | Useful verification against official Study in Romania source. citeturn274815search8turn771087search3 |
| [USTO Indonesia UMPWR 2026–27](https://www.univ-usto.dz/bourse-indonesieumpwr2026/) | 2026–27 | Algerian institutional route | Partial-funding example. citeturn274815search10 |
| [M’Sila Tunisia doctoral grant 2026–27](https://www.univ-msila.dz/site/grants-for-students-preparing-doctoral-theses-at-tunisian-universities-for-the-2026-2027-academic-year/) | Deadline passed | Algeria institutional relay | Regional Maghreb opportunity type often missed by global aggregators. citeturn274815search14 |
| [Biskra scholarship feed/category](https://www.univ-biskra.dz/index.php/en/programmes-internationaux-erasmus/109-bourse-2/3882-offres-de-bourses-3) | Live source page | Algeria | Useful recurring local relay. citeturn274815search34 |

Your crawler should explicitly keep **evergreen sources and calls in separate tables**. A call can expire while the source remains extremely valuable.

A useful schema would therefore be:

```json
{
  "source": {
    "source_id": "campus_france_algeria",
    "type": "official_portal",
    "evergreen_url": "https://www.algerie.campusfrance.org/",
    "country": "France",
    "audience": ["Algeria"],
    "priority": "P0"
  },
  "call": {
    "title": "France Excellence Eiffel 2027",
    "academic_year": "2027-2028",
    "status": "open",
    "source_id": "campus_france_algeria",
    "deadline": "2027-01-06",
    "eligibility_status": "verified",
    "last_verified": "2026-11-23"
  }
}
```

## Explicit exclusions and traps

Do **not** teach your AI that “international scholarship” means “Algerian eligible.” Several major programmes require aggressive nationality filtering.

**ARES Belgium:** Algeria is **not in the current 2027–28 list of 32 eligible partner countries**. Morocco and Tunisia are present, Algeria is not. Keep ARES only in an exclusion/monitoring dataset, not as a recommendation source for Algerians unless a future call changes the list. citeturn426645search5

**VLIR-UOS:** Algeria is likewise absent from the published eligible-country list for its ICP scholarships. Morocco appears, Algeria does not. Do not recommend it to an Algerian applicant under the current rules. citeturn426645search6

**Portuguese DGES social grants:** ordinary international students entering under Portugal’s international-student regime are generally **not eligible** for the standard DGES grant. University-specific merit awards and research funding may still exist, but the national DGES grant should not be surfaced as a normal Algerian scholarship. citeturn695378search10turn695378search11

**Slovak National Scholarship Programme:** the ministry page and the programme’s current terms are not perfectly aligned in how country eligibility is described, so Algeria should be treated as **verification required**, not automatically eligible, until the exact current call conditions are parsed. citeturn695378search7turn695378search8

**UAE federal ministry scholarship:** the UAE Ministry’s own scholarship programme is explicitly reserved for UAE citizens; this should **not** be recommended to Algerians. UAE universities such as MBZUAI, Khalifa University and UAEU are separate and do admit/fund international students. citeturn751828search8turn467453search4turn467453search6turn751828search9

This exclusion dataset is actually valuable training material. Your AI should learn both **positive eligibility evidence** and **negative evidence** rather than assuming absence of a restriction means eligibility.

## Recommended crawler policy and source scoring

For your system, I would assign each source four independent scores: `trust_score`, `algeria_relevance`, `discovery_yield`, and `freshness`. Government ministries, embassies and official programme portals begin with the highest trust; Algerian universities are highly relevant but often act as relay sources, so their crawler should attempt to locate the **original foreign programme URL** before declaring an opportunity verified. This pattern is visible repeatedly in Algerian university pages relaying DAAD, Chinese Government, JICA, Romanian and Erasmus calls. citeturn340204search2turn340204search6turn128544search27turn274815search5

I would configure the crawl strategies approximately as follows:

| Source class | Strategy |
|---|---|
| MESRS / embassies | Fetch HTML → extract links/PDFs → follow newest scholarship posts |
| Algerian university WordPress sites | Category/archive crawl + RSS if available + pagination |
| Erasmus / DAAD / national scholarship databases | Search endpoint or filtered pages + programme detail pages |
| University scholarship pages | HTML first; Playwright only if application data is JS-rendered |
| PDF-heavy calls | Download PDF, text extract, preserve page/source evidence |
| Search portals | Treat every result URL as a candidate; never trust snippet eligibility alone |
| Repeated Algerian relay posts | Content hash + title/provider/year deduplication |
| Closed calls | Keep record and source; schedule next-season revisit |
| Embassy announcements | Very high Algeria eligibility weight |
| Aggregators | Discovery only; require official-source verification before publication |

A particularly useful positive signal is **an embassy in Algiers or an Algerian university explicitly instructing Algerian applicants to apply**. For example, Indonesia’s embassy in Algiers explicitly serves Algerian applicants to KNB and other Indonesian government programmes; Korea’s embassy has explicitly allocated GKS places to Algerians; JICA reports Algerian participation in ABE; and the Japanese embassy administers Algeria’s MEXT route. citeturn521272search5turn521272search6turn853364search4turn807976search9turn853364search1

For discovery aggregators, I would seed **ScholarMap Algeria** as P2 only. Its Algeria page currently surfaces dozens of opportunities and links users toward official sources, but it should never establish eligibility by itself. citeturn611450search8

## SerpAPI multilingual discovery queries

These are the query families I would put into your initial keyword database. The system should parameterize year, degree, country, university and discipline rather than storing thousands of literal queries.

```text
# Algeria government / university channels
site:mesrs.dz bourse 2027
site:mesrs.dz "offre de bourse"
site:mesrs.dz "programme de bourses" étudiant algérien
site:dz "bourse" "2027/2028" "étudiants algériens"
site:edu.dz "bourse" master 2027
site:univ-*.dz "offre de bourse" 2027
site:univ-*.dz Erasmus+ mobilité 2027
site:univ-*.dz "Master" "bourse" étranger
site:univ-*.dz "Doctorat" "bourse" étranger

# French
"bourse d'études" Algérie master 2027
"bourse entièrement financée" Algériens master
"bourse doctorat" "étudiants algériens"
"appel à candidatures" bourse Algérie 2027
"programme de mobilité" Algérie Erasmus 2027
"bourse gouvernementale" Algérie étudiant
"bourse excellence" Algérie master

# Arabic
"منحة دراسية" الجزائر 2027
"منحة ممولة بالكامل" "الطلبة الجزائريين"
"منح ماستر" الجزائر 2027
"منح دكتوراه" الجزائر 2027
"فتح باب الترشح" منحة الجزائر
"منحة حكومية" "الطلبة الجزائريين"
"برنامج تبادل" "الطلبة الجزائريين"

# English global
"Algerian students" scholarship 2027
"Algeria" "fully funded scholarship" 2027
"Algerian nationals" scholarship master
"Algerian citizens" scholarship PhD
"international students" scholarship "all nationalities" 2027
"international students" scholarship "non-EU" master 2027
"international students" "full tuition" stipend master
"international students" "fully funded" PhD 2027

# Official-domain targeting
site:erasmus-plus.ec.europa.eu scholarship master international
site:daad.de scholarship Algeria
site:campusfrance.org Algérie bourse
site:studyinkorea.go.kr GKS 2027
site:studyinjapan.go.jp MEXT 2028
site:stipendiumhungaricum.hu Algeria
site:esteri.it scholarship Algeria
site:studyinromania.gov.ro scholarship non-EU
site:sbfi.admin.ch scholarship Algeria
site:chevening.org Algeria scholarship
site:hea.ie international scholarship master PhD
site:mtcp.kln.gov.my scholarship Algeria
site:knb.kemdiktisaintek.go.id scholarship
site:isdb.org scholarships Algeria

# Embassy discovery
site:gov.* Algeria embassy scholarship 2027
site:*.mofa.go.kr Algeria scholarship
site:*.emb-japan.go.jp Algeria scholarship
site:kemlu.go.id Algiers scholarship
site:eda.admin.ch Algeria scholarship
"Embassy" Algeria scholarship "2027"
"Ambassade" Alger "bourse" 2027

# University funding discovery
site:edu "international students" "full scholarship" master 2027
site:ac.uk international scholarship overseas master 2027
site:edu "all admitted students" fellowship PhD
site:edu "international applicants" scholarship PhD
site:edu "international student scholarship" Algeria
site:ac.* scholarship international students master
site:edu.au scholarship international students research
site:ca scholarship international students PhD funding

# PDF calls
filetype:pdf scholarship Algeria 2027
filetype:pdf "Algerian students" scholarship
filetype:pdf "eligible countries" Algeria scholarship 2027
filetype:pdf "appel à candidatures" bourse Algérie
filetype:pdf "منحة" الجزائر 2027

# Year expansion
("2027-2028" OR "2027/2028") scholarship Algeria
("2028-2029" OR "2028/2029") scholarship Algeria
("academic year 2027" OR "academic year 2028") scholarship international students

# Programme-specific
"Erasmus Mundus" Algeria 2027
"DAAD" Algeria 2027 scholarship
"MEXT" Algeria 2028 scholarship
"GKS" Algeria 2027
"Stipendium Hungaricum" Algeria 2027
"Chinese Government Scholarship" Algeria 2027
"Türkiye Scholarships" Algeria
"Fulbright" Algeria student
"MTCP" Algeria scholarship
"KNB Scholarship" Algeria
"Chevening Algeria" 2028
"Swiss Government Excellence" Algeria
"Government of Ireland" scholarship Algeria
```

The most efficient SerpAPI pattern is not simply `scholarship Algeria`. Use a matrix of **source language × degree × year × programme type × country/operator**, then measure `new_verified_scholarships / search_request`. Your system can later promote productive patterns and retire low-yield ones.

The strongest initial crawling order is therefore: **MESRS → Algerian university cooperation offices → embassies in Algeria → major government scholarship programmes → Erasmus/DAAD/EURAXESS-style databases → university-level full-funding portals → aggregators last**. That ordering gives you the cleanest evidence for training the AI to distinguish a real Algerian-eligible scholarship from merely an international-looking page. citeturn611450search0turn340204search2turn853364search4turn807976search7turn624881search0