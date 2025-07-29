import { ManualColumn } from './ManualColumn.ts';

/**
 * 매뉴얼 오버레이 컴포넌트
 * @returns 매뉴얼 오버레이 DOM Element
 */
export function ManualOverlay(): HTMLElement {
  const manualOverlay = document.createElement('div');
  manualOverlay.id = 'manual-overlay';
  manualOverlay.className =
    'fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300';

  // 매뉴얼 컬럼 생성 및 추가
  const manualColumn = ManualColumn();
  manualOverlay.appendChild(manualColumn);

  return manualOverlay;
}
