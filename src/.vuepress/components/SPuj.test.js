import {
  addPUJToneMarkAndConvertToDisplayPUJSentence,
  convertPUJPronunciationToXSAMPAPronunciation,
  convertXSAMPAPronunciationToIPAPronunciation,
  convertPUJPronunciationToIPAPronunciation,
  convertXSAMPAToIPAWord,
} from "./SPuj";

import {
  Pronunciation
} from "./SCommon";

describe('白话字注音', () => {
  function expect_puj(plain, display) {
    const calculated_display = addPUJToneMarkAndConvertToDisplayPUJSentence(plain);
    expect(calculated_display.normalize('NFD')).toBe(display.normalize('NFD'));
  }

  const PUJSpecialVowels = {
    "v": "ṳ",
    "V": "Ṳ",
    "r": "o̤",
    "R": "O̤",
  };
  const PUJToneMarks = [
    /*0:*/ "",
    /*1:*/ "",
    /*2:*/ "\u0301", // 锐音符 ́
    /*3:*/ "\u0300", // 抑音符 ̀
    /*4:*/ "",
    /*5:*/ "\u0302", // 扬抑符 ̂
    /*6:*/ "\u0303", // 波浪符 ̃
    /*7:*/ "\u0304", // 长音符 ̄
    /*8:*/ "\u0301", // 锐音符 ́
  ];

  it('句子', () => {
    expect_puj('Tsek8-phian3-tshi1-tsheng5 si6-khou2-luan3,',
        `Tse${PUJToneMarks[8]}k-phia${PUJToneMarks[3]}n-tshi-tshe${PUJToneMarks[5]}ng si${PUJToneMarks[6]}-kho${PUJToneMarks[2]}u-lua${PUJToneMarks[3]}n,`);
    expect_puj('Tsap8-ji7-lou7-pinn1 pa2-lv2 hu1-ham3.',
        `Tsa${PUJToneMarks[8]}p-ji${PUJToneMarks[7]}-lo${PUJToneMarks[7]}u-pinn pa${PUJToneMarks[2]}-l${PUJSpecialVowels.v}${PUJToneMarks[2]} hu-ha${PUJToneMarks[3]}m.`);
    expect_puj('Tng1-tsho1 nan2 suann1-meng5 hai2-si7,',
        `Tng-tsho na${PUJToneMarks[2]}n suann-me${PUJToneMarks[5]}ng ha${PUJToneMarks[2]}i-si${PUJToneMarks[7]},`);
    expect_puj('Ui5-ho5-ju5-kim1 tui3-iann2 tsi2-tsek8-nang5?',
        `Ui${PUJToneMarks[5]}-ho${PUJToneMarks[5]}-ju${PUJToneMarks[5]}-kim tui${PUJToneMarks[3]}-ia${PUJToneMarks[2]}nn tsi${PUJToneMarks[2]}-tse${PUJToneMarks[8]}k-na${PUJToneMarks[5]}ng?`);
    expect_puj('Sim1-thau5 tshoinn1-puann1 siang1-sv1-i3,',
        `Sim-tha${PUJToneMarks[5]}u tshoinn-puann siang-s${PUJSpecialVowels.v}-i${PUJToneMarks[3]},`);
    expect_puj('Menn5-menn5 mang7-tang1 lui6 put4-kan1.',
        `Me${PUJToneMarks[5]}nn-me${PUJToneMarks[5]}nn ma${PUJToneMarks[7]}ng-tang lui${PUJToneMarks[6]} put-kan.`);
    expect_puj('Tsheng5 tshi1-tshi1 Ua2 tshi1-tshi1 tan2,',
        `Tshe${PUJToneMarks[5]}ng tshi-tshi Ua${PUJToneMarks[2]} tshi-tshi ta${PUJToneMarks[2]}n,`);
    expect_puj('To1-tsio2-huang1-hou6 to1-tsio2-bo5-nai6,',
        `To-tsio${PUJToneMarks[2]}-huang-ho${PUJToneMarks[6]}u to-tsio${PUJToneMarks[2]}-bo${PUJToneMarks[5]}-na${PUJToneMarks[6]}i,`);
    expect_puj('Lv2 kho2-meng5-peh8-tse2-ti7-lau2 thian1-huang1.',
        `L${PUJSpecialVowels.v}${PUJToneMarks[2]} kho${PUJToneMarks[2]}-me${PUJToneMarks[5]}ng-pe${PUJToneMarks[8]}h-tse${PUJToneMarks[2]}-ti${PUJToneMarks[7]}-la${PUJToneMarks[2]}u thian-huang.`);
  });
  it('特殊韵母（ng、m）', () => {
    expect_puj('kong1-hng5', `kong-hn${PUJToneMarks[5]}g`);
    expect_puj('TNG2-LAI6', `TN${PUJToneMarks[2]}G-LA${PUJToneMarks[6]}I`);
    expect_puj('Ng5-sek4', `N${PUJToneMarks[5]}g-sek`);
    expect_puj('Ngh8-tshenn2', `N${PUJToneMarks[8]}gh-tshe${PUJToneMarks[2]}nn`);
    expect_puj('Lau6-m2', `La${PUJToneMarks[6]}u-m${PUJToneMarks[2]}`);
    expect_puj('M6-tioh8', `M${PUJToneMarks[6]}-tio${PUJToneMarks[8]}h`);
  });
  it('特殊韵母（余、倭）', () => {
    expect_puj('v5', `${PUJSpecialVowels.v}${PUJToneMarks[5]}`);
    expect_puj('ur5', `u${PUJToneMarks[5]}r`);
    expect_puj('tur5', `tu${PUJToneMarks[5]}r`);
    expect_puj('ir5', `i${PUJToneMarks[5]}r`);
    expect_puj('tir5', `ti${PUJToneMarks[5]}r`);

    expect_puj('V5', `${PUJSpecialVowels.V}${PUJToneMarks[5]}`);
    expect_puj('Ur5', `U${PUJToneMarks[5]}r`);
    expect_puj('UR5', `U${PUJToneMarks[5]}R`);
    expect_puj('TUR5', `TU${PUJToneMarks[5]}R`);
    expect_puj('Ir5', `I${PUJToneMarks[5]}r`);
    expect_puj('IR5', `I${PUJToneMarks[5]}R`);
    expect_puj('Tir5', `Ti${PUJToneMarks[5]}r`);
    expect_puj('TIR5', `TI${PUJToneMarks[5]}R`);

    expect_puj('r5', `${PUJSpecialVowels.r}${PUJToneMarks[5]}`);
    expect_puj('er5', `e${PUJToneMarks[5]}r`);
    expect_puj('ter5', `te${PUJToneMarks[5]}r`);

    expect_puj('R5', `${PUJSpecialVowels.R}${PUJToneMarks[5]}`);
    expect_puj('Er5', `E${PUJToneMarks[5]}r`);
    expect_puj('ER5', `E${PUJToneMarks[5]}R`);
    expect_puj('Ter5', `Te${PUJToneMarks[5]}r`);
    expect_puj('TER5', `TE${PUJToneMarks[5]}R`);
  });
});

