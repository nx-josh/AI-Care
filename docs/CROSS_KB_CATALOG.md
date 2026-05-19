# CROSS 레이어 KB 콘텐츠 카탈로그

**문서 상태**: v0.1 초안
**최종 수정일**: 2026-05-19
**관계 문서**: `TENANT_ONBOARDING.md` §5.5 (CROSS 레이어 관계), `KB_AUTHORING_GUIDE.md`, `PRD.md` §8.3 (RAG 2-layer)
**오너**: `cross_admin` (작성·승인), `cross_payment` / `cross_infra` (도메인 작성자)

본 문서는 **모든 tenant에 공통 적용되는 CROSS 레이어 KB의 초기 콘텐츠 목차**. 지갑·결제·온체인·계정 보안 등 CROSS 표준 운영 정책을 정리. tenant 레이어와 모순 발생 시 우선순위 룰은 Q-011-B에 따름.

---

## 0. 핵심 원칙

1. **모든 tenant에 적용** — CROSS 레이어는 단일 글로벌 인덱스.
2. **표준화 우선** — 게임별 차이는 tenant 레이어로. CROSS는 변하지 않는 공통.
3. **법적 정확도 ≥ 친근함** — 정책 문서는 법무 검토 거친 문구만.
4. **다국어 우선** — 영어 원본 + 공식 번역 20개 언어 (AI_POLICY §6.1).
5. **변경 시 사전 공지** — 모든 tenant에 영향이므로 shadow mode 권장.

---

## 1. 카테고리 구조

```
CROSS 레이어
├── 결제·환불 (Payment)
├── 지갑·자산 (Wallet)
├── 온체인·트랜잭션 (On-chain)
├── 계정·보안 (Account · Security)
├── 시스템 안내·일반 (General)
└── 안전·민감 (Safety)
```

각 카테고리당 ~10-30개 KB. 초기 출시 시 최소 셋은 다음 §2-§7.

---

## 2. 결제·환불 매뉴얼 (Payment)

| Slug | 제목 | 비고 |
|---|---|---|
| `payment-overview` | CROSS 결제 시스템 개요 | 어떤 결제 수단 지원하는지 |
| `refund-policy-cross` | CROSS 표준 환불 정책 | 24시간·미사용·정상 결제 기준. tenant가 변경 시 명시 |
| `refund-policy-cross-faq` | 환불 정책 자주 묻는 질문 | 10-15문항 |
| `payment-failed-troubleshooting` | 결제 실패 트러블슈팅 | 카드사·잔액·한도·승인 거부 케이스 |
| `payment-pending-explained` | 결제 pending 상태 안내 | 보통 24시간 내 처리 |
| `duplicate-charge-handling` | 중복 결제 처리 안내 | 본인 인증 후 결제팀 검토 |
| `chargeback-policy` | 차지백 정책 | 카드사 분쟁 발생 시 처리 |
| `refund-timeline` | 환불 처리 시간 안내 | 카드사 영업일 3-5일 |
| `payment-disputes-process` | 결제 분쟁 처리 절차 | 단계별 안내 |
| `supported-currencies` | 지원 통화 목록 | USD·EUR·KRW·JPY 등 |
| `tax-and-invoice` | 세금·영수증 안내 | 국가별 차이 |
| `subscription-cancellation` | 구독 해지 안내 | 시즌 패스 등 |
| `failed-payment-retry` | 결제 재시도 가이드 | 한도 초과·일시 거부 |

---

## 3. 지갑·자산 매뉴얼 (Wallet)

| Slug | 제목 | 비고 |
|---|---|---|
| `wallet-overview` | 지갑 개념·연결 안내 | 게임 내 지갑 vs 외부 지갑 |
| `supported-wallets` | 지원 지갑 목록 | MetaMask, Phantom, WalletConnect 등 |
| `wallet-connect-guide` | 지갑 연결 단계별 가이드 | 신규 유저용 |
| `wallet-disconnect` | 지갑 연결 해제 | 보안 우려 시 |
| `seed-phrase-safety` | 시드 구절 보안 안내 | **시드 묻지 않음 강조** |
| `seed-phrase-leaked` | 시드 노출 시 긴급 대응 | priority high, 자산 이체 안내 |
| `wallet-lost-recovery` | 지갑 분실·복구 절차 | KYC 절차 |
| `private-key-safety` | 프라이빗 키 보호 안내 | 동상 |
| `multi-wallet-management` | 다중 지갑 운영 | 1유저 N지갑 |
| `wallet-balance-mismatch` | 지갑 잔액 불일치 안내 | 동기화 lag 등 |
| `nft-storage` | NFT 보관·이전 | 지갑 간 이전 가이드 |
| `wallet-fraud-prevention` | 지갑 사기 방지 | 피싱·승인 사기 패턴 |

