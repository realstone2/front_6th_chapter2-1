import React from 'react';
import { ProductSelector } from '../product/ProductSelector';
import { AddToCartButton } from './AddToCartButton';
import { StockInformation } from './StockInformation';

/**
 * 선택 컨테이너 컴포넌트
 * @returns 선택 컨테이너 JSX 엘리먼트
 */
export const SelectorContainer: React.FC = () => {
  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      {/* 상품 선택기 */}
      <ProductSelector className="w-full p-3 border border-gray-300 rounded-lg text-base mb-3" />

      {/* 장바구니 추가 버튼 */}
      <AddToCartButton id="add-to-cart" />

      {/* 재고 정보 */}
      <StockInformation />
    </div>
  );
};
