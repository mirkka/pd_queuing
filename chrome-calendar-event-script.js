function initializeApi() {
  return gapi.client.load('calendar', 'v3').then(function () {
    console.log('Init api success');
  }).catch(function (err) {
    window.alert(`Init api was not successful: ${err}`);
  })
}

function authorization() {
  const CLIENT_ID = "<client-id>";
  const SCOPES = ["https://www.googleapis.com/auth/calendar"];
  return gapi.auth.authorize({
    client_id: CLIENT_ID,
    scope: SCOPES,
    immediate: false
  }).then(function (authResult) {
    console.log('Login success');
    initializeApi();
  }).catch(err => window.alert('Auth was not successful!'))
}

function formatTime(timeString, dateString) {
  const timeArr = timeString.split(' - ');
  const start = timeArr[0];
  const end = timeArr[1];
  const date = reverseDate(dateString);
  const timezoneOffset = Math.abs(new Date().getTimezoneOffset() / 60)
  const startFormatted = `${date}T${start}:00+0${timezoneOffset}:00`;
  const endFormatted = `${date}T${end}:00+0${timezoneOffset}:00`;
  return {
    start: startFormatted,
    end: endFormatted
  };
}

function reverseDate(dateString) {
  return dateString.trim().split('.').reverse().join('-');
}

function getClassDetailsForEvent(clickerElement) {
  const classDetails = clickerElement.parents('.hour-tag').find('.classbutton').html().split('<br>');
  const classDay = clickerElement.parents('.day-panel').find('.panel-heading a').html().split('<br>');
  const location = clickerElement.parents('.CALENDARCONTCAL').find('.col-md-12.top-buffer.text-align h4').text();
  const time = classDetails[0];
  const className = classDetails[1].replace(/<[/]?strong>/g, '');
  const date = classDay[1];
  return {
    start: formatTime(time, date).start,
    end: formatTime(time, date).end,
    summary: className,
    location
  };
}

function createEvent(element) {
  const {
    start,
    end,
    summary,
    location
  } = getClassDetailsForEvent(element);
  const event = {
    'summary': summary, //title
    'location': location,
    'start': {
      'dateTime': start,
      'timeZone': 'Europe/Helsinki'
    },
    'end': {
      'dateTime': end,
      'timeZone': 'Europe/Helsinki'
    },
    'reminders': {
      'useDefault': false,
      'overrides': [{
        'method': 'popup',
        'minutes': 30
      }]
    }
  };
  gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'resource': event
  }).then(function (err, res) {
    if (err) return console.log(`The API returned an error: ${err}`);
    console.log('event created');
  });
}

script = document.createElement('script');
script.type = 'text/javascript';
script.async = true;
script.defer = true;
script.onload = function () {
  setTimeout(function () {
    $(".glyphicon-plus").bind("click", function (e) {
      createEvent($(this));
    });
    $(".glyphicon-plus").bind("mousedown", function (e) {
      $("body").css({
        backgroundImage: 'none',
        backgroundColor: 'red'
      })
      authorization().then(() => {
        $("body").css({
          backgroundImage: 'none',
          backgroundColor: 'green'
        })
      })
    });
  }, 3000)
};
script.src = 'https://apis.google.com/js/client.js';
document.getElementsByTagName('head')[0].appendChild(script);

// For debugging
// window.onbeforeunload = function (event) {
//   return confirm("Confirm refresh");
// };
