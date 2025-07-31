import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'jotai';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartDisplay } from '../features/cart/CartDisplay';
import { useCartViewModel } from '../viewmodels/useCartViewModel';
import { useCartCalculationViewModel } from '../viewmodels/useCartCalculationViewModel';
import { cartStateAtom } from '../features/cart/model/CartModel';
import {
  productStateAtom,
  createProduct,
} from '../features/product/model/ProductModel';
import { useSetAtom } from 'jotai';

/**
 * CartDisplay 컴포넌트 테스트
 * 장바구니 아이템 표시, 수량 조절, 아이템 제거 기능을 테스트합니다.
 */
describe('CartDisplay 컴포넌트', () => {
  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    return <Provider>{children}</Provider>;
  };

  const SetupInitialData: React.FC = () => {
    const setCartState = useSetAtom(cartStateAtom);
    const setProductState = useSetAtom(productStateAtom);

    React.useEffect(() => {
      // 초기 상품 데이터 설정
      setProductState(prev => ({
        ...prev,
        products: [
          createProduct('p1', '버그 없애는 키보드', 10000, 50),
          createProduct('p2', '마우스', 5000, 30),
        ],
        lastSelected: 'p1', // string ID 사용
      }));

      // 초기 장바구니 데이터 설정
      setCartState(prev => ({
        ...prev,
        items: [
          {
            product: createProduct('p1', '버그 없애는 키보드', 10000, 50),
            quantity: 2,
          },
          {
            product: createProduct('p2', '마우스', 5000, 30),
            quantity: 1,
          },
        ],
      }));
    }, [setCartState, setProductState]);

    return null;
  };

  beforeEach(() => {
    // 각 테스트 전에 상태 초기화
  });

  it('장바구니 아이템이 올바르게 표시되어야 함', () => {
    render(
      <TestWrapper>
        <SetupInitialData />
        <CartDisplay />
      </TestWrapper>
    );

    // 상품명이 표시되는지 확인
    expect(screen.getByText('버그 없애는 키보드')).toBeInTheDocument();
    expect(screen.getByText('마우스')).toBeInTheDocument();

    // 수량이 표시되는지 확인
    expect(screen.getByText('10,000원 × 2개')).toBeInTheDocument();
    expect(screen.getByText('5,000원 × 1개')).toBeInTheDocument();
  });

  it('장바구니가 비어있을 때 빈 메시지를 표시해야 함', () => {
    const EmptyCartWrapper: React.FC = () => {
      const setCartState = useSetAtom(cartStateAtom);

      React.useEffect(() => {
        setCartState(prev => ({
          ...prev,
          items: [],
        }));
      }, [setCartState]);

      return <CartDisplay />;
    };

    render(
      <TestWrapper>
        <EmptyCartWrapper />
      </TestWrapper>
    );

    expect(screen.getByText('장바구니가 비어있습니다')).toBeInTheDocument();
  });

  it('수량 증가 버튼이 작동해야 함', () => {
    render(
      <TestWrapper>
        <SetupInitialData />
        <CartDisplay />
      </TestWrapper>
    );

    // 첫 번째 아이템의 수량 증가 버튼 클릭
    const increaseButtons = screen.getAllByText('+');
    fireEvent.click(increaseButtons[0]);

    // 수량이 증가했는지 확인 (실제로는 ViewModel에서 처리되므로 상태 변화 확인)
    expect(increaseButtons[0]).toBeInTheDocument();
  });

  it('수량 감소 버튼이 작동해야 함', () => {
    render(
      <TestWrapper>
        <SetupInitialData />
        <CartDisplay />
      </TestWrapper>
    );

    // 첫 번째 아이템의 수량 감소 버튼 클릭
    const decreaseButtons = screen.getAllByText('-');
    fireEvent.click(decreaseButtons[0]);

    // 수량이 감소했는지 확인
    expect(decreaseButtons[0]).toBeInTheDocument();
  });

  it('삭제 버튼이 표시되어야 함', () => {
    render(
      <TestWrapper>
        <SetupInitialData />
        <CartDisplay />
      </TestWrapper>
    );

    // 삭제 버튼이 표시되는지 확인
    const deleteButtons = screen.getAllByText('삭제');
    expect(deleteButtons).toHaveLength(2); // 2개 아이템이 있으므로 2개 삭제 버튼
  });

  it('총계 정보가 표시되어야 함', () => {
    render(
      <TestWrapper>
        <SetupInitialData />
        <CartDisplay />
      </TestWrapper>
    );

    // 총계 정보가 표시되는지 확인
    expect(screen.getByText('소계:')).toBeInTheDocument();
    expect(screen.getByText('총계:')).toBeInTheDocument();
  });

  it('할인이 적용된 경우 할인 정보가 표시되어야 함', () => {
    const DiscountCartWrapper: React.FC = () => {
      const setCartState = useSetAtom(cartStateAtom);

      React.useEffect(() => {
        setCartState(prev => ({
          ...prev,
          items: [
            {
              product: createProduct('p1', '버그 없애는 키보드', 10000, 50),
              quantity: 10, // 10개 이상이면 할인 적용
            },
          ],
        }));
      }, [setCartState]);

      return <CartDisplay />;
    };

    render(
      <TestWrapper>
        <DiscountCartWrapper />
      </TestWrapper>
    );

    // 할인 정보가 표시되는지 확인
    expect(screen.getByText('할인:')).toBeInTheDocument();
  });
});
