import fetch from "node-fetch";
import FormData from "form-data";
import { find, flatMap, map } from "lodash";

exports.handler = async () => {
  const bookClass = async (cookie, hodina) => {
    const url =
      "https://www.varaaheti.fi/pole4fit/fi/api/public/bookings/class";
    if (hodina.user_bookings_count > 0) return;
    const request = {
      type: "class",
      location_id: hodina.location_id,
      view_id: 2,
      class_id: hodina.id,
      name: hodina.name,
      date: hodina.date,
      from: hodina.from,
      to: hodina.to,
      user_bookings_count: hodina.user_bookings_count,
    };

    await fetch(url, {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        cookie,
      },
      body: JSON.stringify(request),
      method: "POST",
      mode: "cors",
    });
    console.log("Booking successful", hodina.name);
  };

  const getClasses = async (cookie, location) => {
    const locations = {
      pasila: 1,
      kamppi: 2,
    };
    const date1 = Date.now() + 1000 * 60 * 60 * 24 * 13;
    const date = new Date(date1).toISOString().substr(0, 10);
    console.log(`fetching classes for date: ${date}`);
    const url = `https://www.varaaheti.fi/pole4fit/fi/api/public/locations/pole4fit_${location}/views/classes/classes/available?date=${date}&date_range=all`;
    const resp = await fetch(url, {
      headers: {
        cookie,
      },
      method: "GET",
      mode: "cors",
    });
    const classes = await resp.json();
    const arrClasses = flatMap(classes.data);
    return map(arrClasses, (item) => {
      return { ...item, location_id: locations[location] };
    });
  };

  const findClass = (className, classes, teacher) => {
    return find(classes, (item) => {
      const classMatch = includes(
        item.name.toLowerCase(),
        className.toLowerCase()
      );
      if (teacher)
        return classMatch && item.resources[0].name.includes(teacher);
      return classMatch;
    });
  };

  const login = async () => {
    const form = new FormData();
    form.append("email", "mirka.lison@gmail.com");
    form.append("password", "Pole4fit");
    const url = "https://www.varaaheti.fi/pole4fit/fi/api/public/auth";
    const resp = await fetch(url, {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: '{"email":"mirka.lison@gmail.com","password":"Pole4fit"}',
      method: "POST",
      mode: "cors",
    });
    return resp.headers.raw()["set-cookie"].join("; ");
  };

  const cookie = await login();

  const targets = [
    {
      className: "Poletech 3",
      place: "pasila",
    },
    {
      className: "Sensual Pole",
      place: "pasila",
    },
    {
      className: "Sensual Tricks",
      place: "pasila",
    },
  ];

  const promises = targets.map(async (target) => {
    const allClasses = await getClasses(cookie, target.place);
    const availableClass = findClass(
      target.className,
      allClasses,
      target.teacher
    );
    if (availableClass) {
      await bookClass(cookie, availableClass);
    }
  });

  await Promise.all(promises);
};
