---
title: 퇴근하구 (AfterWork)
parent: Projects
nav_order: 2
has_children: true
toc_heading: 시리즈 글
card_eyebrow: ML PoC · 5-part series
card_excerpt: 공공 평생학습 데이터 2만 7천 건을 "퇴근 동선 위의 추천"으로 바꾸는 PoC. 임베딩 제로샷 분류, 공간·의미 하이브리드 검색, 제한형 LLM 큐레이션, 홈 서버 야간 Airflow 파이프라인, 그리고 앱인토스 미니앱 클라이언트.
card_media: glyph
card_glyph: "AW"
card_tags: embeddings, pgvector, postgis, vercel-ai-sdk, airflow, apps-in-toss
---

# 퇴근하구 (AfterWork)

**퇴근하구**는 "저녁 6시 40분, 지하철 승강장에 선 직장인"을 위한 강좌 추천 서비스의 PoC다. 전국 평생학습 강좌 2만 7천여 건을 매일 밤 수집·임베딩·분류하고, 게스트가 집·회사·시간대·관심사 네 가지만 입력하면 **퇴근 동선 위에 놓인 강좌**를 지도에 띄운다.

완성된 서비스가 아니라 가설 하나를 검증하는 PoC이고, 그래서 이 시리즈의 관심사도 기능 목록이 아니라 **설계 결정의 이유**다. 어디까지가 결정론적 소프트웨어여야 하고, 어디부터 임베딩이고, 어디부터 검색이고, 어디부터 생성이어야 하는가 — 그리고 그 전부를 홈 서버 한 대와 무료 티어 예산으로 매일 밤 어떻게 돌리는가.

<p class="pub-tags"><span class="pub-tag">#embeddings</span> <span class="pub-tag">#zero-shot-classification</span> <span class="pub-tag">#pgvector</span> <span class="pub-tag">#postgis</span> <span class="pub-tag">#vercel-ai-sdk</span> <span class="pub-tag">#airflow</span> <span class="pub-tag">#ml-pipeline</span></p>
