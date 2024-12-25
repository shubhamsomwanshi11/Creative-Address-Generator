let addressData;
let explore = document.getElementById('explore');
let name, houseNo, streetName, neighborhood, zipCode, state;
const selectState = document.getElementById('selectState');
selectState.addEventListener('input', () => generateAddresses());
function addListners() {
    name = document.getElementById("name");
    houseNo = document.getElementById("houseNo");
    streetName = document.getElementById("streetName");
    neighborhood = document.getElementById("neighborhood");
    zipCode = document.getElementById("zipCode");
    state = document.getElementById("state");
    name.addEventListener("change", () => generateAddresses());
    houseNo.addEventListener("change", () => generateAddresses());
    streetName.addEventListener("change", () => generateAddresses());
    neighborhood.addEventListener("change", () => generateAddresses());
    zipCode.addEventListener("change", () => generateAddresses());
    state.addEventListener("change", () => generateAddresses());
}

addListners();

async function loadAddressData() {
    try {
        // Fetch the data from the specified file
        const response = await fetch('./data/simpson.json');

        // Check if the response is successful
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Parse the JSON data
        addressData = await response.json();
        assignData();
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

const inputRN = document.getElementById("inputRN");
function generateAddresses(count = inputRN.value, div = "addressContainer") {
    if (!addressData) {
        console.error('Address data is not loaded yet.');
        return;
    }

    if (count == 'all') {
        count = 150;
    }
    else if (count == 'random') {
        count = Math.round(Math.random() * 100) + 1;
    }

    // Get user-selected fields (checkboxes)
    const includeName = name.checked;
    const includeHouseNumber = houseNo.checked;
    const includeStreet = streetName.checked;
    const includeNeighborhood = neighborhood.checked;
    const includeZipCode = zipCode.checked;
    const includeState = state.checked;
    // Clear previous addresses
    const addressContainer = document.getElementById(div);
    addressContainer.innerHTML = '';

    let addresses = [];
    // Generate random addresses
    for (let i = 0; i < count; i++) {
        let address = {};

        if (includeName) {
            address.name = `${getRandomElement(addressData.firstNames)} ${getRandomElement(addressData.lastNames)}`;
        }

        if (includeHouseNumber) {
            address.houseNumber = getRandomElement(addressData.houseNumbers);
        }

        if (includeStreet) {
            address.streetName = getRandomElement(addressData.streetNames);
        }

        if (includeNeighborhood) {
            address.neighborhood = getRandomElement(addressData.neighborhoods);
        }

        if (includeZipCode) {
            address.zipCode = getRandomElement(addressData.zipCodes);
        }

        if (includeState) {
            address.state = selectState.value == 'all' ? getRandomElement(addressData.states) : selectState.value;
        }

        addresses.push(address);
    }

    renderAddresses(addresses, div);


    if (div != 'customDiv') {
        inputRN.value = count;
        document.getElementById('generatedCount').innerHTML = count;
    }
}

function renderAddresses(addresses, container) {
    let generatedHTML = '';

    addresses.forEach((address, index) => {
        generatedHTML += `<div class="column is-3">
            <div class="card cust-card mt-3" id="customDiv" style="background-color: #373952;">
                <div
                    class="card-content has-text-centered has-text-light has-text-weight-semibold is-size-5">
                    <div class="has-text-right">
                        <button class="button copy is-ghost copyButton" onclick="copyAddress(${index})">
                            <svg class="svgicon">
                                <use href="#iconButton"></use>
                            </svg>
                        </button>
                    </div>

                    <div id="address-${index}">
                    ${address.name ? `<p class="has-text-weight-semibold">${address.name}</p>` : ''}
                    <p>
                        ${address.houseNumber ? `${address.houseNumber} ` : ''}
                        ${address.streetName ? `${address.streetName}` : ''}
                    </p>
                    <p>
                        ${address.neighborhood ? `${address.neighborhood}, ` : ''}
                        ${address.state ? `${address.state} ` : ''}
                        ${address.zipCode ? `${address.zipCode}` : ''}
                    </p>
                </div>
                </div>
            </div>
        </div>`

        document.getElementById(container).innerHTML = generatedHTML;
    })
}



function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}


const assignData = () => {
    const generatorName = document.getElementById('generatorName');
    const description = document.getElementById('description');

    generatorName.innerHTML = addressData.generator;
    description.innerHTML = addressData.description;
}

loadAddressData();


// When clicked on Explore button
explore.addEventListener("click", () => {
    let mainBox = document.getElementById('mainBox');
    mainBox.querySelector('#template').parentElement.removeChild(mainBox.querySelector('#template'));
    document.getElementById('secondDiv').classList.remove('is-hidden');
    addListners();

    const selectState = document.getElementById('selectState');

    addressData.states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.innerHTML = state;
        selectState.appendChild(option);
    })
})

function copyAddress(index) {
    const addressText = document.getElementById(`address-${index}`).innerText;
    const message = document.getElementById('message');

    navigator.clipboard.writeText(addressText)
        .then(() => {
            message.classList.remove('is-hidden');
            setTimeout(() => {
                message.classList.add('is-hidden');
            }, 1000);
        })
        .catch(error => console.error("Failed to copy address:", error));
}



// Function to download all generated addresses as a text file
function downloadAddresses() {
    const filetype = document.getElementById('filetype').value;
    const addressElements = document.querySelectorAll('#addressContainer p');
    const addresses = Array.from(addressElements).map(el => el.innerText);
    let fileContent = '';
    let mimeType = 'text/plain';
    let fileExtension = 'txt';

    // Generate file content based on the selected file type
    switch (filetype.toUpperCase()) {
        case 'JSON':
            fileContent = JSON.stringify(addresses, null, 2);
            mimeType = 'application/json';
            fileExtension = 'json';
            break;
        case 'XML':
            fileContent = '<addresses>\n' +
                addresses.map(addr => `  <address>${addr}</address>`).join('\n') +
                '\n</addresses>';
            mimeType = 'application/xml';
            fileExtension = 'xml';
            break;
        case 'CSV':
            fileContent = addresses.join(',\n');
            mimeType = 'text/csv';
            fileExtension = 'csv';
            break;
        case 'TEXT':
        default:
            fileContent = addresses.join('\n');
            mimeType = 'text/plain';
            fileExtension = 'txt';
            break;
    }

    // Create a Blob and download link
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `generated_addresses.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}