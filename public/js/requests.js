const requestsContainer = document.getElementById("requestsContainer");
const requestCount = document.getElementById("requestCount");
const requestsMessage = document.getElementById("requestsMessage");
const logoutButton = document.getElementById("logoutButton");
const requestCardTemplate = document.getElementById("requestCardTemplate");

// Keep track of requests that are currently being processed.
let processingRequests = new Set();

// Fetch all incoming connection requests from the backend.
function fetchRequests() {
  requestsMessage.textContent = "Loading requests...";
  requestsContainer.innerHTML = "";
  requestCount.textContent = "0";

  fetch("/user/requests/recieved")
    .then((response) => {
      // Convert the response to text first so we can handle
      // both JSON responses and unexpected plain-text errors.
      return response.text().then((text) => {
        let data;

        try {
          data = JSON.parse(text);
        } catch (error) {
          throw new Error(text || "The server returned an invalid response.");
        }

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch incoming requests.");
        }

        return data;
      });
    })
    .then((data) => {
      console.log("Incoming requests response:", data);

      // Support common API response structures.
      const requests = Array.isArray(data)
        ? data
        : Array.isArray(data.information)
          ? data.information
          : Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.requests)
              ? data.requests
              : [];

      requestsContainer.innerHTML = "";
      requestCount.textContent = requests.length;

      if (requests.length === 0) {
        requestsMessage.textContent =
          "You don't have any pending connection requests.";
        return;
      }

      requestsMessage.textContent = "";

      requests.forEach((request) => {
        const card = createRequestCard(request);
        requestsContainer.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error fetching requests:", error);
      requestsMessage.textContent =
        error.message || "Something went wrong while loading requests.";
    });
}

// Create one card for an incoming connection request.
function createRequestCard(request) {
  const card = requestCardTemplate.content.firstElementChild.cloneNode(true);

  /*
   * Some APIs return the sender directly.
   * Others return a request object containing the sender under a property
   * such as fromUserId or sender.
   *
   * These fallbacks handle common shapes. Check the console output above
   * if your backend uses a different structure.
   */
  const user =
    request.fromUserId && typeof request.fromUserId === "object"
      ? request.fromUserId
      : request.sender && typeof request.sender === "object"
        ? request.sender
        : request.user && typeof request.user === "object"
          ? request.user
          : request;

  // Populate the developer's name.
  const nameElement = card.querySelector(".developer-name");
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";

  nameElement.textContent =
    `${firstName} ${lastName}`.trim() || "Unknown developer";

  // Populate the developer's age.
  const ageElement = card.querySelector(".developer-age");

  ageElement.textContent =
    user.age !== undefined && user.age !== null ? `Age: ${user.age}` : "";

  // Populate the developer's about section.
  const aboutElement = card.querySelector(".developer-about");

  aboutElement.textContent =
    user.about || "This developer hasn't added a bio yet.";

  // Populate the developer's profile photo.
  const avatarElement = card.querySelector(".developer-avatar");

  avatarElement.src = user.photoUrl || "/images/default-avatar.png";

  avatarElement.alt = `${nameElement.textContent}'s profile photo`;

  // If the profile photo fails to load, use a fallback.
  avatarElement.onerror = function () {
    this.onerror = null;
    this.src = "/images/default-avatar.png";
  };

  // Populate the developer's skills.
  const skillsContainer = card.querySelector(".developer-skills");
  skillsContainer.innerHTML = "";

  if (Array.isArray(user.skills) && user.skills.length > 0) {
    user.skills.forEach((skill) => {
      const skillElement = document.createElement("span");

      // textContent prevents skill text from being treated as HTML.
      skillElement.textContent = skill;
      skillElement.classList.add("skill-tag");

      skillsContainer.appendChild(skillElement);
    });
  } else {
    skillsContainer.textContent = "No skills added yet.";
  }

  // Find the Accept and Reject buttons.
  const acceptButton = card.querySelector(".accept-button");
  const rejectButton = card.querySelector(".reject-button");

  /*
   * The review API needs the connection request's ID, not the sender's
   * user ID. Depending on your backend response, it may be called _id
   * or requestId.
   */
  const requestId = request._id || request.requestId;

  if (!requestId) {
    console.error(
      "Request ID is missing. Check the incoming requests response:",
      request,
    );

    acceptButton.disabled = true;
    rejectButton.disabled = true;
    return card;
  }

  // Accept this connection request.
  acceptButton.addEventListener("click", () => {
    reviewRequest("accepted", requestId, card, acceptButton, rejectButton);
  });

  // Reject this connection request.
  rejectButton.addEventListener("click", () => {
    reviewRequest("rejected", requestId, card, acceptButton, rejectButton);
  });

  return card;
}

// Accept or reject a request through the backend API.
function reviewRequest(status, requestId, card, acceptButton, rejectButton) {
  // Prevent accidental duplicate requests while one is processing.
  if (processingRequests.has(requestId)) {
    return;
  }

  processingRequests.add(requestId);

  // Temporarily disable both buttons while the request is processing.
  acceptButton.disabled = true;
  rejectButton.disabled = true;

  const originalAcceptText = acceptButton.textContent;
  const originalRejectText = rejectButton.textContent;

  if (status === "accepted") {
    acceptButton.textContent = "Accepting...";
  } else {
    rejectButton.textContent = "Rejecting...";
  }

  fetch(`/request/review/${status}/${requestId}`, {
    method: "POST",
  })
    .then((response) => {
      return response.text().then((text) => {
        let data = {};

        if (text) {
          try {
            data = JSON.parse(text);
          } catch (error) {
            // Keep the plain-text response if it isn't JSON.
            data = { message: text };
          }
        }

        if (!response.ok) {
          throw new Error(data.message || `Failed to ${status} the request.`);
        }

        return data;
      });
    })
    .then((data) => {
      console.log(`Request ${status}:`, data);

      // Remove the processed request from the page.
      card.remove();

      // Update the displayed number of pending requests.
      const remainingRequests = requestsContainer.children.length;
      requestCount.textContent = remainingRequests;

      // Show a message when no requests remain.
      if (remainingRequests === 0) {
        requestsMessage.textContent =
          "You don't have any pending connection requests.";
      } else {
        requestsMessage.textContent =
          status === "accepted"
            ? "Connection request accepted."
            : "Connection request rejected.";
      }
    })
    .catch((error) => {
      console.error(`Error trying to ${status} request:`, error);

      requestsMessage.textContent =
        error.message || `Could not ${status} this request.`;

      // Restore the buttons so the user can try again.
      acceptButton.disabled = false;
      rejectButton.disabled = false;

      acceptButton.textContent = originalAcceptText;
      rejectButton.textContent = originalRejectText;
    })
    .finally(() => {
      processingRequests.delete(requestId);
    });
}

// Log out the current user and return to the login page.
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    fetch("/logout", {
      method: "POST",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Logout failed.");
        }

        window.location.href = "/login.html";
      })
      .catch((error) => {
        console.error("Logout error:", error);
        alert("Could not log out. Please try again.");
      });
  });
}

// Load incoming requests when the page opens.
fetchRequests();
