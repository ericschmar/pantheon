import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { signal, useSignal } from '@preact/signals';
import {
  GetCredentials,
  Connect,
  DeleteCredential,
  TestConnection,
} from '../lib/wailsjs/go/main/App';
import { services } from '@/lib/wailsjs/go/models';
import Button from '@/components/button';
import {
  CheckCircle,
  Command,
  LoaderCircle,
  TestTube,
  Trash,
  Unplug,
  XCircle,
  Shield,
  ShieldOff,
} from 'lucide-react';
import TextInput from '@/components/input';
import ToggleButton from '@/components/toggle-botton/toggle-button';
import { navigate } from 'wouter/use-hash-location';
import { useHotkeys } from 'react-hotkeys-hook';

// Define types
interface ConnectionState {
  name: string;
  host: string;
  username: string;
  password: string;
  base_dn: string;
  port: string;
  key: string;
  is_favorited: boolean;
  use_tls: boolean;
}

// Create signals for the connection state
const name = signal<string>('');
const host = signal<string>('');
const username = signal<string>('');
const password = signal<string>('');
const base_dn = signal<string>('');
const port = signal<string>('');
const key = signal<string>(''); // empty for new connections
const is_favorited = signal<boolean>(true);
const use_tls = signal<boolean>(false);

function ConnectPage() {
  const loading = useSignal<boolean>(false);
  const isConnectionValid = useSignal<boolean | null>(null);
  const credentials = useSignal<services.LdapConn[]>([]);

  useHotkeys(
    ['ctrl+enter', 'meta+enter'],
    () => {
      connect();
    },
    [],
  );

  useEffect(() => {
    const fetchCredentials = async (): Promise<void> => {
      loading.value = true;
      const creds = await GetCredentials();
      credentials.value = creds;
      loading.value = false;
    };

    fetchCredentials();
  }, []);

  function connect(): void {
    loading.value = true;

    // Create connection object from signals
    const connectionState: ConnectionState = {
      name: name.value,
      host: host.value,
      username: username.value,
      password: password.value,
      base_dn: base_dn.value,
      port: port.value,
      key: key.value,
      is_favorited: is_favorited.value,
      use_tls: use_tls.value,
    };

    Connect(connectionState).then(() => {
      loading.value = false;
      navigate('/search');
    });
  }

  function delete_connection(connectionKey: string): void {
    loading.value = true;
    DeleteCredential(connectionKey).then(() => {
      GetCredentials().then((creds) => {
        credentials.value = creds;
        loading.value = false;
      });
    });
  }

  function test_connection(): void {
    loading.value = true;

    // Create connection object from signals
    const connectionState: ConnectionState = {
      name: name.value,
      host: host.value,
      username: username.value,
      password: password.value,
      base_dn: base_dn.value,
      port: port.value,
      key: key.value,
      is_favorited: is_favorited.value,
      use_tls: use_tls.value,
    };

    TestConnection(connectionState).then((result: string) => {
      if (result === '') isConnectionValid.value = true;
      else isConnectionValid.value = false;
      loading.value = false;
    });
  }

  function loadConnection(cred: services.LdapConn): void {
    key.value = cred.key;
    use_tls.value = cred.use_tls;
    base_dn.value = cred.base_dn;
    port.value = cred.port;
    host.value = cred.host;
    username.value = cred.username;
    password.value = cred.password;
    name.value = cred.name;
  }

  return h(
    'div',
    {
      className:
        'flex flex-col justify-center h-full min-w-[70%] mx-auto my-auto',
    },
    h(
      'div',
      { className: 'w-full relative grid grid-cols-16 gap-3' },
      h(
        'div',
        { className: 'col-span-8 border-r border-gray-200 pr-2' },
        h(
          'h2',
          {
            className:
              'text-left font-lora text-pretty h2 text-accent-blue dark:text-blue-300 font-medium text-lg pl-2 pb-2',
          },
          '️⭐ Favorites',
        ),
        credentials.value === null || credentials.value.length === 0
          ? h(
              'p',
              { className: 'text-xs text-offgray-600' },
              'Create a new connection and add it to your favorites.',
            )
          : null,
        h(
          'div',
          { className: 'flex flex-col overflow-y-auto' },
          credentials.value &&
            credentials.value.map((cred: services.LdapConn) =>
              h(
                'div',
                {
                  className:
                    'mb-4 w-[98%] h-full border flex flex-row place-content-between items-center default-border-color rounded-sm p-2.5 bg-white/60 dark:bg-offgray-800/8 shadow-[6px_6px_0_hsla(219,_93%,_42%,_0.06)] dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.08)]',
                  key: cred.key,
                },
                h(
                  'div',
                  { className: 'flex flex-col gap-2' },
                  h(
                    'p',
                    { className: 'font-bold text-sm tracking-wide' },
                    cred.name == '' ? '<unnamed>' : cred.name,
                  ),
                  h(
                    'div',
                    { className: 'flex flex-row' },
                    h(
                      'p',
                      { className: 'text-sm tracking-wider' },
                      cred.host + ':' + cred.port,
                    ),
                  ),
                ),
                h(
                  'div',
                  { className: 'flex flex-row gap-2' },
                  h(
                    Button,
                    {
                      variant: 'light',
                      onClick: () => loadConnection(cred),
                    },
                    h(Unplug, { size: 13 }),
                  ),
                  h(
                    Button,
                    {
                      variant: 'light',
                      onClick: () => delete_connection(cred.key),
                    },
                    h(Trash, { size: 13, color: 'red' }),
                  ),
                ),
              ),
            ),
        ),
      ),
      h(
        'div',
        { className: 'col-span-8' },
        h(
          'div',
          {
            className:
              'mb-4 w-[98%] border default-border-color rounded-sm p-2.5 bg-white/60 dark:bg-offgray-800/8 shadow-[6px_6px_0_hsla(219,_93%,_42%,_0.06)] dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.08)]',
          },
          h(
            'div',
            { className: 'flex flex-col gap-2 p-4' },
            h(
              'h2',
              {
                className:
                  'text-left font-lora text-pretty h2 text-accent-blue dark:text-blue-300 font-medium text-lg pl-2',
              },
              '🔌 New Connection',
            ),
            h(TextInput, {
              label: 'connection name',
              placeholder: 'My Connection',
              value: name.value,
              onChange: (e: Event) =>
                (name.value = (e.target as HTMLInputElement).value),
            }),
            h(TextInput, {
              label: 'host',
              placeholder: 'ldap.place.com',
              value: host.value,
              onChange: (e: Event) =>
                (host.value = (e.target as HTMLInputElement).value),
            }),
            h(TextInput, {
              label: 'username',
              placeholder: 'username',
              value: username.value,
              onChange: (e: Event) =>
                (username.value = (e.target as HTMLInputElement).value),
            }),
            h(TextInput, {
              label: 'password',
              isPassword: true,
              value: password.value,
              onChange: (e: Event) =>
                (password.value = (e.target as HTMLInputElement).value),
            }),
            h(TextInput, {
              label: 'base dn',
              placeholder: 'dc=example,dc=com',
              value: base_dn.value,
              onChange: (e: Event) =>
                (base_dn.value = (e.target as HTMLInputElement).value),
            }),
            h(
              'div',
              { className: 'flex flex-row gap-4 items-center' },
              h(
                'div',
                { className: 'flex min-w-24 gap-2 items-center' },
                h(
                  ToggleButton,
                  {
                    onClick: () => (use_tls.value = !use_tls.value),
                    active: use_tls.value,
                  },
                  use_tls.value
                    ? h(Shield, { size: 18 })
                    : h(ShieldOff, { size: 18 }),
                ),
                h('p', { className: 'text-xs' }, 'use TLS'),
              ),
              h(TextInput, {
                label: 'port',
                placeholder: '389',
                value: port.value,
                onChange: (e: Event) =>
                  (port.value = (e.target as HTMLInputElement).value),
              }),
            ),
            h(
              'div',
              { className: 'flex flex-row gap-3 place-content-end pt-6' },
              h(
                ToggleButton,
                {
                  onClick: () => (is_favorited.value = !is_favorited.value),
                  active: is_favorited.value,
                },
                h('p', { className: 'text-xs' }, '⭐'),
              ),
              h(
                Button,
                {
                  variant: 'light',
                  onClick: () => test_connection(),
                },
                isConnectionValid.value === null
                  ? h(TestTube, { size: 13, color: 'gray' })
                  : isConnectionValid.value
                    ? h(CheckCircle, { size: 13, color: 'green' })
                    : h(XCircle, { size: 13, color: 'red' }),
                h('p', { className: 'text-xs' }, 'Test Connection'),
              ),
              h(
                Button,
                {
                  variant: 'active',
                  onClick: () => connect(),
                },
                loading.value
                  ? h(LoaderCircle, {
                      size: 13,
                      color: 'white',
                      className: 'animate-spin',
                    })
                  : h(Unplug, { size: 13, color: 'white' }),
                h('p', { className: 'text-xs' }, 'Connect'),
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
                  'Enter',
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

export default ConnectPage;
