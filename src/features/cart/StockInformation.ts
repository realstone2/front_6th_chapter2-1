import { handleStockInfoUpdate } from '../stock/stockEventHandlers.ts';

/**
 * 재고 정보 컴포넌트
 * @returns 재고 정보 DOM Element
 */
export function StockInformation(): HTMLElement {
  const stockInformation = document.createElement('div');
  stockInformation.id = 'stock-status';
  stockInformation.className = 'text-xs text-red-500 mt-3 whitespace-pre-line';

  // 초기 재고 정보 설정
  handleStockInfoUpdate();

  return stockInformation;
}
