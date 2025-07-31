import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { uiStateAtom } from '../ui/model/UIModel';
import { ManualColumn } from './ManualColumn';

/**
 * 매뉴얼 오버레이 컴포넌트
 * UI Model을 직접 구독하여 모달 오버레이를 관리합니다.
 * @returns 매뉴얼 오버레이 JSX 엘리먼트
 */
export const ManualOverlay: React.FC = () => {
  const [uiState, setUIState] = useAtom(uiStateAtom);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setUIState(prev => ({
        ...prev,
        modal: {
          ...prev.modal,
          isManualOpen: false,
          isOverlayVisible: false,
          activeModal: null,
        },
        toggle: {
          ...prev.toggle,
          isManualToggleActive: false,
        },
      }));
    }
  };

  if (!uiState.modal.isOverlayVisible) {
    return null;
  }

  return (
    <div
      id="manual-overlay"
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
    >
      <ManualColumn />
    </div>
  );
};
