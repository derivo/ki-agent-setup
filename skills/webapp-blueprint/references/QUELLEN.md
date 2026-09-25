# Quellen & Evidenzlage

Alle Quellen wurden am **2026-09-25** abgerufen (URL aufgelöst bzw. DOI über Crossref
bestätigt). Rechtsstand, Normausgaben und Entwurfsstatus beziehen sich auf dieses Datum.

**Typ** sagt, wie viel eine Quelle trägt:
`Norm` (ISO/IEC, W3C-Empfehlung) · `Standard` (IETF-RFC) · `Entwurf` (IETF-Draft,
W3C-Arbeitsentwurf — kann sich ändern oder verfallen) · `Gesetz` · `Leitfaden`
(Hersteller- oder Community-Richtlinie, Praxis ohne Wirksamkeitsnachweis) ·
`empirisch` (peer-reviewte Studie mit Daten) · `konzeptionell` (peer-reviewt, ohne
eigene Daten) · `Buch/Bericht` (Praxis- oder Erfahrungswissen).

## Wie aktuell halten

Anlass zur Prüfung ist eine neue Ausgabe, nicht ein neuer Commit: ASVS, OWASP Top 10,
WCAG, NIST 800-63, ISO 25010, arc42, die IETF-Entwürfe (Idempotency-Key, RateLimit)
und alle Gesetze in Bereich 06. Beim Aktualisieren: Quelle neu abrufen, betroffene
Katalogpunkte anpassen, Datum oben setzen.

## Standards, Normen, Leitfäden

### API

