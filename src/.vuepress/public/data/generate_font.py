import csv
import os
import shutil
import sys
import tempfile
import urllib.request
import fontTools.merge
import yaml
from fontname import main as fontname
from fontTools.subset import main as pyftsubset
from fontTools.ttLib.woff2 import compress as woff2_compress
from puj import *

FONTS_DIR = '../assets/fonts'
DOWNLOAD_TEMP_DIR = '../assets/fonts/.tmp'
os.makedirs(DOWNLOAD_TEMP_DIR, exist_ok=True)


def is_cjk_basic(c):
    return 0x4E00 <= ord(c) <= 0x9FFF or 0x3400 <= ord(c) <= 0x4DBF


TEMP_DIR = tempfile.mkdtemp()

NOTO_SANS_SC_PATH = os.path.join(DOWNLOAD_TEMP_DIR, 'NotoSansSC-Regular.otf')
BASIC_SUBSET_FONT_NAME_OTF = os.path.join(TEMP_DIR, 'NotoSansSC-Regular.generated.otf')
BASIC_SUBSET_FONT_NAME_WOFF2 = os.path.join(TEMP_DIR, 'NotoSansSC-Regular.generated.woff2')

PLANGOTHIC_PATH = os.path.join(DOWNLOAD_TEMP_DIR, 'Plangothic.ttc')
SUBSET_FONT_NAME1 = 'CJKExtSubset1'
SUBSET_FONT_NAME2 = 'CJKExtSubset2'
SUBSET_FONT_NAME_TTF1 = os.path.join(TEMP_DIR, 'CJKExtSubset1.generated.ttf')
SUBSET_FONT_NAME_TTF2 = os.path.join(TEMP_DIR, 'CJKExtSubset2.generated.ttf')
SUBSET_FONT_NAME_WOFF2_1 = os.path.join(TEMP_DIR, 'CJKExtSubset1.generated.woff2')
SUBSET_FONT_NAME_WOFF2_2 = os.path.join(TEMP_DIR, 'CJKExtSubset2.generated.woff2')


def ensure_noto_sans_sc():
    if not os.path.exists(NOTO_SANS_SC_PATH):
        url = 'https://github.com/notofonts/noto-cjk/raw/main/Sans/SubsetOTF/SC/NotoSansSC-Regular.otf'
        urllib.request.urlretrieve(url, NOTO_SANS_SC_PATH)


def ensure_plangothic():
    if not os.path.exists(PLANGOTHIC_PATH):
        url = 'https://github.com/Fitzgerald-Porthmouth-Koenigsegg/Plangothic_Project/raw/main/fonts/otf/Plangothic.ttc'
        urllib.request.urlretrieve(url, PLANGOTHIC_PATH)


def basic_subset():
    if os.path.exists(BASIC_SUBSET_FONT_NAME_OTF):
        os.remove(BASIC_SUBSET_FONT_NAME_OTF)
    pyftsubset([
        NOTO_SANS_SC_PATH,
        f'--unicodes=U+4E00-9FFF,U+3400-4DBF',
        f'--output-file={BASIC_SUBSET_FONT_NAME_OTF}',
    ])

    woff2_compress(BASIC_SUBSET_FONT_NAME_OTF, BASIC_SUBSET_FONT_NAME_WOFF2)

    shutil.copy(BASIC_SUBSET_FONT_NAME_WOFF2, FONTS_DIR)


def subset(chars):
    print(f'Subset: {chars}')
    # write chars to a tmp file
    name = tempfile.mktemp(dir=TEMP_DIR)
    with open(name, 'w', encoding='utf-8') as f:
        f.write(''.join(chars))
    pyftsubset([
        PLANGOTHIC_PATH,
        f'--text-file={name}',
        f'--output-file={SUBSET_FONT_NAME_TTF1}',
        f'--font-number=0',
    ])
    pyftsubset([
        PLANGOTHIC_PATH,
        f'--text-file={name}',
        f'--output-file={SUBSET_FONT_NAME_TTF2}',
        f'--font-number=1',
    ])
    fontname([SUBSET_FONT_NAME1, SUBSET_FONT_NAME_TTF1])
    fontname([SUBSET_FONT_NAME2, SUBSET_FONT_NAME_TTF2])

    woff2_compress(SUBSET_FONT_NAME_TTF1, SUBSET_FONT_NAME_WOFF2_1)
    woff2_compress(SUBSET_FONT_NAME_TTF2, SUBSET_FONT_NAME_WOFF2_2)

    shutil.copy(SUBSET_FONT_NAME_WOFF2_1, FONTS_DIR)
    shutil.copy(SUBSET_FONT_NAME_WOFF2_2, FONTS_DIR)


def post_process():
    # delete tmp dir
    shutil.rmtree(TEMP_DIR)


def get_chars():
    # TODO: Use released dist
    with open('pujdict-base/data/entries.yml', 'r', encoding='utf-8') as f:
        yaml_entries = yaml.load(f, yaml.Loader)
    entries = []
    for yaml_ent in yaml_entries:
        entries.append(yaml_ent[0].split(','))

    # CJK B~I
    result = set()
    for char, char_sim in entries:
        if not is_cjk_basic(char):
            result.add(char)
        if char == char_sim:
            continue
        if not is_cjk_basic(char_sim):
            result.add(char_sim)

    with open('pujdict-base/data/phrases.yml', 'r', encoding='utf-8') as f:
        yaml_phrases = yaml.load(f, yaml.Loader)

    phrases = []
    for i, yaml_phrase in enumerate(yaml_phrases):
        k, v = next(iter(yaml_phrase.items()))
        teochew_list, puj_list, cmn_list, word_class_list, tag_list = k.split('|')
        teochew_list = teochew_list.split('/')
        for teochew in teochew_list:
            for char in teochew:
                if not is_cjk_basic(char):
                    result.add(char)

    return result


if __name__ == '__main__':
    chars = get_chars()
    # ensure_noto_sans_sc()
    ensure_plangothic()
    # basic_subset()
    subset(chars)
    post_process()
