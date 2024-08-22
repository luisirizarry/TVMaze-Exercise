"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const nullImg = "https://tinyurl.com/missing-tv";
const $episodesList = $("#episodesList");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const res = await axios.get(`https://api.tvmaze.com/search/shows?q=${term}`);

  const showList = [];
  
  for(let item of res.data){
    const { id, name, summary } = item.show;
    const original = item.show.image?.original || nullImg; 
    showList.push({ id, name, summary, original });
  }
  
  return showList;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.original}
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);

  const episodeList = [];
  
  for(let item of res.data){
    const { name, season, number } = item;
    episodeList.push({ id, name, season, number });
  }

  return episodeList;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  // Empty the episodes list
  $episodesList.empty();
  // Iterate through the episodes
  for(let episode of episodes){
    // Create an li for the episode
    const episodeLI = document.createElement("LI");
    // Fill the inner HTML with the episodes info
    episodeLI.innerHTML = `<li>${episode.name} (${episode.season}, ${episode.number})</li>`;
    // Append episode to the list
    $episodesList.append(episodeLI);
  }
  // Show the episodes area
  $episodesArea.show();
}

async function showEpisodes(e) {
  const showId = $(e.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", showEpisodes);