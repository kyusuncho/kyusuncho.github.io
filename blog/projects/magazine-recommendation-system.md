---
title: 개인화 매거진 추천 시스템
parent: Projects
nav_order: 6
card_eyebrow: PlantyNet · In development
card_excerpt: LLM facet, 지식 그래프, 다중 후보 생성과 정책 랭킹을 결합해 기사 단위 추천과 선정 근거를 제공하는 시스템 설계.
card_media: glyph
card_glyph: "REC"
card_tags: llm, neo4j, ppr, contextual-bandit
---

# 개인화 매거진 추천 시스템

{% include components/company_project_notice.html
   text="회사 프로젝트이므로 공개 가능한 범위의 목표, 시스템 구성, 제 기여와 현재 진행 상황만 정리했습니다." %}

회사에서 진행 중인 프로젝트입니다. 사전 정의 카테고리만으로는 포착하기 어려운 틈새 관심사와 잡지 간 연결을 기사 단위에서 이해하고, 추천 이유를 설명할 수 있는 구조를 설계했습니다.

## 문제와 목표

기존 카테고리 중심 추천은 같은 범주 안의 세부 관심사와 서로 다른 잡지 사이의 의미적 연결을 충분히 반영하기 어렵습니다. 이를 콘텐츠 이해, 사용자 표현, 후보 생성, 정책 랭킹의 네 계층으로 나누고 정확도·다양성·신규 콘텐츠 노출 사이의 균형을 다루는 것을 목표로 했습니다.

## 제안 아키텍처

LLM facet 태깅과 엔티티 정규화, 기사·이미지 임베딩으로 콘텐츠 지식 그래프를 구성합니다. 벡터 검색, Personalized PageRank, 커뮤니티 탐색으로 서로 다른 근거의 후보를 만든 뒤 맥락 리랭킹, 다양성 제한, contextual bandit 탐색 슬롯을 적용합니다. 추천 경로는 선정 이유 생성과 다음 추천의 피드백으로 활용합니다.

<div class="architecture-embed-wrap">
  <iframe class="architecture-embed" src="{{ '/assets/magazine-recommendation-dataflow.html?embed=1&theme=light' | relative_url }}" title="설명 가능한 개인화 매거진 추천 시스템 구조" loading="lazy"></iframe>
  <a class="architecture-expand" href="{{ '/assets/magazine-recommendation-dataflow.html?theme=light' | relative_url }}" target="_blank" rel="noopener" aria-label="전체 화면으로 다이어그램 열기" title="전체 화면으로 보기">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5"/></svg>
  </a>
</div>

## 기여와 진행 상황

- 기존 방식의 한계를 정의하고 LLM·그래프 기반 대안 아키텍처를 직접 제안했습니다.
- Neo4j 기반 기사·주제·인물·사용자 행동 관계와 PPR·커뮤니티 탐색을 포함한 서빙 구조를 설계했습니다.
- 열람 시간, 페이지 전환, 확대, 재방문 신호를 추천 경로별 가중치에 반영하고 효과를 검증하는 실험 계획을 수립했습니다.

현재 추천 API를 개발 중이며, 이 페이지는 완성된 제품 성과가 아니라 설계와 진행 상황을 설명합니다.

`LLM` · `LangGraph` · `Neo4j` · `Personalized PageRank` · `Leiden` · `Contextual Bandit`
