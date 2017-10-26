const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const zoomKey = require('./zCreds.json');
const gCreds = require('./gCreds.json');
const zoom = require('zoomus')({
  'key': zoomKey.key,
  'secret': zoomKey.secret
});

const app = express();
app.use(bodyParser.json());

/* Dashboard type 2 is past, 1 is live meetings. Changing date manually for now because it's more convenient when
grabbing meeting info as-needed, but ideally it will grab current date range from moment */
// moment().format('YYYY-MM-DD') will output today in a format zoom likes
let dashboard = {
  type: 2,
  from: moment().format('YYYY-MM-DD'),
  to: moment().format('YYYY-MM-DD'),
}

/* Placeholder/test CB. Want this to append name to Google Sheet */
const testCB = (username) => {

  return username + ' sent';
}

/* Accepts array of meeting IDs generated by getMeetings() */
const getDetail = (ids) => {
  console.log('Getting meeting participants...');
  /* Iterates over ids and updates dashboard for each one with id */
  ids.forEach((id, i) => {
    dashboard = {
      meeting_id: id,
      type: 2
    }
    zoom.dashboard.meeting(dashboard, (res) => {
      let thisGroup = [];
      if (res.error) console.log('error on getDetail');
      let meetingDetail = res.participants;
      if (meetingDetail !== undefined) {
        meetingDetail.forEach((person) => {
          thisGroup.push(testCB(person.user_name));
        })
      }
      /* logs list of participants from this group (zoom meeting) after passing through CB */
      console.log(thisGroup.sort());
    })
  })
}

/* Sends request with default dashboard defined above and gets all meetings of type in dashboard range */
const getMeetings = () => {
  console.log('getting meeting details...');
  zoom.dashboard.meetings(dashboard, (res) => {
    if (res.error) console.log('error');
    let ids = [];
    /* I might be able to send meetings one at a time to getDetail instead of creating an array */
    res.meetings.forEach((meeting) => ids.push(meeting.uuid));
    console.log('Getting details for '+ids.length+' meetings...');
    getDetail(ids);
  })
}

getMeetings();
