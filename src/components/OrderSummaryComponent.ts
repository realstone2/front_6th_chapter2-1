interface CartItem {
  id: string;
  name: string;
  val: number;
  originalVal: number;
  q: number;
  onSale: boolean;
  suggestSale: boolean;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  subTotal: number;
  totalAmount: number;
  itemCount: number;
  itemDiscounts: Array<{ name: string; discount: number }>;
  isTuesday: boolean;
  hasBulkDiscount: boolean;
}

export const renderOrderSummary = (props: OrderSummaryProps): string => {
  const {
    cartItems,
    subTotal,
    totalAmount,
    itemCount,
    itemDiscounts,
    isTuesday,
    hasBulkDiscount,
  } = props;

  let summaryHTML = '';

  if (subTotal > 0) {
    // 장바구니 아이템들
    for (const item of cartItems) {
      const itemTotal = item.val * item.q;
      summaryHTML += `
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${item.name} x ${item.q}</span>
          <span>₩${itemTotal.toLocaleString()}</span>
        </div>
      `;
    }

    summaryHTML += `
      <div class="border-t border-white/10 my-3"></div>
      <div class="flex justify-between text-sm tracking-wide">
        <span>Subtotal</span>
        <span>₩${subTotal.toLocaleString()}</span>
      </div>
    `;

    // 대량구매 할인
    if (hasBulkDiscount) {
      summaryHTML += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
          <span class="text-xs">-25%</span>
        </div>
      `;
    } else if (itemDiscounts.length > 0) {
      // 개별 상품 할인
      itemDiscounts.forEach(item => {
        summaryHTML += `
          <div class="flex justify-between text-sm tracking-wide text-green-400">
            <span class="text-xs">${item.name} (10개↑)</span>
            <span class="text-xs">-${item.discount}%</span>
          </div>
        `;
      });
    }

    // 화요일 특별 할인
    if (isTuesday && totalAmount > 0) {
      summaryHTML += `
        <div class="flex justify-between text-sm tracking-wide text-purple-400">
          <span class="text-xs">🌟 화요일 추가 할인</span>
          <span class="text-xs">-10%</span>
        </div>
      `;
    }

    summaryHTML += `
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `;
  }

  return summaryHTML;
};
