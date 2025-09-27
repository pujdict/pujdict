function setLocalOption(optionName, optionValue) {
  if (typeof document === 'undefined') return;
  try {
    localStorage.setItem(`pujdict-${optionName}`, optionValue);
    // VueCookies.set(optionName, optionValue, '365d', '/', '', true);
    // $.cookie(optionName, optionValue, {expires: 365, path: "/;SameSite=Lax", secure: true});
  } catch (e) {
    console.error(e);
  }
}

const DefaultLocalOptions = {
  'custom-tone-mark-6': "\u0303",
  'custom-tone-mark-8': "\u0301",
  'custom-default-pinyin-display': "PUJ;DP",
};

function getLocalOption(optionName, $default = null) {
  if (typeof document === 'undefined') return $default;
  try {
    return localStorage.getItem(`pujdict-${optionName}`) ??  DefaultLocalOptions[optionName] ?? $default;
    // return VueCookies.get(optionName) ?? $default;
    // return $.cookie(optionName);
  } catch (e) {
    console.error(e);
    return $default;
  }
}

function setUrlQueryParameter(key, value) {
  let url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.replaceState({}, "", url);
}

function resetUrlQueryParameter(key) {
  let url = new URL(window.location.href);
  url.searchParams.delete(key);
  window.history.replaceState({}, "", url);
}

function isChineseChar(c) {
  /*
  CJK Unified Ideographs                  4E00-9FFF   Common
  CJK Unified Ideographs Extension A      3400-4DBF   Rare
  CJK Unified Ideographs Extension B      20000-2A6DF Rare, historic
  CJK Unified Ideographs Extension C      2A700–2B73F Rare, historic
  CJK Unified Ideographs Extension D      2B740–2B81F Uncommon, some in current use
  CJK Unified Ideographs Extension E      2B820–2CEAF Rare, historic
  CJK Unified Ideographs Extension F      2CEB0–2EBEF  Rare, historic
  CJK Unified Ideographs Extension G      30000–3134F  Rare, historic
  CJK Unified Ideographs Extension H      31350–323AF Rare, historic
  CJK Compatibility Ideographs            F900-FAFF   Duplicates, unifiable variants, corporate characters
  CJK Compatibility Ideographs Supplement 2F800-2FA1F Unifiable variants
  CJK Radicals / Kangxi Radicals          2F00–2FDF
  CJK Radicals Supplement                 2E80–2EFF
  CJK Symbols and Punctuation             3000–303F
   */
  let charCode = c.charCodeAt(0);
  return (charCode >= 0x4E00 && charCode <= 0x9FFF) ||
      (charCode >= 0x3400 && charCode <= 0x4DBF) ||
      (charCode >= 0x20000 && charCode <= 0x2A6DF) ||
      (charCode >= 0x2A700 && charCode <= 0x2B73F) ||
      (charCode >= 0x2B740 && charCode <= 0x2B81F) ||
      (charCode >= 0x2B820 && charCode <= 0x2CEAF) ||
      (charCode >= 0x2CEB0 && charCode <= 0x2EBEF) ||
      (charCode >= 0x30000 && charCode <= 0x3134F) ||
      (charCode >= 0x31350 && charCode <= 0x323AF) ||
      (charCode >= 0xF900 && charCode <= 0xFAFF) ||
      (charCode >= 0x2F800 && charCode <= 0x2FA1F) ||
      (charCode >= 0x2F00 && charCode <= 0x2FDF) ||
      (charCode >= 0x2E80 && charCode <= 0x2EFF);
}

export {
  DefaultLocalOptions,
  setUrlQueryParameter,
  resetUrlQueryParameter,
  getLocalOption,
  setLocalOption,
  isChineseChar,
}
