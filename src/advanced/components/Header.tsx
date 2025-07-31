import React from 'react';

interface HeaderProps {
  itemCount: number;
}

/**
 * 헤더 컴포넌트
 * @param props - 컴포넌트 props
 * @param props.itemCount - 장바구니 아이템 개수
 * @returns 헤더 JSX 엘리먼트
 */
export const Header: React.FC<HeaderProps> = ({ itemCount }) => {
  return (
    <div className="mb-8">
      <h1 className="text-xs font-medium tracking-extra-wide uppercase mb-2">
        🛒 Hanghae Online Store
      </h1>
      <div className="text-5xl tracking-tight leading-none">Shopping Cart</div>
      <p id="item-count" className="text-sm text-gray-500 font-normal mt-3">
        🛍️ {itemCount} items in cart
      </p>
    </div>
  );
};
