import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'jotai';
import { describe, it, expect } from 'vitest';
import { OrderSummary } from '../features/order/OrderSummary';
import { pointsStateAtom } from '../features/points/model/PointsModel';
import { cartStateAtom } from '../features/cart/model/CartModel';
import {
  productStateAtom,
  createProduct,
} from '../features/product/model/ProductModel';
import { useSetAtom } from 'jotai';

/**
 * OrderSummary 컴포넌트 테스트
 * Points Model 구독 및 포인트 표시 기능을 테스트합니다.
 */
describe('OrderSummary 컴포넌트', () => {
  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    return <Provider>{children}</Provider>;
  };

  const SetupPoints: React.FC<{ points: number; details?: string[] }> = ({
    points,
    details = ['기본 적립', '화요일 보너스'],
  }) => {
    const setPointsState = useSetAtom(pointsStateAtom);

    React.useEffect(() => {
      setPointsState(prev => ({
        ...prev,
        currentPoints: {
          total: points,
          calculation: {
            basePoints: points * 0.5,
            tuesdayBonus: points * 0.5,
            setBonus: 0,
            fullSetBonus: 0,
            quantityBonus: 0,
            totalPoints: points,
            details: details,
          },
          lastCalculated: new Date(),
        },
      }));
    }, [setPointsState, points, details]);

    return null;
  };

  const SetupCart: React.FC<{
    items: Array<{ id: string; quantity: number }>;
  }> = ({ items }) => {
    const setCartState = useSetAtom(cartStateAtom);
    const setProductState = useSetAtom(productStateAtom);

    React.useEffect(() => {
      // 상품 데이터 설정
      setProductState(prev => ({
        ...prev,
        products: [
          createProduct('p1', '키보드', 10000, 10),
          createProduct('p2', '마우스', 5000, 10),
        ],
      }));

      // 장바구니 데이터 설정
      setCartState(prev => ({
        ...prev,
        items: items.map(item => ({
          product: createProduct(item.id, '상품', 10000, 10),
          quantity: item.quantity,
        })),
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: items.reduce((sum, item) => sum + item.quantity * 10000, 0),
        totalAmount: items.reduce(
          (sum, item) => sum + item.quantity * 10000,
          0
        ),
        finalTotal: items.reduce((sum, item) => sum + item.quantity * 10000, 0),
        itemDiscounts: [],
      }));
    }, [setCartState, setProductState, items]);

    return null;
  };

  it('포인트가 0일 때 "적립 포인트: 0p"를 표시해야 함', () => {
    render(
      <TestWrapper>
        <SetupPoints points={0} />
        <SetupCart items={[{ id: 'p1', quantity: 1 }]} />
        <OrderSummary />
      </TestWrapper>
    );

    expect(screen.getByText('적립 포인트: 0p')).toBeTruthy();
  });

  it('포인트가 있을 때 포인트 금액을 표시해야 함', () => {
    render(
      <TestWrapper>
        <SetupPoints points={50} />
        <SetupCart items={[{ id: 'p1', quantity: 1 }]} />
        <OrderSummary />
      </TestWrapper>
    );

    expect(screen.getByText('적립 포인트:')).toBeTruthy();
    expect(screen.getByText('50p')).toBeTruthy();
  });

  it('포인트 상세 내역을 표시해야 함', () => {
    const details = ['기본 적립', '화요일 보너스', '세트 보너스'];

    render(
      <TestWrapper>
        <SetupPoints points={100} details={details} />
        <SetupCart items={[{ id: 'p1', quantity: 1 }]} />
        <OrderSummary />
      </TestWrapper>
    );

    expect(
      screen.getByText('기본 적립, 화요일 보너스, 세트 보너스')
    ).toBeTruthy();
  });

  it('장바구니에 상품이 추가되면 포인트가 업데이트되어야 함', () => {
    const { rerender } = render(
      <TestWrapper>
        <SetupPoints points={0} />
        <SetupCart items={[]} />
        <OrderSummary />
      </TestWrapper>
    );

    expect(screen.getByText('적립 포인트: 0p')).toBeTruthy();

    // 상품 추가 후 재렌더링
    rerender(
      <TestWrapper>
        <SetupPoints points={25} />
        <SetupCart items={[{ id: 'p1', quantity: 2 }]} />
        <OrderSummary />
      </TestWrapper>
    );

    expect(screen.getByText('25p')).toBeTruthy();
  });
});
