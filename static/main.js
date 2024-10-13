document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();
    
    let query = document.getElementById('query').value;
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'query': query
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        displayResults(data);
        displayChart(data);
    });
});

function displayResults(data) {
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Results</h2>';
    for (let i = 0; i < data.documents.length; i++) {
        let docDiv = document.createElement('div');
        docDiv.innerHTML = `<strong>Document ${data.indices[i]}</strong><p>${data.documents[i]}</p><br><strong>Similarity: ${data.similarities[i]}</strong>`;
        resultsDiv.appendChild(docDiv);
    }
}

function displayChart(data) {
    // Get the context of the canvas element where the chart will be rendered
    let ctx = document.getElementById('similarity-chart').getContext('2d');

    // Clear any previous chart to avoid overlaps
    if (window.similarityChart) {
        window.similarityChart.destroy();  // Destroy the previous chart instance if it exists
    }

    // Create a new bar chart
    window.similarityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.indices.map(i => `Doc ${i}`),  // Use document indices as labels
            datasets: [{
                label: 'Cosine Similarity',
                data: data.similarities,  // Similarity scores as bar heights
                backgroundColor: 'rgba(0, 123, 255, 0.5)',  // Light blue bars
                borderColor: 'rgba(0, 123, 255, 1)',  // Darker blue border
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,  // Start the y-axis at 0
                    max: 1  // Cosine similarity maxes out at 1
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `Cosine Similarity: ${tooltipItem.raw.toFixed(3)}`;
                        }
                    }
                }
            }
        }
    });
}
