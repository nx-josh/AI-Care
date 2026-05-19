# CS Agent — 문서 인덱스

**프로젝트**: 게임 CS Agent (CROSS Triage 확장형)
**출시 목표**: 2026년 6월 내
**관계**: `to-nexus/game-hub-plan` CROSS Triage 모듈의 확장
**문서 상태**: 기획 v0.1 + DECISIONS v0.1, 코드 미작성

---

## 1. 문서 트리

```
/
├─ PRD.md                            요구사항 정의서 (마스터)
├─ DECISIONS.md                      결정 사항 로그 (107건 중 103 결정)
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

총 13개 문서, 약 4,200+ 줄.

---

## 2. 누가 어디서부터 읽어야 하나

| 역할 | 읽기 순서 |
|---|---|
| **PM / 의사결정자** | PRD → DECISIONS → INDEX |
| **CS 운영팀 / cross_admin** | PRD → ESCALATION_PLAYBOOK (출시 시점 박스 필독) → AI_POLICY → RBAC_MATRIX |
| **Tenant 운영자 (게임사)** | PRD §0,§4,§5 → TENANT_ONBOARDING → KB_AUTHORING_GUIDE |
| **보안팀 / DPO** | PII_MASKING → COMPLIANCE → RBAC_MATRIX → ABUSE_DEFENSE |
| **법무팀** | COMPLIANCE → AI_POLICY §3,§8 → PII_MASKING §6,§8 → DECISIONS §10 (남은 4건) |
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
| **운영 모델** | **상담사 없음 / 24시간 / 글로벌 모든 언어** — cross_admin 단독 운영 |
| **채널** | SDK 위젯 (P0) + Discord (P1) + 이메일 (P2). 카카오톡·음성 제외 |
| **카테고리** | C1 계정·결제 / C2 FAQ / C3 버그 / C4 어뷰징 / C5 온체인 |
| **신원** | Firebase Sub OR Game UUID. Multi-tenant `(tenant_id, identity)` |
| **AI 권한** | 읽기 전용. 변경 액션은 사람만. 자동화 시 cap+2인 승인+audit |
| **RAG 구조** | 2-layer (Tenant + CROSS), citation 강제 |
| **데이터 보존** | 18개월 (분쟁 7년). `consent.cs_ai_training` 별도 |
| **다국어** | 자동 감지, 20개 정식 지원 + 그 외 LLM 응답만 |
| **모델** | Claude Sonnet 4.6 (답변) + Haiku 4.5 (분류) + Opus 4.7 (민감) |
| **모순 우선순위** | tenant 우선, CROSS 보안·법무·온체인은 강제 (override 불가) |
| **사람 처리 SLA** | 미보장 (상담사 없음). AI 응답 SLO만 보장 (p95 <10s) |
| **PII 분류** | 캐릭터·길드명·게임 닉네임 = 약한 PII (마스킹 X) |
| **PCI DSS / CCPA** | 적용 X (결제 위임 / 데이터 판매 안 함) |

---

## 4. 결정 보류 (CROSS Triage 본체 Q-*)

| ID | 질문 | 본 PRD 채택 |
|---|---|---|
| Q-011 | RAG 인덱스 소유권 | **2-layer 하이브리드** |
| Q-012 | AI 쓰기 권한 확대 범위 | 저위험 자동 (<$10) — 별도 명세 |
| Q-013 | 다국어 지원 범위 | tenant 자율 + 정책은 직접 번역 |
| Q-014 | AI 상시 모니터링 | 별도 명세 (M1 미도입) |
| Q-015 | Vision 통합 | 미정 (M1 이후) |

---

## 5. 미해결 사항 통합 트래킹

### 5.1 통계 (DECISIONS.md 적용 후)

| 분류 | 갯수 |
|---|---|
| 원본 OQ 총합 | **132** |
| DEV/INFRA 결정 (필터링됨) | ~25 |
| **기획자 영역** | **107** |
| → 🟢 사용자 명시 결정 | 2 |
| → 🟡 AUTO 결정 (DECISIONS.md) | 101 |
| → 🔴 OPEN (외부 인원 필수) | **4** |

### 5.2 남은 4건 (출시 전 처리 필요)

| ID | 항목 | 담당 |
|---|---|---|
| **CMP-1** | 동의 항목 약관 문구 작성 | 법무 |
| **CMP-12** | 약관 다국어 번역 | 법무 + 외주 |
| **EP-6** | 다국가 법무 통보 매핑 | 법무 |
| **OQ-2** | 일일 문의량 예상 | 출시 후 30일 데이터 |

**사용자 확정**: 4건은 나중에 별도 진행. 본 기획 사이클에서는 제외.

---

## 6. 외부 의존 모듈 체크리스트

CS Agent는 game-hub-plan의 여러 모듈에 의존. 출시 전 사실 확인 필요.

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
| **`cross_admin`** | 출시 시점 유일한 운영 인력 |

---

## 8. 변경 이력 (전체)

| 일자 | 변경 |
|---|---|
| 2026-05-19 | PRD v0.1 → v0.2 (CROSS Triage 정렬) → v0.3 (마일스톤 제거, 핵심 플로우 신설) |
| 2026-05-19 | AI_POLICY, PII_MASKING, RBAC_MATRIX, TENANT_ONBOARDING v0.1 |
| 2026-05-19 | ESCALATION_PLAYBOOK, UX_FLOWS, KB_AUTHORING_GUIDE v0.1 |
| 2026-05-19 | CROSS_KB_CATALOG, METRICS_AND_EVAL, COMPLIANCE, ABUSE_DEFENSE v0.1 |
| 2026-05-19 | INDEX.md 작성, 미해결 132건 통합 트래킹 |
| 2026-05-19 | DECISIONS.md v0.1 — 107건 중 103 결정 (사용자 위임). PRD §3·§7·§8, ESCALATION_PLAYBOOK 상단, AI_POLICY §6 갱신 (상담사 없음·다국어·캐릭터 PII 반영) |

---

## 9. 다음 단계

**기획 v0.1 종결**. DECISIONS.md 적용 완료.

남은 처리:
1. **법무 협업 4건** (CMP-1·12, EP-6, OQ-2) — 별도 트랙
2. **외부 의존 모듈 사실 확인** — CORE-001 등 6개 모듈 상태
3. **콘텐츠 작성** — CROSS 75개 KB / Eval Set / 안전 메시지 풀
4. **개발 단계 진입** — 본 기획서 기반 시스템 구축
