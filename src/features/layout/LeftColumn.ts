import { SelectorContainer } from '../cart/SelectorContainer.ts';
import { CartDisplay } from '../cart/CartDisplay.ts';

/**
 * 왼쪽 컬럼 컴포넌트
 * @returns 왼쪽 컬럼 DOM Element
 */
export function LeftColumn(): HTMLElement {
  const leftColumn = document.createElement('div');
  leftColumn.className = 'bg-white border border-gray-200 p-8 overflow-y-auto';

  // 선택 컨테이너 생성 및 추가
  const selectorContainer = SelectorContainer();
  leftColumn.appendChild(selectorContainer);

  // 장바구니 표시 영역 생성 및 추가
  const cartDisplay = CartDisplay();
  leftColumn.appendChild(cartDisplay);

  return leftColumn;
}
