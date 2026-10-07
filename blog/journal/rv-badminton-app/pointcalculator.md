---
title: Chapter 2 — PointCalculator
parent: RV Badminton 개발 일지
grandparent: Journal
nav_order: 2
card_title: PointCalculator
card_eyebrow: Chapter 2
card_excerpt: 포인트 계산을 별도 서비스로 뺀 이유, 그리고 브루트포스 대신 "필요한 만큼만 재연"하도록 DuckDB로 짠 구조.
card_media: glyph
card_glyph: "02"
card_tags: fastapi, spring-boot, duckdb, redis, microservices, system-design
---

# RV Badminton: 포인트 계산 엔진 분리하기

{: .tldr }
> 포인트 계산을 Spring Boot 백엔드에서 떼어내 Python/FastAPI 서비스로 만들었다. 규칙이 제일 자주 바뀌는 부분이라 나머지와 배포 단위를 나누고 싶었고, 같은 경기 기록이면 언제 계산해도 같은 결과가 나와야 했다.
>
> 리그포인트는 이전 경기 결과가 다음 계산의 입력이 되는 순차적인 체인이라, 지난 경기 하나를 고치면 그 뒤 수십 경기와 거기 얹힌 게임포인트까지 다시 굴려야 한다. 매번 처음부터 계산하는 대신 직전 스냅샷에서부터 필요한 만큼만 재연하고, 그 재연을 DuckDB로 돌렸다.

---

## 먼저, "포인트"가 하나가 아니다

회원 한 명이 갖는 포인트는 사실 네 개로 나뉘어 있다. 남성부 리그포인트(`men_league_points`), 여성부 리그포인트(`women_league_points`), 혼합복식 리그포인트(`mixed_league_points`), 그리고 이 셋과는 완전히 별개로 쌓이는 게임포인트(`game_points`).

앞의 셋은 각 리그에서의 실력을 재고 서로 독립적으로 계산된다. 남복 경기를 뛰어서 남성부 리그포인트가 오르내려도 혼합 리그포인트는 그대로다. 회원별로 값을 직접 들고 있다가 경기마다 갱신하는 구조고, 이 순위로 1~5등급(시드)을 매긴다.

게임포인트는 다르다. 리그와 무관하게 시즌 동안 얼마나 참여했는지로 쌓이고, 값을 저장하는 대신 그 회원이 뛴 경기 점수를 매번 합산해서 구한다. 다만 한 경기의 게임포인트가 몇 점인지는 그 경기 참가자들의 리그포인트와 시드로 환산되고, 높은 시드일수록 많이 받는다. 복잡한 시스템이다.

이 글에서 말하는 "포인트 계산"은 이 네 값을 동시에 굴리는 일이다.

---

## 남복 기준, 실제로 어떻게 굴러가나

남복(남성부 복식) 한 경기를 기준으로 규칙을 따라가 보면 크게 세 단계다. ① 팀 실력을 하나의 숫자로 뭉치고 → ② 그 차이와 스코어차로 리그포인트를 주고받고 → ③ 리그포인트 순위로 시드를 매겨 게임포인트에 배율을 먹인다.

**1) 팀 실력(MMR)은 낮은 쪽에 가중치를 준다.** 복식이니 두 사람의 리그포인트(LP)를 하나로 합쳐야 하는데, 그냥 평균을 내면 잘하는 한 명이 못하는 한 명을 손쉽게 캐리하는 조합이 실제 실력보다 세게 잡힌다. 그래서 낮은 쪽에 두 배 가중치를 준다.

```
팀 MMR = (2 × 낮은 LP + 높은 LP) / 3
```

**2) 리그포인트는 "이길 것으로 예상됐는데 이겼는지" vs "이변인지"로 갈린다.** 이긴 팀 MMR에서 진 팀 MMR을 뺀 값(`diff`)과 실제 스코어차(`raw`)로 기본 변동폭을 정하는데, 예상대로 강팀이 이기면 보너스가 없고, 약팀이 뒤집으면 뒤집을수록 보너스가 커진다.

