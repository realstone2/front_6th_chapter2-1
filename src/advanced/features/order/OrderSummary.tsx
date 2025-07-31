import React, { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { useOrderViewModel } from '../../viewmodels/useOrderViewModel';
import { pointsStateAtom } from '../points/model/PointsModel';

/**
 * 주문 요약 컴포넌트
 * @returns 주문 요약 JSX 엘리먼트
 */
export const OrderSummary: React.FC = () => {
  const orderViewModel = useOrderViewModel();
  const pointsState = useAtomValue(pointsStateAtom);

  // 주문 상태 업데이트
  useEffect(() => {
    orderViewModel.updateOrderState();
  }, [orderViewModel]);

  return (
    <div className="bg-black text-white p-8 flex flex-col">
      <h2 className="text-xs font-medium mb-5 tracking-extra-wide uppercase">
        Order Summary
      </h2>

      <div className="flex-1 flex flex-col">
        <div id="summary-details" className="space-y-3">
          {/* 장바구니 아이템 요약 */}
          {orderViewModel.cartItemSummaries.map((itemSummary, index) => (
            <div
              key={index}
              className="flex justify-between text-xs tracking-wide text-gray-400"
            >
              <span>
                {itemSummary.item.product.name} x {itemSummary.quantity}
              </span>
              <span>₩{itemSummary.itemTotal.toLocaleString()}</span>
            </div>
          ))}

          {/* 소계 */}
          {!orderViewModel.isEmpty && (
            <>
              <div className="border-t border-white/10 my-3"></div>
              <div className="flex justify-between text-sm tracking-wide">
                <span>Subtotal</span>
                <span>₩{orderViewModel.summary.subtotal.toLocaleString()}</span>
              </div>
            </>
          )}

          {/* 할인 정보 */}
          {orderViewModel.summary.hasBulkDiscount && (
            <div className="flex justify-between text-sm tracking-wide text-green-400">
              <span className="text-xs">🎉 대량구매 할인 (30개 이상)</span>
              <span className="text-xs">-25%</span>
            </div>
          )}

          {!orderViewModel.summary.hasBulkDiscount &&
            orderViewModel.summary.itemDiscounts.length > 0 &&
            orderViewModel.summary.itemDiscounts.map((discount, index) => (
              <div
                key={index}
                className="flex justify-between text-sm tracking-wide text-green-400"
              >
                <span className="text-xs">{discount.name} (10개↑)</span>
                <span className="text-xs">-{discount.discount}%</span>
              </div>
            ))}

          {/* 화요일 할인 */}
          {orderViewModel.summary.isTuesday &&
            orderViewModel.summary.finalTotal > 0 && (
              <div className="flex justify-between text-sm tracking-wide text-purple-400">
                <span className="text-xs">🌟 화요일 추가 할인</span>
                <span className="text-xs">-10%</span>
              </div>
            )}

          {/* 배송 정보 */}
          {!orderViewModel.isEmpty && (
            <div className="flex justify-between text-sm tracking-wide text-gray-400">
              <span>Shipping</span>
              <span>Free</span>
            </div>
          )}
        </div>

        <div className="mt-auto">
          {/* 할인 정보 표시 */}
          {orderViewModel.discountInfo && (
            <div className="bg-green-500/20 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs uppercase tracking-wide text-green-400">
                  총 할인율
                </span>
                <span className="text-sm font-medium text-green-400">
                  {(orderViewModel.discountRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-2xs text-gray-300">
                ₩{Math.round(orderViewModel.savedAmount).toLocaleString()}{' '}
                할인되었습니다
              </div>
            </div>
          )}

          <div id="cart-total" className="pt-5 border-t border-white/10">
            <div className="flex justify-between items-baseline">
              <span className="text-sm uppercase tracking-wider">Total</span>
              <div className="text-2xl tracking-tight">
                ₩{Math.round(orderViewModel.finalTotal).toLocaleString()}
              </div>
            </div>
            <div
              id="loyalty-points"
              className="text-xs text-blue-400 mt-2 text-right"
            >
              {pointsState.currentPoints.total > 0 ? (
                <>
                  <div>
                    적립 포인트:{' '}
                    <span className="font-bold">
                      {pointsState.currentPoints.total}p
                    </span>
                  </div>
                  {pointsState.currentPoints.calculation &&
                    pointsState.currentPoints.calculation.details.length >
                      0 && (
                      <div className="text-2xs opacity-70 mt-1">
                        {pointsState.currentPoints.calculation.details.join(
                          ', '
                        )}
                      </div>
                    )}
                </>
              ) : (
                <div>적립 포인트: 0p</div>
              )}
            </div>
          </div>

          {/* 화요일 특별 할인 표시 */}
          {orderViewModel.summary.isTuesday &&
            orderViewModel.summary.finalTotal > 0 && (
              <div
                id="tuesday-special"
                className="mt-4 p-3 bg-white/10 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xs">🎉</span>
                  <span className="text-xs uppercase tracking-wide">
                    Tuesday Special 10% Applied
                  </span>
                </div>
              </div>
            )}
        </div>
      </div>

      <button className="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
        Proceed to Checkout
      </button>

      <p className="mt-4 text-2xs text-white/60 text-center leading-relaxed">
        Free shipping on all orders.
        <br />
        <span id="points-notice">Earn loyalty points with purchase.</span>
      </p>
    </div>
  );
};
