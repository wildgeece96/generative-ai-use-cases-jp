import { twMerge } from 'tailwind-merge';
import HighlightMenu from '../app/features/highlight-menu/HighlightMenu';
import Browser from 'webextension-polyfill';
import { useRef, useState } from 'react';
import { MessagePayload } from '../@types/extension-message';

const Content = () => {
  const [isOpenChat, setIsOpenChat] = useState(false);
  const iframe = useRef<null | HTMLIFrameElement>(null);

  Browser.runtime.onMessage.addListener((message: MessagePayload) => {
    if (message.type === 'CHAT-OPEN') {
      setIsOpenChat(true);
    } else if (message.type === 'CHAT-CLOSE') {
      setIsOpenChat(false);
    }
  });

  return (
    <div>
      <HighlightMenu
        onOpenChat={(content, systemContext) => {
          setIsOpenChat(true);

          // Contentからはruntimeのメッセージしか利用できないため、すべてのTABにブロードキャストでメッセージが送信される（ContentからはBrowser.tabsは使えない）
          // 複数画面を立ち上げていると、すべての画面に値が設定されてしまう
          // 拡張機能のメッセージではなく、iframeのメッセージを使い特定のタブのみにメッセージを送る
          iframe.current?.contentWindow?.postMessage(
            {
              type: 'CONTENT',
              content,
            } as MessagePayload,
            '*',
          );
          iframe.current?.contentWindow?.postMessage(
            {
              type: 'SYSTEM-CONTEXT',
              systemContext,
            } as MessagePayload,
            '*',
          );
        }}
      />
      <iframe
        ref={iframe}
        className={twMerge(
          'fixed z-[9999999999999] right-0 top-0 h-dvh shadow-xl border-1 bg-aws-squid-ink transition-all',
          isOpenChat ? 'xl:w-1/3 lg:2/5 md:w-2/5 sm:w-2/3' : 'w-0',
        )}
        src={Browser.runtime.getURL('pages/chat/index.html')}
      />
    </div>
  );
};

export default Content;
