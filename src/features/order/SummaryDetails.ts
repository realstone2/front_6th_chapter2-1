interface CartItem {
  id: string;
  name: string;
  val: number;
  originalVal: number;
  q: number;
  onSale: boolean;
  suggestSale: boolean;
}

interface SummaryDetailsProps {
  cartItems: CartItem[];
  subTotal: number;
  itemCount: number;
  itemDiscounts: Array<{ name: string; discount: number }>;
  isTuesday: boolean;
  hasBulkDiscount: boolean;
}

/**
 * 장바구니 아이템 요약 컴포넌트
 */
export function CartItemSummary(props: {
  item: CartItem;
  quantity: number;
}): string {
  const { item, quantity } = props;
  const itemTotal = item.val * quantity;

  return `
    <div class="flex justify-between text-xs tracking-wide text-gray-400">
      <span>${item.name} x ${quantity}</span>
      <span>₩${itemTotal.toLocaleString()}</span>
    </div>
  `;
}

/**
 * 서브토탈 컴포넌트
 */
export function SubtotalSummary(props: { subTotal: number }): string {
  const { subTotal } = props;

  return `
    <div class="border-t border-white/10 my-3"></div>
    <div class="flex justify-between text-sm tracking-wide">
      <span>Subtotal</span>
      <span>₩${subTotal.toLocaleString()}</span>
    </div>
  `;
}

/**
 * 대량구매 할인 컴포넌트
 */
export function BulkDiscountSummary(): string {
  return `
    <div class="flex justify-between text-sm tracking-wide text-green-400">
      <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
      <span class="text-xs">-25%</span>
    </div>
  `;
}

/**
 * 개별 상품 할인 컴포넌트
 */
export function IndividualDiscountSummary(props: {
  itemDiscounts: Array<{ name: string; discount: number }>;
}): string {
  const { itemDiscounts } = props;

  return itemDiscounts
    .map(
      item => `
    <div class="flex justify-between text-sm tracking-wide text-green-400">
      <span class="text-xs">${item.name} (10개↑)</span>
      <span class="text-xs">-${item.discount}%</span>
    </div>
  `
    )
    .join('');
}

/**
 * 화요일 할인 컴포넌트
 */
export function TuesdayDiscountSummary(): string {
  return `
    <div class="flex justify-between text-sm tracking-wide text-purple-400">
      <span class="text-xs">🌟 화요일 추가 할인</span>
      <span class="text-xs">-10%</span>
    </div>
  `;
}

/**
 * 배송 정보 컴포넌트
 */
export function ShippingSummary(): string {
  return `
    <div class="flex justify-between text-sm tracking-wide text-gray-400">
      <span>Shipping</span>
      <span>Free</span>
    </div>
  `;
}
