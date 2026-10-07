---
title: RV Badminton 개발 일지
parent: Journal
nav_order: 1
has_children: true
toc_heading: 시리즈 글
card_title: RV Badminton 개발 일지
card_eyebrow: Journal · 3 chapters
card_excerpt: 단톡방 정산에서 4개 서비스 플랫폼까지 — 포인트 계산 엔진을 떼어낸 이유, 부분 재연 구조, 그리고 규칙 개편을 구현하며 바뀐 것들.
card_media: device
card_image: /assets/images/posts/rv-badminton/match-recording.webp
card_alt: RV Badminton 매치 기록 화면
card_tags: spring-boot, flutter, fastapi, duckdb, system-design
---

# RV Badminton 개발 일지

RV Badminton은 실제 배드민턴 클럽을 위해 만든 운영 플랫폼입니다. 회원은 Flutter 앱으로 매치를 기록하고, 리더보드와 개인 기록을 확인하며, 커뮤니티를 이용합니다. Spring Boot 백엔드와 Python 기반 레이팅 엔진이 이를 뒷받침합니다.

단톡방과 수작업 점수 정산에서 출발한 프로젝트가 어떻게 네 개의 서비스로 구성된 운영 시스템이 되었는지, 그리고 그 과정에서 내린 설계 결정을 기록합니다.

문제·해결·결과를 한 장으로 요약한 포트폴리오는 [RV Badminton App]({% link projects/rv-badminton-app.md %})에 있습니다.

<p class="pub-tags"><span class="pub-tag">#spring-boot</span> <span class="pub-tag">#flutter</span> <span class="pub-tag">#fastapi</span> <span class="pub-tag">#system-design</span></p>
