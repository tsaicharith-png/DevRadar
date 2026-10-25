// DevRadar Discover: fetch, search, filter, paginate, and send connection actions.

const feedContainer = document.getElementById("feedContainer");
const feedMessage = document.getElementById("feedMessage");
const feedCount = document.getElementById("feedCount");
const feedResultsLabel = document.getElementById("feedResultsLabel");
const loadMoreButton = document.getElementById("loadMoreButton");
const logoutButton = document.getElementById("logoutButton");
const feedSearch = document.getElementById("feedSearch");
const skillFilter = document.getElementById("skillFilter");
const clearFiltersButton = document.getElementById("clearFiltersButton");
const developerCardTemplate = document.getElementById("developerCardTemplate");

let currentPage = 1;
const pageSize = 10;
let isLoading = false;
let hasMore = true;
let loadedDevelopers = [];

function setFeedMessage(message, isError = false) {
  feedMessage.textContent = message || "";
  feedMessage.classList.toggle("message-error", Boolean(isError));
}

function getDeveloperName(user) {
  return (
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "Unnamed Developer"
  );
}

function makeEmptyState(title, description, glyph = "⌕") {
  const empty = document.createElement("div");
  empty.className = "empty-state";

  const icon = document.createElement("div");
  icon.className = "empty-state-icon";
  icon.textContent = glyph;

  const heading = document.createElement("h3");
  heading.textContent = title;

  const body = document.createElement("p");
  body.textContent = description;

  empty.append(icon, heading, body);
  return empty;
}

function refreshSkillOptions() {
  if (!skillFilter) return;

  const selectedValue = skillFilter.value;
  const allSkills = new Set();

  loadedDevelopers.forEach((user) => {
    if (Array.isArray(user.skills)) {
      user.skills.forEach((skill) => {
        if (typeof skill === "string" && skill.trim()) {
          allSkills.add(skill.trim());
        }
      });
    }
  });

  const sortedSkills = [...allSkills].sort((a, b) => a.localeCompare(b));
  skillFilter.replaceChildren();

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "All skills";
  skillFilter.appendChild(defaultOption);

  sortedSkills.forEach((skill) => {
    const option = document.createElement("option");
    option.value = skill.toLowerCase();
    option.textContent = skill;
    skillFilter.appendChild(option);
  });

  if (
    [...skillFilter.options].some((option) => option.value === selectedValue)
  ) {
    skillFilter.value = selectedValue;
  }
}

function getVisibleDevelopers() {
  const query = (feedSearch?.value || "").trim().toLowerCase();
  const selectedSkill = (skillFilter?.value || "").trim().toLowerCase();

  return loadedDevelopers.filter((user) => {
    const name = getDeveloperName(user).toLowerCase();
    const about = (user.about || "").toLowerCase();
    const skills = Array.isArray(user.skills) ? user.skills : [];
    const searchableSkills = skills.join(" ").toLowerCase();

    const matchesQuery =
      !query ||
      name.includes(query) ||
      about.includes(query) ||
      searchableSkills.includes(query);

    const matchesSkill =
      !selectedSkill ||
      skills.some(
        (skill) =>
          typeof skill === "string" &&
          skill.trim().toLowerCase() === selectedSkill,
      );

    return matchesQuery && matchesSkill;
  });
}

function createDeveloperCard(user) {
  const card = developerCardTemplate.content.firstElementChild.cloneNode(true);

  card.querySelector(".developer-name").textContent = getDeveloperName(user);
  card.querySelector(".developer-about").textContent =
    user.about || "This developer hasn't added a bio yet.";

  const ageElement = card.querySelector(".developer-age");
  if (user.age !== undefined && user.age !== null && user.age !== "") {
    ageElement.textContent = `${user.age} years old`;
  } else {
    ageElement.remove();
  }

  const avatar = card.querySelector(".developer-avatar");
  avatar.src =
    user.photoUrl || "https://placehold.co/100x100/18181b/fafafa?text=DR";
  avatar.alt = `Profile photo of ${user.firstName || "developer"}`;
  avatar.onerror = function () {
    this.onerror = null;
    this.src = "https://placehold.co/100x100/18181b/fafafa?text=DR";
  };

  const skillsContainer = card.querySelector(".developer-skills");
  skillsContainer.replaceChildren();

  if (Array.isArray(user.skills) && user.skills.length > 0) {
    user.skills.forEach((skill) => {
      if (typeof skill !== "string" || !skill.trim()) return;
      const tag = document.createElement("span");
      tag.className = "skill-tag";
      tag.textContent = skill;
      skillsContainer.appendChild(tag);
    });
  } else {
    const tag = document.createElement("span");
    tag.className = "skill-tag";
    tag.textContent = "Skills not listed";
    skillsContainer.appendChild(tag);
  }

  const connectButton = card.querySelector(".connect-button");
  const ignoreButton = card.querySelector(".ignore-button");

  async function handleRequest(status, button) {
    if (!user._id) {
      setFeedMessage(
        "This profile doesn't include a user ID, so the request could not be sent.",
        true,
      );
      return;
    }

    connectButton.disabled = true;
    ignoreButton.disabled = true;
    const originalButtonText = button.innerHTML;
    button.textContent = status === "interested" ? "Sending..." : "Ignoring...";
    setFeedMessage("");

    try {
      const response = await fetch(`/request/send/${status}/${user._id}`, {
        method: "POST",
      });
      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || "Request failed. Please try again.");
      }

      loadedDevelopers = loadedDevelopers.filter(
        (developer) => developer._id !== user._id,
      );
      refreshSkillOptions();
      renderDevelopers();

      setFeedMessage(
        status === "interested"
          ? `Connection request sent to ${getDeveloperName(user)}.`
          : `${getDeveloperName(user)} was removed from this feed.`,
      );
    } catch (error) {
      console.error("Connection request error:", error);
      setFeedMessage(
        error.message || "Something went wrong. Please try again.",
        true,
      );
      connectButton.disabled = false;
      ignoreButton.disabled = false;
      button.innerHTML = originalButtonText;
    }
  }

  connectButton.addEventListener("click", () =>
    handleRequest("interested", connectButton),
  );
  ignoreButton.addEventListener("click", () =>
    handleRequest("ignored", ignoreButton),
  );

  return card;
}