| 이긴 팀이 진 팀보다 얼마나 강했나 (`diff`) | 리그포인트 변동폭 |
|---|---|
| 200 초과 (강팀의 예상된 승리) | `2 × raw` |
| 100 초과 ~ 200 이하 | `2 × raw + 5` |
| -100 ~ 100 (실력이 비슷) | `2 × raw + 10` |
| -200 이상 ~ -100 미만 | `2 × raw + 15` |
| -200 미만 (완전한 이변) | `2 × raw + 20` |

이렇게 구한 변동폭만큼 이긴 팀 두 명은 각각 더하고, 진 팀 두 명은 각각 뺀다. 그 다음 팀메이트 간 격차를 아주 살짝 좁히는 보정(상대팀 평균과 자신의 차이의 100분의 1)을 한 번 더 얹고 정수로 반올림하면 그 경기의 리그포인트 변동이 끝난다.

**3) 시드(리그 레벨)는 그 경기 직전 시점, 남복에서 뛴 적 있는 회원 전체를 LP 내림차순으로 세운 백분위다.** 상위 18.5%까지 1시드, 그다음 37%까지 2시드, 55.5%까지 3시드, 74%까지 4시드, 나머지는 5시드. 이 시드가 곧바로 게임포인트 배율이 된다 — 이기면 팀 점수 × 시드 배율 × 1.6(승리 보너스), 지면 팀 점수 × 시드 배율만 그대로 받는다(1~4시드는 1.60~1.15배, 5시드는 1.0배).

세 경우를 숫자로 보자. 셋 다 팀1 = A1·A2, 팀2 = B1·B2고, 각 셀은 그 단계에서의 리그포인트와 게임포인트다. 게임포인트는 이번 경기 전까지 그 시즌에 쌓아둔 값이고, 시드가 정해지는 마지막 단계에서 이번 경기 몫이 더해진다.

<div class="calc-carousel" id="calc-carousel-mens-doubles">
<div class="calc-carousel-header">
<button type="button" class="calc-carousel-nav" data-carousel-prev aria-label="이전 예시">
<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
</button>
<div class="calc-carousel-heading">
<div class="calc-carousel-title" data-carousel-title>예시 1 — 비등비등한 두 팀, 접전</div>
<div class="calc-carousel-count" data-carousel-count>1 / 3</div>
</div>
<button type="button" class="calc-carousel-nav" data-carousel-next aria-label="다음 예시">
<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
</button>
</div>
<div class="calc-carousel-viewport">
<div class="calc-carousel-track">

<div class="calc-carousel-slide">
<table class="calc-example">
<thead><tr><th>A1</th><th>A2</th><th>B1</th><th>B2</th></tr></thead>
<tbody>
<tr>
<td>league_point=1500<br>game_point=820</td>
<td>league_point=1520<br>game_point=560</td>
<td>league_point=1480<br>game_point=930</td>
<td>league_point=1510<br>game_point=470</td>
</tr>
<tr class="calc-example-note"><td colspan="4">경기 전 상태. 팀 MMR — A: (2×1500+1520)/3=1506.67, B: (2×1480+1510)/3=1490. 격차(diff)는 16.67로 -100~100 밴드에 들어간다. 게임포인트는 이 시즌 그동안 쌓아온 값이라 아직 이번 경기와 무관하다.</td></tr>
<tr>
<td>league_point=1522<br>game_point=820</td>
<td>league_point=1542<br>game_point=560</td>
<td>league_point=1458<br>game_point=930</td>
<td>league_point=1488<br>game_point=470</td>
</tr>
<tr class="calc-example-note"><td colspan="4">21-15로 A 승, raw=6. diff가 가운데 밴드라 변동폭 = 2×6+10 = 22. 이긴 A 둘은 각각 +22, 진 B 둘은 각각 -22.</td></tr>
<tr>
<td>league_point=1521<br>game_point=820</td>
<td>league_point=1541<br>game_point=560</td>
<td>league_point=1459<br>game_point=930</td>
<td>league_point=1489<br>game_point=470</td>
</tr>
<tr class="calc-example-note"><td colspan="4">팀메이트 격차를 100분의 1만큼 좁히는 시너지 보정을 얹고 정수로 반올림. 네 명 합계는 6010 → 6010, 오차 없이 정확히 상쇄됐다.</td></tr>
<tr class="calc-example-result">
<td>league_point=1521<br>game_point=874</td>
<td>league_point=1541<br>game_point=609</td>
<td>league_point=1459<br>game_point=950</td>
<td>league_point=1489<br>game_point=487</td>
</tr>
<tr class="calc-example-note"><td colspan="4">이 시점 남복 순위에서 A1은 1시드, A2는 2시드, B1은 3시드, B2는 4시드였다고 하자. 이긴 A는 <code>21×시드배율×1.6</code>, 진 B는 <code>15×시드배율</code>만큼을 이번 경기에서 벌어 시즌 누적치에 더한다 — A1 820→874, A2 560→609, B1 930→950, B2 470→487.</td></tr>
</tbody>
</table>
</div>

