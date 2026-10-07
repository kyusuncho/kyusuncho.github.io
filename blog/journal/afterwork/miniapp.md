---
title: Chapter 5 — 두 번째 클라이언트가 백엔드에 되묻는 것들
parent: 퇴근하구 개발 일지
grandparent: Journal
nav_order: 5
card_title: 두 번째 클라이언트가 백엔드에 되묻는 것들
card_eyebrow: Chapter 5
card_excerpt: 앱인토스 미니앱을 붙이자 "웹앱의 구현 디테일"이던 것들 — 서버 렌더링, 쿠키 신원, LLM 엔드포인트의 무방비 — 이 전부 아키텍처 결정으로 승격됐다.
card_media: glyph
card_glyph: "05"
card_tags: apps-in-toss, cors, identity, rate-limiting
---

# 두 번째 클라이언트가 백엔드에 되묻는 것들

> **상태를 먼저 밝힌다.** 미니앱은 `.ait` 번들까지 만들어진 상태지만, 앱인토스 콘솔 등록·샌드박스 실기기 테스트·출시 검수는 아직이다. 이 편의 스크린샷은 로컬 fixture 백엔드 + Vite dev 서버를 폰 뷰포트로 찍은 것이다. 라이브 검증 전 단계의 설계 기록으로 읽어 주면 좋겠다.

[Chapter 1]({% link journal/afterwork/hypothesis.md %})의 가설 — *"게스트가 지도 위 동선 매칭을 보면 로그인할 만한 가치를 느낀다"* — 을 검증하려면 직장인 게스트가 필요하다. 웹 랜딩 하나로는 그 트래픽이 오지 않는다. **앱인토스(Apps-in-Toss)** 는 토스 앱 안에서 서드파티 미니앱을 노출하는 채널이고, 설치 없이 정확히 그 타깃 사용자가 그대로 진입한다. PoC 유통 채널로 이보다 나은 조건은 없었다.

대가는 제약이다. 토스 정책은 **CSR/SSG만 허용, SSR 금지**하고 **외부 URL 로드·리다이렉트를 반려**한다. 이 두 조항이 이번 편의 아키텍처를 사실상 결정했다.

## 하나의 백엔드, 두 개의 클라이언트

기존 웹앱은 Next.js App Router 서버 컴포넌트다. `/results`는 서버에서 앵커를 해석하고 검색을 돌려 렌더링하는데, 토스는 정확히 이걸 금지한다. 그래서 미니앱은 **별도 패키지**(`miniapp/`, Vite + React 18 + HashRouter)로 만들고, 기존 Next 앱은 **API 백엔드로 유지**했다. 미니앱은 서버 코드를 한 줄도 import할 수 없다 — 다른 레포처럼 취급되는 별도 `package.json`이고, 계약은 오직 HTTP JSON이다.

<div class="architecture-embed-wrap">
  <iframe class="architecture-embed" src="{{ '/assets/afterwork-miniapp-topology.html' | relative_url }}#embed" title="하나의 추천 백엔드에 붙은 두 클라이언트 — 웹과 미니앱" loading="lazy"></iframe>
  <a class="architecture-expand" href="{{ '/assets/afterwork-miniapp-topology.html' | relative_url }}" target="_blank" rel="noopener" aria-label="전체 화면으로 다이어그램 열기" title="전체 화면으로 보기">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5"/></svg>
  </a>
</div>

![미니앱 첫 화면 (iPhone 13 뷰포트, 로컬 fixture 백엔드). 웹앱과 같은 카피, 같은 4단계 입력을 CSR로 렌더링한다.]({{ '/assets/images/posts/afterwork/miniapp-home.webp' | relative_url }}){: .post-shot width="720" height="1226" loading="lazy" }

`/results` 페이지가 인라인으로 하던 일 — 앵커 해석 → 검색 → 페이로드 구성 — 을 `lib/recommend-service.ts`로 꺼내고, 신규 `GET /api/recommend`가 그걸 그대로 반환한다.

```typescript
export async function GET(request: Request): Promise<Response> {
  const result = await buildRecommendation({ home, work, time, category });
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 }); // 입력을 에코하지 않는다
  return Response.json(result.data);
}
```

