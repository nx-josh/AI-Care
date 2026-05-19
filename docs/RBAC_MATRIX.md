# RBAC 매트릭스 (역할·권한 정의)

**문서 상태**: v0.1 초안
**최종 수정일**: 2026-05-19
**관계 문서**: `PRD.md` §10 (식별·인증), `PII_MASKING.md` §7 (접근 제어), `AI_POLICY.md`
**대상 검토자**: 보안팀 / DPO / CS 운영팀 / Hub Builder 팀

본 문서는 CROSS AI Care 시스템 내 **누가 무엇을 할 수 있는지**를 역할 단위로 정의한다. Hub Builder RBAC와 통합 가정.

---

## 0. 핵심 원칙

1. **최소 권한** — 역할은 본인 업무에 필요한 최소 권한만 보유.
2. **Tenant 격리** — Tenant 측 역할은 자기 game ID 데이터만. CROSS 역할만 cross-tenant 가능.
3. **읽기에도 감사** — 원본 PII 조회는 자동 감사 로그 기록.
4. **쓰기는 절차** — 변경 액션은 사람만 수행, 자동화 도입 시 2인 승인 + cap + audit.
5. **권한 변경도 감사** — 역할 부여·회수 자체가 감사 대상.
6. **직무 분리(SoD)** — KB 작성자 ≠ 승인자, 운영자 ≠ RBAC 관리자.

---

## 1. 역할 정의

### 1.1 외부 (End-user)
| 역할 | 설명 | 식별 방식 |
|---|---|---|
| `player` | 게임 유저. 본인 데이터만 | Firebase Sub / Game UUID |
| `anonymous` | 미인증 유저 (가입 전 등) | session_id |

### 1.2 Tenant 측 (게임사)
| 역할 | 설명 |
|---|---|
| `tenant_operator` | 게임사 CS 상담사. 자기 game ID 큐만 |
| `tenant_admin` | tenant 운영자 관리자. 운영자 임명·KB 승인 |

### 1.3 CROSS 측
| 역할 | 설명 |
|---|---|
| `cross_payment` | 결제·환불 에스컬레이션 큐 |
| `cross_infra` | 지갑·온체인 에스컬레이션 큐 |
| `cross_moderation` | 어뷰징·신고 모더 큐 (권한 분리) |
| `cross_general` | 일반 운영 fallback 큐 |
| `cross_admin` | 슈퍼유저 — 시스템 설정·역할 관리 |
| `security` | 보안·감사. 전체 읽기 가능, 쓰기 불가 |
| `dpo` | 법무·DPO. 데이터 삭제 요청·법적 보존 |
| `developer` | 개발팀 디버깅. 마스킹본만, 원본은 just-in-time |

---

## 2. 리소스·액션 카탈로그

### 2.1 리소스
| 리소스 | 설명 |
|---|---|
| **Ticket** | 단일 CS 티켓 (대화 헤더) |
| **Message** | 티켓 내 메시지 (유저·AI·운영자) |
| **Attachment** | 첨부 파일 (스크린샷·로그) |
| **Profile (CORE-001)** | 통합 프로파일 (조회만) |
| **Tool Call Log** | AI 툴 호출 기록 |
| **Escalation** | 에스컬레이션 엔트리 |
| **KB Doc** | RAG 인덱스 문서 (tenant / CROSS 레이어) |
| **Audit Log** | 감사 로그 |
| **System Config** | 시스템 프롬프트, 안전 메시지 풀, 모델 설정 |
| **Role Assignment** | 역할 부여 기록 |

### 2.2 액션 레벨
| 레벨 | 의미 |
|---|---|
| **view (masked)** | 마스킹된 본문 조회 |
| **view (raw)** | 원본(PII 포함) 조회 — 감사 로그 자동 기록 |
| **respond** | 유저에게 메시지 송출 (AI 초안 승인 포함) |
| **claim** | 티켓 소유권 가져오기 |
| **escalate** | 다른 큐로 넘기기 |
| **resolve/close** | 티켓 종결 |
| **approve** | AI 초안·KB·변경 액션 승인 |
| **write** | 생성·수정 |
| **delete** | 삭제 (법적 보존 의무 우선) |
| **export** | 마스킹본 내보내기 |
| **export (raw)** | 원본 내보내기 (DPO만) |

---

## 3. 권한 매트릭스

> ✓ = 허용 / ⚪ = 조건부 / ✗ = 금지
> 조건부는 §3.6 주석 참조.

