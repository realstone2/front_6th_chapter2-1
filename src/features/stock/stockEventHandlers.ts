/**
 * ========================================
 * 재고 관련 이벤트 핸들러 (순수 함수)
 * ========================================
 *
 * 재고와 관련된 이벤트 핸들러들을 순수 함수로 분리합니다.
 * 재고 계산, 재고 정보 업데이트 등의 기능을 관리합니다.
 */

import { useProductState } from '../product/store/productState.ts';
import { BUSINESS_RULES } from '../../constants/index.ts';
import { calculateStockStatus } from './stockUtils.ts';

/**
 * 재고 정보 업데이트
 *
 * 재고 부족 또는 품절 상태인 상품들의 정보를 수집하고
 * UI에 표시합니다.
 */
export const handleStockInfoUpdate = (): void => {
  const stockInformation = document.querySelector(
    '#stock-status'
  ) as HTMLElement;
  if (!stockInformation) return;

  const products = useProductState().getState().products;
  const stockStatus = calculateStockStatus(products);

  // 재고 정보 UI 업데이트
  stockInformation.textContent = stockStatus.stockMessage;
};
