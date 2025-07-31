import React from 'react';
import { ManualColumn } from './ManualColumn';

/**
 * 매뉴얼 오버레이 컴포넌트
 * @returns 매뉴얼 오버레이 JSX 엘리먼트
 */
export const ManualOverlay: React.FC = () => {
  // TODO: 오버레이 클릭 이벤트 및 모달 상태 관리는 다음 Phase에서 구현

  const handleOverlayClick = (e: React.MouseEvent) => {
    // 오버레이 클릭 시 모달 닫기 로직은 다음 Phase에서 구현
    if (e.target === e.currentTarget) {
      console.log('Overlay clicked - close modal');
    }
  };

  return (
    <div
      id="manual-overlay"
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300"
    >
      <ManualColumn />
    </div>
  );
};
