/**
 * ========================================
 * 상품 타이머 관련 이벤트 핸들러 (순수 함수)
 * ========================================
 *
 * 상품과 관련된 타이머 이벤트 핸들러들을 순수 함수로 분리합니다.
 * 번개세일, 추천세일 등의 타이머 기능을 관리합니다.
 */

import { useProductState } from './store/productState.ts';
import { TIMER_INTERVALS } from '../../constants/index.ts';
import { onUpdateSelectOptions } from './productEventHandlers.ts';

/**
 * 번개세일 타이머 핸들러
 *
 * 랜덤하게 상품을 선택하여 20% 할인을 적용합니다.
 */
const handleLightningSale = () => {
  const { getState, dispatch } = useProductState();
  const products = getState().products;
  const luckyIdx = Math.floor(Math.random() * products.length);
  const luckyItem = products[luckyIdx];

  if (luckyItem.q > 0 && !luckyItem.onSale) {
    // 상품 도메인 상태에서 번개세일 적용
    const updatedProduct = {
      ...luckyItem,
      val: Math.round((luckyItem.originalVal * 80) / 100),
      onSale: true,
    };
    dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
    alert('⚡번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
    onUpdateSelectOptions();
    // doUpdatePricesInCart는 main.basic.ts에서 처리됨
  }
};

/**
 * 추천세일 타이머 핸들러
 *
 * 마지막 선택된 상품과 다른 상품을 추천하여 5% 할인을 적용합니다.
 */
const handleSuggestedSale = () => {
  const { getState, dispatch } = useProductState();
  const state = getState();
  const lastSelected = state.lastSelected;

  if (lastSelected) {
    let suggest: any = null;
    const products = state.products;

    for (let k = 0; k < products.length; k++) {
      if (products[k].id !== lastSelected) {
        if (products[k].q > 0) {
          if (!products[k].suggestSale) {
            suggest = products[k];
            break;
          }
        }
      }
    }

    if (suggest) {
      alert(
        '💝 ' + suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!'
      );

      // 상품 도메인 상태에서 추천세일 적용
      const updatedProduct = {
        ...suggest,
        val: Math.round((suggest.val * (100 - 5)) / 100),
        suggestSale: true,
      };
      dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
      onUpdateSelectOptions();
      // doUpdatePricesInCart는 main.basic.ts에서 처리됨
    }
  }
};

/**
 * 번개세일 타이머 시작
 */
export const startLightningSaleTimer = () => {
  const lightningDelay = Math.random() * TIMER_INTERVALS.LIGHTNING_SALE_DELAY;
  setTimeout(() => {
    setInterval(handleLightningSale, TIMER_INTERVALS.LIGHTNING_SALE_INTERVAL);
  }, lightningDelay);
};

/**
 * 추천세일 타이머 시작
 */
export const startSuggestedSaleTimer = () => {
  const suggestedSaleDelay =
    Math.random() * TIMER_INTERVALS.SUGGESTED_SALE_DELAY;
  setTimeout(() => {
    setInterval(handleSuggestedSale, TIMER_INTERVALS.SUGGESTED_SALE_INTERVAL);
  }, suggestedSaleDelay);
};