신뢰 경계는 페이지와 동일하다 — 좁혀진 파서, 하나의 일반 400, 에코 없음. 클라이언트가 하나 늘었다고 서버가 덜 의심하게 되면 안 된다. 다만 부채도 하나 남았다. 페이지는 여전히 자기만의 인라인 복사본을 갖고, 서비스가 그걸 1:1로 미러링해야 한다. 두 클라이언트가 같은 백엔드를 쓴다는 주장은 두 클라이언트가 *같은 코드 경로*를 탈 때만 완전히 참이다 — 지금은 주석과 E2E가 그 계약을 지키고, 페이지가 서비스를 호출하도록 합치는 게 다음 단계다.

## CORS: 순수 코어와 얇은 래퍼

미니앱 페이지(`*.tossmini.com`)가 API를 크로스 오리진으로 부르므로 서버가 명시적으로 허용해야 한다. 허용 로직은 이 코드베이스의 다른 seam과 같은 모양이다 — `lib/cors-core.ts`는 순수 함수, `proxy.ts`가 배관만 맡는다.

```typescript
const TOSSMINI_ORIGIN_RE =
  /^https:\/\/[a-z0-9][a-z0-9-]{0,62}\.(?:private-)?(?:web|apps)\.tossmini\.com$/;

export function resolveCorsOrigin(origin) {
  if (TOSSMINI_ORIGIN_RE.test(origin)) return origin;
  if (DEV_ORIGINS.has(origin)) return origin;
  return null;   // 헤더를 아예 내지 않는다 — 브라우저 기본(차단)이 그대로 적용
}
```

토스는 미니앱을 릴리스용 `web`/`apps`, QR 테스트용 `private-web`/`private-apps` 네 티어로 호스팅한다. 정규식 하나가 넷을 받되 `*.tossmini.com` 전체를 여는 와일드카드는 쓰지 않는다. 허용되지 않은 오리진에는 헤더를 비우는 게 아니라 *내지 않는다*. 크리덴셜 플래그도 없다 — 미니앱 API는 쿠키 없는 게스트 흐름이기 때문이고, 이게 다음 절로 이어진다.

## 익명 키: 유통 채널이 신원 모델을 바꾼다

웹앱의 게스트 신원은 HMAC 서명 롤아웃 쿠키다. 미니앱은 쿠키 없이 API를 부른다. 그러면 LLM 엔드포인트의 레이트 리밋을 무엇으로 나눌 것인가?

앱인토스 SDK의 `getAnonymousKey()`는 서버 연동·사용자 동의 없이 발급되고, 같은 사용자는 같은 미니앱 안에서 항상 같은 해시를 받는다. 여기서 조사가 하나 필요했다. 토스는 이 해시를 검증하는 API(mTLS 필요)를 제공하지만, 개발자 포럼에서 토스 직원이 확인해 준 바로는 그 API는 해시가 *정당하게 발급되었는지*만 증명하고 *호출자가 그 해시의 주인인지*는 증명하지 않는다. 다른 사람의 유효한 해시를 제시해도 검증은 통과한다.

> **결정 D-ANON-NO-VERIFY:** 레이트 리밋 경로에서 검증 API를 호출하지 않는다. mTLS 의존성과 요청당 왕복이 추가되는데, 이 계층에서 얻는 보안 이득이 0이기 때문이다. `x-anon-key`는 불투명한 **파티션 키**로만 다룬다.

이렇게 하면 `x-anon-key`는 웹의 `rollout_sid` 쿠키와 정확히 같은 신뢰 등급이 된다 — *식별자*이지 *인증 토큰*이 아니다. 레이트 리밋에는 안정적인 파티셔닝만 있으면 되고, 신원 증명은 필요 없다.

| 티어 | 키 | 출처 | 클라이언트 |
|---|---|---|---|
| 1 | `anon:<sha256(hash)>` | `x-anon-key` 헤더 | 미니앱 |
| 2 | `sid:<id>` | 검증된 `rollout_sid` 쿠키 | 웹 |
| 3 | `ip:<addr>` | 신뢰 홉 파싱된 XFF | 구버전 토스, 쿠키 없는 첫 요청 |

