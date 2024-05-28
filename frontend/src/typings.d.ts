interface Window {
    api: {
      saveFile: (filename: string, content: string) => Promise<void>;
      readFile: (filename: string) => Promise<string>;
      assemble: (filename: string) => Promise<string>;
      openFileDialog: (options: any) => Promise<string[]>;
    };
  }