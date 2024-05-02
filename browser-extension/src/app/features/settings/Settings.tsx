import React from 'react';
import InputText from '../common/components/InputText';
import useSettings from './useSettings';
import Button from '../common/components/Button';
import { PiCaretLeft } from 'react-icons/pi';
import useAuth from '../common/hooks/useAuth';

type Props = {
  onBack: () => void;
};

const Settings: React.FC<Props> = (props) => {
  const { settings, setSetting, save } = useSettings();
  const { hasAuthrized, email, signOut } = useAuth();

  return (
    <div className="p-2">
      <div className="text-base font-semibold mb-1">設定</div>
      <div className="font-light text-aws-font-color-gray text-xs">
        <div>拡張機能を利用するための設定を行います。</div>
        <div>この拡張機能を利用するためには、generative-ai-use-cases-jp のデプロイが必要です。</div>
      </div>

      <div className="flex flex-col mt-3 gap-2">
        <InputText
          label="リージョン（Region）"
          value={settings?.region ?? ''}
          onChange={(val) => {
            setSetting('region', val);
          }}
        />
        <InputText
          label="ユーザプールID（UserPoolId）"
          value={settings?.userPoolId ?? ''}
          onChange={(val) => {
            setSetting('userPoolId', val);
          }}
        />
        <InputText
          label="ユーザープールクライアントID（UserPoolClientId）"
          value={settings?.userPoolClientId ?? ''}
          onChange={(val) => {
            setSetting('userPoolClientId', val);
          }}
        />
        <InputText
          label="アイデンティティプールID（IdPoolId）"
          value={settings?.identityPoolId ?? ''}
          onChange={(val) => {
            setSetting('identityPoolId', val);
          }}
        />
        <InputText
          label="推論関数ARN（PredictStreamFunctionArn）"
          value={settings?.lambdaArn ?? ''}
          onChange={(val) => {
            setSetting('lambdaArn', val);
          }}
        />
        <InputText
          label="APIエンドポイント(ApiEndpoint)"
          value={settings?.apiEndpoint ?? ''}
          onChange={(val) => {
            setSetting('apiEndpoint', val);
          }}
        />
      </div>
      <div className="flex justify-between">
        <Button className="mt-3" outlined icon={<PiCaretLeft />} onClick={props.onBack}>
          戻る
        </Button>
        <Button className="mt-3" onClick={save}>
          設定保存
        </Button>
      </div>

      <div className="mt-5">
        <div className="text-base font-semibold mb-1">ログイン情報</div>
        <div className="text-aws-font-color-gray">
          {hasAuthrized ? (
            <div>
              <div>ログイン者：{email}</div>
              <div className="flex justify-end">
                <Button
                  outlined
                  onClick={() => {
                    signOut();
                  }}
                >
                  ログアウト
                </Button>
              </div>
            </div>
          ) : (
            <div>ログインしていません。</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
