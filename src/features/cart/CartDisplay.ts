import { addEvent } from '../events/eventManager.ts';
import { useProductState } from '../product/store/productState.ts';
import { BUSINESS_RULES } from '../../constants/index.ts';
import { handleCalculateCartStuff } from './cartEventHandlers.ts';

/**
 * 장바구니 표시 컴포넌트
 * @returns 장바구니 표시 DOM Element
 */
export function CartDisplay(): HTMLElement {
  const cartDisplay = document.createElement('div');
  cartDisplay.id = 'cart-items';

  addEvent(cartDisplay, 'click', function (event) {
    const tgt = event.target as HTMLElement;
    if (
      tgt.classList.contains('quantity-change') ||
      tgt.classList.contains('remove-item')
    ) {
      const prodId = tgt.dataset.productId;
      if (!prodId) return;

      const itemElem = document.getElementById(prodId);
      const { getState: getProductState, dispatch: productDispatch } =
        useProductState();
      const productState = getProductState();
      const prod = productState.products.find(p => p.id === prodId);

      if (!itemElem || !prod) return;

      if (tgt.classList.contains('quantity-change')) {
        const qtyChange = parseInt(tgt.dataset.change || '0');
        const qtyElem = itemElem.querySelector('.quantity-number');
        if (!qtyElem) return;

        const currentQty = parseInt(qtyElem.textContent || '0');
        const newQty = currentQty + qtyChange;
        if (newQty > 0 && newQty <= prod.q + currentQty) {
          qtyElem.textContent = newQty.toString();
          // 상품 도메인 상태에서 재고 조정
          if (qtyChange > 0) {
            productDispatch({
              type: 'DECREASE_STOCK',
              payload: { productId: prodId, quantity: qtyChange },
            });
          } else {
            productDispatch({
              type: 'INCREASE_STOCK',
              payload: { productId: prodId, quantity: Math.abs(qtyChange) },
            });
          }
        } else if (newQty <= 0) {
          // 상품 도메인 상태에서 재고 복원
          productDispatch({
            type: 'INCREASE_STOCK',
            payload: { productId: prodId, quantity: currentQty },
          });
          itemElem.remove();
        } else {
          alert('재고가 부족합니다.');
        }
      } else if (tgt.classList.contains('remove-item')) {
        const qtyElem = itemElem.querySelector('.quantity-number');
        if (!qtyElem) return;

        const remQty = parseInt(qtyElem.textContent || '0');
        // 상품 도메인 상태에서 재고 복원
        productDispatch({
          type: 'INCREASE_STOCK',
          payload: { productId: prodId, quantity: remQty },
        });
        itemElem.remove();
      }
      if (prod && prod.q < BUSINESS_RULES.LOW_STOCK_THRESHOLD) {
        // Handle low stock scenario if needed
      }
      handleCalculateCartStuff();
      // onUpdateSelectOptions는 main.basic.ts에서 처리됨
    }
  });

  return cartDisplay;
}
