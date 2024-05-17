
const userTab=document.querySelector("[data-userWeather]");
const searchTab=document.querySelector("[data-searchWeather]");
const userContainer=document.querySelector(".weather-container");
const grantAccessContainer=document.querySelector(".grant-location-container");
const searchForm=document.querySelector("[data-searchForm]");
const loadingScreen=document.querySelector(".loading-container");
const userInfoContainer=document.querySelector(".user-info-container");

let currentTab=userTab;
const API_KEY="03c100c1f4c28448a04d2a57a2a066e4";
currentTab.classList.add("current-tab");

//ek kaam pending hai idhar?
getfromSessionStorage();
function switchTab(clickedTab){
    if(clickedTab!=currentTab){
        currentTab.classList.remove("current-tab");
        currentTab=clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            //kya search form wala container is invisible, if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            // main pehle search wale tab pr tha ,ab your weather tab visible karna h
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // ab mein your weather tab mein aa gaya hun ,toh weather bhi display karna padega,so let's check storage 
            // ffirst for coordinates, if we have saved them there
            getfromSessionStorage();
        }
    }
}
userTab.addEventListener("click",()=>{
    //pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click",()=>{
    //pass clicked tab as input parameter
    switchTab(searchTab);
});

//check if coordinates are already present in session storage
function getfromSessionStorage(){
    const localCoordinates=sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        //agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates=JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat,lon}=coordinates;
    //make grant container invisible.
    grantAccessContainer.classList.remove("active");
    //make loading screen visible.
    loadingScreen.classList.add("active");

    //API call
    try{
        const response=await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data=await response.json();
        console.log(data);
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        // we need to show error bad request
        // or error 404 page not found.
    }
}

function renderWeatherInfo(weatherInfo){
    //firstly we have to fetch the element.
    const cityName=document.querySelector("[data-cityName]");
    const countryIcon=document.querySelector("[data-countryIcon]");
    const desc=document.querySelector("[data-weatherDesc]");
    const weatherIcon=document.querySelector("[data-weatherIcon]");
    const temp=document.querySelector("[data-temp]");
    const windspeed=document.querySelector("[data-windspeed]");
    const humidity=document.querySelector("[data-humidity]");
    const cloudiness=document.querySelector("[data-cloudiness]");

    //fetch values from weatherInfo
    // we will be using optional chaining operator.
    cityName.innerText=weatherInfo?.name;
    countryIcon.src=`https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText=weatherInfo?.weather?.[0]?.description;
    weatherIcon.src=`http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText=`${weatherInfo?.main?.temp}°C`;
    windspeed.innerText=`${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText=`${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText=`${weatherInfo?.clouds?.all} %`;
}

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert("No geolocation support available");
        console.log("No Geolocation Supported by your browser");
    }
}

function showPosition(position){
    const userCoorinates={
        lat:position.coords.latitude,
        lon:position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoorinates));
    fetchUserWeatherInfo(userCoorinates);
}
const grantAccessButton=document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click",getLocation);

const searchInput=document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    // we did the above step because after the form 
    // is submiited it gets changed to a different link.
    // so we need to prevent it.
     let cityName=searchInput.value;
     if(cityName==""){
        alert("You entered an empty city name");
     }else{
        fetchSearchWeatherInfo(cityName);
     }
})

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const res=await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data= await res.json();
        // console.log(data);
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        if(data?.message=="city not found"){
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.remove("active");
            alert("Sorry You entered a city which does not exist. Please enter a valid City")
        }
        if(data?.message!="city not found"){
            renderWeatherInfo(data);
        }
        
    }
    catch(err){
        loadingScreen.classList.remove("active");
        alert("soory We couldn't fetch data for you.");
    }
}