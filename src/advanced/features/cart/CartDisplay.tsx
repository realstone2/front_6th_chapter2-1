import React from 'react';
import { useCartViewModel } from '../../viewmodels/useCartViewModel';
import { useCartCalculationViewModel } from '../../viewmodels/useCartCalculationViewModel';

/**
 * 개별 장바구니 아이템 컴포넌트
 */
const CartItem: React.FC<{
  item: any;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}> = ({ item, onUpdateQuantity, onRemove }) => {
  const calculationViewModel = useCartCalculationViewModel();

  // 아이템의 최종 가격 계산
  const finalPrice = calculationViewModel.calculateItemFinalPrice(
    item,
    calculationViewModel.calculateCartTotals([item]).totalQuantity
  );

  return (
    <div className="flex justify-between items-center p-3 bg-white rounded border-b last:border-b-0">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded mr-3"></div>
        <div>
          <div className="font-medium">{item.product.name}</div>
          <div className="text-sm text-gray-600">
            {item.product.val.toLocaleString()}원 × {item.quantity}개
          </div>
          {finalPrice !== item.product.val * item.quantity && (
            <div className="text-sm text-red-600">
              할인: -
              {(item.product.val * item.quantity - finalPrice).toLocaleString()}
              원
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <button
          onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
          className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-l"
          data-change="-1"
        >
          -
        </button>
        <span className="w-12 text-center bg-gray-100">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-r"
          data-change="1"
        >
          +
        </button>
        <button
          onClick={onRemove}
          className="ml-3 text-red-500 hover:text-red-700"
        >
          삭제
        </button>
      </div>
    </div>
  );
};

/**
 * 장바구니 표시 컴포넌트
 * @returns 장바구니 표시 JSX 엘리먼트
 */
export const CartDisplay: React.FC = () => {
  const cartViewModel = useCartViewModel();
  const calculationViewModel = useCartCalculationViewModel();

  // 장바구니가 비어있는 경우
  if (calculationViewModel.isEmpty(cartViewModel.items)) {
    return (
      <div id="cart-items">
        <div className="text-gray-500 text-center py-8">
          장바구니가 비어있습니다
        </div>
      </div>
    );
  }

  // 장바구니 총계 계산
  const cartTotals = calculationViewModel.calculateCartTotals(
    cartViewModel.items
  );

  return (
    <div id="cart-items">
      <div className="space-y-2">
        {cartViewModel.items.map((item, index) => (
          <CartItem
            key={item.product.id}
            item={item}
            onUpdateQuantity={quantity =>
              cartViewModel.updateItemQuantity(item.product.id, quantity)
            }
            onRemove={() => cartViewModel.removeItem(item.product.id)}
          />
        ))}
      </div>

      {/* 할인 정보 표시 */}
      {cartTotals.itemDiscounts.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded">
          <div className="text-sm font-medium text-yellow-800 mb-2">
            적용된 할인
          </div>
          {cartTotals.itemDiscounts.map((discount, index) => (
            <div key={index} className="text-sm text-yellow-700">
              • {discount.name}: -{discount.discount.toLocaleString()}원
            </div>
          ))}
        </div>
      )}

      {/* 총계 정보 표시 */}
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <div className="flex justify-between text-sm">
          <span>소계:</span>
          <span>{cartTotals.subtotal.toLocaleString()}원</span>
        </div>
        {cartTotals.totalDiscount > 0 && (
          <div className="flex justify-between text-sm text-red-600">
            <span>할인:</span>
            <span>-{cartTotals.totalDiscount.toLocaleString()}원</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
          <span>총계:</span>
          <span>{cartTotals.finalTotal.toLocaleString()}원</span>
        </div>
      </div>
    </div>
  );
};
