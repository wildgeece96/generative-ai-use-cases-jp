import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Location, useLocation, useParams } from 'react-router-dom';
import InputChatContent from '../components/InputChatContent';
import useChat from '../hooks/useChat';
import useChatApi from '../hooks/useChatApi';
import useConversation from '../hooks/useConversation';
import ChatMessage from '../components/ChatMessage';
import PromptList from '../components/PromptList';
import Button from '../components/Button';
import ButtonCopy from '../components/ButtonCopy';
import ModalDialog from '../components/ModalDialog';
import ExpandableField from '../components/ExpandableField';
import useScroll from '../hooks/useScroll';
import { PiArrowClockwiseBold, PiShareFatFill } from 'react-icons/pi';
import { create } from 'zustand';
import { ReactComponent as BedrockIcon } from '../assets/bedrock.svg';
import { ChatPageLocationState } from '../@types/navigate';
import { SelectField } from '@aws-amplify/ui-react';
import { MODELS } from '../hooks/useModel';

type StateType = {
  modelId: string;
  content: string;
  inputSystemContext: string;
  setModelId: (c: string) => void;
  setContent: (c: string) => void;
  setInputSystemContext: (c: string) => void;
};

const useChatPageState = create<StateType>((set) => {
  return {
    modelId: '',
    content: '',
    inputSystemContext: '',
    setModelId: (s: string) => {
      set(() => ({
        modelId: s,
      }));
    },
    setContent: (s: string) => {
      set(() => ({
        content: s,
      }));
    },
    setInputSystemContext: (s: string) => {
      set(() => ({
        inputSystemContext: s,
      }));
    },
  };
});

