export const localStorageFunctions = {
  removeLocalStorageCheckboxes() {
    if (localStorage.getItem("activitiesAfterWork")) {
      localStorage.removeItem("activitiesAfterWork");
    }
  },

  setLocalStorageCheckboxes() {
    const activityIds = Array.from(
      document.querySelectorAll("input[type='checkbox']:checked")
    ).map((el) => el.dataset.id);
    localStorage.setItem("activitiesAfterWork", JSON.stringify(activityIds));
  },

  getLocalStorageCheckboxes() {
    if (localStorage.getItem("activitiesAfterWork")) {
      return JSON.parse(localStorage.getItem("activitiesAfterWork"));
    }
  },
};
