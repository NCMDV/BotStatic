let isModalOpen = false;
let modalElement = null;

let userMessageForBadResponse = "";
let aliciaMessageForBadResponse = "";

// function generateResponseBtn() {
//   return `<button class="thumbs-down-button" title="Bad Response" onClick="toggleModal(this)"><i class="fa-solid fa-thumbs-down"></i></button>`;
// }

function generateResponseBtn() {
  return `
  <button class="copy-button" title="Copy Response" onclick="copyResponse(this)">
      <i class="fa-solid fa-copy"></i>
  </button>
  <button class="thumbs-down-button" title="Bad Response" onClick="toggleModal(this)"><i class="fa-solid fa-thumbs-down"></i></button>`;
}

async function openModal() {
  try {
    var tempId = document.getElementById("temp-id").dataset.tempId;
    const response = await fetch(`${host_add}/chatbot/reasons_view/${tempId}/`);
    const data = await response.json();
    const reasons = data.reasons;
    
    let reasonsHTML = reasons.map((reason, index) => 
      `<label class="label-input"><input type="radio" name="reason" value="${reason}" onClick="handleRadio(this)"/>${reason}</label>`
    ).join('');
    
    reasonsHTML += `<label class="label-input"><input type="radio" name="reason" value="other" id="otherRadio" onClick="handleOther(this)"/>Other</label>`;
    
    const modalHTML = `
      <div id="responseModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <span class="close-button" onClick="closeModal()">&times;</span>
            <div class="modal-title">Tell us more</div>
          </div>
          <form class="modal-form" onsubmit="submitReason(event)">
            <div class="button-container">
                ${reasonsHTML}
            </div>
            <input class="input-container" type="text" id="otherReason" placeholder="Please specify" style="display:none;"/>
            <div class="submit-container">
                <button class="button-submit" type="submit" >Submit</button>
            </div>
          </form>
        </div>    
      </div>
      <div id="toast" class="toast">Reason submitted</div>
    `;
    
    const tempElement = document.createElement("div");
    tempElement.innerHTML = modalHTML;
    modalElement = tempElement.firstElementChild;
    
    document.body.appendChild(modalElement);
    isModalOpen = true;
  } catch (error) {
    console.error('Error fetching reasons:', error);
  }
}

function closeModal() {
  if (modalElement) {
    modalElement.remove();
    modalElement = null;
  }
  isModalOpen = false;
  resetForm();
}

function toggleModal(button) {
  // Get the current bot message (the message within the same 'received' div as the button)
  const botMessageDiv = button.closest('.received').querySelector('.chatbox-message-item-text');
  const botMessage = botMessageDiv.textContent.trim();
  aliciaMessageForBadResponse = botMessage;

  // // Get the previous user message (search for the closest preceding 'sent' div)
  // const previousUserMessageDiv = button.closest('.received').previousElementSibling.querySelector('.chatbox-message-item-text');
  // const userQuestion = previousUserMessageDiv.textContent.trim();

  // Safely get the previous user message or set to an empty string if not found
  const previousUserMessageDiv = button.closest('.received')?.previousElementSibling?.querySelector('.chatbox-message-item-text');
  const userQuestion = previousUserMessageDiv ? previousUserMessageDiv.textContent.trim() : '';
  userMessageForBadResponse = userQuestion;

  // Now pass these messages to your modal or do whatever logic you want
  console.log("User's previous message: ", userQuestion);
  console.log("Bot's current message: ", botMessage);

  if (isModalOpen) {
    closeModal();
  } else {
    openModal();
  }
}

function resetForm() {
  let otherReasonInput = document.getElementById("otherReason");
  let reasonInputs = document.getElementsByName('reason');
  if (reasonInputs) {
    for (var i = 0; i < reasonInputs.length; i++) {
      reasonInputs[i].checked = false;
    }
  }
  if (otherReasonInput) {
    otherReasonInput.value = "";
    otherReasonInput.style.display = "none";
  }
}

function handleOther(element) {
  let otherReasonInput = document.getElementById("otherReason");
  if (element.checked) {
    otherReasonInput.style.display = "block";
  } else {
    otherReasonInput.style.display = "none";
  }
}

function handleRadio(element) {
  let otherReasonInput = document.getElementById("otherReason");
  if (element.value !== "other") {
    otherReasonInput.style.display = "none";
  }
}

function submitReason(event) {
  event.preventDefault(); 

  let otherReasonInput = document.getElementById("otherReason");
  var selectedReason = document.querySelector('input[name="reason"]:checked').value;
  if (selectedReason === "other") {
    var otherReason = otherReasonInput.value;
    processRedFlag(otherReason);
  } else {
    processRedFlag(selectedReason);
  }

  // Close the modal after a short delay to allow the alert to be displayed
  setTimeout(closeModal, 200);
}

var red_flagResponse = 1;
function processRedFlag(reason) {
    // console.log('Reason', JSON.stringify({reason, red_flagResponse}));

    if (isValid(reason)) {
      var tempId = document.getElementById("temp-id").dataset.tempId;
      var chatbotId = document.getElementById("temp-id").dataset.id;
      fetch(`${host_add}/chatbot/bad_response_flag/${tempId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userMessageForBadResponse, aliciaMessageForBadResponse, reason, red_flagResponse, chatbotId }),
      })
        .then((response) => {
          if (response.ok) {
            return response.text();
          } else {
            throw new Error("Error processing reason selection");
          }
        })
        .then((data) => {
          isAutoResponseDisplayed = 0;
          scrollBottom();
          resetInactivityTimerWithFeedback(); // Reset the idle timer after receiving AI response
          showToast('Thank you for your Response!');
        })
        .catch((error) => {
          console.error("Error:", error);
          displayReceivedMessage(
            "Sorry for the inconvenience. I am encountering an error in generating a response. Let me try again or escalate this to my support team for further assistance"
          );
          scrollBottom();
        });
    }
}

function showToast(message) {
  // Create the toast container
  var toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  document.body.appendChild(toast);

  // Show the toast
  setTimeout(function () {
    toast.classList.add("show");
  }, 100); // Small delay to allow for the element to be added to the DOM

  // Hide the toast after 3 seconds
  setTimeout(function () {
    toast.classList.remove("show");
    toast.classList.add("hide");
    // Remove the toast element from the DOM after it fades out
    setTimeout(function () {
      document.body.removeChild(toast);
    }, 500);
  }, 3000);
}