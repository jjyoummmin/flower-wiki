let flowers = {
    "봄" : ["매화", "벚꽃", "개나리", "진달래", "철쭉", "산수유", "유채", "목련"],
    "여름": ["장미", "수국", "무궁화", "해바라기", "능소화", "맥문동"],
    "가을": ["억새", "코스모스", "백일홍", "국화"],
    "겨울": ["동백"]
};

let all_flowers = [];
for (season in flowers){
    all_flowers = all_flowers.concat(flowers[season]);
}
