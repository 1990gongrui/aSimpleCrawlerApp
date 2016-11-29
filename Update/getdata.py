#!/usr/bin/env python3
#coding=utf-8
#import io
#import sys
#sys.stdout = io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

all_academy_url = "http://120.27.33.180:8080/SCU_News_Notice/academy/"
# usage: notice_page_url/academy.no/page.no
notice_page_url = \
        "http://120.27.33.180:8080/SCU_News_Notice/findPageNotice/"

# usage: news_page_url/academy.no/page.np
news_page_url = \
        "http://120.27.33.180:8080/SCU_News_Notice/findPageNews/"

# get number of notice pages
# usage: count_notice_url/academy.no
count_notice_url = \
        "http://120.27.33.180:8080/SCU_News_Notice/countNotices/"

# get number of new pages
# usage: count_news_url/academy.no
count_news_url = \
        "http://120.27.33.180:8080/SCU_News_Notice/countNews/"

from urllib import request
import json
import sqlite3
import hashlib

NOTICE_BASE_ID = 10000000
page_dir = 'pages/'

def get_page(url):
    print(url)
    with request.urlopen(url) as page:
        return page.read()

def get_all_academy():
    url = all_academy_url
    str_data = get_page(url).decode('utf-8')
    dic = json.loads(str_data)
    return dic

def get_num_notice(academyid):
    url = count_notice_url + str(academyid)
    #  print(url)
    num = int(get_page(url).decode('utf-8'))
    return num

def get_num_news(academyid):
    url = count_news_url + str(academyid)
    #  print(url)
    num = int(get_page(url).decode('utf-8'))
    return num

def store_academy(academy):
    try:
        conn = sqlite3.connect('test.db')
        conn.execute('''INSERT INTO INSTITUTION(ID, NAME)
                 VALUES(%s, '%s')''' % (academy['id'], academy['name']))
        conn.commit()
        conn.close();
    except Exception as e:
        print(str(e))

def store_page(page):
    md5 = hashlib.md5()
    md5.update(page)
    hex_str = md5.hexdigest()
    filename = page_dir + str(hex_str)
    with open(filename, 'w') as f:
        f.write(page.decode('utf-8'))
    return filename

def store_article(article):
    try:
        conn = sqlite3.connect('test.db')
        sql = '''INSERT INTO 
        ARTICLE(ID, TITLE, CONTENT, PREPICURL, TIME, INSTITUTIONID, HREF, ACCESSNUM,
        TAGS)
        VALUES(%s, '%s', '%s', '%s', '%s', %s, '%s', 0, '%s')''' % \
        (str(article['id']), article['title'], article['content'], article['picurl'],
         article['time'], str(article['institutionid']),
         article['href'], article['tags'])
        #  print(sql)
        conn.execute(sql)
        conn.commit()
        conn.close()
    except Exception as e:
        print(str(e))

def get_all_news(academy):
    news_num = get_num_news(academy['id'])
    i = 1
    while True:
        url = news_page_url + str(academy['id']) + '/' + str(i)
        print(url)
        str_data = get_page(url).decode('utf-8')
        news = json.loads(str_data)
        if len(news) == 0: break
        for each in news:
            print('academy:%s page:%d id:%s' % 
                  (academy['name'], i, each['id']))
            article = {}
            article['id'] = each['id']
            article['title'] = each['title']
            article['institutionid'] = each['academyId']
            page = get_page(each['content'])
            article['content'] = store_page(page)
            article['picurl'] = ''
            if 'pic' in each:
                article['picurl'] = each['pic']
            article['time'] = each['time']
            article['href'] = each['address']
            article['tags'] = 'news'
            store_article(article)
        i += 1

def get_all_notice(academy):
    news_num = get_num_news(academy['id'])
    i = 1
    while True:
        url = notice_page_url + str(academy['id']) + '/' + str(i)
        print(url)
        str_data = get_page(url).decode('utf-8')
        news = json.loads(str_data)
        if len(news) == 0: break
        for each in news:
            print('academy:%s page:%d id:%s' % 
                  (academy['name'], i, each['id']))
            article = {}
            article['id'] = each['id'] + NOTICE_BASE_ID
            article['title'] = each['title']
            article['institutionid'] = each['academyId']
            page = get_page(each['content'])
            article['content'] = store_page(page)
            article['picurl'] = ''
            if 'pic' in each:
                article['picurl'] = each['pic']
            article['time'] = each['time']
            article['href'] = each['address']
            article['tags'] = 'notice'
            store_article(article)
        i += 1

def main():
    print('ok')
    all_academy = get_all_academy()
    for each in all_academy:
        print(each['name'])
        store_academy(each)
        get_all_notice(each)
        get_all_news(each)

if __name__ == '__main__':
    print(get_num_notice(1))
    print(get_num_news(1))
    main()
