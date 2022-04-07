export const asyncFunctions = {
  getData: async function (url) {
    try {
      const res = await fetch(url);
      const data = await res.json();

      return data;
    } catch (err) {
      return err.message;
    }
  },

  postPersonData: async function (url, dataObject) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            first_name: dataObject.first_name,
            last_name: dataObject.last_name,
            email: dataObject.email,
            country: dataObject.country,
            activities: dataObject.activities,
          },
        }),
      });

      return response.json();
    } catch (err) {
      return err.message;
    }
  },

  deletePersonData: async function (id) {
    try {
      const res = await fetch(`http://18.193.250.181:1337/api/people/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      return data;
    } catch (err) {
      return err.message;
    }
  },
};

export const dashboardAsyncFunctions = {
  getAllPeopleFromDB: async function () {
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
      console.log(err.message);
    }
  },

  updateUncapitalizedNames: async function () {
    let array = await dashboardAsyncFunctions.getAllPeopleFromDB();
    array = array.map((el) => [
      el.attributes.first_name,
      el.attributes.last_name,
    ]);
    array = array.filter(
      (el) =>
        el[0][0] !== el[0][0].toUpperCase() ||
        el[1][0] !== el[1][0].toUpperCase()
    );
    document.querySelector(".not-capitalized-names").textContent = array.length;
  },

  updateSignupCountries: async function () {
    let array = await dashboardAsyncFunctions.getAllPeopleFromDB();
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
  },

  updateTotalSignups: async function () {
    try {
      let signups = document.querySelector(".signups");
      const data = await asyncFunctions.getData(
        "http://18.193.250.181:1337/api/people?&pagination[pageSize]=10&populate=country"
      );
      signups.textContent = data.meta.pagination.total;
    } catch (err) {
      console.log(err.message);
    }
  },

  fillSelectCountryElem: async function (selectElem) {
    let options = ``;
    const countries = await asyncFunctions.getData(
      "http://18.193.250.181:1337/api/countries"
    );

    if (countries.error) {
      console.log(
        `Error ${countries.error.status}: ${countries.error.message}. Couldn't load countries`
      );
    } else if (countries.data.length < 1) {
      alert(`Empty array, no country data found.`);
    } else {
      countries.data.forEach((el) => {
        options += `<option data-id =${el.id} value=${el.attributes.country}>${el.attributes.country}</option>`;
      });
    }

    selectElem.innerHTML =
      '<option data-id ="" value="All countries">All countries</option>' +
      options;
  },
};
