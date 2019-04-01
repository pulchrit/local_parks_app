'use strict';

// Get API key from config file. This only works when I serve the app from 
// my localhost; it won't workon GitHubPages. Method suggested by: 
// https://gist.github.com/derzorngottes/3b57edc1f996dddcab25 to hide
// API key on github. Not sure of the proper/better way to do this? 
// const npsApikey = config.nationalParkServiceApiKey; 

// Hard coding the apiKey.
const npsApikey = '5t3cocswGOgYnCwzgOmQw1pnvzlrhxXleFLg8Clk';

function displayResults(responseJSON, states) {

    $(".js-results").empty();

    $(".js-results").append(
        `<h2>Results for ${states}</h2> 
        <ul class="js-parks-list">
        </ul>`
    );

    // Loop over park results and add info to DOM.
    for (let i = 0; i < responseJSON.data.length; i++) {
        $(".js-parks-list").append(
            `<li>
                <h3>${responseJSON.data[i].fullName}</h3>
                <p>${responseJSON.data[i].description}</p>
                <p><a href="${responseJSON.data[i].url}">${responseJSON.data[i].url}</a></p>`
        );
        
        // Loop over addresses, find physical address and add only it to DOM.
        for (let j=0; j < responseJSON.data[i].addresses.length; j++) {
            if (responseJSON.data[i].addresses[j].type === 'Physical') {
                $(".js-parks-list").append(
                    `<address>
                        <p class="address-styling">${responseJSON.data[i].addresses[j].line1}</p>
                        <p class="address-styling">${responseJSON.data[i].addresses[j].city}, ${responseJSON.data[i].addresses[j].stateCode}, ${responseJSON.data[i].addresses[j].postalCode}</p>
                    </address>
                </li>`
                );
            }
        };
    };
    
    $(".js-results").removeClass('hidden');

}

function formatQueryParams(params) {

    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    
        return queryItems.join("&");
}

function getParksNearby(states, maxResults) {
    
    const baseUrl = "https://developer.nps.gov/api/v1/parks?";

    const params = {
        stateCode: states,
        limit: maxResults - 1,
        fields: "addresses",
        api_key: npsApikey,
    };

    const url = `${baseUrl}${formatQueryParams(params)}`;

    const options = {
        headers: new Headers({
        'accept': 'application/json'
        })
    };

    fetch(url, options)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJSON => displayResults(responseJSON, states))
    .catch(error => {
        $(".js-results").html(
            `<p>Hmmm...Something isn't right. Here's the error message:</p>
            <p>${error}</p>`);
        $(".js-results").removeClass("hidden");
    })    
}

function onInfoEntered() {
    
    $(".js-form-submit").submit(event => {
        event.preventDefault();
        
        const states = $("#states").val();
        const maxResults = $("#max-results").val();
        
        getParksNearby(states, maxResults);
        
        $("#states").val("");
        $("#max-results").val("10");
    });
}

// For multiple states, only a comma delimited list with no spaces is acceptable.
// When spaces are included, only the first state's info. will be returned. Hence,
// I'm adding this bit of form validation with a custom error message. 
// Simple validation from: 
// https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation#Customized_error_messages
function validateForm() {
    
    const states = document.getElementById("states");

    // Triggers when any user input is entered.
    states.addEventListener("input", event => {
      
        // if the input does not match the pattern defined with the pattern attribute on the input
        // element of the form, a custom error message is alerted.
        if (states.validity.patternMismatch) {
            states.setCustomValidity("No spaces please. Enter only two letter state abbreviations separated by commas.");
        
        // If input matches pattern, setCustomValidity to empty string, which effectively
        // clears any error message. 
        } else {
            states.setCustomValidity("");
        }
    });
}

function runApp() {
    validateForm();
    onInfoEntered();
}

// When document is ready, call the runApp function to validate the form and listen for form submission.
$(runApp);