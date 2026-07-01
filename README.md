# dabin

## src 구조

`src`는 파일 종류가 아니라 **책임과 변경 범위**를 기준으로 정리합니다. 라우팅은 `app`, 기능별 화면과 로직은 `features`, 핵심 도메인은 `entities`, 여러 기능이 함께 쓰는 코드는 `shared`에 둡니다.

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
      lib/                 # admin 인증/접근 제어

    admin-projects/
      components/          # 관리자 프로젝트 CRUD UI
      lib/                 # 프로젝트 폼 변환, 미디어 옵션, 업로드

    projects/
      components/          # 공개 Work 목록/상세 렌더링

    agent/
      components/          # Agent 검색 UI/결과 카드
      lib/                 # Agent 검색 로직
      model/               # Agent 사전/키워드 데이터

    qa/
      components/          # QA 검색/결과 UI
      lib/                 # QA run/search 로직

    analytics/
      components/          # VisitTracker
      lib/                 # 방문/보안 로그

    home/
      components/          # 홈 전용 섹션
      data/                # 홈 스킬 데이터

    contact/
      components/          # Contact 섹션/3D 비주얼

    blog/
      data/                # 블로그 노트 데이터

    site-shell/
      components/          # Header, Footer, ClientShell, CommandPalette 등

  entities/
    project/
      data/
        projects.json      # 프로젝트 원본 데이터
      model/
        types.ts           # Project 타입
        guards.ts          # 외부 JSON/저장소 데이터 런타임 검증
        selectors.ts       # publicProjects, allTags 등
        media.ts
        searchText.ts
      repository/
        projectRepository.ts

  shared/
    ui/                    # 진짜 공용 UI
    lib/                   # 공용 유틸
    config/                # site/env 설정
```

### 구조 규칙

- `app/`은 라우팅과 페이지 조립만 담당합니다. 데이터 조회 후 feature 컴포넌트를 배치하는 정도로 얇게 유지합니다.
- `features/`는 화면/기능 단위의 컴포넌트, 훅, 기능 전용 유틸을 둡니다.
- `entities/`는 핵심 도메인 모델, selector, 저장소 로직처럼 앱 전체의 기준이 되는 코드를 둡니다.
- `shared/`는 최소 두 개 이상의 기능에서 함께 쓰는 공용 UI, 설정, 유틸만 둡니다.
- 특정 기능에서만 쓰는 코드는 `shared`로 올리지 않고 해당 `features/<feature-name>` 안에 둡니다.
- 큰 폼이나 에디터는 한 파일에 계속 키우지 않고, 같은 feature 폴더 안에서 섹션별 컴포넌트와 유틸로 나눕니다.

### TypeScript 사용 기준

TypeScript는 모든 코드를 무겁게 만드는 용도가 아니라, **오래 유지될 계약과 실수 비용이 큰 경계**를 보호하는 용도로 씁니다.

강하게 타입을 거는 영역:

- `entities/project`: `Project` 같은 핵심 도메인 타입, selector, 저장소 로직
- `features/admin-projects`: 프로젝트 저장/수정처럼 데이터가 변하는 관리자 기능
- API route와 repository: 외부 입력, JSON, GitHub 저장소, 파일 시스템을 오가는 경계
- 여러 feature가 함께 쓰는 props/data contract

가볍게 타입을 쓰는 영역:

- 단순 표시용 UI 컴포넌트
- 한 feature 안에서만 쓰는 작은 helper
- 스타일 변경 중심의 컴포넌트

런타임 검증이 필요한 영역:

- `projects.json`처럼 파일에서 읽는 데이터
- GitHub Contents API에서 받아오는 JSON
- `FormData`, API body처럼 브라우저나 외부에서 들어오는 값

그래서 프로젝트 데이터는 `types.ts`의 타입만 믿지 않고, `guards.ts`의 `parseProjects()`를 통해 실제 값도 검사합니다. TypeScript는 컴파일 단계의 계약이고, guard는 실행 중 들어온 데이터의 안전장치입니다.

### 주요 기능 영역

- `features/admin-projects`: 관리자 프로젝트 CRUD와 프로젝트 편집 UI
- `features/projects`: 공개 Work 목록/상세 페이지 렌더링
- `features/agent`: 포트폴리오 Agent 검색과 결과 카드
- `features/qa`: QA 검색과 결과 플로우
- `features/analytics`: 방문 추적과 보안 이벤트 기록
- `features/site-shell`: Header, Footer, ClientShell, CommandPalette 같은 전역 껍데기 UI

### ProjectForm 분리

관리자 프로젝트 편집 폼은 여러 사람이 동시에 수정해도 충돌이 덜 나도록 전용 폴더 안에서 역할별로 나눕니다.

```txt
features/admin-projects/components/ProjectForm/
  ProjectForm.tsx          # 폼 조립/submit 흐름
  ContentEditors.tsx       # Case Notes, Result 에디터
  MediaFields.tsx          # 미디어 선택/미리보기
  FormControls.tsx         # Field, Textarea, Checkbox 등 기본 입력
  WorkIndexPreview.tsx     # 공개 목록 미리보기
  projectFormUtils.ts      # 순수 유틸
  types.ts
  index.ts
```
