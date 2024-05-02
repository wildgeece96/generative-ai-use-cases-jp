import React, { useCallback, useEffect, useState } from 'react';
import '@aws-amplify/ui-react/styles.css';

import { Amplify } from 'aws-amplify';
import { I18n } from 'aws-amplify/utils';
import { Authenticator, translations } from '@aws-amplify/ui-react';
import Chat from '../../app/features/chat/Chat';
import useSettings from '../../app/features/settings/useSettings';
import Header from '../../app/features/common/components/Header';
import Settings from '../../app/features/settings/Settings';
import Browser from 'webextension-polyfill';
import { MessagePayload } from '../../@types/extension-message';
import PromptSettings from '../../app/features/prompt-settings/PromptSettings';
import { PromptSetting } from '../../@types/settings';

const ChatPage: React.FC = () => {
  const [isOpenSettings, setIsOpenSettings] = useState(false);
  const [isOpenPromptSettings, setIsOpenPromptSettings] = useState(false);
  const { hasConfiguredSettings, settings } = useSettings();

  useEffect(() => {
    if (!hasConfiguredSettings) {
      setIsOpenSettings(true);
    } else {
      setIsOpenSettings(false);
    }
  }, [hasConfiguredSettings]);

  useEffect(() => {
    if (settings) {
      Amplify.configure({
        Auth: {
          Cognito: {
            userPoolId: settings.userPoolId,
            userPoolClientId: settings.userPoolClientId,
            identityPoolId: settings.identityPoolId,
          },
        },
      });
    }
  }, [settings]);

  I18n.putVocabularies(translations);
  I18n.setLanguage('ja');

  const [content, setContent] = useState('');
  const [promptSetting, setPromptSetting] = useState<PromptSetting>({
    systemContextId: '',
    systemContextTitle: '',
    systemContext: '',
  });

  // backgroundからは拡張機能の機能でメッセージを受け取る
  Browser.runtime.onMessage.addListener((message: MessagePayload) => {
    if (message.type === 'CONTENT') {
      setContent(message.content);
    } else if (message.type === 'SYSTEM-CONTEXT') {
      console.log(message);
      setPromptSetting(message.systemContext);
    }
  });

  // Content（親ウインドウ）からは、iframeを通じてメッセージを受け取る
  window.addEventListener('message', (event: MessageEvent<MessagePayload>) => {
    const message = event.data;
    if (message.type === 'CONTENT') {
      setContent(message.content);
    } else if (message.type === 'SYSTEM-CONTEXT') {
      console.log(message);
      setPromptSetting(message.systemContext);
    }
  });

  const closeChat = useCallback(() => {
    setIsOpenPromptSettings(false);
    setIsOpenSettings(false);
    Browser.tabs?.query({ active: true, currentWindow: true }).then(([tab]) => {
      Browser.tabs.sendMessage(tab.id ?? 0, {
        type: 'CHAT-CLOSE',
      } as MessagePayload);
    });
  }, []);

  return (
    <div className="text-white text-sm">
      <Header
        onClickPromptSettings={() => {
          setIsOpenPromptSettings(!isOpenPromptSettings);
          setIsOpenSettings(false);
        }}
        onClickSettings={() => {
          setIsOpenPromptSettings(false);
          setIsOpenSettings(!isOpenSettings);
        }}
        onClickClose={closeChat}
      />
      <div className="pt-14">
        {isOpenSettings && (
          <Settings
            onBack={() => {
              setIsOpenSettings(false);
            }}
          />
        )}
        {isOpenPromptSettings && (
          <PromptSettings
            onBack={() => {
              setIsOpenPromptSettings(false);
            }}
          />
        )}
        {!isOpenSettings && !isOpenPromptSettings && (
          <Authenticator
            components={{
              Header: () => <div className="text-lg font-bold text-white">Bedrock</div>,
            }}
          >
            <Chat initContent={content} initPromptSetting={promptSetting} />
          </Authenticator>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
