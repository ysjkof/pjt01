const containerHeight = 720;
const containerWidth = 600;
const minutesinDay = 60 * 12;
let collisions = [];
let width = [];
let leftOffSet = [];

// append one event to calendar
// 캘린더에 하나의 이벤트를 추가한다.
var createEvent = (height, top, left, units) => {

  let node = document.createElement("DIV");
  node.className = "event";
  node.innerHTML = 
  "<span class='title'> Sample Item </span> \
  <br><span class='location'> Sample Location </span>";

  // Customized CSS to position each event
  // 각 이벤트를 포지셔닝할 사용자 지정된 CSS
  node.style.width = (containerWidth/units) + "px";
  node.style.height = height + "px";
  node.style.top = top + "px";
  node.style.left = 100 + left + "px";

  document.getElementById("events").appendChild(node);
}

/* 
collisions is an array that tells you which events are in each 30 min slot
Collisions는 각 30분 슬롯에 있는 이벤트를 알려주는 배열이다.
- each first level of array corresponds to a 30 minute slot on the calendar
  각 배열의 첫 번째 레벨은 캘린더의 30분 슬롯에 해당합니다.
  - [[0 - 30mins], [ 30 - 60mins], ...]
- next level of array tells you which event is present and the horizontal order
  다음 단계의 배열은 존재하는 이벤트와 수평 순서를 알려줍니다.
  - [0,0,1,2] 
  ==> event 1 is not present, event 2 is not present, event 3 is at order 1, event 4 is at order 2
  이벤트2이 존재하지 않습니다. 이벤트2가 존재하지 않습니다. 이벤트 3은 순서1에, 이벤트4 는 순서2에 있습니다.
*/

function getCollisions (events) {

  //resets storage
  collisions = [];

  for (var i = 0; i < 24; i ++) {
    var time = [];
    for (var j = 0; j < events.length; j++) {
      time.push(0);
    }
    collisions.push(time);
  }

  events.forEach((event, id) => {
    let end = event.end;
    let start = event.start;
    let order = 1;

    while (start < end) {
      timeIndex = Math.floor(start/30);

      while (order < events.length) {
        if (collisions[timeIndex].indexOf(order) === -1) {
          break;
        }
        order ++;
      }

      collisions[timeIndex][id] = order;
      start = start + 30;
    }

    collisions[Math.floor((end-1)/30)][id] = order;
  });
};

/*
find width and horizontal position
너비와 높이 위치 찾기

width - number of units to divide container width by
너비 - 컨테이너 너비를 다음으로 나눌 단위 수
horizontal position - pixel offset from left
수평 위치 - 왼쪽에서 픽셀 오프셋
*/
function getAttributes (events) {

  //resets storage
  width = [];
  leftOffSet = [];

  for (var i = 0; i < events.length; i++) {
    width.push(0);
    leftOffSet.push(0);
  }

  collisions.forEach((period) => {

    // number of events in that period 기간에서 이벤트의 수.
    let count = period.reduce((a,b) => {
      return b ? a + 1 : a;
    })

    if (count > 1) {
      period.forEach((event, id) => {
        // max number of events it is sharing a time period with determines width 기간을 공유하는 최대 이벤트 수와 너비 결정하기
        if (period[id]) {
          if (count > width[id]) {
            width[id] = count;
          }
        }

        if (period[id] && !leftOffSet[id]) {
          leftOffSet[id] = period[id];
        }
      })
    }
  });
};

var layOutDay = (events) => {

// clear any existing nodes 기존 노드 지우기.
var myNode = document.getElementById("events");
myNode.innerHTML = '';

  getCollisions(events);
  getAttributes(events);

  events.forEach((event, id) => {
    let height = (event.end - event.start) / minutesinDay * containerHeight;
    let top = event.start / minutesinDay * containerHeight; 
    let end = event.end;
    let start = event.start;
    let units = width[id];
    if (!units) {units = 1};
    let left = (containerWidth / width[id]) * (leftOffSet[id] - 1) + 10;
    if (!left || left < 0) {left = 10};
    createEvent(height, top, left, units);
  });
}