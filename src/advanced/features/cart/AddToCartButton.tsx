import React from 'react';
import { useCartViewModel } from '../../viewmodels/useCartViewModel';
import { useAtomValue } from 'jotai';
import { productStateAtom } from '../product/model/ProductModel';

interface AddToCartButtonProps {
  id?: string;
}

/**
 * 장바구니 추가 버튼 컴포넌트
 * @returns 장바구니 추가 버튼 JSX 엘리먼트
 */
export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ id }) => {
  const cartViewModel = useCartViewModel();
  const productState = useAtomValue(productStateAtom);

  // 현재 선택된 상품 계산
  const selectedProduct = productState.lastSelected
    ? productState.products.find(p => p.id === productState.lastSelected)
    : null;

  const handleClick = () => {
    // 선택된 상품이 있는지 확인
    if (selectedProduct) {
      // 기본 수량 1개로 장바구니에 추가
      cartViewModel.addItem(selectedProduct, 1);

      // 총계 재계산
      setTimeout(() => {
        cartViewModel.calculateTotals();
      }, 0);

      console.log('Added to cart:', selectedProduct.name);
    } else {
      console.warn('No product selected');
      alert('상품을 선택해주세요.');
    }
  };

  // 선택된 상품이 없거나 재고가 없으면 버튼 비활성화
  const isDisabled = !selectedProduct || selectedProduct.q === 0;

  return (
    <button
      id={id}
      onClick={handleClick}
      disabled={isDisabled}
      className={`w-full py-3 text-sm font-medium uppercase tracking-wider transition-all ${
        isDisabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-black text-white hover:bg-gray-800'
      }`}
    >
      {isDisabled ? 'Out of Stock' : 'Add to Cart'}
    </button>
  );
};