| Kürzel | Quelle | Typ | Stand |
|---|---|---|---|
| RFC9110 | [HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) | Standard | STD 97, Juni 2022 |
| RFC9111 | [HTTP Caching](https://datatracker.ietf.org/doc/rfc9111/) | Standard | STD 98, Juni 2022 |
| RFC9457 | [Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/rfc9457/) | Standard | Juli 2023, ersetzt RFC 7807 |
| RFC9745 | [The Deprecation HTTP Response Header Field](https://datatracker.ietf.org/doc/rfc9745/) | Standard | März 2025 |
| RFC8594 | [The Sunset HTTP Header Field](https://datatracker.ietf.org/doc/rfc8594/) | Standard (Informational) | Mai 2019 |
| RFC6585 | [Additional HTTP Status Codes](https://datatracker.ietf.org/doc/rfc6585/) | Standard | 2012 |
| RFC9700 | [Best Current Practice for OAuth 2.0 Security](https://datatracker.ietf.org/doc/rfc9700/) | Standard (BCP 240) | Januar 2025 |
| IDEM-D | [The Idempotency-Key HTTP Header Field](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) | Entwurf | -07, abgelaufen |
| RATELIMIT-D | [RateLimit header fields for HTTP](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/) | Entwurf | -11, Mai 2026, aktiv |
| AIP-151 … AIP-233 | Google API Improvement Proposals: [151](https://google.aip.dev/151), [155](https://google.aip.dev/155), [157](https://google.aip.dev/157), [158](https://google.aip.dev/158), [180](https://google.aip.dev/180), [185](https://google.aip.dev/185), [193](https://google.aip.dev/193), [233](https://google.aip.dev/233) | Leitfaden | laufend |
| ZALANDO | [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/) (Regelnummern `#nnn`) | Leitfaden | laufend |
| MS-API | [Microsoft Azure REST API Guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md) | Leitfaden | laufend |
| STRIPE-V | [Stripe: APIs as infrastructure — future-proofing Stripe with versioning](https://stripe.com/blog/api-versioning) | Leitfaden | Blog |
| GH-V | [GitHub REST API versions](https://docs.github.com/en/rest/about-the-rest-api/api-versions) | Leitfaden | laufend |
| CDC | [Consumer-Driven Contracts: A Service Evolution Pattern](https://martinfowler.com/articles/consumerDrivenContracts.html) (Robinson) | Leitfaden | 2006 |
| STDWEBHOOKS | [Standard Webhooks](https://www.standardwebhooks.com/) | Leitfaden (Community-Spezifikation) | laufend |
| OWASP-REST | [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html) | Leitfaden | laufend |

### Sicherheit

| Kürzel | Quelle | Typ | Stand |
|---|---|---|---|
| ASVS5 | [OWASP Application Security Verification Standard 5.0](https://github.com/OWASP/ASVS) — IDs `Vx.y.z` | Leitfaden (Prüfstandard) | 5.0.0, Mai 2025 |
| OWASP-T10-2025 | [OWASP Top 10:2025](https://top10.owasp.org/2025) | Leitfaden (Sensibilisierung) | 2025 |
| OWASP-API-2023 | [OWASP API Security Top 10 2023](https://api-security.owasp.org/editions/2023/en/0x11-t10) | Leitfaden | 2023 |
| NIST-63B-4 | [NIST SP 800-63B-4, Authentication and Authenticator Management](https://pages.nist.gov/800-63-4/sp800-63b.html) | Norm | final, Juli 2025 |
| NIST-EVENTS | [NIST SP 800-63B-4: Authenticator Event Management](https://pages.nist.gov/800-63-4/sp800-63b/events/) — Recovery, Hinzufügen und Ersetzen von Authenticators | Norm | final, Juli 2025 |
| OWASP-HEADERS | [HTTP Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html) | Leitfaden | laufend |
| OWASP-CSRF | [CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) | Leitfaden | laufend |
| OWASP-UPLOAD | [File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) | Leitfaden | laufend |
| OWASP-LOG | [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) | Leitfaden | laufend |
| OWASP-TM | [OWASP Threat Modeling](https://community.owasp.org/Threat_Modeling) | Leitfaden | laufend |
| SLSA | [SLSA Specification](https://slsa.dev/spec/) | Leitfaden (Spezifikation) | v1.2 |
| RFC9116 | [A File Format to Aid in Security Vulnerability Disclosure](https://www.rfc-editor.org/rfc/rfc9116.html) | Standard (Informational) | April 2022 |
| SSDF | [NIST SP 800-218, Secure Software Development Framework 1.1](https://csrc.nist.gov/pubs/sp/800/218/final) | Norm | final Feb. 2022; v1.2 nur Entwurf (Dez. 2025) |
| SAMM | [OWASP Software Assurance Maturity Model](https://owaspsamm.org/model/) | Reifegradmodell | laufend; Versionsnummer auf der Modellseite nicht angegeben |
| TT | [W3C Trusted Types](https://www.w3.org/TR/trusted-types/) | Norm-Entwurf (W3C Working Draft) | WD 23.06.2026, keine Recommendation |
| SRI | [W3C Subresource Integrity](https://www.w3.org/TR/2016/REC-SRI-20160623/) | Norm (W3C Recommendation) | REC 2016; Nachfolger als Working Draft |
| RFC8725 | [JSON Web Token Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725) | Norm (IETF BCP 225) | Feb. 2020 |
| OWASP-REDIRECT | [OWASP Unvalidated Redirects and Forwards Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) | Leitfaden | laufend |
| OWASP-DESER | [OWASP Deserialization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html) | Leitfaden | laufend |
| OWASP-LLM-2025 | [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/) | Leitfaden | 2025 |
| NIST-800-190 | [NIST SP 800-190, Application Container Security Guide](https://csrc.nist.gov/pubs/sp/800/190/final) | Norm | final Sept. 2017 |
| ISO29119 | [ISO/IEC/IEEE 29119-1:2022, Software testing — Concepts and definitions](https://standards.ieee.org/ieee/29119-1/10779/) | Norm | 2022 (Seite von IEEE SA; iso.org beim Abruf gesperrt) |
| ISTQB-CTFL4 | [ISTQB Certified Tester Foundation Level v4.0](https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/) | Lehrplan | Syllabus v4.0.1 |
| SWEBOOK20 | Winters, Manshreck, Wright: [*Software Engineering at Google*, Kap. 11 Testing Overview](https://abseil.io/resources/swe-book/html/ch11.html), O’Reilly 2020 | Buch (Praxis) | Testmix 80/15/5 ausdrücklich „very rough guideline“ |
| MICCO16 | [Micco: Flaky Tests at Google and How We Mitigate Them](https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html), Google Testing Blog | Praxisbericht | 2016: 1,5 % der Läufe instabil; 84 % der Wechsel grün→rot durch instabile Tests |

### Betrieb, Observability, Delivery

| Kürzel | Quelle | Typ | Stand |
|---|---|---|---|
| SRE-MON | [Google SRE Book: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/) | Buch/Bericht | 2016 |
| SRE-CASCADE | [SRE Book: Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/) | Buch/Bericht | 2016 |
| SRE-ONCALL | [SRE Book: Being On-Call](https://sre.google/sre-book/being-on-call/) | Buch/Bericht | 2016 |
| SRE-INCIDENT | [SRE Book: Managing Incidents](https://sre.google/sre-book/managing-incidents/) | Buch/Bericht | 2016 |
| SRE-POSTMORTEM | [SRE Book: Postmortem Culture](https://sre.google/sre-book/postmortem-culture/) | Buch/Bericht | 2016 |
| SRE-PRR | [SRE Book: The Evolving SRE Engagement Model](https://sre.google/sre-book/evolving-sre-engagement-model/) | Buch/Bericht | 2016 |
| SRE-SLO | [SRE Workbook: Implementing SLOs](https://sre.google/workbook/implementing-slos/) | Buch/Bericht | 2018 |
| SRE-ALERT | [SRE Workbook: Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/) | Buch/Bericht | 2018 |
| SRE-CANARY | [SRE Workbook: Canarying Releases](https://sre.google/workbook/canarying-releases/) | Buch/Bericht | 2018 |
| RED | [The RED Method](https://grafana.com/blog/the-red-method-how-to-instrument-your-services/) | Leitfaden | Blog |
| USE | [The USE Method](https://www.brendangregg.com/usemethod.html) (Gregg) | Leitfaden | laufend |
| PROM-NAMING | [Prometheus: Metric and label naming](https://prometheus.io/docs/practices/naming/) | Leitfaden | laufend |
| PROM-SEC | [Prometheus: Security model](https://prometheus.io/docs/operating/security/) | Leitfaden | laufend |
| W3C-TC | [W3C Trace Context](https://www.w3.org/TR/trace-context/) | Norm (W3C-Empfehlung) | Level 1, Nov. 2021 |
| OTEL-PROP | [OpenTelemetry: Context propagation](https://opentelemetry.io/docs/concepts/context-propagation/) | Leitfaden | laufend |
| OTEL-MSG | [OpenTelemetry semantic conventions: Messaging spans](https://opentelemetry.io/docs/specs/semconv/messaging/messaging-spans/) | Leitfaden (Spezifikation) | abgerufen 2026-09-25 |
| OTEL-SEMCONV | [OpenTelemetry semantic conventions: HTTP spans](https://opentelemetry.io/docs/specs/semconv/http/http-spans/) | Leitfaden (Spezifikation) | semconv 1.44.0; Kernattribute stabil |
| K8S-PROBES | [Kubernetes: Liveness, Readiness, and Startup Probes](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/) | Leitfaden | laufend |
| K8S-LIFECYCLE | [Kubernetes: Pod Lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/) | Leitfaden | laufend |
| HEALTH-D | [Health Check Response Format for HTTP APIs](https://datatracker.ietf.org/doc/draft-inadarei-api-health-check/) | Entwurf | -06, 2021, abgelaufen |
| 12F | [The Twelve-Factor App](https://12factor.net/) (Faktoren I–XII) | Leitfaden | Text von 2017 |
| 12F-OSS | [Twelve-Factor is now open source](https://12factor.net/blog/open-source-announcement) | Leitfaden | November 2024 |
| AWS-REL | [AWS Well-Architected: Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html) | Leitfaden | laufend |
| AWS-RETRY | [Timeouts, retries and backoff with jitter](https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter) | Leitfaden | Builders' Library |
| AWS-DR | [Disaster recovery options in the cloud](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html) | Leitfaden | laufend |
| CISA-BACKUP | [CISA: Back Up Business Data](https://www.cisa.gov/audiences/small-and-medium-businesses/secure-your-business/back-up-business-data) | Leitfaden (Behörde) | laufend |
| FOWLER-CB | [Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html) | Leitfaden | Blog |
| FOWLER-PC | [Parallel Change (Expand/Contract)](https://martinfowler.com/bliki/ParallelChange.html) | Leitfaden | Blog |
| FOWLER-FLAGS | [Feature Toggles](https://martinfowler.com/articles/feature-toggles.html) | Leitfaden | Blog |
| DORA-METRICS | [DORA's software delivery metrics](https://dora.dev/guides/dora-metrics/) | Leitfaden (umfragebasiert) | fünf Kennzahlen, Januar 2026 |
| DORA-TBD | [DORA: Trunk-based development](https://dora.dev/capabilities/trunk-based-development/) | Leitfaden (umfragebasiert) | laufend |
| SEMVER | [Semantic Versioning 2.0.0](https://semver.org/) | Leitfaden | 2.0.0 |
| KAC | [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) | Leitfaden | 1.1.0 |
| WEBDEV-CACHE | [web.dev: Prevent unnecessary network requests with the HTTP Cache](https://web.dev/articles/http-cache) | Leitfaden | laufend |
| NC-UPGRADE | [Nextcloud Admin Manual: Upgrade](https://docs.nextcloud.com/server/latest/admin_manual/maintenance/upgrade.html) | Praxisbeispiel | laufend |
| NC-BACKUP | [Nextcloud Admin Manual: Backup](https://docs.nextcloud.com/server/latest/admin_manual/maintenance/backup.html) | Praxisbeispiel | laufend |
| BS-UPDATE | [BookStack: Updates](https://www.bookstackapp.com/docs/admin/updates/) | Praxisbeispiel | laufend |
| BS-BACKUP | [BookStack: Backup and Restore](https://www.bookstackapp.com/docs/admin/backup-restore/) | Praxisbeispiel | laufend |

### Recht (Deutschland/EU)

| Kürzel | Quelle | Typ | Stand |
|---|---|---|---|
| DSGVO | Datenschutz-Grundverordnung, Art. 5, 12, 13, 15, 17, 20, 25, 28, 30, 33 — Volltext über [dsgvo-gesetz.de](https://dsgvo-gesetz.de/art-5-dsgvo/) (EUR-Lex lieferte beim Abruf keinen Inhalt) | Gesetz | VO (EU) 2016/679 |
| DSGVO-6 | [Art. 6 DSGVO](https://dsgvo-gesetz.de/art-6-dsgvo/) — Rechtmäßigkeit der Verarbeitung | Gesetz | VO (EU) 2016/679 |
| DSGVO-9 | [Art. 9 DSGVO](https://dsgvo-gesetz.de/art-9-dsgvo/) — besondere Kategorien | Gesetz | VO (EU) 2016/679 |
| DSGVO-26 | [Art. 26 DSGVO](https://dsgvo-gesetz.de/art-26-dsgvo/) — gemeinsam Verantwortliche | Gesetz | VO (EU) 2016/679 |
| DSGVO-34 | [Art. 34 DSGVO](https://dsgvo-gesetz.de/art-34-dsgvo/) — Benachrichtigung Betroffener | Gesetz | VO (EU) 2016/679 |
| DSGVO-35 | [Art. 35 DSGVO](https://dsgvo-gesetz.de/art-35-dsgvo/) — Datenschutz-Folgenabschätzung | Gesetz | VO (EU) 2016/679 |
| TDDDG-25 | [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html) (vor 14.05.2024: TTDSG) | Gesetz | abgerufen 2026-09-25 |
| DDG-5 | [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html) | Gesetz | DDG vom 06.05.2024 |
| BFSG | [Barrierefreiheitsstärkungsgesetz §§ 1–3](https://www.gesetze-im-internet.de/bfsg/__1.html) | Gesetz | anwendbar seit 28.06.2025 |
| BFSG-14 | [§ 14 BFSG](https://www.gesetze-im-internet.de/bfsg/__14.html) mit [Anlage 3](https://www.gesetze-im-internet.de/bfsg/anlage_3.html) — Informationen über die Barrierefreiheit von Dienstleistungen | Gesetz | abgerufen 2026-09-25 |
| BFSGV-19 | [§ 19 BFSGV](https://www.gesetze-im-internet.de/bfsgv/__19.html) — Anforderungen an Dienstleistungen im elektronischen Geschäftsverkehr | Verordnung | abgerufen 2026-09-25 |
| BGB-312J | [§ 312j BGB](https://www.gesetze-im-internet.de/bgb/__312j.html) | Gesetz | abgerufen 2026-09-25 |
| BGB-312K | [§ 312k BGB](https://www.gesetze-im-internet.de/bgb/__312k.html) | Gesetz | abgerufen 2026-09-25 |
| BGB-356A | [§ 356a BGB](https://www.gesetze-im-internet.de/bgb/__356a.html) | Gesetz | seit 19.06.2026 |
| EGBGB-246A | [Art. 246a § 1 EGBGB](https://www.gesetze-im-internet.de/bgbeg/art_246a__1.html) | Gesetz | abgerufen 2026-09-25 |
| PANGV | [§ 3](https://www.gesetze-im-internet.de/pangv_2022/__3.html), [§ 4](https://www.gesetze-im-internet.de/pangv_2022/__4.html), [§ 6](https://www.gesetze-im-internet.de/pangv_2022/__6.html) und [§ 11 PAngV](https://www.gesetze-im-internet.de/pangv_2022/__11.html) | Gesetz | PAngV 2022 |
| UWG-7 | [§ 7 UWG](https://www.gesetze-im-internet.de/uwg_2004/__7.html) | Gesetz | abgerufen 2026-09-25 |
| UWG-ANH | [Anhang zu § 3 Abs. 3 UWG](https://www.gesetze-im-internet.de/uwg_2004/anhang.html), Nr. 23b, 23c | Gesetz | abgerufen 2026-09-25 |
| ODR-EU | [EU-Kommission: Schließung der ODR-Plattform](https://consumer-redress.ec.europa.eu/site-relocation_en) | Behördeninformation | abgeschaltet 20.07.2025 |
| DSA-QA | [EU-Kommission: Digital Services Act — Questions and Answers](https://digital-strategy.ec.europa.eu/en/faqs/digital-services-act-questions-and-answers) | Behördeninformation | abgerufen 2026-09-25 |
| AIACT-50 | [EU-Kommission: Transparency obligations under Article 50 AI Act](https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act) | Behördeninformation | gilt seit 02.08.2026 |
| CRA | [EU-Kommission: Cyber Resilience Act — Summary](https://digital-strategy.ec.europa.eu/en/policies/cra-summary) | Behördeninformation | in Kraft seit 10.12.2024 |
| CRA-REP | [EU-Kommission: CRA — Reporting obligations](https://digital-strategy.ec.europa.eu/en/policies/cra-reporting) | Behördeninformation | Meldepflichten seit 11.09.2026 |
| NIS2-BSI | [BSI: NIS-2-Umsetzungsgesetz in Kraft](https://www.bsi.bund.de/DE/Service-Navi/Presse/Pressemitteilungen/Presse2025/251205_NIS-2-Umsetzungsgesetz_in_Kraft.html) | Behördeninformation | 06.12.2025 |
| BSIG-28 | [§ 28 BSIG](https://www.gesetze-im-internet.de/bsig_2025/__28.html) | Gesetz | abgerufen 2026-09-25; Schwellenwerte vor Anwendung am Text prüfen |
| BSIG-32 | [§ 32 BSIG](https://www.gesetze-im-internet.de/bsig_2025/__32.html) — Meldepflichten, Erstmeldung binnen 24 Stunden | Gesetz | abgerufen 2026-09-25 |

### UX, Barrierefreiheit, i18n

| Kürzel | Quelle | Typ | Stand |
|---|---|---|---|
| WCAG22 | [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/) | Norm (W3C-Empfehlung) | Fassung Dezember 2024 |
| WCAG3-WD | [WCAG 3.0](https://www.w3.org/TR/wcag-3.0/) | Entwurf | Arbeitsentwurf September 2026 |
| ISO9241-110 | ISO 9241-110:2020 Interaktionsprinzipien — Überblick über [Wikipedia: ISO 9241](https://en.wikipedia.org/wiki/ISO_9241) (iso.org nicht abrufbar) | Norm | 2020 |
| NNG-HEUR | [10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) | Leitfaden | 1994, überarbeitet 2020 |
| NNG-RESP | [Response Times: The 3 Important Limits](https://www.nngroup.com/articles/response-times-3-important-limits/) | Leitfaden | laufend |
| NNG-5USERS | [Why You Only Need to Test with 5 Users](https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/) | Leitfaden | 2000 |
| NNG-FORMS | [Website Forms Usability](https://www.nngroup.com/articles/web-form-design/) | Leitfaden | 2016 |
| NNG-ERR | [Error-Message Guidelines](https://www.nngroup.com/articles/error-message-guidelines/) | Leitfaden | 2023 |
| NNG-EMPTY | [Designing Empty States](https://www.nngroup.com/articles/empty-state-interface-design/) | Leitfaden | 2021 |
| NNG-DARK | [Dark Mode vs. Light Mode](https://www.nngroup.com/articles/dark-mode/) | Leitfaden | 2020 |
| NNG-DS | [Design Systems 101](https://www.nngroup.com/articles/design-systems-101/) | Leitfaden | 2021 |
| NNG-SUCCESS | [Success Rate: The Simplest Usability Metric](https://www.nngroup.com/articles/success-rate-the-simplest-usability-metric/) | Leitfaden | 2001 |
| SUS | [Measuring Usability with the System Usability Scale](https://measuringu.com/sus/) | Leitfaden | 2011 |
| GOVUK-ERR | [GOV.UK Design System: Error message](https://design-system.service.gov.uk/components/error-message/) | Leitfaden | laufend |
| GOVUK-QP | [GOV.UK Design System: Question pages](https://design-system.service.gov.uk/patterns/question-pages/) | Leitfaden | laufend |
| CWV | [web.dev: Web Vitals](https://web.dev/articles/vitals) | Leitfaden | INP seit 2024 |
| ICU-MF | [ICU: Formatting Messages](https://unicode-org.github.io/icu/userguide/format_parse/messages/) | Leitfaden | laufend |
| CLDR-PLURAL | [CLDR: Plural Rules](https://cldr.unicode.org/index/cldr-spec/plural-rules) | Norm (Unicode) | laufend |
| UAX15 | [Unicode Normalization Forms](https://unicode.org/reports/tr15/) | Norm (Unicode) | laufend |
| UTS10 | [Unicode Collation Algorithm](https://unicode.org/reports/tr10/) | Norm (Unicode) | laufend |
| W3C-ENC | [Choosing & applying a character encoding](https://www.w3.org/International/questions/qa-choosing-encodings) | Leitfaden (W3C) | laufend |
| W3C-ACCEPTLANG | [Accept-Language used for locale setting](https://www.w3.org/International/questions/qa-accept-lang-locales) | Leitfaden (W3C) | laufend |
| W3C-DIR | [Structural markup and right-to-left text in HTML](https://www.w3.org/International/questions/qa-html-dir) | Leitfaden (W3C) | laufend |
| W3C-TZ | [Working with Time and Time Zones](https://www.w3.org/TR/timezone/) | Leitfaden (W3C Group Note) | Juli 2025 |
| MS-PSEUDO | [Microsoft: Pseudo-localization](https://learn.microsoft.com/en-us/globalization/methodology/pseudolocalization) | Leitfaden | 2022 |

### SEO & Marketing

| Kürzel | Quelle | Typ | Stand |
|---|---|---|---|
| RFC9309 | [Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html) | Standard | September 2022 |
| G-SITEMAP | [Google: Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) | Leitfaden | laufend |
| G-BLOCK | [Google: Block Search indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing) | Leitfaden | laufend |
| G-JS | [Google: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) | Leitfaden | März 2026 |
| G-HTTP | [Google: HTTP status codes and network errors](https://developers.google.com/search/docs/crawling-indexing/http-network-errors) | Leitfaden | Februar 2026 |
| G-CANON | [Google: Canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization) | Leitfaden | August 2026 |
| G-PAGINATION | [Google: Pagination and incremental page loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading) | Leitfaden | Dezember 2025 |
| G-MOVE | [Google: Site moves with URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) | Leitfaden | August 2026 |
| G-TITLE | [Google: Title links](https://developers.google.com/search/docs/appearance/title-link) | Leitfaden | laufend |
| G-SNIPPET | [Google: Snippets](https://developers.google.com/search/docs/appearance/snippet) | Leitfaden | April 2026 |
| G-MOBILE | [Google: Mobile-first indexing](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing) | Leitfaden | Dezember 2025 |
| G-SD | [Google: Intro to structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data) | Leitfaden | Dezember 2025 |
| G-HELPFUL | [Google: Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | Leitfaden | Dezember 2025 |
| G-AI | [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) | Leitfaden | Dezember 2025 |
| G-HREFLANG | [Google: Localized versions of your pages](https://developers.google.com/search/docs/specialty/international/localized-versions) | Leitfaden | September 2026 |
| OGP | [The Open Graph protocol](https://ogp.me/) | Leitfaden | laufend |
| GA-UTM | [Google Analytics: URL builders / campaign parameters](https://support.google.com/analytics/answer/10917952) | Leitfaden | laufend |
| G-SENDER | [Google: Email sender guidelines](https://support.google.com/a/answer/81126) | Leitfaden | laufend |
| G-SENDER-FAQ | [Google: Email sender guidelines FAQ](https://support.google.com/a/answer/14229414) | Leitfaden | laufend |
| YAHOO-SENDER | [Yahoo Sender Hub: Best Practices](https://senders.yahooinc.com/best-practices/) | Leitfaden | laufend |
| RFC8058 | [Signaling One-Click Functionality for List Email Headers](https://www.rfc-editor.org/rfc/rfc8058.html) | Standard | Januar 2017 |
| RFC7208 | [SPF](https://www.rfc-editor.org/rfc/rfc7208) | Norm (IETF) | 2014 |
| RFC6376 | [DKIM Signatures](https://www.rfc-editor.org/rfc/rfc6376) | Norm (IETF) | 2011 |
| RFC9989 | [DMARC](https://www.rfc-editor.org/rfc/rfc9989) | Norm (IETF) | Mai 2026; ersetzt RFC 7489 und 9091 |

### Anforderungen & Architektur

| Kürzel | Quelle | Typ | Stand |
|---|---|---|---|
| ISO29148 | ISO/IEC/IEEE 29148:2018, Requirements engineering (iso.org nicht abrufbar; Neuausgabe in Arbeit) | Norm | 2018 |
| ISO25010 | ISO/IEC 25010:2023, Produktqualitätsmodell — Merkmale über [quality.arc42.org](https://quality.arc42.org/) (iso.org nicht abrufbar) | Norm | 2023 |
| ISO42010 | ISO/IEC/IEEE 42010:2022, Architecture description (iso.org nicht abrufbar) | Norm | 2022 |
| IREB-CPRE | [IREB CPRE Foundation Level](https://www.ireb.org/en/cpre/foundation/), Lehrplan 3.3.0 | Leitfaden | April 2026 |
| ARC42 | [arc42 Template](https://arc42.org/download), [Dokumentation](https://docs.arc42.org/) | Leitfaden | Version 9.0, Juli 2025 |
| REQ42 | [req42 Framework](https://github.com/Hruschka/req42-framework) | Leitfaden | laufend |
| C4 | [The C4 model](https://c4model.com/) | Leitfaden | laufend |
| NYGARD11 | [Nygard: Documenting Architecture Decisions](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions) | Buch/Bericht (Blog) | November 2011 |
| BASS-SAIP | Bass, Clements, Kazman: *Software Architecture in Practice*, 4. Aufl., Addison-Wesley 2021, ISBN 9780136886099 — Quality Attribute Scenarios | Buch/Bericht | 2021 |
| CONWAY68 | [Conway: How Do Committees Invent?](https://www.melconway.com/Home/Committees_Paper.html), Datamation 1968 | Buch/Bericht (Essay) | 1968 |
| DAPPER | [Sigelman et al.: Dapper, a Large-Scale Distributed Systems Tracing Infrastructure](https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/) | Buch/Bericht (Technical Report) | 2010 |
| ACCELERATE | Forsgren, Humble, Kim: *Accelerate*, IT Revolution 2018, ISBN 9781942788331 | Buch/Bericht (umfragebasiert) | 2018 |

## Wissenschaftliche Studien

| Kürzel | Quelle | Typ | Kernbefund |
|---|---|---|---|
| NAPIRE | Méndez Fernández et al.: Naming the pain in requirements engineering, *EMSE* 2017, [doi:10.1007/s10664-016-9451-7](https://doi.org/10.1007/s10664-016-9451-7) | empirisch (228 Unternehmen) | Unvollständige/verdeckte Anforderungen, Kommunikationslücken und wandernde Ziele sind die meistgenannten Ursachen gescheiterter Projekte |
| AMELLER12 | Ameller et al.: How do software architects consider non-functional requirements, RE 2012, [doi:10.1109/re.2012.6345838](https://doi.org/10.1109/re.2012.6345838) | empirisch (13 Interviews) | Qualitätsanforderungen legt meist der Architekt allein fest, ohne gemeinsames Vokabular |
| ECKHARDT16 | Eckhardt, Vogelsang, Méndez Fernández: Are „non-functional“ requirements really non-functional?, ICSE 2016, [doi:10.1145/2884781.2884788](https://doi.org/10.1145/2884781.2884788) | empirisch (530 Anforderungen) | Qualitätsanforderungen stehen meist vage, ohne Maß und getrennt; die meisten beschreiben Verhalten |
| AHMETI24 | Ahmeti et al.: Architecture Decision Records in Practice, ECSA 2024, [doi:10.1007/978-3-031-70797-1_22](https://doi.org/10.1007/978-3-031-70797-1_22) | empirisch (Aktionsforschung, ein Unternehmen) | ADRs verbesserten Doku-Kultur und Wissenstransfer; schmale Evidenz |
| AGHAJANI19 | Aghajani et al.: Software Documentation Issues Unveiled, ICSE 2019, [doi:10.1109/ICSE.2019.00122](https://doi.org/10.1109/ICSE.2019.00122) | empirisch (878 Artefakte) | Taxonomie der Doku-Probleme, veraltete Doku darunter häufig |
| LI-EROSION22 | Li, Liang, Soliman, Avgeriou: Understanding software architecture erosion, *JSEP* 2022, [doi:10.1002/smr.2423](https://doi.org/10.1002/smr.2423) | empirisch (Mapping-Studie, 73 Studien) | Erosion hat auch nicht-technische Ursachen; industrielle Evidenz zu Gegenmaßnahmen fehlt |
| PARNAS72 | Parnas: On the criteria to be used in decomposing systems into modules, *CACM* 1972, [doi:10.1145/361598.361623](https://doi.org/10.1145/361598.361623) | konzeptionell | Module nach wahrscheinlichen Änderungen schneiden |
| COLFER16 | Colfer, Baldwin: The mirroring hypothesis, *Industrial and Corporate Change* 2016, [doi:10.1093/icc/dtw027](https://doi.org/10.1093/icc/dtw027) | empirisch (Review, 102 Studien) | Spiegelung von Organisation und Architektur in 69 % bestätigt, stark in Firmen, schwach in offenen Communities |
| LEHMAN80 | Lehman: Programs, life cycles, and laws of software evolution, *Proc. IEEE* 1980, [doi:10.1109/proc.1980.11805](https://doi.org/10.1109/proc.1980.11805) | konzeptionell (mit Beobachtungsdaten) | Genutzte Software ändert sich fortlaufend und wird ohne Gegenarbeit komplexer |
| KRUCHTEN12 | Kruchten, Nord, Ozkaya: Technical Debt, *IEEE Software* 2012, [doi:10.1109/ms.2012.167](https://doi.org/10.1109/ms.2012.167) | konzeptionell | Schulden sichtbar führen und steuern |
| SOLDANI18 | Soldani, Tamburri, van den Heuvel: The pains and gains of microservices, *JSS* 2018, [doi:10.1016/j.jss.2018.09.082](https://doi.org/10.1016/j.jss.2018.09.082) | Review grauer Literatur | Vorteile von Microservices vor allem aus Praxisberichten belegt |
| SU24 | Su, Li, Taibi: From Microservice to Monolith, *Electronics* 2024, [doi:10.3390/electronics13081452](https://doi.org/10.3390/electronics13081452) | Review (multivokal) | Rückmigrationen wegen Kosten, Komplexität, Performance, Organisation |
| LI13 | Li, Xiong, Liu, Zhang: How Does Web Service API Evolution Affect Clients?, ICWS 2013, [doi:10.1109/icws.2013.48](https://doi.org/10.1109/icws.2013.48) | empirisch (5 APIs) | Clients von Web-APIs können Altversionen oft nicht weiter nutzen |
| SOHAN15 | Sohan, Anslow, Maurer: A Case Study of Web API Evolution, IEEE SERVICES 2015, [doi:10.1109/services.2015.43](https://doi.org/10.1109/services.2015.43) | empirisch (Fallstudie) | Clients brechen an abgeschalteten Versionen und fehlender Kommunikation |
| BRITO18 | Brito et al.: Why and how Java developers break APIs, SANER 2018, [doi:10.1109/saner.2018.8330214](https://doi.org/10.1109/saner.2018.8330214) | empirisch (400 Bibliotheken) | Breaking Changes entstehen v. a. durch neue Funktionen und Vereinfachung — Bibliotheken, auf Web-APIs übertragen |
| SERBOUT24 | Serbout, Pautasso: How Are Web APIs Versioned in Practice?, *J. Web Engineering* 2024, [doi:10.13052/jwe1540-9589.2341](https://doi.org/10.13052/jwe1540-9589.2341) | empirisch (603.293 Spezifikationen) | Über 50 Versionsformate; semantische Versionen dominieren |
| GUNAWI16 | Gunawi et al.: Why Does the Cloud Stop Computing?, SoCC 2016, [doi:10.1145/2987550.2987583](https://doi.org/10.1145/2987550.2987583) | empirisch (597 Ausfälle) | Redundanz reicht nicht; unvollständige Fehlererkennung, Failover-Fehler und kaputte Sicherungen verursachen Ausfälle |
| GHOSH22 | Ghosh et al.: How to fight production incidents?, SoCC 2022, [doi:10.1145/3542929.3563482](https://doi.org/10.1145/3542929.3563482) | empirisch (Postmortems eines Cloud-Dienstes) | Prozesslücken verzögern Erkennung und Behebung |
| CHEN19 | Chen et al.: An Empirical Investigation of Incident Triage for Online Service Systems, ICSE-SEIP 2019, [doi:10.1109/icse-seip.2019.00020](https://doi.org/10.1109/icse-seip.2019.00020) | empirisch (20 Dienste) | Neuzuweisungen verlängern die Triage bis zum Zehnfachen |
| FORSGREN-CACM18 | Forsgren, Kersten: DevOps metrics, *CACM* 2018, [doi:10.1145/3159169](https://doi.org/10.1145/3159169) | konzeptionell | Umfrage- und Systemdaten ergänzen sich; falsche Daten sind der größte Fehler |
| KULA18 | Kula et al.: Do developers update their library dependencies?, *EMSE* 2018, [doi:10.1007/s10664-017-9521-5](https://doi.org/10.1007/s10664-017-9521-5) | empirisch (4.600 Projekte) | Die meisten Projekte behalten veraltete Abhängigkeiten |
| DECAN18 | Decan, Mens, Constantinou: On the impact of security vulnerabilities in the npm package dependency network, MSR 2018, [doi:10.1145/3196398.3196401](https://doi.org/10.1145/3196398.3196401) | empirisch | Schwachstellen pflanzen sich transitiv fort |
| PASHCHENKO18 | Pashchenko et al.: Vulnerable open source dependencies: counting those that matter, ESEM 2018, [doi:10.1145/3239235.3268920](https://doi.org/10.1145/3239235.3268920) | empirisch | Ein Teil der gemeldeten Befunde betrifft nicht ausgelieferte Abhängigkeiten |
| LIPP22 | Lipp, Banescu, Pretschner: An empirical study on the effectiveness of static C code analyzers, ISSTA 2022, [doi:10.1145/3533767.3534380](https://doi.org/10.1145/3533767.3534380) | empirisch (C) | Werkzeuge übersehen 47–80 % realer Schwachstellen |
| JOHNSON13 | Johnson et al.: Why don't software developers use static analysis tools to find bugs?, ICSE 2013, [doi:10.1109/icse.2013.6606613](https://doi.org/10.1109/icse.2013.6606613) | empirisch (20 Interviews) | Falsch-Positive und schlechte Darstellung verhindern Nutzung |
| SADOWSKI18 | Sadowski et al.: Lessons from building static analysis tools at Google, *CACM* 2018, [doi:10.1145/3188720](https://doi.org/10.1145/3188720) | Buch/Bericht (Industrie) | Befunde im Review-Workflow zeigen, laute Checks entfernen |
| WEICHSELBAUM16 | Weichselbaum et al.: CSP Is Dead, Long Live CSP!, CCS 2016, [doi:10.1145/2976749.2978363](https://doi.org/10.1145/2976749.2978363) | empirisch (1,68 Mio. Hosts) | Fast alle skriptbeschränkenden CSPs waren wirkungslos |
| ZHANG10 | Zhang, Monrose, Reiter: The security of modern password expiration, CCS 2010, [doi:10.1145/1866307.1866328](https://doi.org/10.1145/1866307.1866328) | empirisch | Nach Zwangswechsel ließen sich viele Passwörter schnell aus dem Vorgänger ableiten |
| LUO14 | Luo et al.: An empirical analysis of flaky tests, FSE 2014, [doi:10.1145/2635868.2635920](https://doi.org/10.1145/2635868.2635920) | empirisch (201 Fixes) | Häufigste Ursachen: asynchrones Warten, Nebenläufigkeit, Reihenfolge |
| INOZEMTSEVA14 | Inozemtseva, Holmes: Coverage is not strongly correlated with test suite effectiveness, ICSE 2014, [doi:10.1145/2568225.2568271](https://doi.org/10.1145/2568225.2568271) | empirisch | Bei kontrollierter Suite-Größe nur schwache bis mäßige Korrelation |
| JUST14 | Just et al.: Are mutants a valid substitute for real faults?, FSE 2014, [doi:10.1145/2635868.2635929](https://doi.org/10.1145/2635868.2635929) | empirisch (357 reale Fehler) | Mutantenerkennung korreliert mit Erkennung realer Fehler |
| PETROVIC21 | Petrović et al.: Does Mutation Testing Improve Testing Practices?, ICSE 2021, [doi:10.1109/icse43902.2021.00087](https://doi.org/10.1109/icse43902.2021.00087) | empirisch (Google) | Entwickler schreiben mit Mutationstests mehr und bessere Tests |
| ELDER22 | Elder et al.: Do I really need all this work to find vulnerabilities?, *EMSE* 2022, [doi:10.1007/s10664-022-10179-6](https://doi.org/10.1007/s10664-022-10179-6) | empirisch (Vergleich 4 Verfahren) | SAST fand die meisten, exploratives Pentesting die schwersten Lücken; jedes Verfahren fand eigene |
| BAU10 | Bau et al.: State of the Art: Automated Black-Box Web Application Vulnerability Testing, IEEE S&P 2010, [doi:10.1109/sp.2010.27](https://doi.org/10.1109/sp.2010.27) | empirisch (8 Scanner) | Gespeichertes XSS und SQLi von vielen Scannern nicht gefunden |
| DOUPE10 | Doupé, Cova, Vigna: Why Johnny Can’t Pentest, DIMVA 2010, [doi:10.1007/978-3-642-14215-4_7](https://doi.org/10.1007/978-3-642-14215-4_7) | empirisch (11 Scanner) | Crawling so kritisch wie Erkennung; ganze Lückenklassen übersehen |
| VOTIPKA18 | Votipka et al.: Hackers vs. Testers, IEEE S&P 2018, [doi:10.1109/sp.2018.00003](https://doi.org/10.1109/sp.2018.00003) | empirisch (Interviews, n=25) | Ähnliches Vorgehen, unterschiedliche Funde durch Erfahrung und Sicherheitswissen |
| ACIDRAIN17 | Warszawski, Bailis: ACIDRain, SIGMOD 2017, [doi:10.1145/3035918.3064037](https://doi.org/10.1145/3035918.3064037) | empirisch (12 Shop-Anwendungen) | 22 kritische Nebenläufigkeitsangriffe verifiziert |
| CHEN18 | Chen et al.: We Still Don’t Have Secure Cross-Domain Requests: an Empirical Study of CORS, USENIX Security 2018 — [USENIX](https://www.usenix.org/conference/usenixsecurity18/presentation/chen-jianjun) | empirisch | CORS lockert Cross-Origin-Zugriffe subtil und wird häufig fehlkonfiguriert |
| MIRHEIDARI20 | Mirheidari et al.: Cached and Confused: Web Cache Deception in the Wild, USENIX Security 2020 — [USENIX](https://www.usenix.org/conference/usenixsecurity20/presentation/mirheidari) | empirisch (340 Sites) | Private Daten und Tokens über Caches offengelegt; viele Sites zwei Jahre später noch verwundbar |
| LIU16 | Liu, Hao, Wang: All Your DNS Records Point to Us, CCS 2016, [doi:10.1145/2976749.2978387](https://doi.org/10.1145/2976749.2978387) | empirisch (Messung) | 467 ausnutzbare verwaiste DNS-Einträge in 277 Alexa-Top-10k-Domains und 52 edu-Zonen |
| MELI19 | Meli, McNiece, Reaves: How Bad Can It Git?, NDSS 2019, [doi:10.14722/ndss.2019.23418](https://doi.org/10.14722/ndss.2019.23418) | empirisch (Messung) | Secret-Leaks in über 100.000 Repositories, täglich Tausende neue |
| FISCHER17 | Fischer et al.: Stack Overflow Considered Harmful?, IEEE S&P 2017, [doi:10.1109/sp.2017.31](https://doi.org/10.1109/sp.2017.31) | empirisch (1,3 Mio. Android-Apps) | 15,4 % mit sicherheitsrelevanten Snippets, davon 97,9 % mit mindestens einem unsicheren |
| ACAR16 | Acar et al.: You Get Where You’re Looking for, IEEE S&P 2016, [doi:10.1109/sp.2016.25](https://doi.org/10.1109/sp.2016.25) | empirisch (Labor, n=54) | Nur-Stack-Overflow-Gruppe schrieb signifikant unsichereren Code |
| LEKIES17 | Lekies et al.: Code-Reuse Attacks for the Web (Script Gadgets), CCS 2017, [doi:10.1145/3133956.3134091](https://doi.org/10.1145/3133956.3134091) | empirisch + Angriff | Script Gadgets umgehen alle damals bekannten XSS-Mitigations |
| NIKIFORAKIS12 | Nikiforakis et al.: You Are What You Include, CCS 2012, [doi:10.1145/2382196.2382274](https://doi.org/10.1145/2382196.2382274) | empirisch (Messung) | Fremde Skripte laufen mit Rechten der einbindenden Seite; Umfang nicht verifiziert |
| FETT16 | Fett, Küsters, Schmitz: A Comprehensive Formal Security Analysis of OAuth 2.0, CCS 2016, [doi:10.1145/2976749.2978385](https://doi.org/10.1145/2976749.2978385) | formal | Neue praktisch ausnutzbare Angriffe; mit Korrekturen Sicherheit bewiesen |
| GRESHAKE23 | Greshake et al.: Not What You’ve Signed Up For (Indirect Prompt Injection), AISec 2023, [doi:10.1145/3605764.3623985](https://doi.org/10.1145/3605764.3623985) | empirisch + Taxonomie | Indirekte Prompt Injection führt zu Datendiebstahl und API-Missbrauch |
| YUAN14 | Yuan et al.: Simple Testing Can Prevent Most Critical Failures, OSDI 2014 — [USENIX](https://www.usenix.org/conference/osdi14/technical-sessions/presentation/yuan) | empirisch (198 Ausfälle) | 92 % der katastrophalen Ausfälle durch falsche Fehlerbehandlung; 58 % durch einfache Tests auffindbar |
| PARRY21 | Parry et al.: A Survey of Flaky Tests, *TOSEM* 2021, [doi:10.1145/3476105](https://doi.org/10.1145/3476105) | Survey (76 Arbeiten) | Ursachen, Kosten, Erkennung und Behebung instabiler Tests |
| GRUBER21 | Gruber et al.: An Empirical Study of Flaky Tests in Python, ICST 2021, [doi:10.1109/icst49551.2021.00026](https://doi.org/10.1109/icst49551.2021.00026) | empirisch (22.352 Projekte) | 59 % Reihenfolgeabhängigkeit; 170 Wiederholungen für 95 % Sicherheit |
| MEMON17 | Memon et al.: Taming Google-Scale Continuous Testing, ICSE-SEIP 2017, [doi:10.1109/icse-seip.2017.16](https://doi.org/10.1109/icse-seip.2017.16) | Fallstudie (Google) | Fehlschläge nahe am geänderten Code; Code vieler Autoren bricht häufiger |
| HILTON16 | Hilton et al.: Usage, Costs, and Benefits of Continuous Integration, ASE 2016, [doi:10.1145/2970276.2970358](https://doi.org/10.1145/2970276.2970358) | empirisch (34.544 Projekte, 442 Befragte) | CI geht mit häufigeren Releases einher |
| CLAESSEN00 | Claessen, Hughes: QuickCheck, ICFP 2000, [doi:10.1145/357766.351266](https://doi.org/10.1145/357766.351266) | Methode | Eigenschaften gegen zufällig erzeugte Eingaben prüfen |
| GOLDSTEIN24 | Goldstein et al.: Property-Based Testing in Practice, ICSE 2024, [doi:10.1145/3597503.3639581](https://doi.org/10.1145/3597503.3639581) | qualitativ (30 Interviews) | Stark bei komplexem Code; Aufwand für Generatoren |
| BOEHME21 | Böhme, Cadar, Roychoudhury: Fuzzing: Challenges and Reflections, *IEEE Software* 2021, [doi:10.1109/ms.2020.3016773](https://doi.org/10.1109/ms.2020.3016773) | Positionspapier | Stand und offene Probleme des Fuzzing |
| GOLMOHAMMADI23 | Golmohammadi, Zhang, Arcuri: Testing RESTful APIs: A Survey, *TOSEM* 2023, [doi:10.1145/3617175](https://doi.org/10.1145/3617175) | Survey (92 Arbeiten) | REST-Testen schwierig durch Netzwerk und externe Dienste |
| KIM22 | Kim et al.: Automated Test Generation for REST APIs: No Time to Rest Yet, ISSTA 2022, [doi:10.1145/3533767.3534401](https://doi.org/10.1145/3533767.3534401) | empirisch (10 Werkzeuge, 20 Dienste) | Vergleich von Abdeckung und Fehlerfunden automatischer Generatoren |
| BARR15 | Barr et al.: The Oracle Problem in Software Testing: A Survey, *TSE* 2015, [doi:10.1109/tse.2014.2372785](https://doi.org/10.1109/tse.2014.2372785) | Survey | Das Testorakel ist ein Engpass der Testautomatisierung |
| BASIRI16 | Basiri et al.: Chaos Engineering, *IEEE Software* 2016, [doi:10.1109/ms.2016.60](https://doi.org/10.1109/ms.2016.60) | Praxisbericht (Netflix) | Prinzipien für Zuverlässigkeitsexperimente |
| BASIRI19 | Basiri et al.: Automating Chaos Experiments in Production, ICSE-SEIP 2019, [doi:10.1109/icse-seip.2019.00012](https://doi.org/10.1109/icse-seip.2019.00012) | Erfahrungsbericht (Netflix) | Automatisierte Experimente in Produktion |
| JIANG15 | Jiang, Hassan: A Survey on Load Testing of Large-Scale Software Systems, *TSE* 2015, [doi:10.1109/tse.2015.2445340](https://doi.org/10.1109/tse.2015.2445340) | Survey | Lasttest in drei Phasen: Entwurf, Ausführung, Auswertung |
| SPADINI18 | Spadini et al.: On the Relation of Test Smells to Software Code Quality, ICSME 2018, [doi:10.1109/icsme.2018.00010](https://doi.org/10.1109/icsme.2018.00010) | empirisch (10 Systeme) | Tests mit Smells und geprüfter Code fehleranfälliger |
| BAVOTA12 | Bavota et al.: An empirical analysis of the distribution of unit test smells, ICSM 2012, [doi:10.1109/icsm.2012.6405253](https://doi.org/10.1109/icsm.2012.6405253) | empirisch + Experiment | Test Smells verbreitet, schaden der Verständlichkeit |
| ITKONEN07 | Itkonen, Mäntylä, Lassenius: Test Case Based vs. Exploratory Testing, ESEM 2007, [doi:10.1109/esem.2007.56](https://doi.org/10.1109/esem.2007.56) | Experiment (n=79) | Gleiche Effizienz, weniger falsche Fehlermeldungen bei explorativem Testen |
| ITKONEN13 | Itkonen, Mäntylä, Lassenius: The Role of the Tester’s Knowledge in Exploratory Software Testing, *TSE* 2013, [doi:10.1109/tse.2012.55](https://doi.org/10.1109/tse.2012.55) | Feldstudie | Viele Funde außerhalb des Testfokus; Domänenwissen als Orakel |

## Was die Evidenz nicht trägt

Diese verbreiteten Praktiken stehen im Katalog, weil sie sinnvoll strukturieren — aber
ohne belastbaren Wirksamkeitsnachweis. Sie werden deshalb als Vorgehen empfohlen, nicht
als belegte Ursache für Qualität dargestellt.

- **Testpyramide** — kein peer-reviewter Nachweis für ein bestimmtes Mengenverhältnis der
  Testebenen gefunden; belegt ist nur, dass nicht-deterministische Tests teuer sind [LUO14].
- **Abdeckungs-Schwellen** (etwa 80 %) — die Korrelation mit Testwirksamkeit ist
  schwach [INOZEMTSEVA14].
- **DORA-Kennzahlen als Erfolgsursache** — die Datenbasis sind Selbstauskünfte aus
  Umfragen [ACCELERATE]; ein Messrahmen, kein Kausalbeweis.
- **arc42, C4, req42, ADRs, DDD** — Praxisrahmen; für ADRs gibt es eine
  Aktionsforschungsstudie [AHMETI24], für die übrigen keine gefundene Wirksamkeitsstudie.
- **Vorteile von Microservices** — überwiegend graue Literatur, Rückmigrationen
  dokumentiert [SOLDANI18] [SU24].
- **„Header gesetzt = geschützt“** — Vorhandensein und Wirkung fallen auseinander
  [WEICHSELBAUM16].
- **Statische Analyse als Sicherheitsnachweis** — hohe Übersehensraten [LIPP22].
- **Threat Modeling** — Wirksamkeit von STRIDE nur an Studierenden gemessen, industrielle
  Evidenz nicht gefunden.
- **Conway als Gesetz** — innerhalb von Firmen gut belegt, in offenen Communities schwach
  [COLFER16].
- **Fünf Testpersonen** — gilt nur für qualitative, iterative Tests mit homogener
  Gruppe [NNG-5USERS].
