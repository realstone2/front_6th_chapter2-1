interface HeaderProps {
  itemCount: number;
}

/**
 * 헤더 컴포넌트
 * @param props - 컴포넌트 props
 * @param props.itemCount - 장바구니 아이템 개수
 * @returns 헤더 HTML 문자열
 */
export function Header(props: HeaderProps): HTMLElement {
  const { itemCount } = props;

  const header = document.createElement('div');
  header.className = 'mb-8';
  header.innerHTML = `
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
    <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ ${itemCount} items in cart</p>
  `;

  return header;
}
