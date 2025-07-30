/**
 * ========================================
 * 장바구니 관련 이벤트 핸들러 (순수 함수)
 * ========================================
 *
 * 장바구니와 관련된 이벤트 핸들러들을 순수 함수로 분리합니다.
 * 이벤트 매니저와 함께 사용하여 부수 효과를 최소화합니다.
 */

import { useProductState } from '../product/store/productState.ts';
import { useCartState } from './store/cartState.ts';
import { useUIState } from '../ui/store/uiState.ts';
import { usePointsState } from '../points/store/pointsState.ts';
import { BUSINESS_RULES } from '../../constants/index.ts';
import { calculateCart } from './cartCalculationUtils.ts';
import { calculateStockStatus } from '../stock/stockUtils.ts';
import { handleCalculateCartStuff } from '../order/orderSummaryHandlers.ts';

import {
  CartItemSummary,
  SubtotalSummary,
  BulkDiscountSummary,
  IndividualDiscountSummary,
  TuesdayDiscountSummary,
  ShippingSummary,
} from '../order/SummaryDetails.ts';
import { DiscountInfo } from '../order/DiscountInfo.ts';
import { LoyaltyPoints } from '../points/LoyaltyPoints.ts';

/**
 * 장바구니 계산 및 UI 업데이트 함수
 *
 * 장바구니의 총액, 할인, 포인트를 계산하고 관련 UI를 업데이트합니다.
 * 개별 상품 할인, 대량구매 할인, 화요일 특별 할인을 모두 적용합니다.
 */
// 요약 정보 관련 함수들은 orderSummaryHandlers.ts에서 처리됨
