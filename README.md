# pd_queuing
Pole dance class queuing automation. Check for free spots and subscribes to queued class
when spot becomes available. After successfull subscription, it sends and email with
booked class details.

## Technologies
NodeJs, Puppeteer, AWS EC2, AWS SES, jq

## Usage
```pdq_start``` to start queuing

```pdq_stop``` to stop queuing

## Setup
- Bash profile aliases for AWS cli commands that launches instace from template(```bash_profile_aliases_example.txt```)
- AWS EC2 launch template (```launch_template_example.json```)
- Launch template contains init script (```init_script_example.sh```)
- init script - sets up the server, installs AMI dependencies, node, clones the github repository
  and sets up a cron job that runs node app every 10 minutes.
- Node app (```main.js```) - logs in to booking system. Browses through all pages (each week class list).
  Check for queued class with a spot awailable. If none is found, app loggs out.
  If spot is available, it clicks the "book class button" and sends and email using AWS sdk with booked class info.
  After each "round", with subscription or not, user is logged out, so that there are no remaining open sessions.

- Terminating the instance (stop queuing) bash profile alias (also in ```bash_profile_aliases_example.txt```), runs bash
  script (```script.sh```), that first fetches running instance id and outputs it to
  jq that parses id from json file, then launches terminate instance command for given instance id.

## Testing
- Search for ```//Uncomment this for testing``` in ```main.js```.
- Uncomment the code.
- Find the class that can be subscribed to and get the class ID from DOM - for example from book class plus button:
```<a href="controller.php?action=bookclass&amp;date=0&amp;classid=26677&amp;div=" class="btn btn-xs btn-success pull-left pull-up" type="button" title="Book class">```
