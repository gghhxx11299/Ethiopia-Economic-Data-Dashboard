document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Initialize with default values
    const initialIndicator = document.getElementById('indicator').value;
    const initialYears = document.getElementById('years').value;
    const initialCompare = document.getElementById('compare').value;
    
    // Fetch and display initial data
    fetchData('ETH', initialIndicator, initialYears);
    
    if (initialCompare !== 'none') {
        fetchComparisonData(initialCompare, initialIndicator, initialYears);
    }
    
    // Add event listeners for controls
    document.getElementById('indicator').addEventListener('change', updateChart);
    document.getElementById('years').addEventListener('change', updateChart);
    document.getElementById('compare').addEventListener('change', updateChart);
});

function updateChart() {
    const indicator = document.getElementById('indicator').value;
    const years = document.getElementById('years').value;
    const compareCountry = document.getElementById('compare').value;
    
    // Fetch main data
    fetchData('ETH', indicator, years);
    
    // Fetch comparison data if selected
    if (compareCountry !== 'none') {
        fetchComparisonData(compareCountry, indicator, years);
    } else {
        // Clear comparison data if none selected
        window.comparisonData = null;
        updateChartDisplay();
    }
}

function fetchData(countryCode, indicator, years) {
    const currentYear = new Date().getFullYear();
    const startYear = years === 'all' ? 1960 : currentYear - parseInt(years);
    
    const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json&date=${startYear}:${currentYear}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data[1]) {
                processData(data[1], countryCode);
            } else {
                console.error('No data received from World Bank API');
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function fetchComparisonData(countryCode, indicator, years) {
    const currentYear = new Date().getFullYear();
    const startYear = years === 'all' ? 1960 : currentYear - parseInt(years);
    
    const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json&date=${startYear}:${currentYear}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data[1]) {
                window.comparisonData = processComparisonData(data[1], countryCode);
                updateChartDisplay();
            } else {
                console.error('No comparison data received from World Bank API');
            }
        })
        .catch(error => {
            console.error('Error fetching comparison data:', error);
        });
}

function processData(data, countryCode) {
    // Filter out null values and sort by year
    const filteredData = data.filter(item => item.value !== null)
                            .sort((a, b) => a.date - b.date);
    
    // Store the processed data
    window.mainData = {
        country: getCountryName(countryCode),
        indicator: data[0].indicator.value,
        years: filteredData.map(item => item.date),
        values: filteredData.map(item => item.value)
    };
    
    updateChartDisplay();
    updateDataTable(filteredData);
}

function processComparisonData(data, countryCode) {
    // Filter out null values and sort by year
    const filteredData = data.filter(item => item.value !== null)
                            .sort((a, b) => a.date - b.date);
    
    return {
        country: getCountryName(countryCode),
        indicator: data[0].indicator.value,
        years: filteredData.map(item => item.date),
        values: filteredData.map(item => item.value)
    };
}

function getCountryName(countryCode) {
    const countryNames = {
        'ETH': 'Ethiopia',
        'KEN': 'Kenya',
        'SDN': 'Sudan',
        'SSD': 'South Sudan',
        'DJI': 'Djibouti'
    };
    
    return countryNames[countryCode] || countryCode;
}

function updateDataTable(data) {
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        
        const yearCell = document.createElement('td');
        yearCell.textContent = item.date;
        row.appendChild(yearCell);
        
        const valueCell = document.createElement('td');
        valueCell.textContent = item.value !== null ? item.value.toLocaleString() : 'N/A';
        row.appendChild(valueCell);
        
        tableBody.appendChild(row);
    });
}
