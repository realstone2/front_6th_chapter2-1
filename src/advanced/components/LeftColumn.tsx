import React from 'react';
import { SelectorContainer } from '../features/cart/SelectorContainer';
import { CartDisplay } from '../features/cart/CartDisplay';

/**
 * 왼쪽 컬럼 컴포넌트
 * @returns 왼쪽 컬럼 JSX 엘리먼트
 */
export const LeftColumn: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 p-8 overflow-y-auto">
      {/* 선택 컨테이너 */}
      <SelectorContainer />

      {/* 장바구니 표시 영역 */}
      <CartDisplay />
    </div>
  );
};
