let economicChart = null;

function updateChartDisplay() {
    const ctx = document.getElementById('economicChart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (economicChart) {
        economicChart.destroy();
    }
    
    // Prepare datasets
    const datasets = [];
    
    if (window.mainData) {
        datasets.push({
            label: window.mainData.country,
            data: window.mainData.values,
            borderColor: '#046a38',
            backgroundColor: 'rgba(4, 106, 56, 0.1)',
            borderWidth: 2,
            fill: true
        });
    }
    
    if (window.comparisonData) {
        datasets.push({
            label: window.comparisonData.country,
            data: window.comparisonData.values,
            borderColor: '#da291c',
            backgroundColor: 'rgba(218, 41, 28, 0.1)',
            borderWidth: 2,
            fill: true
        });
    }
    
    // Create new chart
    economicChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: window.mainData ? window.mainData.years : [],
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: window.mainData ? window.mainData.indicator : 'Economic Indicator',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        }
    });
}
