interface CartItem {
  id: string;
  name: string;
  val: number;
  originalVal: number;
  q: number;
  onSale: boolean;
  suggestSale: boolean;
}

interface PriceDisplayProps {
  product: CartItem;
}

/**
 * 가격 표시 컴포넌트
 * @param props - 컴포넌트 props
 * @param props.product - 상품 정보
 * @returns 가격 HTML 문자열
 */
export function PriceDisplay(props: PriceDisplayProps): string {
  const { product } = props;

  if (product.onSale && product.suggestSale) {
    // 번개세일 + 추천할인 중복 적용
    return `
      <span class="line-through text-gray-400">₩${product.originalVal.toLocaleString()}</span> 
      <span class="text-purple-600">₩${product.val.toLocaleString()}</span>
    `;
  } else if (product.onSale) {
    // 번개세일만 적용
    return `
      <span class="line-through text-gray-400">₩${product.originalVal.toLocaleString()}</span> 
      <span class="text-red-500">₩${product.val.toLocaleString()}</span>
    `;
  } else if (product.suggestSale) {
    // 추천할인만 적용
    return `
      <span class="line-through text-gray-400">₩${product.originalVal.toLocaleString()}</span> 
      <span class="text-blue-500">₩${product.val.toLocaleString()}</span>
    `;
  } else {
    // 할인 없음
    return `₩${product.val.toLocaleString()}`;
  }
}