describe('白话字与国际音标转换', () => {
  function expect_x_sampa(puj_i, puj_f, puj_t, x_sampa_i, x_sampa_f, x_sampa_t) {
    const puj_pron = new Pronunciation(puj_i, puj_f, puj_t);
    const x_sampa_pron = new Pronunciation(x_sampa_i, x_sampa_f, x_sampa_t);
    const calculated_x_sampa_pron = convertPUJPronunciationToXSAMPAPronunciation(puj_pron);
    expect(calculated_x_sampa_pron).toEqual(x_sampa_pron);
  }

  function expect_ipa(x_sampa_i, x_sampa_f, x_sampa_t, ipa_i, ipa_f, ipa_t) {
    const x_sampa_pron = new Pronunciation(x_sampa_i, x_sampa_f, x_sampa_t);
    const ipa_pron = new Pronunciation(ipa_i, ipa_f, ipa_t);
    const calculated_ipa_pron = convertXSAMPAPronunciationToIPAPronunciation(x_sampa_pron);
    expect(calculated_ipa_pron).toEqual(ipa_pron);
  }

  const UPPER_NUMS = [
    '',
    "\u00b9",
    "\u00b2",
    "\u00b3",
    "\u2074",
    "\u2075",
    "\u2076",
    "\u2077",
    "\u2078",
    "\u2079",
  ]

  it('白话字转X-SAMPA', () => {
    expect_x_sampa('p', 'eh', '8', 'p', 'e?', '__8');
    expect_x_sampa('0', 'ue', '7', '?', 'ue', '__7');
    expect_x_sampa('j', 'i', '7', 'dz', 'i', '__7');

    expect_x_sampa('t', 'iong', '1', 't', 'ioN', '__1');
    expect_x_sampa('h', 'ua', '5', 'h', 'ua', '__5');
    expect_x_sampa('n', 'ang', '5', 'n', 'aN', '__5');
    expect_x_sampa('m', 'in', '5', 'm', 'in', '__5');
    expect_x_sampa('k', 'ang', '7', 'k', 'aN', '__7');
    expect_x_sampa('H', 'UA', '5', 'h', 'ua', '__5');
    expect_x_sampa('k', 'ok', '4', 'k', 'ok_}', '__4');

    expect_x_sampa('ts', 'ek', '8', 'ts', 'ek_}', '__8');
    expect_x_sampa('ph', 'ian', '3', 'p_h', 'ian', '__3');
    expect_x_sampa('tsh', 'i', '1', 'ts_h', 'i', '__1');
    expect_x_sampa('tsh', 'eng', '5', 'ts_h', 'eN', '__5');
    expect_x_sampa('s', 'i', '6', 's', 'i', '__6');
    expect_x_sampa('kh', 'ou', '2', 'k_h', 'ou', '__2');
    expect_x_sampa('l', 'uan', '3', 'l', 'uan', '__3');

    expect_x_sampa('ts', 'ap', '8', 'ts', 'ap_}', '__8');
    expect_x_sampa('j', 'i', '7', 'dz', 'i', '__7');
    expect_x_sampa('l', 'ou', '7', 'l', 'ou', '__7');
    expect_x_sampa('p', 'inn', '1', 'p', 'i~', '__1');
    expect_x_sampa('p', 'a', '2', 'p', 'a', '__2');
    expect_x_sampa('l', 'v', '2', 'l', 'M', '__2');
    expect_x_sampa('h', 'u', '1', 'h', 'u', '__1');
    expect_x_sampa('h', 'am', '3', 'h', 'am', '__3');
  });

  it('X-SAMPA转IPA', () => {
    expect_ipa('p', 'e?', '__8', 'p', 'eʔ', UPPER_NUMS[8]);
    expect_ipa('?', 'ue', '__7', 'ʔ', 'ue', UPPER_NUMS[7]);
    expect_ipa('dz', 'i', '__7', 'dz', 'i', UPPER_NUMS[7]);

    expect_ipa('t', 'ioN', '__1', 't', 'ioŋ', UPPER_NUMS[1]);
    expect_ipa('h', 'ua', '__5', 'h', 'ua', UPPER_NUMS[5]);
    expect_ipa('n', 'aN', '__5', 'n', 'aŋ', UPPER_NUMS[5]);
    expect_ipa('m', 'in', '__5', 'm', 'in', UPPER_NUMS[5]);
    expect_ipa('k', 'aN', '__7', 'k', 'aŋ', UPPER_NUMS[7]);
    expect_ipa('h', 'ua', '__5', 'h', 'ua', UPPER_NUMS[5]);
    expect_ipa('k', 'ok_}', '__4', 'k', 'ok̚', UPPER_NUMS[4]);

    expect_ipa('ts', 'ek_}', '__8', 'ts', 'ek̚', UPPER_NUMS[8]);
    expect_ipa('p_h', 'ian', '__3', 'pʰ', 'ian', UPPER_NUMS[3]);
    expect_ipa('ts_h', 'i', '__1', 'tsʰ', 'i', UPPER_NUMS[1]);
    expect_ipa('ts_h', 'eN', '__5', 'tsʰ', 'eŋ', UPPER_NUMS[5]);
    expect_ipa('s', 'i', '__6', 's', 'i', UPPER_NUMS[6]);
    expect_ipa('k_h', 'ou', '__2', 'kʰ', 'ou', UPPER_NUMS[2]);
    expect_ipa('l', 'uan', '__3', 'l', 'uan', UPPER_NUMS[3]);

    expect_ipa('ts', 'ap_}', '__8', 'ts', 'ap̚', UPPER_NUMS[8]);
    expect_ipa('dz', 'i', '__7', 'dz', 'i', UPPER_NUMS[7]);
    expect_ipa('l', 'ou', '__7', 'l', 'ou', UPPER_NUMS[7]);
    expect_ipa('p', 'i~', '__1', 'p', 'ĩ', UPPER_NUMS[1]);
    expect_ipa('p', 'a', '__2', 'p', 'a', UPPER_NUMS[2]);
    expect_ipa('l', 'M', '__2', 'l', 'ɯ', UPPER_NUMS[2]);
    expect_ipa('h', 'u', '__1', 'h', 'u', UPPER_NUMS[1]);
    expect_ipa('h', 'am', '__3', 'h', 'am', UPPER_NUMS[3]);
  });
})
