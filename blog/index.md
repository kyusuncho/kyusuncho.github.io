---
title: Home
layout: home
nav_order: 1
description: "Kyusun Cho's homepage"
permalink: /
---

# Kyusun Cho

![Kyusun Cho]({{ '/assets/images/prof_pic.jpg' | relative_url }}){: .profile-photo width="220" }

I am an AI Engineer at PlantyNet, working on on-device deepfake detection, LLMOps, and applied AI systems. I completed my M.S. in Computer Science (Artificial Intelligence) at Korea University in February 2025, advised by Professor Seungryong Kim, and received my B.S. in Statistics from Korea University in February 2022.

My research and engineering interests include 3D computer vision, 3D synthesis, multi-modal AI, and practical systems that bring model capabilities into real products. Feel free to contact me via e-mail [kyustorm7@korea.ac.kr](mailto:kyustorm7@korea.ac.kr).

This blog is a queue of notes, write-ups, and reflections from the projects I work on and the experiences I gather along the way.

---

<div class="two-col" markdown="1">

<div markdown="1">

## Education

<div class="cv-entry">
  <div class="cv-entry-head">
    <span class="cv-org">Korea University</span>
    <span class="cv-date">2022.03 – 2025.02</span>
  </div>
  <div class="cv-role">M.S in Computer Science (Artificial Intelligence)</div>
  <div class="cv-note">Advisor: Seungryong Kim</div>
</div>

<div class="cv-entry">
  <div class="cv-entry-head">
    <span class="cv-org">Korea University</span>
    <span class="cv-date">2018.03 – 2022.02</span>
  </div>
  <div class="cv-role">B.S in Statistics</div>
</div>

</div>

<div markdown="1">

## Work Experience

<div class="cv-entry">
  <div class="cv-entry-head">
    <span class="cv-org">PlantyNet</span>
    <span class="cv-date cv-date--current">2025.02 – current</span>
  </div>
  <div class="cv-role">AI Engineer · Seongnam, South Korea</div>
  <div class="cv-note">On-device Deepfake Detection, LLMOps, etc.</div>
</div>

<div class="cv-entry">
  <div class="cv-entry-head">
    <span class="cv-org">Queen Mary University of London</span>
    <span class="cv-date">2024.08 – 2024.11</span>
  </div>
  <div class="cv-role">Visiting Researcher · London, United Kingdom</div>
  <div class="cv-note">Object-aware Dynamic Scene Reconstruction from Monocular Videos of Head-mounted Cameras</div>
</div>

</div>

</div>

---

## Publications

<div class="pub-grid">

<div class="pub-card">
<a class="pub-card-media" href="{% link publication/gaussiantalker.md %}">
<img src="{{ '/assets/images/GaussianTalker.png' | relative_url }}" alt="GaussianTalker teaser" loading="lazy">
</a>
<div class="pub-card-body">
<div class="pub-venue">ACM Multimedia 2024</div>
<h3 class="pub-card-title"><a href="{% link publication/gaussiantalker.md %}">GaussianTalker: Real-Time Talking Head Synthesis with 3D Gaussian Splatting</a></h3>
<div class="pub-tags"><span class="pub-tag">#3D</span><span class="pub-tag">#gaussian-splatting</span><span class="pub-tag">#talking-head</span><span class="pub-tag">#real-time</span></div>
<div class="pub-links">
<a class="pub-icon" href="https://cvlab-kaist.github.io/GaussianTalker/" target="_blank" rel="noopener" aria-label="Project Page" title="Project Page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></a>
<a class="pub-icon" href="https://arxiv.org/abs/2404.16012v2" target="_blank" rel="noopener" aria-label="Paper" title="Paper"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></a>
<a class="pub-icon" href="https://github.com/cvlab-kaist/GaussianTalker" target="_blank" rel="noopener" aria-label="Code" title="Code"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></a>
</div>
</div>
</div>

<div class="pub-card">
<a class="pub-card-media" href="{% link publication/talk3d.md %}">
<img src="{{ '/assets/images/talk3d_teaser.png' | relative_url }}" alt="Talk3D teaser" loading="lazy">
</a>
<div class="pub-card-body">
<div class="pub-venue">ICCV 2025 Workshop</div>
<h3 class="pub-card-title"><a href="{% link publication/talk3d.md %}">Talk3D: High-Fidelity Talking Portrait Synthesis via Personalized 3D Generative Prior</a></h3>
<div class="pub-tags"><span class="pub-tag">#3D</span><span class="pub-tag">#talking-portrait</span><span class="pub-tag">#NeRF</span><span class="pub-tag">#generative-prior</span></div>
<div class="pub-links">
<a class="pub-icon" href="https://cvlab-kaist.github.io/Talk3D/" target="_blank" rel="noopener" aria-label="Project Page" title="Project Page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></a>
<a class="pub-icon" href="https://arxiv.org/abs/2403.20153" target="_blank" rel="noopener" aria-label="Paper" title="Paper"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></a>
<a class="pub-icon" href="https://github.com/cvlab-kaist/Talk3D" target="_blank" rel="noopener" aria-label="Code" title="Code"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></a>
</div>
</div>
</div>

<div class="pub-card">
<a class="pub-card-media" href="{% link publication/3dgan-inversion.md %}">
<video src="{{ '/assets/images/tim_cook.mp4' | relative_url }}" autoplay muted loop playsinline></video>
</a>
<div class="pub-card-body">
<div class="pub-venue">WACV 2023</div>
<h3 class="pub-card-title"><a href="{% link publication/3dgan-inversion.md %}">3D GAN Inversion with Pose Optimization</a></h3>
<div class="pub-tags"><span class="pub-tag">#3D</span><span class="pub-tag">#GAN-inversion</span><span class="pub-tag">#NeRF</span><span class="pub-tag">#editing</span></div>
<div class="pub-links">
<a class="pub-icon" href="https://3dgan-inversion.github.io/" target="_blank" rel="noopener" aria-label="Project Page" title="Project Page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></a>
<a class="pub-icon" href="https://arxiv.org/abs/2210.07301" target="_blank" rel="noopener" aria-label="Paper" title="Paper"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></a>
<a class="pub-icon" href="https://github.com/cvlab-kaist/3DGAN-Inversion" target="_blank" rel="noopener" aria-label="Code" title="Code"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></a>
</div>
</div>
</div>

<div class="pub-card">
<a class="pub-card-media" href="{% link publication/ae-nerf.md %}">
<img src="{{ '/assets/images/ae-nerf.png' | relative_url }}" alt="AE-NeRF teaser" loading="lazy">
</a>
<div class="pub-card-body">
<div class="pub-venue">arXiv 2023</div>
<h3 class="pub-card-title"><a href="{% link publication/ae-nerf.md %}">AE-NeRF: Auto-Encoding Neural Radiance Fields for 3D-Aware Object Manipulation</a></h3>
<div class="pub-tags"><span class="pub-tag">#3D</span><span class="pub-tag">#NeRF</span><span class="pub-tag">#auto-encoder</span><span class="pub-tag">#disentanglement</span></div>
<div class="pub-links">
<a class="pub-icon" href="https://arxiv.org/abs/2204.13426" target="_blank" rel="noopener" aria-label="Paper" title="Paper"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></a>
</div>
</div>
</div>

</div>

---

Template of [Lior Yariv](https://lioryariv.github.io/)
