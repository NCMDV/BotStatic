// MESSAGE INPUT
const textarea = document.querySelector(".chatbox-message-input");
const chatboxForm = document.querySelector(".chatbox-message-form");
let messageCounter = 0;
// const host_add = '2876-110-93-84-160.ngrok-free.app';
// const host_add = 'http://127.0.0.1:8000';
// const host_add = 'https://alicia-chat-dev-png.ap-southeast-1.elasticbeanstalk.com/';
const host_add = 'https://dxeelwpjx5cbg.cloudfront.net/';

const today = new Date();
let idleTimer;
const customerName = document.getElementById("temp-id").dataset.name;
let automaticResponse1;
// ====================================================================================
// Intent Data
let innerFlagData;
let intentData;
let indexData;
let ticketNumData;
let real_intent;

// ====================================================================================
// Options Data
let options;
let optionsHtmlString;

// ====================================================================================
textarea.addEventListener("input", function () {
  clearTimeout(idleTimer);
  const line = textarea.value.split("\n").length;
  textarea.rows = Math.min(line, 6);
  chatboxForm.style.alignItems = textarea.rows > 1 ? "flex-end" : "center";
});
// ====================================================================================
// Session Storage
sessionStorage.setItem('liveAgent', 'False');
sessionStorage.setItem('ticketCreated', 'False');
sessionStorage.setItem('ticketInfo','')
sessionStorage.setItem('userName','')
sessionStorage.setItem('renderedAgentComments','')
sessionStorage.setItem('agent','')
// ====================================================================================
textarea.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    var liveAgentBool = sessionStorage.getItem('liveAgent');
    var ticketCreatedBool = sessionStorage.getItem('ticketCreated');
    var userMessage = textarea.value.trim();
    console.log(userMessage);
    resetInactivityTimer();
    
    // Clear existing polling interval
    if (window.polling) {
      clearInterval(window.polling);
    }

    if (innerFlagData === true) {
      if (intentData === "CREATE_TICKET" || intentData === "create_ticket_flow") {
        processCreateTicketIntent(intentData);
      } else if (intentData === "COUNT_TICKET" || intentData === "count_ticket") {
        processTicketCountIntent(intentData);
      } else if (intentData === "TICKET_DETAILS" || intentData === "CHECK_TICKET_NUMBER") {
        processTicketdetailsInnerIntent(intentData);
      } else if (intentData === "REFUND_STATUS_ORDER_NO" ) {
        processRefundStatuswM(intentData);
      } else if (intentData === "ticketdetailsflow") {
        checkTicketDetails(intentData, ticketNumData);
      } else if (intentData === "TICKET_FOLLOWUP" || intentData === "follow-up-flow") {
        processTicketFollowupIntent(intentData);
      } else if (intentData === "RETURN_REFUND") {
        processReturnRefundWorkflow(intentData);
      } else if (intentData === "CANCELLATION") {
        processActualWorkflow(intentData);
      } else if (intentData === "CHANGE_ADDRESS") {
        processActualWorkflow(intentData);
      } else if (intentData === "PLACE_ORDER") {
        processActualWorkflow(intentData);
      } 
      
    } else if (liveAgentBool === 'True' && ticketCreatedBool !== 'True') {
      processTicketCreation(userMessage);
    } else if (liveAgentBool === 'True' && ticketCreatedBool === 'True') {
      processFetchingComments(userMessage);
    } else {
      submitForm();
    }
  }
});

chatboxForm.addEventListener("submit", function (e) {
  e.preventDefault();
  var liveAgentBool = sessionStorage.getItem('liveAgent');
  var ticketCreatedBool = sessionStorage.getItem('ticketCreated');
  var userMessage = textarea.value.trim();
  console.log(userMessage);
  resetInactivityTimer();

  // Clear existing polling interval if it exists
  if (window.polling) {
    clearInterval(window.polling);
  }

  if (innerFlagData === true) {
    if (intentData === "CREATE_TICKET" || intentData === "create_ticket_flow") {
      processCreateTicketIntent(intentData);
    } else if (intentData === "COUNT_TICKET" || intentData === "count_ticket") {
      processTicketCountIntent(intentData);
    } else if (intentData === "REFUND_STATUS_ORDER_NO" ) {
      processRefundStatuswM(intentData);
    } else if (intentData === "TICKET_DETAILS" || intentData === "CHECK_TICKET_NUMBER") {
      processTicketdetailsInnerIntent(intentData);
    } else if (intentData === "ticketdetailsflow") {
      checkTicketDetails(intentData, ticketNumData);
    } else if (intentData === "TICKET_FOLLOWUP" || intentData === "follow-up-flow") {
      processTicketFollowupIntent(intentData);
    } else if (intentData === "RETURN_REFUND") {
      processReturnRefundWorkflow(intentData);
    } else if (intentData === "CANCELLATION") {
      processActualWorkflow(intentData);
    } else if (intentData === "CHANGE_ADDRESS") {
      processActualWorkflow(intentData);
    } else if (intentData === "PRODUCTS") {
      displayProductsInCarousel(products);
      console.log("LOOK ARN");
    } else if (intentData === "PLACE_ORDER") {
      processActualWorkflow(intentData);
      console.log("dito ako jason");
    } 
  } else if (liveAgentBool === 'True' && ticketCreatedBool !== 'True') {
    // const messageTexts = Array.from(document.querySelectorAll('.chatbox-message-item.sent .chatbox-message-item-text')).map(el => el.textContent.trim());
    // console.log(messageTexts);
    processTicketCreation(userMessage);
  } else if (liveAgentBool === 'True' && ticketCreatedBool === 'True') {
    processFetchingComments(userMessage);
  } else {
    submitForm();
  }
});
// ====================================================================================
// Initial idle time pag wala pang conversation
function startIdleTimer() {
  idleTimer = setTimeout(() => {
    submitAutomaticResponse();
  }, 100); // 5 seconds
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  startIdleTimer();
}