<div class="calc-carousel-slide">
<table class="calc-example">
<thead><tr><th>A1</th><th>A2</th><th>B1</th><th>B2</th></tr></thead>
<tbody>
<tr>
<td>league_point=1700<br>game_point=680</td>
<td>league_point=1650<br>game_point=910</td>
<td>league_point=1400<br>game_point=520</td>
<td>league_point=1420<br>game_point=440</td>
</tr>
<tr class="calc-example-note"><td colspan="4">경기 전 상태. 팀 MMR — A: (2×1650+1700)/3=1666.67, B: (2×1400+1420)/3=1406.67. diff=260으로 200을 넘는, 보너스가 없는 밴드다.</td></tr>
<tr>
<td>league_point=1722<br>game_point=680</td>
<td>league_point=1672<br>game_point=910</td>
<td>league_point=1378<br>game_point=520</td>
<td>league_point=1398<br>game_point=440</td>
</tr>
<tr class="calc-example-note"><td colspan="4">21-10으로 A 승, raw=11. diff&gt;200 밴드라 변동폭 = 2×11 = 22 — 예시 1보다 점수차는 훨씬 컸는데 변동폭은 똑같다. 강팀이 강팀답게 이긴 것뿐이라 보너스가 붙지 않는다.</td></tr>
<tr>
<td>league_point=1715<br>game_point=680</td>
<td>league_point=1666<br>game_point=910</td>
<td>league_point=1384<br>game_point=520</td>
<td>league_point=1404<br>game_point=440</td>
</tr>
<tr class="calc-example-note"><td colspan="4">시너지 보정 후 반올림. 합계는 6170 → 6169로, 반올림 과정에서 1점 정도의 오차만 남는다.</td></tr>
<tr class="calc-example-result">
<td>league_point=1715<br>game_point=734</td>
<td>league_point=1666<br>game_point=959</td>
<td>league_point=1384<br>game_point=532</td>
<td>league_point=1404<br>game_point=450</td>
</tr>
<tr class="calc-example-note"><td colspan="4">A1·A2는 예시 1과 같은 1·2시드라 이번 경기에서도 54·49점을 벌어 680→734, 910→959로 오른다. B1은 4시드라 <code>10×1.15=12</code>점(520→532), B2는 아직 순위권 밖(5시드, 기본 배율 1.0)이라 팀 점수 그대로 <code>10</code>점만 더해진다(440→450).</td></tr>
</tbody>
</table>
</div>

