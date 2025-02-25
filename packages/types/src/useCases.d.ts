export type HiddenUseCases = {
  generate?: boolean;
  summarize?: boolean;
  writer?: boolean;
  translate?: boolean;
  webContent?: boolean;
  image?: boolean;
  video?: boolean;
  diagram?: boolean;
};

export type HiddenUseCasesKeys = keyof HiddenUseCases;
