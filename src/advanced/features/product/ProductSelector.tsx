import React from 'react';
import { useAtom } from 'jotai';
import { productStateAtom } from './model/ProductModel';

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
  const [productState, setProductState] = useAtom(productStateAtom);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProductId = event.target.value;
    setProductState(prev => ({
      ...prev,
      lastSelected: selectedProductId || null,
    }));
  };

  return (
    <select
      id="product-select"
      value={productState.lastSelected || ''}
      onChange={handleChange}
      className={`focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${className || ''}`}
    >
      <option value="">상품을 선택하세요</option>
      {productState.products.map(product => (
        <option key={product.id} value={product.id} disabled={product.q === 0}>
          {product.name} - 가격: ₩{product.val.toLocaleString()}
          {product.q === 0 ? ' (품절)' : ` (재고: ${product.q}개)`}
        </option>
      ))}
    </select>
  );
};
