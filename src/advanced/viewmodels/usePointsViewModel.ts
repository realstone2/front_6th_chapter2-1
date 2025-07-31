/**
 * ========================================
 * Points ViewModel (MVVM - ViewModel)
 * ========================================
 *
 * 포인트 적립 관련 비즈니스 로직을 담당하는 ViewModel입니다.
 * 기존 basic/features/points/pointsUtils.ts와 pointsState.ts의 로직을 React hooks로 변환합니다.
 */

import { useCallback, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { pointsStateAtom } from '../features/points/model/PointsModel';
import { CartItemModel } from '../features/cart/model/CartModel';
import { PRODUCT_IDS } from '../features/product/model/ProductModel';

/**
 * 포인트 계산 결과 인터페이스
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
 * 포인트 계산 ViewModel
 *
 * 포인트 계산 로직을 담당하는 ViewModel
 * 기존 pointsUtils.ts의 함수들을 React hooks로 변환
 */
export const usePointsCalculationViewModel = () => {
  const [pointsState, setPointsState] = useAtom(pointsStateAtom);

  /**
   * 화요일 여부 확인
   * 기존 pointsUtils.ts의 isTuesday 함수
   */
  const isTuesday = useCallback(() => {
    const today = new Date();
    return today.getDay() === 2; // 0=일요일, 1=월요일, 2=화요일
  }, []);

  /**
   * 기본 포인트 계산
   * 기존 pointsUtils.ts의 calculateBasePoints 함수
   */
  const calculateBasePoints = useCallback(
    (amount: number): number => {
      return Math.floor(amount * pointsState.settings.baseRate);
    },
    [pointsState.settings.baseRate]
  );

  /**
   * 화요일 보너스 포인트 계산
   * 기존 pointsUtils.ts의 calculateTuesdayBonus 함수
   */
  const calculateTuesdayBonus = useCallback(
    (basePoints: number, isTuesday: boolean): number => {
      if (!isTuesday) return 0;
      return Math.floor(
        basePoints * (pointsState.settings.tuesdayMultiplier - 1)
      );
    },
    [pointsState.settings.tuesdayMultiplier]
  );

  /**
   * 세트 구매 보너스 계산
   * 기존 pointsUtils.ts의 calculateSetBonus 함수
   */
  const calculateSetBonus = useCallback(
    (cartItems: CartItemModel[]) => {
      const productIds = cartItems.map(item => item.product.id);

      // 키보드 + 마우스 세트 확인
      const hasKeyboard = productIds.includes(PRODUCT_IDS.KEYBOARD);
      const hasMouse = productIds.includes(PRODUCT_IDS.MOUSE);
      const hasMonitorArm = productIds.includes(PRODUCT_IDS.MONITOR_ARM);

      const setBonus =
        hasKeyboard && hasMouse ? pointsState.settings.setBonusAmount : 0;
      const fullSetBonus =
        hasKeyboard && hasMouse && hasMonitorArm
          ? pointsState.settings.fullSetBonusAmount
          : 0;

      return { setBonus, fullSetBonus };
    },
    [
      pointsState.settings.setBonusAmount,
      pointsState.settings.fullSetBonusAmount,
    ]
  );

  /**
   * 수량별 보너스 계산
   * 기존 pointsUtils.ts의 calculateQuantityBonus 함수
   */
  const calculateQuantityBonus = useCallback(
    (totalQuantity: number): number => {
      const { quantityBonuses } = pointsState.settings;

      for (let i = quantityBonuses.length - 1; i >= 0; i--) {
        if (totalQuantity >= quantityBonuses[i].threshold) {
          return quantityBonuses[i].bonus;
        }
      }

      return 0;
    },
    [pointsState.settings.quantityBonuses]
  );

  /**
   * 총 포인트 계산
   * 기존 pointsUtils.ts의 calculateTotalPoints 함수
   */
  const calculateTotalPoints = useCallback(
    (
      amount: number,
      cartItems: CartItemModel[],
      isTuesday: boolean
    ): PointsCalculation => {
      const basePoints = calculateBasePoints(amount);
      const tuesdayBonus = calculateTuesdayBonus(basePoints, isTuesday);
      const { setBonus, fullSetBonus } = calculateSetBonus(cartItems);

      const totalQuantity = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const quantityBonus = calculateQuantityBonus(totalQuantity);

      const totalPoints =
        basePoints + tuesdayBonus + setBonus + fullSetBonus + quantityBonus;

      // 상세 내역 생성
      const details: string[] = [];
      if (basePoints > 0) details.push(`기본: ${basePoints}p`);
      if (tuesdayBonus > 0) details.push('화요일 2배');
      if (setBonus > 0) details.push('키보드+마우스 세트 +50p');
      if (fullSetBonus > 0) details.push('풀세트 +100p');
      if (quantityBonus > 0) {
        const bonus = pointsState.settings.quantityBonuses.find(
          b => b.bonus === quantityBonus
        );
        if (bonus) details.push(`${bonus.description} +${bonus.bonus}p`);
      }

      return {
        basePoints,
        tuesdayBonus,
        setBonus,
        fullSetBonus,
        quantityBonus,
        totalPoints,
        details,
      };
    },
    [
      calculateBasePoints,
      calculateTuesdayBonus,
      calculateSetBonus,
      calculateQuantityBonus,
      pointsState.settings.quantityBonuses,
    ]
  );

  /**
   * 실시간 포인트 계산
   * 현재 상태를 기반으로 포인트를 계산
   */
  const calculatePointsRealTime = useCallback(
    (amount: number, cartItems: CartItemModel[]): PointsCalculation => {
      return calculateTotalPoints(amount, cartItems, isTuesday());
    },
    [calculateTotalPoints, isTuesday]
  );

  /**
   * 포인트 계산 및 상태 업데이트
   * 계산 결과를 상태에 저장
   */
  const calculateAndUpdatePoints = useCallback(
    (amount: number, cartItems: CartItemModel[]) => {
      const calculation = calculateTotalPoints(amount, cartItems, isTuesday());

      setPointsState(prev => ({
        ...prev,
        currentPoints: {
          ...prev.currentPoints,
          total: calculation.totalPoints,
          calculation,
          lastCalculated: new Date(),
        },
      }));
    },
    [calculateTotalPoints, isTuesday, setPointsState]
  );

  return {
    isTuesday,
    calculateBasePoints,
    calculateTuesdayBonus,
    calculateSetBonus,
    calculateQuantityBonus,
    calculateTotalPoints,
    calculatePointsRealTime,
    calculateAndUpdatePoints,
  };
};

/**
 * 포인트 상태 관리 ViewModel
 *
 * 포인트 상태 관리를 담당하는 ViewModel
 * 기존 pointsState.ts의 로직을 React hooks로 변환
 */
export const usePointsViewModel = () => {
  const [pointsState, setPointsState] = useAtom(pointsStateAtom);

  /**
   * 화요일 여부 확인
   */
  const isTuesday = useCallback(() => {
    const today = new Date();
    return today.getDay() === 2; // 0=일요일, 1=월요일, 2=화요일
  }, []);

  /**
   * 기본 포인트 계산 (상태 기반)
   */
  const calculateBasePoints = useCallback(
    (amount: number): number => {
      return Math.floor(amount * pointsState.settings.baseRate);
    },
    [pointsState.settings.baseRate]
  );

  /**
   * 화요일 보너스 포인트 계산 (상태 기반)
   */
  const calculateTuesdayBonus = useCallback(
    (basePoints: number, isTuesday: boolean): number => {
      if (!isTuesday) return 0;
      return Math.floor(
        basePoints * (pointsState.settings.tuesdayMultiplier - 1)
      );
    },
    [pointsState.settings.tuesdayMultiplier]
  );

  /**
   * 세트 구매 보너스 계산 (상태 기반)
   */
  const calculateSetBonus = useCallback(
    (cartItems: CartItemModel[]) => {
      const productIds = cartItems.map(item => item.product.id);

      // 키보드 + 마우스 세트 확인
      const hasKeyboard = productIds.includes(PRODUCT_IDS.KEYBOARD);
      const hasMouse = productIds.includes(PRODUCT_IDS.MOUSE);
      const hasMonitorArm = productIds.includes(PRODUCT_IDS.MONITOR_ARM);

      const setBonus =
        hasKeyboard && hasMouse ? pointsState.settings.setBonusAmount : 0;
      const fullSetBonus =
        hasKeyboard && hasMouse && hasMonitorArm
          ? pointsState.settings.fullSetBonusAmount
          : 0;

      return { setBonus, fullSetBonus };
    },
    [
      pointsState.settings.setBonusAmount,
      pointsState.settings.fullSetBonusAmount,
    ]
  );

  /**
   * 수량별 보너스 계산 (상태 기반)
   */
  const calculateQuantityBonus = useCallback(
    (totalQuantity: number): number => {
      const { quantityBonuses } = pointsState.settings;

      for (let i = quantityBonuses.length - 1; i >= 0; i--) {
        if (totalQuantity >= quantityBonuses[i].threshold) {
          return quantityBonuses[i].bonus;
        }
      }

      return 0;
    },
    [pointsState.settings.quantityBonuses]
  );

  /**
   * 총 포인트 계산 (상태 기반)
   */
  const calculateTotalPoints = useCallback(
    (
      amount: number,
      cartItems: CartItemModel[],
      isTuesday: boolean
    ): PointsCalculation => {
      const basePoints = calculateBasePoints(amount);
      const tuesdayBonus = calculateTuesdayBonus(basePoints, isTuesday);
      const { setBonus, fullSetBonus } = calculateSetBonus(cartItems);

      const totalQuantity = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const quantityBonus = calculateQuantityBonus(totalQuantity);

      const totalPoints =
        basePoints + tuesdayBonus + setBonus + fullSetBonus + quantityBonus;

      const details: string[] = [];
      if (basePoints > 0) details.push(`기본: ${basePoints}p`);
      if (tuesdayBonus > 0) details.push('화요일 2배');
      if (setBonus > 0) details.push('키보드+마우스 세트 +50p');
      if (fullSetBonus > 0) details.push('풀세트 +100p');
      if (quantityBonus > 0) {
        const bonus = pointsState.settings.quantityBonuses.find(
          b => b.bonus === quantityBonus
        );
        if (bonus) details.push(`${bonus.description} +${bonus.bonus}p`);
      }

      return {
        basePoints,
        tuesdayBonus,
        setBonus,
        fullSetBonus,
        quantityBonus,
        totalPoints,
        details,
      };
    },
    [
      calculateBasePoints,
      calculateTuesdayBonus,
      calculateSetBonus,
      calculateQuantityBonus,
      pointsState.settings.quantityBonuses,
    ]
  );

  /**
   * 포인트 계산 실행
   */
  const calculatePoints = useCallback(
    (amount: number, cartItems: CartItemModel[], isTuesday: boolean) => {
      const calculation = calculateTotalPoints(amount, cartItems, isTuesday);

      setPointsState(prev => ({
        ...prev,
        currentPoints: {
          ...prev.currentPoints,
          total: calculation.totalPoints,
          calculation,
          lastCalculated: new Date(),
        },
      }));
    },
    [calculateTotalPoints, setPointsState]
  );

  /**
   * 총 포인트 설정
   */
  const setTotalPoints = useCallback(
    (total: number) => {
      setPointsState(prev => ({
        ...prev,
        currentPoints: {
          ...prev.currentPoints,
          total,
        },
      }));
    },
    [setPointsState]
  );

  /**
   * 포인트 계산 결과 설정
   */
  const setPointsCalculation = useCallback(
    (calculation: PointsCalculation) => {
      setPointsState(prev => ({
        ...prev,
        currentPoints: {
          ...prev.currentPoints,
          calculation,
          lastCalculated: new Date(),
        },
      }));
    },
    [setPointsState]
  );

  /**
   * 포인트 내역 추가
   */
  const addPointsHistory = useCallback(
    (
      amount: number,
      type: 'purchase' | 'bonus' | 'expired' | 'used',
      description: string
    ) => {
      const historyItem = {
        id: Date.now().toString(),
        amount,
        type,
        description,
        date: new Date(),
      };

      setPointsState(prev => ({
        ...prev,
        history: [...prev.history, historyItem],
      }));
    },
    [setPointsState]
  );

  /**
   * 포인트 내역 초기화
   */
  const clearPointsHistory = useCallback(() => {
    setPointsState(prev => ({
      ...prev,
      history: [],
    }));
  }, [setPointsState]);

  /**
   * 기본 적립률 설정
   */
  const setBaseRate = useCallback(
    (baseRate: number) => {
      setPointsState(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          baseRate,
        },
      }));
    },
    [setPointsState]
  );

  /**
   * 화요일 배수 설정
   */
  const setTuesdayMultiplier = useCallback(
    (tuesdayMultiplier: number) => {
      setPointsState(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          tuesdayMultiplier,
        },
      }));
    },
    [setPointsState]
  );

  /**
   * 세트 보너스 금액 설정
   */
  const setSetBonusAmount = useCallback(
    (setBonusAmount: number) => {
      setPointsState(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          setBonusAmount,
        },
      }));
    },
    [setPointsState]
  );

  /**
   * 풀세트 보너스 금액 설정
   */
  const setFullSetBonusAmount = useCallback(
    (fullSetBonusAmount: number) => {
      setPointsState(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          fullSetBonusAmount,
        },
      }));
    },
    [setPointsState]
  );

  /**
   * 수량별 보너스 규칙 설정
   */
  const setQuantityBonuses = useCallback(
    (
      quantityBonuses: Array<{
        threshold: number;
        bonus: number;
        description: string;
      }>
    ) => {
      setPointsState(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          quantityBonuses,
        },
      }));
    },
    [setPointsState]
  );

  /**
   * 포인트 표시 여부 설정
   */
  const setPointsVisibility = useCallback(
    (isVisible: boolean) => {
      setPointsState(prev => ({
        ...prev,
        display: {
          ...prev.display,
          isVisible,
        },
      }));
    },
    [setPointsState]
  );

  /**
   * 상세 내역 표시 여부 설정
   */
  const setShowDetails = useCallback(
    (showDetails: boolean) => {
      setPointsState(prev => ({
        ...prev,
        display: {
          ...prev.display,
          showDetails,
        },
      }));
    },
    [setPointsState]
  );

  /**
   * 자동 계산 여부 설정
   */
  const setAutoCalculate = useCallback(
    (autoCalculate: boolean) => {
      setPointsState(prev => ({
        ...prev,
        display: {
          ...prev.display,
          autoCalculate,
        },
      }));
    },
    [setPointsState]
  );

  /**
   * 포인트 상태 초기화
   */
  const resetPointsState = useCallback(() => {
    setPointsState(prev => ({
      ...prev,
      currentPoints: {
        total: 0,
        calculation: null,
        lastCalculated: null,
      },
      history: [],
      display: {
        isVisible: false,
        showDetails: false,
        autoCalculate: true,
      },
    }));
  }, [setPointsState]);

  /**
   * 포인트 표시 여부 결정
   */
  const shouldShowPoints = useCallback(
    (cartItems: CartItemModel[]): boolean => {
      return cartItems.length > 0;
    },
    []
  );

  /**
   * 포인트 표시 포맷팅
   */
  const formatPointsDisplay = useCallback(
    (calculation: PointsCalculation): string => {
      if (calculation.totalPoints === 0) {
        return '적립 포인트: 0p';
      }

      const details = calculation.details.join(', ');
      return `적립 포인트: ${calculation.totalPoints}p (${details})`;
    },
    []
  );

  /**
   * 포인트 계산 및 상태 업데이트
   * Order ViewModel에서 호출되는 함수
   */
  const calculateAndUpdatePoints = useCallback(
    (amount: number, cartItems: CartItemModel[]) => {
      const calculation = calculateTotalPoints(amount, cartItems, isTuesday());

      setPointsState(prev => ({
        ...prev,
        currentPoints: {
          ...prev.currentPoints,
          total: calculation.totalPoints,
          calculation,
          lastCalculated: new Date(),
        },
        display: {
          ...prev.display,
          isVisible: cartItems.length > 0,
        },
      }));
    },
    [calculateTotalPoints, isTuesday, setPointsState]
  );

  return {
    // 상태
    currentPoints: pointsState.currentPoints,
    history: pointsState.history,
    settings: pointsState.settings,
    display: pointsState.display,

    // 계산 함수들
    calculateBasePoints,
    calculateTuesdayBonus,
    calculateSetBonus,
    calculateQuantityBonus,
    calculateTotalPoints,
    calculatePoints,
    calculateAndUpdatePoints,

    // 상태 관리 함수들
    setTotalPoints,
    setPointsCalculation,
    addPointsHistory,
    clearPointsHistory,
    setBaseRate,
    setTuesdayMultiplier,
    setSetBonusAmount,
    setFullSetBonusAmount,
    setQuantityBonuses,
    setPointsVisibility,
    setShowDetails,
    setAutoCalculate,
    resetPointsState,

    // 유틸리티 함수들
    shouldShowPoints,
    formatPointsDisplay,
  };
};
