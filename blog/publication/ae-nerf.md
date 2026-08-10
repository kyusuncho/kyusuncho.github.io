---
title: AE-NeRF
parent: Publications
nav_order: 4
card_title: "AE-NeRF: Auto-Encoding Neural Radiance Fields for 3D-Aware Object Manipulation"
card_eyebrow: arXiv 2023
card_excerpt: An auto-encoder that disentangles shape, appearance, and camera pose from a single image, then renders them back through a generative NeRF.
card_image: /assets/images/ae-nerf.png
card_alt: AE-NeRF teaser
card_tags: 3D, NeRF, auto-encoder, disentanglement
---

# AE-NeRF: Auto-Encoding Neural Radiance Fields for 3D-Aware Object Manipulation

![AE-NeRF teaser]({{ '/assets/images/ae-nerf.png' | relative_url }}){: .pub-teaser }

Mira Kim\*, Jaehoon Ko\*, **Kyusun Cho**, Junmyeong Choi, Daewon Choi, [Seungryong Kim](https://cvlab.korea.ac.kr/members/faculty)

*arXiv Preprint, 2023*

<p class="pub-tags"><span class="pub-tag">#3D</span> <span class="pub-tag">#NeRF</span> <span class="pub-tag">#auto-encoder</span> <span class="pub-tag">#disentanglement</span> <span class="pub-tag">#object-manipulation</span></p>

## Abstract

We propose a novel framework for 3D-aware object manipulation, called Auto-Encoding Neural Radiance Fields (AE-NeRF). Our model, which is formulated in an auto-encoder architecture, extracts disentangled 3D attributes such as 3D shape, appearance, and camera pose from an image, and a high-quality image is rendered from the attributes through disentangled generative Neural Radiance Fields (NeRF). To improve the disentanglement ability, we present two losses, global-local attribute consistency loss defined between input and output, and swapped-attribute classification loss. Since training such auto-encoding networks from scratch without ground-truth shape and appearance information is non-trivial, we present a stage-wise training scheme, which dramatically helps to boost the performance. We conduct experiments to demonstrate the effectiveness of the proposed model over the latest methods and provide extensive ablation studies.

[Paper](https://arxiv.org/abs/2204.13426){: .btn .btn-outline }
