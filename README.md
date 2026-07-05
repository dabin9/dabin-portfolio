# dabin-portfolio

🔗 Demo: https://dabin-portfolio-six.vercel.app/
📁 Repository: https://github.com/dabin9/dabin-portfolio

프론트엔드 개발자 박다빈의 포트폴리오 사이트입니다.
단순한 소개 페이지가 아니라, 프로젝트 관리, 검색, QA, 방문 추적, 3D 비주얼 요소를 포함한 **Next.js 기반 개인 포트폴리오 웹 애플리케이션**으로 구성했습니다.

## 프로젝트 목적

이 프로젝트는 포트폴리오를 정적인 이력서 형태로 보여주는 데서 끝내지 않고, 실제 서비스처럼 관리하고 확장할 수 있는 구조를 목표로 만들었습니다.

주요 목표는 다음과 같습니다.

* 프로젝트 데이터를 구조화하여 Work 목록과 상세 페이지에 재사용
* 관리자 화면에서 프로젝트 정보를 등록·수정할 수 있는 CRUD 흐름 구현
* QA 검색, Agent 검색, Command Palette 등 탐색 경험 강화
* 방문 추적과 보안 로그를 통해 운영형 웹 애플리케이션 구조 실험
* 기능이 늘어나도 유지보수하기 쉬운 폴더 구조 설계

## Tech Stack

* **Framework**: Next.js
* **Language**: TypeScript
* **UI**: React, Tailwind CSS, styled-components
* **Animation / Visual**: GSAP, Three.js
* **Data / API**: Next.js API Routes, JSON 기반 프로젝트 데이터
* **Architecture**: Feature-based Structure, Entity Layer, Runtime Guard

## 주요 기능

### Work

프로젝트 목록과 상세 페이지를 제공합니다.
프로젝트 데이터는 `entities/project`에서 관리하며, 공개 여부, 태그, 검색 텍스트, 미디어 정보 등을 selector와 model 단위로 분리했습니다.

### Admin Projects

관리자 페이지에서 프로젝트를 등록하고 수정할 수 있는 기능입니다.
폼 입력값 변환, 미디어 옵션, 업로드 처리, 미리보기 UI를 `features/admin-projects` 안에서 관리합니다.

### QA

포트폴리오를 보는 사람이 자주 궁금해할 질문을 검색하고 결과를 확인할 수 있는 기능입니다.
단순 FAQ가 아니라 검색 플로우를 분리하여 확장 가능한 구조로 구성했습니다.

### Agent

키워드 기반으로 포트폴리오 내용을 탐색할 수 있는 검색 UI입니다.
검색 UI, 결과 카드, 키워드 데이터, 검색 로직을 feature 단위로 나누었습니다.

### Analytics

방문 추적과 보안 이벤트 기록을 담당합니다.
운영형 웹 애플리케이션에서 필요한 최소한의 로그 구조를 실험했습니다.

### Site Shell

Header, Footer, ClientShell, CommandPalette 등 전역 레이아웃과 공통 인터랙션을 관리합니다.

## src 구조 설계 기준

`src`는 파일 종류가 아니라 **책임과 변경 범위**를 기준으로 나누었습니다.

라우팅은 `app`, 기능별 화면과 로직은 `features`, 핵심 도메인 모델은 `entities`, 여러 기능에서 함께 쓰는 코드는 `shared`에 둡니다.

```txt
src/
  app/
    admin/
    api/
    blog/
    qa/
    qa-result/
    work/
    layout.tsx
    page.tsx

  features/
    admin/
      lib/

    admin-projects/
      components/
      lib/

    projects/
      components/

    agent/
      components/
      lib/
      model/

    qa/
      components/
      lib/

    analytics/
      components/
      lib/

    home/
      components/
      data/

    contact/
      components/

    blog/
      data/

    site-shell/
      components/

  entities/
    project/
      data/
        projects.json
      model/
        types.ts
        guards.ts
        selectors.ts
        media.ts
        searchText.ts
      repository/
        projectRepository.ts

  shared/
    ui/
    lib/
    config/
```

## 구조 규칙

### app

`app`은 라우팅과 페이지 조립만 담당합니다.
데이터 조회 후 feature 컴포넌트를 배치하는 정도로 얇게 유지했습니다.

### features

