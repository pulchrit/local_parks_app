'use strict';

function displayResults(responseJSON) {

    $(".js-results").empty();

    $(".js-results").append(
        `<h2>Results for ${responseJSON[0].owner.login}</h2> 
        <ul class="js-repos-list">
        </ul>`
    );

    // Loop over object repos and add info to DOM
    for (let i = 0; i < responseJSON.length; i++) {
        $(".js-repos-list").append(
            `<li><h3><a href="${responseJSON[i].html_url}">${responseJSON[i].name}</a></h3>
            <p>${responseJSON[i].description}</p>
            </li>`
        );
    };
    
    $(".js-results").removeClass('hidden');

}

// Using default parameters: type:owner, sort:full_name, order:asc, so 
// the url is pretty simple to create. I'm bulding this separate function 
// for future expansion using non-default parameters (which would necessitate
// an equivalent expansion of the html form for these parameters).
function createURLToCall(gitHubHandle) {
    return `https://api.github.com/users/${gitHubHandle}/repos`
}

// example call https://developer.nps.gov/api/v1/parks?parkCode=acad&api_key=5t3cocswGOgYnCwzgOmQw1pnvzlrhxXleFLg8Clk

function getRepositories(gitHubHandle) {
    
    // Get API key from config file
    const npsApikey = config.nationalParkServiceApiKey;

    const url = createURLToCall(gitHubHandle);

    // Using unauthenticated call, limit of 60 requests per hour
    const options = {
        headers: new Headers({
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "pulchrit",
            "Origin": "https://pulchrit.github.io/list_user_repos_app/",
        })
    };

    fetch(url, options)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON => displayResults(responseJSON))
        .catch(error => {
            $(".js-results").html(
                `<p>Hmmm...Something isn't right. Here's the error message:</p>
                <p>${error}</p>`);
            $(".js-results").removeClass("hidden");
        });
}

function onHandleEntered() {
    $(".js-form-submit").submit(event => {
        event.preventDefault();
        const gitHubHandle = $("#gitHubHandle").val();
        getRepositories(gitHubHandle);
        $("#gitHubHandle").val("");
    });
}

// When document is ready, call function to listen for form submission
$(onHandleEntered);