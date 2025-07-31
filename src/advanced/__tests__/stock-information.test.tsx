import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'jotai';
import { describe, it, expect } from 'vitest';
import { StockInformation } from '../features/cart/StockInformation';
import {
  productStateAtom,
  createProduct,
} from '../features/product/model/ProductModel';
import { useSetAtom } from 'jotai';

/**
 * StockInformation 컴포넌트 테스트
 * Product Model 구독 및 재고 정보 표시 기능을 테스트합니다.
 */
describe('StockInformation 컴포넌트', () => {
  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    return <Provider>{children}</Provider>;
  };

  const SetupProducts: React.FC<{
    products: Array<{ id: string; name: string; price: number; stock: number }>;
  }> = ({ products }) => {
    const setProductState = useSetAtom(productStateAtom);

    React.useEffect(() => {
      setProductState(prev => ({
        ...prev,
        products: products.map(p =>
          createProduct(p.id, p.name, p.price, p.stock)
        ),
      }));
    }, [setProductState, products]);

    return null;
  };

  it('재고가 정상일 때 "재고 상태 정상"을 표시해야 함', () => {
    render(
      <TestWrapper>
        <SetupProducts
          products={[
            { id: 'p1', name: '키보드', price: 10000, stock: 10 },
            { id: 'p2', name: '마우스', price: 5000, stock: 15 },
          ]}
        />
        <StockInformation />
      </TestWrapper>
    );

    expect(screen.getByText('재고 상태 정상')).toBeTruthy();
  });

  it('재고 부족 상품이 있을 때 경고 메시지를 표시해야 함', () => {
    render(
      <TestWrapper>
        <SetupProducts
          products={[
            { id: 'p1', name: '키보드', price: 10000, stock: 3 },
            { id: 'p2', name: '마우스', price: 5000, stock: 10 },
          ]}
        />
        <StockInformation />
      </TestWrapper>
    );

    expect(screen.getByText('키보드: 재고 부족 (3개 남음)')).toBeTruthy();
  });

  it('품절 상품이 있을 때 품절 메시지를 표시해야 함', () => {
    render(
      <TestWrapper>
        <SetupProducts
          products={[
            { id: 'p1', name: '키보드', price: 10000, stock: 0 },
            { id: 'p2', name: '마우스', price: 5000, stock: 10 },
          ]}
        />
        <StockInformation />
      </TestWrapper>
    );

    expect(screen.getByText('키보드: 품절')).toBeTruthy();
  });

  it('전체 재고가 30개 미만일 때 전체 재고 부족 메시지를 표시해야 함', () => {
    render(
      <TestWrapper>
        <SetupProducts
          products={[
            { id: 'p1', name: '키보드', price: 10000, stock: 10 },
            { id: 'p2', name: '마우스', price: 5000, stock: 15 },
          ]}
        />
        <StockInformation />
      </TestWrapper>
    );

    expect(screen.getByText('전체 재고 부족 (총 25개)')).toBeTruthy();
  });

  it('여러 상태가 동시에 있을 때 모든 메시지를 표시해야 함', () => {
    render(
      <TestWrapper>
        <SetupProducts
          products={[
            { id: 'p1', name: '키보드', price: 10000, stock: 0 },
            { id: 'p2', name: '마우스', price: 5000, stock: 3 },
            { id: 'p3', name: '모니터암', price: 30000, stock: 5 },
          ]}
        />
        <StockInformation />
      </TestWrapper>
    );

    expect(screen.getByText('키보드: 품절')).toBeTruthy();
    expect(screen.getByText('마우스: 재고 부족 (3개 남음)')).toBeTruthy();
    expect(screen.getByText('전체 재고 부족 (총 8개)')).toBeTruthy();
  });

  it('재고 상태가 변경되면 메시지가 업데이트되어야 함', () => {
    const { rerender } = render(
      <TestWrapper>
        <SetupProducts
          products={[{ id: 'p1', name: '키보드', price: 10000, stock: 10 }]}
        />
        <StockInformation />
      </TestWrapper>
    );

    expect(screen.getByText('재고 상태 정상')).toBeTruthy();

    // 재고 부족으로 변경
    rerender(
      <TestWrapper>
        <SetupProducts
          products={[{ id: 'p1', name: '키보드', price: 10000, stock: 3 }]}
        />
        <StockInformation />
      </TestWrapper>
    );

    expect(screen.getByText('키보드: 재고 부족 (3개 남음)')).toBeTruthy();
  });
});
