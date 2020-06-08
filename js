 /*请求对应的url，加载自己需要的json文件（script用模板的话高德地图不会显示出来。。。。）,数据比较多，改为表单提交*/
    $(document).ready(function(){   
    $('#search_map').submit(function(){  
     //获得form中用户输入的name 注意这里的id_name 与你html中的id一致  
            var house_for_name = $("#house_for_name").val();    //同上  
            var price = $("#price").val(); 
            /*house_i为计时器，每次输入时计时器归零，之后开始计时数据长度，如果长度为0则表明没有数据载入。之后导入高德api的函数每次遍历就减1，计算完成时证明加载完成。如果为0时，forEach没遍历出来,之后也就不会进行遍历了*/
            box.style.display="block";
            house_i = 0;
            delRentLocation();
            var rent_locations = new Set();
            url1 = "{{ city_url }}"+house_for_name+"/"+price
            $.getJSON(url1,function(ret){
                $.each(ret, function(i,item){
                    house_i= house_i + 1;
                    rent_locations.add([ret[i].address, ret[i].info_title, ret[i].price, ret[i].house_url, ret[i].room_info]);
                });
            if(house_i==0){
                box.style.display="none";
                UIkit.notify({
                    message : '没有数据，重新选择',
                    status  : 'danger',
                    timeout : 5000,
                    pos     : 'top-right'
                }); 
            }
                rent_locations.forEach(function(element,index) {
                    addMarkerByAddress(element);
                });
            });
            return false;  
        });  
    });
    /*加载符合当前城市的房源地点，并进行显示*/
    function addMarkerByAddress(house_for) {
        var geocoder = new AMap.Geocoder({
            city:{{ city_code|safe }},
            radius: 1000
        });
        geocoder.getLocation(house_for[0], function(status, result) {
            /*加载出地址，然后转为经纬度再进行描点*/
            house_i=house_i-1
            document.getElementById('cover1').innerHTML = "加载中，剩余数据量：" +house_i;
            /*高德地图有时总加载少一个所以house_i取等于1可以跳过*/
            if(house_i==1){
                box.style.display="none";
                /*uikit自带的通知*/
                UIkit.notify({
                    message : '加载完毕',
                    status  : 'success',
                    timeout : 2000,
                    pos     : 'top-right'
                });
            }
            if (status === "complete" && result.info === 'OK') {
                var geocode = result.geocodes[0];
                rentMarker = new AMap.Marker({
                    map: map,
                    title: house_for[0],
                    icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
                    position: [geocode.location.getLng(), geocode.location.getLat()]
                });
                rentMarkerArray.push(rentMarker);
                /*显示点的信息*/
                rentMarker.content = "<div>房源：<a target = '_blank' href='" + house_for[3] + "'>" + house_for[1] + 
                "</a><div><div>价格："+house_for[2]+"</div><div>房间信息:"+house_for[4]+"</div><div>地址:"+house_for[0]+"</div>"

                /*加载点的信息*/
                rentMarker.on('click', function(e) {
                    x1 = geocode.location.getLng();
                    y1 = geocode.location.getLat();
                    if(x==null|y==null){
                        box.style.display="none";
                        /*uikit自带的通知*/
                        UIkit.notify({
                            message : '请选择工作地点',
                            status  : 'warning',
                            timeout : 2000,
                            pos     : 'top-right'
                        });
                    }
                    infoWindow.setContent(e.target.content);
                    infoWindow.open(map, e.target.getPosition());
                    if (amapTransfer) amapTransfer.clear();
                    /*加载乘车策略*/
                    amapTransfer = new AMap.Transfer({
                        map: map,
                        policy: AMap.TransferPolicy.LEAST_TIME,
                        city: {{ city_code|safe }},
                        panel: 'transfer_panel'
                    });
                    //根据起、终点名称查询公交换乘路线（改用坐标点，统一下不然一些会出错）
                    amapTransfer.search(new AMap.LngLat(x,y), new AMap.LngLat(x1, y1));

                });
            }
        })
    }
