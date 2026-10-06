---
title: 매거진 콘텐츠 요약·가공 시스템
parent: Projects
nav_order: 4
card_eyebrow: PlantyNet · 2025–2026
card_excerpt: OCR 교정, 요약·번역, 분류와 웹뷰 콘텐츠 생성을 연결하고 경험 기반 개선과 DAG 자동화를 적용한 Agentic AI 파이프라인.
card_media: glyph
card_glyph: "AI"
card_tags: langgraph, dagster, llmops, vllm
---

# 매거진 콘텐츠 요약·가공 시스템

{% include components/company_project_notice.html %}

회사에서 수행한 프로젝트입니다. 매거진 아카이브와 신규 발행호의 OCR 교정, 다국어 요약·번역, 키워드 분류, 발행호 초록과 웹뷰 콘텐츠 생성을 하나의 자동화 파이프라인으로 연결했습니다.

## 문제와 목표

기사마다 장르와 구조가 달라 고정된 프롬프트만으로는 품질 편차와 반복 실패를 줄이기 어려웠습니다. 또한 신규 발행호가 들어올 때마다 여러 처리 단계를 수작업으로 연결해야 했습니다. 목표는 콘텐츠 특성에 맞는 전략을 선택하면서도 입고부터 발행까지 자동으로 실행되는 운영 흐름을 만드는 것이었습니다.

## 시스템 흐름

LangChain·LangGraph로 콘텐츠 가공 워크플로를 구성하고, Langfuse에서 프롬프트 버전과 실행 결과를 추적했습니다. 실패 패턴을 구조화해 다음 처리에 재사용하는 경험 기반 개선 방식을 적용하고, Dagster 센서·동적 파티션·자산 그래프로 신규 발행호의 가공 DAG를 자동 실행했습니다.

모든 LLM 호출은 입력·프롬프트 버전·모델 버전의 해시를 키로 하는 내용 주소화 산출물 캐시를 경유합니다. 길이별 요약이 공유하는 map 단계의 중복 실행과 발행호 초록 생성 시의 전면 재요약을 이 구조로 제거했고, 프롬프트 버전 하나가 캐시 키·자산 staleness·트레이스 귀속을 동시에 결정하므로 프롬프트를 수정하면 영향받는 산출물만 자동으로 재처리 대상이 됩니다.

<div class="architecture-embed-wrap">
  <iframe class="architecture-embed" src="{{ '/assets/magazine-summary-dataflow.html?embed=1&theme=light' | relative_url }}" title="매거진 콘텐츠 가공 자동화 파이프라인" loading="lazy"></iframe>
  <a class="architecture-expand" href="{{ '/assets/magazine-summary-dataflow.html?theme=light' | relative_url }}" target="_blank" rel="noopener" aria-label="전체 화면으로 다이어그램 열기" title="전체 화면으로 보기">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5"/></svg>
  </a>
</div>

## 기여와 결과

- 웹뷰 콘텐츠 가공 성공률을 78.2%에서 94.3%로 높였습니다.
- 발행호당 평균 LLM 호출을 681회에서 341회로 줄이고 프리필 토큰을 44.9% 절감했습니다.
- 처리 시간을 5분 41초에서 1분 25초로 단축하고 처리량을 4.6배 높였습니다.
- 40년치 아카이브의 소진 예상 기간을 5.4년에서 10개월로 단축했습니다.
- 프롬프트 레지스트리 도입으로 수정 반영 리드타임을 2~3일에서 5분 이내로 줄이고, 프롬프트 변경 시 재처리량을 74.6% 절감했습니다.
- 실패 지점을 트레이스 span 단위로 추적해 장애 원인 특정을 평균 2시간에서 5분 이내로 줄이고, 모델 전환으로 인한 일 24분의 중단 시간을 제거했습니다.
- 신규 기사 입고부터 콘텐츠 가공까지 반복 수작업을 제거했습니다.

`LangChain` · `LangGraph` · `Langfuse` · `vLLM` · `Dagster` · `PostgreSQL` · `Docker`
