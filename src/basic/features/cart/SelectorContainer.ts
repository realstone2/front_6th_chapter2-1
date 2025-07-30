import { ProductSelector } from '../product/ProductSelector.ts';
import { AddToCartButton } from './AddToCartButton.ts';
import { StockInformation } from './StockInformation.ts';

/**
 * 선택 컨테이너 컴포넌트
 * @returns 선택 컨테이너 DOM Element
 */
export function SelectorContainer(): HTMLElement {
  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'mb-6 pb-6 border-b border-gray-200';

  // 상품 선택기 생성
  const productSelector = ProductSelector();
  productSelector.className =
    'w-full p-3 border border-gray-300 rounded-lg text-base mb-3';

  // 장바구니 추가 버튼 생성
  const addToCartButton = AddToCartButton();
  addToCartButton.id = 'add-to-cart';

  // 재고 정보 생성
  const stockInformation = StockInformation();

  // 자식 요소들을 컨테이너에 추가
  selectorContainer.appendChild(productSelector);
  selectorContainer.appendChild(addToCartButton);
  selectorContainer.appendChild(stockInformation);

  return selectorContainer;
}