// TOGGLE CHATBOX
const chatboxToggle = document.querySelector(".chatbox-toggle");
const closeChatboxLink = document.querySelector(".close-chatbox");
const chatboxProfile = document.querySelector(".chatbox-message-profile .chatbox-message-image");
const chatboxMessage = document.querySelector(".chatbox-message-wrapper");
let chatbotDisplay = 0;
let isAutoResponseDisplayed = 0;
// const csrfToken = document.querySelector(
//   "input[name=csrfmiddlewaretoken]"
// ).value;

function updateConvo() {
  var tempId = document.getElementById("temp-id").dataset.tempId;
  var chatbotId = document.getElementById("temp-id").dataset.id;

  fetch(`${host_add}/chatbot/chatbot_display/${tempId}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ chatbotDisplay, chatbotId,automaticResponse1}),
  });
  console.log(chatbotId);
  console.log("sent POST to chatbot_display?");
  // chatbotDisplay = 0;
}

// clear previous conversation history
// function clearConversation() {
//   const contentContainer = document.querySelector(".chatbox-message-content");
//   const buttonsIntent = document.querySelectorAll(".button-inner-intent");
//   const buttonsOptions = document.querySelectorAll(".button-options");
//   const messages = contentContainer.querySelectorAll(".chatbox-message-item:not(.chatbox-message-no-message)");
//   const buttonsFeedback = document.querySelectorAll(".chatbox-message-feedback");
  

//   messages.forEach(message => message.parentNode.removeChild(message));
//   buttonsIntent.forEach(message => message.parentNode.removeChild(message));
//   buttonsOptions.forEach(message => message.parentNode.removeChild(message));
//   buttonsFeedback.forEach(message => message.parentNode.removeChild(message));
//   enableChatBoxInput();
// }

chatboxToggle.addEventListener("click", async function () {
  console.log("Toggle button clicked");
  chatboxMessage.classList.toggle("show");
  const chatbox = document.getElementById("userMessage");
  const initialMessage = document.getElementById("chatbotInitialMessage").value;

  console.log(initialMessage);
  console.log(typeof(initialMessage));

  if (chatbotDisplay === 0) {
    // Chatbox was opened, so fetch a new temp_id
    try {
      const response = await fetch(`${host_add}/chatbot/generate_tempid/`, {
        // const response = await fetch(`${host_add}/chatbot/${tempId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: 'abc' })
      });

      const data = await response.json();

      if (data.temp_id) {
        tempId = data.temp_id; // Store the temp_id for use in chat messages
        console.log("Temp ID:", tempId);

        // Render temp_id and name to the HTML
        document.getElementById('temp-id').dataset.tempId = tempId; // Update the data attribute
        document.getElementById('temp-id').dataset.name = customerName; // update name attribute
        // automaticResponse1 = `Hello! I'm Alicia, your virtual assistant support for today. How can I help you?`;

        if (initialMessage==="None"){
          automaticResponse1 = `Hello! I'm your virtual assistant support for today. How can I help you?`
        } else {
          automaticResponse1 = initialMessage;
        };

      } else {
        console.error('No temp_id returned');
      }
    } catch (error) {
      console.error('Error:', error);
    }

    clearTextArea();
    // resetIdleTimer();
    clearTimeout(idleTimer);
    chatbox.focus();
    if (isAutoResponseDisplayed === 0) {
      startIdleTimer();
      chatbotDisplay = 1;
      isAutoResponseDisplayed = 1;
      updateConvo();
      disableRadioButtons(false);
      resetRadioButtons();
    }
  } else {
    // Chatbox is closed
    chatbotDisplay = 1;
    updateConvo();
    
  }
});

function toggleChatboxVisibility() {
  chatboxMessage.classList.toggle("show");
}

// Event listeners for profile image and close link
closeChatboxLink.addEventListener("click", (e) => {
  e.preventDefault();
  toggleChatboxVisibility();
});

chatboxProfile.addEventListener("click", toggleChatboxVisibility);
// ====================================================================================
// Send button show mic off
document.addEventListener("DOMContentLoaded", function (){
  const userMessage = document.getElementById("userMessage");
  const startMic = document.getElementById("startMic");
  const stopMic = document.getElementById("stopMic");
  const sendButton = document.getElementById("sendButton");
  // Function to toggle button visibility based on input content
  function toggleButtons() {
    if (userMessage.value.trim() !== "") {
      startMic.style.display = "none";
      stopMic.style.display = "none";
      sendButton.style.display = "block";
    } else {
      startMic.style.display = "block";
      stopMic.style.display = "none";
      sendButton.style.display = "none";
    }
  }

  // Event listeners for input focus and keyup
  userMessage.addEventListener("focus", toggleButtons);
  userMessage.addEventListener("input", toggleButtons);

  // Event listener for blur to reset to microphone button if input is empty
  userMessage.addEventListener("blur", function () {
    if (userMessage.value.trim() === "") {
      startMic.style.display = "block";
      stopMic.style.display = "none";
      sendButton.style.display = "none";
    }
  });

  // Event listener for the start microphone button
  startMic.addEventListener("click", function () {
    startMic.style.display = "none";
    stopMic.style.display = "block";
    sendButton.style.display = "none";
  });

  // Event listener for the stop microphone button
  stopMic.addEventListener("click", function () {
    stopMic.style.display = "none";
    if (userMessage.value.trim() === "") {
      startMic.style.display = "block";
    } else {
      sendButton.style.display = "block";
    }
  });
});
// ====================================================================================
// The auto adjust of the textarea upto 3 lines
var txtarea = document.getElementById("userMessage");
txtarea.oninput = function () {
  txtarea.style.height = "";
  txtarea.style.height = Math.min(txtarea.scrollHeight, 70) + "px";
  txtarea.scrollTop = txtarea.scrollHeight;
};
// ====================================================================================

