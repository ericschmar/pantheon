import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { print } from '@/ast/formatter';
import { Lexer } from '@/ast/lexer';
import { Parser } from '@/ast/parser';
import Button from '@/components/button';
import CustomEditor from '@/components/editor/editor';
import TabViewer from '@/components/tab-viewer/tab-viewer';
import TreeView from '@/components/tree-viewer';
import { Search } from '@/lib/wailsjs/go/main/App';
import { SearchIcon, Command, ArrowUp, LoaderCircle } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

// Define types for better type safety
interface SearchResult {
  [key: string]: any;
}

const SearchPage = () => {
  // Convert React states to Preact signals
  const code = useSignal<string>('(objectClass=*)');
  const error = useSignal<string | null>(null);
  const percentageHeight = useSignal<number>(0.35);
  const loading = useSignal<boolean>(false);

  useHotkeys(
    ['ctrl+shift+enter', 'meta+shift+enter'],
    () => {
      search();
    },
    { enableOnContentEditable: true },
  );

  useHotkeys(
    ['meta+k'],
    () => {
      format();
    },
    { enableOnContentEditable: true },
  );

  useEffect(() => {
    if (code.value === '') {
      error.value = '';
      return;
    }
  }, [code.value]);

  const onLayout = (sizes: number[]): void => {
    percentageHeight.value = (sizes[1] - 17) / 100;
  };

  function search(): void {
    console.log('search');

    loading.value = true;

    try {
      const lexer = new Lexer(code.value);
      const parser = new Parser(lexer);
      const ast = parser.parse();
      code.value = print(ast);
      error.value = '';

      // Execute the search asynchronously
      Search(code.value.replace(/(?:\r\n|\r|\n|\s|\t)/g, ''))
        .then((results: SearchResult) => {
          console.log(results);
          loading.value = false;
        })
        .catch((ex: Error) => {
          console.log(ex);
          error.value = ex.message;
          loading.value = false;
        });
    } catch (ex) {
      console.log(ex);
      error.value = (ex as Error).message;
      loading.value = false;
    }
  }

  function format(): void {
    console.log('format');
    try {
      error.value = '';
      const lexer = new Lexer(code.value);
      const parser = new Parser(lexer);
      const ast = parser.parse();
      code.value = print(ast);
    } catch (ex) {
      console.log(ex);
      error.value = (ex as Error).message;
    }
  }

  return h(
    'div',
    { className: 'w-full h-screen grid grid-cols-16 gap-1' },
    h(
      'div',
      { className: 'col-span-5 h-screen' },
      h(
        'div',
        {
          className:
            'ml-5 grow border-l grid-border-color h-screen pt-3 overflow-y-auto',
        },
        h(TreeView, {}),
      ),
    ),
    h(
      'div',
      {
        className:
          'flex flex-col col-span-11 h-full pt-[0.6rem] pl-[0.3rem] pr-[0.3rem] overflow-hidden',
      },
      h(
        PanelGroup,
        { direction: 'vertical', onLayout: onLayout },
        h(Panel, { maxSize: 66, defaultSize: 66 }, h(TabViewer, {})),
        h(PanelResizeHandle, { className: 'py-2' }),
        h(
          Panel,
          { maxSize: 45, defaultSize: 35 },
          h(CustomEditor, {
            code: code.value,
            setCode: (newValue) => {
              code.value =
                typeof newValue === 'function'
                  ? newValue(code.value)
                  : newValue;
            },
            percentageHeight: percentageHeight.value,
          }),
          h(
            'div',
            { className: 'flex flex-row' },
            error.value &&
              h('p', { className: 'text-xs text-red-500' }, error.value),
            h(
              Button,
              {
                onClick: () => format(),
                variant: 'light',
                className: 'ml-auto mr-4',
              },
              h(SearchIcon, {
                size: 10,
                className: 'stroke-white dark:stroke-gray-300',
              }),
              'Format',
              h(
                'kbd',
                {
                  className:
                    'h-5 px-1.5 max-w-max rounded-xs flex items-center gap-0.5 text-[.6875rem] font-bold text-gray-900 dark:text-gray-300 border border-gray-500/20 dark:border-offgray-400/10 bg-gray-50/50 dark:bg-cream-900/10 hidden sm:flex bg-white/10! border-white/20!',
                },
                h(Command, {
                  size: 10,
                  className: 'stroke-black dark:stroke-gray-300',
                }),
                h(ArrowUp, {
                  size: 10,
                  className: 'stroke-black dark:stroke-gray-300',
                }),
                'K',
              ),
            ),
            h(
              Button,
              {
                onClick: () => search(),
                variant: 'active',
                className: 'mr-4',
              },
              loading.value
                ? h(LoaderCircle, {
                    size: 10,
                    className: 'animate-spin',
                    color: 'white',
                  })
                : h(SearchIcon, {
                    size: 10,
                    className: 'stroke-white dark:stroke-gray-300',
                  }),
              'Search',
              h(
                'kbd',
                {
                  className:
                    'h-5 px-1.5 max-w-max rounded-xs flex items-center gap-0.5 text-[.6875rem] font-bold text-gray-500 dark:text-gray-300 border border-gray-500/20 dark:border-offgray-400/10 bg-gray-50/50 dark:bg-cream-900/10 hidden sm:flex bg-white/10! border-white/20! text-white!',
                },
                h(Command, {
                  size: 10,
                  className: 'stroke-white dark:stroke-gray-300',
                }),
                h(ArrowUp, {
                  size: 10,
                  className: 'stroke-white dark:stroke-gray-300',
                }),
                'Enter',
              ),
            ),
          ),
        ),
      ),
    ),
  );
};

export default SearchPage;
