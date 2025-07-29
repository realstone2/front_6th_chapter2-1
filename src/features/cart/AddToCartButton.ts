/**
 * 장바구니 추가 버튼 컴포넌트
 * @returns 장바구니 추가 버튼 DOM Element
 */
export function AddToCartButton(): HTMLElement {
  const button = document.createElement('button');
  button.textContent = 'Add to Cart';
  button.className =
    'w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all';
  return button;
}
