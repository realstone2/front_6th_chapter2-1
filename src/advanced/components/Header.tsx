import React from 'react';
import { useAtomValue } from 'jotai';
import { uiStateAtom } from '../features/ui/model/UIModel';

/**
 * 헤더 컴포넌트
 * UI Model을 직접 구독하여 동적 헤더 정보를 표시합니다.
 * @returns 헤더 JSX 엘리먼트
 */
export const Header: React.FC = () => {
  const uiState = useAtomValue(uiStateAtom);

  return (
    <div className="mb-8">
      <h1 className="text-xs font-medium tracking-extra-wide uppercase mb-2">
        🛒 Hanghae Online Store
      </h1>
      <div className="text-5xl tracking-tight leading-none">Shopping Cart</div>
      <p id="item-count" className="text-sm text-gray-500 font-normal mt-3">
        🛍️ {uiState.header.itemCount} items in cart
      </p>
    </div>
  );
};
