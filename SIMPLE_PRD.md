# CS Agent — 간단 PRD (Executive Summary)

**v0.1 초안 · 2026-05-19** · 상세 버전 → `PRD.md` · 결정 사항 → `DECISIONS.md`

---

## 한 줄 정의

**게임용 AI 고객지원 시스템**. 인게임 위젯·Discord·이메일로 유저 문의를 받아 AI가 1차 응답, 변경 액션은 사람이 처리. **Multi-tenant** (여러 게임사 운영).

---

## 왜 만드나

1. 휴먼 상담사 부담 감소
2. 24시간 글로벌 다국어 응답
3. **Web3/온체인 컨텍스트** — 기존 SaaS CS(Zendesk·Intercom·Helpshift)가 다루지 못함
4. 채널·게임 통합 가시성 (cross-tenant 프로파일)

---

## 차별축 (경쟁사와 다른 점)

- **Profile-primary** — 질문 + 통합 프로파일(신원·진행도·결제·온체인) → 답변
- **KB-primary 아님** — 일반 AI CS는 질문 → KB 매칭. 우리는 컨텍스트 우위
- **Web3 컨텍스트** — `profile.wallets[]`, `profile.onChain.mints[]` AI 인용
- **Cross-tenant 통합 프로파일** — 한 유저가 여러 게임 쓰는 경우 통합 가능

---

## 어떻게 작동하나

```
[유저 질문]
     ↓
[AI 카테고리 분류]   → 계정·결제 / FAQ / 버그 / 어뷰징 / 온체인
     ↓
[통합 프로파일 inject] (CORE-001 Profile Store)
     ↓
[2-layer RAG]   → Tenant FAQ + CROSS 표준 매뉴얼
     ↓
[citation 강제]  → 출처 없으면 응답 거부
     ↓
┌─────────────┬──────────────┐
↓             ↓              ↓
즉답          큐 적재         사람 라우팅
(자동 해결)   (대기)         (안전 민감 즉시)
```

**M1 절대 원칙**: AI는 **읽기 전용**. 환불·계정 변경·아이템 지급은 100% 사람.

---

## 누가 쓰나

| 사용자 | 무엇을 |
|---|---|
| 플레이어 | 인게임 위젯에서 문의 |
| `cross_admin` | **출시 시 유일한 운영 인력** (전 큐 처리) |
| Tenant 운영자 / CROSS 결제·INFRA·모더팀 | 향후 인력 확보 시 큐 분배 |

---

## v1 채널 (3개)

| 채널 | 우선순위 |
|---|---|
| **인게임 SDK 위젯** | P0 — 표준 |
| **Discord 봇** | P1 |
| **이메일** | P2 (비실시간) |

---

## 향후 확장 (별도 트랙)

| 채널 | 비고 |
|---|---|
| **WEB 본체** | 자사 CS 포털 (독립 surface, cross-tenant 통합 가시성) |
| **Mobile 네이티브 앱** | iOS·Android 독립 앱 (푸시·오프라인) |
| **카카오톡** | 채널 심사 별도 |

설계 시점에 향후 확장 고려 (데이터 모델·식별·RBAC).

---

## 출시 시점 운영 모델 (중요)

- **휴먼 상담사 0명** (출시 시점)
- **24시간 운영** (AI 응답)
- **글로벌 모든 언어** (Claude 응답 가능 전 언어)
- 에스컬레이션 큐 적재, **사람 처리 SLA 미보장**
- cross_admin 단독 처리. 안전 민감(자해·법적·위협)은 즉시 알람
- 향후 인력 채용 시 RBAC 정의된 큐별 역할로 분배

---

## 일정

**2026년 6월 내 출시** — 단일 스코프, 마일스톤 분할 없음.

---

## KPI / 절대 목표

**KPI** (CROSS Triage 표준)
- AI 1차 해결률 > 50%
- CSAT > 4.0 / 5.0
- 오답 보고 < 2%
- AI 응답 p95 < 10초 (SDK/Discord), < 30분 (이메일)

**절대 목표 (0건 보장)**
- 잘못된 변경 액션
- PII 마스킹 누락
- Citation 없는 사실 주장
- Tenant간 데이터 누설

---

## v1 비포함 (스코프 외)

- AI 자동 환불·계정 변경·아이템 지급 (M2+ 별도 명세)
- 음성·전화 채널 (영구 비채택)
- WEB·Mobile 본체·카카오톡 (별도 트랙)
- AI 학습용 자체 모델 학습
- AI ↔ AI 협업

---

## 의존 시스템

| 필수 | 용도 |
|---|---|
| **CORE-001 Profile Store** | Profile-primary 핵심 |
| login-sdk | 위젯 임베드·신원 토큰 |
| Hub Builder RBAC | 운영자 권한 |
| Sentinel | abuse score / appeal |
| Messaging | i18n 재사용 |
| Claude API | LLM (Sonnet 답변·Haiku 분류·Opus 민감) |
| 게임사 백엔드 API | 유저·결제·로그 read-only 조회 |
| Firebase Auth | 신원 검증 |

---

## 식별

- **Firebase Sub** OR **Game UUID**
- Multi-tenant 격리 — `(tenant_id, identity)` 쌍 강제
- 미인증 유저는 anonymous, 변경 액션 금지

---

## PII / 컴플라이언스 (요약)

- LLM 호출 전 PII 마스킹 강제 (Tier 1+2+3)
- 보존: 기본 18개월, 분쟁 7년
- `consent.cs_ai_training` 별도 동의 축
- GDPR 우선 (가장 엄격), 한국 PIPA·CCPA 매트릭스 별도

---

## 위험 톱 3

1. **AI 잘못된 정책 안내** → 시스템 프롬프트 강제 + 읽기 전용 + citation 강제
2. **프롬프트 인젝션 PII 누설** → 마스킹 + 격리 + 출력 검증
3. **tenant간 데이터 누설** → 모든 쿼리에 tenant_id 강제 + 통합 테스트

---

## 미해결

107건 중 **103건 결정 완료** (DECISIONS.md 참조). 남은 4건:
- 약관 문구·번역·다국가 법무 통보 — **법무 작성 필요**
- 일일 문의량 예상 — **출시 후 데이터**

---

**상세 사양**: `PRD.md` 참조 (16개 섹션, 509줄)
**결정 사항 전체**: `DECISIONS.md` 참조 (107건)
