/**
 * 장바구니 표시 컴포넌트
 * @returns 장바구니 표시 DOM Element
 */
export function CartDisplay(): HTMLElement {
  const cartDisplay = document.createElement('div');
  cartDisplay.id = 'cart-items';

  return cartDisplay;
}
