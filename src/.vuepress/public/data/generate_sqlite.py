import csv
import os
import sqlite3
import sys

from puj import *

if __name__ == '__main__':
    # open entries.csv and parse it to entries.db
    # read and drop first line of entries.csv
    with open('pujdict-data/entries.tsv', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    lines = lines[1:]
    csv_reader = csv.reader(lines, delimiter='\t')
    entries = [Entry(*line) for line in csv_reader]


    def get_entry(index):
        return entries[int(index) - 1]


    # create initials -> entry index map
    initials = {}
    for entry in entries:
        if entry.initial not in initials:
            initials[entry.initial] = []
        initials[entry.initial].append(entry.entry_index)

    # create finals -> entry index map
    finals = {}
    for entry in entries:
        if entry.final not in finals:
            finals[entry.final] = []
        finals[entry.final].append(entry.entry_index)

    # create initial_final -> entry index map
    initial_finals = {}
    for entry in entries:
        combination = entry.initial + entry.final
        if combination not in initial_finals:
            initial_finals[combination] = []
        initial_finals[combination].append(entry.entry_index)

    # create char -> entry index map
    char_sim_chars = {}
    for entry in entries:
        combination = entry.char_sim + entry.char
        if combination not in char_sim_chars:
            char_sim_chars[combination] = []
        char_sim_chars[combination].append(entry.entry_index)

    # erase entries.db if it exists
    if os.path.exists('entries.db'):
        os.remove('entries.db')
    # create entries.db
    conn = sqlite3.connect('entries.db')
    c = conn.cursor()

    # create table entries
    c.execute(
        'CREATE TABLE entries (entry_index int, char text, char_sim text, initial text, final text, tone int, sp_nasal int, cat text, char_ref text, details text)')
    # create index for entry_index
    c.execute('CREATE INDEX entry_index_index ON entries (entry_index)')
    # create index for initial-final-tone
    c.execute('CREATE INDEX initial_final_tone_index ON entries (initial, final, tone)')
    # insert entries into entries.db
    for entry in entries:
        c.execute('INSERT INTO entries VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                  (entry.entry_index, entry.char, entry.char_sim, entry.initial, entry.final, entry.tone, entry.sp_nasal, entry.cat, entry.char_ref, entry.details))

    # # create table initials
    # c.execute('CREATE TABLE initials (initial text, entry_index int)')
    # # create index for initial-entry_index
    # c.execute('CREATE INDEX initial_index ON initials (initial, entry_index)')
    # # insert initials into entries.db
    # for initial in initials:
    #   for entry_index in initials[initial]:
    #     c.execute('INSERT INTO initials VALUES (?, ?)', (initial, entry_index))

    # # create table finals
    # c.execute('CREATE TABLE finals (final text, entry_index int)')
    # # create index for final-entry_index
    # c.execute('CREATE INDEX final_index ON finals (final, entry_index)')
    # # insert finals into entries.db
    # for final in finals:
    #   for entry_index in finals[final]:
    #     c.execute('INSERT INTO finals VALUES (?, ?)', (final, entry_index))

    # create table char_sim_chars
    # c.execute('CREATE TABLE char_sim_chars (char_sim text, char text, entry_index int)')
    # # create index for char_sim_char-entry_index
    # c.execute('CREATE INDEX char_sim_char_index ON char_sim_chars (char_sim, char, entry_index)')
    # # insert char_sim_chars into entries.db
    # for char_sim_char in char_sim_chars:
    #   for entry_index in char_sim_chars[char_sim_char]:
    #     entry = get_entry(entry_index)
    #     c.execute('INSERT INTO char_sim_chars VALUES (?, ?, ?)', (entry.char_sim, entry.char, entry_index))

    # create dbdesc table, desc initials, finals, initial_final_tones, char_sim_chars
    c.execute('CREATE TABLE dbdesc (id text, description text)')
    c.execute('INSERT INTO dbdesc VALUES (?, ?)', ('entries_count', len(entries)))
    c.execute('INSERT INTO dbdesc VALUES (?, ?)', ('initials', ','.join(sorted(initials.keys()))))
    c.execute('INSERT INTO dbdesc VALUES (?, ?)', ('finals', ','.join(sorted(finals.keys()))))
    c.execute('INSERT INTO dbdesc VALUES (?, ?)',
              ('combinations', ','.join(sorted([f'{entry.initial}-{entry.final}-{entry.tone}' for entry in entries]))))

    conn.commit()
    # print all entries
    # c.execute('SELECT * FROM entries')
    # entries = c.fetchall()
    # for entry in entries:
    #   print(entry)
    conn.close()

    # open entries.db and test it
    conn = sqlite3.connect('entries.db')
    c = conn.cursor()
    while True:
        try:
            cmd = input('>>> ')
            if cmd == 'exit':
                break
            else:
                c.execute(cmd)
                print(c.fetchall())
        except EOFError:
            break
        except Exception as e:
            print(e, file=sys.stderr)
            continue

    conn.close()