// PROCESS FEEDBACK
const radioButtons = document.getElementsByName("rating");


function processFeedback() {
  const feedbackInputs = document.querySelector("input[name='rating']:checked").value;
  const tempId = document.getElementById("temp-id").dataset.tempId;
  console.log(feedbackInputs);
  console.log("Temp ID:", tempId);

  if (feedbackInputs) {
    // Highlight stars based on the selected rating
    // const stars = document.querySelectorAll('.star');
    
    // stars.forEach((star, index) => {
    //   star.style.color = index < feedbackInputs ? 'gold' : 'gray';
    // });


    fetch(`/chatbot/get_feedback/${tempId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ feedbackInputs }),
    })
    .then((response) => {
      if (response.ok) {
        displayReceivedMessage("Thank you for your feedback!");
        disableRadioButtons(true);
        setTimeout(() => {
          chatbotDisplay = 0; // End conversation
          updateConvo(); // Update conversation state
        }, 500);
      } else {
        throw new Error("No Model found here in my JS code");
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
}


function getRadios() {
  const feedbackWrapper = document.querySelector(".chatbox-message-content")
    .lastChild.childNodes;
  console.log("feedback wrapper");
  console.log(feedbackWrapper);
}

function disableRadioButtons(disabled = true) {
  for (i = 0; i < radioButtons.length; i++) {
    if ((radioButtons[i].type = "radio")) {
      radioButtons[i].disabled = disabled;
    }
  }
}

function resetRadioButtons() {
  for (i = 0; i < radioButtons.length; i++) {
    if ((radioButtons[i].type = "radio")) {
      radioButtons[i].checked = false;
    }
  }
}

// DROPDOWN TOGGLE (edited for metrics data)
const dropdownToggle = document.querySelector(
  ".chatbox-message-dropdown-toggle"
);

const dropdownMenu = document.querySelector(".chatbox-message-dropdown-menu");
dropdownToggle.addEventListener("click", function () {
  dropdownMenu.classList.toggle("show");
});

document.addEventListener("click", function (e) {
  if (
    !e.target.matches(".chatbox-message-dropdown, .chatbox-message-dropdown *")
  ) {
    dropdownMenu.classList.remove("show");
  }
});

// CHATBOX MESSAGE
// const csrfToken = document.querySelector('input[name=csrfmiddlewaretoken]').value;
const chatboxMessageWrapper = document.querySelector(
  ".chatbox-message-content"
);
const chatboxNoMessage = document.querySelector(".chatbox-message-no-message");

// Inactivity timer
let inactivityTimer;

// Flag to track if typing indicator is displayed
let isTypingIndicatorDisplayed = false;

function resetInactivityTimer() {
  if (isValid(textarea.value)) {
    clearTimeout(inactivityTimer);
    resetInactivityTimerWithFeedback();
  }
}
// ====================================================================================
// for Final Ai-Response
function submitForm() {
  if (isValid(textarea.value)) {
    const userMessage = textarea.value;
    var tempId = document.getElementById("temp-id").dataset.tempId;
    // var customerId = document.getElementById("temp-id").dataset.id;
    var chatbotId = document.getElementById("temp-id").dataset.id;
    console.log(chatbotId);
    var ticketCreatedBool = sessionStorage.getItem('ticketCreated');
    displaySentMessage(userMessage);
    displayTypingIndicator();
    textarea.value = "";
    textarea.rows = 1;
    textarea.focus();
    // chatboxNoMessage.style.display = "none";

    fetch(`${host_add}/chatbot/ai-response/${tempId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ message: userMessage, chatbotId, ticketCreatedBool})
    })
      .then((response) => {
        if (response.ok) {
          console.log("dito ako sa response.text()");
          return response.text();
        } else {
          throw new Error("No Model found here in my JS code");
        }
      })
      .then((data) => {
        console.log("Received data: ", data)
        isAutoResponseDisplayed = 0;
        hideTypingIndicator();
        displayReceivedMessage(data);
        scrollBottom();
        disableRadioButtons(false);
        resetRadioButtons();
        resetInactivityTimerWithFeedback(); // Reset the idle timer after receiving AI response
      })
      .catch((error) => {
        console.error("Error:", error);
        hideTypingIndicator();
        displayReceivedMessage(
          "Sorry for the inconvenience. I am encountering an error in generating a response. Let me try again or escalate this to my support team for further assistance"
        );
        scrollBottom();
      });
  }
}
// ====================================================================================


