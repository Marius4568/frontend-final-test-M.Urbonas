import { asyncFunctions } from "./asyncFunctions";

let step1 = ``;

let step2 = ``;

let step3 = ``;
const step4 = `<fieldset>
<p>Please check your email</p>
<span
  >We sent you an email with all of the required information to complete
  the registration.</span
>
</fieldset>`;

export async function getSteps() {
  let countryOptions = ``;
  let countrySelect = ``;
  let activityCheckboxes = ``;
  let steps = ``;

  try {
    //Getting activities and handling their errors
    const activities = await asyncFunctions.getData(
      "http://18.193.250.181:1337/api/activities"
    );
    if (activities.error) {
      step1 = `Error ${activities.error.status}: ${activities.error.message}`;
    } else if (activities.data.length < 1) {
      step1 = `Empty array, no data found.`;
    } else {
      activities.data.forEach((el) => {
        activityCheckboxes += `<input
      type="checkbox"
      name="afterwork-activity"
      value="${el.attributes.title}"
      data-id="${el.id}"
    /><label for="${el.id}">${el.attributes.title}</label>
    <br />`;
      });

      step1 = `<fieldset>
<p>What do you usually do After Work?</p>
${activityCheckboxes}
</fieldset>`;
    }

    //Getting countries and handling their errors
    const countries = await asyncFunctions.getData(
      "http://18.193.250.181:1337/api/countries"
    );

    if (countries.error) {
      step2 = `Error ${countries.error.status}: ${countries.error.message}`;
    } else if (countries.data.length < 1) {
      step2 = `Empty array, no data found.`;
    } else {
      countries.data.forEach((el) => {
        countryOptions += `<option data-id =${el.id} value=${el.attributes.country}>${el.attributes.country}</option>`;
      });
      countrySelect = `<select id="country" name="country">
    <option selected disabled hidden value="1">Your Country:</option>
    ${countryOptions}
    </select>`;

      step2 = `<fieldset>
<p>Please fill in your details:</p>
<input type="text" name="" id="name" placeholder="First Name" required/><br />
<input type="text" name="" id="lastName" placeholder="Last Name" required/><br />
<input type="email" name="" id="email" placeholder="Your Email" required/><br />
${countrySelect}<br />
<input type="checkbox" name="" id="T&C" required/><span
  >Please accept our <a href="#">terms and conditions</a></span
>
</fieldset>`;
    }

    return (steps = [step1, step2, step3, step4]);
  } catch (err) {
    return (steps = [step1, step2, step3, step4]);
  }
}

export async function fillSelectCountryElem(selectElem) {
  let options = ``;
  const countries = await asyncFunctions.getData(
    "http://18.193.250.181:1337/api/countries"
  );

  if (countries.error) {
    alert(
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
}
