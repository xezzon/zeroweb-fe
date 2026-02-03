import { message } from 'antd';
import i18next from 'i18next';

/**
 * @param {import("@xezzon/zeroweb-sdk").StructuredError} error
 */
export function alert(error) {
  const description = i18next.t([error.errorCode ?? '', 'S0001'], {
    ns: 'error_code',
    ...(error.parameters ?? { fallback: '' }),
  });
  message.error(description);
  return Promise.reject(error);
}
