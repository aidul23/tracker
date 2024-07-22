const socket = io();

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    (err) => {
      console.error(err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }
  );
}

const map = L.map("map").setView([51.505, -0.09], 16);

const popup = L.popup();

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 20,
  attribution:
    '&copy; <a href="https://aidul23.github.io/aidulislam/" target="blank">Md Aidul Islam</a>',
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  map.setView([latitude, longitude], 16);

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      let totalAddress = "";
      const { road, house_number, suburb, city, country } = data.address;
      if (house_number == undefined) {
        totalAddress += `${road},${" " + suburb},${" " + city}`;
      } else {
        totalAddress += `${road}${" " + house_number},${" " + suburb},${
          " " + city
        }`;
      }
      console.log(totalAddress);

      if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
      } else {
        markers[id] = L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup(totalAddress)
          .openPopup();
      }
    });
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
