// when document is ready
$(function () {
    var container = document.getElementById('map');
    var options = {
        center: new kakao.maps.LatLng(33.450701, 126.570667),
        level: 3
    };

    var map = new kakao.maps.Map(container, options);

    //마커클러스터
    var clusterer = new kakao.maps.MarkerClusterer({
        map: map,
        gridSize: 35,
        averageCenter: true,
        minLevel: 7,
        disableClickZoom: true,
    });


    // 현재 위치 클릭
    $("#current").on("click", function (e) {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                let lat = position.coords.latitude;
                let lng = position.coords.longitude;
                let latlng = new kakao.maps.LatLng(lat, lng);
                map.setLevel(6);
                map.panTo(latlng);
            });
        } else {
            alert("위치정보 사용 불가능");
        }
    });
    
    //해당 url로 post 요청. data에 담긴 것은 어떤걸 등록 / 삭제 할 지
    let sendPostReq = async function (url, data, msg) {
        let executed_doc=null;
        await $.ajax({
            type: "POST",
            url: url,
            data: data,
        }).done((res) => {
            if (res.message == "success"){
                alert(`성공적으로 ${msg} 했습니다.`);
                executed_doc = res.data;
            } 
            else{
                alert(`${msg} 실패했습니다.`);
            } 
        }).fail((err) => {
            console.log(err);
        })
        return executed_doc;
    };

    //(register) 새로 등록하는 용 마커, 인포윈도우  (지도 클릭하면 뜨는)
    (function () {
        var register_marker = new kakao.maps.Marker();

        // let flowers = ["개나리", "해바라기", "소나무"];
        let flower_elems = "";
        for(s in flowers){
            for(f of flowers[s]){
                flower_elems +=`<li><a class="el ${s}" href="#">${f}</a></li>`
            }
        }
        //let flower_elems = flowers.reduce((a, x) => a + `<li><a class="el" href="#">${x}</a></li>`, "");
        let content = `
        <div style="padding:10px">
            <div class="dropdown">
                <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">꽃
                <span class="caret"></span></button>
                <ul class="dropdown-menu" style="overflow-y:scroll; height:200px">
                    <input class="form-control" id="myInput" type="text" placeholder="Search..">
                    ${flower_elems}
                </ul>
            </div>
            <button style="margin:5px" class="submit_btn">등록</button>
            <button style="margin:5px" class="cancel_btn">취소</button>
        </div>`;
        var register_infowindow = new kakao.maps.InfoWindow({ content: content });
        var initial_click = true;
        let selected_flower;
        let season;
        let pos;

        let event_register = () => {
            $("#myInput").on("keyup", function () {
                var value = $(this).val().toLowerCase();
                $(".dropdown-menu li").filter(function () {
                    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                });
            });

            $(".el").on("click", function (e) {
                selected_flower = $(e.target).text();
                season = $(e.target).attr('class').split(" ")[1];
                console.log(season, selected_flower, "clicked..");
            });

            $(".cancel_btn").on("click", function (e) {
                $("#myInput").val('').trigger('keyup');
                register_infowindow.close();
                register_marker.setMap(null);
            });

            $(".submit_btn").on("click", function (e) {
                if (!selected_flower) {
                    alert("꽃을 선택해 주세요!");
                    return;
                }
                console.log(selected_flower + "를 등록합니다.")
                let new_data = { flower_type: selected_flower, season , lat: pos[0], lng: pos[1] };
                // async 키워드를 썼기대문에 이제 sendPostReq함수는 promise를 리턴함!
                sendPostReq('/flower_register', new_data, "등록").then((registered_doc)=>{
                    console.log("db에 등록 :",registered_doc);
                    add_new_info_marker(registered_doc);
                })
                $("#myInput").val('').trigger('keyup');
                register_infowindow.close();
                register_marker.setMap(null);
            });

        }

        kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
            var latlng = mouseEvent.latLng;
            pos = [latlng.Ma, latlng.La];
            register_marker.setPosition(latlng);
            register_infowindow.setPosition(latlng);
            selected_flower = null;

            register_marker.setMap(map);
            register_infowindow.open(map, register_marker);
            if (initial_click) {
                //왠지 모르겠는데 open한 이후에나 이벤트 등록이 됨.
                //그 이후에나 dom 인식이되나봄.
                event_register();
                initial_click = false;
            }
        });

    })(); //register marker, infowindow

    //이미 등록되어 있는 정보들을 마커로 표시하는 함수 (클로저로 구현)
    let add_new_info_marker = (function () {
        var infowindow = new kakao.maps.InfoWindow({ removable: true });
        var iwcontent = (flower) => {
            return `<div>${flower}</div>
                    <button class="delete_btn">삭제</button>`;
        }

        let clickHandler = function (target, marker) {
            return () => {
                infowindow.setContent(iwcontent(target.flower_type));
                infowindow.open(map, marker);
                $(".delete_btn").on("click", deleteHandler(target._id,marker));
            };
        }

        let deleteHandler = function (id,marker) {
            return () => {
                sendPostReq('/flower_delete', {id:id} , "삭제").then((deleted_doc)=>{
                    console.log("db에서 삭제 :",deleted_doc);
                    clusterer.removeMarker(marker);
                    marker.setMap(null);
                })
                infowindow.close();    
            }
        }

        let marker_func = function (target) {
            var latlng = new kakao.maps.LatLng(target.lat, target.lng)
            var marker = new kakao.maps.Marker({
                map: map,
                position: latlng
            });

            kakao.maps.event.addListener(marker, 'click', clickHandler(target, marker));
            clusterer.addMarker(marker);
        }
        return marker_func;
    })();   // render one marker

    //db 모든 정보 가져와서 마커로 표시하기
    $.ajax({
        url: "/flower_fetch",
        type: "POST",
        data: {season:"전체"}
    }).done((res) => {
        if (res.message != "success") {
            alert("기존 꽃 위치 정보를 가져오는데 실패했습니다.");
            return;
        }
        const data = res.data;
        for (var target of data) {
            add_new_info_marker(target);
        }
    }).fail((err) => {
        console.log(err);
    });

});  //document ready




