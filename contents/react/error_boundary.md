---
id: 1
date: '2022-11-29'
title: 'Error Boundary'
categories: 'react'
summary: '하위 컴포넌트 트리의 자바스크립트 에러를 기록하고 폴백 UI를 보여주는 Error Boundary를 알아보자.'
---

## ErrorBoundary 개념

<aside>
Error Boundary는 하위 컴포넌트 트리의 어디에서든 자바스크립트 에러를 기록하며 깨진 컴포넌트 트리 대신 폴백UI를 보여주는 React 컴포넌트입니다.
</aside>

- React 16에서 도입된 기능이다.

### 장점

- 서버 점검, 네트워크 에러 등의 공통 처리 할 수 있는 에러를 한곳에서 처리
- UI 일부분에서 발생한 자바스크립트 에러 때문에 전체 애플리케이션 중단 방지
- 에러 발생시 보여주는 컴포넌트에서 유저가 API 호출을 재시도하여 에러를 리셋할 수 있는 트리거 장치
- 비동기 에러 핸들링을 선언적으로 처리
- 사용자에게 좋은 경험을 주고 에러 핸들링이 용이

## 공식문서 예시

자바스크립트의 try-catch 구문과 유사하게 동작하지만 Error Boundary는 컴포넌트에 적용된다.

**트리** 내에서 하위에 존재하는 컴포넌트의 에러만 포착한다.

- 자체적으로는 에러를 포착할 수는 없음
- Error Boundary가 에러 메시지를 렌더링하는 데에 실패한다면 에러는 그 위의 가장 가까운 에러 경계로 전파된다.

Error Boundary는 **class형 컴포넌트** 를 선언한다.

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    logErrorToMyService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // 폴백 UI를 커스텀하여 렌더링할 수 있습니다.
      return <h1>Something went wrong.</h1>
    }

    return this.props.children
  }
}
```

생명주기 메서드인 `static getDerivedStateFromError()`와 `componentDidCatch()` 를 정의한다.

- `getSnapshotBeforeUpdate()`
  - 가장 마지막으로 렌더링 된 결과가 DOM 등에 반영되었을 때 호출
- `static getDerivedStateFromError()`
  - 에러의 상태를 확인하고, 상태를 바꾸는 역할 수행
  - 하위의 자손 컴포넌트에서 오류가 발생했을 때 render 단계에서 호출
- `componentDidCatch()`
  - 에러 리포팅 서비스에 에러 정보 기록할 수 있다.
  - 하위의 자손 컴포넌트에서 오류가 발생했을 때 commit 단계에서 호출
    - ex) sentry
- `render()`
  - 에러 상태에 따라 보여주는 UI를 결정한다.

```jsx
render단계는 React가 DOM 갱신이 일어날 때 이전과 이후를 비교하며 변경 사항을 계산하는 단계입니다.
commit단계는 React가 비교를 끝내고 DOM에 직접적으로 갱신될 내용을 적용하는 단계입니다.
```

[커스텀 Error Boundary 예시](https://velog.io/@rkd028/React-ErrorBoundary-%EC%82%AC%EC%9A%A9%ED%95%98%EC%97%AC-%EC%97%90%EB%9F%AC-%ED%95%B8%EB%93%A4%EB%A7%81-%ED%95%98%EA%B8%B0)

- Fallback 컴포넌트를 Props로 받아 상황에 따라 다른 컴포넌트를 보여줄 수 있다.

# 카카오 처리 예시

## 기존의 방법으로 에러처리

```jsx
function ProductListPage() {
  return (
    <ProductListFetcher>
      <ProductListContainer />
    </ProductListFetcher>
  )
}
```

ProductListFetcher 컴포넌트가 ProductListContainer 컴포넌트를 감싸고 있다.

```jsx
function ProductListFetcher({ children }) {
  const dispatch = useDispatch()
  const { isLoading, error, data } = useSelector(state => state.productList)

  useEffect(() => {
    dispatch(fetchProductList)
  }, [])

  if (error) {
    return <div>문제가 발생했습니다.</div>
  }
  return children
}
```

ProductListFetcher는

- 비동기적으로 데이터를 받아오기
- 문제가 생기면 에러 처리
- 받아온 데이터를 전역 저장소에 저장

의 역할을 하고 있다.

```jsx
function ProductListContainer() {
  const { data } = useSelector(state => state.productList)

  return (
    <div>
      {data?.map(item => (
        <Product title={item.title} rate={item.rate.toFixed(1)} />
      ))}
    </div>
  )
}
```

이를 통해 ProductListContainer는

- 받아온 데이터를 화면에 보여주기

의 역할만 수행하면 되는 형식이다.
