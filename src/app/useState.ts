// 간단한 useState 함수 구현 (React의 useState와 유사하게 동작)
// 상태와 상태를 변경하는 setter를 반환합니다.

type SetStateAction<S> = S | ((prevState: S) => S);

export function useState<S>(
  initialValue: S
): [() => S, (value: SetStateAction<S>) => void] {
  let state = initialValue;

  // 상태를 읽는 getter 함수
  const get = () => state;

  // 상태를 변경하는 setter 함수
  const set = (value: SetStateAction<S>) => {
    if (typeof value === 'function') {
      // 함수형 업데이트 지원
      // @ts-ignore
      state = (value as (prevState: S) => S)(state);
    } else {
      state = value;
    }
  };

  return [get, set];
}