`features`는 화면과 기능 단위의 컴포넌트, 훅, 기능 전용 유틸을 관리합니다.
특정 기능에서만 사용하는 코드는 `shared`로 올리지 않고 해당 feature 내부에 둡니다.

### entities

`entities`는 앱 전체에서 기준이 되는 핵심 도메인 모델을 관리합니다.
프로젝트 타입, selector, repository, 런타임 검증 로직을 이 영역에 배치했습니다.

### shared

`shared`는 최소 두 개 이상의 기능에서 함께 사용하는 공용 UI, 설정, 유틸만 둡니다.
단순히 재사용 가능해 보인다는 이유만으로 shared에 올리지 않고, 실제 변경 범위가 여러 기능에 걸칠 때만 이동시켰습니다.

## TypeScript 사용 기준

TypeScript는 모든 코드를 무겁게 만드는 용도가 아니라, **오래 유지될 계약과 실수 비용이 큰 경계**를 보호하는 용도로 사용했습니다.

### 강하게 타입을 적용한 영역

* `entities/project`의 핵심 도메인 타입
* 프로젝트 selector와 repository 로직
* 관리자 프로젝트 저장·수정 기능
* API Route와 외부 입력값 처리
* 여러 feature가 함께 사용하는 props와 data contract

### 가볍게 타입을 적용한 영역

* 단순 표시용 UI 컴포넌트
* 한 feature 내부에서만 사용하는 작은 helper
* 스타일 변경 중심의 컴포넌트

## Runtime Guard

`projects.json`처럼 파일에서 읽는 데이터나, 브라우저와 API를 통해 들어오는 값은 TypeScript 타입만으로 안전성을 보장할 수 없습니다.

그래서 프로젝트 데이터는 `types.ts`의 타입 선언만 믿지 않고, `guards.ts`의 `parseProjects()`를 통해 실제 런타임 값도 검증합니다.

```txt
TypeScript = 컴파일 단계의 계약
Guard = 실행 중 들어온 데이터의 안전장치
```

이 구조를 통해 잘못된 JSON 데이터나 외부 입력값이 들어왔을 때, 화면 렌더링 이전에 문제를 확인할 수 있도록 했습니다.

## ProjectForm 분리

관리자 프로젝트 편집 폼은 입력 항목이 많고 변경 가능성이 높은 영역이기 때문에, 하나의 큰 파일로 유지하지 않고 역할별로 분리했습니다.

```txt
features/admin-projects/components/ProjectForm/
  ProjectForm.tsx
  ContentEditors.tsx
  MediaFields.tsx
  FormControls.tsx
  WorkIndexPreview.tsx
  projectFormUtils.ts
  types.ts
  index.ts
```

### 분리 기준

* `ProjectForm.tsx`: 폼 조립과 submit 흐름
* `ContentEditors.tsx`: Case Notes, Result 에디터
* `MediaFields.tsx`: 미디어 선택과 미리보기
* `FormControls.tsx`: Field, Textarea, Checkbox 등 기본 입력
* `WorkIndexPreview.tsx`: 공개 목록 미리보기
* `projectFormUtils.ts`: 폼 변환용 순수 유틸
* `types.ts`: 폼 내부 타입

이렇게 분리하여 폼이 커져도 수정 범위를 예측하기 쉽고, 여러 영역을 동시에 수정할 때 충돌을 줄일 수 있도록 구성했습니다.

## 설계하면서 중요하게 본 점

이 프로젝트에서 가장 중요하게 본 것은 단순히 화면을 만드는 것이 아니라, 기능이 늘어났을 때도 구조가 무너지지 않게 만드는 것이었습니다.

특히 다음 기준을 지키려고 했습니다.

* 라우팅과 기능 로직을 분리할 것
* 공용화는 필요한 시점에만 할 것
* 핵심 데이터 구조는 entity layer에서 관리할 것
* 외부 입력값은 런타임 검증을 거칠 것
* 큰 폼과 복잡한 UI는 역할별로 나눌 것
* 포트폴리오도 실제 운영 가능한 웹 애플리케이션처럼 설계할 것


이 포트폴리오는 단순 소개 페이지가 아니라,
**프로젝트 데이터 관리, 검색, 관리자 기능, 방문 추적, 구조 설계 기준을 포함한 프론트엔드 웹 애플리케이션**입니다.

UI 구현뿐 아니라, 데이터 구조화, 기능 분리, 타입 안정성, 유지보수성을 함께 고려하여 제작했습니다.
