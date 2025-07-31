/**
 * ========================================
 * Points ViewModel 테스트 (MVVM - ViewModel)
 * ========================================
 *
 * Points ViewModel의 기능을 테스트합니다.
 * 기존 basic 테스트의 포인트 관련 로직을 React Testing Library로 변환합니다.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'jotai';
import {
  usePointsViewModel,
  usePointsCalculationViewModel,
} from '../viewmodels/usePointsViewModel';
import { PRODUCT_IDS } from '../features/product/model/ProductModel';
import { createProduct } from '../features/product/model/ProductModel';

/**
 * 테스트용 Provider 래퍼
 */
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
);

const renderHookWithProvider = <T,>(hook: () => T) => {
  return renderHook(hook, { wrapper });
};

/**
 * 테스트용 CartItem 생성 함수
 */
const createTestCartItem = (productId: string, quantity: number) => ({
  product: createProduct(productId, `테스트 상품 ${productId}`, 10000, 50),
  quantity,
});

describe('Points ViewModel', () => {
  describe('usePointsViewModel', () => {
    it('초기 상태가 올바르게 설정되어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      expect(result.current.currentPoints.total).toBe(0);
      expect(result.current.currentPoints.calculation).toBeNull();
      expect(result.current.currentPoints.lastCalculated).toBeNull();
      expect(result.current.history).toEqual([]);
      expect(result.current.settings.baseRate).toBe(0.001);
      expect(result.current.settings.tuesdayMultiplier).toBe(2);
      expect(result.current.settings.setBonusAmount).toBe(50);
      expect(result.current.settings.fullSetBonusAmount).toBe(100);
      expect(result.current.display.isVisible).toBe(false);
    });

    it('기본 포인트를 계산할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      const basePoints = result.current.calculateBasePoints(10000);
      expect(basePoints).toBe(10); // 10000 * 0.001 = 10
    });

    it('화요일 보너스 포인트를 계산할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      const tuesdayBonus = result.current.calculateTuesdayBonus(10, true);
      expect(tuesdayBonus).toBe(10); // 10 * (2-1) = 10

      const nonTuesdayBonus = result.current.calculateTuesdayBonus(10, false);
      expect(nonTuesdayBonus).toBe(0);
    });

    it('세트 구매 보너스를 계산할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      const cartItems = [
        createTestCartItem(PRODUCT_IDS.KEYBOARD, 1),
        createTestCartItem(PRODUCT_IDS.MOUSE, 1),
      ];

      const { setBonus, fullSetBonus } =
        result.current.calculateSetBonus(cartItems);
      expect(setBonus).toBe(50); // 키보드+마우스 세트
      expect(fullSetBonus).toBe(0); // 모니터암 없음
    });

    it('풀세트 구매 보너스를 계산할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      const cartItems = [
        createTestCartItem(PRODUCT_IDS.KEYBOARD, 1),
        createTestCartItem(PRODUCT_IDS.MOUSE, 1),
        createTestCartItem(PRODUCT_IDS.MONITOR_ARM, 1),
      ];

      const { setBonus, fullSetBonus } =
        result.current.calculateSetBonus(cartItems);
      expect(setBonus).toBe(50); // 키보드+마우스 세트
      expect(fullSetBonus).toBe(100); // 풀세트 추가 보너스
    });

    it('수량별 보너스를 계산할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      expect(result.current.calculateQuantityBonus(5)).toBe(0); // 10개 미만
      expect(result.current.calculateQuantityBonus(15)).toBe(20); // 10개 이상
      expect(result.current.calculateQuantityBonus(25)).toBe(50); // 20개 이상
      expect(result.current.calculateQuantityBonus(35)).toBe(100); // 30개 이상
    });

    it('총 포인트를 계산할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      const cartItems = [
        createTestCartItem(PRODUCT_IDS.KEYBOARD, 1),
        createTestCartItem(PRODUCT_IDS.MOUSE, 1),
      ];

      const calculation = result.current.calculateTotalPoints(
        10000,
        cartItems,
        false
      );
      expect(calculation.basePoints).toBe(10);
      expect(calculation.tuesdayBonus).toBe(0);
      expect(calculation.setBonus).toBe(50);
      expect(calculation.fullSetBonus).toBe(0);
      expect(calculation.quantityBonus).toBe(0); // 2개 = 10개 미만이므로 보너스 없음
      expect(calculation.totalPoints).toBe(60); // 10 + 0 + 50 + 0 + 0
    });

    it('화요일 구매 시 포인트가 2배가 되어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      const cartItems = [createTestCartItem(PRODUCT_IDS.KEYBOARD, 1)];

      const calculation = result.current.calculateTotalPoints(
        10000,
        cartItems,
        true
      );
      expect(calculation.basePoints).toBe(10);
      expect(calculation.tuesdayBonus).toBe(10); // 화요일 2배
      expect(calculation.totalPoints).toBe(20); // 10 + 10
    });

    it('포인트 계산을 실행할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      const cartItems = [createTestCartItem(PRODUCT_IDS.KEYBOARD, 1)];

      act(() => {
        result.current.calculatePoints(10000, cartItems, false);
      });

      expect(result.current.currentPoints.total).toBe(10);
      expect(result.current.currentPoints.calculation).not.toBeNull();
      expect(result.current.currentPoints.lastCalculated).not.toBeNull();
    });

    it('총 포인트를 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      act(() => {
        result.current.setTotalPoints(100);
      });

      expect(result.current.currentPoints.total).toBe(100);
    });

    it('포인트 계산 결과를 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      const calculation = {
        basePoints: 10,
        tuesdayBonus: 10,
        setBonus: 50,
        fullSetBonus: 0,
        quantityBonus: 20,
        totalPoints: 90,
        details: [
          '기본: 10p',
          '화요일 2배',
          '키보드+마우스 세트 +50p',
          '대량구매(10개+) +20p',
        ],
      };

      act(() => {
        result.current.setPointsCalculation(calculation);
      });

      expect(result.current.currentPoints.calculation).toEqual(calculation);
      expect(result.current.currentPoints.lastCalculated).not.toBeNull();
    });

    it('포인트 내역을 추가할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      act(() => {
        result.current.addPointsHistory(50, 'purchase', '구매 적립');
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].amount).toBe(50);
      expect(result.current.history[0].type).toBe('purchase');
      expect(result.current.history[0].description).toBe('구매 적립');
    });

    it('포인트 내역을 초기화할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      // 먼저 내역 추가
      act(() => {
        result.current.addPointsHistory(50, 'purchase', '구매 적립');
      });

      expect(result.current.history).toHaveLength(1);

      // 내역 초기화
      act(() => {
        result.current.clearPointsHistory();
      });

      expect(result.current.history).toHaveLength(0);
    });

    it('기본 적립률을 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      act(() => {
        result.current.setBaseRate(0.002);
      });

      expect(result.current.settings.baseRate).toBe(0.002);
    });

    it('화요일 배수를 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      act(() => {
        result.current.setTuesdayMultiplier(3);
      });

      expect(result.current.settings.tuesdayMultiplier).toBe(3);
    });

    it('세트 보너스 금액을 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      act(() => {
        result.current.setSetBonusAmount(100);
      });

      expect(result.current.settings.setBonusAmount).toBe(100);
    });

    it('풀세트 보너스 금액을 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      act(() => {
        result.current.setFullSetBonusAmount(200);
      });

      expect(result.current.settings.fullSetBonusAmount).toBe(200);
    });

    it('수량별 보너스 규칙을 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      const newBonuses = [
        { threshold: 5, bonus: 10, description: '소량구매(5개+)' },
        { threshold: 15, bonus: 30, description: '중량구매(15개+)' },
      ];

      act(() => {
        result.current.setQuantityBonuses(newBonuses);
      });

      expect(result.current.settings.quantityBonuses).toEqual(newBonuses);
    });

    it('포인트 표시 여부를 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      act(() => {
        result.current.setPointsVisibility(true);
      });

      expect(result.current.display.isVisible).toBe(true);
    });

    it('상세 내역 표시 여부를 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      act(() => {
        result.current.setShowDetails(true);
      });

      expect(result.current.display.showDetails).toBe(true);
    });

    it('자동 계산 여부를 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      act(() => {
        result.current.setAutoCalculate(false);
      });

      expect(result.current.display.autoCalculate).toBe(false);
    });

    it('포인트 상태를 초기화할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      // 먼저 상태 변경
      act(() => {
        result.current.setTotalPoints(100);
        result.current.addPointsHistory(50, 'purchase', '구매 적립');
        result.current.setPointsVisibility(true);
      });

      // 초기화
      act(() => {
        result.current.resetPointsState();
      });

      expect(result.current.currentPoints.total).toBe(0);
      expect(result.current.history).toHaveLength(0);
      expect(result.current.display.isVisible).toBe(false);
    });

    it('포인트 표시 여부를 결정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      expect(result.current.shouldShowPoints([])).toBe(false);
      expect(
        result.current.shouldShowPoints([
          createTestCartItem(PRODUCT_IDS.KEYBOARD, 1),
        ])
      ).toBe(true);
    });

    it('포인트 계산 결과를 포맷팅할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      const calculation = {
        basePoints: 10,
        tuesdayBonus: 10,
        setBonus: 50,
        fullSetBonus: 0,
        quantityBonus: 20,
        totalPoints: 90,
        details: [
          '기본: 10p',
          '화요일 2배',
          '키보드+마우스 세트 +50p',
          '대량구매(10개+) +20p',
        ],
      };

      const formatted = result.current.formatPointsDisplay(calculation);
      expect(formatted).toBe(
        '적립 포인트: 90p (기본: 10p, 화요일 2배, 키보드+마우스 세트 +50p, 대량구매(10개+) +20p)'
      );
    });

    it('포인트가 0일 때 올바르게 포맷팅해야 함', () => {
      const { result } = renderHookWithProvider(usePointsViewModel);

      const calculation = {
        basePoints: 0,
        tuesdayBonus: 0,
        setBonus: 0,
        fullSetBonus: 0,
        quantityBonus: 0,
        totalPoints: 0,
        details: [],
      };

      const formatted = result.current.formatPointsDisplay(calculation);
      expect(formatted).toBe('적립 포인트: 0p');
    });
  });

  describe('usePointsCalculationViewModel', () => {
    it('화요일 여부를 확인할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsCalculationViewModel);

      const isTuesday = result.current.isTuesday();
      // 실제 날짜에 따라 결과가 달라질 수 있으므로 boolean 값만 확인
      expect(typeof isTuesday).toBe('boolean');
    });

    it('실시간 포인트 계산을 할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(usePointsCalculationViewModel);

      const cartItems = [
        createTestCartItem(PRODUCT_IDS.KEYBOARD, 1),
        createTestCartItem(PRODUCT_IDS.MOUSE, 1),
      ];

      const calculation = result.current.calculatePointsRealTime(
        10000,
        cartItems
      );
      expect(calculation.basePoints).toBe(10);
      expect(calculation.setBonus).toBe(50);
      expect(calculation.totalPoints).toBeGreaterThan(0);
    });

    it('포인트 계산 및 상태 업데이트를 할 수 있어야 함', () => {
      const { result } = renderHook(
        () => ({
          calculationViewModel: usePointsCalculationViewModel(),
          pointsViewModel: usePointsViewModel(),
        }),
        { wrapper }
      );

      const cartItems = [createTestCartItem(PRODUCT_IDS.KEYBOARD, 1)];

      act(() => {
        result.current.calculationViewModel.calculateAndUpdatePoints(
          10000,
          cartItems
        );
      });

      // 같은 Provider 컨텍스트에서 상태 확인
      expect(
        result.current.pointsViewModel.currentPoints.total
      ).toBeGreaterThan(0);
    });
  });
});

describe('Points Integration', () => {
  it('Points ViewModel과 PointsCalculationViewModel이 동일한 상태를 공유해야 함', () => {
    const { result } = renderHook(
      () => ({
        pointsViewModel: usePointsViewModel(),
        calculationViewModel: usePointsCalculationViewModel(),
      }),
      { wrapper }
    );

    const cartItems = [
      createTestCartItem(PRODUCT_IDS.KEYBOARD, 1),
      createTestCartItem(PRODUCT_IDS.MOUSE, 1),
    ];

    // PointsCalculationViewModel로 계산
    const calculation =
      result.current.calculationViewModel.calculatePointsRealTime(
        10000,
        cartItems
      );

    // PointsViewModel로 계산
    const pointsCalculation =
      result.current.pointsViewModel.calculateTotalPoints(
        10000,
        cartItems,
        false
      );

    // 동일한 결과인지 확인
    expect(calculation.totalPoints).toBe(pointsCalculation.totalPoints);
  });
});