<div class="calc-carousel-slide">
<table class="calc-example">
<thead><tr><th>A1</th><th>A2</th><th>B1</th><th>B2</th></tr></thead>
<tbody>
<tr>
<td>league_point=1700<br>game_point=680</td>
<td>league_point=1650<br>game_point=910</td>
<td>league_point=1400<br>game_point=520</td>
<td>league_point=1420<br>game_point=440</td>
</tr>
<tr class="calc-example-note"><td colspan="4">선수 구성과 시즌 누적 게임포인트는 예시 2와 동일. 이번엔 B가 21-18로 뒤집었다고 하자. 이긴 B의 팀 MMR(1406.67)이 진 A의 팀 MMR(1666.67)보다 260 낮아 diff=-260, 가장 큰 보너스 밴드로 떨어진다.</td></tr>
<tr>
<td>league_point=1674<br>game_point=680</td>
<td>league_point=1624<br>game_point=910</td>
<td>league_point=1426<br>game_point=520</td>
<td>league_point=1446<br>game_point=440</td>
</tr>
<tr class="calc-example-note"><td colspan="4">raw=3, diff&lt;-200 밴드라 변동폭 = 2×3+20 = 26 — 점수차는 셋 중 제일 작았는데 리그포인트는 제일 많이 움직인다.</td></tr>
<tr>
<td>league_point=1669<br>game_point=680</td>
<td>league_point=1620<br>game_point=910</td>
<td>league_point=1430<br>game_point=520</td>
<td>league_point=1450<br>game_point=440</td>
</tr>
<tr class="calc-example-note"><td colspan="4">시너지 보정 후 반올림. 합계는 6170 → 6169.</td></tr>
<tr class="calc-example-result">
<td>league_point=1669<br>game_point=709</td>
<td>league_point=1620<br>game_point=936</td>
<td>league_point=1430<br>game_point=559</td>
<td>league_point=1450<br>game_point=474</td>
</tr>
<tr class="calc-example-note"><td colspan="4">B1은 4시드로 이겨서 <code>21×1.15×1.6=39</code>점(520→559), B2는 5시드(기본 배율)라 <code>21×1.6=34</code>점(440→474)을 번다. A1·A2는 시드가 높아서 져도 각각 <code>18×1.60=29</code>점(680→709), <code>18×1.45=26</code>점(910→936)을 챙긴다 — 이변의 보상은 리그포인트 쪽에 몰려 있고, 게임포인트는 그 경기 시점의 "원래 실력"을 더 본다는 뜻이다.</td></tr>
</tbody>
</table>
</div>

</div>
</div>
<div class="calc-carousel-dots" role="tablist" aria-label="예시 선택">
<button type="button" class="calc-carousel-dot" data-carousel-dot="0" aria-current="true" aria-label="예시 1로 이동"></button>
<button type="button" class="calc-carousel-dot" data-carousel-dot="1" aria-current="false" aria-label="예시 2로 이동"></button>
<button type="button" class="calc-carousel-dot" data-carousel-dot="2" aria-current="false" aria-label="예시 3로 이동"></button>
</div>
</div>

<script>
(function () {
  var titles = [
    "예시 1 — 비등비등한 두 팀, 접전",
    "예시 2 — 강팀이 예상대로 이김",
    "예시 3 — 완전한 이변"
  ];
  var root = document.getElementById("calc-carousel-mens-doubles");
  if (!root) { return; }
  var track = root.querySelector(".calc-carousel-track");
  var titleEl = root.querySelector("[data-carousel-title]");
  var countEl = root.querySelector("[data-carousel-count]");
  var dots = root.querySelectorAll(".calc-carousel-dot");
  var prevBtn = root.querySelector("[data-carousel-prev]");
  var nextBtn = root.querySelector("[data-carousel-next]");
  var index = 0;
  function render() {
    track.style.transform = "translateX(-" + (index * 100) + "%)";
    titleEl.textContent = titles[index];
    countEl.textContent = (index + 1) + " / " + titles.length;
    for (var i = 0; i < dots.length; i++) {
      dots[i].setAttribute("aria-current", i === index ? "true" : "false");
    }
  }
  prevBtn.addEventListener("click", function () {
    index = (index - 1 + titles.length) % titles.length;
    render();
  });
  nextBtn.addEventListener("click", function () {
    index = (index + 1) % titles.length;
    render();
  });
  for (var i = 0; i < dots.length; i++) {
    dots[i].addEventListener("click", function (event) {
      index = Number(event.currentTarget.getAttribute("data-carousel-dot"));
      render();
    });
  }
  render();
})();
</script>

세 예시 모두 이긴 팀 쪽 합과 진 팀 쪽 합이 반올림 오차 한두 점을 빼면 상쇄된다. 누가 얼마를 얻으면 그만큼 상대가 잃는 구조다.

