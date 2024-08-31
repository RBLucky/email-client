document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#submit').addEventListener('click', send);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3><div id="emails-view-body"></div>`;

  // Show the mailbox content
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    emails.forEach(loneEmail => {

      //console.log(loneEmail);

      let emailTag = document.createElement('div');

      if (!loneEmail.read) {
        emailTag.innerHTML = `<div class="card"><div class="card-body"><strong>${loneEmail.sender}&emsp;&emsp;      </strong>${loneEmail.subject}<div style="text-align: right; font-size: 11px; color: grey;">${loneEmail.timestamp}</div></div></div><hr>`;
      } else {
        emailTag.innerHTML = `<div class="card" style="background-color: rgba(0, 0, 0, 0.1);"><div class="card-body"><strong>${loneEmail.sender}&emsp;&emsp;      </strong>${loneEmail.subject}<div style="text-align: right; font-size: 11px; color: grey;">${loneEmail.timestamp}</div></div></div><hr>`
      }

      emailTag.addEventListener('click', function () {
        console.log(`${loneEmail.id} has been clicked`);

        fetch(`/emails/${loneEmail.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })

        // Display email content
        fetch(`/emails/${loneEmail.id}`)
        .then(response => response.json())
        .then(content => {
          console.log("Content: ", content);

          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#email-content').style.display = 'block';


          let emailContent = document.createElement('div');
          emailContent.id = `content`;
          let details = document.createElement('div');
         
          if (document.getElementById(`content`) === null) {
            details.innerHTML = `
              <h3>${content.subject}</h3>
              <br>
              <p style="margin-bottom: 1px; font-size: 12px;">From:</p>
              <div>&emsp;<strong><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
              </svg> <span style="font-size: 14px;"> ${content.sender}</span></strong>
              </div>
              <p style="margin-bottom: 1px; font-size: 12px;">To:</p>
              <div>&emsp;<strong><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
              </svg> <span id="recipients" style="font-size: 14px;"> ${content.recipients[0]}</span></strong>
              </div>
              <div style="text-align: right; font-size: 11px; color: grey;">${content.timestamp}</div>
              <br>
              <br>
              <div>
                ${content.body}
              </div>
              <hr>
              `;


            emailContent.append(details);
            document.querySelector('#email-content').append(emailContent);

            // Add archive/unarchive and reply buttons
            let buttons = document.createElement('span');
            let archiveButton = document.createElement('button');
            archiveButton.className = "btn btn-sm btn-outline-secondary";
            archiveButton.id = "archive";
            archiveButton.style.marginLeft = "5px";
            
            let replyButton = document.createElement('button');
            replyButton.className = "btn btn-sm btn-outline-primary";
            replyButton.id = "reply";
            replyButton.innerHTML = "Reply";
            replyButton.style.marginRight = "5px";

            content.archived ? archiveButton.innerHTML = "Unarchive" : archiveButton.innerHTML = "Archive";

            buttons.append(replyButton, archiveButton);
            details.append(buttons);


          }

          // Reply button functionality
          document.querySelector('#reply').addEventListener('click', () => {
            compose_email();
            document.getElementById('compose-recipients').value = `${content.sender}`;

            let subject = content.subject;

            if (subject.split(' ', 1)[0] != 'Re:') {
              subject = `Re: ${content.subject}`;
            }
            
            document.getElementById('compose-subject').value = subject;
            document.getElementById('compose-body').value =
            `On ${content.timestamp} '${content.sender}' wrote:\n\n"${content.body}"\n\n`
          })

          // Archive/unarchive button functionality
          document.querySelector('#archive').addEventListener('click', () => {
            if (!content.archived) {
              fetch(`/emails/${content.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  archived: true
                })
              })
            } else if (content.archived) {
              fetch(`/emails/${content.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  archived: false
                })
              })
            }

            location.reload();
          })

        })
      });

      // Make email content appear when needed
      document.querySelector('#emails-view').append(emailTag);

    })
    
    // Remove email content when not Needed
    if (document.querySelector('#content') != null) {
      document.querySelector('#content').remove();
    }
  })
}

function send(event) {
  // Prevent auto-reload
  event.preventDefault();

  // Use user input to create an API
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_mailbox('sent');
  })
  
}