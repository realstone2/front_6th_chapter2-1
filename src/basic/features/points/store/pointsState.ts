/**
 * ========================================
 * 포인트 도메인 전역 상태 관리 (useReducer 스타일)
 * ========================================
 *
 * React의 useReducer처럼 단일 함수로 모든 포인트 상태 관리를 처리합니다.
 * 나중에 React로 마이그레이션 시 useReducer로 쉽게 변환할 수 있습니다.
 */

import { CartItem } from '../pointsUtils.ts';

/**
 * 포인트 계산 결과 타입 정의
 */
export interface PointsCalculation {
  basePoints: number;
  tuesdayBonus: number;
  setBonus: number;
  fullSetBonus: number;
  quantityBonus: number;
  totalPoints: number;
  details: string[];
}

/**
 * 포인트 도메인 상태 인터페이스
 */
interface PointsState {
  // 현재 포인트 정보
  currentPoints: {
    total: number;
    calculation: PointsCalculation | null;
    lastCalculated: Date | null;
  };

  // 포인트 적립 내역
  history: Array<{
    id: string;
    amount: number;
    type: 'purchase' | 'bonus' | 'expired' | 'used';
    description: string;
    date: Date;
  }>;

  // 포인트 설정
  settings: {
    baseRate: number; // 기본 적립률 (1000원당 1포인트)
    tuesdayMultiplier: number; // 화요일 배수
    setBonusAmount: number; // 세트 보너스 포인트
    fullSetBonusAmount: number; // 풀세트 보너스 포인트
    quantityBonuses: Array<{
      threshold: number;
      bonus: number;
      description: string;
    }>;
  };

  // 포인트 표시 설정
  display: {
    isVisible: boolean;
    showDetails: boolean;
    autoCalculate: boolean;
  };
}

/**
 * 포인트 액션 타입들
 */
type PointsAction =
  | { type: 'SET_TOTAL_POINTS'; payload: number }
  | { type: 'SET_POINTS_CALCULATION'; payload: PointsCalculation }
  | {
      type: 'ADD_POINTS_HISTORY';
      payload: {
        amount: number;
        type: 'purchase' | 'bonus' | 'expired' | 'used';
        description: string;
      };
    }
  | { type: 'CLEAR_POINTS_HISTORY' }
  | { type: 'SET_BASE_RATE'; payload: number }
  | { type: 'SET_TUESDAY_MULTIPLIER'; payload: number }
  | { type: 'SET_SET_BONUS_AMOUNT'; payload: number }
  | { type: 'SET_FULL_SET_BONUS_AMOUNT'; payload: number }
  | {
      type: 'SET_QUANTITY_BONUSES';
      payload: Array<{ threshold: number; bonus: number; description: string }>;
    }
  | { type: 'SET_POINTS_VISIBILITY'; payload: boolean }
  | { type: 'SET_SHOW_DETAILS'; payload: boolean }
  | { type: 'SET_AUTO_CALCULATE'; payload: boolean }
  | {
      type: 'CALCULATE_POINTS';
      payload: {
        totalAmount: number;
        cartItems: CartItem[];
        isTuesday: boolean;
      };
    }
  | { type: 'RESET_POINTS_STATE' };

/**
 * 전역 상태 (useReducer 스타일)
 */
let pointsState: PointsState = {
  currentPoints: {
    total: 0,
    calculation: null,
    lastCalculated: null,
  },
  history: [],
  settings: {
    baseRate: 0.001, // 1000원당 1포인트
    tuesdayMultiplier: 2,
    setBonusAmount: 50,
    fullSetBonusAmount: 100,
    quantityBonuses: [
      { threshold: 10, bonus: 20, description: '대량구매(10개+)' },
      { threshold: 20, bonus: 50, description: '대량구매(20개+)' },
      { threshold: 30, bonus: 100, description: '대량구매(30개+)' },
    ],
  },
  display: {
    isVisible: false,
    showDetails: false,
    autoCalculate: true,
  },
};

/**
 * 포인트 계산 함수들
 */
const calculateBasePoints = (totalAmount: number, baseRate: number): number => {
  return Math.floor(totalAmount * baseRate);
};

const calculateTuesdayBonus = (
  basePoints: number,
  isTuesday: boolean,
  multiplier: number
): number => {
  return isTuesday && basePoints > 0 ? basePoints * (multiplier - 1) : 0;
};

const calculateSetBonus = (
  cartItems: CartItem[],
  setBonus: number,
  fullSetBonus: number
): number => {
  const hasKeyboard = cartItems.some(item => item.id === 'p1');
  const hasMouse = cartItems.some(item => item.id === 'p2');
  const hasMonitorArm = cartItems.some(item => item.id === 'p3');

  // 풀세트 (키보드 + 마우스 + 모니터암) - 풀세트는 세트 보너스와 별도로 계산
  if (hasKeyboard && hasMouse && hasMonitorArm) {
    return fullSetBonus;
  }

  // 키보드 + 마우스 세트 (풀세트가 아닌 경우에만)
  if (hasKeyboard && hasMouse) {
    return setBonus;
  }

  return 0;
};

const calculateQuantityBonus = (
  totalQuantity: number,
  quantityBonuses: Array<{ threshold: number; bonus: number }>
): number => {
  for (let i = quantityBonuses.length - 1; i >= 0; i--) {
    if (totalQuantity >= quantityBonuses[i].threshold) {
      return quantityBonuses[i].bonus;
    }
  }
  return 0;
};

/**
 * 포인트 리듀서 (useReducer 스타일)
 */
