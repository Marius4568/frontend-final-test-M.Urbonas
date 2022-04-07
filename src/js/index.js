import { asyncFunctions } from "./asyncFunctions";
import { localStorageFunctions } from "./localStorageFunctions";
import { getSteps } from "./formStepsHtml";
import { progressBarChange } from "./gsapAnimations";

let formSteps = "";

getSteps()
  .then((data) => {
    formSteps = data;
    updateForm();
  })
  .catch((err) => alert(err.message + " couldn't load steps"));

const form = document.forms[0];
const btnWrap = document.querySelector(".btn-wrap");
let currentStep = 0;
const questionCount = document.querySelector(".question-count");
//we're going to change what's inside this container
const formElemWrap = document.querySelector(".form-elements-wrap");

//everytime we click the next button the form updates
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  updateForm();
});

function updateForm() {
  function update() {
    formElemWrap.innerHTML = formSteps[currentStep];
    questionCount.textContent = `${currentStep + 1}/5`;
    progressBarChange(20 * currentStep);
    if (
      formSteps[currentStep].includes("Error") ||
      formSteps[currentStep].includes("Empty")
    ) {
      document.querySelector("button[type='submit']").remove();
    } else {
      currentStep++;
    }
  }
  //depending on the form step we tell the form what to do
  switch (currentStep + 1) {
    case 1:
      localStorageFunctions.removeLocalStorageCheckboxes();
      update();
      break;
    case 2:
      localStorageFunctions.setLocalStorageCheckboxes();
      update();
      break;
    case 3:
      progressBarChange(20 * currentStep);
      document.querySelector("button[type='submit']").textContent =
        "I confirm the details are accurate";
      let btn = document.createElement("button");
      btn.textContent = "Oops, no";
      btn.classList.add("oops-btn");
      const dataToPost = {
        first_name: form.elements[1].value,
        last_name: form.elements[2].value,
        email: form.elements[3].value,
        country:
          form.elements[4].options[form.elements[4].selectedIndex].dataset.id,
        activities: localStorageFunctions.getLocalStorageCheckboxes(),
      };
      let personID = 0;
      asyncFunctions
        .postPersonData("http://18.193.250.181:1337/api/people", dataToPost)
        .then((data) => {
          personID = data.data.id;
          fetchPersonData(data.data.id);
        })
        .catch((err) => console.log(err));

      btn.addEventListener("click", (ev) => {
        localStorageFunctions.removeLocalStorageCheckboxes();
        asyncFunctions.deletePersonData(personID);
        ev.currentTarget.remove();
        currentStep = 0;
        update();
        document.querySelector("button[type='submit']").textContent = "Next";
      });
      btnWrap.prepend(btn);
      questionCount.textContent = `${currentStep + 1}/5`;
      currentStep++;

      break;
    case 4:
      if (document.querySelector(".oops-btn")) {
        document.querySelector(".oops-btn").remove();
      }
      document.querySelector("button[type='submit']").remove();
      update();
      break;
    default:
  }
}
//for the third step in the form we get the person's data which we have just submitted
async function fetchPersonData(id) {
  let step3 = ``;
  const personData = await asyncFunctions.getData(
    `http://18.193.250.181:1337/api/people?&filters[id]=${id}`
  );

  if (personData.error) {
    step3 = `Error ${personData.error.status}: ${personData.error.message}`;
  } else if (personData.data.length < 1) {
    step3 = `Empty array, no data found.`;
  } else {
    const person = personData.data[0].attributes;

    step3 = `<fieldset>
<p>Are these details correct?</p>
<span>Please make sure these details are correct:</span>
<table>
  <tr>
    <td>Name</td>
    <td>${person.first_name}</td>
  </tr>
  <tr>
    <td>Last Name</td>
    <td>${person.last_name}</td>
  </tr>
  <tr>
    <td>email</td>
    <td>${person.email}</td>
  </tr>
</table>
</fieldset>`;
  }
  formElemWrap.innerHTML = step3;
}
