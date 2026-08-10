---
title: GaussianTalker
parent: Publications
nav_order: 1
card_title: "GaussianTalker: Real-Time High-Fidelity Talking Head Synthesis with Audio-Driven 3D Gaussian Splatting"
card_eyebrow: ACM Multimedia 2024
card_excerpt: Encodes 3D Gaussian attributes into a shared implicit feature that speech audio can steer, rendering pose-controllable talking heads at up to 120 FPS.
card_image: /assets/images/GaussianTalker.png
card_alt: GaussianTalker teaser
card_tags: 3D, gaussian-splatting, talking-head, real-time
---

# GaussianTalker: Real-Time High-Fidelity Talking Head Synthesis with Audio-Driven 3D Gaussian Splatting

![GaussianTalker teaser]({{ '/assets/images/GaussianTalker.png' | relative_url }}){: .pub-teaser }

**Kyusun Cho**\*, Joungbin Lee\*, Heeji Yoon\*, Yeobin Hong, Jaehoon Ko, Sangjun Ahn, [Seungryong Kim](https://cvlab.kaist.ac.kr/members/faculty)

*ACM Multimedia 2024*

<p class="pub-tags"><span class="pub-tag">#3D</span> <span class="pub-tag">#gaussian-splatting</span> <span class="pub-tag">#talking-head</span> <span class="pub-tag">#audio-driven</span> <span class="pub-tag">#real-time</span></p>

## Abstract

We propose GaussianTalker, a novel framework for real-time generation of pose-controllable talking heads. It leverages the fast rendering capabilities of 3D Gaussian Splatting (3DGS) while addressing the challenges of directly controlling 3DGS with speech audio. GaussianTalker constructs a canonical 3DGS representation of the head and deforms it in sync with the audio. A key insight is to encode the 3D Gaussian attributes into a shared implicit feature representation, where it is merged with audio features to manipulate each Gaussian attribute. This design exploits the spatial-aware features and enforces interactions between neighboring points. The feature embeddings are then fed to a spatial-audio attention module, which predicts frame-wise offsets for the attributes of each Gaussian. It is more stable than previous concatenation or multiplication approaches for manipulating the numerous Gaussians and their intricate parameters. Experimental results showcase GaussianTalker's superiority in facial fidelity, lip synchronization accuracy, and rendering speed compared to previous methods. Specifically, GaussianTalker achieves a remarkable rendering speed up to 120 FPS, surpassing previous benchmarks.

[Project Page](https://cvlab-kaist.github.io/GaussianTalker/){: .btn .btn-outline }
[Paper](https://arxiv.org/abs/2404.16012v2){: .btn .btn-outline }
[Code](https://github.com/cvlab-kaist/GaussianTalker){: .btn .btn-outline }
