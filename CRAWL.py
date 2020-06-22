#!usr/bin/python
# -*- coding: utf-8 -*-
 
from bs4 import BeautifulSoup
import requests
import csv
import codecs
import sys
from imp import reload
reload(sys)
 
 

url = "https://lz.58.com/chuzu/b5/pn{page}"
 
'''PAGES HAVE FINISHED,DEFAULT IS 0'''
page = 0
 
# SAVE AS rent.csv
csv_file = open("rent.csv","w",encoding='utf-8-sig')
csv_writer = csv.writer(csv_file, delimiter=',')
 
# TRANSFER THE CHARACTER TO NUMBER
def convertNum(moneychar):
    arr = ['龤','龒','閏','麣','餼','驋','龥','鑶','鸺','齤'] #0-9
    num = ""
    for i in moneychar:
        num += str(arr.index(i))
    return num
 
# CRAWL EACH PAGE
while True:
    page += 1
    print("fetch: ", url.format(page=page))
    response = requests.get(url.format(page=page))
    # response.encoding = 'gb10'
    html = BeautifulSoup(response.text, "html.parser")
    house_list = html.select(".house-list > li")
 
    # print(response.text)
 
    # FINISH THE LOOP WHEN NO NEW INFORMATION
    if not house_list:
        print("over...")
        break
 
    for house in house_list:
 
        # FIND TAG
        # TITTLE
        house_title = house.select("h2>a")[0].string
        # URL
        house_url = house.select("a")[0]["href"]
        # INFORMATION OF RENT
        house_info_list = house_title.split()
 
 
        #DELETE VALID INFORMATION
        if(len( house.select(".des>.infor>a"))==1):
            break
        
        # AREA
        house_location = house.select(".des>.infor>a")[1].string
        # PRICE
        house_money = house.select(".money")[0].select("b")[0].string
        
        #TRANSFER
        house_money = convertNum(house_money)
        
        # WRITE rent.csv
        csv_writer.writerow([house_title, house_location, house_money, house_url])
 
csv_file.close()