// when document is ready
$(function () {
    var container = document.getElementById('map');
    var options = {
        center: new kakao.maps.LatLng(33.450701, 126.570667),
        level: 3
    };

    var map = new kakao.maps.Map(container, options);

    // 현재 위치 클릭
    $("#current").on("click", function(e){
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

    let sendPostReq = function (url, data, msg) {
        $.ajax({
            type: "POST",
            url: url,
            data: data,
        }).done((res)=>{
            if(res=="success") alert(`성공적으로 ${msg} 했습니다.`);
            else alert(`${msg} 실패했습니다.`);
        }).fail((err)=>{
            console.log(err);
        })
    };

    //마커, 인포윈도우 (새로 등록)
    (function () {
        var register_marker = new kakao.maps.Marker();

        let flowers = ["개나리", "해바라기", "소나무"];
        let flower_elems = flowers.reduce((a, x) => a + `<li><a class="el" href="#">${x}</a></li>`, "");
        let content = `
        <div style="padding:10px">
            <div class="dropdown">
                <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">꽃
                <span class="caret"></span></button>
                <ul class="dropdown-menu">
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
                console.log(selected_flower, "clicked..");
            });

            $(".cancel_btn").on("click", function (e) {
                register_infowindow.close();
                register_marker.setMap(null);
            });

            $(".submit_btn").on("click", function (e) {
                if (!selected_flower) {
                    alert("꽃을 선택해 주세요!");
                    return;
                }
                console.log(selected_flower + "를 등록합니다.")
                let new_data ={ flower_type: selected_flower, lat:pos[0], lng:pos[1]};
                sendPostReq('/flower_register',new_data,"등록");
                register_infowindow.close();
                register_marker.setMap(null);
            });

        }

        kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
            var latlng = mouseEvent.latLng;
            pos = [latlng.Ma, latlng.La];
            register_marker.setPosition(latlng);
            register_infowindow.setPosition(latlng);
            selected_flower=null;

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


    // let add_new_info_marker = function(){

    // }

    //기존 등록 정보 마커로 표시, 삭제 인포윈도우
    (function(){
        $.ajax({
            url: "/flower_fetch",
            type: "GET",
        }).done((res) => {
            if (res.message != "success"){
                alert("기존 꽃 위치 정보를 가져오는데 실패했습니다.");
                return;
            }
            const data = res.data;
            // let data = [
            //     {flower_type:"해바라기", lat:37.28987375366218 , lng:127.0718948842586 },
            //     {flower_type:"벚꽃", lat:37.28567600656164 , lng: 127.08206492135476 },
            //     {flower_type:"맨드라미", lat:37.2844288046344,  lng:127.05870442239306 },
            // ]


            var infowindow = new kakao.maps.InfoWindow({removable:true});
            var iwcontent = (flower) =>{
                return `<div>${flower}</div>
                        <button class="delete_btn">삭제</button>`;
            }

            let clickHandler= function (flower,marker) {  
                return () =>{
                    infowindow.setContent(iwcontent(flower));
                    infowindow.open(map, marker);
                    $(".delete_btn").on("click", deleteHandler());
                };    
            }

            let deleteHandler = function (){
                return ()=>{
                    console.log("삭제합니다");
                    infowindow.close();
                }
            }
        
            for (var target of data) {
                var latlng = new kakao.maps.LatLng(target.lat, target.lng)
                var marker = new kakao.maps.Marker({
                    map: map, 
                    position: latlng
                });

                kakao.maps.event.addListener(marker, 'click', clickHandler(target.flower_type,marker));
            }
        }).fail((err)=>{
            console.log(err);
        });

    })(); // fetch flowers

});  //document ready