---

## 4. 온체인·트랜잭션 매뉴얼 (On-chain)

| Slug | 제목 | 비고 |
|---|---|---|
| `tx-overview` | 트랜잭션 개념 안내 | confirmed / pending / failed |
| `tx-pending-explained` | tx pending 상태 안내 | 네트워크 혼잡·가스비 부족 |
| `tx-failed-explained` | tx failed 상태 안내 | revert·gas·nonce 케이스 |
| `tx-not-syncing` | 인게임 동기화 지연 안내 | 보통 5분 이내, 30분 초과 시 |
| `gas-fee-explained` | 가스비 개념·설정 | 네트워크별 차이 |
| `mint-failed-troubleshooting` | 민팅 실패 트러블슈팅 | 가스·승인·한도·시간 케이스 |
| `mint-sync-delay` | 민팅 후 동기화 지연 | 정상 케이스 vs 사고 |
| `network-congestion` | 네트워크 혼잡 시 대응 | 가스 상향·재시도 |
| `nonce-error` | nonce 에러 해결 | 트랜잭션 큐 정리 |
| `tx-cancel-replace` | 트랜잭션 취소·교체 | 고급 사용자 가이드 |
| `cross-chain-bridge` | 크로스체인 브리지 안내 | 지원 브리지·수수료 |
| `tx-explorer-guide` | 익스플로러 사용법 | Etherscan 등 |

---

## 5. 계정·보안 매뉴얼 (Account · Security)

| Slug | 제목 | 비고 |
|---|---|---|
| `account-overview` | CROSS 계정 시스템 안내 | Profile Store 개념 |
| `login-methods` | 로그인 방식 안내 | Firebase / 게임 UUID / SNS 연동 |
| `forgot-password-cross` | 비밀번호 찾기 (CROSS 측 계정) | 게임 자체 비밀번호와 구분 |
| `2fa-setup` | 2단계 인증 설정 안내 | TOTP / Passkey |
| `2fa-recovery` | 2단계 인증 복구 | 백업 코드·신청 절차 |
| `account-locked` | 계정 잠김 시 대응 | 잠김 사유·해제 절차 |
| `account-hacked` | 계정 해킹 의심 시 대응 | priority high |
| `account-suspended` | 계정 정지 사유·항소 | Sentinel 연동 |
| `account-deletion` | 계정 삭제 절차 | GDPR·복구 불가 안내 |
| `connected-services` | 연동 서비스 관리 | 게임·외부 연동 |
| `device-management` | 디바이스 관리 | 활성 세션 확인·해지 |
| `email-change` | 이메일 변경 절차 | 본인 인증 필요 |

---

## 6. 시스템 안내·일반 (General)

| Slug | 제목 | 비고 |
|---|---|---|
| `cs-system-intro` | CS Agent 소개 | "AI 어시스턴트 + 사람 상담사" 안내 |
| `human-agent-availability` | 사람 상담사 응답 시간 | 24시간 SLA |
| `escalation-flow-public` | 에스컬레이션이 일어나는 경우 | 변경 액션·KB 미스·안전 |
| `multilingual-support` | 다국어 지원 안내 | 20개 언어 |
| `privacy-policy` | 개인정보 처리 방침 (요약) | 자세한 건 별도 페이지 |
| `terms-of-service` | 이용 약관 (요약) | 동상 |
| `consent-explanation` | 동의 항목 안내 | `cs_basic`·`cs_ai_training` 구분 |
| `data-deletion-request` | 데이터 삭제 요청 방법 | DPO 절차 |
| `complaint-process` | 불만 처리 절차 | 정식 절차 안내 |
| `feedback-channel` | 피드백 채널 안내 | 별도 폼·이메일 |
| `service-status` | 서비스 상태 확인 | 장애 페이지 링크 |
| `version-history` | CS Agent 자체 변경사항 | 모델·기능 변경 공지 |

