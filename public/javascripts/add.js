var container = document.getElementById('map');
var options = {
    center: new kakao.maps.LatLng(33.450701, 126.570667),
    level: 3
};

var map = new kakao.maps.Map(container, options);
let flowers = ["개나리", "해바라기", "소나무"];

(function () {
    var marker = new kakao.maps.Marker();

    let flower_elems = flowers.reduce((a, x) => a + `<li><a class="el" href="#">${x}</a></li>`, "");
    let content = `
    <div style="padding:15px">
        <div class="dropdown">
            <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">꽃
            <span class="caret"></span></button>
            <ul class="dropdown-menu">
                <input class="form-control" id="myInput" type="text" placeholder="Search..">
                ${flower_elems}
            </ul>
        </div>
        <button style="margin:5px">등록</button>
        <button style="margin:5px">취소</button>
    </div>`;
    var infowindow = new kakao.maps.InfoWindow({content:content});
    var initial_click = true;
    let event_register = () => {
        $(document).ready(function(){
            $("#myInput").on("keyup", function() {
              var value = $(this).val().toLowerCase();
              $(".dropdown-menu li").filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
              });
            });
          
            $(".el").on("click", function(e){
              let t = $(e.target).text();
              console.log(t,"clicked..");
            })    
        });
    }



    kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
        var latlng = mouseEvent.latLng;
        marker.setPosition(latlng);
        infowindow.setPosition(latlng);

        marker.setMap(map);
        infowindow.open(map, marker);  
        if(initial_click){
            // 왠지 모르겠는데 open한 이후에나 이벤트 등록이 됨.
            //그 이후에나 dom 인식이되나봄.
            event_register();
            initial_click=false;
        }
    });

})()


