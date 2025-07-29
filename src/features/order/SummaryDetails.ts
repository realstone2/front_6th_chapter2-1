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
}): HTMLElement {
  const { item, quantity } = props;
  const itemTotal = item.val * quantity;

  const element = document.createElement('div');
  element.className =
    'flex justify-between text-xs tracking-wide text-gray-400';
  element.innerHTML = `
    <span>${item.name} x ${quantity}</span>
    <span>₩${itemTotal.toLocaleString()}</span>
  `;

  return element;
}

/**
 * 서브토탈 컴포넌트
 */
export function SubtotalSummary(props: { subTotal: number }): HTMLElement {
  const { subTotal } = props;

  const element = document.createElement('div');
  element.innerHTML = `
    <div class="border-t border-white/10 my-3"></div>
    <div class="flex justify-between text-sm tracking-wide">
      <span>Subtotal</span>
      <span>₩${subTotal.toLocaleString()}</span>
    </div>
  `;

  return element;
}

/**
 * 대량구매 할인 컴포넌트
 */
export function BulkDiscountSummary(): HTMLElement {
  const element = document.createElement('div');
  element.className =
    'flex justify-between text-sm tracking-wide text-green-400';
  element.innerHTML = `
    <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
    <span class="text-xs">-25%</span>
  `;

  return element;
}

/**
 * 개별 상품 할인 컴포넌트
 */
export function IndividualDiscountSummary(props: {
  itemDiscounts: Array<{ name: string; discount: number }>;
}): HTMLElement {
  const { itemDiscounts } = props;

  const container = document.createElement('div');
  itemDiscounts.forEach(item => {
    const element = document.createElement('div');
    element.className =
      'flex justify-between text-sm tracking-wide text-green-400';
    element.innerHTML = `
      <span class="text-xs">${item.name} (10개↑)</span>
      <span class="text-xs">-${item.discount}%</span>
    `;
    container.appendChild(element);
  });

  return container;
}

/**
 * 화요일 할인 컴포넌트
 */
export function TuesdayDiscountSummary(): HTMLElement {
  const element = document.createElement('div');
  element.className =
    'flex justify-between text-sm tracking-wide text-purple-400';
  element.innerHTML = `
    <span class="text-xs">🌟 화요일 추가 할인</span>
    <span class="text-xs">-10%</span>
  `;

  return element;
}

/**
 * 배송 정보 컴포넌트
 */
export function ShippingSummary(): HTMLElement {
  const element = document.createElement('div');
  element.className =
    'flex justify-between text-sm tracking-wide text-gray-400';
  element.innerHTML = `
    <span>Shipping</span>
    <span>Free</span>
  `;

  return element;
}
