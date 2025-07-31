import React from 'react';

interface AddToCartButtonProps {
  id?: string;
}

/**
 * 장바구니 추가 버튼 컴포넌트
 * @returns 장바구니 추가 버튼 JSX 엘리먼트
 */
export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ id }) => {
  // TODO: 클릭 이벤트 및 상태 관리는 다음 Phase에서 구현

  const handleClick = () => {
    // 이벤트 처리 로직은 다음 Phase에서 구현
    console.log('Add to cart clicked');
  };

  return (
    <button
      id={id}
      onClick={handleClick}
      className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all"
    >
      Add to Cart
    </button>
  );
};