### 3.1 Ticket
| 역할 | view (masked) | view (raw) | claim | respond | escalate | resolve/close |
|---|---|---|---|---|---|---|
| player | ⚪본인만 | ⚪본인만 | ✗ | ⚪본인만 | ✗ | ✗ |
| anonymous | ⚪본인 세션만 | ✗ | ✗ | ⚪본인 세션만 | ✗ | ✗ |
| tenant_operator | ⚪자기 tenant | ⚪자기 tenant | ✓ | ✓ | ✓ | ✓ |
| tenant_admin | ⚪자기 tenant | ⚪자기 tenant | ✓ | ✓ | ✓ | ✓ |
| cross_payment | ⚪결제 큐 | ⚪결제 큐 | ✓ | ✓ | ✓ | ✓ |
| cross_infra | ⚪지갑 큐 | ⚪지갑 큐 | ✓ | ✓ | ✓ | ✓ |
| cross_moderation | ⚪모더 큐 | ⚪모더 큐 + 피신고자 정보 일부 제한 | ✓ | ✓ | ✓ | ✓ |
| cross_general | ⚪fallback 큐 | ⚪fallback 큐 | ✓ | ✓ | ✓ | ✓ |
| cross_admin | ✓전체 | ✓전체 (감사) | ✓ | ✓ | ✓ | ✓ |
| security | ✓전체 | ✓전체 (감사) | ✗ | ✗ | ✗ | ✗ |
| dpo | ✓전체 | ✓전체 (감사) | ✗ | ✗ | ✗ | ⚪법적 보존 해제 시 |
| developer | ⚪디버깅 컨텍스트 | ⚪JIT 토큰 (1시간) | ✗ | ✗ | ✗ | ✗ |

### 3.2 Message (티켓 내 메시지)
| 역할 | view (masked) | view (raw) | write (운영자 발화) | edit AI draft | delete |
|---|---|---|---|---|---|
| player | ⚪본인 티켓 | ⚪본인 티켓 | ⚪본인 티켓 | ✗ | ✗ |
| tenant_operator | ⚪자기 tenant | ⚪자기 tenant | ✓ | ✓ (승인 전) | ✗ |
| tenant_admin | ⚪자기 tenant | ⚪자기 tenant | ✓ | ✓ | ⚪PII 사고 시 |
| cross_payment / infra / moderation / general | ⚪큐 범위 | ⚪큐 범위 | ✓ | ✓ | ✗ |
| cross_admin | ✓ | ✓ | ✓ | ✓ | ⚪사고 대응 |
| security | ✓ | ✓ | ✗ | ✗ | ✗ |
| dpo | ✓ | ✓ | ✗ | ✗ | ⚪삭제 요청 |
| developer | ⚪마스킹만 | ⚪JIT | ✗ | ✗ | ✗ |

### 3.3 Attachment
| 역할 | view (썸네일) | download (원본) | delete |
|---|---|---|---|
| player | ⚪본인 | ⚪본인 | ✗ |
| tenant_operator | ⚪자기 tenant | ⚪자기 tenant | ✗ |
| tenant_admin | ⚪자기 tenant | ⚪자기 tenant | ⚪PII 사고 |
| cross_* (담당 큐) | ⚪큐 범위 | ⚪큐 범위 | ✗ |
| cross_admin | ✓ | ✓ | ✓ |
| security | ✓ | ✓ | ✗ |
| dpo | ✓ | ✓ | ⚪삭제 요청 |
| developer | ⚪마스킹된 OCR만 | ✗ | ✗ |

### 3.4 KB Doc (RAG 인덱스)
| 역할 | view | write | approve/publish | delete |
|---|---|---|---|---|
| tenant_operator | ⚪자기 tenant 레이어 | ⚪초안 작성 | ✗ (직무 분리) | ✗ |
| tenant_admin | ⚪자기 tenant 레이어 | ✓ | ✓ (자기 tenant만) | ✓ (자기 tenant) |
| cross_admin | ✓ 양쪽 레이어 | ✓ CROSS 레이어 | ✓ CROSS 레이어 | ✓ |
| cross_payment / infra | ✓ 본인 도메인 | ⚪초안 (CROSS 레이어) | ✗ | ✗ |
| security | ✓ | ✗ | ✗ | ⚪PII 발견 시 |
| developer | ✓ | ✗ | ✗ | ✗ |

> **직무 분리**: 작성자가 자기 작성 문서를 승인할 수 없음. tenant_admin이 작성 시 cross_admin 검토 필요한지는 OQ-RBAC-1 결정.

