// MIT License
//
// Copyright (c) 2018 Shane Duan
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// Map ported from https://github.com/xsduan/conniebot/blob/44d917dbbc5a8ab56ea6e87499b00e8a7ee9adb2/x2i-data/z2i.yaml
// with modifications:
// 1. Superscripts for numbers are replaced with double-underlines, e.g. __1 for ¹. Because we want 8 numbers for tones,
//    but _7 and _8 are already used for other symbols.
// 2. Tie bars in ts, tS, dz, dZ, etc. are removed. e.g. t͡s -> ts
const _XSAMPAToIPAMap = {
  "__1": "\u00b9",
  "__2": "\u00b2",
  "__3": "\u00b3",
  "__4": "\u2074",
  "__5": "\u2075",
  "__6": "\u2076",
  "__7": "\u2077",
  "__8": "\u2078",
  "__9": "\u2079",
  "O\\": "\u0298",
  "p_!": "\u0298",
  "b_!": "\u1da2\u0298",
  "m_!": "\u1d51\u0298",
  "m_0_!": "\u1d51\u030a\u0298",
  "=\\": "\u01c0",
  "t_!": "\u01c0",
  "d_!": "\u1da2\u01c0",
  "n_!": "\u1d51\u01c0",
  "n_0_!": "\u1d51\u030a\u01c0",
  "|\\|\\": "\u01c1",
  "t_l_!": "\u01c1",
  "d_l_!": "\u1da2\u01c1",
  "n_l_!": "\u1d51\u01c1",
  "n_0_l_!": "\u1d51\u030a\u01c1",
  "t_7": "\u01c1",
  "d_7": "\u1da2\u01c1",
  "n_7": "\u1d51\u01c1",
  "n_0_7": "\u1d51\u030a\u01c1",
  "!\\": "\u01c3",
  "t`_!": "\u01c3",
  "d`_!": "\u1da2\u01c3",
  "n`_!": "\u1d51\u01c3",
  "n`_0_!": "\u1d51\u030a\u01c3",
  "|\\": "\u01c2",
  "c_!": "\u01c2",
  "J\\_!": "\u1da2\u01c2",
  "J_!": "\u1d51\u01c2",
  "J_0_!": "\u1d51\u030a\u01c2",
  "c_7": "\u01c2\u02e1",
  "J\\_7": "\u1da2\u01c2\u02e1",
  "J_7": "\u1d51\u01c2\u02e1",
  "J_0_7": "\u1d51\u030a\u01c2\u02e1",
  "k\\": "\u029e",
  "k_!": "\u029e",
  "g_!": "\u029e\u032c",
  "N_!": "\u1db0\u029e",
  "N_0_!": "\u1db0\u030a\u029e",
  "b_<": "\u0253",
  "d_<": "\u0257",
  "d`_<": "\u1d91",
  "J\\_<": "\u0284",
  "g_<": "\u0260",
  "G\\_<": "\u029b",
  "p_<": "\u01a5",
  "t_<": "\u01ad",
  "t`_<": "\u01ad\u0322",
  "c_<": "\u0188",
  "k_<": "\u0199",
  "q_<": "\u02a0",
  "t`_m": "\u0236",
  "d`_m": "\u0221",
  "n`_m": "\u0235",
  "l`_m": "\u0234",
  "ts": "ts",
  "dz": "dz",
  "tS": "t\u0283",
  "dZ": "d\u0292",
  "ts\\": "t\u0255",
  "dz\\": "d\u0291",
  "tK": "t\u026c",
  "dK\\": "d\u026e",
  "t`s`": "\u0288\u0282",
  "d`z`": "\u0256\u0290",
  "k_p": "kp",
  "g_b": "gb",
  "N_m": "\u014bm",
  "_a\\": "\u0333",
  "_a": "\u033a",
  "_A": "\u0318",
  "_B": "\u030f",
  "_c": "\u031c",
  "_C": "\u034d",
  "_d\\": "\u0346",
  "_d": "\u032a",
  "_e": "\u0334",
  "_E": "\u033c",
  "_f\\": "\u034c",
  "_f": "\u034e",
  "_F": "\u0302",
  "_G": "\u02e0",
  "_h": "\u02b0",
  "_H\\": "\ua71d",
  "_H": "\u0301",
  "_j": "\u02b2",
  "_J": "\u0321",
  "_k": "\u0330",
  "_K": "\u0330",
  "_l\\": "\u0354",
  "_l": "\u02e1",
  "_L": "\u0300",
  "_m": "\u033b",
  "_M": "\u0304",
  "_n": "\u207f",
  "_N\\": "\u033c\u033b",
  "_N": "\u033c",
  "_o": "\u031e",
  "_O": "\u0339",
  "_P\\": "\u1d5d",
  "_P": "\u032a",
  "_q": "\u0319",
  "_r\\": "\u0355",
  "_r": "\u031d",
  "_R": "\u030c",
  "_T": "\u030b",
  "_t\\": "\u032a\u0346",
  "_t": "\u0324",
  "_v)": "\u032c\u208e",
  "_v": "\u032c",
  "_V\\": "\u02ef",
  "_w": "\u02b7",
  "_W\\": "\u1da3",
  "_W": "\u1d5d",
  "_x": "\u033d",
  "_X": "\u0306",
  "_y": "\u0349",
  "_Y": "\u0348",
  "_0)": "\u0325\u208e",
  "_0": "\u0325",
  "_7": "\u01c1",
  "_8": "\u0323",
  "_9": "\u035a",
  "_!": "!",
  "_\"": "\u0308",
  "_%\\": "\u02a2",
  "_+": "\u031f",
  "_-": "\u0320",
  "_/": "\u030c",
  "_;": "\u034b",
  "_=\\": "\u02ed",
  "_=": "\u0329",
  "=": "\u0329",
  "_?\\": "\u02c1",
  "_?": "\u02c0",
  "_\\\\": "-\\\\",
  "_\\": "\u0302",
  "_^": "\u032f",
  "_}": "\u031a",
  "_~\\": "\u034a",
  "_`": "\u0322",
  "_~": "\u0303",
  "~": "\u0303",
  "'": "\u02b2",
  "_(": "\u208d",
  "_)": "\u208e",
  "+a": "\u1d43",
  "+\u00e2": "\u1d44",
  "+6": "\u1d44",
  "+A": "\u1d45",
  "+{": "\u1d46",
  "+\u00e4": "\u1d46",
  "+\u00e6": "\u1d46",
  "+\u00c5": "\u1d9b",
  "+Q": "\u1d9b",
  "+b": "\u1d47",
  "+B": "\u1d5d",
  "+c": "\u1d9c",
  "+s\\": "\u1d9d",
  "+D": "\u1d9e",
  "+d": "\u1d48",
  "+e": "\u1d49",
  "+@": "\u1d4a",
  "+E": "\u1d4b",
  "+\u00ca": "\u1d9f",
  "+3": "\u1d9f",
  "+f": "\u1da0",
  "+J\\": "\u1da1",
  "+g": "\u1da2",
  "+G": "\u02e0",
  "+h\\": "\u02b1",
  "+h": "\u02b0",
  "+H": "\u1da3",
  "+i\\": "\u1da4",
  "+i": "\u2071",
  "+\u00ee": "\u1da4",
  "+1": "\u1da4",
  "+I\\": "\u1da7",
  "+I": "\u1da6",
  "+\u00ce": "\u1da7",
  "+j\\": "\u1da8",
  "+j": "\u02b2",
  "+k": "\u1d4f",
  "+l`": "\u1da9",
  "+l": "\u02e1",
  "+L\\": "\u1dab",
  "+m": "\u1d50",
  "+F": "\u1dac",
  "+M\\": "\u1dad",
  "+n`": "\u1daf",
  "+n": "\u207f",
  "+J": "\u1dae",
  "+N\\": "\u1db0",
  "+N": "\u1d51",
  "+o": "\u1d52",
  "+O": "\u1d53",
  "+\u00f4": "\u1db1",
  "+8": "\u1db1",
  "+p\\": "\u1db2",
  "+p\"": "\u1d56",
  "+p": "\u1d56",
  "+r\\`": "\u02b5",
  "+r\\": "\u02b4",
  "+r": "\u02b3",
  "+R": "\u02b6",
  "+s`": "\u1db3",
  "+s": "\u02e2",
  "+S": "\u1db4",
  "+t": "\u1d57",
  "+T": "\u1dbf",
  "+u\\": "\u1db6",
  "+u": "\u1d58",
  "+\u00ef": "\u1d5a",
  "+M": "\u1d5a",
  "+}": "\u1db6",
  "+\u00fb": "\u1db6",
  "+U": "\u1db7",
  "+\u00cb": "\u1dba",
  "+V": "\u1dba",
  "+v": "\u1d5b",
  "+w": "\u02b7",
  "+x": "\u02e3",
  "+X": "\u1d61",
  "+\u00fc": "\u02b8",
  "+y": "\u02b8",
  "+z`": "\u1dbc",
  "+z\\": "\u1dbd",
  "+z": "\u1dbb",
  "+Z": "\u1dbe",
  "++": "\u207a",
  "+-": "\u207b",
  "+=": "\u207c",
  "+(": "\u207d",
  "+)": "\u207e",
  "+:": "\u02f8",
  "+0": "\u030a",
  "+?\\": "\u02e4",
  "+?": "\u02c0",
  "_<\\": "\u2193",
  "_>\\": "\u2191",
  "_>": "\u02bc",
  "_<": "\u02bc\u2193",
  "<\\": "\u02a2",
  ">\\": "\u02a1",
  "a": "a",
  "\u00e4": "\u00e6",
  "a\\": "\u00e4",
  "\u00e2": "\u0250",
  "\u00e5": "\u0276",
  "A\\": "\u0250\u0320",
  "A": "\u0251",
  "\u00c2": "\u00e4",
  "\u00c5": "\u0252",
  "b\\": "\u2c71",
  "b": "b",
  "B\\": "\u0299",
  "B": "\u03b2",
  "c\\`": "\u027d\u0361r",
  "c\\": "\u1d89",
  "c": "c",
  "C\\": "\uf267",
  "C": "\u00e7",
  "d`": "\u0256",
  "d\\`": "\u1d05\u0322",
  "d\\": "\u1d05",
  "d": "d",
  "D`": "\u027b\u031d",
  "D\\": "\u0293",
  "D": "\u00f0",
  "e\\": "\u02a2\u031e",
  "e": "e",
  "\u00eb": "\u0264",
  "\u00ea": "\u0258",
  "E\\": "e\u033d",
  "E": "\u025b",
  "\u00cb": "\u028c",
  "\u00ca": "\u025c",
  "f\\": "\u02a9",
  "F\\": "\ua7ad",
  "f": "f",
  "F": "\u0271",
  "g": "\u0261",
  "g\\": "\u00a1\u0306",
  "G\\": "\u0262",
  "G": "\u0263",
  "h\\": "\u0266",
  "h": "h",
  "H\\": "\u029c",
  "H": "\u0265",
  "i\\": "\u0268",
  "\u00ef": "\u026f",
  "\u00ee": "\u0268",
  "i": "i",
  "I\\": "\u1d7b",
  "\u00cf": "\u026f\u033d",
  "\u00ce": "\u1d7b",
  "I": "\u026a",
  "j\\": "\u029d",
  "J\\": "\u025f",
  "j": "j",
  "J": "\u0272",
  "k": "k",
  "K`": "\ua78e",
  "K\\`": "\u026d\u031d",
  "K\\": "\u026e",
  "K": "\u026c",
  "l`": "\u026d",
  "l\\`": "\u027a\u0322",
  "l\\": "\u027a",
  "L\\": "\u029f",
  "l": "l",
  "L": "\u028e",
  "m\\": "\u026f\u033d",
  "M\\": "\u0270",
  "m": "m",
  "M": "\u026f",
  "n`": "\u0273",
  "\u00f1": "\u0272",
  "n": "n",
  "N\\": "\u0274",
  "N": "\u014b",
  "o\\": "o\u033d",
  "o": "o",
  "\u00f6": "\u00f8",
  "\u00f4": "\u0275",
  "O": "\u0254",
  "\u00d6": "\u0153",
  "\u00d4": "\u025e",
  "p\\": "\u0278",
  "p": "p",
  "P\\": "\u03b2\u031e",
  "P": "\u028b",
  "q\\": "\ua7ad\u0320",
  "Q\\": "\ua7ad\u0320\u032c",
  "q": "q",
  "Q": "\u0252",
  "r\\`": "\u027b",
  "r\\": "\u0279",
  "r`": "\u027d",
  "r": "r",
  "R\\": "\u0280",
  "R": "\u0281",
  "s`": "\u0282",
  "s\\": "\u0255",
  "s": "s",
  "S\\": "\u02aa",
  "S": "\u0283",
  "t`": "\u0288",
  "t\\": "\u02ad",
  "t": "t",
  "T`": "\u027b\u031d\u030a",
  "T\\": "\u0286",
  "T": "\u03b8",
  "u\\": "\u0289",
  "u": "u",
  "\u00fb": "\u0289",
  "\u00fc": "y",
  "U\\": "\u1d7f",
  "U": "\u028a",
  "\u00db": "\u1d7f",
  "\u00dc": "\u028f",
  "v\\": "\u028b",
  "v": "v",
  "V\\": "\u029f\u031d",
  "V": "\u028c",
  "W\\": "\u2c71\u031f",
  "W": "\u028d",
  "w\\": "\u02ac",
  "w": "w",
  "x\\": "\u0267",
  "x": "x",
  "X\\": "\u0127",
  "X": "\u03c7",
  "y\\": "\u0281\u031e",
  "y": "y",
  "Y\\": "\u029f\u0320",
  "Y": "\u028f",
  "z`": "\u0290",
  "z\\": "\u0291",
  "z": "z",
  "Z\\": "\u02ab",
  "Z": "\u0292",
  ".": ".",
  "\"": "\u02c8",
  ",": "\u02cc",
  "%\\": "\u044f",
  "%": "\u02cc",
  "@`": "\u025a",
  "@\\": "\u0258",
  "@": "\u0259",
  "{": "\u00e6",
  "}": "\u0289",
  "1": "\u0268",
  "2\\": "\u00f8\u033d",
  "2": "\u00f8",
  "3\\": "\u025e",
  "3`": "\u025d",
  "3": "\u025c",
  "4\\": "\u0262\u0306",
  "4": "\u027e",
  "5\\": "\uab38",
  "5": "\u026b",
  "6\\": "\u028e\u031d",
  "6": "\u0250",
  "7\\": "\u0264\u033d",
  "7": "\u0264",
  "8\\": "\u0265\u031d\u030a",
  "8": "\u0275",
  "9\\": "\u02a1\u032e",
  "9": "\u0153",
  "0": "\u00d8",
  ":\\": "\u02d1",
  ":": "\u02d0",
  "?\\": "\u0295",
  "?": "\u0294",
  "^\\": "\u011f",
  "^": "\ua71b",
  "!": "\ua71c",
  "&\\": "\u0276\u0308",
  "&": "\u0276",
  "#\\`": "\u0256\u0306",
  "#\\": "d\u032e",
  "*\\": "\\*",
  "$\\": "\u0280\u031f",
  "$": "\u0362",
  ")": "\u0361",
  "(": "\u035c",
  "-\\\\": "\\\\",
  "-\\": "\u203f",
  "-": "",
  "||": "\u2016",
  "|": "|",
  ";\\": "\u01c3\u0361\u00a1",
  "+\\": "\u2980",
  "`": "\u02de",
  ";": "\u00a1"
}

