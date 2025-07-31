import React from 'react';
import { LeftColumn } from './LeftColumn';
import { OrderSummary } from '../features/order/OrderSummary';

/**
 * 그리드 컨테이너 컴포넌트
 * @returns 그리드 컨테이너 JSX 엘리먼트
 */
export const GridContainer: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden">
      {/* 왼쪽 컬럼 */}
      <LeftColumn />

      {/* 주문 요약 영역 */}
      <OrderSummary />
    </div>
  );
};
