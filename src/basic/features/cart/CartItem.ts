interface CartItemProps {
  item: {
    id: string;
    name: string;
    val: number;
    originalVal: number;
    q: number;
    onSale: boolean;
    suggestSale: boolean;
  };
}

/**
 * 장바구니 아이템 컴포넌트
 * @param props - 컴포넌트 props
 * @param props.item - 상품 정보
 * @returns 장바구니 아이템 DOM Element
 */
export function CartItem(props: CartItemProps): HTMLElement {
  const { item } = props;

  const cartItem = document.createElement('div');
  cartItem.id = item.id;
  cartItem.className =
    'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';

  // 할인 상태에 따른 아이콘과 가격 표시
  const discountIcon =
    item.onSale && item.suggestSale
      ? '⚡💝'
      : item.onSale
        ? '⚡'
        : item.suggestSale
          ? '💝'
          : '';

  const priceDisplay =
    item.onSale || item.suggestSale
      ? `<span class="line-through text-gray-400">₩${item.originalVal.toLocaleString()}</span> <span class="${item.onSale && item.suggestSale ? 'text-purple-600' : item.onSale ? 'text-red-500' : 'text-blue-500'}">₩${item.val.toLocaleString()}</span>`
      : `₩${item.val.toLocaleString()}`;

  cartItem.innerHTML = `
    <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
      <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
    </div>
    <div>
      <h3 class="text-base font-normal mb-1 tracking-tight">${discountIcon}${item.name}</h3>
      <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
      <p class="text-xs text-black mb-3">${priceDisplay}</p>
      <div class="flex items-center gap-4">
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${item.id}" data-change="-1">−</button>
        <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${item.id}" data-change="1">+</button>
      </div>
    </div>
    <div class="text-right">
      <div class="text-lg mb-2 tracking-tight tabular-nums">${priceDisplay}</div>
      <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${item.id}">Remove</a>
    </div>
  `;

  return cartItem;
}
