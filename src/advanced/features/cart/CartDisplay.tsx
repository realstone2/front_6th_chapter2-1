import React from 'react';

/**
 * 장바구니 표시 컴포넌트
 * @returns 장바구니 표시 JSX 엘리먼트
 */
export const CartDisplay: React.FC = () => {
  // TODO: 장바구니 아이템 상태 관리 및 이벤트 처리는 다음 Phase에서 구현

  return (
    <div id="cart-items">
      {/* 장바구니 아이템들이 동적으로 표시될 영역 */}
      <div className="text-gray-500 text-center py-8">
        장바구니가 비어있습니다
      </div>
    </div>
  );
};