{: .note }
> 시드는 두 곳에서 계산된다. 게임포인트 배율에 쓰이는 시드는 방금 본 대로 그 경기 직전 순간의 백분위고, 회원 화면에 실제로 보여지는 시드는 여기에 "그 리그에서 10경기 미만이면 무조건 5시드보다 낮은 미지정 취급"이라는 별도 규칙이 한 겹 더 붙는다. 그래서 방금 데뷔한 신규 회원의 첫 경기 게임포인트는 매치 시점 백분위 시드로 계산되지만, 리더보드에는 아직 "시드 없음"으로 뜨는 경우가 있다.

---

## 왜 포인트 계산만 따로 뺐나

포인트 계산 로직은 처음엔 그냥 Spring Boot 백엔드 안에 있었다. 매치가 저장되면 그 자리에서 계산하고 데이터베이스를 갱신하는 식. 이게 제일 당연한 시작점이고, 실제로 한동안 이렇게 굴러갔다.

그런데 실사용자가 붙고 나서 두 가지가 계속 걸렸다.

**첫째, 포인트 계산 규칙은 제일 자주 바뀌는 부분이다.** 회장인 상우 형이 점수 체계를 만질 때마다 — 승패 보정이 너무 세다거나, 이번 시즌엔 참여를 더 반영해야 한다거나 — 거의 매달 뭔가가 바뀌었다. 이게 매치 기록·인증·나머지 API와 같은 프로세스에 물려 있으면 공식 하나 고치려고 서비스 전체를 다시 배포해야 한다. 자주 흔들리는 부분과 안정적으로 있어야 할 부분을 같은 배포 단위에 두고 싶지 않았다.

**둘째, 같은 경기 기록이면 언제 계산해도 같은 결과가 나와야 한다.** "누가 몇 대 몇으로 이겼다"는 바뀌지 않지만, "그래서 포인트가 몇 점 올랐다"는 지금 규칙을 그 기록에 적용한 결과다. 규칙이 자주 바뀌는데도 결과를 재현할 수 있어야 하니, 계산 로직은 경기 기록만 입력으로 받아 포인트를 내놓는 형태로 경계를 뚜렷하게 두는 편이 나았다. 그래서 별도 서비스로 떼어내고 Python/FastAPI로 짰다. 이런 분석성 계산을 표현하기에 데이터 처리 도구가 잘 갖춰져 있다.

---

## 경기 하나 넣는 건 쉬운데, 지난 경기 하나 고치는 건 왜 무거운가

방금 끝난 경기 하나의 포인트를 계산하는 건 가벼운 일이다. 네 명의 현재 리그포인트를 가져와 승패에 따라 조정하면 끝이다. DuckDB도 FastAPI도 없이 Postgres에서 직접 계산해도 충분히 빠르다.

문제는 순서를 건드릴 때 생긴다. 지난주에 입력을 깜빡한 경기를 오늘 넣거나, 두 달 전 경기의 스코어 오타를 고치는 경우다. 리그포인트 계산은 그 경기 시작 시점의 상대방 리그포인트를 입력으로 쓰는데, 그 값 자체가 이전 모든 경기 결과가 누적된 것이다. 경기 하나하나가 독립적으로 채점되는 게 아니라 이전 결과가 다음 계산의 입력이 되는 **순차적인 체인**이고, 그 위에 얹힌 시드와 게임포인트도 같이 흔들린다.

그래서 두 달 전 경기 하나를 고치면 그 뒤의 경기들이 — 정모 페이스면 60경기 정도는 금방 쌓인다 — 전부 잘못된 직전 리그포인트를 참조한 상태가 된다. 이걸 건너뛰고 최신 상태만 땜질할 방법은 없다. 순서대로 다시 굴려야 각 경기가 그 시점에 맞는 값을 참조한다. 그리고 이 재계산은 회원이 리더보드를 열기 전에 끝나야 한다.

---

## 브루트포스 대신 고른 구조: 필요한 만큼만 재연하기