const XSAMPAToIPAMap = _XSAMPAToIPAMap;

const XSAMPAList = ['__1', '__2', '__3', '__4', '__5', '__6', '__7', '__8', '__9', 'O\\', 'p_!', 'b_!', 'm_!', 'm_0_!', '=\\', 't_!', 'd_!', 'n_!', 'n_0_!', '|\\|\\', 't_l_!', 'd_l_!', 'n_l_!', 'n_0_l_!', 't_7', 'd_7', 'n_7', 'n_0_7', '!\\', 't`_!', 'd`_!', 'n`_!', 'n`_0_!', '|\\', 'c_!', 'J\\_!', 'J_!', 'J_0_!', 'c_7', 'J\\_7', 'J_7', 'J_0_7', 'k\\', 'k_!', 'g_!', 'N_!', 'N_0_!', 'b_<', 'd_<', 'd`_<', 'J\\_<', 'g_<', 'G\\_<', 'p_<', 't_<', 't`_<', 'c_<', 'k_<', 'q_<', 't`_m', 'd`_m', 'n`_m', 'l`_m', 'ts', 'dz', 'tS', 'dZ', 'ts\\', 'dz\\', 'tK', 'dK\\', 't`s`', 'd`z`', 'k_p', 'g_b', 'N_m', '_a\\', '_a', '_A', '_B', '_c', '_C', '_d\\', '_d', '_e', '_E', '_f\\', '_f', '_F', '_G', '_h', '_H\\', '_H', '_j', '_J', '_k', '_K', '_l\\', '_l', '_L', '_m', '_M', '_n', '_N\\', '_N', '_o', '_O', '_P\\', '_P', '_q', '_r\\', '_r', '_R', '_T', '_t\\', '_t', '_v)', '_v', '_V\\', '_w', '_W\\', '_W', '_x', '_X', '_y', '_Y', '_0)', '_0', '_7', '_8', '_9', '_!', '_"', '_%\\', '_+', '_-', '_/', '_;', '_=\\', '_=', '=', '_?\\', '_?', '_\\\\', '_\\', '_^', '_}', '_~\\', '_`', '_~', '~', "'", '_(', '_)', '+a', '+â', '+6', '+A', '+{', '+ä', '+æ', '+Å', '+Q', '+b', '+B', '+c', '+s\\', '+D', '+d', '+e', '+@', '+E', '+Ê', '+3', '+f', '+J\\', '+g', '+G', '+h\\', '+h', '+H', '+i\\', '+i', '+î', '+1', '+I\\', '+I', '+Î', '+j\\', '+j', '+k', '+l`', '+l', '+L\\', '+m', '+F', '+M\\', '+n`', '+n', '+J', '+N\\', '+N', '+o', '+O', '+ô', '+8', '+p\\', '+p"', '+p', '+r\\`', '+r\\', '+r', '+R', '+s`', '+s', '+S', '+t', '+T', '+u\\', '+u', '+ï', '+M', '+}', '+û', '+U', '+Ë', '+V', '+v', '+w', '+x', '+X', '+ü', '+y', '+z`', '+z\\', '+z', '+Z', '++', '+-', '+=', '+(', '+)', '+:', '+0', '+?\\', '+?', '_<\\', '_>\\', '_>', '_<', '<\\', '>\\', 'a', 'ä', 'a\\', 'â', 'å', 'A\\', 'A', 'Â', 'Å', 'b\\', 'b', 'B\\', 'B', 'c\\`', 'c\\', 'c', 'C\\', 'C', 'd`', 'd\\`', 'd\\', 'd', 'D`', 'D\\', 'D', 'e\\', 'e', 'ë', 'ê', 'E\\', 'E', 'Ë', 'Ê', 'f\\', 'F\\', 'f', 'F', 'g', 'g\\', 'G\\', 'G', 'h\\', 'h', 'H\\', 'H', 'i\\', 'ï', 'î', 'i', 'I\\', 'Ï', 'Î', 'I', 'j\\', 'J\\', 'j', 'J', 'k', 'K`', 'K\\`', 'K\\', 'K', 'l`', 'l\\`', 'l\\', 'L\\', 'l', 'L', 'm\\', 'M\\', 'm', 'M', 'n`', 'ñ', 'n', 'N\\', 'N', 'o\\', 'o', 'ö', 'ô', 'O', 'Ö', 'Ô', 'p\\', 'p', 'P\\', 'P', 'q\\', 'Q\\', 'q', 'Q', 'r\\`', 'r\\', 'r`', 'r', 'R\\', 'R', 's`', 's\\', 's', 'S\\', 'S', 't`', 't\\', 't', 'T`', 'T\\', 'T', 'u\\', 'u', 'û', 'ü', 'U\\', 'U', 'Û', 'Ü', 'v\\', 'v', 'V\\', 'V', 'W\\', 'W', 'w\\', 'w', 'x\\', 'x', 'X\\', 'X', 'y\\', 'y', 'Y\\', 'Y', 'z`', 'z\\', 'z', 'Z\\', 'Z', '.', '"', ',', '%\\', '%', '@`', '@\\', '@', '{', '}', '1', '2\\', '2', '3\\', '3`', '3', '4\\', '4', '5\\', '5', '6\\', '6', '7\\', '7', '8\\', '8', '9\\', '9', '0', ':\\', ':', '?\\', '?', '^\\', '^', '!', '&\\', '&', '#\\`', '#\\', '*\\', '$\\', '$', ')', '(', '-\\\\', '-\\', '-', '||', '|', ';\\', '+\\', '`', ';']

export {
  XSAMPAToIPAMap,
  XSAMPAList,
}