// Function to handle automatic response
function submitAutomaticResponse() {
  const name = document.getElementById("temp-id").dataset.name;
  // const automaticResponse1 = `Hello ${name}! I'm Alicia, your virtual assistant support for today. How can I help you?`;
  // const automaticResponse2 = `I will try to offer you instant support. If I don't know the answer, I will connect you with our Customer Service Agent.`; 


  // Display the first message immediately
  displayReceivedMessage(automaticResponse1);
  scrollBottom();

  // Add delay for the second message
  // setTimeout(() => {
  //   displayReceivedMessage(automaticResponse2);
  //   scrollBottom();
  // }, 1000); // 1-second delay for the second message
}


function displaySentMessage(message, isUsingMic = false, audioUrl = null, translatedMessage = "") {
  messageCounter++;
  const uniqueId = `message-${messageCounter}`;
  const currentTime = new Date(); // Get the current time

  let userMessageElement = "";

  if (!isUsingMic) {
    userMessageElement = `
          <div class="chatbox-message-item sent">
              <div class="chatbox-message-item-text">
                  ${message}
              </div>
              <span class="chatbox-message-item-time">Sent: ${addZero(
                currentTime.getHours()
              )}:${addZero(currentTime.getMinutes())}</span>
          </div>
      `;
  } else {
    userMessageElement = `
    <div class="chatbox-message-item sent">
      <div class="chatbox-message-item-text original" id="${uniqueId}-original">
        ${message}
      </div>
      ${
        translatedMessage
          ? `
        <div class="chatbox-message-item-text translated" id="${uniqueId}-translated">
           See translated message
        </div>
      `
          : ""
      }
      <div class="chatbox-message-footer">
      <i class="fas fa-volume-up original-audio playable-audio" id="${uniqueId}-audio" style="margin-left: 5px; cursor: pointer;"></i> 
      <span class="chatbox-message-item-time">Sent: ${addZero(
        currentTime.getHours()
      )}:${addZero(currentTime.getMinutes())}</span>
      </div>
    </div>
  `;
  }

  chatboxMessageWrapper.insertAdjacentHTML("beforeend", userMessageElement);
  scrollBottom();

  userResponse = message;

  if(isUsingMic) {
    const originalAudioElement = document.getElementById(`${uniqueId}-audio`);
    if (originalAudioElement) {
      let audio; // Declare a variable to hold the audio instance
      originalAudioElement.addEventListener("click", () => {
        // Change the color of the element when clicked
        originalAudioElement.style.color = "#007bff";

        // Check if there is already an audio instance playing
        if (audio) {
          // If it's playing, pause and reset the audio
          audio.pause();
          audio.currentTime = 0; // Reset to the beginning
          audio = null; // Clear the audio variable
          originalAudioElement.style.color = ""; // Reset color
        } else {
          // Create a new audio instance and play
          audio = new Audio(audioUrl);
          audio.play();

          // Set the onended event to reset the color
          audio.onended = () => {
            originalAudioElement.style.color = "";
            audio = null; // Clear the audio variable when ended
          };
        }
      });
    }
    // show translated message when user clicks on the see translated message
    const translatedMessageElement = document.getElementById(
      `${uniqueId}-translated`
    );

    if (translatedMessageElement) {
      // Add an event listener to the translated message element
      translatedMessageElement.addEventListener("click", () => {
        // Select the original message element
        const originalMessageElement = document.getElementById(
          `${uniqueId}-original`
        );
        // add class is-translated to the original message element
        originalMessageElement.classList.toggle("is-translated");
        if (originalMessageElement.classList.contains("is-translated")) {
          originalMessageElement.innerHTML = translatedMessage;
          translatedMessageElement.innerHTML = "hide";
        } else {
          originalMessageElement.classList.remove("is-translated");
          originalMessageElement.innerHTML = message;
          translatedMessageElement.innerHTML = "see translated...";
        }
      });
    }
  }
}

