const modal = document.querySelector(".modal");
const closeBtn = document.querySelector(".modal__close");
const address = document.querySelector(".modal__address");
const comments = document.querySelector(".modal__comments");
const inputName = document.querySelector(".form__name");
const inputPlace = document.querySelector(".form__place");
const inputText = document.querySelector(".form__text");
const addBtn = document.querySelector(".form__btn");

const placemarks = [];

// Функция ymaps.ready() будет вызвана, когда
// загрузятся все компоненты API, а также когда будет готово DOM-дерево.

ymaps.ready(init);
function init() {
	let myPlacemark;
	let coordinates;
	// Создание карты.
	var myMap = new ymaps.Map("map", {
		// Координаты центра карты.
		// Порядок по умолчанию: «широта, долгота».
		// Чтобы не определять координаты центра карты вручную,
		// воспользуйтесь инструментом Определение координат.
		center: [43.40, 39.95],
		// Уровень масштабирования. Допустимые значения:
		// от 0 (весь мир) до 19.
		zoom: 14,
		controls: []
	}
	);
	// Создание кластера.
	const clusterer = new ymaps.Clusterer({
		clusterDisableClickZoom: true,
		clusterBalloonContentLayout: "cluster#balloonCarousel",
	});

	clusterer.add(placemarks);
	myMap.geoObjects.add(clusterer);

	// Слушаем клик на карте.
	myMap.events.add("click", e => {
		const coords = e.get("coords");
		coordinates = coords;
		comments.innerHTML = "Отзывов пока нет...";

		// Выводим окно с отзывами и формой.
		openBalloon();
		myPlacemark = createPlacemark(coords);
		getAddress(coords);
	});

	// Создание метки.
	function createPlacemark(coords) {
		return new ymaps.Placemark(coords);
	}

	// Определяем адрес по координатам (обратное геокодирование).
	function getAddress(coords) {
		ymaps.geocode(coords).then(function (res) {
			const firstGeoObject = res.geoObjects.get(0);

			myPlacemark.properties.set({
				// Формируем строку с данными об объекте.
				iconCaption: [
					// Название населенного пункта или вышестоящее административно-территориальное образование.
					firstGeoObject.getLocalities().length
						? firstGeoObject.getLocalities()
						: firstGeoObject.getAdministrativeAreas(),
					// Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
					firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
				],
				// В качестве контента балуна задаем строку с адресом объекта.
				balloonContent: firstGeoObject.getAddressLine()
			});
			// Записываем адресс обьекта в хедер окна.
			address.innerText = firstGeoObject.getAddressLine();
		});
	}

	addBtn.addEventListener("click", () => {
		if (inputName.value && inputPlace.value && inputText.value) {
			// Получаем адрес отзыва.
			const addressLink = address.innerText;

			// Формируем дату.
			const date = new Date();
			let year = date.getFullYear();
			let month = `${date.getMonth() + 1}`;
			let day = `${date.getDate()}`;
			let hours = `${date.getHours()}`;
			let minutes = `${date.getMinutes()}`;
			let seconds = `${date.getSeconds()}`;

			if (day.length === 1) day = `0${day}`;
			if (month.length === 1) month = `0${month}`;
			if (hours.length === 1) hours = `0${hours}`;
			if (minutes.length === 1) minutes = `0${minutes}`;
			if (seconds.length === 1) seconds = `0${seconds}`;

			const currentTime = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`; // perfect =)

			// Создаём метку.
			const newPlacemark = new ymaps.Placemark(
				coordinates,
				{
					balloonContentHeader: inputPlace.value,
					balloonContentBody: `<a onclick="openBalloonFull()" class="balloon__address_link">${addressLink}</a><br><br>${inputText.value}<br><br>`,
					balloonContentFooter: currentTime
				},
				{
					preset: "islands#nightDotIcon",
					draggable: false,
					openBalloonOnClick: false // Используем custom balloon.
				}
			);

			// Добавляем метку на карту, в кластер и массив placemarks.
			myMap.geoObjects.add(newPlacemark);
			clusterer.add(newPlacemark);
			placemarks.push(newPlacemark);

			// Обновляем содержимое нашего балуна
			if (comments.innerHTML === "Отзывов пока нет...") comments.innerHTML = "";
			newPlacemark.commentContent = `<div><span><b>${inputName.value}</b></span>
        <span class="ligth">${inputPlace.value}</span>
        <span class="ligth">${currentTime}:</span><br>
        <span>${inputText.value}</span></div><br>`;
			comments.innerHTML += newPlacemark.commentContent;
			newPlacemark.place = address.innerText;

			// Очищаем инпуты.
			clearInputs();

			newPlacemark.events.add("click", () => {
				openBalloon();
				comments.innerHTML = newPlacemark.commentContent;
				address.innerText = newPlacemark.place;
			});
		} else {
			alert("Остались пустые поля.");
		}
	});
}

closeBtn.addEventListener("click", () => {
	modal.style.display = "none";
	clearInputs();
});

const clearInputs = () => {
	inputName.value = "";
	inputPlace.value = "";
	inputText.value = "";
};

// Наш кастомный балун.
const openBalloon = () => {
	modal.style.top = event.clientY + "px";
	modal.style.left = event.clientX + "px";
	modal.style.display = "block";
};

// Балун с контентом из placemarks.
const openBalloonFull = () => {
	address.innerText = "";
	comments.innerHTML = "";
	const addressLink = document.querySelector(".balloon__address_link");

	for (let i = 0; i < placemarks.length; i++) {
		if (addressLink.innerText === placemarks[i].place) {
			address.innerText = placemarks[i].place;
			comments.innerHTML += placemarks[i].commentContent;
		}
	}

	modal.style.top = event.clientY + "px";
	modal.style.left = event.clientX + "px";
	modal.style.display = "block";
};