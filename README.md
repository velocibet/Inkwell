# Inkwell
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> **Privacy-first, Zero-Knowledge End-to-End Encrypted (E2EE) Note Service**

## 소개

자신 외에 누구도 알 수 없는 노트를 작성할수 있는 웹 앱입니다. 자신의 생각을 지켜보세요.

## 왜 Inkwell인가?

대부분의 노트 서비스는 데이터를 서버가 읽을 수 있습니다.

Inkwell은 다릅니다:

- 서버도 노트 내용을 알 수 없음 (Zero-Knowledge)
- 저장되는 모든 노트는 클라이언트에서 암호화됨
- 오직 사용자만 복호화 가능
  
“나만 아는 노트”를 진짜로 구현한 서비스입니다.

## 사용 방법

1. 계정 생성
2. 브라우저에서 노트 작성
3. 자동으로 암호화되어 저장
4. 로그인 시 자동 복호화

## 아키텍처

<img width="1725" height="804" alt="Screenshot From 2026-04-26 17-29-54" src="https://github.com/user-attachments/assets/99acf76b-52ec-458e-8e5b-4303c46fe15d" />

---

### Frontend
- Nuxt 4

### Backend
- NestJS
- PostgreSQL

### Storage
- Cloudflare R2

## Roadmap

Inkwell은 단순한 노트 앱이 아니라,  
**프라이버시 중심의 안전한 기록 및 공유 플랫폼**을 목표로 발전하고 있습니다.

### 완료된 기능
- End-to-End Encryption (Zero-Knowledge)
- 클라이언트 측 암호화를 통한 안전한 노트 저장
- 노트 CRUD (생성, 조회, 수정, 삭제)
- 휴지통 (Soft Delete) / 복구 / 아카이브
- 보안 공유 링크 (암호화된 데이터 + fragment 키)
- 1회 열람 후 삭제 (Burn-after-read)
- 만료 링크 (TTL)
- 비회원 노트 기능 (로그인 없이 사용 가능)
- 모바일 UI 개선


### 개발 중
- 암호화된 파일 첨부
- 이미지 지원 (보안 공유)
- 성능 최적화 (로딩 및 공유 속도 개선)
- PWA 지원 (앱처럼 설치 가능)
- 고급 공유 옵션 (비밀번호 / 열람 횟수 제한)

### 예정 기능
- 만료까지 남은 시간 표시
- 로컬 검색
- 문서 공유
- 익명 열람 로그
- 키 관리 UX 개선

### 장기 목표
- 완전한 익명 노트 모드 (추적 불가능한 구조)
- 1회성 보안 메시지 플랫폼
- 기기 간 암호화 동기화
- 데스크탑 앱 (Tauri 기반 경량 클라이언트)
- 프라이버시 중심 협업 기능 (암호화된 공동 작업 공간)

## LICENSE

이 프로젝트는 **Apache License 2.0**를 따릅니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 확인해 주세요.
