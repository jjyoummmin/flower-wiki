var mapOptions = {
    center: new naver.maps.LatLng(37.3595704, 127.105399),
    zoom: 10
};

var map = new naver.maps.Map('map', mapOptions);

$(document).ready(()=>{
    $(".select_elem").on("click", function(e){
        let t = $(e.target).text()
        console.log(`selected : ${t}`)
    })
})