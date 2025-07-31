import React from 'react';

interface ProductSelectorProps {
  className?: string;
}

/**
 * 상품 선택 드롭다운 컴포넌트
 * @returns 상품 선택 드롭다운 JSX 엘리먼트
 */
export const ProductSelector: React.FC<ProductSelectorProps> = ({
  className,
}) => {
  // TODO: 이벤트 및 상태 관리는 다음 Phase에서 구현

  return (
    <select
      id="product-select"
      className={`focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${className || ''}`}
    >
      <option value="">상품을 선택하세요</option>
      <option value="p1">버그 없애는 키보드 - 가격: ₩60,000</option>
      <option value="p2">시간을 절약하는 마우스 - 가격: ₩20,000</option>
      <option value="p3">집중력 높이는 모니터암 - 가격: ₩120,000</option>
      <option value="p4" disabled>
        코드 품질 높이는 의자 - 가격: ₩300,000 (품절)
      </option>
      <option value="p5">스트레스 줄이는 스피커 - 가격: ₩50,000</option>
    </select>
  );
};
