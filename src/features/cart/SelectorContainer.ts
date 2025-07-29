/**
 * 선택 컨테이너 컴포넌트
 * @returns 선택 컨테이너 DOM Element
 */
export function SelectorContainer(): HTMLElement {
  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'mb-6 pb-6 border-b border-gray-200';

  return selectorContainer;
}
