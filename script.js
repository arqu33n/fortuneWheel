var SEID;
var selectedGift;
var firebaseData;
var user;

fetch("https://counter-10f6a-default-rtdb.firebaseio.com/.json")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);

    function checkSEID() {
      var SEIDInterval = setInterval(function () {
        document.cookie.split(";").forEach(function (element) {
          if (element.indexOf("_seid") >= 0) {
            SEID = element.split("=")[1];
            clearInterval(SEIDInterval);
            console.log("SEID found:", SEID);
            user = data.users.find((user) => user.seid === SEID);
            if (!user) {
              addToDatabase(SEID, data);
            }
          }
        });
        const giftsArray = Array.from(
          Object.entries(data).reduce((acc, [key, value]) => {
            for (let i = 0; i < value; i++) {
              acc.push(key);
            }
            return acc;
          }, [])
        );
        if (giftsArray.length > 0) {
          const randomIndex = Math.floor(Math.random() * giftsArray.length);
          selectedGift = giftsArray[randomIndex];
          console.log(selectedGift);
          // блок подарок
          if (user?.email || user?.phone) {
            console.log("SEID уже существует в базе данных");
            // блок вы уже забрали подарок
          }
        } else {
          console.log("подарки кончились");
        }
      }, 500);
    }
    checkSEID();
    firebaseData = data;
    return data;
  })
  .catch((error) => {
    console.error("Ошибка получения данных:", error);
  });

function addToDatabase(SEID, data, email = null, phone = null) {
  // Отправляем PATCH-запрос, добавляя нового пользователя в массив
  const user = data.users.find((user) => user.seid === SEID);
  if (user && (email || phone)) {
    user.email = email;
    user.phone = phone;
  } else {
    data.users.push({ seid: SEID });
  }
  return fetch("https://counter-10f6a-default-rtdb.firebaseio.com/.json", {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
    .then((response) => {
      if (response.ok) {
        console.log("Значение успешно обновлено");
      } else {
        console.error("Ошибка при обновлении значения");
      }
    })
    .catch((error) => {
      console.error("Ошибка:", error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  var form = document.querySelector("form");
  form.addEventListener("submit", formSubmit);
  function formSubmit(e) {
    e.preventDefault();
    const phone = document.getElementById("phone");
    const email = document.getElementById("email");

    if (user?.email || user?.phone) {
      // блок вы уже забрали подарок
      return;
    } else {
      updateGiftCounter(firebaseData);
      addToDatabase(SEID, firebaseData, email.value, phone.value);
    }
  }
});

// Функция для выбора случайного подарка и обновления данных на сервере
function updateGiftCounter(data) {
  // Уменьшаем количество выбранного подарка на 1
  data[selectedGift]--;

  // Отправляем обновленные данные на сервер
  fetch("https://counter-10f6a-default-rtdb.firebaseio.com/.json", {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
    .then((response) => {
      if (response.ok) {
        console.log("Данные успешно обновлены на сервере");
      } else {
        console.error("Ошибка при обновлении данных на сервере");
      }
    })
    .catch((error) => {
      console.error("Ошибка:", error);
    });

  // Выводим выбранный подарок
  console.log("Выбранный подарок:", selectedGift);
}
