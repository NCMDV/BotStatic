(async function () {
  // const staticBaseUrl =
  //   "https://alicia-chat-dev-png.ap-southeast-1.elasticbeanstalk.com/static/";
  const staticBaseUrl =
  "https://dxeelwpjx5cbg.cloudfront.net/static/";


  const currentScript = document.currentScript;

  const chatbotId = currentScript.getAttribute("data-chatbot-id") || "";
  const chatbotName = currentScript.getAttribute("data-chatbot-name") || "";
  const initialMessage =
    currentScript.getAttribute("data-initial-message") || "";
  const chatboxHeaderColor =
    currentScript.getAttribute("data-header-color") || "";
  const text_placeholder =
    currentScript.getAttribute("data-text-placeholder") || "";
  const icon = currentScript.getAttribute("data-icon") || "";
  const textColor = adjustTextColorBasedOnBackground(chatboxHeaderColor);

  const config = {
    styles: [
      staticBaseUrl + "css/style2.css",
      staticBaseUrl + "css/coe.css",
      staticBaseUrl + "css/small_viewport.css",
      staticBaseUrl + "css/voice-command.css",
      staticBaseUrl + 'css/badResponse.css',
      "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css",
    ],
    scripts: [
      // staticBaseUrl + 'js/ticket_create.js',
      // staticBaseUrl + 'js/ticket_followup.js',
      // staticBaseUrl + 'js/ticket_details.js',
      // staticBaseUrl + 'js/refund_cancel_changeAdd.js',
      // staticBaseUrl + 'js/QandA.js',
      staticBaseUrl + "js/script.js",
      // staticBaseUrl + 'js/zendesk.js',
      // staticBaseUrl + 'js/voice-command.js',
      // staticBaseUrl + 'js/sockjs.js',
      staticBaseUrl + 'js/bad_response.js'
    ],
    images: [
      staticBaseUrl + "images/ai.png",
      // staticBaseUrl + 'images/voice-command.png',
      // staticBaseUrl + 'images/bad-response.png',
      // staticBaseUrl + 'images/close-button.png',
    ],
  };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadStylesheet(src) {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = src;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    });
  }

  async function init() {
    let container = `
        <div class="chatbox-wrapper" title="Chat with ${chatbotName}">
          <div class="chatbox-toggle">
            <input type="hidden" name="chatbotId" id="chatbotId" value="${chatbotId}">
            <input type="hidden" name="chatbotInitialMessage" id="chatbotInitialMessage" value="${initialMessage}">
            <img src="${
              staticBaseUrl + "images/ai.png"
            }" alt="Chatbot Icon" class="chatbox-message-image"/>
          </div>
          <div class="chatbox-message-wrapper">
            <div class="chatbox-message-header">
              <div class="chatbox-message-profile">
                <img src="${
                  staticBaseUrl + "images/ai.png"
                }"  alt="" class="chatbox-message-image" />
              </div>
              <div>
                <h4 class="chatbox-message-name">Chat with ${chatbotName}</h4>
                <div class="chatbox-message-status">
                  <div class="status-indicator online"></div>
                  <p>Online</p>
                </div>
              </div>
              <div class="chatbox-message-dropdown">
                <i class="bx bx-dots-vertical-rounded chatbox-message-dropdown-toggle"></i>
                <ul class="chatbox-message-dropdown-menu">
                  <li>
                    <a href="#" class="close-chatbox">Close</a>
                  </li>
                </ul>
              </div>
            </div>
            <div class="chatbox-message-content">
              <div id="carousel-wrapper" class="carousel-wrapper"></div>
            </div>
            <div class="chatbox-message-bottom" id="temp-id" data-temp-id="" data-id="${chatbotId}" data-name="${chatbotName}">
              <form id="chatForm" method="post" class="chatbox-message-form" enctype="multipart/form-data">
                <div class="cont-chatbox-download">
                  <button type="button" class="download-chat" title="Download Chat Log" data-temp-id="" data-id="${chatbotId}" data-name="${chatbotName}">
                    <i class="bx bx-download"></i>
                  </button>
                </div>
                <div class="cont-chatbox-input">
                  <textarea id="userMessage" name="userMessage" rows="1" placeholder="Type message..." class="chatbox-message-input"></textarea>
                </div>
                <div class="cont-chatbox-submit">
                  <button type="submit" id="sendButton" class="chatbox-message-submit">
                    <i class="bx bx-send"></i>
                  </button>
                </div>
              </form>
              <div class="chatbox-ai-disclaimer">
                <p class="disclaimer">
                  AI-generated content may contain inaccuracies and outdated
                  information. For further assistance, please send an email to
                  support@companyxyz.com.
                </p>
              </div>
            </div>
          </div>
        </div>`;

    const div = document.createElement("div");
    div.innerHTML = container;
    document.body.appendChild(div);

    await Promise.all(config.styles.map(loadStylesheet));
    await Promise.all(config.scripts.map(loadScript));
    await Promise.all(config.images.map(loadImage));



    const header = document.querySelector(".chatbox-message-header");
    header.style.background = chatboxHeaderColor;
    header.style.color = textColor;


    // Function to update hover styles dynamically
    function updateDropdownHoverStyles() {
      const textColor = adjustTextColorBasedOnBackground(chatboxHeaderColor);
      document.documentElement.style.setProperty('--dynamic-hover-bg', chatboxHeaderColor);
      document.documentElement.style.setProperty('--dynamic-hover-text', textColor);
    }

    // Call the function initially
    updateDropdownHoverStyles();

    const textPlaceholder = document.getElementById("userMessage");
    textPlaceholder.ariaPlaceholder = `${text_placeholder}`;


    try {
      // Fetch avatar image
      const response = await fetch(
        `https://dxeelwpjx5cbg.cloudfront.net/chatbot/get-avatar/?image_key=${icon}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.signed_url) {
        throw new Error("No signed URL found in response");
      }

      console.log("Response:", response);
      console.log("Signed URL:", data.signed_url);

      // Update the avatar image
      const allImages = document.querySelectorAll(".chatbox-message-image");
      allImages.forEach((img) => {
        img.src = data.signed_url;
      });
    } catch (error) {
      console.error("Failed to fetch and update avatar:", error);
    }


  }
  await init().catch((error) => console.log(error));

  const observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        const sentMessages = document.querySelectorAll('.chatbox-message-item.sent');
        sentMessages.forEach(message => {
          message.style.backgroundColor = chatboxHeaderColor;
          message.style.color=textColor;
        });
      }
    }
  });
  
  // Set observer options: look for added nodes
  observer.observe(document.querySelector('.chatbox-message-wrapper'), {
    childList: true,
    subtree: true
  });
  

  // TO MAKE THE FONT COLOR DYNAMIC
  // Function to calculate brightness
  function getColorBrightness(hex) {
    hex = hex.replace('#', '');  // Remove hash if it exists
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Apply the luminosity formula
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return brightness;
  }

  // Function to adjust text color based on background color
  function adjustTextColorBasedOnBackground(hex) {
    const brightness = getColorBrightness(hex);

    // If the background is dark (brightness < 128), set text color to white
    return brightness < 128 ? 'white' : 'black';
  }


})();
