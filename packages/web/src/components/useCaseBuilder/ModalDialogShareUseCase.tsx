import React, { useMemo } from 'react';
import ModalDialog from '../ModalDialog';
import Button from '../Button';
import { BaseProps } from '../../@types/common';
import Switch from '../Switch';
import ButtonCopy from '../ButtonCopy';
import { ROUTE_INDEX_USE_CASE_BUILDER } from '../../main';

type Props = BaseProps & {
  isOpen: boolean;
  isShared: boolean;
  useCaseId: string;
  onToggleShared: () => void;
  onClose: () => void;
};

const ModalDialogShareUseCase: React.FC<Props> = (props) => {
  const shareUrl = useMemo(() => {
    return `${window.location.origin}${ROUTE_INDEX_USE_CASE_BUILDER}/execute/${props.useCaseId}`;
  }, [props.useCaseId]);

  return (
    <ModalDialog
      isOpen={props.isOpen}
      title="共有"
      onClose={() => {
        props.onClose();
      }}>
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <Switch
            checked={props.isShared}
            className="text-xl"
            label={
              props.isShared
                ? 'このユースケースは、このアプリケーションにログインできる全ユーザーが利用できます。'
                : 'このユースケースは共有されていないため、あなたしか利用できません。'
            }
            onSwitch={() => {
              props.onToggleShared();
            }}
          />
        </div>

        <div className="flex flex-col">
          {props.isShared && (
            <>
              <div className="flex grow ">
                <div className="bg-aws-squid-ink my-2 flex flex-row items-center justify-between rounded px-2 py-1 text-white">
                  <div className="break-all text-sm">{shareUrl}</div>
                  <ButtonCopy text={shareUrl} />
                </div>
              </div>
              <div className="text-xs text-gray-400">
                この共有URLにアクセスすることで、他のユーザーもこのユースケースを利用できます。
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => {
              props.onClose();
            }}>
            OK
          </Button>
        </div>
      </div>
    </ModalDialog>
  );
};

export default ModalDialogShareUseCase;