// ====================================================================================
// Displays AI Response
function displayReceivedMessage(message, isUsingMic = false, audio = null) {
  messageCounter++;
  const uniqueId = `ai-message-${messageCounter}`;
  const currentTime = new Date(); // Get the current time
  let aiMessage;
  let innerIntent;
  let intent;
  let index;
  let header;
  let choices;
  let category;
  let subcategory;
  let ticketNumber;
  let user_input;
  let products;
  let products_list;
  let main_reason;
  let optionsLocal;
  let optionsHtmlStringLocal;
  // console.log('Message: ', message);
  
  try {
    const jsonData = JSON.parse(message);
    aiMessage = jsonData.message;
    innerIntent = jsonData.innerIntent;
    intent = jsonData.intent;
    real_intent = jsonData.real_intent;
    index = jsonData.index;
    header = jsonData.header;
    choices = jsonData.choices;
    category = jsonData.category;
    subcategory = jsonData.subcategory;
    ticketNumber = jsonData.ticket_number;
    user_input = jsonData.user_input;
    products = jsonData.products;
    products_list = jsonData.products_list;
    orders = jsonData.orders;
    optionsLocal = jsonData.options;
    optionsHtmlStringLocal = jsonData.options_html_string;
    //main_reason = jsonData.main_reason;
  } catch (error) {
    aiMessage = message;
    innerIntent = false;
    intent = "";
    index = 0;
    header = "";
    choices = "";
    category = "";
    subcategory = "";
    ticketNumber ="";
    user_input ="";
    products = "" ;
    orders = "";
    products_list = "";
    //main_reason="";
    optionsLocal = false;
    optionsHtmlStringLocal = "";
  }

  aiMessage = aiMessage.replace(/<[^>]*>?/gm, "");

  // set global data
  innerFlagData = innerIntent;
  intentData = intent;
  indexData = index;
  ticketNumData = ticketNumber;
  options = optionsLocal;
  optionsHtmlString = optionsHtmlStringLocal;
  const aiMessageRegEx = /(https?:\/\/[^\s]+)/g;

  aiMessage = aiMessage
  // Convert '###' to <h4> tags
  .replace(/^###(.*)$/gm, function(match, headerText) {
      return `<h4>${headerText.trim()}</h4>`;
  })
  // Make links clickable
  .replace(aiMessageRegEx, function(url) {
      const punctuations = ['.', ',', ';', '?', '!', ')'];

      // Check if the URL ends with punctuation or parenthesis
      let lastChar = url.slice(-1);
      if (punctuations.includes(lastChar)) {
          // Remove the last character (if it's punctuation or closing parenthesis)
          url = url.slice(0, -1);
          lastChar = '';  // Set the lastChar to empty string for appending later
      }

      // Check if the URL ends with a closing parenthesis
      if (lastChar === ')') {
          // Remove the closing parenthesis if no opening parenthesis exists
          const openParenIndex = url.indexOf('(');
          if (openParenIndex === -1) {
              url = url.slice(0, -1); // Remove the closing parenthesis
          }
      }
      let cleanedUrl = url.replace(/[()]/g, ''); 
      // Return the URL wrapped in an anchor tag, without the trailing punctuation
      // console.log(cleanedUrl)
      return `<a href="${cleanedUrl}" target="_blank">${cleanedUrl}</a>`;
  })
  // Make text enclosed in exactly two asterisks (**text**) bold, ignoring longer series
  .replace(/(?<!\*)\*\*(\S(.*?\S)?)\*\*(?!\*)/g, function(match, boldText) {
      return `<strong>${boldText}</strong>`;
  });


  let aiResponseElement = "";

  if (!isUsingMic) {
    aiResponseElement = `
        <div class="chatbox-message-item received">
            <div class="bot">
                <div class="chatbox-message-item-text">
                    ${aiMessage.replace(/\n/g, "<br>")}
                </div>
                <span class="chatbox-message-item-time">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                ${
                  isAutoResponseDisplayed
                    ? ''
                    : generateResponseBtn()
                }
                Replied: ${addZero(
                  currentTime.getHours()
                )}:${addZero(currentTime.getMinutes())}</span>
            </div>
        </div>
      `;
  } else {
    aiResponseElement = `
        <div class="chatbox-message-item received">
            <div class="bot">
                <div class="chatbox-message-item-text">
                    ${aiMessage.replace(/\n/g, "<br>")}
                </div>
                <div class="chatbox-message-footer">
                <i class="fas fa-volume-up translated-audio playable-audio" style="margin-left: 5px; cursor: pointer;" id="${uniqueId}-ai-audio"></i>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                    <span class="chatbox-message-item-time">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                    ${
                      isAutoResponseDisplayed
                        ? ''
                        : generateResponseBtn()
                    }
                    Replied: ${addZero(currentTime.getHours())}:${addZero(
      currentTime.getMinutes()
    )}</span>
                </div>
            </div>
        </div>
      `;
  }

  chatboxMessageWrapper.insertAdjacentHTML("beforeend", aiResponseElement);
  scrollBottom();

  if (isUsingMic) {
    const audioMessageElement = document.getElementById(`${uniqueId}-ai-audio`);

    if (audioMessageElement) {
      let currentAudioElement = null; // Variable to hold the current audio element

      // Now you can use the audio variable safely here
      if (audio) {
        const playAudio = () => {
          audioMessageElement.style.color = "#007bff";
          // Assume this returns a Blob
          const audioSource = audio; // Replace this with your actual audio blob
          currentAudioElement = document.createElement("audio");
          currentAudioElement.src = URL.createObjectURL(audioSource); // Create a URL from the Blob
          currentAudioElement.play();

          // Set the onended event to reset the color and clear the audio element
          currentAudioElement.onended = () => {
            audioMessageElement.style.color = "";
            currentAudioElement = null; // Clear the current audio element variable when ended
          };
        };
        playAudio();
        audioMessageElement.addEventListener("click", () => {
          // Check if there's already an audio element playing
          if (currentAudioElement) {
            // If it's playing, pause and reset the audio
            currentAudioElement.pause();
            currentAudioElement.currentTime = 0; // Reset to the beginning
            currentAudioElement = null; // Clear the current audio element variable
            audioMessageElement.style.color = ""; // Reset color
          } else {
            // If there's no audio element playing, create a new one and play
            playAudio();
          }
        });
      }
    }
  }

  // When conditon meet then call the function that Shows the Information buttons
  if (innerIntent == false && intentData === "CREATE_TICKET") {
    console.log("entered: ", intent)
      showInnerButton(intent);
  }
  if (innerIntent == false && intentData === "TICKET_DETAILS") {
    //console.log(user_input);
    handleTixReq(intent,user_input);
  }

  if (innerIntent == false && intentData === "TICKET_FOLLOWUP") {
    handleTixReq(intent,user_input);
  }

  

  if (innerIntent == false && intentData === "TICKET_NUMBER") {
    showInnerButton(intent,user_input);
  }
  if (innerIntent == false && intentData === "REFUND_STATUS") {
    handleRefundStatus(intent,user_input);
  }

  if (innerIntent == false && intentData === "zendesk_live_agent"){
    showInnerButton(intent,user_input);
  }

  if (innerIntent == false && intentData === "END"){
    displayFeedbackMessage();
    scrollBottom();
  }

  if (innerIntent === true && intentData === "follow-up-flow"){
    processTicketFollowupIntent(intent, ticketNumber);
  }

  if (innerIntent === true && intentData === "ticketdetailsflow" && header == "email_confirmation"){
    showTicketDetailsOption(intent, header, ticketNumber);
  }


  if (innerIntent == false && intentData === "COUNT_TICKET") {
    
    handleCountTicketRequest(intent,user_input);
  }

  if (innerIntent === true && intentData === "CHANGE_ADDRESS" && header == "confirmation"){
    showConfirmation(intent, header);
  }

  

  if (innerIntent === true && intentData === "create_ticket_flow" && (indexData === 5 || indexData === 4)){
    showCreateTicketOption(intent, index);
  }

  if (innerIntent === true && intentData === "create_ticket_flow" && header == "category"){
    showCategory(header,choices,intentData);
  }
  if (innerIntent === true && intentData ==="CANCELLATION" && (header == "cancellation_reason" || header == "save_attempt" )){
    showCategoryCancellation(header,choices,intentData);
  }
  if (innerIntent === true && intentData === "create_ticket_flow" && header == "order_number"){
    showOpenOrders(header,orders,intentData);
  }
  if (innerIntent === true && intentData === "RETURN_REFUND" && (header == "return_reason" || header == "save_attempt")){
    showCategoryReturnRefund(header,choices,intentData);
  }

  if (innerIntent === true && intentData === "PLACE_ORDER" && (header == "products_list")){
    console.log("entered here 646: ", header)
    showCategoryPlaceOrder(header,products_list,intentData);
  }

  if (innerIntent === true && intentData === "create_ticket_flow" && header == "file"){
    showFileUpload(header,intentData);
  }

  if (innerIntent === true && intentData === "create_ticket_flow" && header == "upload"){
    showChooseFile(header,intentData);
  }

  if (innerIntent == false && intent === "RETURN_REFUND"){
    // show the choices "Request for cancellation" or "Get Information"
    console.log("entered: ", intent)
    showInnerButton(intent);
  }
  if (innerIntent == false && (intent === "CANCELLATION" || intent === "CHANGE_ADDRESS" || intent === "PLACE_ORDER")){
    // show the choices "Request for cancellation" or "Get Information"
    console.log("entered: ", intent)
    console.log("entered: ", user_input)
    // handleChangeAddCancelOrder(intent,user_input);
    showInnerButton(intent);
  }



  if (innerIntent === true && (intent === "CANCELLATION" || intent === "CHANGE_ADDRESS" || intent === "RETURN_REFUND" || intent === "PLACE_ORDER") && (indexData === 5 || indexData === 4)){
    showOption(intent, index);
  }
  if (innerIntent === true && (intent === "CANCELLATION" || intent === "CHANGE_ADDRESS" || intent === "RETURN_REFUND") && header == "order_name"){
    showOrders(header,orders,intent);
  }
  if (innerIntent === true &&  intent === "PLACE_ORDER" && header == "products_list"){
    console.log("entered here:", header)
    showProducts(header,products_list,intent);
  }
  if (innerIntent === true && intent === "CHANGE_ADDRESS" && header == "invalid_address"){
    console.log('im here line 537 script.js')
    processActualWorkflow(intent);
  }

  const chatbox = document.getElementById("userMessage");
  chatbox.focus();
}
// ====================================================================================

