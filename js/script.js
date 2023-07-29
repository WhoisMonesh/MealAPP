const FAVOURITES_KEY = "favouritesList";
const url = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const themeToggle = document.getElementById("themeToggle");

// Ensure that the favourites list is initialized in localStorage
if (localStorage.getItem(FAVOURITES_KEY) === null) {
  localStorage.setItem(FAVOURITES_KEY, JSON.stringify([]));
}

// Function to display a toast notification
function showToast(message) {
  const toast = document.createElement("div");
  toast.classList.add("toast", "show");
  toast.setAttribute("role", "alert");
  toast.innerHTML = `
    <div class="toast-body">
      ${message}
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 3000);
}

// Function to fetch meals from the API
async function fetchMealsFromApi(url, value) {
  try {
    const response = await fetch(`${url}${value}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const meals = await response.json();
    return meals;
  } catch (error) {
    throw error;
  }
}

// Function to generate a meal card
function generateMealCard(element, isFav) {
  return `
    <div id="card" class="card mb-3" style="width: 20rem;">
        <img src="${element.strMealThumb}" class="card-img-top" alt="...">
        <div class="card-body">
            <h5 class="card-title">${element.strMeal}</h5>
            <div class="d-flex justify-content-between mt-5">
                <button type="button" class="btn btn-outline-light" onclick="showMealDetails(${element.idMeal})">More Details</button>
                <button id="main${element.idMeal}" class="btn btn-outline-light ${isFav ? 'active' : ''}" onclick="addRemoveToFavList(${element.idMeal})" style="border-radius:50%"><i class="fa-solid fa-heart"></i></button>
            </div>
        </div>
    </div>`;
}

// Function to generate a random heading from the given array
function getRandomHeading(headingsArray) {
  const randomIndex = Math.floor(Math.random() * headingsArray.length);
  return headingsArray[randomIndex];
}

// Function to show the dynamic heading
function showDynamicHeading() {
  const headings = [
    "Find Meals For You",
    "Discover Delicious Meals",
    "Explore Tasty Recipes",
    "Meal Ideas Just For You",
    "Taste the Best Recipes",
    "Your Culinary Adventure Begins",
    "Savor the Flavors",
    "Dive into Yummy Dishes",
    "Delight Your Taste Buds",
    "Mealtime Magic Awaits",
    "Feast on Fantastic Foods"
    // Add more headings as desired
  ];

  const dynamicHeading = getRandomHeading(headings);
  const headingElement = document.getElementById("heading");
  headingElement.innerHTML = `<h1>${dynamicHeading}</h1>`;
}

// Function to show the meal list based on the search input
async function showMealList() {
  const inputValue = document.getElementById("my-search").value.trim(); 
  if (!inputValue) {
    document.getElementById("heading-text").innerHTML = '<h5 class="mt-3 text-center">Your Search Results:</h5>';
    document.getElementById("main").innerHTML = '<p class="text-center mt-3">Please enter a meal name to search for.</p>';
    return;
  }
  try {
    const data = await fetchMealsFromApi(url, inputValue);
    let html = "";
    const arr = JSON.parse(localStorage.getItem(FAVOURITES_KEY));
    if (data.meals) {
      document.getElementById("heading-text").innerHTML = `<h5 class="mt-3 text-center">Your Search Results for "${inputValue}":</h5>`;
      data.meals.forEach((element) => {
        const isFav = arr.includes(element.idMeal);
        html += generateMealCard(element, isFav);
      });
    } else {
      document.getElementById("heading-text").innerHTML = '<h5 class="mt-3 text-center">Your Search Results:</h5>';
      html += `
        <div class="page-wrap d-flex flex-row align-items-center">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-12 text-center">
                        <span class="display-1 d-block">😢</span>
                        <div class="mb-4 lead">
                            The meal you are looking for was not found.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
    document.getElementById("main").innerHTML = html;
  } catch (error) {
    document.getElementById("heading-text").innerHTML = '<h5 class="mt-3 text-center">Your Search Results:</h5>';
    document.getElementById("main").innerHTML = '<p class="text-center mt-3">There was an error fetching meals. Please try again later.</p>';
  }
}

// Function to show meal details
async function showMealDetails(id) {
  const url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
  let html = "";
  try {
    const data = await fetchMealsFromApi(url, id);
    html += `
      <div id="meal-details" class="mb-5">
        <div id="meal-header" class="d-flex justify-content-around flex-wrap">
          <div id="meal-thumbnail">
            <img class="mb-2" src="${data.meals[0].strMealThumb}" alt="" srcset="">
          </div>
          <div id="details">
            <h3>${data.meals[0].strMeal}</h3>
            <h6>Category: ${data.meals[0].strCategory}</h6>
            <h6>Area: ${data.meals[0].strArea}</h6>
          </div>
        </div>
        <div id="meal-instruction" class="mt-3">
          <h5 class="text-center">Instruction:</h5>
          <p>${data.meals[0].strInstructions}</p>
        </div>
        <div class="text-center mt-3">
          <a href="${data.meals[0].strYoutube}" target="_blank" class="btn btn-outline-light">Watch Video</a>
          <button class="btn btn-outline-light ms-3" onclick="hideMealDetails()">Close</button>
        </div>
      </div>
    `;
  } catch (error) {
    html += `
      <div class="page-wrap d-flex flex-row align-items-center">
          <div class="container">
              <div class="row justify-content-center">
                  <div class="col-md-12 text-center">
                      <span class="display-1 d-block">😢</span>
                      <div class="mb-4 lead">
                          Meal details not found.
                      </div>
                  </div>
              </div>
          </div>
      </div>
    `;
  }
  document.getElementById("main").innerHTML = html;
}

// Function to show the list of favorite meals
async function showFavMealList() {
  const arr = JSON.parse(localStorage.getItem(FAVOURITES_KEY));
  const url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
  let html = "";
  if (arr.length === 0) {
    html += `
      <div class="page-wrap d-flex flex-row align-items-center">
          <div class="container">
              <div class="row justify-content-center">
                  <div class="col-md-12 text-center">
                      <span class="display-1 d-block">😢</span>
                      <div class="mb-4 lead">
                          No meal added to your favorites list.
                      </div>
                  </div>
              </div>
          </div>
      </div>
    `;
  } else {
    try {
      for (const id of arr) {
        const data = await fetchMealsFromApi(url, id);
        html += generateMealCard(data.meals[0], true);
      }
    } catch (error) {
      // Handle error if needed
    }
  }
  document.getElementById("favourites-body").innerHTML = html;
}

// Function to add or remove a meal from the favorites list
function addRemoveToFavList(id) {
  const arr = JSON.parse(localStorage.getItem(FAVOURITES_KEY));
  const isFav = arr.includes(id);
  if (isFav) {
    const updatedArr = arr.filter(item => item !== id);
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(updatedArr));
    showToast("Your meal removed from your favorites list");
  } else {
    arr.push(id);
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(arr));
    showToast("Your meal added to your favorites list");
  }
  showMealList();
  showFavMealList();
}

// Function to hide meal details and show the main meal list
function hideMealDetails() {
  showMealList();
}

// Initial call to show the dynamic heading and display meals on page load
showDynamicHeading();
showMealList();
