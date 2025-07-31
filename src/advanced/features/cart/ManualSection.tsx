import React from 'react';
import { ManualToggle } from '../help/ManualToggle';
import { ManualOverlay } from '../help/ManualOverlay';

/**
 * 매뉴얼 섹션 컴포넌트
 * @returns 매뉴얼 섹션 JSX 엘리먼트
 */
export const ManualSection: React.FC = () => {
  // TODO: 매뉴얼 모달 상태 관리는 다음 Phase에서 구현

  return (
    <>
      {/* 매뉴얼 토글 버튼 */}
      <ManualToggle />

      {/* 매뉴얼 오버레이 */}
      <ManualOverlay />
    </>
  );
};
