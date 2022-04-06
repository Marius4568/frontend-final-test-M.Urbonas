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
      console.log(JSON.stringify(dataObject));
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
