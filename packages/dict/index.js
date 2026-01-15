import { useCallback, useEffect, useState } from "react";

/**
 * @param {import('@xezzon/zeroweb-sdk').DictAPI} dictApi 
 * @param {string} tag
 */
export function useDict(dictApi, tag) {
  const [dict, setDict] = useState(/** @type {import('@xezzon/zeroweb-sdk').Dict[]} */([]))

  useEffect(() => {
    dictApi.getDictTreeByTag(tag)
      .then(response => response.data)
      .then(setDict)
  }, [dictApi, tag])

  const mapValue = useCallback((code) => {
    return dict.find((item) => item.code === code)?.label ?? code
  }, [dict])

  return { dict, mapValue }
}
