/**
 * 매뉴얼 토글 버튼 컴포넌트
 * @returns 매뉴얼 토글 버튼 DOM Element
 */
export function ManualToggle(): HTMLElement {
  const toggle = document.createElement('button');
  toggle.id = 'manual-toggle';
  toggle.className =
    'fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50';
  toggle.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  `;

  return toggle;
}
