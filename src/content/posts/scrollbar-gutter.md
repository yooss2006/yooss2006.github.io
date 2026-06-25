---
title: "scrollbar-gutter로 레이아웃 쉬프트 막기"
description: "스크롤바 유무 때문에 페이지 너비가 흔들릴 때 CSS 한 줄로 해결하는 방법입니다."
publishedAt: 2026-06-11
category: "개발"
tags:
  - CSS
  - UI
  - 레이아웃
thumbnail: "/images/posts/scrollbar-gutter/scrollbar-gutter-thumbnail.png"
draft: false
---

페이지를 오갈 때 화면이 아주 살짝 옆으로 밀리는 순간이 있다. 처음에는 눈에 잘 안 띄지만, 한 번 보이면 계속 거슬린다. 이번 블로그 작업 중에도 같은 문제가 있었다.

원인은 스크롤바였다. 어떤 페이지에는 스크롤바가 있고, 어떤 페이지에는 없다. 브라우저가 스크롤바 공간을 잡았다가 풀면서 페이지의 사용 가능한 너비가 달라지고, 그 차이만큼 레이아웃이 흔들렸다.

<figure>
  <img src="/images/posts/scrollbar-gutter/scrollbar-gutter.gif" alt="스크롤바 유무에 따라 상단 내비게이션 위치가 흔들리는 화면" width="1528" height="68" />
  <figcaption>상단 레이아웃이 미세하게 이동하는 모습.</figcaption>
</figure>

## 해결 방법

해결은 짧다. 문서 전체에 `scrollbar-gutter: stable`을 선언하면 된다.

```css
html,
body,
:root {
  scrollbar-gutter: stable;
}
```

`scrollbar-gutter: stable`은 스크롤바가 없어도 스크롤바가 들어갈 공간을 미리 예약한다. 그래서 스크롤바가 생기거나 사라져도 콘텐츠 영역의 너비가 그대로 유지된다. 결과적으로 페이지 이동 중 가로 방향 레이아웃 쉬프트가 줄어든다.

위에 GIF처럼 상단 내비게이션 위치가 미세하게 흔들리던 문제를 잡을 때 유용했다.

## 적용할 때 볼 점

`scrollbar-gutter: stable`은 스크롤바 유무 때문에 생기는 가로 흔들림을 줄이는 데 효과가 있다. 모든 레이아웃 쉬프트를 해결하는 설정은 아니다.

특히 이런 경우에 먼저 확인해볼 만하다.

- 스크롤바가 생기는 페이지와 생기지 않는 페이지를 오갈 때
- 헤더나 중앙 정렬된 콘텐츠가 좌우로 미세하게 움직일 때
- 페이지 전환마다 같은 방향의 가로 흔들림이 반복될 때

반대로 이미지 크기 미지정, 웹폰트 로딩, 동적으로 삽입되는 콘텐츠 때문에 생기는 레이아웃 쉬프트라면 다른 원인을 봐야 한다.