function pointsReducer(state: PointsState, action: PointsAction): PointsState {
  switch (action.type) {
    case 'SET_TOTAL_POINTS':
      return {
        ...state,
        currentPoints: {
          ...state.currentPoints,
          total: action.payload,
        },
      };

    case 'SET_POINTS_CALCULATION':
      return {
        ...state,
        currentPoints: {
          ...state.currentPoints,
          calculation: action.payload,
          lastCalculated: new Date(),
        },
      };

    case 'ADD_POINTS_HISTORY':
      return {
        ...state,
        history: [
          ...state.history,
          {
            id: Date.now().toString(),
            amount: action.payload.amount,
            type: action.payload.type,
            description: action.payload.description,
            date: new Date(),
          },
        ],
      };

    case 'CLEAR_POINTS_HISTORY':
      return {
        ...state,
        history: [],
      };

    case 'SET_BASE_RATE':
      return {
        ...state,
        settings: {
          ...state.settings,
          baseRate: action.payload,
        },
      };

    case 'SET_TUESDAY_MULTIPLIER':
      return {
        ...state,
        settings: {
          ...state.settings,
          tuesdayMultiplier: action.payload,
        },
      };

    case 'SET_SET_BONUS_AMOUNT':
      return {
        ...state,
        settings: {
          ...state.settings,
          setBonusAmount: action.payload,
        },
      };

    case 'SET_FULL_SET_BONUS_AMOUNT':
      return {
        ...state,
        settings: {
          ...state.settings,
          fullSetBonusAmount: action.payload,
        },
      };

    case 'SET_QUANTITY_BONUSES':
      return {
        ...state,
        settings: {
          ...state.settings,
          quantityBonuses: action.payload,
        },
      };

    case 'SET_POINTS_VISIBILITY':
      return {
        ...state,
        display: {
          ...state.display,
          isVisible: action.payload,
        },
      };

    case 'SET_SHOW_DETAILS':
      return {
        ...state,
        display: {
          ...state.display,
          showDetails: action.payload,
        },
      };

    case 'SET_AUTO_CALCULATE':
      return {
        ...state,
        display: {
          ...state.display,
          autoCalculate: action.payload,
        },
      };

    case 'CALCULATE_POINTS':
      const { totalAmount, cartItems, isTuesday } = action.payload;
      const { settings } = state;

      const basePoints = calculateBasePoints(totalAmount, settings.baseRate);
      const tuesdayBonus = calculateTuesdayBonus(
        basePoints,
        isTuesday,
        settings.tuesdayMultiplier
      );
      // 세트 보너스 계산 (키보드+마우스 세트)
      const hasKeyboard = cartItems.some(item => item.id === 'p1');
      const hasMouse = cartItems.some(item => item.id === 'p2');
      const hasMonitorArm = cartItems.some(item => item.id === 'p3');

      let setBonus = 0;
      let fullSetBonus = 0;

      // 키보드 + 마우스 세트 (기본 세트 보너스)
      if (hasKeyboard && hasMouse) {
        setBonus = settings.setBonusAmount;
      }

      // 풀세트 (키보드 + 마우스 + 모니터암) - 추가 보너스
      if (hasKeyboard && hasMouse && hasMonitorArm) {
        fullSetBonus = settings.fullSetBonusAmount;
      }

      const totalQuantity = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const quantityBonus = calculateQuantityBonus(
        totalQuantity,
        settings.quantityBonuses
      );

      const totalPoints =
        basePoints + tuesdayBonus + setBonus + fullSetBonus + quantityBonus;

      const details: string[] = [];
      if (basePoints > 0) details.push(`기본: ${basePoints}p`);
      if (tuesdayBonus > 0) details.push('화요일 2배');
      if (setBonus > 0) {
        details.push('키보드+마우스 세트 +50p');
      }
      if (fullSetBonus > 0) {
        details.push('풀세트 구매 +100p');
      }
      if (quantityBonus > 0) {
        const bonus = settings.quantityBonuses.find(
          b => b.bonus === quantityBonus
        );
        if (bonus) details.push(`${bonus.description} +${bonus.bonus}p`);
      }

      const calculation: PointsCalculation = {
        basePoints,
        tuesdayBonus,
        setBonus,
        fullSetBonus,
        quantityBonus,
        totalPoints,
        details,
      };

      return {
        ...state,
        currentPoints: {
          ...state.currentPoints,
          total: totalPoints,
          calculation,
          lastCalculated: new Date(),
        },
      };

    case 'RESET_POINTS_STATE':
      return {
        currentPoints: {
          total: 0,
          calculation: null,
          lastCalculated: null,
        },
        history: [],
        settings: {
          baseRate: 0.001,
          tuesdayMultiplier: 2,
          setBonusAmount: 50,
          fullSetBonusAmount: 100,
          quantityBonuses: [
            { threshold: 10, bonus: 20, description: '대량구매(10개+)' },
            { threshold: 20, bonus: 50, description: '대량구매(20개+)' },
            { threshold: 30, bonus: 100, description: '대량구매(30개+)' },
          ],
        },
        display: {
          isVisible: false,
          showDetails: false,
          autoCalculate: true,
        },
      };

    default:
      return state;
  }
}

/**
 * 디스패치 함수 (useReducer 스타일)
 */
function dispatch(action: PointsAction): void {
  pointsState = pointsReducer(pointsState, action);
}

/**
 * 상태 조회 함수 (useReducer 스타일)
 */
function getState(): PointsState {
  return { ...pointsState };
}

/**
 * ========================================
 * 포인트 상태 관리 (useReducer 스타일)
 * ========================================
 *
 * useReducer처럼 { getState, dispatch } 형태로 export합니다.
 */
export const usePointsState = () => {
  return {
    getState,
    dispatch,
  };
};