이 리미터는 아직 설계 문서 단계(`docs/multi-user-readiness.md`)이고 구현되지 않았다. 그리고 그게 다음 결정의 이유다.

## 넣지 않은 것: LLM 큐레이션

[Chapter 3]({% link journal/afterwork/curation.md %})의 제한형 큐레이션 챗봇은 미니앱에 **없다**. 결정이지 누락이 아니다.

- **지연.** 큐레이션 루프의 최악 지연은 약 120초다. WebView 안에서 그 시간을 기다리게 하는 건 가설과 무관한 이탈을 만든다.
- **어드미션 컨트롤.** `POST /api/curation`은 익명이고 요청당 LLM 호출을 최대 세 번 한다. 웹 랜딩 하나일 때는 충분했지만, 위 레이트 리미터가 아직 구현 전인 상태로 토스 트래픽 앞에 그대로 노출하는 건 무방비다.
- **정책.** 생성형 AI 고지 의무 등 앱인토스 심사 조건도 있지만, 진짜 이유는 두 번째다. **리미터가 들어가면 큐레이션도 따라 들어간다.**

## 폴백은 클라이언트에도 필요하다

미니앱 지도는 카카오맵 JS SDK를 런타임에 동적 로드하는데, 토스 WebView 안에서 로드되지 않은 사례가 커뮤니티에 보고돼 있다. 그래서 모든 실패 경로가 접근성 있는 폴백 패널에 떨어진다 — 지도가 없어도 결과 화면은 절대 막히지 않는다.

![결과 화면. 카카오 키가 없는 로컬 환경이라 지도 자리에 폴백 패널("퇴근길 예상 이동 35분 · 경로 주변 강좌 6곳")이 뜨고, 그 아래 순위 카드가 그대로 렌더링된다.]({{ '/assets/images/posts/afterwork/miniapp-results.webp' | relative_url }}){: .post-shot width="720" height="1226" loading="lazy" }

지도가 제품 가설의 핵심인데 지도 없이 서빙하는 게 말이 되냐고 물을 수 있다. 답은 "지도가 안 뜨는 것"과 "아무것도 안 뜨는 것" 중 어느 쪽이 가설 검증 데이터를 더 망치느냐다. 폴백 패널은 최소한 *경로 위 강좌 6곳*이라는 사실과 순위 카드를 전달하고, 지도 로드 실패율은 별도로 측정 가능한 신호로 남는다. Chapter 1의 degradation 원칙이 클라이언트 쪽에서 그대로 반복된 것이다.

## 정리

미니앱 자체는 작다. 화면 네 개, 71.9kB gzip. 하지만 두 번째 클라이언트를 붙이는 일이 백엔드에 대해 드러낸 건 작지 않았다.

- **서버 렌더링은 구현 디테일이 아니라 결정이었다.** SSR 금지 하나가 결과 페이지의 서버 흐름을 서비스로 추출하게 만들었고, 그 추출은 웹앱에도 좋은 일이었다.
- **신원 모델은 클라이언트마다 다르다.** 쿠키 없는 클라이언트가 생기자 "게스트를 무엇으로 구분하는가"가 처음으로 명시적인 질문이 됐다.
- **AI 엔드포인트의 무방비는 트래픽이 생기기 전에 고쳐야 한다.** 큐레이션을 뺀 건 기능 축소가 아니라 순서의 문제였다.
- **폴백은 클라이언트에도 필요하다.**

이 편으로 시리즈를 마친다. PoC는 이제 백엔드 하나, 클라이언트 둘, 야간 파이프라인 하나, 그리고 검증되지 않은 가설 하나로 이루어져 있다. 다음 단계는 코드가 아니라 콘솔 등록, 샌드박스 실기기, 그리고 실제 게스트다.

*관련 코드: **`miniapp/`**, **`lib/recommend-service.ts`**, **`app/api/recommend/route.ts`**, **`lib/cors-core.ts`**, **`proxy.ts`**, **`playwright.miniapp.config.ts`**, **`docs/multi-user-readiness.md`**.*