function renderDevelopers() {
  if (!feedContainer) return;

  feedContainer.replaceChildren();
  const visibleDevelopers = getVisibleDevelopers();

  if (feedCount) {
    feedCount.textContent = `${visibleDevelopers.length} shown`;
  }
  if (feedResultsLabel) {
    feedResultsLabel.textContent =
      feedSearch?.value.trim() || skillFilter?.value
        ? "Filtered community members"
        : "Community members";
  }

  if (visibleDevelopers.length === 0) {
    const hasFilters = Boolean(feedSearch?.value.trim() || skillFilter?.value);
    feedContainer.appendChild(
      makeEmptyState(
        hasFilters ? "No matching developers" : "No developers to show yet",
        hasFilters
          ? "Try a different search term or clear the filters to see more people."
          : "There are no more profiles available in this batch. Check back as the community grows.",
        hasFilters ? "⌕" : "⌁",
      ),
    );
    return;
  }

  visibleDevelopers.forEach((user) => {
    feedContainer.appendChild(createDeveloperCard(user));
  });
}

async function fetchDevelopers({ append = false } = {}) {
  if (isLoading || !hasMore) return;

  isLoading = true;
  if (loadMoreButton) {
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Loading developers...";
  }
  if (!append) {
    setFeedMessage("Loading developers...");
  } else {
    setFeedMessage("");
  }

  try {
    const response = await fetch(`/feed?page=${currentPage}&limit=${pageSize}`);
    const responseText = await response.text();
    let data;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error(
        responseText || "The server returned an invalid response.",
      );
    }

    if (!response.ok) {
      throw new Error(data.message || "Unable to load developers.");
    }

    const developers = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.information)
        ? data.information
        : [];

    const existingIds = new Set(
      loadedDevelopers.map((user) => user._id).filter(Boolean),
    );
    const newDevelopers = developers.filter(
      (user) => !user._id || !existingIds.has(user._id),
    );

    if (!append) {
      loadedDevelopers = newDevelopers;
    } else {
      loadedDevelopers = loadedDevelopers.concat(newDevelopers);
    }

    hasMore = developers.length >= pageSize;
    refreshSkillOptions();
    renderDevelopers();

    if (
      loadedDevelopers.length === 0 &&
      !feedSearch?.value.trim() &&
      !skillFilter?.value
    ) {
      setFeedMessage("No developers are available to discover right now.");
    } else {
      setFeedMessage("");
    }

    if (loadMoreButton) {
      loadMoreButton.hidden = !hasMore;
    }
  } catch (error) {
    console.error("Error fetching developers:", error);
    if (append) currentPage = Math.max(1, currentPage - 1);
    setFeedMessage(
      error.message || "Unable to load developers. Please try again.",
      true,
    );
    if (loadMoreButton && append) {
      loadMoreButton.hidden = false;
    }
  } finally {
    isLoading = false;
    if (loadMoreButton) {
      loadMoreButton.disabled = false;
      loadMoreButton.innerHTML =
        'Load more developers <span aria-hidden="true">↓</span>';
    }
  }
}

if (feedSearch) {
  feedSearch.addEventListener("input", renderDevelopers);
}

if (skillFilter) {
  skillFilter.addEventListener("change", renderDevelopers);
}

if (clearFiltersButton) {
  clearFiltersButton.addEventListener("click", () => {
    if (feedSearch) feedSearch.value = "";
    if (skillFilter) skillFilter.value = "";
    renderDevelopers();
    feedSearch?.focus();
  });
}

if (loadMoreButton) {
  loadMoreButton.addEventListener("click", () => {
    if (isLoading || !hasMore) return;
    currentPage += 1;
    fetchDevelopers({ append: true });
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    logoutButton.textContent = "Logging out...";
    try {
      const response = await fetch("/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed. Please try again.");
      window.location.href = "/login.html";
    } catch (error) {
      setFeedMessage(
        error.message || "Unable to log out. Please try again.",
        true,
      );
      logoutButton.disabled = false;
      logoutButton.innerHTML = 'Log out <span aria-hidden="true">↗</span>';
    }
  });
}

fetchDevelopers();
