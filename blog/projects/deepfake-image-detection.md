---
title: 온디바이스 딥페이크 이미지 탐지
parent: Projects
nav_order: 3
card_eyebrow: PlantyNet · 2025–Present
card_excerpt: 대규모 얼굴 이미지 학습부터 모델 경량화, Android 실시간 추론, 재현 가능한 연구 환경까지 연결한 온디바이스 탐지 프로젝트.
card_media: glyph
card_glyph: "DF"
card_tags: pytorch, litert, android, mlops
---

# 온디바이스 딥페이크 이미지 탐지

{% include components/company_project_notice.html %}

회사에서 수행한 프로젝트입니다. 경량 비전 모델을 Android 앱에 탑재해 얼굴 이미지의 딥페이크 여부를 기기 안에서 실시간으로 판별하는 것을 목표로 했습니다.

## 문제와 목표

2025년에는 데이터 수집부터 학습, TFLite 변환과 앱 탑재까지 초기 제품화를 진행했습니다. 2026년에는 데이터 변경 이력과 실험 조건을 추적하기 어려웠던 연구 환경을 재설계해, 대규모 데이터에서도 반복 가능한 실험과 온디바이스 검증이 가능하도록 고도화했습니다.

## 시스템 흐름

10M여 장의 실제·합성 얼굴 이미지와 한국인 얼굴 서브셋을 버전 관리하고, Ray 기반 분산 전처리와 Lightning·Hydra·W&B 기반 학습 환경을 구성했습니다. 학습 모델은 PyTorch와 LiteRT 사이의 예측 정합성을 확인한 뒤 Android 환경에서 자동 평가했습니다.

<div class="architecture-embed-wrap">
  <iframe class="architecture-embed" src="{{ '/assets/deepfake-image-dataflow.html?embed=1&theme=light' | relative_url }}" title="온디바이스 딥페이크 이미지 탐지 시스템 흐름" loading="lazy"></iframe>
  <a class="architecture-expand" href="{{ '/assets/deepfake-image-dataflow.html?theme=light' | relative_url }}" target="_blank" rel="noopener" aria-label="전체 화면으로 다이어그램 열기" title="전체 화면으로 보기">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5"/></svg>
  </a>
</div>

## 기여와 결과

- 테스트 AUC를 64.1%에서 85.6%로, 한국인 서브셋 정확도를 54.7%에서 88.4%로 개선했습니다.
- 실험 소요 시간을 약 3일에서 8시간으로 줄이고 GPU 사용량을 41% 절감했습니다.
- Ray·DVC·Lightning·Hydra·W&B를 결합해 데이터, 설정, 실행 결과를 함께 추적하는 연구 환경을 제안하고 구축했습니다.

`PyTorch` · `Lightning` · `Ray Data` · `DVC` · `Hydra` · `W&B` · `LiteRT` · `Kotlin`