// ====================================================================================
// Call this Disabling and Enabling of Chatbox function once a button will prompt 
function disableChatboxInput() {
  const messageText = document.getElementById("userMessage");
  if (messageText && !messageText.disabled) {
    messageText.disabled = true;
  } 
}

function enableChatBoxInput(){
  const messageText = document.getElementById("userMessage");
  if (messageText && messageText.disabled) {
    messageText.disabled = false;
  } 
}
// ====================================================================================

// ====================================================================================
// function showButtons() {}
function showInnerButton(intent,user_input) {
  disableChatboxInput();
  let aiResponseElement = "";

  if (intent === "CREATE_TICKET") {
    aiResponseElement = `
        <div class="button-inner-intent" id="btnCont-inner" hidden>
            <div class="btn-req">
                <button id="createTicketReqBtn" onclick="handleCreateTicketRequest('Yes! I want to ${real_intent}', '${intent}')">Yes! I want to ${real_intent}</button>
            </div>
            <div class="btn-req">  
              <button id="createTicketReqBtn" onclick="handleCreateTicketRequest('EXIT')">EXIT</button>
            </div>
    </div> 
    `;
  } 
  else if (intent === 'zendesk_live_agent') {
    sessionStorage.setItem('liveAgent', 'True');
    hideInnerButtons();
  }
  else if (intent === "TICKET_NUMBER") {
    aiResponseElement = `
        <div class="button-inner-intent" id="btnCont-inner" hidden>
            <div class="btn-req">
                <button id="ticketFollowupBtn" onclick="handleTicketFollowupBtn('FOLLOW UP FOR ${user_input}', 'intent=TICKET_FOLLOWUP')">FOLLOW UP</button>
            </div>
            <div class="btn-req">  
              <button id="ticketDetailsBtn" onclick="handleTicketDetailsRequest('TICKET DETAILS OF ${user_input}', 'intent=TICKET_DETAILS')">TICKET DETAILS</button>
            </div>
    </div> 
    `;
  }
  else {
    console.log("showInnerButton intent: ", intent)
    

    if (options === true) {
      aiResponseElement = optionsHtmlString;
    } else {
      
      aiResponseElement = `
      <div class="button-inner-intent" id="btnCont-inner" hidden>
          <div class="btn-req">
              <button id="ReqBtn" onclick="handleWorkflowReq('Request for order ${intent.replace(/_/g, ' ').toLowerCase()}', '${intent}')">Request for order ${intent.replace(/_/g, ' ').toLowerCase()}</button>
          </div>
          <div class="btn-req">
              <button id="InfoBtn" onclick="handleWorkflowInfo('Review of ${intent.replace(/_/g, ' ').toLowerCase()} policy')">Review of ${intent.replace(/_/g, ' ').toLowerCase()} policy</button>
          </div>
      </div> 
  `;
    }
    
  }  
  chatboxMessageWrapper.insertAdjacentHTML("beforeend", aiResponseElement);
  scrollBottom();
}
// ====================================================================================

