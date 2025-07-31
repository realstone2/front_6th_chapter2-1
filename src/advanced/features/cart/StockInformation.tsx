import React from 'react';
import { useAtomValue } from 'jotai';
import { productStateAtom } from '../product/model/ProductModel';

/**
 * 재고 정보 컴포넌트
 * Product Model을 직접 구독하여 재고 정보를 표시합니다.
 * @returns 재고 정보 JSX 엘리먼트
 */
export const StockInformation: React.FC = () => {
  const productState = useAtomValue(productStateAtom);

  // 재고 부족 상품들 필터링
  const lowStockProducts = productState.products.filter(
    product => product.q > 0 && product.q < 5
  );

  // 품절 상품들 필터링
  const outOfStockProducts = productState.products.filter(
    product => product.q === 0
  );

  // 총 재고 수량 계산
  const totalStock = productState.products.reduce(
    (sum, product) => sum + product.q,
    0
  );

  let stockMessage = '';

  // 재고 부족 메시지
  if (lowStockProducts.length > 0) {
    stockMessage += lowStockProducts
      .map(product => `${product.name}: 재고 부족 (${product.q}개 남음)`)
      .join('\n');
  }

  // 품절 메시지
  if (outOfStockProducts.length > 0) {
    if (stockMessage) stockMessage += '\n';
    stockMessage += outOfStockProducts
      .map(product => `${product.name}: 품절`)
      .join('\n');
  }

  // 전체 재고 부족 메시지
  if (totalStock < 30) {
    if (stockMessage) stockMessage += '\n';
    stockMessage += `전체 재고 부족 (총 ${totalStock}개)`;
  }

  return (
    <div
      id="stock-status"
      className="text-xs text-red-500 mt-3 whitespace-pre-line"
    >
      {stockMessage || '재고 상태 정상'}
    </div>
  );
};
