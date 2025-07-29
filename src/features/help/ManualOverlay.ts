/**
 * 매뉴얼 오버레이 컴포넌트
 * @returns 매뉴얼 오버레이 DOM Element
 */
export function ManualOverlay(): HTMLElement {
  const manualOverlay = document.createElement('div');
  manualOverlay.className =
    'fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300';

  return manualOverlay;
}