function hideInnerButtons() {
  enableChatBoxInput();
  const buttonContainer = document.getElementById("btnCont-inner");
  if (buttonContainer) {
    // buttonContainer.style.display = "none";
    buttonContainer.remove();
  }
}

// ====================================================================================
function clearTextArea() {
  const txtArea = document.getElementById("userMessage");
  txtArea.value = "";
}


// can be transfer into feedback.js file - chris
// function displayFeedbackMessage() {
//   const currentTime = new Date(); // Get the current time

//   const aiResponseElement = `
//       <div class="chatbox-message-feedback">
//           <div class="feedback-wrapper">
//               <label for="super-sad">
//                   <input type="radio" name="rating" id="super-sad" value="1" onclick="processFeedback()" />
//                   <span class="star">&#9733;</span> <!-- One star -->
//               </label>

//               <label for="sad">
//                   <input type="radio" name="rating" id="sad" value="2" onclick="processFeedback()" />
//                   <span class="star">&#9733;</span> <!-- One star -->
//               </label>

//               <label for="neutral">
//                   <input type="radio" name="rating" id="neutral" value="3" onclick="processFeedback()" />
//                   <span class="star">&#9733;</span> <!-- One star -->
//               </label>

//               <label for="happy">
//                   <input type="radio" name="rating" id="happy" value="4" onclick="processFeedback()" />
//                   <span class="star">&#9733;</span> <!-- One star -->
//               </label>

//               <label for="super-happy">
//                   <input type="radio" name="rating" id="super-happy" value="5" onclick="processFeedback()" />
//                   <span class="star">&#9733;</span> <!-- One star -->
//               </label>
//           </div>
//       </div>
//   `;

//   chatboxMessageWrapper.insertAdjacentHTML("beforeend", aiResponseElement);
//   scrollBottom();
// }

function displayFeedbackMessage() {
  // Static image URLs
  const blackStarUrl = '/static/images/black-Star.png';
  const coloredStarUrl = '/static/images/colored-Star.png';

  const aiResponseElement = `
      <div class="chatbox-message-feedback">
          <div class="feedback-wrapper" onmouseleave="resetStars()">
              ${[...Array(5)].map((_, i) => `
                  <label for="star${i+1}">
                      <input type="radio" name="rating" id="star${i+1}" value="${i+1}" onclick="setRating()" />
                      <img src="${blackStarUrl}" class="star star-${i+1}" onmouseover="highlightStars(${i+1})" onmouseout="resetStars()" />
                  </label>
              `).join('')}
          </div>
      </div>
  `;

  chatboxMessageWrapper.insertAdjacentHTML("beforeend", aiResponseElement);
  scrollBottom();
}

function highlightStars(rating) {
  const coloredStarUrl = '/static/images/colored-Star.png';  // Colored star image URL

  // Change the stars up to the hovered rating to colored stars
  for (let i = 1; i <= rating; i++) {
    document.querySelector(`.star-${i}`).src = coloredStarUrl;
  }
}

function resetStars() {
  const blackStarUrl = '/static/images/black-Star.png';  // Black star image URL

  // Reset all stars to black
  document.querySelectorAll('.star').forEach(star => star.src = blackStarUrl);

  // Reset to the checked state if a rating is selected
  const checkedRating = document.querySelector("input[name='rating']:checked");
  if (checkedRating) {
    setCheckedStars(checkedRating.value);
  }
}

function setRating() {
  // Get the selected rating from the clicked radio button
  const rating = document.querySelector("input[name='rating']:checked").value;
  const blackStarUrl = '/static/images/black-Star.png';  // Black star image URL
  const coloredStarUrl = '/static/images/colored-Star.png';  // Colored star image URL

  // Reset all stars to black first (initial state)
  document.querySelectorAll('.star').forEach(star => star.src = blackStarUrl);

  // Color the stars up to the selected rating
  setCheckedStars(rating);

  // Call processFeedback without the rating as a parameter
  processFeedback();
}

function setCheckedStars(rating) {
  const coloredStarUrl = '/static/images/colored-Star.png';  // Colored star image URL

  // Color the stars up to the selected rating
  for (let i = 1; i <= rating; i++) {
    document.querySelector(`.star-${i}`).src = coloredStarUrl;
  }
}