가장 단순한 답은 창단 이후 전체 경기를 매번 처음부터 다시 계산하는 것이다. 결과는 맞다. 다만 경기 수는 계속 쌓이는 중이라, 오타 하나 고칠 때마다 전체 히스토리를 재생하면 계산량이 시간이 갈수록 무거워진다.

그래서 경기 하나가 계산될 때마다 그 결과를 그 시점의 스냅샷으로 저장해둔다. 어떤 경기가 수정되면 창단일이 아니라 **그 경기 바로 직전의 마지막 스냅샷**에서부터 다시 재생한다.

이 재연을 실제로 빠르게 돌리는 역할을 DuckDB가 맡는다. 이유는 세 가지다.

- 앱 프로세스 안에 파일 하나로 붙어 있는 임베디드 엔진이라, 매 경기마다 별도 DB 서버로 네트워크 왕복을 할 필요가 없다.
- 컬럼형 분석 엔진이라 수백~수천 개 경기를 순서대로 훑으며 누적 집계하는 이런 워크로드에 원래 맞는 도구다.
- 담긴 건 전부 파생 데이터다. 원본 경기 기록은 Postgres에 있으니 이 파일이 깨지거나 사라져도 다시 만들면 된다. 언제든 지워도 되는 캐시라는 전제를 깔 수 있었다.

---

## 데이터는 셋으로 나누고, 서로 안 겹치게

두 서비스가 같은 데이터를 제각각 건드리지 않도록, 저장소 계층마다 소유권을 하나씩만 뒀다.

<div class="architecture-embed-wrap">
  <iframe class="architecture-embed" src="{{ '/assets/rv-pointcalculator-authority.html' | relative_url }}#embed" title="권한 모델 — 세 저장소, 겹치지 않는 소유권" loading="lazy"></iframe>
  <a class="architecture-expand" href="{{ '/assets/rv-pointcalculator-authority.html' | relative_url }}" target="_blank" rel="noopener" aria-label="전체 화면으로 다이어그램 열기" title="전체 화면으로 보기">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5"/></svg>
  </a>
</div>

| 데이터 | 진짜 원본 | 쓰는 쪽 | 읽는 쪽 |
|---|---|---|---|
| 경기·회원 기록 | PostgreSQL | Spring Boot | PointCalculator |
| 재연해서 나온 리그포인트·게임포인트 | DuckDB | PointCalculator | PointCalculator |
| 리더보드·등급 | Redis | PointCalculator | Spring Boot |
| 포인트 계산 가중치 설정 | Redis | Spring Boot (어드민) | PointCalculator |

Postgres는 원본 기록만 갖고 있고 PointCalculator는 여기서 읽기만 한다. DuckDB는 재연 캐시라 PointCalculator만 쓰고 읽는다. 계산이 끝나면 결과가 Redis에 올라가고 Spring Boot는 그걸 읽어서 API로 내려준다. 포인트 계산 공식이 어떻게 바뀌든 Java 쪽은 Redis 계약만 지키면 된다.

---

## 서비스 두 개가 어떻게 손을 맞추나

매치가 저장되면 백엔드가 그 사실을 큐에 넣고 PointCalculator가 순서대로 꺼내 재계산한다. 캐시 파일 하나를 여러 요청이 동시에 건드리면 꼬이니 한 번에 하나씩만 처리하도록 순차 큐로 묶었다. 계산이 끝나면 결과가 Redis로 올라가고 그때부터 새 리더보드가 보인다.

{: .warning }
> **아직 덜 다듬어진 부분:** 매치가 삭제되면 그 매치의 시각 정보도 함께 사라져서, 재계산을 어느 시점부터 시작해야 하는지 애매해지는 경우가 있었다. 이 문제는 다음 글의 개편에서 정리했다.

재시작할 때도 같다. PointCalculator는 켜지면 Postgres의 경기 기록과 자기 캐시가 맞는지 대조하고, 어긋난 부분이 있으면 그 지점부터 재연해 스스로 맞춘다. PointCalculator가 꺼져 있는 동안 백엔드만 돌았던 경우가 여기 해당한다.
