$(function(){
    var mapOptions = {
        center: new naver.maps.LatLng(37.3595704, 127.105399),
        zoom: 10
    };
    
    var map = new naver.maps.Map('map', mapOptions);
    
    let markerList = [];
    let infowindowList = [];

    //현재 위치 클릭
    $("#current").click(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                let lat = position.coords.latitude;
                let lng = position.coords.longitude;
                let latlng = new naver.maps.LatLng(lat, lng);
                map.setZoom(14, false);
                map.panTo(latlng);
            });
        } else {
            alert("위치정보 사용 불가능");
        }
    });
    
    
    //마커 표시 하기
    let render = function(season){

        let clickHandler = function (marker, infowindow){
            return () => {
                if (infowindow.getMap()) {
                    infowindow.close();
                } else {
                    infowindow.open(map, marker);
                }
            }
        }
    
        $.ajax({
            url: "/flower_fetch",
            type: "POST",
            data: {season}
        }).done((res) => {
            if (res.message != "success") {
                alert("기존 꽃 위치 정보를 가져오는데 실패했습니다.");
                return;
            }
            const data = res.data;
            for (var target of data) {
    
                var marker = new naver.maps.Marker({
                    position: new naver.maps.LatLng(target.lat, target.lng),
                    map: map,
                    icon: {
                        url: `/images/flowers/${target.flower_type}.png`,
                        size: new naver.maps.Size(40, 40),
                        scaledSize: new naver.maps.Size(40, 40),
                        anchor: new naver.maps.Point(20, 20)
                    }
                }); 
                
                var infowindow = new naver.maps.InfoWindow({
                    content: target.flower_type
                });

                markerList.push(marker);
                infowindowList.push(infowindow);
                
                naver.maps.Event.addListener(marker, "click", clickHandler(marker,infowindow));
            }
    
        }).fail((err) => {
            console.log(err);
        });

    };  // render

    render("전체");
    
    //계절 메뉴 클릭
    $(".select_elem").on("click", function(e){
        markerList.forEach(m=>m.setMap(null));
        markerList = [];
        infowindowList.forEach(iw=>iw.close());
        infowindowList = [];
        let season = $(e.target).text()
        console.log(`selected : ${season}`)
        render(season);
    });

    //마커 클러스터
    const cluster1 = {
        content:'<div class=cluster style="width:25px; height:25px; line-height:26px;"></div>'
    }, cluster2 = {
        content:'<div class=cluster style="width:30px; height:30px; line-height:31px;"></div>'
    }, cluster3 = {
        content:'<div class=cluster style="width:35px; height:35px; line-height:36px;"></div>'
    };

    var markerClustering = new MarkerClustering({
        minClusterSize: 2,
        maxZoom: 14,
        map: map,
        markers: markerList,
        disableClickZoom: false,
        gridSize: 100,
        icons: [cluster1, cluster2, cluster3],
        indexGenerator: [2,5,10],
        stylingFunction: function (clusterMarker, count) {
            $(clusterMarker.getElement()).find('div:first-child').text(count);
        }
    });

    

})
