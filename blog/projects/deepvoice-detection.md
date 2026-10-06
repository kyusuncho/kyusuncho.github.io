---
title: 화자 조건부 딥보이스 탐지
parent: Projects
nav_order: 7
card_eyebrow: PlantyNet · R&D in progress
card_excerpt: 범용 합성음 판별을 등록 연락처별 음성·음소·운율·행동 특성과 결합하는 개인화 온디바이스 이상 탐지 연구.
card_media: glyph
card_glyph: "DV"
card_tags: audio, anomaly-detection, on-device, mlops
---

# 화자 조건부 딥보이스 탐지

{% include components/company_project_notice.html
   text="회사 R&D이므로 공개 가능한 문제 정의, 목표 구조, 실험 계획만 정리했습니다." %}

회사에서 진행 중인 연구입니다. 통화 환경의 AI 음성 사칭 위험을 범용 real/fake 분류만으로 판단하지 않고, 등록 연락처별 특성과 결합하는 화자 조건부 이상 탐지 문제로 재정의했습니다.

## 문제와 목표

범용 합성음 분류기는 통화 코덱과 잡음, 학습에서 보지 못한 생성기에 따라 일반화 성능이 달라질 수 있습니다. 목표는 공통 경량 인코더의 합성음 단서에 화자별 음성·음소·운율 프로파일과 대화 행동 신호를 더해 개인화 신호의 증분 효과를 검증하는 것입니다.

## 연구 설계

SpeechFake 한국어, ZH-Famous, PVP 프로토콜과 generator·codec holdout 평가 매트릭스를 구성했습니다. Lightning·Hydra·W&B 환경에서 AASIST-L과 Tiny TDNN·TCN을 비교하고, 이후 QAT와 TFLite 변환을 통해 온디바이스 적용 가능성을 확인할 계획입니다.

## 기여와 진행 상황

- 제품 문제를 화자 조건부 이상 탐지로 재정의하고 목표 아키텍처와 비교 실험을 설계했습니다.
- 범용 점수, 화자·음소별 통계, 운율·행동 특징과 기존 ASR 보이스피싱 점수의 융합 구조를 설계했습니다.
- 현재 베이스라인과 재현성 파이프라인을 구축하고 있으며, 성능 수치는 연구 검증 이후 공개할 예정입니다.

`Lightning` · `Hydra` · `W&B` · `AASIST-L` · `TDNN` · `TCN` · `ASR`
