import { asyncFunctions, dashboardAsyncFunctions } from "./asyncFunctions";

const searchField = document.querySelector("input[type='search']");
const countrySelect = document.querySelector(".country-select");
const peopleInfo = document.querySelector(".people-info-fields");

//fill the countrySelect element with options
dashboardAsyncFunctions.fillSelectCountryElem(countrySelect);
//fill the visitors card by a random number between 5000 and 10000
document.querySelector(".visitors").textContent = Math.floor(
  Math.random() * (10000 - 5000 + 1) + 5000
);
//fill the total signups field
dashboardAsyncFunctions.updateTotalSignups();
//fill the signup countries field
dashboardAsyncFunctions.updateSignupCountries();
//fill the uncapitalized names field
dashboardAsyncFunctions.updateUncapitalizedNames();
//Add event listener to the search field
searchField.addEventListener("keyup", (ev) => {
  if (ev.target.value.length > 0) {
    const searchVals = collectPeopleSearchInputs();
    const query = buildPeopleSearchQuery(searchVals[0], searchVals[1]);
    displayPeople(query);
  } else {
    displayPeople(
      "http://18.193.250.181:1337/api/people?&pagination[pageSize]=10&populate=country"
    );
  }
  ev.currentTarget.value;
});
//Add event listener to the country select field
countrySelect.addEventListener("change", (ev) => {
  const searchVals = collectPeopleSearchInputs();
  const query = buildPeopleSearchQuery(searchVals[0], searchVals[1]);
  displayPeople(query);
});

//Function to display people on the page
async function displayPeople(url) {
  try {
    const data = await asyncFunctions.getData(url);

    peopleInfo.innerHTML = "";

    data.data.forEach((el) => {
      peopleInfo.innerHTML += `
    <div class="person-field">
    <div class="initialsContactInfo">
      <div class="initials">${
        el.attributes.first_name[0] + el.attributes.last_name[0]
      }</div>
      <div class="contact-info">
        <p>${el.attributes.first_name + " " + el.attributes.last_name}</p>
        <span>${el.attributes.email}</span>
      </div>
    </div>
    <div class="country">${
      el.attributes.country.data
        ? el.attributes.country.data.attributes.country
        : "No Country"
    }</div>
  </div>`;
    });
  } catch (err) {
    console.log(err.message);
  }
}

//Functions that help to get search inputs and formulate search query/////////////////////////
function buildPeopleSearchQuery(searchVal, countryID) {
  let query =
    "http://18.193.250.181:1337/api/people?&pagination[pageSize]=10&populate=*";

  if (countryID) {
    query += `&filters[country][id][$eq]=${countryID}`;
  }
  if (searchVal) {
    query += `&filters[$or][0][first_name][$containsi]=${searchVal}&filters[$or][1][last_name][$containsi]=${searchVal}`;
  }

  return query;
}

function collectPeopleSearchInputs() {
  return [
    searchField.value,
    countrySelect.options[countrySelect.selectedIndex].dataset.id,
  ];
}
/////////////////////////////////////////////////////////////////////////////////////////////

//initialize people info list
displayPeople(
  "http://18.193.250.181:1337/api/people?&pagination[pageSize]=10&populate=*"
);

//sample search for a specific country with the name containing something or the surname containing something
//http://18.193.250.181:1337/api/people?populate=*&filters[country][id][$eq]=7&filters[$or][0][first_name][$containsi]=ll&filters[$or][1][last_name][$containsi]=o
