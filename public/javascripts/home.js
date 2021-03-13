$(function(){
    var mapOptions = {
        center: new naver.maps.LatLng(37.3595704, 127.105399),
        zoom: 10
    };
    
    var map = new naver.maps.Map('map', mapOptions);

    $("#current").click(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                let lat = position.coords.latitude;
                let lng = position.coords.longitude;
                let latlng = new naver.maps.LatLng(lat, lng);
                console.log(lat, lng);
                map.setZoom(14, false);
                map.panTo(latlng);
            });
        } else {
            alert("위치정보 사용 불가능");
        }
    })
    
    $(".select_elem").on("click", function(e){
        let t = $(e.target).text()
        console.log(`selected : ${t}`)
    })

})
