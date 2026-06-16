---
title: Talk3D
parent: Publications
nav_order: 2
---

# Talk3D: High-Fidelity Talking Portrait Synthesis via Personalized 3D Generative Prior

![Talk3D teaser]({{ '/assets/images/talk3d_teaser.png' | relative_url }}){: .pub-teaser }

Jaehoon Ko\*, **Kyusun Cho**\*, Joungbin Lee, Heeji Yoon, Sangmin Lee, Sangjun Ahn, [Seungryong Kim](https://cvlab.korea.ac.kr/members/faculty)

*ICCV 2025 Workshop*

<p class="pub-tags"><span class="pub-tag">#3D</span> <span class="pub-tag">#talking-portrait</span> <span class="pub-tag">#NeRF</span> <span class="pub-tag">#generative-prior</span> <span class="pub-tag">#audio-driven</span></p>

## Abstract

Recent methods for audio-driven talking head synthesis often optimize neural radiance fields (NeRF) on a monocular talking portrait video, leveraging its capability to render high-fidelity and 3D-consistent novel-view frames. However, they often struggle to reconstruct complete face geometry due to the absence of comprehensive 3D information in the input monocular videos. In this paper, we introduce a novel audio-driven talking head synthesis framework, called Talk3D, that can faithfully reconstruct its plausible facial geometries by effectively adopting the pre-trained 3D-aware generative prior. Given the personalized 3D generative model, we present a novel audio-guided attention U-Net architecture that predicts the dynamic face variations in the NeRF space driven by audio. Furthermore, our model is further modulated by audio-unrelated conditioning tokens which effectively disentangle variations unrelated to audio features. Compared to existing methods, our method excels in generating realistic facial geometries even under extreme head poses. We also conduct extensive experiments showing our approach surpasses state-of-the-art benchmarks in terms of both quantitative and qualitative evaluations.

[Project Page](https://cvlab-kaist.github.io/Talk3D/){: .btn .btn-outline }
[Paper](https://arxiv.org/abs/2403.20153){: .btn .btn-outline }
[Code](https://github.com/cvlab-kaist/Talk3D){: .btn .btn-outline }
