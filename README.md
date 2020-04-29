# pd_queuing

Integration for [PoleNow](https://www.polenow.com) booking system

## Consists of two parts

1. Pole dance class queuing automation

Polenow notification email is forwarded to AWS Symple Email Service, which has lambda event trigger.
Node app in lambda checks the booking system calendar and subscribes to queued class. After successfull subscription, it sends and email with
booked class details.

2. Google calendar integration

After clicking book class "+" button, an event with class details (name of the class, time and date, location) is automatically created in Google calendar

## Technologies

- NodeJs
- Puppeteer
- AWS Lambda
- AWS SES
- Route 53
- Google calendar API
- Google Cloud Platform
- Serverless
- JQuery
