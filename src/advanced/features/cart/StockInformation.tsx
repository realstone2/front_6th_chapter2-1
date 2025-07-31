import React from 'react';

/**
 * 재고 정보 컴포넌트
 * @returns 재고 정보 JSX 엘리먼트
 */
export const StockInformation: React.FC = () => {
  // TODO: 재고 상태 관리는 다음 Phase에서 구현

  return (
    <div
      id="stock-status"
      className="text-xs text-red-500 mt-3 whitespace-pre-line"
    >
      {/* 재고 정보는 상태 관리와 함께 다음 Phase에서 구현 */}
      재고 정보 로딩 중...
    </div>
  );
};
