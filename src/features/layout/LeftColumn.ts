/**
 * 왼쪽 컬럼 컴포넌트
 * @returns 왼쪽 컬럼 DOM Element
 */
export function LeftColumn(): HTMLElement {
  const leftColumn = document.createElement('div');
  leftColumn.className = 'bg-white border border-gray-200 p-8 overflow-y-auto';

  return leftColumn;
}
