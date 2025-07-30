import { addEvent } from '../events/eventManager';
import { ManualColumn } from '../help/ManualColumn';
import { ManualOverlay } from '../help/ManualOverlay';
import { ManualToggle } from '../help/ManualToggle';
import { useUIState } from '../ui/store/uiState';

export function ManualSection() {
  const fragment = document.createDocumentFragment();
  // 매뉴얼 토글 버튼 생성 및 추가
  const manualToggle = ManualToggle();
  // 매뉴얼 오버레이 생성 및 추가
  const manualOverlay = ManualOverlay();

  // 매뉴얼 컬럼 생성 및 추가
  const manualColumn = ManualColumn();
  manualOverlay.appendChild(manualColumn);

  fragment.appendChild(manualToggle);

  fragment.appendChild(manualOverlay);

  addEvent(manualToggle, 'click', () => {
    const { getState: getUIState, dispatch: uiDispatch } = useUIState();
    const uiState = getUIState();

    if (uiState.modal.isManualOpen) {
      uiDispatch({ type: 'CLOSE_MANUAL_MODAL' });
      manualOverlay.classList.add('hidden');
      manualColumn.classList.add('translate-x-full');
    } else {
      uiDispatch({ type: 'OPEN_MANUAL_MODAL' });
      manualOverlay.classList.remove('hidden');
      manualColumn.classList.remove('translate-x-full');
    }
  });

  addEvent(manualOverlay, 'click', e => {
    if (e.target === manualOverlay) {
      const { dispatch: uiDispatch } = useUIState();
      uiDispatch({ type: 'CLOSE_MANUAL_MODAL' });
      manualOverlay.classList.add('hidden');
      manualColumn.classList.add('translate-x-full');
    }
  });

  return fragment;
}