### 3.5 System Config / Audit Log / Role Assignment
| 역할 | View System Config | Edit System Config | View Audit Log | Assign Role |
|---|---|---|---|---|
| cross_admin | ✓ | ⚪2인 승인 | ✓ | ⚪2인 승인 |
| security | ✓ | ✗ | ✓ | ✗ |
| dpo | ⚪PII·동의 관련만 | ✗ | ✓ | ✗ |
| tenant_admin | ⚪자기 tenant 설정만 | ⚪자기 tenant만 | ⚪자기 tenant 액션만 | ⚪tenant_operator 임명만 |
| 그 외 | ✗ | ✗ | ✗ | ✗ |

### 3.6 조건부(⚪) 주석
- **본인만 / 자기 tenant** — 데이터 자체에 `(tenant_id, identity)` 또는 `(tenant_id, ticket_owner)` 검사.
- **JIT 토큰** — Just-in-Time 임시 권한. 시간 제한(예: 1시간), 사유 기록, 만료 후 자동 회수.
- **2인 승인** — 신청자 ≠ 승인자. 둘 다 감사 로그.
- **사고 대응** — PII 누설 등 사고 발생 시 한정. cross_admin 또는 security 승인 필요.
- **법적 보존 해제** — 보존 의무 만료 또는 법무 판단 시.

---

## 4. Tenant 격리 규칙

### 4.1 기본 원칙
- 모든 쿼리·뷰는 `tenant_id` 강제 필터.
- tenant 측 역할(`tenant_*`)은 자기 game ID 외 데이터 접근 불가 — 시스템 차원에서 거부.
- cross-tenant 가시성은 **CROSS 역할의 큐 권한**에 의해서만 발생 (browse 불가, 에스컬레이션된 것만).

### 4.2 Cross-tenant 접근 조건
| 역할 | 조건 |
|---|---|
| `cross_payment` | 티켓이 결제 큐로 에스컬레이션된 경우만 |
| `cross_infra` | 지갑 큐로 에스컬레이션된 경우만 |
| `cross_moderation` | 모더 큐로 에스컬레이션된 경우만 (피신고자 정보 일부 가림) |
| `cross_general` | fallback 큐에 들어온 경우만 |
| `cross_admin` | 항상 (단 감사 로그 강제) |

### 4.3 위반 시
- 자동 차단 + 보안팀 알람 + 감사 인시던트 생성.

---

## 5. 에스컬레이션 핸드오프 권한

### 5.1 핸드오프 시 권한 이동
- 티켓이 큐 A → 큐 B로 이관되면 큐 B 담당 역할에 read·respond·resolve 권한 부여.
- 원래 담당이었던 tenant_operator는 **읽기 권한 유지** (투명성).
- 단, tenant_operator가 본 cross-tenant 정보(예: 결제팀이 추가한 메모)는 마스킹 또는 가림.

### 5.2 종결 후 알림
- cross_* 가 resolve/close 처리 → 원래 tenant_operator에게 자동 알림.
- 종결 후 tenant_operator는 읽기 가능, 추가 응답 불가.

### 5.3 충돌 시
- 동시에 여러 역할이 같은 티켓을 claim 시도 → 먼저 claim한 자에게 우선권.
- 우선권 해제는 cross_admin 또는 24시간 무응답 후 자동 해제.

---

## 6. 감사·접근 로그

### 6.1 자동 기록 대상
- 모든 **view (raw)** — 누가·언제·어떤 티켓·어떤 사유.
- 모든 **write / approve / delete** 액션.
- 모든 **export**.
- 모든 **role assignment 변경**.
- 모든 **system config 변경**.
- 모든 **JIT 토큰 발급·사용·만료**.

### 6.2 감사 로그 자체의 접근
- `security`, `dpo`, `cross_admin`만 조회 가능.
- 감사 로그 수정·삭제 불가 (append-only).
- 보존 24개월 (PII_MASKING §6).

### 6.3 알람 트리거
| 이벤트 | 대상 |
|---|---|
| tenant 격리 위반 시도 | 보안팀 즉시 |
| 24시간 내 한 사람이 raw view ≥ N건 | 보안팀 일일 |
| cross_admin 권한 변경 | 보안팀 + dpo 즉시 |
| JIT 토큰 만료 직전 미회수 | 시스템 자동 회수 + 보안팀 알림 |

---

## 7. 역할 부여·관리 워크플로