function displayTypingIndicator() {
  if (!isTypingIndicatorDisplayed) {
    isTypingIndicatorDisplayed = true;

    const typingIndicator = `
            <div class="chatbox-message-item received typing-indicator">
                <span class="chatbox-message-item-text typing-indicator-text">Typing...<span class="dots"></span></span>
            </div>
        `;

    chatboxMessageWrapper.insertAdjacentHTML("beforeend", typingIndicator);

    startTypingAnimation();

    // Disable inactivityTimer when typing indicator is displayed
    clearTimeout(inactivityTimer);
    scrollBottom();
  }
}

// Function to start the typing animation
function startTypingAnimation() {
  const dotsElement = document.querySelector(".typing-indicator-text .dots");

  if (dotsElement) {
    dotsElement.innerHTML = ".";

    setInterval(() => {
      dotsElement.innerHTML += ".";
      if (dotsElement.innerHTML.length > 5) {
        dotsElement.innerHTML = ".";
      }
    }, 1000);
  }
}

function hideTypingIndicator() {
  const typingIndicator = document.querySelector(
    ".chatbox-message-item.received.typing-indicator"
  );
  if (typingIndicator) {
    typingIndicator.remove();
    isTypingIndicatorDisplayed = false;

    // Reset inactivityTimer when typing indicator is removed
    resetInactivityTimerWithFeedback();
  }
}

function addZero(num) {
  return num < 10 ? "0" + num : num;
}

function scrollBottom() {
  chatboxMessageWrapper.scrollTo(0, chatboxMessageWrapper.scrollHeight);
}

function isValid(value) {
  let text = value.replace(/\n/g, "");
  text = text.replace(/\s/g, "");

  return text.length > 0;
}


// Function to handle feedback response
function submitFeedbackResponse() {
  const feedbackResponse =
    "We'd love to know your feedback. On a scale of 1 star to 5 stars, how satisfied are you with the assistance provided by our chatbot, Alicia?";
  // displayReceivedMessage(feedbackResponse);
  displayReceivedMessage(feedbackResponse)
  displayFeedbackMessage();
  // djangoIdleResponse(feedbackResponse);
  scrollBottom();
}


// Reset Idle time when there's an ongoing conversation
function resetInactivityTimerWithFeedback() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(function () {
    submitFeedbackResponse();
  }, 1000000000); // 60 seconds
}

function displayProductsInCarousel(products) {
  const carouselWrapper = document.getElementById('carousel-wrapper');
  if (!carouselWrapper) {
    console.error("Carousel wrapper not found");
    return;
  }

  let carouselInnerHTML = products.map(product => `
    <div class="carousel-item">
      <img src="${product.image_src}" alt="${product.name}">
      <div class="carousel-caption">
        <h5>${product.name}</h5>
        <p>Price: $${product.price}</p>
      </div>
    </div>
  `).join('');

  carouselWrapper.innerHTML = `
    <div id="carouselExample" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-inner">
        ${carouselInnerHTML}
      </div>
      <a class="carousel-control-prev" href="#carouselExample" role="button" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </a>
      <a class="carousel-control-next" href="#carouselExample" role="button" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </a>
    </div>
  `;
}

// Call resetInactivityTimer initially to start the timer
// resetInactivityTimer();



// ===========================================================
// For Download of Chat Transcript Button

document.querySelectorAll(".download-chat").forEach(function(button) {
  button.addEventListener("click", function() {
      console.log("Download button clicked!");
      var agent = sessionStorage.getItem('agent', '')
      var tempId = document.getElementById("temp-id").dataset.tempId;
      var chatbotId = document.getElementById("temp-id").dataset.id;
      var chatbotName = document.getElementById("temp-id").dataset.name;
      
      console.log("chatbot id: ", chatbotId);

      if (!agent) {
        agent = null;
      }

      fetch(`${host_add}/chatbot/download_chat_transcript/${tempId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agent, chatbotId, chatbotName}),
      })
      .then(response => {

          if (response.ok) {
              return response.json();
          } else {
              console.error("API response error:", response.statusText);
              throw new Error("Failed to fetch transcript");
          }
      })
      .then(data => {
          console.log("Response data:", data);  
          
          if (data.pdf_link) {
              window.open(data.pdf_link, '_blank');
          } else {
              console.error("Failed to generate transcript. No PDF link found.");
          }
      })
      .catch(error => {
          console.error("Error fetching transcript:", error);
      });
  });
});




// FOR COPY BUTTON
function copyResponse(buttonElement) {
  const messageElement = buttonElement.closest(".bot").querySelector(".chatbox-message-item-text");
  if (!messageElement) return;  //If No Message Found, Stop Execution

  // Copy only the bot's message (excluding the time)
  const textToCopy = messageElement.innerText;
  navigator.clipboard.writeText(textToCopy).then(() => {
    const copyIcon = buttonElement.querySelector("i");
    if (copyIcon) {
      copyIcon.classList.remove("fa-copy");
      copyIcon.classList.add("fa-check"); // Change icon to check
      copyIcon.style.color = "green"; // Optional: Change color

      setTimeout(() => {
        copyIcon.classList.remove("fa-check");
        copyIcon.classList.add("fa-copy");
        copyIcon.style.color = ""; // Reset color
      }, 2000);
    }
  }).catch(err => console.error("Copy failed:", err));
}