---

## 7. 안전·민감 (Safety)

| Slug | 제목 | 비고 |
|---|---|---|
| `safety-self-harm` | 자해·자살 언급 시 안내 | 사전 작성된 안전 메시지, 위기 핫라인 |
| `safety-threats` | 위협·괴롭힘 받았을 때 | 신고·신변 보호 안내 |
| `safety-legal-threats` | 법적 위협 받았을 때 | 법무팀 안내 |
| `safety-crisis-hotlines` | 국가별 위기 핫라인 목록 | 다국어 |
| `safety-child-safety` | 미성년자 안전 관련 | 보호자 동의 안내 |
| `safety-report-misuse` | CS 시스템 남용 신고 | 위협 메시지 등 |

> 안전 메시지는 **AI가 즉석 생성하지 않음** (AI_POLICY §8.1). 사전 작성된 풀에서만.

---

## 8. 작성·소유 책임

| 카테고리 | 1차 작성자 | 승인자 |
|---|---|---|
| 결제·환불 | `cross_payment` 운영팀 | `cross_admin` + 법무 |
| 지갑·자산 | `cross_infra` 운영팀 | `cross_admin` + 보안팀 |
| 온체인·트랜잭션 | `cross_infra` 운영팀 | `cross_admin` |
| 계정·보안 | `cross_admin` + 보안팀 | `cross_admin` + 법무 |
| 시스템 안내·일반 | `cross_admin` | `cross_admin` |
| 안전·민감 | 보안팀 + 모더팀 + 법무 | `cross_admin` + 법무 |

---

## 9. 다국어 정책

- **모든 CROSS 레이어 KB는 영어 원본 + 공식 번역 (AI_POLICY §6.1의 20개 언어)**.
- 번역은 검증된 번역가 (자동 번역 단독 금지).
- 원본 변경 시 모든 번역본 동기화 책임 명시.
- 번역 lag 1주 이내 권장.

---

## 10. 버전·승인 cadence

### 10.1 정기 검수
- 분기 1회 전체 CROSS 레이어 KB 검토.
- 법무·보안·운영팀 협업.

### 10.2 즉시 갱신 트리거
- 법규 변경
- 보안 사고
- 결제·온체인 인프라 변경 (예: 새 체인 지원)
- 시스템 정책 변경

### 10.3 변경 절차
1. 변경 제안 → `cross_admin`에게 ticket.
2. 검토·번역 작업.
3. **shadow mode 1주** (모든 tenant 영향 대비).
4. 사전 공지 (tenant_admin 전체 발송).
5. 전환.

---

## 11. 미해결 사항

- [ ] **CKB-1** 초기 출시 시 KB 갯수 최소 임계 (예: 카테고리당 N개 이상?)
- [ ] **CKB-2** 시드 노출 시 자산 동결 자동화 가능 여부 (즉시 동결 vs 안내만)
- [ ] **CKB-3** 위기 핫라인 정보의 국가별·언어별 데이터 출처
- [ ] **CKB-4** 법무 검토 거친 정책 문구 vs 운영팀이 풀어 쓴 FAQ의 buyer-side 톤 차이
- [ ] **CKB-5** 신규 체인 지원 시 KB 작성 책임자 (운영팀? 인프라팀?)
- [ ] **CKB-6** 번역 운영 — 사내 번역팀 vs 외주 번역사 vs AI 번역 + 사람 검수
- [ ] **CKB-7** tenant 레이어와 CROSS 레이어 모순 시 우선순위 룰 (Q-011-B 확정)
- [ ] **CKB-8** 안전 메시지 풀의 형상 관리 위치 (Git? 어드민 UI?)
- [ ] **CKB-9** "결제 시스템 개요" 같은 KB가 tenant 결제 시스템과 다를 때 처리
- [ ] **CKB-10** Safety 카테고리 KB는 다른 카테고리보다 보존 정책 다른가

---

## 12. 변경 이력
| 일자 | 버전 | 변경 |
|---|---|---|
| 2026-05-19 | v0.1 | 초안 작성 (75개 KB 슬러그 정의) |
