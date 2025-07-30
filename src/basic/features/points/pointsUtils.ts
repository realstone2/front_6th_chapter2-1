import { BUSINESS_RULES, PRODUCT_IDS } from '../../constants/index.ts';
import { Product } from '../product/productUtils.ts';

/**
 * 장바구니 아이템 타입 정의
 */
export interface CartItem {
  id: string;
  quantity: number;
}

/**
 * 포인트 계산 결과 타입 정의
 */
export interface PointsCalculation {
  basePoints: number;
  tuesdayBonus: number;
  setBonus: number;
  quantityBonus: number;
  totalPoints: number;
  details: string[];
}

/**
 * 기본 포인트 계산 (1000원당 1포인트)
 * @param totalAmount 총 구매 금액
 * @returns 기본 포인트
 */
export const calculateBasePoints = (totalAmount: number): number => {
  return Math.floor(totalAmount / 1000);
};

/**
 * 화요일 보너스 포인트 계산
 * @param basePoints 기본 포인트
 * @param isTuesday 화요일 여부
 * @returns 화요일 보너스 포인트
 */
export const calculateTuesdayBonus = (
  basePoints: number,
  isTuesday: boolean
): number => {
  return isTuesday && basePoints > 0 ? basePoints : 0;
};

/**
 * 세트 구매 보너스 포인트 계산
 * @param cartItems 장바구니 아이템 목록
 * @returns 세트 보너스 포인트
 */
export const calculateSetBonus = (cartItems: CartItem[]): number => {
  const hasKeyboard = cartItems.some(item => item.id === PRODUCT_IDS.KEYBOARD);
  const hasMouse = cartItems.some(item => item.id === PRODUCT_IDS.MOUSE);
  const hasMonitorArm = cartItems.some(
    item => item.id === PRODUCT_IDS.MONITOR_ARM
  );

  // 풀세트 (키보드 + 마우스 + 모니터암)
  if (hasKeyboard && hasMouse && hasMonitorArm) {
    return 100;
  }

  // 키보드 + 마우스 세트
  if (hasKeyboard && hasMouse) {
    return 50;
  }

  return 0;
};

/**
 * 수량별 보너스 포인트 계산
 * @param totalQuantity 총 수량
 * @returns 수량 보너스 포인트
 */
export const calculateQuantityBonus = (totalQuantity: number): number => {
  if (totalQuantity >= 30) {
    return 100;
  } else if (totalQuantity >= 20) {
    return 50;
  } else if (totalQuantity >= 10) {
    return 20;
  }
  return 0;
};

/**
 * 총 포인트 계산
 * @param totalAmount 총 구매 금액
 * @param cartItems 장바구니 아이템 목록
 * @param isTuesday 화요일 여부
 * @returns 포인트 계산 결과
 */
export const calculateTotalPoints = (
  totalAmount: number,
  cartItems: CartItem[],
  isTuesday: boolean
): PointsCalculation => {
  const basePoints = calculateBasePoints(totalAmount);
  const tuesdayBonus = calculateTuesdayBonus(basePoints, isTuesday);
  const setBonus = calculateSetBonus(cartItems);

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const quantityBonus = calculateQuantityBonus(totalQuantity);

  const totalPoints = basePoints + tuesdayBonus + setBonus + quantityBonus;

  const details: string[] = [];

  if (basePoints > 0) {
    details.push(`기본: ${basePoints}p`);
  }

  if (tuesdayBonus > 0) {
    details.push('화요일 2배');
  }

  if (setBonus === 100) {
    details.push('풀세트 구매 +100p');
  } else if (setBonus === 50) {
    details.push('키보드+마우스 세트 +50p');
  }

  if (quantityBonus === 100) {
    details.push('대량구매(30개+) +100p');
  } else if (quantityBonus === 50) {
    details.push('대량구매(20개+) +50p');
  } else if (quantityBonus === 20) {
    details.push('대량구매(10개+) +20p');
  }

  return {
    basePoints,
    tuesdayBonus,
    setBonus,
    quantityBonus,
    totalPoints,
    details,
  };
};

/**
 * 포인트 표시 여부 결정
 * @param cartItems 장바구니 아이템 목록
 * @returns 포인트 표시 여부
 */
export const shouldShowPoints = (cartItems: CartItem[]): boolean => {
  return cartItems.length > 0;
};

/**
 * 포인트 계산 결과를 문자열로 포맷팅
 * @param points 포인트 계산 결과
 * @returns 포맷팅된 문자열
 */
export const formatPointsDisplay = (points: PointsCalculation): string => {
  if (points.totalPoints === 0) {
    return '적립 포인트: 0p';
  }

  const detailsText = points.details.join(', ');
  return `적립 포인트: ${points.totalPoints}p (${detailsText})`;
};
