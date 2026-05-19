# CS Agent — 문서 인덱스

**프로젝트**: 게임 CS Agent (CROSS Triage 확장형)
**출시 목표**: 2026년 6월 내
**관계**: `to-nexus/game-hub-plan` CROSS Triage 모듈의 확장
**문서 상태**: 기획 단계, 코드 미작성

---

## 1. 문서 트리

```
/
├─ PRD.md                            요구사항 정의서 (마스터)
├─ INDEX.md                          본 문서 — 인덱스·통합 트래킹
└─ docs/
   ├─ AI_POLICY.md                   AI 응답 정책 (톤·거부 규칙·다국어·모델)
   ├─ PII_MASKING.md                 PII 마스킹 정책·다층 방어·보존
   ├─ RBAC_MATRIX.md                 역할·권한 매트릭스
   ├─ TENANT_ONBOARDING.md           Tenant 온보딩·KB 학습 플로우
   ├─ ESCALATION_PLAYBOOK.md         큐별 운영 매뉴얼·Cookbook
   ├─ UX_FLOWS.md                    화면·UX 플로우 (위젯·Console·KB 도구)
   ├─ KB_AUTHORING_GUIDE.md          KB 작성 가이드·예시·Anti-patterns
   ├─ CROSS_KB_CATALOG.md            CROSS 레이어 KB 콘텐츠 목차 (75개 slug)
   ├─ METRICS_AND_EVAL.md            대시보드·알람·AI Eval Set
   ├─ COMPLIANCE.md                  Consent·삭제 요청·다국가 규제
   └─ ABUSE_DEFENSE.md               봇·스팸·시스템 남용 방어
```

총 12개 문서, 약 3,800줄.

---

## 2. 누가 어디서부터 읽어야 하나

| 역할 | 읽기 순서 |
|---|---|
| **PM / 의사결정자** | PRD → INDEX (본 문서, 미해결 사항 §6) |
| **CS 운영팀 / cross_*** | PRD → ESCALATION_PLAYBOOK → AI_POLICY → RBAC_MATRIX |
| **Tenant 운영자 (게임사)** | PRD §0,§4,§5 → TENANT_ONBOARDING → KB_AUTHORING_GUIDE |
| **보안팀 / DPO** | PII_MASKING → COMPLIANCE → RBAC_MATRIX → ABUSE_DEFENSE |
| **법무팀** | COMPLIANCE → AI_POLICY §3,§8 → PII_MASKING §6,§8 |
| **데이터·분석팀** | METRICS_AND_EVAL → PRD §7 |
| **디자이너** | UX_FLOWS → PRD §6 |
| **게임 개발자 (통합 담당)** | UX_FLOWS §5 → PRD §10 식별·인증 |

---

## 3. 결정된 핵심 사실

| 항목 | 결정 |
|---|---|
| **테제** | Profile-primary (KB-primary 아님). CORE-001 통합 프로파일이 AI 컨텍스트 |
| **차별축** | Web3/온체인 + cross-tenant 통합 프로파일 |
| **출시 시점** | 2026년 6월 내 — 단일 출시 스코프, 마일스톤 분할 없음 |
| **채널** | SDK 위젯 (P0) + Discord (P1) + 이메일 (P2). 카카오톡·음성 제외 |
| **카테고리** | C1 계정·결제 / C2 FAQ / C3 버그 / C4 어뷰징 / C5 온체인 |
| **신원** | Firebase Sub OR Game UUID. Multi-tenant `(tenant_id, identity)` |
| **AI 권한** | 읽기 전용. 변경 액션은 사람만. 자동화 시 cap+2인 승인+audit |
| **RAG 구조** | 2-layer (Tenant + CROSS), citation 강제 |
| **데이터 보존** | 18개월 (분쟁 7년). `consent.cs_ai_training` 별도 |
| **다국어** | 자동 감지, 20개 언어 지원 |
| **모델** | Claude Sonnet 4.6 (답변) + Haiku 4.5 (분류) + Opus 4.7 (민감) |
| **에스컬레이션 라우팅** | 5단계 우선순위 (사람→결제→INFRA→tenant→fallback) |

---

## 4. 결정 보류 (CROSS Triage 본체 Q-*)

| ID | 질문 | 본 PRD 채택 |
|---|---|---|
| Q-011 | RAG 인덱스 소유권 | **2-layer 하이브리드** |
| Q-012 | AI 쓰기 권한 확대 범위 | 저위험 자동 (<$10) — 별도 명세 |
| Q-013 | 다국어 지원 범위 | 미정 (Messaging i18n 재사용 vs 자체) |
| Q-014 | AI 상시 모니터링 | 별도 명세 (TRIAGE-006 hook) |
| Q-015 | Vision 통합 | 미정 |

---

## 5. 미해결 사항 통합 트래킹 (132개)

문서별 OQ 갯수.

| 문서 | Prefix | 갯수 |
|---|---|---|
| PRD (출시 전 결정·운영) | `OQ-` | 16 |
| TENANT_ONBOARDING | `ONB-` | 15 |
| COMPLIANCE | `CMP-` | 12 |
| UX_FLOWS | `UX-` | 12 |
| ABUSE_DEFENSE | `ABD-` | 11 |
| METRICS_AND_EVAL | `MEV-` | 10 |
| ESCALATION_PLAYBOOK | `EP-` | 10 |
| RBAC_MATRIX | `RBAC-` | 10 |
| CROSS_KB_CATALOG | `CKB-` | 10 |
| KB_AUTHORING_GUIDE | `KB-` | 9 |
| PII_MASKING | `PII-` | 9 |
| AI_POLICY | `AIP-` | 8 |

### 5.1 ☆ 가장 시급한 결정 (출시 전 필수)

