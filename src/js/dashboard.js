import { asyncFunctions } from "./asyncFunctions";
import { fillSelectCountryElem } from "./formStepsHtml";

const searchField = document.querySelector("input[type='search']");
const countrySelect = document.querySelector(".country-select");
const peopleInfo = document.querySelector(".people-info-fields");

//fill the countrySelect element with options
fillSelectCountryElem(countrySelect);

//fill the visitors card by a random number between 5000 and 10000
document.querySelector(".visitors").textContent = Math.floor(
  Math.random() * (10000 - 5000 + 1) + 5000
);

//fill the total signups field
let signups = document.querySelector(".signups");
fetch(
  "http://18.193.250.181:1337/api/people?&pagination[pageSize]=10&populate=country"
)
  .then((res) => res.json())
  .then((data) => (signups.textContent = data.meta.pagination.total))
  .catch((err) => alert(err.message));
//Add event listeners to the search and select fields
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

countrySelect.addEventListener("change", (ev) => {
  const searchVals = collectPeopleSearchInputs();
  const query = buildPeopleSearchQuery(searchVals[0], searchVals[1]);
  displayPeople(query);
});

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
    alert(err.message);
  }
}

//initialize people info list
displayPeople(
  "http://18.193.250.181:1337/api/people?&pagination[pageSize]=10&populate=*"
);

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

async function getAllPeopleFromDB() {
  try {
    const data = await asyncFunctions.getData(
      `http://18.193.250.181:1337/api/people?&pagination[pageSize]=100&populate=*`
    );

    let array = [];
    for (let page = 1; array.length < data.meta.pagination.total; page++) {
      const data = await asyncFunctions.getData(
        `http://18.193.250.181:1337/api/people?&pagination[pageSize]=100&pagination[page]=${page}&populate=*`
      );
      data.data.forEach((el) => array.push(el));
    }
    return array;
  } catch (err) {
    alert(err.message);
  }
}

async function updateUncapitalizedNames() {
  let array = await getAllPeopleFromDB();
  array = array.map((el) => [
    el.attributes.first_name,
    el.attributes.last_name,
  ]);
  array = array.filter(
    (el) =>
      el[0][0] !== el[0][0].toUpperCase() || el[1][0] !== el[1][0].toUpperCase()
  );
  document.querySelector(".not-capitalized-names").textContent = array.length;
}

async function updateSignupCountries() {
  let array = await getAllPeopleFromDB();
  let uniqueCountries = [];
  array.forEach((el) => {
    const shortcut = el.attributes.country.data;
    if (shortcut) {
      if (!uniqueCountries.includes(shortcut.attributes.country)) {
        uniqueCountries.push(shortcut.attributes.country);
      }
    }
  });
  document.querySelector(".signup-countries").textContent =
    uniqueCountries.length;
}
updateSignupCountries();
updateUncapitalizedNames();

//sample search for a specific country with the name containing something or the surname containing something
//http://18.193.250.181:1337/api/people?populate=*&filters[country][id][$eq]=7&filters[$or][0][first_name][$containsi]=ll&filters[$or][1][last_name][$containsi]=o
