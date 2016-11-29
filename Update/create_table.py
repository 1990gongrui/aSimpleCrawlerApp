#!/usr/bin/env python3

import sqlite3

conn = sqlite3.connect('test.db')

conn.execute('''CREATE TABLE INSTITUTION
             (ID     INT PRIMARY KEY     NOT NULL,
             NAME    VARCHAR(100)        NOT NULL)''')

print('academy table created successfully')

conn.execute('''CREATE TABLE ARTICLE
             (ID         INT PRIMARY KEY     NOT NULL,
             TITLE      VARCHAR(100)        NOT NULL,
             CONTENT    TEXT                NOT NULL,
             PREVIEW    TEXT,
             PREPICURL   TEXT,
             TIME       DATE                NOT NULL,
             INSTITUTIONID INT              NOT NULL,
             ACCESSNUM  INT                 NOT NULL,
             HREF       TEXT                NOT NULL,
             TAGS       TEXT,
             foreign key(INSTITUTIONID) references INSTITUTION(ID)
            )''')
conn.close()
print('article table created successfully')
