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

## LICENSE

이 프로젝트는 **Apache License 2.0**를 따릅니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 확인해 주세요.
