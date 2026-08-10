---
title: 3D GAN Inversion
parent: Publications
nav_order: 3
card_title: 3D GAN Inversion with Pose Optimization
card_eyebrow: WACV 2023
card_excerpt: Infers camera viewpoint and latent code together, so a single image can be reconstructed and edited with multi-view consistency.
card_video: /assets/images/tim_cook.mp4
card_tags: 3D, GAN-inversion, NeRF, editing
---

# 3D GAN Inversion with Pose Optimization

<video class="pub-teaser" src="{{ '/assets/images/tim_cook.mp4' | relative_url }}" autoplay muted loop playsinline></video>

Jaehoon Ko\*, **Kyusun Cho**\*, Daewon Choi, Kwangrok Ryoo, [Seungryong Kim](https://cvlab.korea.ac.kr/members/faculty)

*The IEEE/CVF Winter Conference on Applications of Computer Vision (WACV) 2023*

<p class="pub-tags"><span class="pub-tag">#3D</span> <span class="pub-tag">#GAN-inversion</span> <span class="pub-tag">#NeRF</span> <span class="pub-tag">#pose-optimization</span> <span class="pub-tag">#editing</span></p>

## Abstract

With the recent advances in NeRF-based 3D aware GANs quality, projecting an image into the latent space of these 3D-aware GANs has a natural advantage over 2D GAN inversion: not only does it allow multi-view consistent editing of the projected image, but it also enables 3D reconstruction and novel view synthesis when given only a single image. However, the explicit viewpoint control acts as a main hindrance in the 3D GAN inversion process, as both camera pose and latent code have to be optimized simultaneously to reconstruct the given image. Most works that explore the latent space of the 3D-aware GANs rely on ground-truth camera viewpoint or deformable 3D model, thus limiting their applicability. In this work, we introduce a generalizable 3D GAN inversion method that infers camera viewpoint and latent code simultaneously to enable multi-view consistent semantic image editing. The key to our approach is to leverage pre-trained estimators for better initialization and utilize the pixel-wise depth calculated from NeRF parameters to better reconstruct the given image. We conduct extensive experiments on image reconstruction and editing both quantitatively and qualitatively, and further compare our results with 2D GAN-based editing to demonstrate the advantages of utilizing the latent space of 3D GANs.

[Project Page](https://3dgan-inversion.github.io/){: .btn .btn-outline }
[Paper](https://arxiv.org/abs/2210.07301){: .btn .btn-outline }
[Code](https://github.com/cvlab-kaist/3DGAN-Inversion){: .btn .btn-outline }