#### 외부 의존성 사실 확인
- [ ] **CORE-001 Profile Store** 6월 사용 가능 여부 + 어떤 필드 제공
- [ ] **위젯 통합 대상 게임** 정해졌는가, 해당 게임 클라이언트 통합 일정
- [ ] **Hub Console** 위치 — Hub Builder 위에 얹기 vs 별도
- [ ] **게임사 백엔드 read-only API** 스펙·인증 방식 (OQ-1)
- [ ] **Sentinel·Hub Builder RBAC** 6월 사용 가능 상태

#### 콘텐츠 준비 가능성
- [ ] **CROSS 레이어 초기 KB 75개** 작성 책임자·완성 시기 (CROSS_KB_CATALOG)
- [ ] **Tenant 측 KB 작성** — 어떤 게임이 6월까지 P0 자료 완성 가능?
- [ ] **다국어 번역** — 20개 언어 누가·언제·어떻게 (Q-013)

#### 정책·법무
- [ ] **약관·동의서 문구** 법무 작성 (CMP-1)
- [ ] **거주 국가 판정 룰** (CMP-6)
- [ ] **사고 통보 SLA·책임자** (CMP-7)
- [ ] **데이터 삭제 요청 워크플로** 실제 운영 (COMPLIANCE §3)

#### 운영 준비
- [ ] **상담사 인원·운영시간·언어** (OQ-3)
- [ ] **이메일 인프라** 선정 (OQ-6)
- [ ] **개발팀 이슈트래커** 연동 채널 (OQ-7)
- [ ] **Discord 봇 권한·매핑** (OQ-8)
- [ ] **모더팀 권한 분리·SoP** (RBAC + ESCALATION_PLAYBOOK)

#### 메트릭·임계
- [ ] **자동 해결률·CSAT 목표 수치** (OQ-5)
- [ ] **일일 문의량·동시 활성 티켓 예상** (OQ-2)
- [ ] **AI confidence 임계** (AIP-3)
- [ ] **Rate limit 수치** (ABD-1)

---

## 6. 외부 의존 모듈 체크리스트

CS Agent는 game-hub-plan의 여러 모듈에 의존. 출시 전에 각 모듈 상태 확인 필요.

| 의존 모듈 | 용도 | 6월 사용 가능? |
|---|---|---|
| **CORE-001 Profile Store** | Profile-primary 핵심 컨텍스트 | ❓ 확인 필요 |
| **login-sdk** | 위젯 embed + 신원 토큰 | ❓ |
| **Messaging (MSG)** | i18n 인프라 재사용 후보 | ❓ |
| **Sentinel** | abuse score, SENTINEL-003 appeal | ❓ |
| **Hub Builder RBAC** | 운영자 권한 통합 | ❓ |
| **web-shop** | 결제 분쟁 조회 (자동화 시) | M2+ 가능 시 |

이 6개 중 **CORE-001은 필수**. 없으면 Profile-primary 자체가 성립 안 함 → 대체 데이터 소스 정의 필요.

---

## 7. 용어집 (Glossary)

| 용어 | 정의 |
|---|---|
| **Profile-primary** | 질문 + 통합 프로파일 → 답변. KB-primary 대비 컨텍스트 우위 |
| **CORE-001** | game-hub-plan의 Profile Store 모듈 spec ID |
| **TRIAGE-XXX** | CROSS Triage 본체 spec ID (001~006) |
| **Tenant** | CS Agent를 사용하는 게임사 단위 (game_id 격리) |
| **CROSS 레이어** | 모든 tenant 공통 KB (지갑·결제·온체인 등) |
| **Tenant 레이어** | tenant 자체 KB (게임별 FAQ·정책) |
| **citation 강제** | AI 응답에 출처 부착 없으면 거부 |
| **Hub Console** | tenant·CROSS 운영자가 사용하는 웹 대시보드 |
| **Hub Builder RBAC** | game-hub-plan의 권한 관리 모듈 |
| **SoD** | Separation of Duties (작성자 ≠ 승인자) |
| **JIT 토큰** | Just-in-Time 임시 권한 (시간 제한) |
| **Sentinel** | game-hub-plan의 어뷰징·평판 모듈 |
| **SENTINEL-003** | Sentinel appeal ticket — 모더 큐로 통합 |
| **`consent.cs_basic`** | CS 처리 필수 동의 |
| **`consent.cs_ai_training`** | AI 학습 활용 선택 동의 |
| **Eval Set** | AI 응답 품질 회귀 테스트 표준 문항 |

---

## 8. 변경 이력 (전체 문서)

| 일자 | 변경 |
|---|---|
| 2026-05-19 | PRD v0.1 → v0.2 (CROSS Triage 정렬) → v0.3 (마일스톤 제거, 핵심 플로우 신설) |
| 2026-05-19 | AI_POLICY v0.1, PII_MASKING v0.1 작성 |
| 2026-05-19 | RBAC_MATRIX v0.1 작성 |
| 2026-05-19 | TENANT_ONBOARDING v0.1 작성 |
| 2026-05-19 | ESCALATION_PLAYBOOK, UX_FLOWS, KB_AUTHORING_GUIDE v0.1 작성 |
| 2026-05-19 | CROSS_KB_CATALOG, METRICS_AND_EVAL, COMPLIANCE, ABUSE_DEFENSE v0.1 작성 |
| 2026-05-19 | INDEX.md 작성, 미해결 132건 통합 트래킹 |

---

## 9. 다음 단계

PRD·부속 문서 검토 → 미해결 사항 결정 회의 → 결정 완료된 항목 v0.2 반영 → 기능 명세서 단계(개발 가능 수준 상세화) 진행.

**현재 단계**: 기획 v0.1 완료. 외부 의존 모듈 사실 확인 + ☆ 시급 결정 항목 회의가 다음 게이트.
