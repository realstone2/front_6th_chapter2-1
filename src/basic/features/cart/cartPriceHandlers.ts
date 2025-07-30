/**
 * ========================================
 * 장바구니 가격 업데이트 관련 이벤트 핸들러 (순수 함수)
 * ========================================
 *
 * 장바구니 내 상품 가격 업데이트와 관련된 이벤트 핸들러들을 순수 함수로 분리합니다.
 * 할인 상태에 따른 가격과 이름 업데이트를 관리합니다.
 */

import { useProductState } from '../product/store/productState.ts';
import { PriceDisplay } from './PriceDisplay.ts';
import { handleCalculateCartStuff } from '../order/orderSummaryHandlers.ts';

/**
 * 상품 ID로 상품 정보 찾기
 * @param itemId 상품 ID
 * @returns 상품 정보 또는 null
 */
const getProductById = (itemId: string) => {
  const { getState } = useProductState();
  const products = getState().products;
  return products.find(p => p.id === itemId) || null;
};

/**
 * 장바구니 내 상품 가격 업데이트
 *
 * 할인 상태에 따라 장바구니에 표시된 상품들의
 * 가격과 이름을 업데이트합니다.
 */
export const doUpdatePricesInCart = (): void => {
  const cartDisplay = document.querySelector('#cart-items') as HTMLElement;
  if (!cartDisplay) return;

  const cartItems = cartDisplay.children;

  for (let i = 0; i < cartItems.length; i++) {
    const itemId = (cartItems[i] as HTMLElement).id;
    // 상품 도메인 상태에서 상품 정보 찾기
    const product = getProductById(itemId);

    if (product) {
      const priceDiv = (cartItems[i] as HTMLElement).querySelector('.text-lg');
      const nameDiv = (cartItems[i] as HTMLElement).querySelector('h3');

      if (priceDiv && nameDiv) {
        // 할인 상태에 따른 UI 업데이트
        priceDiv.innerHTML = '';
        priceDiv.appendChild(PriceDisplay({ product }));

        if (product.onSale && product.suggestSale) {
          nameDiv.textContent = '⚡💝' + product.name;
        } else if (product.onSale) {
          nameDiv.textContent = '⚡' + product.name;
        } else if (product.suggestSale) {
          nameDiv.textContent = '💝' + product.name;
        } else {
          nameDiv.textContent = product.name;
        }
      }
    }
  }

  // 가격 변경 후 장바구니 재계산
  handleCalculateCartStuff();
};
