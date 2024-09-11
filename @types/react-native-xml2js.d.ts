declare module "react-native-xml2js" {
  interface ParserOptions {
    explicitArray?: boolean;
    trim?: boolean;
    // Add any additional options if needed
  }

  class Parser {
    constructor(options?: ParserOptions);
    parseString(xml: string, callback: (err: Error | null, result: any) => void): void;
  }

  function parseStringPromise(xml: string): Promise<any>;

  export { Parser, parseStringPromise };
}
