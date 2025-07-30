/**
 * ========================================
 * 상품 관련 이벤트 핸들러 (순수 함수)
 * ========================================
 *
 * 상품과 관련된 이벤트 핸들러들을 순수 함수로 분리합니다.
 * 이벤트 매니저와 함께 사용하여 부수 효과를 최소화합니다.
 */

import { useProductState } from './store/productState.ts';
import { calculateTotalStock } from '../stock/stockUtils.ts';
import {
  createProductOptions,
  getDropdownBorderColor,
  renderProductOptions,
} from './productOptionUtils.ts';

/**
 * 상품 선택 옵션 업데이트
 *
 * 상품 목록을 기반으로 드롭다운 옵션을 생성하고 업데이트합니다.
 * 할인 상태, 품절 상태에 따라 옵션 텍스트와 스타일을 변경합니다.
 */
export const onUpdateSelectOptions = () => {
  const productSelector = document.querySelector(
    '#product-select'
  ) as HTMLSelectElement;
  if (!productSelector) return;

  // 드롭다운 초기화
  productSelector.innerHTML = '';

  // 상품 도메인 상태에서 상품 목록 가져오기
  const state = useProductState().getState();
  const products = state.products;

  // 전체 재고 계산
  const totalStock = calculateTotalStock(products);

  // 상품 옵션 생성 및 렌더링
  const productOptions = createProductOptions(products);
  const optionsHTML = renderProductOptions(productOptions);
  productSelector.innerHTML = optionsHTML;

  // 재고 부족 시 드롭다운 테두리 색상 변경
  const borderColor = getDropdownBorderColor(totalStock);
  productSelector.style.borderColor = borderColor;

  // 마지막 선택된 상품이 있으면 선택
  const lastSelected = state.lastSelected;
  if (lastSelected) {
    productSelector.value = lastSelected;
  }
};
