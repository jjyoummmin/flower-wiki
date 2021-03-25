$(function () {
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


    //계절 메뉴 클릭
    $(".select_elem").on("click", function (e) {
        markerList.forEach(m => m.setMap(null));
        markerList = [];
        infowindowList.forEach(iw => iw.close());
        infowindowList = [];
        let season = $(e.target).text()
        console.log(`selected : ${season}`)
        render(season);
    });


    //마커 클러스터 기존에 있으면 삭제 + 새로 생성하는 함수 (클로저)
    let drarw_markercluster = (function () {
        let markerCluster;
        const cluster1 = {
            content: '<div class=cluster style="width:25px; height:25px; line-height:26px;"></div>'
        }, cluster2 = {
            content: '<div class=cluster style="width:30px; height:30px; line-height:31px;"></div>'
        }, cluster3 = {
            content: '<div class=cluster style="width:35px; height:35px; line-height:36px;"></div>'
        };

        const options = {
            minClusterSize: 2,
            maxZoom: 14,
            map: map,
            disableClickZoom: false,
            gridSize: 300,
            icons: [cluster1, cluster2, cluster3],
            indexGenerator: [2, 5, 10],
            stylingFunction: function (clusterMarker, count) {
                $(clusterMarker.getElement()).find('div:first-child').text(count);
            }
        };

        return (markerList) => {
            if (markerCluster) {
                markerCluster.setMap(null);
                markerCluster._clearClusters();
            }
            markerCluster = new MarkerClustering(options);
            markerCluster.setMarkers(markerList);

        };
    })();


    //계절별 마커 표시 하기
    let render = async function (season) {

        let clickHandler = function (marker, infowindow) {
            return () => {
                if (infowindow.getMap()) {
                    infowindow.close();
                } else {
                    infowindow.open(map, marker);
                }
            }
        }

        try {
            let res = await $.ajax({ url: "/flower_fetch", type: "POST", data: { season } });
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

                naver.maps.Event.addListener(marker, "click", clickHandler(marker, infowindow));
            }
            //계절마다 꽃 개수 다르니까 마커 클러스터 삭제하고 다시 생성!
            drarw_markercluster(markerList);

        } catch (err) {
            console.error(err);
        }

    }; // render

    render("전체");

})
