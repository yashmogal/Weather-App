const API_KEY = "168771779c71f3d64106d8a88376808a";

// Tab switching 

const userTab = document.querySelector(".userWeather");
const searchTab = document.querySelector(".searchWeather");
const searchForm = document.querySelector(".searchForm");
const userInfoContainer = document.querySelector(".userInfoContainer");
const grantAccessContainer = document.querySelector(".grantLocationContainer");
const loadingContainer = document.querySelector('.loadingContainer');


let currentTab = userTab;
currentTab.classList.add("currentTab");
getFromSessionStorage();

function switchTab(newTab){
    if(currentTab != newTab){
        currentTab.classList.remove("currentTab");
        currentTab = newTab;
        currentTab.classList.add("currentTab");
    }

    if(!searchForm.classList.contains("active")){
        searchForm.classList.add("active");
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");
    }
    else{
        searchForm.classList.remove("active");
        userInfoContainer.classList.remove("active");
        getFromSessionStorage();
    }
}

userTab.addEventListener('click',()=>{
    switchTab(userTab);
});

searchTab.addEventListener('click',()=>{
    switchTab(searchTab);
});

function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("userCoordinates");

    if(!localCoordinates){
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchWeatherInfo(coordinates);
    }
}

async function fetchWeatherInfo(coordinates){
    const {lat,lon}=coordinates;

    grantAccessContainer.classList.remove('active');

    loadingContainer.classList.add('active');

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);

        const data = await response.json();
        if(!data.sys){
            throw data;
        }
        loadingContainer.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);
    }
    catch(err){
        loadingContainer.classList.remove('active');
    }
}

function renderWeatherInfo(weatherInfo){
    const cityName = document.querySelector(".cityName");
    const countryFlag = document.querySelector(".countryFlag");
    const description = document.querySelector(".weatherDesc");
    const weatherIcon = document.querySelector(".weatherIcon");
    const temp = document.querySelector(".temp");
    const windspeed = document.querySelector(".windspeed");
    const humidity = document.querySelector(".humidity");
    const clouds = document.querySelector(".clouds");

    cityName.innerText = weatherInfo?.name;
    countryFlag.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    description.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp.toFixed(2)} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed.toFixed(2)} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity.toFixed(2)} %`;
    clouds.innerText = `${weatherInfo?.clouds?.all.toFixed(2)} %`;
}

const grantAccessButton = document.querySelector('grantAccess');

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        grantAccessButton.style.display = 'none';
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };
    sessionStorage.setItem("userCoordinates", JSON.stringify(userCoordinates));
    fetchWeatherInfo(userCoordinates);
}

grantAccessButton.addEventListener('click', getLocation);


// Search for weather
const searchInput = document.querySelector('searchInput');

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (searchInput.value === "") {
        return;
    }
    // console.log(searchInput.value);
    fetchSearchWeatherInfo(searchInput.value);
    searchInput.value = "";
});


async function fetchSearchWeatherInfo(city) {
    loadingContainer.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    notFound.classList.remove("active");
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

        const data = await response.json();
        if (!data.sys) {
            throw data;
        }
        loadingContainer.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);
    }
    catch (err) {
        loadingContainer.classList.remove('active');
        userInfoContainer.classList.remove('active');
        notFound.classList.add('active');
        errorText.innerText = `${err?.message}`;
        errorBtn.style.display = "none";
    }
}