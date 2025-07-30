import { addEvent } from '../events/eventManager.ts';
import { useProductState } from '../product/store/productState.ts';
import { CartItem } from './CartItem.ts';
import { handleCalculateCartStuff } from './cartEventHandlers.ts';

/**
 * 장바구니 추가 버튼 컴포넌트
 * @returns 장바구니 추가 버튼 DOM Element
 */
export function AddToCartButton(): HTMLElement {
  const button = document.createElement('button');
  button.id = 'add-to-cart';
  button.textContent = 'Add to Cart';
  button.className =
    'w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all';

  addEvent(button, 'click', () => {
    const productSelector = document.querySelector(
      '#product-select'
    ) as HTMLSelectElement;
    const cartDisplay = document.querySelector('#cart-items') as HTMLElement;

    if (!productSelector || !cartDisplay) return;

    const selItem = productSelector.value;
    const { getState: getProductState, dispatch: productDispatch } =
      useProductState();
    const productState = getProductState();
    const itemToAdd = productState.products.find(p => p.id === selItem);

    if (!selItem || !itemToAdd) {
      return;
    }

    if (itemToAdd.q > 0) {
      const item = document.getElementById(itemToAdd.id);
      if (item) {
        const qtyElem = item.querySelector('.quantity-number');
        if (qtyElem) {
          const newQty = parseInt(qtyElem.textContent || '0') + 1;
          if (newQty <= itemToAdd.q + parseInt(qtyElem.textContent || '0')) {
            qtyElem.textContent = newQty.toString();
            // 상품 도메인 상태에서 재고 감소
            productDispatch({
              type: 'DECREASE_STOCK',
              payload: { productId: itemToAdd.id, quantity: 1 },
            });
          } else {
            alert('재고가 부족합니다.');
          }
        }
      } else {
        const newItem = CartItem({ item: itemToAdd });
        cartDisplay.appendChild(newItem);
        // 상품 도메인 상태에서 재고 감소
        productDispatch({
          type: 'DECREASE_STOCK',
          payload: { productId: itemToAdd.id, quantity: 1 },
        });
      }
      handleCalculateCartStuff();
      // 상품 도메인 상태에서 마지막 선택된 상품 설정
      productDispatch({ type: 'SET_LAST_SELECTED', payload: selItem });
    }
  });

  return button;
}
