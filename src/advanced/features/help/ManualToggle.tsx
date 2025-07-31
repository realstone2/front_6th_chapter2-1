import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { uiStateAtom } from '../ui/model/UIModel';

/**
 * 매뉴얼 토글 버튼 컴포넌트
 * UI Model을 직접 구독하여 도움말 모달을 토글합니다.
 * @returns 매뉴얼 토글 버튼 JSX 엘리먼트
 */
export const ManualToggle: React.FC = () => {
  const [uiState, setUIState] = useAtom(uiStateAtom);

  const handleClick = () => {
    setUIState(prev => ({
      ...prev,
      modal: {
        ...prev.modal,
        isManualOpen: !prev.modal.isManualOpen,
        isOverlayVisible: !prev.modal.isManualOpen,
        activeModal: !prev.modal.isManualOpen ? 'manual' : null,
      },
      toggle: {
        ...prev.toggle,
        isManualToggleActive: !prev.modal.isManualOpen,
      },
    }));
  };

  return (
    <button
      id="manual-toggle"
      onClick={handleClick}
      className={`fixed top-4 right-4 p-3 rounded-full transition-colors z-50 ${
        uiState.toggle.isManualToggleActive
          ? 'bg-gray-800 text-white'
          : 'bg-black text-white hover:bg-gray-900'
      }`}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </button>
  );
};
