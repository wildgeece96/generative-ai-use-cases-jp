import React, { useMemo } from 'react';
import { BaseProps } from '../@types/common';
import { PiArrowLineDownFill, PiArrowLineUpFill } from 'react-icons/pi';
import useScreen from '../hooks/useScreen';

type Props = BaseProps;

const ScrollTopBottom: React.FC<Props> = (props) => {
  const { isAtBottom, isAtTop, scrollToBottom, scrollToTop } = useScreen();

  // 最下部までスクロールが可能かどうか
  // すでに到達している場合は不可
  const scrollToBottomAvailable = useMemo(() => {
    return !isAtBottom;
  }, [isAtBottom]);

  // 最上部までスクロール可能かどうか
  // すでに到達している場合は不可
  const scrollToTopAvailable = useMemo(() => {
    return !isAtTop;
  }, [isAtTop]);

  return (
    <div
      className={`flex w-fit flex-col text-2xl text-white ${!scrollToTopAvailable && !scrollToBottomAvailable ? 'hidden' : ''} ${props.className ?? ''}`}>
      <button
        className={`flex h-8 w-8 items-center justify-center rounded-t bg-gray-400 ${scrollToTopAvailable ? 'opacity-80' : 'opacity-30'}`}
        onClick={scrollToTop}
        disabled={!scrollToTopAvailable}>
        <PiArrowLineUpFill />
      </button>
      <button
        className={`flex h-8 w-8 items-center justify-center rounded-b bg-gray-400 ${scrollToBottomAvailable ? 'opacity-80' : 'opacity-30'}`}
        onClick={scrollToBottom}
        disabled={!scrollToBottomAvailable}>
        <PiArrowLineDownFill />
      </button>
    </div>
  );
};

export default ScrollTopBottom;
