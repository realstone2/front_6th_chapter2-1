import { LeftColumn } from './LeftColumn.ts';
import { OrderSummary } from '../order/OrderSummary.ts';

/**
 * 그리드 컨테이너 컴포넌트
 * @returns 그리드 컨테이너 DOM Element
 */
export function GridContainer(): HTMLElement {
  const gridContainer = document.createElement('div');
  gridContainer.className =
    'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';

  // 왼쪽 컬럼 생성 및 추가
  const leftColumn = LeftColumn();
  gridContainer.appendChild(leftColumn);

  // 주문 요약 영역 생성 및 추가
  const rightColumn = OrderSummary();
  gridContainer.appendChild(rightColumn);

  return gridContainer;
}