const ChatPage: React.FC = () => {
  const {
    modelId,
    content,
    inputSystemContext,
    setModelId,
    setContent,
    setInputSystemContext,
  } = useChatPageState();
  const { state, pathname } = useLocation() as Location<ChatPageLocationState>;
  const { chatId } = useParams();

  const {
    loading,
    loadingMessages,
    isEmpty,
    messages,
    rawMessages,
    clear,
    postChat,
    updateSystemContext,
    getCurrentSystemContext,
  } = useChat(pathname, chatId);
  const { createShareId, findShareId, deleteShareId } = useChatApi();
  const { scrollToBottom, scrollToTop } = useScroll();
  const { getConversationTitle } = useConversation();
  const { modelIds: availableModels, textModels } = MODELS;
  const { data: share, mutate: reloadShare } = findShareId(chatId);

  const title = useMemo(() => {
    if (chatId) {
      return getConversationTitle(chatId) || 'チャット';
    } else {
      return 'チャット';
    }
  }, [chatId, getConversationTitle]);

  useEffect(() => {
    if (state !== null) {
      if (state.systemContext !== '') {
        updateSystemContext(state.systemContext);
      } else {
        clear();
        setInputSystemContext(currentSystemContext);
      }

      setContent(state.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, setContent]);

  useEffect(() => {
    if (!modelId) {
      setModelId(availableModels[0]);
    }
  }, [modelId, availableModels, setModelId]);

  const onSend = useCallback(() => {
    postChat(
      content,
      false,
      textModels.find((m) => m.modelId === modelId)
    );
    setContent('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId, content]);

  const onReset = useCallback(() => {
    clear();
    setContent('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clear]);

  const [creatingShareId, setCreatingShareId] = useState(false);
  const [deletingShareId, setDeletingShareId] = useState(false);
  const [showShareIdModal, setShowShareIdModal] = useState(false);

  const onCreateShareId = useCallback(async () => {
    try {
      setCreatingShareId(true);
      await createShareId(chatId!);
      reloadShare();
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingShareId(false);
    }
  }, [chatId, createShareId, reloadShare]);

  const onDeleteShareId = useCallback(async () => {
    try {
      setDeletingShareId(true);
      await deleteShareId(share!.shareId.split('#')[1]);
      reloadShare();
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingShareId(false);
    }
  }, [share, deleteShareId, reloadShare]);

  const shareLink = useMemo(() => {
    if (share) {
      return `${window.location.origin}/share/${share.shareId.split('#')[1]}`;
    } else {
      return null;
    }
  }, [share]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    } else {
      scrollToTop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const [showSystemContext, setShowSystemContext] = useState(false);

  const showingMessages = useMemo(() => {
    if (showSystemContext) {
      return rawMessages;
    } else {
      return messages;
    }
  }, [showSystemContext, rawMessages, messages]);

  const currentSystemContext = useMemo(() => {
    return getCurrentSystemContext();
  }, [getCurrentSystemContext]);

  useEffect(() => {
    setInputSystemContext(currentSystemContext);
  }, [currentSystemContext, setInputSystemContext]);

  return (
    <>
      <div className={`${!isEmpty ? 'screen:pb-36' : ''} relative`}>
        <div className="invisible my-0 flex h-0 items-center justify-center text-xl font-semibold lg:visible lg:my-5 lg:h-min print:visible print:my-5 print:h-min">
          {title}
        </div>

        <div className="mt-2 flex w-full items-end justify-center lg:mt-0">
          <SelectField
            label="モデル"
            labelHidden
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}>
            {availableModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </SelectField>
        </div>

        {((isEmpty && !loadingMessages) || loadingMessages) && (
          <div className="relative flex h-[calc(100vh-13rem)] flex-col items-center justify-center">
            <BedrockIcon
              className={`fill-gray-400 ${
                loadingMessages ? 'animate-pulse' : ''
              }`}
            />
          </div>
        )}

        {!isEmpty && !loadingMessages && (
          <div className="my-2 flex flex-col items-end pr-3">
            {chatId && (
              <div>
                <button
                  className="mb-1 flex items-center justify-center text-xs hover:underline"
                  onClick={() => {
                    setShowShareIdModal(true);
                  }}>
                  <PiShareFatFill className="mr-1" />
                  {share ? <>シェア中</> : <>シェアする</>}
                </button>
              </div>
            )}
            <label className="relative inline-flex cursor-pointer items-center hover:underline">
              <input
                type="checkbox"
                value=""
                className="peer sr-only"
                checked={showSystemContext}
                onChange={() => {
                  setShowSystemContext(!showSystemContext);
                }}
              />
              <div className="peer-checked:bg-aws-smile peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full"></div>
              <span className="ml-1 text-xs font-medium">
                システムコンテキストの表示
              </span>
            </label>
          </div>
        )}

        {!isEmpty &&
          showingMessages.map((chat, idx) => (
            <div key={showSystemContext ? idx : idx + 1}>
              {idx === 0 && (
                <div className="w-full border-b border-gray-300"></div>
              )}
              <ChatMessage
                chatContent={chat}
                loading={loading && idx === showingMessages.length - 1}
              />
              <div className="w-full border-b border-gray-300"></div>
            </div>
          ))}

        <div className="fixed bottom-0 z-0 flex w-full flex-col items-center justify-center lg:pr-64 print:hidden">
          {isEmpty && !loadingMessages && !chatId && (
            <ExpandableField
              label="システムコンテキスト"
              className="relative w-11/12 md:w-10/12 lg:w-4/6 xl:w-3/6">
              <>
                <div className="absolute -top-2 right-0 mb-2 flex justify-end">
                  <Button
                    outlined
                    className="text-xs"
                    onClick={() => {
                      clear();
                      setInputSystemContext(currentSystemContext);
                    }}>
                    初期化
                  </Button>
                </div>
                <InputChatContent
                  disableMarginBottom={true}
                  content={inputSystemContext}
                  onChangeContent={setInputSystemContext}
                  fullWidth={true}
                  resetDisabled={true}
                  disabled={inputSystemContext === currentSystemContext}
                  sendIcon={<PiArrowClockwiseBold />}
                  onSend={() => {
                    updateSystemContext(inputSystemContext);
                  }}
                  hideReset={true}
                />
              </>
            </ExpandableField>
          )}
          <InputChatContent
            content={content}
            disabled={loading}
            onChangeContent={setContent}
            resetDisabled={!!chatId}
            onSend={() => {
              onSend();
            }}
            onReset={onReset}
          />
        </div>
      </div>

      {isEmpty && !loadingMessages && <PromptList />}

      <ModalDialog
        isOpen={showShareIdModal}
        title="会話履歴のシェア"
        onClose={() => {
          setShowShareIdModal(false);
        }}>
        <div className="py-3 text-xs text-gray-600">
          {share ? (
            <>リンクを削除することで、会話履歴の公開を停止できます。</>
          ) : (
            <>
              リンクを作成することで、このアプリケーションにログイン可能な全ユーザーに対して会話履歴を公開します。
            </>
          )}
        </div>
        {shareLink && (
          <div className="bg-aws-squid-ink my-2 flex flex-row items-center justify-between rounded px-2 py-1 text-white">
            <div className="break-all text-sm">{shareLink}</div>
            <ButtonCopy text={shareLink} />
          </div>
        )}
        <div className="flex justify-end py-3">
          {share ? (
            <div className="flex">
              <Button
                onClick={() => {
                  window.open(shareLink!, '_blank', 'noreferrer');
                }}
                outlined
                className="mr-1"
                loading={deletingShareId}>
                リンクを開く
              </Button>
              <Button
                onClick={onDeleteShareId}
                loading={deletingShareId}
                className="bg-red-500">
                リンクの削除
              </Button>
            </div>
          ) : (
            <Button onClick={onCreateShareId} loading={creatingShareId}>
              リンクの作成
            </Button>
          )}
        </div>
      </ModalDialog>
    </>
  );
};

export default ChatPage;
