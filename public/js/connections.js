/*
    DevRadar - Connections Page

    What this file does:
    1. Fetches the logged-in user's connections from the backend.
    2. Displays each connection as a developer card.
    3. Shows a message when there are no connections.
    4. Displays the total number of connections.
    5. Handles logout.
*/

// --------------------------------------------------
// 1. Get the HTML elements we need
// --------------------------------------------------

const connectionsContainer = document.getElementById("connectionsContainer");
const connectionCount = document.getElementById("connectionCount");
const connectionsMessage = document.getElementById("connectionsMessage");
const logoutButton = document.getElementById("logoutButton");

// This template is defined in connections.html.
// We clone it whenever we need to display a connection.
const connectionCardTemplate = document.getElementById(
  "connectionCardTemplate",
);

// --------------------------------------------------
// 2. Create a card for one connected developer
// --------------------------------------------------

function createConnectionCard(user) {
  // Make sure we received a valid user object.
  if (!user || typeof user !== "object") {
    return null;
  }

  // Clone the HTML template without changing the original.
  const card = connectionCardTemplate.content.firstElementChild.cloneNode(true);

  // Find the elements inside this particular card.
  const avatar = card.querySelector(".developer-avatar");
  const name = card.querySelector(".developer-name");
  const age = card.querySelector(".developer-age");
  const about = card.querySelector(".developer-about");
  const skillsContainer = card.querySelector(".developer-skills");

  // Display the developer's name.
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";

  name.textContent = `${firstName} ${lastName}`.trim() || "Unknown Developer";

  // Display age only when it is available.
  age.textContent = user.age ? `${user.age} years old` : "";

  // Display the developer's introduction.
  about.textContent = user.about || "This developer hasn't added a bio yet.";

  // Display the profile photo, with a fallback image.
  avatar.src = user.photoUrl || "https://placehold.co/100x100?text=User";
  avatar.alt = `${name.textContent}'s profile photo`;

  // If the supplied photo URL fails, use the fallback image.
  avatar.onerror = function () {
    this.onerror = null;
    this.src = "https://placehold.co/100x100?text=User";
  };

  // Display the developer's skills as individual tags.
  skillsContainer.innerHTML = "";

  if (Array.isArray(user.skills) && user.skills.length > 0) {
    user.skills.forEach(function (skill) {
      // Ignore invalid skill values.
      if (typeof skill !== "string" || !skill.trim()) {
        return;
      }

      const skillTag = document.createElement("span");

      skillTag.classList.add("skill-tag");
      skillTag.textContent = skill;

      skillsContainer.appendChild(skillTag);
    });
  } else {
    // Show a fallback when no skills have been added.
    const noSkills = document.createElement("span");

    noSkills.classList.add("skill-tag");
    noSkills.textContent = "No skills listed";

    skillsContainer.appendChild(noSkills);
  }

  return card;
}

// --------------------------------------------------
// 3. Fetch connections from the backend
// --------------------------------------------------

function fetchConnections() {
  // Show a loading message while the request is in progress.
  connectionsMessage.textContent = "Loading your connections...";
  connectionsContainer.innerHTML = "";

  // Reset the count while loading.
  connectionCount.textContent = "0";

  fetch("/user/connections")
    .then(function (response) {
      // Read the response as text first so we can handle
      // both JSON responses and unexpected server messages.
      return response.text().then(function (responseText) {
        if (!response.ok) {
          throw new Error(responseText || "Failed to load connections.");
        }

        // Convert the response text into a JavaScript object.
        try {
          return JSON.parse(responseText);
        } catch (error) {
          throw new Error("The server returned an invalid response.");
        }
      });
    })
    .then(function (data) {
      console.log("Connections response:", data);

      /*
                Your backend's response previously looked like this:

                {
                    message: "These are all your connections",
                    information: []
                }

                Therefore, we read the connections from information.
            */

      const connections = data.information;

      // Make sure the backend returned an array.
      if (!Array.isArray(connections)) {
        throw new Error("The connections response does not contain an array.");
      }

      // Update the total connections count.
      connectionCount.textContent = connections.length;

      // Remove any cards from a previous fetch.
      connectionsContainer.innerHTML = "";

      // Handle the case where the user has no connections.
      if (connections.length === 0) {
        connectionsMessage.textContent =
          "No connections yet. Visit Discover to meet developers!";

        return;
      }

      // Hide the loading message when connections are available.
      connectionsMessage.textContent = "";

      // Create and display a card for every connection.
      connections.forEach(function (user) {
        const connectionCard = createConnectionCard(user);

        // Only add a card if a valid one was created.
        if (connectionCard) {
          connectionsContainer.appendChild(connectionCard);
        }
      });

      // If the response contained no valid user objects,
      // display a helpful message.
      if (connectionsContainer.children.length === 0) {
        connectionCount.textContent = "0";
        connectionsMessage.textContent = "No connection details are available.";
      }
    })
    .catch(function (error) {
      // Log the technical details for debugging.
      console.error("Error fetching connections:", error);

      // Show a user-friendly message on the page.
      connectionsMessage.textContent =
        "Unable to load your connections. Please try again.";

      connectionCount.textContent = "0";
    });
}

// --------------------------------------------------
// 4. Handle logout
// --------------------------------------------------

logoutButton.addEventListener("click", function () {
  // Prevent accidental repeated clicks while logging out.
  logoutButton.disabled = true;
  logoutButton.textContent = "Logging out...";

  fetch("/logout", {
    method: "POST",
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      // Redirect to the login page after successful logout.
      window.location.href = "/login.html";
    })
    .catch(function (error) {
      console.error("Logout error:", error);

      // Allow the user to try again if logout fails.
      logoutButton.disabled = false;
      logoutButton.textContent = "Logout";

      alert("Unable to log out. Please try again.");
    });
});

// --------------------------------------------------
// 5. Load connections when the page opens
// --------------------------------------------------

fetchConnections();
