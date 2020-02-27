# pd_queuing
Pole dance class queuing automation.
Notification email is forwarded to AWS Symple Email Service, which has lambda event trigger.
Node app in lambda checks for free spots and subscribes to queued class. After successfull subscription, it sends and email with
booked class details.

## Technologies
NodeJs, Puppeteer, AWS Lambda, AWS SES, Route 53
