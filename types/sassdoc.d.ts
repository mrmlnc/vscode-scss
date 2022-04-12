declare module 'sassdoc' {
  export = sassdoc;

  function sassdoc(
    source?: string | string[],
    options?: sassdoc.SassDocOptions,
  ): Promise<void>;

  module sassdoc {
    export type SassDocOptions = {
      /**
       * @default "./sassdoc"
       */
      dest?: string;
      /**
       * @default "[]"
       */
      exclude?: string[];
      /**
       * @default "./package.json"
       */
      package?: string | Object;
      /**
       * @default "default"
       */
      theme?: string;
      /**
       * @default "['requires', 'throws', 'content']"
       */
      autofill?: string[];
      /**
       * @default "{ undefined: 'general' }"
       */
      groups?: Object;
      /**
       * @default "false"
       */
      noUpdateNotifier?: boolean;
      /**
       * @default "false"
       */
      verbose?: boolean;
      /**
       * @default "false"
       */
      strict?: boolean;
    };

    type Range = {
      start: number;
      end: number;
    };

    type Parameter = {
      type: string;
      name: string;
      description: string;
    };

    type Require = {
      type: string;
      name: string;
      autofill: boolean;
      item: ParseResult;
    };

    export type ParseResult = {
      description?: string;
      commentRange: Range;
      context: {
        type: string;
        name: string;
        code: string;
        line: Range;
      };
      author?: string[];
      access: 'public' | 'private';
      parameter?: Array<Parameter>;
      return:
        | undefined
        | {
            type: string;
          };
      group: string[];
      require: Array<Require>;
      usedBy?: Array<ParseResult | 'Circular'>;
      file: {
        path: string;
        name: string;
      };
    };

    var parse: (
      source?: string | string[],
      options?: SassDocOptions,
    ) => Promise<Array<ParseResult>>;
  }
}
