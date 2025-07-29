/**
 * 그리드 컨테이너 컴포넌트
 * @returns 그리드 컨테이너 DOM Element
 */
export function GridContainer(): HTMLElement {
  const gridContainer = document.createElement('div');
  gridContainer.className =
    'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';

  return gridContainer;
}
