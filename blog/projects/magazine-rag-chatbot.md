---
title: 멀티 에이전트 매거진 RAG 챗봇
parent: Projects
nav_order: 5
card_eyebrow: PlantyNet · 2025–2026
card_excerpt: 질의 의도를 분류해 기사 QA와 매거진 추천 에이전트를 조율하고, 검색 품질과 운영 지표를 계층별로 관측한 RAG 시스템.
card_media: glyph
card_glyph: "RAG"
card_tags: langgraph, milvus, ragas, observability
---

# 멀티 에이전트 매거진 RAG 챗봇

{% include components/company_project_notice.html
   text="회사 프로젝트이므로 공개 가능한 범위의 목표, 시스템 구성, 기여와 성과만 정리했다." %}

회사에서 수행한 프로젝트다. 1,400여 종의 매거진 아카이브를 대상으로 기사 질문에는 근거 기반 답변을, 탐색 의도에는 매거진 추천을 제공하는 멀티 에이전트 RAG 시스템을 개발했다.

## 문제와 목표

서로 다른 의도를 단일 에이전트가 처리하면 검색 방식과 평가 기준이 뒤섞인다. 이를 질의 분류, 기사 QA, 매거진 추천으로 분리하고, 라우팅부터 생성까지 각 계층의 품질과 지연을 독립적으로 확인할 수 있도록 설계했다.

## 시스템 흐름

질의 하나가 통과하는 경로는 다음과 같다.

- **안전 계층 — NeMo Guardrails.** 모든 질의는 오케스트레이터에 도달하기 전에 입력 레일을 통과한다. 차단 대상 질의에 라우팅과 검색을 수행할 이유가 없으므로, 조기 차단은 안전 요건인 동시에 추론 자원 보호 수단이다. 생성된 답변도 출력 레일로 재검사한다.
- **라우팅 — LangGraph 오케스트레이터.** 질의 의도를 `qa` / `recommend` / `chitchat`으로 판정해 전문 에이전트에 위임한다. 오케스트레이터는 답변을 생성하지 않고 판정만 담당하며, 인사·잡담은 단순 응답 에이전트가 검색 없이 즉답한다.
- **기사 QA 에이전트 — 기사 검색 도구 호출.** 도구는 bge-m3 Dense 벡터와 한국어 형태소 BM25를 결합한 Milvus 하이브리드 검색을 수행하고, 리랭킹과 인접 청크 확장으로 끊기지 않는 근거 컨텍스트를 복원한다.
- **매거진 추천 에이전트 — 매거진 추천 도구 호출.** 기사 검색과 추천은 검색 단위가 다르다. 도구는 질의를 카테고리로 의미 분류한 뒤 Milvus 그룹 검색(`magazine_id` 기준 `group_by`)으로 매거진 단위 후보를 묶고, 임계 조건을 통과한 상위 매거진을 선별한다.
- **저장소 — Milvus + PostgreSQL.** Milvus가 임베딩 검색과 그룹 검색을, PostgreSQL이 발행일·카테고리 필터와 매거진 메타데이터를 담당한다. 두 도구 모두 두 저장소를 함께 사용한다.
- **응답 구성.** 도구가 반환한 구조화된 검색·추천 결과를 받아 각 에이전트가 근거 기반 답변을 구성한다. 근거 기사는 답변과 함께 노출된다.
- **평가와 관측.** RAGAS 골든셋 회귀 평가로 검색·생성 품질을 배포 전에 검증하고, Prometheus·Grafana로 vLLM·Milvus·API 전 계층 메트릭을 상시 관측한다. 요청 단위 LLM 트레이싱으로 계층별 원인 분석을 지원한다.

<div class="architecture-embed-wrap">
  <iframe class="architecture-embed" src="{{ '/assets/magazine-rag-dataflow-editorial.html?embed=1' | relative_url }}" title="멀티 에이전트 매거진 RAG 시스템 흐름" loading="lazy"></iframe>
  <a class="architecture-expand" href="{{ '/assets/magazine-rag-dataflow-editorial.html' | relative_url }}" target="_blank" rel="noopener" aria-label="전체 화면으로 다이어그램 열기" title="전체 화면으로 보기">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5"></path></svg>
  </a>
</div>

## 기여와 결과

- 단일 에이전트를 전문 에이전트 구조로 확장해 라우팅 정확도를 22% 향상했다.
- 배포 전 회귀 검증에 걸리던 시간을 2–3일에서 30분으로 단축했다.
- 추천 검색 지연을 한 자릿수 ms 수준으로 낮추고 처리량, TTFT, 오류율과 에이전트별 지연 시간을 상시 관측했다.

`LangGraph` · `Milvus` · `RAGAS` · `NeMo Guardrails` · `Arize Phoenix` · `Prometheus` · `Grafana` · `vLLM`
