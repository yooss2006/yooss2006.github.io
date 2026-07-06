---
title: "Codex 작업이 끝났을 때 macOS alert 띄우기"
description: "Claude Code hook 알림에서 출발해 Codex Desktop과 CLI에서 작업 완료 알림을 띄우는 macOS alert hook을 만든 기록입니다."
publishedAt: 2026-07-06
category: "개발"
tags:
  - Codex
  - macOS
  - Hook
thumbnail: "/images/posts/codex-macos-alert-hook/thumbnail.png"
draft: false
---

동료의 노트북에서 Claude Code 응답이 끝날 때 macOS alert 모달로 알림을 받는 걸 봤다. 예전에 Claude Code hook으로 입력이 필요하거나 응답이 끝났을 때 Mac 기본 효과음을 재생하게 만든 적은 있었다. 그런데 막상 해보니 소리보다 화면에 뜨는 확인 창이 훨씬 덜 놓칠 것 같았다.

그래서 Codex에도 비슷한 기능을 붙였다. Codex Desktop 앱과 터미널 CLI에서 작업이 끝나거나 사용자 응답이 필요해지면 macOS 기본 확인 alert가 뜨게 했다.

<figure>
  <img src="/images/posts/codex-macos-alert-hook/alert.png" alt="Codex 사용자 응답 필요 alert가 macOS 확인 창으로 표시된 화면" width="419" height="133" />
  <figcaption>작업이 멈췄을 때 표시되는 macOS alert.</figcaption>
</figure>

## 시작점은 Claude Code hook

Claude Code에는 `hooks`라는 기능이 있다. 특정 이벤트가 발생했을 때 Shell 명령어를 실행해준다.

예를 들어 `Stop`과 `Notification` 이벤트에 Mac 기본 효과음을 붙이면 응답이 끝났거나 사용자 입력이 필요할 때 소리로 알아차릴 수 있다.

- `Stop`: Claude 응답이나 작업이 완료되었을 때
- `Notification`: 권한 승인처럼 사용자 입력이 필요할 때

전역 설정은 `~/.claude/settings.json`, 프로젝트 설정은 `.claude/settings.json`에 둘 수 있다.

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "afplay /System/Library/Sounds/Glass.aiff"
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "afplay /System/Library/Sounds/Frog.aiff"
          }
        ]
      }
    ]
  }
}
```

이 방식은 가볍고 확실하지만 소리는 상황에 따라 놓치기 쉬웠다. 그래서 macOS alert를 띄우는 쪽으로 방향을 잡았다.

## Codex용 alert hook으로 확장하기

아이디어를 정리할 때는 직접 만든 [peer-clarify](https://github.com/yooss2006/ai-tools/tree/main/.agents/skills/peer-clarify) 스킬을 사용했다. 처음 요청은 이랬다.

```text
Codex 요청이 완료됐거나 권한 확인이 필요할 때 작업이 멈추잖아.
이때 macOS에서 확인을 눌러 종료를 알 수 있는 alert가 뜨게 하고 싶어.
```

대화를 거치고 나니 구현 기준은 이렇게 정리됐다.

```text
Codex Desktop과 터미널 CLI 모두에 적용되는 전역 Codex hook을 만들고,
Codex가 사용자 입력을 기다리는 상태가 되거나 작업이 끝났을 때
macOS display alert를 띄운다.
```

그다음 이 구현 기준을 실제 작업 지시로 바꿀 메타 프롬프트를 요청했다. 생성된 프롬프트는 조금씩 고친 뒤 [lazycodex - momus](https://github.com/code-yeongyu/lazycodex/blob/main/plugins/omo/components/ultrawork/agents/momus.toml) 서브에이전트를 만들어 리뷰를 맡겼다.

컨텍스트를 아끼려고 최종 메타 프롬프트만 새 세션으로 옮겼다. README에는 사용 설명을 넣고, 설치 스크립트로 쉽게 설치할 수 있게 해달라고 요청했다.

그렇게 만들어진 패키지의 핵심은 단순하다. 설치하면 `~/.codex/hooks.json`에 `Stop` hook이 추가되고, hook이 실행될 때 Python 스크립트가 macOS alert를 띄운다.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/bin/zsh -lc 'exec /usr/bin/python3 \"${CODEX_HOME:-$HOME/.codex}/hooks/codex_macos_alert.py\"'",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

hook 스크립트는 Codex가 넘겨준 payload와 마지막 assistant 메시지를 보고 alert 종류를 나눈다.

- 정상 완료: `Codex 작업 완료`
- 사용자 응답 필요: `Codex 사용자 응답 필요`
- 오류 또는 차단: `Codex 확인 필요`

같은 alert가 짧은 시간 안에 반복해서 뜨지 않도록 30초 중복 방지도 넣었다. alert에는 확인 버튼 하나만 남겼고, 아이콘은 햄스터 이미지로 바꿨다.

쓰다가 필요한 기능이 생기거나 예외 케이스를 만나면 계속 다듬어갈 예정이다.

## 설치 방법

이번에 만든 패키지는 [codex-macos-alert-hook](https://github.com/yooss2006/ai-tools/tree/main/hooks/codex-macos-alert-hook)에 저장해두었다.
폴더 안의 install.sh 스크립트를 실행하면 자동으로 설치되며 codex를 재실행해 권한 설정만 진행하면 된다.

```bash
chmod +x install.sh
./install.sh
```

설치 스크립트가 하는 일은 이렇다.

- `~/.codex/hooks/codex_macos_alert.py`로 hook 파일을 복사한다.
- `~/.codex/hooks/hamster-alert-icon.icns`로 alert 아이콘을 복사한다.
- 기존 `~/.codex/hooks.json`이 있으면 백업한다.
- 기존 hook 설정을 유지한 채 `Stop` hook만 추가한다.
- 이미 같은 alert hook이 있으면 중복으로 추가하지 않는다.

작은 기능이지만 유용하다. Codex가 오래 작업하다 멈췄는지, 답변을 기다리는지 바로 알 수 있어서 대기 시간을 놓치는 일이 줄었다.