### 7.1 임명 권한
| 부여 받는 역할 | 부여 가능한 역할 | 추가 절차 |
|---|---|---|
| `tenant_operator` | `tenant_admin`, `cross_admin` | — |
| `tenant_admin` | `cross_admin` | 게임사 책임자 확인 메일 |
| `cross_payment / infra / moderation / general` | `cross_admin` | 2인 승인 |
| `cross_admin` | `cross_admin` (기존) | **2인 승인 + DPO 통보** |
| `security` | `cross_admin` | 2인 승인 |
| `dpo` | `cross_admin` | 법무 임명장 |
| `developer` | `cross_admin` 또는 `tenant_admin` | 부서장 확인 |

### 7.2 회수 절차
- 퇴사·이동 시 즉시 회수.
- 자동 회수 — 90일 동안 로그인 없으면 일시 비활성.
- 회수도 감사 로그.

### 7.3 시간제 권한 (JIT)
- `developer`의 view (raw) — 최대 1시간, 사유 기록.
- 긴급 cross_admin 권한 — 최대 4시간, 2인 승인 + 사후 보고.

### 7.4 MFA 강제
- 모든 CROSS 역할: MFA 필수.
- `tenant_admin`: MFA 필수.
- `tenant_operator`: 권장. 변경 액션 권한 부여 시 필수.

---

## 8. 특수 케이스

### 8.1 어뷰징 신고자의 본인 티켓
- 신고자가 본인의 다른 카테고리(결제 등) 티켓을 동시에 가지는 경우, 모더팀은 어뷰징 티켓만 본다 — 결제 정보 등은 가림.

### 8.2 피신고자 정보 보호
- 모더팀도 피신고자의 결제·연락처는 별도 권한 (cross_admin 승인) 없이 못 봄.
- AI 응답에도 피신고자 정보 노출 금지 (`AI_POLICY.md` §3.5).

### 8.3 데이터 삭제 요청 (GDPR/CCPA/PIPA)
- dpo만 처리. 30일 내 처리 의무.
- 분쟁 진행 중이면 법적 보존 의무 우선 → 거절 사유 회신.

### 8.4 다국가 법규 차이
- 거주 국가 기준 적용. 충돌 시 가장 엄격한 기준.
- 미성년자: 14세 미만(국내), 13세 미만(COPPA) — 보호자 동의 워크플로 별도.

### 8.5 역할 충돌 (한 사람 다중 역할)
- 시스템적으로 가장 강한 권한 결합 적용.
- 단 `cross_moderation` + `cross_payment` 동시 보유는 SoD 위반 — 금지.
- 충돌 검사는 임명 시 시스템이 자동 거부.

### 8.6 외주·임시 운영자
- 임시 계정으로 가입, 만료일 강제.
- 권한 범위 축소 (변경 액션 불가, view masked만 등).

### 8.7 AI 자체의 권한
- AI는 사용자 식별자 없는 "에이전트" 권한.
- 읽기 전용 툴(user_lookup, payment_history, kb_search, log_fetch, onchain_tx_status)만.
- 쓰기 툴은 `escalate_to_human`만 (큐에 적재).
- 향후 자동화 도입 시 cap·2인 승인·audit 강제(`AI_POLICY.md` §0).

---

## 9. 미해결 사항

- [ ] **RBAC-1** Hub Builder RBAC와의 통합 방식 — 동일 시스템 통합 vs 별도 동기화
- [ ] **RBAC-2** tenant_admin 작성 KB의 cross_admin 검토 필수 여부
- [ ] **RBAC-3** JIT 권한 신청·승인 시스템 (사람이 승인 vs 자동 룰)
- [ ] **RBAC-4** MFA 강제 범위·방식 (TOTP / Passkey / SSO)
- [ ] **RBAC-5** 외주·임시 계정의 최대 유효기간 정책
- [ ] **RBAC-6** raw view 임계(§6.3)의 N값 (예: 50건/일?)
- [ ] **RBAC-7** developer JIT 토큰 자동 발급 가능 사유 카테고리
- [ ] **RBAC-8** 피신고자 정보 cross_admin 승인 절차의 SLA
- [ ] **RBAC-9** 다국가 법규 매트릭스 (어느 국가 데이터에 어느 규제 우선)
- [ ] **RBAC-10** tenant 측 역할에 `tenant_billing` / `tenant_dev` 등 세분 필요한지

---

## 10. 변경 이력
| 일자 | 버전 | 변경 |
|---|---|---|
| 2026-05-19 | v0.1 | 초안 작성 |
